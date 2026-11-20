import type { CourseProgress } from '@/lib/account/progress';
import type { CourseLesson } from '@/lib/courses/schema';
import { dateKey } from '@/lib/learning';
import { matchesWrittenAnswer } from '@/lib/grading/written-answer';

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

export type DayAnswer = AttemptQuestion & { answer: string; correct: boolean };

export function isInterviewDay(day: number) {
  return day > 0 && day % 6 === 0;
}

export function dayExamInterview(lesson: CourseLesson, day: number): CourseLesson['interview'] {
  if (lesson.interview && (isInterviewDay(day) || !lesson.questions.length))
    return lesson.interview;
  if (!isInterviewDay(day)) return undefined;
  const last = lesson.questions.at(-1);
  if (!last) return undefined;
  const option = last.options[last.correctIndex];
  return {
    id: last.id,
    question: last.question,
    answer: last.answer,
    acceptedAnswers: [option?.ru, option?.tg, option?.en].filter((value): value is string =>
      Boolean(value),
    ),
  };
}

export function dayExamQuiz(lesson: CourseLesson, day: number) {
  return isInterviewDay(day) && !lesson.interview
    ? lesson.questions.slice(0, -1)
    : lesson.questions;
}

export function gradeCourseDay(
  lesson: CourseLesson,
  day: number,
  choices: Record<string, number>,
  written: string,
): DayAnswer[] {
  const answers: DayAnswer[] = dayExamQuiz(lesson, day).map((question) => {
    const choice = choices[question.id];
    const valid = Number.isInteger(choice) && choice >= 0 && choice < question.options.length;
    return {
      id: question.id,
      mode: 'test',
      answer: valid ? String(choice) : '',
      correct: valid && choice === question.correctIndex,
    };
  });
  const interview = dayExamInterview(lesson, day);
  if (interview)
    answers.push({
      id: interview.id,
      mode: 'interview',
      answer: written.trim().slice(0, 1500),
      correct: matchesWrittenAnswer(
        written,
        [
          interview.answer.ru,
          interview.answer.en,
          interview.answer.tg,
          ...(interview.acceptedAnswers ?? []),
        ],
        interview.caseSensitive,
      ),
    });
  return answers;
}

export function blockingCourseDay<T extends { day: number }>(
  days: readonly T[],
  selectedDay: number,
  confirmed: readonly string[],
): T | undefined {
  return days.find((item) => item.day < selectedDay && !confirmed.includes(String(item.day)));
}
