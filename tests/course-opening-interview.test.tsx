import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { CourseAnswers } from '@/components/courses/course-answers';
import { StudySession } from '@/components/learning/study-session';
import { INTERVIEW_QUESTIONS } from '@/content/course';
import { emptyProgress } from '@/lib/account/progress';
import { loadCourseContent } from '@/lib/courses/content';
import { COURSE_IDS } from '@/lib/courses/ids';
import { matchesWrittenAnswer } from '@/lib/grading/written-answer';
import { reactMonthDays } from '@/lib/react-plan';
import { tr } from '@/lib/translate';
import { useLearningStore } from '@/stores/learning-store';

it('publishes a translated opening and a checkable interview for the first three days of each course', async () => {
  for (const id of COURSE_IDS) {
    if (id === 'react') continue;
    const { lessons } = await loadCourseContent(id);
    for (const day of [1, 2, 3]) {
      const lesson = lessons.find((item) => item.day === day);
      const name = `${id} day ${day}`;
      expect(lesson?.sections[0].body.en, name).toBeTruthy();
      expect(lesson?.sections[0].body.tg, name).not.toBe(lesson?.sections[0].body.ru);
      expect(lesson?.questions.length, name).toBeGreaterThan(0);
      expect(lesson?.interview?.answer.en, name).toBeTruthy();
    }
  }
  for (const month of [1, 2]) {
    for (const day of reactMonthDays(month).slice(0, 3)) {
      for (const topic of day.topics) {
        const body = topic.explanation[0].text;
        expect(tr(body, 'en'), topic.id).not.toBe(body);
        expect(
          INTERVIEW_QUESTIONS.find((question) => question.id === topic.id + '-written'),
        ).toBeDefined();
      }
    }
  }
}, 30000);

it('accepts published variants without treating words embedded in an incorrect answer as a match', () => {
  expect(
    matchesWrittenAnswer('  hypertext markup language. ', ['HTML', 'HyperText Markup Language']),
  ).toBe(true);
  expect(matchesWrittenAnswer('HTML is a programming language', ['HTML'])).toBe(false);
  expect(matchesWrittenAnswer('==', ['==='], true)).toBe(false);
  expect(matchesWrittenAnswer('Let', ['let'], true)).toBe(false);
  expect(matchesWrittenAnswer('`let`', ['let'], true)).toBe(true);
});

it('checks both options and written responses in Course Answers, including retry after an incorrect answer', async () => {
  useLearningStore.setState({
    ...emptyProgress(),
    ready: true,
    language: 'en',
    contentLanguage: 'en',
  });
  const { lessons } = await loadCourseContent('html');
  const firstDay = lessons.find((lesson) => lesson.day === 1)!;
  render(<CourseAnswers courseId="html" lessons={lessons} initialDay={1} />);
  const card = screen.getByRole('article');
  const firstQuestion = within(card).getByRole('heading', {
    name: firstDay.questions[0].question.en,
  }).parentElement!;
  const choice = within(firstQuestion).getAllByRole('radio');
  fireEvent.click(choice[firstDay.questions[0].correctIndex]);
  fireEvent.click(within(firstQuestion).getByRole('button', { name: 'Check' }));
  expect(within(firstQuestion).getByRole('status')).toHaveTextContent('Correct');

  fireEvent.click(screen.getByRole('button', { name: 'Interview' }));
  const draft = within(card).getByRole('textbox', { name: 'Your answer' });
  const check = within(card).getByRole('button', { name: 'Check' });
  expect(check).toBeDisabled();
  fireEvent.change(draft, { target: { value: 'CSS' } });
  fireEvent.click(check);
  expect(within(card).getByRole('status')).toHaveTextContent('did not match');
  expect(draft).not.toHaveAttribute('readonly');
  fireEvent.change(draft, { target: { value: 'HyperText Markup Language' } });
  fireEvent.click(check);
  expect(within(card).getByRole('status')).toHaveTextContent('Correct');
  expect(draft).toHaveAttribute('readonly');
  const recorded = Object.values(useLearningStore.getState().courses.html?.answers ?? {});
  expect(recorded).toContainEqual(
    expect.objectContaining({
      questionId: firstDay.interview!.id,
      correct: true,
      mode: 'interview',
    }),
  );
});

it('grades and saves the React opening interview instead of asking the learner to score themselves', () => {
  useLearningStore.setState({
    ...emptyProgress(),
    ready: true,
    language: 'en',
    contentLanguage: 'en',
  });
  render(<StudySession config={{ mode: 'interview', topic: 'topic-1' }} embedded />);
  const draft = screen.getByRole('textbox', { name: 'Your answer' });
  const check = screen.getByRole('button', { name: 'Check' });
  fireEvent.change(draft, { target: { value: 'HTML' } });
  fireEvent.click(check);
  expect(screen.getByRole('status')).toHaveTextContent('did not match');
  fireEvent.change(draft, { target: { value: 'React.js' } });
  fireEvent.click(check);
  expect(screen.getByRole('status')).toHaveTextContent('Correct');
  expect(Object.values(useLearningStore.getState().answers)).toContainEqual(
    expect.objectContaining({ questionId: 'topic-1-written', correct: true, mode: 'interview' }),
  );
});
