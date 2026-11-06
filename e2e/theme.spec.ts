import { expect, test } from '@playwright/test';

test('appearance changes the shell and persists without loading Monaco on the catalog',async({page})=>{
  await page.addInitScript(()=>{
    const key='react-mentor-learning-v2';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:2,state:{language:'ru',contentLanguage:'ru',selectedCourse:'react',courseChosen:true}}));
  });
  const editorRequests:string[]=[];
  page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/monaco/'))editorRequests.push(request.url());});
  await page.goto('/settings');
  const appearance=page.getByRole('combobox',{name:'Оформление',exact:true});
  await appearance.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor)).toBe('rgb(20, 19, 17)');
  await page.goto('/courses');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.locator('h1')).toHaveCSS('color','rgb(237, 234, 228)');
  await expect(page.locator('.course-card').first()).toHaveCSS('background-color','rgb(28, 27, 25)');
  expect(editorRequests).toEqual([]);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.goto('/settings');
  await appearance.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor)).toBe('rgb(246, 244, 239)');
});

test('selected practice and course tier labels stay readable in both themes',async({page})=>{
  const contrast=async(selector:string)=>page.locator(selector).first().evaluate(element=>{
    const style=getComputedStyle(element);
    const luminance=(value:string)=>{
      const channels=value.match(/[\d.]+/g)?.slice(0,3).map(Number);
      if(!channels||channels.length!==3)throw new Error(`Unsupported color: ${value}`);
      const [r,g,b]=channels.map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
      return .2126*r+.7152*g+.0722*b;
    };
    const foreground=luminance(style.color),background=luminance(style.backgroundColor);
    return { ratio:(Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05),background:style.backgroundColor };
  });
  for(const theme of ['light','dark'] as const) {
    await page.goto('/settings');
    await page.getByRole('combobox',{name:'Оформление',exact:true}).selectOption(theme);
    await page.goto('/practice?course=html');
    await page.locator('.practice-course-picker>summary').click();
    const selected='.practice-course-tabs a[aria-current=page]';
    await expect(page.locator(selected)).toHaveCount(1);
    const active=await contrast(selected);
    const inactive=await contrast('.practice-course-tabs a:not([aria-current])');
    expect(active.ratio,`${theme}: selected practice`).toBeGreaterThanOrEqual(4.5);
    expect(active.background,`${theme}: selected practice should be distinguishable`).not.toBe(inactive.background);
    await page.goto('/courses');
    for(const tier of ['pro','expert']) {
      const selector=`.course-tier.tier-${tier}`;
      await expect(page.locator(selector).first()).toBeVisible();
      expect((await contrast(selector)).ratio,`${theme}: ${tier} label`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
