import { expect, test } from '@playwright/test';
import html from '../src/content/courses/html.json';
import { buildPuzzle } from '../src/lib/games/code-order';

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
  await page.locator('section[aria-labelledby="landing-hero-heading"] a[href="/onboarding"]').first().click();
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

test('placement check measures knowledge and sets level and course', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/onboarding');
  // First option everywhere (frontend, tg), except question 4 «have you coded?» → «a little».
  for (let index = 0; index < 15; index++) await page.locator('.answer-option').nth(index === 3 ? 1 : 0).click();
  await expect(page.getByRole('heading', { name: 'Санҷиши кӯтоҳи дониш' })).toBeVisible();
  await page.getByRole('button', { name: /Сар кардан/ }).click();
  await expect(page.getByText('Савол 1 аз 6')).toBeVisible();
  // Tier 1 right (HTML <a>, flex row), everything after «I don't know».
  await page.getByRole('button', { name: '<a>', exact: true }).click();
  await page.locator('.answer-option').first().click();
  await expect(page.locator('.placement-code')).toContainText('nums.map');
  for (let index = 0; index < 4; index++) await page.getByRole('button', { name: 'Намедонам' }).click();
  await expect(page.getByRole('heading', { name: /JavaScript · JS1/ })).toBeVisible();
  await expect(page.locator('.level-badge')).toContainText('Миёна');
  await expect(page.locator('.onboarding-level')).toContainText('2 / 6');
  await page.screenshot({ path: testInfo.outputPath('placement-result.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  await page.goto('/courses');
  await expect(page.locator('.onboarding-banner')).toContainText('Миёна');
  expect(errors).toEqual([]);
});

test('placement check can be skipped and then uses the self-estimate', async ({ page }) => {
  await page.goto('/onboarding');
  // computer = «normal» (option 2), coded = «regularly» (option 3), everything else the first option.
  for (let index = 0; index < 15; index++) await page.locator('.answer-option').nth(index === 2 ? 1 : index === 3 ? 2 : 0).click();
  await page.getByRole('button', { name: 'Гузаштан бе санҷиш' }).click();
  await expect(page.getByText('Сатҳ аз рӯи ҷавобҳои шумо муайян шуд', { exact: false })).toBeVisible();
  await expect(page.locator('.level-badge')).toContainText('Миёна');
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
  // The game sits in a closed block of the lesson step.
  await page.locator('details:has(.code-game) > summary').click();
  const game = page.locator('.code-game');
  await expect(game).toBeVisible({ timeout: 30000 });
  await game.scrollIntoViewIfNeeded();
  // Numbered places 1 → ?, 2 → ?: a wrong order is named, then the right order is accepted.
  const day = html.lessons[0];
  const puzzle = buildPuzzle(day.sections.map(section => ({ code: section.code, title: section.title.tg })), day.id)!;
  const lines = puzzle.lines.map(line => line.trim());
  expect(lines.length).toBeGreaterThanOrEqual(3);
  await expect(game.locator('.code-game-slot-empty')).toHaveCount(lines.length);
  for (const line of [...lines].reverse()) await game.locator('.code-game-line', { hasText: line }).first().click();
  await game.getByRole('button', { name: 'Санҷидан' }).click();
  await expect(game.locator('.warning-text')).toBeVisible();
  await game.getByRole('button', { name: 'Аз нав' }).click();
  for (const line of lines) await game.locator('.code-game-line', { hasText: line }).first().click();
  await game.getByRole('button', { name: 'Санҷидан' }).click();
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

test('a direction page lists its courses without filters and a card opens the plan', async ({ page }, testInfo) => {
  const { COURSE_CATALOG } = await import('../src/content/courses/catalog');
  const listed = COURSE_CATALOG.filter(course => course.id !== 'javascript-2' && course.category === 'programming');
  await page.goto('/courses/category/programming');
  await expect(page.locator('.course-card')).toHaveCount(listed.length);
  // The old level and length filters are gone: one page per direction, no filter bar.
  await expect(page.locator('.course-extra-filters, .course-access-filters, .subtrack-filters')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('direction-page.png') });
  await page.locator('[data-course=html]').getByRole('button').click();
  await expect(page).toHaveURL('/courses/html/plan');
});

test('JavaScript-1 practice runs real function tests in the browser', async ({ page }) => {
  await page.goto('/courses/javascript-1/practice?day=1');
  await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 30000 });
  const setCode = (code: string) => page.evaluate(value => {
    const models = (window as unknown as { monaco: { editor: { getModels: () => { setValue: (v: string) => void }[] } } }).monaco.editor.getModels();
    models[models.length - 1].setValue(value);
  }, code);
  const run = page.getByRole('button', { name: 'Тестҳои функсияро иҷро кунед' });
  await setCode('function describeUser(name, age) { return name + age; }');
  await run.click();
  await expect(page.locator('.function-practice [role=status]')).not.toHaveText('Тестҳои маҳаллӣ гузаштанд.', { timeout: 15000 });
  await setCode('function describeUser(name, age) {\n  return `${name}, ${age}`;\n}');
  await run.click();
  await expect(page.locator('.function-practice [role=status]')).toHaveText('Тестҳои маҳаллӣ гузаштанд.', { timeout: 15000 });
});
