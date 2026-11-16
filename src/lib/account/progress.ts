import { z } from 'zod';
import { COURSE_IDS, type CourseId } from '@/lib/courses/ids';
import { INTERFACE_LOCALES, migrateSavedLocale } from '@/lib/locale';

const id = z.string().min(1).max(200);
const clock = z.record(z.string(), z.number().nonnegative()).default({});
const answer = z.object({
  questionId: id,
  topicId: id,
  mode: z.enum(['learn', 'test', 'interview', 'revision']),
  correct: z.boolean(),
  answer: z.string().max(30000),
  date: z.string().max(30),
});
const review = z.object({
  questionId: id,
  topicId: id,
  due: z.string().max(30),
  repetitions: z.number().int().nonnegative(),
});
// A saved Ukrainian, Japanese or Korean choice moves to a supported language
// (the browser's, otherwise English) instead of making the whole profile unreadable.
const interfaceLanguage = z.preprocess(
  (value) =>
    migrateSavedLocale(value, typeof navigator === 'undefined' ? [] : navigator.languages) ?? value,
  z.enum(INTERFACE_LOCALES),
);
export const studyProgressSchema = z.object({
  dailySets: z.record(z.string(), z.array(id)).default({}),
  studied: z.array(id).default([]),
  answers: z.record(z.string(), answer).default({}),
  reviews: z.record(z.string(), review).default({}),
  awards: z.record(z.string(), z.number().nonnegative()).default({}),
  completedTopics: z.array(id).default([]),
  completedPractice: z.array(id).default([]),
  confirmedDays: z.array(id).default([]),
  drafts: z.record(z.string(), z.string().max(200000)).default({}),
  // Question ids answered correctly in test mode at least once — durable mastery
  // evidence, distinct from the per-day review answers which reset by date.
  masteredQuestions: z.array(id).default([]),
  notes: z
    .array(z.object({ id, title: z.string().max(1000), content: z.string().max(200000) }))
    .default([]),
  draftClock: clock,
  noteClock: clock,
  deletedNotes: clock,
  reviewClock: clock,
  studySeconds: z.record(z.string(), z.number().int().nonnegative()).default({}),
});
export type CourseProgress = z.infer<typeof studyProgressSchema>;
export const emptyCourseProgress = (): CourseProgress => studyProgressSchema.parse({});
export const progressSchema = studyProgressSchema.extend({
  language: interfaceLanguage.default('ru'),
  contentLanguage: z.enum(['tg', 'ru', 'en']).default('tg'),
  dailyLimit: z.union([z.literal(5), z.literal(10), z.literal(15)]).default(10),
  activeMonth: z.number().int().min(1).max(3).default(1),
  theme: z.enum(['light', 'dark']).default('light'),
  selectedCourse: z.enum(COURSE_IDS).default('react'),
  courseChosen: z.boolean().default(false),
  courses: z.partialRecord(z.enum(COURSE_IDS).exclude(['react']), studyProgressSchema).default({}),
  // Courses removed from "My courses". Progress is kept; the newest change wins on sync.
  courseVisibility: z
    .partialRecord(
      z.enum(COURSE_IDS),
      z.object({ hidden: z.boolean(), at: z.number().nonnegative() }),
    )
    .default({}),
  preferenceClock: clock,
});
export type Progress = z.infer<typeof progressSchema>;
export const emptyProgress = (): Progress => progressSchema.parse({});
export function progressSnapshot(value: unknown): Progress {
  return progressSchema.parse(value);
}
export function accountStorageKey(userId: string | null) {
  return userId ? `react-mentor-account-v1:${userId}` : 'react-mentor-learning-v2';
}

/** Monotonic achievements, timestamped edits/deletions; never add XP twice. */
export function mergeProgress(remote: Progress, local: Progress): Progress {
  const merged = { ...remote, ...mergeStudyProgress(remote, local) };
  for (const key of [
    'language',
    'contentLanguage',
    'dailyLimit',
    'activeMonth',
    'theme',
    'selectedCourse',
    'courseChosen',
  ] as const) {
    if ((local.preferenceClock[key] || 0) > (remote.preferenceClock[key] || 0))
      Object.assign(merged, { [key]: local[key] });
  }
  merged.preferenceClock = maxClocks(remote.preferenceClock, local.preferenceClock);
  merged.courseVisibility = { ...remote.courseVisibility };
  for (const [courseId, value] of Object.entries(local.courseVisibility)) {
    const key = courseId as keyof typeof local.courseVisibility;
    if (value && (!merged.courseVisibility[key] || value.at > merged.courseVisibility[key]!.at))
      merged.courseVisibility[key] = value;
  }
  merged.courses = { ...remote.courses };
  for (const [courseId, value] of Object.entries(local.courses)) {
    const key = courseId as keyof typeof local.courses;
    merged.courses[key] = mergeStudyProgress(remote.courses[key] || emptyCourseProgress(), value!);
  }
  return merged;
}
export function mergeStudyProgress(remote: CourseProgress, local: CourseProgress): CourseProgress {
  const merged = { ...remote };
  for (const key of [
    'studied',
    'completedTopics',
    'completedPractice',
    'confirmedDays',
    'masteredQuestions',
  ] as const)
    merged[key] = [...new Set([...remote[key], ...local[key]])];
  merged.answers = { ...local.answers, ...remote.answers };
  merged.dailySets = { ...local.dailySets, ...remote.dailySets };
  for (const key of ['awards', 'studySeconds'] as const) {
    merged[key] = { ...remote[key] };
    for (const [id, value] of Object.entries(local[key]))
      merged[key][id] = Math.max(value, remote[key][id] || 0);
  }
  merged.drafts = { ...remote.drafts };
  for (const [id, code] of Object.entries(local.drafts))
    if (
      !Object.hasOwn(remote.drafts, id) ||
      (local.draftClock[id] || 0) > (remote.draftClock[id] || 0)
    )
      merged.drafts[id] = code;
  merged.draftClock = maxClocks(remote.draftClock, local.draftClock);
  merged.reviews = { ...remote.reviews };
  for (const [id, record] of Object.entries(local.reviews))
    if (!remote.reviews[id] || (local.reviewClock[id] || 0) > (remote.reviewClock[id] || 0))
      merged.reviews[id] = record;
  merged.reviewClock = maxClocks(remote.reviewClock, local.reviewClock);
  merged.noteClock = maxClocks(remote.noteClock, local.noteClock);
  merged.deletedNotes = maxClocks(remote.deletedNotes, local.deletedNotes);
  const notes = new Map(remote.notes.map((note) => [note.id, note]));
  for (const note of local.notes)
    if (!notes.has(note.id) || (local.noteClock[note.id] || 0) > (remote.noteClock[note.id] || 0))
      notes.set(note.id, note);
  merged.notes = [...notes.values()].filter(
    (note) =>
      !Object.hasOwn(merged.deletedNotes, note.id) ||
      merged.noteClock[note.id] > merged.deletedNotes[note.id],
  );
  return merged;
}
function maxClocks(a: Record<string, number>, b: Record<string, number>) {
  const result = { ...a };
  for (const [key, value] of Object.entries(b)) result[key] = Math.max(value, a[key] || 0);
  return result;
}

/** Courses the learner has started: any saved progress, or the chosen course. */
export function startedCourses(
  progress: Pick<
    Progress,
    'courseChosen' | 'selectedCourse' | 'completedTopics' | 'answers' | 'courses'
  >,
): CourseId[] {
  const ids = new Set<CourseId>();
  if (progress.courseChosen) ids.add(progress.selectedCourse);
  if (progress.completedTopics?.length || Object.keys(progress.answers ?? {}).length)
    ids.add('react');
  for (const [courseId, value] of Object.entries(progress.courses ?? {}))
    if (
      value &&
      (value.completedTopics.length ||
        value.completedPractice.length ||
        Object.keys(value.answers).length ||
        Object.keys(value.drafts).length)
    )
      ids.add(courseId as CourseId);
  return [...ids];
}
export const courseHidden = (progress: Pick<Progress, 'courseVisibility'>, id: CourseId) =>
  progress.courseVisibility?.[id]?.hidden === true;
