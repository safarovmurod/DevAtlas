import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const destination = process.env.DESIGN_CAPTURE_DIR;
if (!destination) throw new Error('DESIGN_CAPTURE_DIR is required');
const pages = [
  ['landing', '/'], ['login', '/login'], ['home', '/home'], ['courses', '/courses'],
  ['course-day', '/courses/html/home'], ['course-plan', '/courses/html/plan'],
  ['practice', '/practice'], ['settings', '/settings'], ['plans', '/plans'], ['community', '/community'],
];
const devices = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
];
const browser = await chromium.launch();
const errors = [];
try {
  for (const device of devices) for (const theme of ['light', 'dark']) {
    const directory = path.join(destination, `${device.name}-${theme}`);
    await mkdir(directory, { recursive: true });
    const context = await browser.newContext({ viewport: device.viewport, deviceScaleFactor: 1, reducedMotion: 'reduce', extraHTTPHeaders: { 'x-vercel-ip-country': 'RU' } });
    await context.addInitScript(({ selectedTheme }) => {
      if (location.origin !== 'http://127.0.0.1:3100') return;
      localStorage.setItem('react-mentor-learning-v2', JSON.stringify({ version: 2, state: { language: 'ru', contentLanguage: 'ru', theme: selectedTheme } }));
      localStorage.setItem('devatlas-theme', selectedTheme);
    }, { selectedTheme: theme });
    const page = await context.newPage();
    async function capture(name, url) {
      await page.goto(`http://127.0.0.1:3100${url}`, { waitUntil: 'domcontentloaded' });
      await page.locator('h1').first().waitFor({ state: 'visible', timeout: 20000 });
      await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, theme, { timeout: 20000 });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(directory, `${name}.png`), animations: 'disabled' });
      console.log(`${device.name}/${theme}/${name}: captured`);
    }
    for (const [name, url] of pages) {
      try { await capture(name, url); }
      catch (error) { errors.push(`${device.name}/${theme}/${name}: ${error.message}`); }
    }
    if (device.name === 'mobile') {
      try {
        await page.goto('http://127.0.0.1:3100/home', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Открыть меню' }).click();
        await page.getByRole('dialog', { name: 'Навигация по курсу' }).waitFor({ state: 'visible' });
        await page.screenshot({ path: path.join(directory, 'sidebar-open.png'), animations: 'disabled' });
        console.log(`${device.name}/${theme}/sidebar-open: captured`);
      } catch (error) { errors.push(`${device.name}/${theme}/sidebar-open: ${error.message}`); }
    }
    await context.close();
  }
} finally { await browser.close(); }
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
