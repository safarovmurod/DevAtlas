import type { CourseLesson } from './schema';
import { learningStatus, type LearningEvidence } from '@/lib/practice/learning-evidence';

export interface CoursePlanDay {
  day: number;
  lesson: CourseLesson;
  section: 'answers' | 'practice' | 'tests';
}

// Publish each actual lesson once. Never pad a short curriculum with generated review days.
// Explicitly scheduled curricula may retain unscheduled reference lessons in their library.
export function courseMonthPlan(lessons: CourseLesson[]): CoursePlanDay[] {
  if (!lessons.length) return [];
  const scheduled = lessons
    .filter((lesson) => lesson.day !== undefined)
    .sort((a, b) => a.day! - b.day!);
  if (scheduled.length)
    return scheduled.map((lesson) => ({ day: lesson.day!, lesson, section: 'answers' }));
  return lessons.map((lesson, index) => ({ day: index + 1, lesson, section: 'answers' }));
}

/** Every day is open. "current" is the first day that is not finished yet. */
export type CourseDayStatus = 'done' | 'current' | 'open';
export interface CourseDayItem {
  day: number;
  lesson: CourseLesson;
  section: 'answers' | 'practice' | 'tests';
  status: CourseDayStatus;
}

/** Legacy study readiness permits continuation; it never certifies mastery. */
export function courseDayReady(
  item: CoursePlanDay,
  completedTopics: readonly string[],
  completedPractice: readonly string[],
  /** False while practice is locked by the plan: the day can then be finished without it. */
  practiceRequired = true,
): boolean {
  if (item.section === 'tests') return true;
  return (
    (item.section === 'practice' || completedTopics.includes(item.lesson.id)) &&
    (!practiceRequired || !item.lesson.practice || completedPractice.includes(item.lesson.id))
  );
}

export function courseDayReadiness(
  item: CoursePlanDay,
  completedTopics: readonly string[],
  completedPractice: readonly string[],
  evidence: LearningEvidence | undefined,
  currentVersion: number,
) {
  // Legacy study activity is real activity, but never proof of tested mastery.
  const status = evidence
    ? learningStatus(evidence, currentVersion)
    : completedPractice.includes(item.lesson.id)
      ? 'Practicing'
      : completedTopics.includes(item.lesson.id)
        ? 'Studying'
        : 'Not Started';
  return {
    canContinue: courseDayReady(item, completedTopics, completedPractice),
    status,
    mastered: status === 'Mastered',
  };
}

// All days are open: nothing is locked. A day is "done" when its lesson and practice are
// finished (and, when confirmations are tracked, the learner confirmed it). "current" is the
// first unfinished day, so the learner always knows where to continue.
export function courseDayProgress(
  plan: ReturnType<typeof courseMonthPlan>,
  completedTopics: readonly string[],
  completedPractice: readonly string[],
  confirmedDays?: readonly string[],
): { days: CourseDayItem[]; current: CourseDayItem | null } {
  let current: CourseDayItem | null = null;
  const days = plan.map((item) => {
    const ready = courseDayReady(item, completedTopics, completedPractice);
    const done = ready && (confirmedDays === undefined || confirmedDays.includes(String(item.day)));
    const status: CourseDayStatus = done ? 'done' : current ? 'open' : 'current';
    const entry = { ...item, status };
    if (status === 'current') current = entry;
    return entry;
  });
  return { days, current };
}
