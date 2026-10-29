import { expect, test } from '@playwright/test';
// Legacy regressions exercise accounts that already saved Tajik lesson text with
// Russian UI. Geo detection must not rewrite an existing learner's choice.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('react-mentor-learning-v2')) {
      localStorage.setItem('react-mentor-learning-v2', JSON.stringify({
        version: 2, state: { language: 'ru', contentLanguage: 'tg' },
      }));
    }
  });
});

import quiz from '../src/content/imported/quiz.json';

// This legacy regression walks a long dev-mode route chain; cold CI runners
// exceed the 5s default expect wait on later steps. Assertions stay identical;
// only the per-file wait grows.
const slow = expect.configure({ timeout: 20000 });

test('answers library filters, searches, exports and preserves reading progress and notes', async ({ page }, testInfo) => {
  // The regression walks many dev-mode pages; CI runners exceed the 30s default.
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/answers');
  await slow(page.getByRole('heading', { name: 'Ответы и интервью', exact: true })).toBeVisible();
  await slow(page.locator('.answer-topic-card')).toHaveCount(18);
  await slow(page.locator('.answers-intro')).toContainText('462');
  await page.locator('.answers-source-filters').getByRole('link', { name: 'Тесты', exact: true }).click();
  await slow(page.locator('.answers-source-filters').getByRole('link', { name: 'Тесты', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.locator('.answer-group').filter({ hasText: 'Группа 2' }).click();
  await slow(page.locator('.answers-pagination')).toContainText('1 / 2');
  await slow(page.locator('.answer-topic-card').first()).toContainText('Группа 2');
  await page.locator('.answers-source-filters').getByRole('link', { name: 'Все', exact: true }).click();
  await slow(page.locator('.answers-source-filters').getByRole('link', { name: 'Все', exact: true })).toHaveAttribute('aria-current', 'page');
  await slow(page).toHaveURL('/answers');
  await page.getByRole('searchbox').fill('/products/:id');
  await page.getByRole('button', { name: 'Найти', exact: true }).click();
  await slow(page.locator('.answer-topic-card[href="/answers/deep-71"]')).toBeVisible();
  await slow(page.getByRole('searchbox')).toHaveValue('/products/:id');
  await page.locator('.answer-topic-card[href="/answers/deep-71"]').click();
  await slow(page.locator('.lesson-article pre')).toContainText('// Route: /products/:id');
  await slow(page.locator('.flow-steps')).toContainText('UI update');
  await page.goto('/answers/deep-1');
  await slow(page.locator('.answer-reading-body').first()).toContainText(quiz.groups[0].items[0].correctAnswer);
  await page.getByRole('button', { name: 'Прочитал и понял', exact: true }).first().click();
  await page.getByRole('button', { name: 'В заметки', exact: true }).first().click();
  await page.reload();
  await slow(page.getByRole('button', { name: 'Изучено', exact: true }).first()).toBeDisabled();
  await slow(page.getByRole('button', { name: 'Сохранено', exact: true }).first()).toBeDisabled();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);
  expect(stored.studied).toContain('quiz-q001');
  expect(stored.awards['learn:quiz-q001']).toBe(2);
  expect(stored.notes.filter((note: {id:string}) => note.id === 'answer:quiz-q001')).toHaveLength(1);
  await page.goto('/notes');
  await slow(page.locator('main')).toContainText(quiz.groups[0].items[0].question);
  await page.goto('/answers?source=interview');
  await slow(page.locator('.answer-topic-card').first()).toContainText('Interview');
  await page.locator('.answer-topic-card').first().click();
  await slow(page.locator('.answer-reading-body pre').first()).toBeVisible();
  await page.goto('/answers/interview-3');
  await slow(page.locator('#interview-q7 .flow-steps')).toContainText('Paint: намоиш');
  slow(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('answer-reader.png'), fullPage: true });
  await page.goto('/answers');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Скачать общий HTML' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('react-answers.html');
  const response = await page.request.get('/answers/export');
  expect(response.headers()['content-security-policy']).toContain('sandbox');
  expect((await response.text()).match(/class="question"/g)).toHaveLength(462);
  slow(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('answers.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('merged answers preserve old reading marks and notes and open from their other topic', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/answers');
  await slow(page.getByRole('heading', { name: 'Ответы и интервью', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const key = 'react-mentor-learning-v2';
    const stored = JSON.parse(localStorage.getItem(key)!);
    stored.state.studied = ['interview-q13'];
    stored.state.awards = { 'learn:interview-q13': 2 };
    stored.state.notes = [{ id: 'answer:interview-q13', title: 'Batching чист?', content: 'Моя сохранённая заметка' }];
    localStorage.setItem(key, JSON.stringify(stored));
  });
  await page.goto('/answers/deep-12');
  const batching = page.locator('#quiz-q060');
  await slow(batching.getByRole('button', { name: 'Изучено', exact: true })).toBeDisabled();
  await slow(batching.getByRole('button', { name: 'Сохранено', exact: true })).toBeDisabled();
  await slow(batching.locator('.answer-variant')).toContainText('Batching — React');
  await slow(batching.locator('.answer-variant pre')).toBeVisible();
  let stored = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);
  expect(stored.awards['learn:quiz-q060']).toBeUndefined();
  expect(stored.notes[0].content).toBe('Моя сохранённая заметка');
  await page.goto('/answers');
  await slow(page.locator('.answers-intro')).toContainText('1 изучено');
  await page.goto('/answers/deep-40');
  await slow(page.locator('#quiz-q212')).toContainText('Selector чист?');
  await page.locator('#quiz-q212').click();
  await slow(page).toHaveURL(/\/answers\/deep-38#quiz-q196$/);
  const selector = page.locator('#quiz-q196');
  await slow(selector).toHaveAttribute('open', '');
  await slow(selector.locator('.answer-variant')).toContainText('Redux Architecture');
  const reduxAnswer = quiz.groups[39].items.find(question => question.id === 'q212')!.correctAnswer;
  await slow(selector.locator('.answer-variant')).toContainText(reduxAnswer);
  await selector.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
  await selector.getByRole('button', { name: 'В заметки', exact: true }).click();
  stored = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state);
  expect(stored.notes.find((note: {id:string;content:string}) => note.id === 'answer:quiz-q196').content).toContain(reduxAnswer);
  expect(stored.awards['learn:quiz-q196']).toBe(2);
  await selector.locator('summary').scrollIntoViewIfNeeded();
  slow(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('merged-answer.png') });
  expect(errors).toEqual([]);
});
