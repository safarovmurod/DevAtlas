import { expect, test } from '@playwright/test';

test('catalog filter labels are readable on both themes and screen sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['light', 'dark'] as const) {
    await page.goto('/settings');
    await page.getByRole('combobox', { name: 'Оформление', exact: true }).selectOption(theme);
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      for (const route of ['/home', '/courses']) {
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const labels = page.locator('.course-extra-filters .course-access-filters > span');
        await expect(labels).toHaveCount(2);
        const ratios = await labels.evaluateAll(elements => elements.map(element => {
          const color = (value: string) => {
            const channels = value.match(/[\d.]+/g)?.map(Number);
            if (!channels || channels.length < 3) throw new Error(`Unsupported color: ${value}`);
            return channels;
          };
          const luminance = (channels: number[]) => {
            const [r, g, b] = channels.slice(0, 3).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
            return .2126 * r + .7152 * g + .0722 * b;
          };
          let ancestor: Element | null = element, background: number[] | undefined;
          while (ancestor) {
            const candidate = color(getComputedStyle(ancestor).backgroundColor);
            if (candidate.length < 4 || candidate[3] >= .999) { background = candidate; break; }
            if (candidate[3] > 0) throw new Error('The label background is translucent');
            ancestor = ancestor.parentElement;
          }
          if (!background) throw new Error('No opaque label background found');
          const foreground = luminance(color(getComputedStyle(element).color));
          const surface = luminance(background);
          return (Math.max(foreground, surface) + .05) / (Math.min(foreground, surface) + .05);
        }));
        for (const ratio of ratios) expect(ratio, `${theme} ${viewport.width} ${route}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});

test('the start guide fits narrow screens and its code scrolls with a keyboard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['light', 'dark'] as const) {
    await page.goto('/settings');
    await page.getByRole('combobox', { name: 'Оформление', exact: true }).selectOption(theme);
    await page.goto('/start');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    for (const width of [320, 360, 390, 600, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const layout = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
      expect(layout.width, `${theme} ${width}`).toBeLessThanOrEqual(layout.viewport);
    }
    await page.setViewportSize({ width: 320, height: 900 });
    const code = page.locator('.start-here .day-explanation pre').first();
    await expect(code).toHaveAttribute('tabindex', '0');
    const dimensions = await code.evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.width);
    await code.focus();
    await expect(code).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => code.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  }
});
