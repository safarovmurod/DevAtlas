import { expect, test } from '@playwright/test';
import course from '../src/content/courses/content-creation.json';

test('author can study introductions, tone and a rubric-based drafting project', async ({ page }) => {
  const endDay = 16;
  test.setTimeout(90000);
  const previous = course.lessons.filter(lesson => lesson.day < endDay);
  await page.addInitScript(({ ids, days }) => {
    if (window.self !== window.top) return;
    const key = 'react-mentor-learning-v2';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      version: 2,
      state: { language: 'ru', contentLanguage: 'tg', courses: {
        'content-creation': { completedTopics: ids, completedPractice: ids, confirmedDays: days },
      } },
    }));
  }, { ids: previous.map(lesson => lesson.id), days: previous.map(lesson => String(lesson.day)) });

  await page.goto('/courses/content-creation/plan');
  await expect(page.locator('.day-card')).toHaveCount(30);
  for (const lesson of course.lessons.filter(lesson => lesson.day >= endDay - 2 && lesson.day <= endDay)) {
    await page.goto(`/courses/content-creation/home?day=${lesson.day}`);
    await expect(page.locator(`#${lesson.id} > header > h2`)).toHaveText(lesson.title.tg);
    await expect(page.locator('[data-lesson-section]')).toHaveCount(4);
  }
  const lesson = course.lessons.find(lesson => lesson.day === endDay)!;
  await page.goto(`/courses/content-creation/tests?day=${endDay}`); await page.locator('[data-strict-start]').click();
  const question = page.locator('.course-question').first();
  await question.getByRole('radio', { name: lesson.questions[0].options[1].tg, exact: true }).check();
  await question.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(question.locator('.question-feedback')).toContainText(lesson.questions[0].hint.tg);
  await expect(question.locator('.question-feedback a')).toHaveAttribute('href', `/courses/content-creation/home?day=16#${lesson.id}-section-${lesson.questions[0].relatedSection}`);
  const second = page.locator('.course-question').nth(1);
  await second.getByRole('radio', { name: lesson.questions[1].options[lesson.questions[1].correctIndex].tg, exact: true }).check();
  await second.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(second.getByRole('status')).toHaveText('Верно');

  await page.goto(`/practice?course=content-creation&day=${endDay}`);
  const answer = 'Пеш аз фиристодан сарлавҳаро бо мазмун муқоиса кунед. Ваъдаҳоро ҷудо карда, ҷавобҳоро аз матн ёбед. Агар шарҳ намерасад, сарлавҳаро маҳдуд кунед ё маълумоти санҷида илова кунед. Self Reviewed; хонанда ҳоло нест.';
  await page.locator('.written-practice textarea').fill(answer);
  await page.reload();
  await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
  await expect(page.locator('.written-rubric-review fieldset')).toHaveCount(3);
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['content-creation']);
  expect(progress.confirmedDays).not.toContain(String(endDay));
  expect(progress.completedPractice).not.toContain(lesson.id);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
