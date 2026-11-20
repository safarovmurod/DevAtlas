import { expect, test } from '@playwright/test';
import course from '../src/content/courses/ux-design.json';

test('design principles retain original feedback, strict results and a protected existing draft', async ({ page }) => {
  const lesson = course.lessons[18];
  const previous = course.lessons.slice(0, 18);
  const answer = 'Ҳуҷраи 4: вақтҳо, брон ва қоидаҳо. Пеш: ҳама яксон. Баъд: акцент ба брон, фазо байни гурӯҳҳо ва такрори слотҳо. Ҳар 12 принсипро аз назар мегузаронам. Контраст ҳоло чен нашудааст, санҷиши корбар ҳоло нагузаштааст.';
  // This historical draft predates the locked guest session; opening a lock must not erase it.
  await page.addInitScript(({ ids, days, lessonId, answer }) => {
    if (self !== top) return;
    const key = 'react-mentor-learning-v2';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, state: {
      language: 'ru', contentLanguage: 'tg', courses: {
        'ux-design': { completedTopics: ids, completedPractice: ids, confirmedDays: days, drafts: { [lessonId]: answer } },
      },
    } }));
  }, { ids: previous.map(item => item.id), days: previous.map(item => String(item.day)), lessonId: lesson.id, answer });
  await page.goto('/courses/ux-design/home?day=19');
  await expect(page.locator('#' + lesson.id + ' > header > h2')).toHaveText(lesson.title.tg);
  await expect(page.locator('[data-lesson-section]')).toHaveCount(15);
  for (const section of lesson.sections.slice(3)) await expect(page.locator('[data-lesson-section] > summary').filter({ hasText: section.title.tg })).toHaveCount(1);
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  await expect(page.locator('.course-question')).toHaveCount(0);
  const article = page.locator('#' + lesson.id);
  await article.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
  await article.getByRole('link', { name: 'Ответы и интервью', exact: true }).click();
  await expect(page).toHaveURL('/courses/ux-design/answers?day=19');
  const exam = page.getByRole('region', { name: 'Проверка дня', exact: true });
  await exam.getByRole('button', { name: 'Начать', exact: true }).click();
  const questions = exam.locator('.course-question');
  await expect(questions).toHaveCount(lesson.questions.length);
  const question = questions.nth(5);
  const q = lesson.questions[5];
  await expect(question.locator('legend')).toHaveText(q.question.tg);
  const wrong = (q.correctIndex + 1) % q.options.length;
  await question.getByRole('radio', { name: q.options[wrong].tg, exact: true }).check();
  await expect(exam.getByText(q.hint!.tg, { exact: true })).toHaveCount(0);
  await page.reload();
  await exam.getByRole('button', { name: 'Начать', exact: true }).click();
  await expect(question.getByRole('radio', { name: q.options[wrong].tg, exact: true })).toBeChecked();
  await exam.getByRole('button', { name: 'Отправить ответы', exact: true }).click();
  const result = page.getByRole('region', { name: 'Разбор результата', exact: true });
  await expect(result).toContainText('0%');
  await expect(result.getByText(q.hint!.tg, { exact: true })).toBeVisible();
  await expect(result.locator('a[href="/courses/ux-design/home?day=19#' + lesson.id + '-section-3"]')).toBeVisible();
  const submitted = await page.evaluate(id => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['ux-design'].daySubmissions[id], lesson.id);
  expect(submitted.answers).toContainEqual({ id: q.id, mode: 'test', answer: String(wrong), correct: false });
  await page.reload();
  await expect(result.getByText(q.hint!.tg, { exact: true })).toBeVisible();
  await expect(page.locator('[data-strict-start]')).toHaveCount(0);
  expect(await page.evaluate(id => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['ux-design'].daySubmissions[id], lesson.id)).toEqual(submitted);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/practice?course=ux-design&day=19');
  await expect(page).toHaveURL('/courses/ux-design/home?day=19#day-practice');
  await expect(page.locator('[data-practice-locked]')).toBeVisible();
  await expect(page.locator('.written-practice textarea')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-practice-locked]')).toBeVisible();
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['ux-design']);
  expect(progress.drafts[lesson.id]).toBe(answer);
  expect(progress.completedPractice).not.toContain(lesson.id);
  expect(progress.confirmedDays).toContain('19');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
