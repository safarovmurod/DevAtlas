import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CourseWorkspace } from '@/components/courses/course-workspace';
import { DayExam } from '@/components/courses/day-exam';
import { switchLearningAccount, useLearningStore } from '@/stores/learning-store';
import { emptyCourseProgress, emptyProgress } from '@/lib/account/progress';
import { courseContentSchema } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { courseMonthPlan } from '@/lib/courses/plan';
import html from '@/content/courses/html.json';

vi.mock('@/components/courses/use-practice-access', () => ({ usePracticeAccess: () => 'locked' }));
vi.mock('@/components/account/account-provider', () => ({
  useAccount: () => ({ configured: true, loading: false, user: null }),
}));

const content = courseContentSchema.parse(html);
const lesson = content.lessons.find((item) => item.day === 1)!;
const originalScope = useLearningStore.persist.getOptions().name!;

beforeEach(() => {
  localStorage.clear();
  useLearningStore.persist.setOptions({ name: originalScope });
  useLearningStore.setState({
    ...emptyProgress(),
    ready: true,
    language: 'ru',
    contentLanguage: 'ru',
    selectedCourse: 'html',
    courseChosen: true,
    courses: { html: { ...emptyCourseProgress(), completedTopics: [lesson.id] } },
  });
  // Daily submissions are local learning checks, not server attestations.
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(Response.json({ error: 'unavailable' }, { status: 503 })),
  );
});

afterEach(() => {
  cleanup();
  useLearningStore.persist.setOptions({ name: originalScope });
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function startDay() {
  render(<CourseWorkspace courseId="html" section="answers" initialContent={content} day={1} />);
  fireEvent.click(screen.getByRole('button', { name: 'Начать' }));
}

it('submits locally, keeps blanks incorrect and continues without requiring optional practice', () => {
  startDay();
  fireEvent.click(screen.getByRole('button', { name: 'Отправить ответы' }));
  const progress = useLearningStore.getState().courses.html!;
  const result = progress.daySubmissions[lesson.id];
  expect(progress.completedPractice).toEqual([]);
  expect(progress.confirmedDays).toEqual(['1']);
  expect(result.score).toBe(0);
  expect(result.answers).toHaveLength(lesson.questions.length);
  expect(result.answers.every((answer) => answer.answer === '' && !answer.correct)).toBe(true);
  expect(progress.masteredQuestions).toEqual([]);
  expect(screen.getAllByText('Без ответа')).toHaveLength(lesson.questions.length);
  expect(screen.getByRole('link', { name: COPY.ru.next })).toHaveAttribute(
    'href',
    '/courses/html/home?day=2',
  );
  expect(fetch).not.toHaveBeenCalled();
});

it('restores the original submitted result after reload and offers no second submission', async () => {
  startDay();
  const first = lesson.questions[0];
  fireEvent.click(
    within(screen.getByRole('group', { name: first.question.ru })).getAllByRole('radio')[
      first.correctIndex
    ],
  );
  fireEvent.click(screen.getByRole('button', { name: 'Отправить ответы' }));
  const original = useLearningStore.getState().courses.html!.daySubmissions[lesson.id];
  expect(original.answers[0]).toMatchObject({
    id: first.id,
    correct: true,
    answer: String(first.correctIndex),
  });
  expect(original.score).toBe(Math.round(100 / lesson.questions.length));
  const saved = localStorage.getItem(originalScope)!;
  cleanup();
  useLearningStore.setState({ ...emptyProgress(), ready: true });
  localStorage.setItem(originalScope, saved);
  await act(async () => {
    await useLearningStore.persist.rehydrate();
  });
  render(<CourseWorkspace courseId="html" section="answers" initialContent={content} day={1} />);
  expect(screen.getByRole('region', { name: 'Разбор результата' })).toHaveTextContent(
    `${original.score}%`,
  );
  expect(screen.queryByRole('button', { name: 'Начать' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Отправить ответы' })).not.toBeInTheDocument();
  expect(useLearningStore.getState().courses.html!.daySubmissions[lesson.id]).toEqual(original);
  expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual(['1']);
});

it('blocks a later day until the earliest unfinished day has been submitted', () => {
  render(<CourseWorkspace courseId="html" section="answers" initialContent={content} day={2} />);
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Сначала изучите урок и отправьте тест за день 1.',
  );
  expect(screen.queryByRole('button', { name: 'Начать' })).not.toBeInTheDocument();
  expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual([]);
});

it('does not start the daily check before the lesson is marked studied', () => {
  useLearningStore.setState({ courses: { html: emptyCourseProgress() } });
  render(<CourseWorkspace courseId="html" section="answers" initialContent={content} day={1} />);
  expect(screen.getByRole('button', { name: 'Начать' })).toBeDisabled();
  expect(
    screen.getByText('Сначала изучите урок и отметьте его как пройденный.'),
  ).toBeInTheDocument();
  expect(useLearningStore.getState().courses.html!.daySubmissions).toEqual({});
});

it('invalidates an open attempt on account switch before it can write or submit', () => {
  startDay();
  const first = lesson.questions[0];
  fireEvent.click(
    within(screen.getByRole('group', { name: first.question.ru })).getAllByRole('radio')[
      first.correctIndex
    ],
  );
  const oldRadio = screen.getAllByRole('radio')[0];
  const oldForm = screen.getByRole('button', { name: 'Отправить ответы' }).closest('form')!;
  const originalDraft = useLearningStore.getState().courses.html!.drafts[`exam:${lesson.id}`];
  act(() => {
    switchLearningAccount('study-continuation-account-b', 'ru');
    useLearningStore.getState().completeCourseLesson('html', lesson.id);
  });
  fireEvent.click(oldRadio);
  fireEvent.submit(oldForm);
  expect(useLearningStore.getState().courses.html!.drafts[`exam:${lesson.id}`]).toBeUndefined();
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Отправить ответы' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Начать' })).toBeEnabled();
  expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual([]);
  expect(useLearningStore.getState().courses.html!.daySubmissions).toEqual({});
  expect(useLearningStore.getState().courses.html!.masteredQuestions).toEqual([]);
  expect(fetch).not.toHaveBeenCalled();
  expect(
    JSON.parse(localStorage.getItem(originalScope)!).state.courses.html.drafts[`exam:${lesson.id}`],
  ).toBe(originalDraft);
  fireEvent.click(screen.getByRole('button', { name: 'Начать' }));
  expect(screen.getAllByRole('radio').every((input) => !(input as HTMLInputElement).checked)).toBe(
    true,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Отправить ответы' }));
  expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual(['1']);
  expect(useLearningStore.getState().courses.html!.daySubmissions[lesson.id].score).toBe(0);
});

it('invalidates checkpoint text, timer and body lock when its account changes', () => {
  vi.useFakeTimers();
  const checkpoint = content.lessons.find((item) => item.day === 6)!;
  const plan = courseMonthPlan(content.lessons);
  useLearningStore.setState({
    courses: {
      html: {
        ...emptyCourseProgress(),
        completedTopics: [checkpoint.id],
        confirmedDays: ['1', '2', '3', '4', '5'],
      },
    },
  });
  render(<DayExam courseId="html" item={plan.find((item) => item.day === 6)!} plan={plan} />);
  fireEvent.click(screen.getByRole('button', { name: 'Начать' }));
  const oldText = screen.getByRole('textbox');
  fireEvent.change(oldText, { target: { value: 'Account A draft' } });
  expect(document.body.style.overflow).toBe('hidden');
  const priorDraft = useLearningStore.getState().courses.html!.drafts[`exam:${checkpoint.id}`];
  act(() => {
    switchLearningAccount('study-continuation-checkpoint-b', 'ru');
    useLearningStore.setState({
      courses: {
        html: {
          ...emptyCourseProgress(),
          completedTopics: [checkpoint.id],
          confirmedDays: ['1', '2', '3', '4', '5'],
        },
      },
    });
  });
  fireEvent.change(oldText, { target: { value: 'Stale input' } });
  act(() => {
    vi.advanceTimersByTime(20 * 60_000);
  });
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(document.body.style.overflow).not.toBe('hidden');
  expect(useLearningStore.getState().courses.html!.drafts[`exam:${checkpoint.id}`]).toBeUndefined();
  expect(useLearningStore.getState().courses.html!.daySubmissions).toEqual({});
  expect(
    JSON.parse(localStorage.getItem(originalScope)!).state.courses.html.drafts[
      `exam:${checkpoint.id}`
    ],
  ).toBe(priorDraft);
});

it('preserves a checkpoint draft and deadline through same-account rehydration and reload', async () => {
  vi.useFakeTimers();
  const checkpoint = content.lessons.find((item) => item.day === 6)!;
  const plan = courseMonthPlan(content.lessons);
  const item = plan.find((item) => item.day === 6)!;
  useLearningStore.setState({
    courses: {
      html: {
        ...emptyCourseProgress(),
        completedTopics: [checkpoint.id],
        confirmedDays: ['1', '2', '3', '4', '5'],
      },
    },
  });
  const view = render(<DayExam courseId="html" item={item} plan={plan} />);
  fireEvent.click(screen.getByRole('button', { name: 'Начать' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Same-account saved explanation' },
  });
  const draft = JSON.parse(
    useLearningStore.getState().courses.html!.drafts[`exam:${checkpoint.id}`],
  );
  await act(async () => {
    await useLearningStore.persist.rehydrate();
  });
  expect(screen.getByRole('textbox')).toHaveValue(draft.written);
  view.unmount();
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
  render(<DayExam courseId="html" item={item} plan={plan} />);
  fireEvent.click(screen.getByRole('button', { name: 'Начать' }));
  expect(screen.getByRole('textbox')).toHaveValue(draft.written);
  expect(
    JSON.parse(useLearningStore.getState().courses.html!.drafts[`exam:${checkpoint.id}`]).deadline,
  ).toBe(draft.deadline);
  act(() => {
    vi.advanceTimersByTime(draft.deadline - Date.now() + 250);
  });
  expect(
    useLearningStore.getState().courses.html!.daySubmissions[checkpoint.id].answers.at(-1)?.answer,
  ).toBe(draft.written);
  expect(screen.getByRole('region', { name: 'Разбор результата' })).toBeInTheDocument();
});
