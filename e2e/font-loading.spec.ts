import { expect, test } from '@playwright/test';

test('a late Inter download does not move the landing content', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: testInfo.project.name === 'mobile' ? 320 : 1440, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem('react-mentor-learning-v2', JSON.stringify({ version: 2, state: { language: 'ru', contentLanguage: 'ru', theme: 'dark' } }));
    localStorage.setItem('devatlas-theme', 'dark');
  });

  let releaseFont = () => {};
  let requests = 0;
  const fontGate = new Promise<void>(resolve => { releaseFont = resolve; });
  const fontUrl = /\/_next\/static\/media\/Inter.*\.woff2(?:\?.*)?$/;
  await page.route(fontUrl, async route => {
    requests += 1;
    await fontGate;
    await route.continue();
  });

  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.public-hero h1')).toBeVisible();
    await expect.poll(() => requests).toBeGreaterThan(0);
    // Allow the browser's optional-font block period and hydration to finish.
    await page.waitForTimeout(1000);
    const measure = () => page.evaluate(() => {
      const heading = document.querySelector('.public-hero h1')!.getBoundingClientRect();
      const actions = document.querySelector('.public-actions')!.getBoundingClientRect();
      return { headingHeight: heading.height, actionsTop: actions.top };
    });
    const before = await measure();
    const response = page.waitForResponse(response => fontUrl.test(response.url()));
    releaseFont();
    expect((await response).ok()).toBeTruthy();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const after = await measure();
    expect(Math.abs(after.headingHeight - before.headingHeight)).toBeLessThan(1);
    expect(Math.abs(after.actionsTop - before.actionsTop)).toBeLessThan(1);
  } finally {
    releaseFont();
  }
});
