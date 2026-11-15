import { expect, test } from '@playwright/test';
import { COURSE_CATALOG } from '../src/content/courses/catalog';
import { COURSE_CATEGORIES, PROGRAMMING_SUBTRACKS } from '../src/content/course-categories';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.self !== window.top) return;
    const key = 'react-mentor-learning-v2';
    if (!localStorage.getItem(key))
      localStorage.setItem(
        key,
        JSON.stringify({ version: 2, state: { language: 'ru', contentLanguage: 'ru' } }),
      );
  });
});

// CSS is a full standalone course again and keeps its own catalog card.
const catalog = COURSE_CATALOG.filter((course) => course.id !== 'javascript-2');

test('catalog opens each direction on its own page and search finds courses everywhere', async ({
  page,
}, testInfo) => {
  await page.goto('/courses');
  for (const category of COURSE_CATEGORIES)
    await expect(page.locator(`.category-card[data-category="${category.id}"]`)).toBeVisible();
  await expect(page.locator('.course-card')).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Найти курс', exact: true }).fill('Python');
  await expect(page.locator('[data-course="python"]')).toBeVisible();
  await page.getByRole('textbox', { name: 'Найти курс', exact: true }).fill('');
  await page.locator('.category-card[data-category="programming"]').click();
  await expect(page).toHaveURL(/\/courses\/category\/programming$/);
  await expect(page.locator('.course-card')).toHaveCount(
    catalog.filter((course) => course.category === 'programming').length,
  );
  for (const track of PROGRAMMING_SUBTRACKS)
    if (catalog.some((course) => course.subtrack === track.id))
      await expect(
        page.getByRole('heading', { name: track.labels.ru, exact: true, level: 2 }),
      ).toBeVisible();
  await page.getByRole('link', { name: 'Назад к направлениям' }).click();
  await page.locator('.category-card[data-category="design"]').click();
  await expect(page).toHaveURL(/\/courses\/category\/design$/);
  await expect(page.locator('.course-card')).toHaveCount(
    catalog.filter((course) => course.category === 'design').length,
  );
  await page.screenshot({ path: testInfo.outputPath('design-catalog.png'), fullPage: true });
});

test('direction pages have no plan filters, level cards keep their tier and every course is open to guests', async ({
  page,
}) => {
  await page.goto('/courses');
  await expect(page.locator('.course-access-filters, .course-extra-filters')).toHaveCount(0);
  for (const tier of ['pro', 'expert'] as const) {
    const course = catalog.find((entry) => entry.accessTier === tier)!;
    await page.goto(`/courses/category/${course.category}`);
    await expect(page.locator(`[data-course="${course.id}"]`)).toHaveAttribute(
      'data-access-tier',
      tier,
    );
  }
  // Every course is free now (the membership guard itself is covered by unit tests).
  await page.goto('/courses/javascript-pro/home?day=1');
  await expect(page.getByRole('button', { name: 'Прочитал и понял', exact: true })).toBeVisible();
  await expect(
    page.getByText('Войдите в аккаунт, чтобы открыть этот курс.', { exact: true }),
  ).toHaveCount(0);
  const opened = await page.request.get('/api/courses/javascript-pro');
  expect(opened.status()).toBe(200);
  expect(opened.headers()['cache-control']).toContain('no-store');
  await page.goto('/practice?course=architecture-expert');
  await expect(
    page.getByText('Войдите в аккаунт, чтобы открыть этот курс.', { exact: true }),
  ).toHaveCount(0);
});

test('written business practice saves a real response without Monaco and confirms the next day', async ({
  page,
}) => {
  // The lesson→practice hand-off is a client-side navigation; on a cold CI
  // browser the route can take longer than the default 5s expect timeout.
  const slow = expect.configure({ timeout: 20000 });
  test.setTimeout(90000);
  await page.goto('/courses/business-foundations/home?day=1');
  await page.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
  await slow(page.locator('#day-practice')).toBeVisible();
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  await expect(page.locator('.learning-code-editor')).toHaveCount(0);
  const response =
    'Клиент: владелец небольшой кофейни. Задача: заранее учитывать остатки молока. Предложение: простой ежедневный список. Предположение: список уменьшит срочные закупки. Проверка: сравнить записи двух рабочих дней без сбора персональных данных.';
  await page.getByLabel('Ваш ответ', { exact: true }).fill(response);
  await page.reload();
  await expect(page.getByLabel('Ваш ответ', { exact: true })).toHaveValue(response);
  for (const criterion of await page.locator('.course-criterion input').all())
    await criterion.check();
  await page.getByRole('button', { name: 'Самопроверка проекта', exact: true }).click();
  await page.getByRole('button', { name: 'Подтвердить завершение дня', exact: true }).click();
  await expect(page.getByRole('button', { name: 'День подтверждён', exact: true })).toBeDisabled();
  const progress = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses[
        'business-foundations'
      ],
  );
  expect(progress.drafts['business-foundations-day-01']).toBe(response);
  expect(progress.awards['practice:business-foundations-day-01']).toBe(4);
  expect(progress.confirmedDays).toEqual(['1']);
  await page.reload();
  await expect(page.getByLabel('Ваш ответ', { exact: true })).toHaveValue(response);
  const next = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses[
        'business-foundations'
      ],
  );
  expect(next.awards).toEqual(progress.awards);
  await page.getByRole('link', { name: /Следующий день 2/ }).click();
  await slow(page).toHaveURL('/courses/business-foundations/home?day=2');
  await expect(page.locator('main article h2')).toBeVisible();
});
