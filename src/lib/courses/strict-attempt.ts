import type { CourseProgress } from '@/lib/account/progress';
import type { CourseLesson } from '@/lib/courses/schema';
import { dateKey } from '@/lib/learning';

export type AttemptQuestion = { id: string; mode: 'test' | 'interview' };

/** Every question of a day's strict attempt: the quiz, then the written interview. */
export function attemptQuestions(lesson: CourseLesson): AttemptQuestion[] {
  return [
    ...lesson.questions.map((question) => ({ id: question.id, mode: 'test' as const })),
    ...(lesson.interview ? [lesson.interview] : lesson.questions).map((question) => ({
      id: question.id,
      mode: 'interview' as const,
    })),
  ];
}

/** Questions not answered correctly today. They go to revision when the attempt ends. */
export function openQuestions(
  lesson: CourseLesson,
  progress: CourseProgress | undefined,
  today = dateKey(),
): AttemptQuestion[] {
  return attemptQuestions(lesson).filter(
    (question) => !progress?.answers[`${today}:${question.mode}:${question.id}`]?.correct,
  );
}

export type AttemptEnd = 'fullscreen' | 'hidden' | 'exit';
