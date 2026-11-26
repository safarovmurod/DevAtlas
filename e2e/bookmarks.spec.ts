import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.self !== window.top) return;
    sessionStorage.setItem('react-mentor-guest', 'true');
    if (!localStorage.getItem('react-mentor-learning-v2'))
      localStorage.setItem(
        'react-mentor-learning-v2',
        // An explicit choice: the app also stores it in the locale cookie the server reads.
        JSON.stringify({
          version: 2,
          state: { language: 'en', contentLanguage: 'en', preferenceClock: { language: 1 } },
        }),
      );
  });
});

test('a lesson is bookmarked, listed, kept after reload, reopened and removed', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/courses/html/home?day=1');
  const lessonTitle = (await page.locator('article h2').first().textContent())?.trim() ?? '';
  expect(lessonTitle.length).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Bookmark', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bookmarked' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  // The list is reached from the course navigation (a drawer on phones).
  if (testInfo.project.name === 'mobile') await page.locator('.app-header .mobile-menu').click();
  await page.locator('#learning-sidebar').getByRole('link', { name: 'Bookmarks' }).click();
  await expect(page).toHaveURL('/bookmarks');
  await expect(page).toHaveTitle('Bookmarks · DevAtlas');
  const item = page.getByRole('link', { name: lessonTitle });
  await expect(item).toContainText('HTML + CSS · Day 1');

  await page.reload();
  await expect(item).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('bookmarks.png') });

  await item.click();
  await expect(page).toHaveURL('/courses/html/home?day=1');
  await expect(page.getByRole('button', { name: 'Bookmarked' })).toBeVisible();

  await page.goto('/bookmarks');
  await page.getByRole('button', { name: `Remove bookmark: ${lessonTitle}` }).click();
  await expect(page.getByText(/No bookmarks yet/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('a React day bookmark opens React even after another course was selected', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    if (window.self !== window.top) return;
    const saved = JSON.parse(localStorage.getItem('react-mentor-learning-v2') ?? '{}');
    if (saved.state?.courseChosen) return;
    saved.state = { ...saved.state, selectedCourse: 'react', courseChosen: true };
    localStorage.setItem('react-mentor-learning-v2', JSON.stringify(saved));
  });

  await page.goto('/home?month=1&day=1');
  await expect(page.getByText('React · Month 1 · Day 1')).toBeVisible();
  await page.getByRole('button', { name: 'Bookmark', exact: true }).click();

  // Opening a CSS lesson makes CSS the selected course; /home would now show CSS.
  await page.goto('/courses/css/home?day=1');
  await expect(page.getByRole('button', { name: 'Bookmark', exact: true })).toBeVisible();

  await page.goto('/bookmarks');
  await page.getByRole('link', { name: /React · Month 1 · Day 1/ }).click();
  await expect(page).toHaveURL('/home?month=1&day=1');
  await expect(page.getByText('React · Month 1 · Day 1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bookmarked' })).toBeVisible();
  expect(errors).toEqual([]);
});
