import { expect, test } from '@playwright/test';
import { COURSE_CATEGORIES } from '../src/content/course-categories';
import { COURSE_CATALOG } from '../src/content/courses/catalog';

test('landing exposes the real catalog and usable navigation on desktop and mobile',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1366,height:768});
  await page.goto('/');
  await expect(page.locator('.public-direction-card')).toHaveCount(COURSE_CATEGORIES.length);
  await expect(page.locator('.public-facts')).toContainText(String(COURSE_CATALOG.filter(course=>course.id!=='javascript-2').length));
  await expect(page.locator('.public-actions .button.subtle')).toHaveAttribute('href','#directions');
  await expect(page.locator('.public-header .brand-icon')).toHaveCSS('background-clip','border-box');
  const primary=page.locator('.public-actions .button.primary');
  const secondary=page.locator('.public-actions .button.subtle');
  for(const button of [primary,secondary]) {
    const box=await button.boundingBox();
    expect(box).not.toBeNull();expect(box!.y+box!.height).toBeLessThanOrEqual(768);
  }
  for(const width of [320,360,390,600,860,1100,1280,1440]) {
    await page.setViewportSize({width,height:900});
    const layout=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,overflowing:Array.from(document.querySelectorAll('*')).map(element=>{
      const rect=element.getBoundingClientRect(),style=getComputedStyle(element);
      return {tag:element.tagName,className:String(element.className),left:Math.round(rect.left),right:Math.round(rect.right),position:style.position,overflow:style.overflow};
    }).filter(item=>item.right>innerWidth+1).slice(0,30)}));
    expect(layout.width,JSON.stringify(layout)).toBeLessThanOrEqual(layout.viewport);
    if(width===320) {
      await expect(page.locator('.public-header').getByRole('link',{name:'Начать обучение',exact:true})).toBeInViewport({ratio:1});
      await expect(page.locator('.public-header').getByRole('button',{name:'Открыть меню'})).toBeInViewport({ratio:1});
    }
  }
  await page.setViewportSize({width:390,height:844});
  const trigger=page.getByRole('button',{name:'Открыть меню'});
  await trigger.click();
  const menu=page.getByRole('dialog',{name:'Открыть меню'});
  await expect(menu.getByRole('link',{name:'Направления'})).toHaveAttribute('href','#directions');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);await expect(trigger).toBeFocused();
});

test('plans and avatars remain readable in both themes and learning has no infinite animation',async({page})=>{
  await page.goto('/plans');
  await expect(page.getByRole('heading',{name:'Ваш путь в разработку'})).toBeVisible();
  async function contrast(selector:string,backgroundSelector:string) {
    return page.evaluate(([foreground,background])=>{
      const fg=document.querySelector(foreground),bg=document.querySelector(background);
      if(!fg||!bg)throw new Error('Contrast target is missing');
      const channels=(value:string)=>value.match(/[\d.]+/g)!.slice(0,3).map(Number).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
      const luminance=(value:string)=>{const [r,g,b]=channels(value);return .2126*r+.7152*g+.0722*b;};
      const a=luminance(getComputedStyle(fg).color),b=luminance(getComputedStyle(bg).backgroundColor);
      return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    },[selector,backgroundSelector]);
  }
  expect(await contrast('main article h2','main article')).toBeGreaterThanOrEqual(4.5);
  await page.goto('/settings');
  await page.getByRole('combobox',{name:'Оформление',exact:true}).selectOption('dark');
  await page.goto('/plans');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(await contrast('main article h2','main article')).toBeGreaterThanOrEqual(4.5);
  expect(await contrast('.header-profile .avatar','.header-profile .avatar')).toBeGreaterThanOrEqual(4.5);
  expect(await page.evaluate(()=>document.getAnimations().filter(animation=>animation.effect?.getComputedTiming().iterations===Infinity).length)).toBe(0);
});

test('the mobile drawer scrolls as one layer above the assistant',async({page})=>{
  await page.setViewportSize({width:360,height:568});await page.goto('/home');
  await page.getByRole('button',{name:'Открыть меню'}).click();
  const drawer=page.getByRole('dialog',{name:'Навигация по курсу'});
  await expect(drawer).toBeVisible();
  await expect(page.locator('.agent-bubble')).toBeHidden();
  const answers=drawer.getByRole('link',{name:'Ответы и интервью',exact:true});
  await answers.scrollIntoViewIfNeeded();await expect(answers).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Открыть меню'})).toBeFocused();
});

test('typed sidebar navigation starts a view transition when the browser supports it',async({page})=>{
  await page.addInitScript(()=>{
    const doc=document as unknown as {startViewTransition?: (...args:unknown[])=>unknown};
    const original=doc.startViewTransition?.bind(doc);
    if(!original)return;
    (window as Window & {devatlasTransitions?:number}).devatlasTransitions=0;
    doc.startViewTransition=(...args:unknown[])=>{
      const state=window as Window & {devatlasTransitions?:number};
      state.devatlasTransitions=(state.devatlasTransitions??0)+1;
      return original(...args);
    };
  });
  await page.goto('/home');
  await expect(page.locator('.sidebar')).toBeVisible();
  const supported=await page.evaluate(()=>typeof document.startViewTransition==='function');
  test.skip(!supported,'The browser does not provide the View Transitions API.');
  const openMenu=page.getByRole('button',{name:'Открыть меню'});
  if(await openMenu.isVisible())await openMenu.click();
  await page.evaluate(()=>{(window as Window & {devatlasTransitions?:number}).devatlasTransitions=0;});
  await page.locator('.sidebar').getByRole('link',{name:'Практика',exact:true}).click();
  await expect(page).toHaveURL('/practice');
  await expect.poll(()=>page.evaluate(()=>(window as Window & {devatlasTransitions?:number}).devatlasTransitions??0)).toBeGreaterThan(0);
});
