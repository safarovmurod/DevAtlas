import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { StrictAttempt } from '@/components/courses/strict-attempt';
import { emptyProgress } from '@/lib/account/progress';
import { openQuestions } from '@/lib/courses/strict-attempt';
import type { CourseLesson } from '@/lib/courses/schema';
import { dateKey } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning-store';

const text = (value: string) => ({ ru: value, tg: value, en: value });
const lesson: CourseLesson = {
  id: 'html-day-02',
  day: 2,
  title: text('Day 2'),
  summary: text('Summary'),
  level: 'beginner',
  sourceIds: ['html-standard'],
  sections: [{ title: text('Topic'), body: text('Body') }],
  questions: [
    {
      id: 'q-a',
      question: text('A?'),
      answer: text('A'),
      options: [text('1'), text('2')],
      correctIndex: 0,
    },
    {
      id: 'q-b',
      question: text('B?'),
      answer: text('B'),
      options: [text('1'), text('2')],
      correctIndex: 1,
    },
  ],
  interview: { id: 'iv-1', question: text('Explain'), answer: text('Answer') },
};

let fullscreenElement: Element | null = null;
beforeEach(() => {
  localStorage.clear();
  useLearningStore.setState({ ...emptyProgress(), ready: true, language: 'en' });
  fullscreenElement = null;
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => fullscreenElement,
  });
  Object.defineProperty(document, 'exitFullscreen', {
    configurable: true,
    value: vi.fn(async () => {
      fullscreenElement = null;
    }),
  });
  Element.prototype.requestFullscreen = vi.fn(async function (this: Element) {
    fullscreenElement = this;
  });
});
afterEach(() => cleanup());

function renderAttempt() {
  return render(
    <StrictAttempt courseId="html" lesson={lesson} day={2}>
      <p>Questions here</p>
    </StrictAttempt>,
  );
}
async function startAttempt() {
  renderAttempt();
  expect(screen.getByRole('note')).toHaveTextContent(/Leaving full screen/);
  expect(screen.queryByText('Questions here')).not.toBeInTheDocument();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Continue' })));
  expect(Element.prototype.requestFullscreen).toHaveBeenCalled();
  expect(screen.getByText('Questions here')).toBeVisible();
}
const reviews = () => Object.keys(useLearningStore.getState().courses.html?.reviews ?? {}).sort();

it('fails the attempt when the learner leaves full screen and sends every open question to revision', async () => {
  await startAttempt();
  // One quiz question was already answered correctly today: it stays out of revision.
  act(() =>
    useLearningStore
      .getState()
      .recordCourseAnswer('html', { id: 'q-a', topicId: lesson.id }, 'test', true, '0'),
  );
  fullscreenElement = null;
  act(() => {
    document.dispatchEvent(new Event('fullscreenchange'));
  });
  expect(screen.getByRole('alert')).toHaveTextContent('Attempt failed: you left full screen.');
  expect(screen.queryByText('Questions here')).not.toBeInTheDocument();
  expect(reviews()).toEqual(['iv-1', 'q-a', 'q-b']);
  const answers = useLearningStore.getState().courses.html!.answers;
  expect(answers[`${dateKey()}:test:q-b`]).toMatchObject({ correct: false });
  expect(answers[`${dateKey()}:interview:iv-1`]).toMatchObject({ correct: false });
  expect(answers[`${dateKey()}:test:q-a`]).toMatchObject({ correct: true });
});

it('fails the attempt when the tab is hidden', async () => {
  await startAttempt();
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
  expect(screen.getByRole('alert')).toHaveTextContent('you left the tab');
});

it('fails the attempt on Exit after a warning and blocks copy and paste while running', async () => {
  await startAttempt();
  const question = screen.getByText('Questions here');
  expect(fireEvent.copy(question)).toBe(false);
  expect(fireEvent.paste(question)).toBe(false);
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  act(() => fireEvent.click(screen.getByRole('button', { name: 'Exit' })));
  expect(window.confirm).toHaveBeenCalledWith('Exit? The attempt will fail.');
  expect(screen.getByRole('alert')).toHaveTextContent('you pressed “Exit”');
  expect(document.exitFullscreen).toHaveBeenCalled();
});

it('finishing sends unanswered interview questions to revision without a failure message', async () => {
  await startAttempt();
  act(() => {
    const store = useLearningStore.getState();
    store.recordCourseAnswer('html', { id: 'q-a', topicId: lesson.id }, 'test', true, '0');
    store.recordCourseAnswer('html', { id: 'q-b', topicId: lesson.id }, 'test', true, '1');
  });
  act(() => fireEvent.click(screen.getByRole('button', { name: 'Finish' })));
  expect(screen.getByRole('alert')).toHaveTextContent('Attempt finished');
  expect(screen.getByRole('alert')).toHaveTextContent('added to Review');
  expect(openQuestions(lesson, useLearningStore.getState().courses.html)).toEqual([
    { id: 'iv-1', mode: 'interview' },
  ]);
  expect(useLearningStore.getState().courses.html!.reviews['iv-1']).toMatchObject({
    repetitions: 0,
  });
});
