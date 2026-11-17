import { expect, test } from '@playwright/test';
import course from '../src/content/courses/ux-design.json';

test('design principles are lesson text with feedback and a persistent written exercise', async ({ page }) => {
  const lesson = course.lessons[18];
  const previous = course.lessons.slice(0, 18);
  await page.addInitScript(({ ids, days }) => {
    if (self !== top) return;
    const key = 'react-mentor-learning-v2';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, state: {
      language: 'ru', contentLanguage: 'tg', courses: {
        'ux-design': { completedTopics: ids, completedPractice: ids, confirmedDays: days },
      },
    } }));
  }, { ids: previous.map(l => l.id), days: previous.map(l => String(l.day)) });
  await page.goto('/courses/ux-design/home?day=19');
  await expect(page.locator(`#${lesson.id} > header > h2`)).toHaveText(lesson.title.tg);
  await expect(page.locator('[data-lesson-section]')).toHaveCount(15);
  for (const section of lesson.sections.slice(3)) await expect(page.locator('[data-lesson-section] > summary').filter({ hasText: section.title.tg })).toHaveCount(1);
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);

  // The lesson has its own quiz; the separate test page starts a formal attempt.
  await page.goto('/courses/ux-design/tests?day=19'); await page.locator('[data-strict-start]').click();
  const question = page.locator('.course-question').nth(5);
  const q = lesson.questions[5];
  await expect(question.getByRole('heading', { level: 3 })).toHaveText(q.question.tg);
  await question.getByRole('radio', { name: q.options[(q.correctIndex + 1) % q.options.length].tg, exact: true }).check();
  await question.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(question.locator('.question-feedback p')).toHaveText(q.hint!.tg);
  await expect(question.locator('.question-feedback a')).toHaveAttribute('href', `/courses/ux-design/home?day=19#${lesson.id}-section-3`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.goto('/practice?course=ux-design&day=19');
  const answer = 'Ҳуҷраи 4: вақтҳо, брон ва қоидаҳо. Пеш: ҳама яксон. Баъд: акцент ба брон, фазо байни гурӯҳҳо ва такрори слотҳо. Ҳар 12 принсипро аз назар мегузаронам. Контраст ҳоло чен нашудааст, санҷиши корбар ҳоло нагузаштааст.';
  await page.locator('.written-practice textarea').fill(answer);
  await page.reload();
  await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
