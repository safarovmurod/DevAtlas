import { expect, test, type Page } from '@playwright/test';

const storageKey = 'react-mentor-learning-v2';

async function seed(page: Page, language = 'ru') {
  await page.addInitScript(({ key, language }) => {
    if (self !== top) return;
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, state: {
      language, contentLanguage: language === 'tg' ? 'tg' : language === 'ru' ? 'ru' : 'en',
    } }));
  }, { key: storageKey, language });
}

test('guest can study and submit one immutable daily result without paid practice', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await seed(page);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/courses/html/home?day=1');
  const article = page.locator('#html-day-01');
  const tabs = page.getByRole('group', { name: 'Мой день', exact: true });
  await expect(tabs.getByRole('button', { name: 'Изучить', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await article.getByRole('link', { name: 'Ответы и интервью', exact: true }).click();
  const exam = page.getByRole('region', { name: 'Проверка дня', exact: true });
  await expect(exam.getByRole('button', { name: 'Начать', exact: true })).toBeDisabled();
  await page.goto('/courses/html/home?day=1');
  await article.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
  await tabs.getByRole('button', { name: 'Практика', exact: true }).click();
  await expect(page.locator('#day-practice [data-practice-locked]')).toBeVisible();
  await expect(page.locator('.monaco-editor, .practice-validation, .lesson-assessment')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('guest-practice-lock.png'), fullPage: true });
  await article.getByRole('link', { name: 'Ответы и интервью', exact: true }).click();
  await exam.getByRole('button', { name: 'Начать', exact: true }).click();
  await expect(exam.locator('.course-question')).not.toHaveCount(0);
  // Blanks are an original submission too; no practice purchase is required.
  await exam.getByRole('button', { name: 'Отправить ответы', exact: true }).click();
  const result = page.getByRole('region', { name: 'Разбор результата', exact: true });
  await expect(result).toContainText('0%');
  await expect(result).toContainText('Без ответа');
  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).state.courses.html, storageKey);
  expect(before.confirmedDays).toEqual(['1']);
  expect(before.completedPractice).toEqual([]);
  expect(before.awards['practice:html-day-01']).toBeUndefined();
  expect(before.daySubmissions['html-day-01'].answers.every((answer: { answer: string; correct: boolean }) => answer.answer === '' && !answer.correct)).toBe(true);
  await page.reload();
  await expect(result).toContainText('0%');
  await expect(page.locator('[data-strict-start]')).toHaveCount(0);
  const after = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).state.courses.html, storageKey);
  expect(after.daySubmissions).toEqual(before.daySubmissions);
  expect(after.awards).toEqual(before.awards);
  await page.goto('/courses/html/plan');
  await expect(page.locator('.day-card.is-done')).toHaveCount(1);
  await expect(page.locator('.day-card.is-next')).toHaveCount(1);
  await expect(page.locator('a.day-card')).toHaveCount(2);
  await expect(page.locator('button.day-card')).toHaveCount(28);
  await expect(page.getByRole('link', { name: /День 2 / })).toBeVisible();
  await page.getByRole('button', { name: /День 3 / }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Сначала изучите урок и отправьте тест за день 2.' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('progress.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('direct lesson and legacy practice URLs cannot skip an unfinished day', async ({ page }) => {
  await seed(page);
  for (const path of ['/courses/html/home?day=2', '/practice?course=html&day=2', '/courses/html/practice?day=2']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/courses\/html\/home\?day=2/);
    await expect(page.getByRole('alert').filter({ hasText: 'Сначала изучите урок и отправьте тест за день 1.' })).toBeVisible();
    await expect(page.locator('#html-day-02, .monaco-editor')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'День 1', exact: true }).last()).toHaveAttribute('href', '/courses/html/home?day=1');
  }
  const progress = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).state.courses.html, storageKey);
  expect(progress?.confirmedDays ?? []).toEqual([]);
  expect(progress?.daySubmissions ?? {}).toEqual({});
  await page.goto('/practice?course=unknown');
  await expect(page.getByText('404 · Маршрут не найден')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
});

test('practice belongs to the selected course, catalog tracks and layouts remain usable', async ({ page }, testInfo) => {
  await seed(page);
  await page.goto('/courses/category/programming');
  for (const track of ['html', 'react', 'python', 'backend', 'mobile', 'cpp']) await expect(page.locator('[data-course="' + track + '"]')).toBeVisible();
  for (const path of ['/', '/courses', '/practice', '/practice?course=html&day=1']) {
    await page.goto(path);
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await expect(page.locator('#html-day-01')).toBeVisible();
  await expect(page.locator('[data-practice-locked]')).toBeVisible();
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({ path: testInfo.outputPath('practice-mobile.png'), fullPage: true });
});

const lockTitles = {
  ru: 'Практика доступна в тарифе Pro',
  tg: 'Практика дар тарифи Pro кушода аст',
  en: 'Practice is part of the Pro plan',
  es: 'La práctica forma parte del plan Pro',
};
for (const locale of ['ru', 'tg', 'en', 'es'] as const) {
  test('legacy practice link preserves day and localized access lock in ' + locale, async ({ page }) => {
    await seed(page, locale);
    await page.goto('/practice?course=html&day=1');
    await expect(page).toHaveURL('/courses/html/home?day=1#day-practice');
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('#html-day-01')).toBeVisible();
    await expect(page.locator('#day-practice [data-practice-locked]')).toContainText(lockTitles[locale]);
    await expect(page.locator('.monaco-editor, .practice-course-tabs')).toHaveCount(0);
  });
}

test('unconfigured paid plans cannot activate subscriptions and guest chat has no fake presence', async ({ page }) => {
  await seed(page);
  const checkoutRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('/api/billing/checkout')) checkoutRequests.push(request.url()); });
  await page.goto('/plans');
  await expect(page.getByRole('heading', { name: 'Выберите тариф', exact: true })).toBeVisible();
  for (const plan of ['Start', 'Pro', 'Ultra']) await expect(page.getByRole('heading', { name: plan, exact: true })).toBeVisible();
  const buttons = page.getByRole('button', { name: 'Оплата ещё не подключена', exact: true });
  await expect(buttons).toHaveCount(2);
  for (const button of await buttons.all()) await expect(button).toBeDisabled();
  await expect(page.getByText('Оплата недоступна, пока не подключён платёжный сервис. Курсы Start остаются доступны.', { exact: true })).toBeVisible();
  expect(checkoutRequests).toEqual([]);
  await page.goto('/community');
  await expect(page.getByRole('status').filter({ hasText: 'Войдите, чтобы открыть чат.' })).toBeVisible();
  await expect(page.getByLabel('Сообщение', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Войти', exact: true })).toHaveAttribute('href', '/login');
  expect((await page.request.get('/api/community')).status()).toBe(401);
});
