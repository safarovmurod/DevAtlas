import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.self !== window.top) return;
    if (!localStorage.getItem('react-mentor-learning-v2')) {
      localStorage.setItem('react-mentor-learning-v2', JSON.stringify({ version: 2, state: { language: 'tg', contentLanguage: 'tg' } }));
    }
  });
});

test('15-question onboarding builds a beginner plan and a daily schedule', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('.public-actions .button.primary').click();
  await expect(page).toHaveURL('/onboarding');
  await expect(page.getByText('Савол 1 аз 15')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('onboarding-question.png') });
  // Always choose the first option, except: direction = frontend (1st), coded = never (1st), language = tg (1st).
  for (let index = 0; index < 15; index++) await page.locator('.answer-option').first().click();
  await expect(page.getByRole('heading', { name: /HTML \+ CSS/ })).toBeVisible();
  await expect(page.locator('.onboarding-week span.active')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Рӯзи 0/ })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('onboarding-plan.png'), fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await page.goto('/courses');
  await expect(page.locator('.onboarding-banner')).toContainText('HTML + CSS');
  expect(errors).toEqual([]);
});

test('Day 0 explains VS Code and the console and checks understanding', async ({ page }, testInfo) => {
  await page.goto('/start');
  await expect(page.getByRole('heading', { name: 'Рӯзи 0: аз ин ҷо сар кунед' })).toBeVisible();
  await expect(page.getByText('code.visualstudio.com', { exact: false }).first()).toBeVisible();
  const question = page.locator('.start-question').nth(1);
  await question.locator('.answer-option').nth(1).click();
  await expect(question.getByRole('status')).toContainText('Дуруст!');
  await page.screenshot({ path: testInfo.outputPath('start-here.png'), fullPage: true });
});

test('lessons have an ordering game and practice blocks large pastes', async ({ page, context, browserName }, testInfo) => {
  await page.goto('/courses/html/home?day=1');
  const game = page.locator('.code-game');
  await expect(game).toBeVisible({ timeout: 30000 });
  await game.scrollIntoViewIfNeeded();
  // Wrong first pick shows a hint; undo, then solve by trying every remaining line.
  const total = await game.locator('.code-game-line').count();
  expect(total).toBeGreaterThanOrEqual(3);
  for (let step = 0; step < total; step++) {
    const options = game.locator('.code-game-line');
    const count = await options.count();
    for (let candidate = 0; candidate < count; candidate++) {
      await options.nth(candidate).click();
      if (await game.locator('.warning-text').count() === 0) break;
      await game.getByRole('button', { name: 'Як қадам ақиб' }).click();
    }
  }
  await expect(game.locator('.success-text')).toBeVisible();
  await game.screenshot({ path: testInfo.outputPath('code-game.png') });

  if (browserName !== 'chromium') return;
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/courses/html/practice?day=1');
  const editor = page.locator('.monaco-editor').first();
  await expect(editor).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('Emmet баъд аз дарсҳои аввал кушода мешавад', { exact: false })).toBeVisible();
  await editor.click();
  await page.evaluate(() => navigator.clipboard.writeText('<!doctype html>\n<html lang="tg">\n<head><title>Copy</title></head>\n<body><main><h1>Copied answer</h1></main></body>\n</html>'));
  await page.keyboard.press('ControlOrMeta+V');
  await expect(page.getByText('Гузоштани матни калон бекор шуд', { exact: false })).toBeVisible();
  const value = await page.evaluate(() => (window as unknown as { monaco: { editor: { getModels: () => { getValue: () => string }[] } } }).monaco.editor.getModels().map(model => model.getValue()).join(''));
  expect(value).not.toContain('Copied answer');
  await page.screenshot({ path: testInfo.outputPath('paste-guard.png') });
});

test('catalog filters by start level and course length', async ({ page }, testInfo) => {
  const { COURSE_CATALOG } = await import('../src/content/courses/catalog');
  const listed = COURSE_CATALOG.filter(course => course.id !== 'javascript-2');
  await page.goto('/courses');
  await expect(page.locator('.course-card')).toHaveCount(listed.length);
  await page.getByRole('button', { name: 'Аз сифр', exact: true }).click();
  await expect(page.locator('.course-card')).toHaveCount(listed.filter(course => !course.prerequisite).length);
  await page.getByRole('button', { name: 'То 14 рӯз', exact: true }).click();
  const expected = listed.filter(course => !course.prerequisite && (course.publishedDays ?? 0) <= 14).length;
  await expect(page.locator('.course-card')).toHaveCount(expected);
  await page.locator('.course-extra-filters').screenshot({ path: testInfo.outputPath('catalog-filters.png') });
});
