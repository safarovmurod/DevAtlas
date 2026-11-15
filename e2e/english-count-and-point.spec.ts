import { expect, test } from '@playwright/test';
import course from '../src/content/courses/english-foundations.json';

test('learner studies count nouns and demonstratives, gets grammar feedback and retains a written answer', async ({ page }) => {
  const endDay = 14;
  test.setTimeout(120000);
  const previous = course.lessons.filter(lesson => lesson.day < endDay);
  await page.addInitScript(({ ids, days }) => {
    if (window.self !== window.top) return;
    const key = 'react-mentor-learning-v2';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      version: 2,
      state: { language: 'ru', contentLanguage: 'tg', courses: {
        'english-foundations': { completedTopics: ids, completedPractice: ids, confirmedDays: days },
      } },
    }));
  }, { ids: previous.map(lesson => lesson.id), days: previous.map(lesson => String(lesson.day)) });

  await page.goto('/courses/english-foundations/plan');
  await expect(page.locator('.day-card')).toHaveCount(42);
  for (const lesson of course.lessons.filter(lesson => lesson.day >= endDay - 3 && lesson.day <= endDay)) {
    await page.goto(`/courses/english-foundations/home?day=${lesson.day}`);
    await expect(page.locator('.course-lesson h2')).toHaveText(lesson.title.tg);
    await expect(page.locator('.day-explanation')).toHaveCount(4);
  }
  const lesson = course.lessons.find(lesson => lesson.day === endDay)!;
  await page.goto(`/courses/english-foundations/tests?day=${endDay}`);
  const question = page.locator('.course-question').first();
  await question.getByRole('radio', { name: lesson.questions[0].options[1].tg, exact: true }).check();
  await question.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(question.locator('.question-feedback')).toContainText(lesson.questions[0].hint.tg);
  await expect(question.locator('.question-feedback a')).toHaveAttribute('href', `/courses/english-foundations/home?day=14#${lesson.id}-section-${lesson.questions[0].relatedSection}`);
  const second = page.locator('.course-question').nth(1);
  await second.getByRole('radio', { name: lesson.questions[1].options[lesson.questions[1].correctIndex].tg, exact: true }).check();
  await second.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(second.getByRole('status')).toHaveText('Верно');

  await page.goto(`/practice?course=english-foundations&day=${endDay}`);
  const answer = 'This is a ticket. That is a window. These are lamps. Those are bags. Those are bags; This is a ticket. This ticket is a phrase; This is a ticket is a sentence. Number and distance both matter. Written work only; pronunciation was not checked.';
  await page.locator('.written-practice textarea').fill(answer);
  await page.reload();
  await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
  await expect(question).toHaveCount(0);
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['english-foundations']);
  expect(progress.confirmedDays).not.toContain(String(endDay));
  expect(progress.completedPractice).not.toContain(lesson.id);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
