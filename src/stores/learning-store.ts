'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LearningQuestion } from '@/content/course';
import learningIndex from '@/content/learning-index.json';
import { chooseDailyQuestions, dateKey, nextReview, type StudyMode } from '@/lib/learning';
import {
  accountStorageKey,
  emptyProgress,
  emptyCourseProgress,
  progressSnapshot,
  type CourseProgress,
  type Progress,
} from '@/lib/account/progress';
import type { CourseId, ImportedCourseId } from '@/lib/courses/ids';
import { courseDayProgress, courseDayReady, type CoursePlanDay } from '@/lib/courses/plan';
import { contentLocaleFor, persistManualLocale, type InterfaceLocale } from '@/lib/locale';
import { canConfirmReactDay } from './react-day-progress';
import { flushPendingStudyTime } from './study-time';

/** Saved progress could not be read; the provider shows a localized warning. */
export const STORAGE_READ_FAILED = 'read-failed';

export { registerStudyTimeFlush } from './study-time';

interface LearningState extends Progress {
  ready: boolean;
  /** Empty, or STORAGE_READ_FAILED when saved progress could not be read. */
  storageError: string;
  setPreferences: (
    values: Partial<
      Pick<LearningState, 'language' | 'contentLanguage' | 'dailyLimit' | 'activeMonth' | 'theme'>
    >,
  ) => void;
  ensureDailySet: (month: number, today?: string) => string[];
  markStudied: (questionId: string) => void;
  recordAnswer: (
    question: LearningQuestion,
    mode: StudyMode,
    correct: boolean,
    answer: string,
    today?: string,
  ) => void;
  completeTopic: (topicId: string) => void;
  completePractice: (practiceId: string, verified: boolean) => void;
  confirmCourseDay: (courseId: ImportedCourseId, day: number, plan: CoursePlanDay[]) => boolean;
  confirmReactDay: (month: number, day: number) => boolean;
  saveDraft: (id: string, code: string) => void;
  saveNote: (note: { id: string; title: string; content: string }) => void;
  deleteNote: (id: string) => void;
  addStudySeconds: (seconds: number, courseId?: CourseId) => void;
  chooseCourse: (courseId: CourseId) => void;
  completeCourseLesson: (courseId: ImportedCourseId, lessonId: string) => void;
  recordCourseAnswer: (
    courseId: ImportedCourseId,
    question: { id: string; topicId: string },
    mode: StudyMode,
    correct: boolean,
    answer: string,
  ) => void;
  saveCourseNote: (
    courseId: ImportedCourseId,
    note: { id: string; title: string; content: string },
  ) => void;
  deleteCourseNote: (courseId: ImportedCourseId, id: string) => void;
  completeCoursePractice: (
    courseId: ImportedCourseId,
    lessonId: string,
    verified?: boolean,
  ) => void;
  saveCourseDraft: (courseId: ImportedCourseId, id: string, code: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => {
      /** Progress of one course. A course that was never opened starts empty. */
      const courseProgress = (courseId: ImportedCourseId) =>
        get().courses[courseId] || emptyCourseProgress();
      /** Saves changed fields of one course's progress. */
      const updateCourse = (courseId: ImportedCourseId, changes: Partial<CourseProgress>) =>
        set({
          courses: { ...get().courses, [courseId]: { ...courseProgress(courseId), ...changes } },
        });

      return {
        ...emptyProgress(),
        ready: false,
        storageError: '',
        setPreferences(values) {
          if (values.language) persistManualLocale(values.language);
          set({
            ...values,
            preferenceClock: {
              ...get().preferenceClock,
              ...Object.fromEntries(Object.keys(values).map((key) => [key, Date.now()])),
            },
          });
        },
        ensureDailySet(month, today = dateKey()) {
          const key = `${today}-${month}`;
          const current = get();
          if (current.dailySets[key]) return current.dailySets[key];
          const ids = chooseDailyQuestions(
            learningIndex.questions,
            month,
            current.dailyLimit,
            current.studied,
            Object.values(current.reviews),
            today,
          );
          set({ dailySets: { ...current.dailySets, [key]: ids } });
          return ids;
        },
        markStudied(questionId) {
          const current = get();
          if (current.studied.includes(questionId)) return;
          set({
            studied: [...current.studied, questionId],
            awards: { ...current.awards, [`learn:${questionId}`]: 2 },
          });
        },
        recordAnswer(question, mode, correct, answer, today = dateKey()) {
          const current = get();
          const key = `${today}:${mode}:${question.id}`;
          if (current.answers[key]) return;
          const awards = { ...current.awards };
          if (correct) awards[`${mode}:${question.id}`] = mode === 'test' ? 10 : 5;
          set({
            answers: {
              ...current.answers,
              [key]: {
                questionId: question.id,
                topicId: question.topicId,
                mode,
                correct,
                answer,
                date: today,
              },
            },
            awards,
            reviews: {
              ...current.reviews,
              [question.id]: nextReview(
                current.reviews[question.id],
                question.id,
                question.topicId,
                correct,
                today,
              ),
            },
            reviewClock: { ...current.reviewClock, [question.id]: Date.now() },
          });
        },
        completeTopic(topicId) {
          const current = get();
          if (current.completedTopics.includes(topicId)) return;
          set({
            completedTopics: [...current.completedTopics, topicId],
            awards: { ...current.awards, [`lesson:${topicId}`]: 5 },
          });
        },
        completePractice(practiceId, verified) {
          const current = get();
          const points = verified ? 20 : 4;
          if (
            current.completedPractice.includes(practiceId) &&
            (current.awards[`practice:${practiceId}`] || 0) >= points
          )
            return;
          set({
            completedPractice: [...new Set([...current.completedPractice, practiceId])],
            awards: {
              ...current.awards,
              [`practice:${practiceId}`]: Math.max(
                points,
                current.awards[`practice:${practiceId}`] || 0,
              ),
            },
          });
        },
        confirmCourseDay(courseId, day, plan) {
          // Only the current day can be confirmed, and only when its lesson and practice are done.
          const progress = courseProgress(courseId);
          const current = courseDayProgress(
            plan,
            progress.completedTopics,
            progress.completedPractice,
            progress.confirmedDays,
          ).current;
          if (
            !current ||
            current.day !== day ||
            !courseDayReady(current, progress.completedTopics, progress.completedPractice)
          )
            return false;
          updateCourse(courseId, { confirmedDays: [...progress.confirmedDays, String(day)] });
          return true;
        },
        confirmReactDay(month, day) {
          if (!canConfirmReactDay(get(), month, day)) return false;
          set({ confirmedDays: [...get().confirmedDays, `${month}:${day}`] });
          return true;
        },
        saveDraft(id, code) {
          set({
            drafts: { ...get().drafts, [id]: code },
            draftClock: { ...get().draftClock, [id]: Date.now() },
          });
        },
        saveNote(note) {
          set({
            notes: [note, ...get().notes.filter((item) => item.id !== note.id)],
            noteClock: { ...get().noteClock, [note.id]: Date.now() },
          });
        },
        deleteNote(id) {
          set({
            notes: get().notes.filter((item) => item.id !== id),
            deletedNotes: { ...get().deletedNotes, [id]: Date.now() },
          });
        },
        addStudySeconds(seconds, courseId) {
          // Time counts for the whole profile and, except React, for the course itself.
          const today = dateKey();
          const state = get();
          const course = courseId || state.selectedCourse;
          const studySeconds = {
            ...state.studySeconds,
            [today]: (state.studySeconds[today] || 0) + seconds,
          };
          if (course === 'react') {
            set({ studySeconds });
            return;
          }
          const progress = courseProgress(course);
          const courseSeconds = {
            ...progress.studySeconds,
            [today]: (progress.studySeconds[today] || 0) + seconds,
          };
          // One update, so the profile and the course time never disagree.
          set({
            studySeconds,
            courses: { ...state.courses, [course]: { ...progress, studySeconds: courseSeconds } },
          });
        },
        chooseCourse(selectedCourse) {
          if (selectedCourse !== get().selectedCourse) flushPendingStudyTime();
          set({
            selectedCourse,
            courseChosen: true,
            preferenceClock: {
              ...get().preferenceClock,
              selectedCourse: Date.now(),
              courseChosen: Date.now(),
            },
          });
        },
        saveCourseDraft(courseId, id, code) {
          const progress = courseProgress(courseId);
          updateCourse(courseId, {
            drafts: { ...progress.drafts, [id]: code },
            draftClock: { ...progress.draftClock, [id]: Date.now() },
          });
        },
        completeCourseLesson(courseId, lessonId) {
          const progress = courseProgress(courseId);
          if (progress.completedTopics.includes(lessonId)) return;
          updateCourse(courseId, {
            completedTopics: [...progress.completedTopics, lessonId],
            awards: { ...progress.awards, ['lesson:' + lessonId]: 5 },
          });
        },
        recordCourseAnswer(courseId, question, mode, correct, answer) {
          const progress = courseProgress(courseId);
          const today = dateKey();
          const key = `${today}:${mode}:${question.id}`;
          // A wrong answer never blocks a retry; once correct, the attempt is recorded.
          if (progress.answers[key]?.correct) return;
          const masteredNow =
            mode === 'test' && correct && !progress.masteredQuestions.includes(question.id);
          updateCourse(courseId, {
            answers: {
              ...progress.answers,
              [key]: {
                questionId: question.id,
                topicId: question.topicId,
                mode,
                correct,
                answer,
                date: today,
              },
            },
            awards: correct
              ? { ...progress.awards, [`${mode}:${question.id}`]: mode === 'test' ? 10 : 5 }
              : progress.awards,
            masteredQuestions: masteredNow
              ? [...progress.masteredQuestions, question.id]
              : progress.masteredQuestions,
            reviews: {
              ...progress.reviews,
              [question.id]: nextReview(
                progress.reviews[question.id],
                question.id,
                question.topicId,
                correct,
                today,
              ),
            },
            reviewClock: { ...progress.reviewClock, [question.id]: Date.now() },
          });
        },
        saveCourseNote(courseId, note) {
          const progress = courseProgress(courseId);
          updateCourse(courseId, {
            notes: [note, ...progress.notes.filter((item) => item.id !== note.id)],
            noteClock: { ...progress.noteClock, [note.id]: Date.now() },
          });
        },
        deleteCourseNote(courseId, id) {
          const progress = courseProgress(courseId);
          updateCourse(courseId, {
            notes: progress.notes.filter((item) => item.id !== id),
            deletedNotes: { ...progress.deletedNotes, [id]: Date.now() },
          });
        },
        completeCoursePractice(courseId, lessonId, verified = false) {
          // Verified practice is worth 20 XP, self-checked practice 4; an upgrade replaces the lower award.
          const progress = courseProgress(courseId);
          const points = verified ? 20 : 4;
          const awardKey = 'practice:' + lessonId;
          if (
            progress.completedPractice.includes(lessonId) &&
            (progress.awards[awardKey] || 0) >= points
          )
            return;
          updateCourse(courseId, {
            completedPractice: [...new Set([...progress.completedPractice, lessonId])],
            awards: {
              ...progress.awards,
              [awardKey]: Math.max(points, progress.awards[awardKey] || 0),
            },
          });
        },
      };
    },
    {
      name: 'react-mentor-learning-v2',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize(state) {
        return progressSnapshot(state);
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) useLearningStore.setState({ storageError: STORAGE_READ_FAILED });
      },
    },
  ),
);

// Flush the current scope, then read the target cache BEFORE resetting it.
// A reset must never overwrite another
// account's cache; guest data remains under its original key and is not imported.
export function switchLearningAccount(userId: string | null, initialLocale?: InterfaceLocale) {
  flushPendingStudyTime();
  const name = accountStorageKey(userId);
  let progress = emptyProgress();
  let storageError = '';
  let hadSavedProgress = false;
  try {
    const cached = localStorage.getItem(name);
    if (cached) {
      progress = progressSnapshot(JSON.parse(cached).state);
      hadSavedProgress = true;
    }
  } catch {
    storageError = STORAGE_READ_FAILED;
  }
  // Apply geo only to a genuinely new profile. Saved languages always win.
  if (!hadSavedProgress && !storageError) {
    const locale = initialLocale;
    if (locale)
      progress = { ...progress, language: locale, contentLanguage: contentLocaleFor(locale) };
  }
  useLearningStore.persist.setOptions({
    name,
    storage: storageError
      ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      : createJSONStorage(() => localStorage),
  });
  useLearningStore.setState({ ...progress, ready: true, storageError });
}
