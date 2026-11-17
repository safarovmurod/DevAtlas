import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const course = JSON.parse(readFileSync(path.join(process.cwd(), 'src/content/courses/ai-fundamentals.json'), 'utf8'));
const practice = course.lessons[0].practice;

async function enterCode(page: Page, value: string) {
  await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 30000 });
  await expect.poll(() => page.evaluate(() => (window as unknown as {
    monaco?: { editor: { getModels: () => unknown[] } };
  }).monaco?.editor.getModels().length ?? 0)).toBeGreaterThan(0);
  await page.evaluate(code => {
    const models = (window as unknown as {
      monaco: { editor: { getModels: () => { setValue: (value: string) => void }[] } };
    }).monaco.editor.getModels();
    models[0].setValue(code);
  }, value);
}

test('function failure feedback wraps inline values on desktop and mobile', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  if (testInfo.project.name === 'mobile') await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    if (window.self !== window.top) return;
    localStorage.setItem('react-mentor-learning-v2', JSON.stringify({
      version: 2, state: { language: 'en', contentLanguage: 'en' },
    }));
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/courses/ai-fundamentals/home?day=1');
  const panel = page.locator('.function-practice');
  const run = panel.getByRole('button', { name: 'Check solution', exact: true });

  // A long returned value must remain readable inside the feedback card.
  await enterCode(page, "function routeBox(score) { return 'x'.repeat(150); }");
  await run.click();
  await expect(panel.getByRole('status')).toContainText('Incorrect');
  await expect(panel.locator('li')).toHaveCount(practice.execution.tests.length);
  await expect(panel.locator('li').first()).toContainText('routeBox(0.9)');
  await expect(panel.locator('li').first()).toContainText('expected');
  await expect(panel.locator('li').first()).toContainText('got');
  await panel.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await panel.locator('li').evaluateAll(items => items.every(item => item.scrollWidth <= item.clientWidth))).toBe(true);
  await panel.screenshot({ path: testInfo.outputPath('function-failure-feedback.png') });

  await enterCode(page, practice.solution);
  await run.click();
  await expect(panel.getByRole('status')).toContainText(`Correct · ${practice.execution.tests.length}/${practice.execution.tests.length}`);
  await expect(panel.locator('li')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
