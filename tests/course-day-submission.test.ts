import { beforeEach, expect, it } from 'vitest';
import { emptyProgress, mergeProgress, progressSnapshot } from '@/lib/account/progress';
import { courseMonthPlan } from '@/lib/courses/plan';
import type { CourseLesson } from '@/lib/courses/schema';
import { blockingCourseDay, isInterviewDay } from '@/lib/courses/strict-attempt';
import { reviewPlan } from '@/lib/progress/review-plan';
import { reactAssessmentPlan } from '@/lib/courses/react-assessment-day';
import { dateKey } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning-store';

const text = (ru: string) => ({ ru, tg: ru, en: ru });
function lesson(day: number): CourseLesson {
  return {
    id: 'lesson-' + day,
    title: text('Lesson'),
    summary: text('Summary'),
    level: 'beginner',
    sourceIds: ['source'],
    day,
    sections: [],
    questions: [
      {
        id: 'first-' + day,
        question: text('Question'),
        options: [text('A'), text('B')],
        correctIndex: 1,
        answer: text('B'),
      },
      {
        id: 'second-' + day,
        question: text('Question'),
        options: [text('C'), text('D')],
        correctIndex: 1,
        answer: text('D'),
      },
    ],
    interview: {
      id: 'written-' + day,
      question: text('Explain your result'),
      answer: text('Reference text'),
    },
  };
}
const lessons = Array.from({ length: 7 }, (_, index) => lesson(index + 1));
const plan = courseMonthPlan(lessons);

beforeEach(() => useLearningStore.setState({ ...emptyProgress(), ready: true }));

it('requires the first incomplete day and records each submitted answer once, including blanks', () => {
  const state = useLearningStore.getState();
  state.completeCourseLesson('html', 'lesson-1');
  state.completeCourseLesson('html', 'lesson-3');
  expect(blockingCourseDay(plan, 3, [])?.day).toBe(1);
  expect(state.submitCourseDay('html', 3, plan, {}, '')).toBeNull();
  const first = state.submitCourseDay('html', 1, plan, { 'first-1': 1 }, '');
  expect(first?.score).toBe(50);
  expect(first?.answers[1]).toMatchObject({ answer: '', correct: false });
  expect(state.submitCourseDay('html', 1, plan, { 'first-1': 1, 'second-1': 1 }, '')).toEqual(
    first,
  );

  const progress = useLearningStore.getState().courses.html!;
  expect(progress.confirmedDays).toEqual(['1']);
  expect(blockingCourseDay(plan, 3, progress.confirmedDays)?.day).toBe(2);
  expect(
    reviewPlan(
      [
        {
          id: 'lesson-1',
          title: 'Lesson',
          questionIds: ['first-1', 'second-1'],
          lessonHref: '/',
          quizHref: '/',
        },
      ],
      progress,
      dateKey(),
    )[0].weak,
  ).toEqual(['second-1']);
  const restored = mergeProgress(
    progressSnapshot({}),
    progressSnapshot(useLearningStore.getState()),
  );
  expect(restored.courses.html?.daySubmissions['lesson-1']).toEqual(first);
  expect(Object.keys(restored.courses.html?.answers ?? {})).toHaveLength(2);
});

it('includes the written interview every sixth day and keeps its unanswered result', () => {
  const state = useLearningStore.getState();
  useLearningStore.setState({
    courses: {
      html: progressSnapshot({ courses: { html: { confirmedDays: ['1', '2', '3', '4', '5'] } } })
        .courses.html!,
    },
  });
  state.completeCourseLesson('html', 'lesson-6');
  const result = state.submitCourseDay('html', 6, plan, { 'first-6': 1, 'second-6': 1 }, '');
  expect(isInterviewDay(12)).toBe(true);
  expect(isInterviewDay(7)).toBe(false);
  expect(result?.answers.at(-1)).toEqual({
    id: 'written-6',
    mode: 'interview',
    answer: '',
    correct: false,
  });
  expect(result?.score).toBe(67);
});

it('uses a published question without its choices if a checkpoint has no dedicated interview', () => {
  const state = useLearningStore.getState();
  useLearningStore.setState({
    courses: {
      html: progressSnapshot({ courses: { html: { confirmedDays: ['1', '2', '3', '4', '5'] } } })
        .courses.html!,
    },
  });
  state.completeCourseLesson('html', 'lesson-6');
  const fallback = plan.map((entry) =>
    entry.day === 6 ? { ...entry, lesson: { ...entry.lesson, interview: undefined } } : entry,
  );
  const submitted = state.submitCourseDay('html', 6, fallback, { 'first-6': 1 }, 'D');
  expect(submitted?.answers).toEqual([
    { id: 'first-6', mode: 'test', answer: '1', correct: true },
    { id: 'second-6', mode: 'interview', answer: 'D', correct: true },
  ]);
  expect(submitted?.score).toBe(100);
});

it('has at least one authored assessment item for every published React day', () => {
  for (const month of [1, 2]) {
    const { plan } = reactAssessmentPlan(month);
    expect(plan).toHaveLength(30);
    expect(plan.every(({ lesson }) => lesson.questions.length > 0 || lesson.interview)).toBe(true);
  }
});
