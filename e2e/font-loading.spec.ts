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

test('a late Inter download still supplies Tajik glyphs in code', async ({ page }) => {
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
    // Exceed the optional body-font deadline, then require glyphs that are
    // absent from the bundled JetBrains Mono face.
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const sample = document.createElement('code');
      sample.id = 'delayed-tajik-font-probe';
      [...'ҳқҷғ'].forEach((letter, index) => {
        const glyph = document.createElement('span');
        glyph.id = `delayed-tajik-glyph-${index}`;
        glyph.textContent = letter;
        sample.append(glyph);
      });
      document.body.append(sample);
    });
    await page.locator('#delayed-tajik-font-probe').evaluate(element => element.getBoundingClientRect().width);
    const response = page.waitForResponse(result => fontUrl.test(result.url()));
    releaseFont();
    expect((await response).ok()).toBeTruthy();
    await page.evaluate(() => document.fonts.ready);
    const cdp = await page.context().newCDPSession(page);
    try {
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const {root} = await cdp.send('DOM.getDocument');
      for (const [index, letter] of [...'ҳқҷғ'].entries()) {
        const {nodeId} = await cdp.send('DOM.querySelector', {nodeId: root.nodeId, selector: `#delayed-tajik-glyph-${index}`});
        const {fonts} = await cdp.send('CSS.getPlatformFontsForNode', {nodeId});
        expect(fonts.some(font => font.isCustomFont && font.familyName.includes('Inter') && font.glyphCount > 0), JSON.stringify({letter, fonts})).toBe(true);
      }
    } finally {
      await cdp.detach();
    }
  } finally {
    releaseFont();
  }
});
