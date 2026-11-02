import { expect, test } from '@playwright/test';
import { COURSE_CATEGORIES } from '../src/content/course-categories';
import { COURSE_CATALOG } from '../src/content/courses/catalog';

test('landing exposes the real catalog and usable navigation on desktop and mobile',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1366,height:768});
  await page.goto('/');
  const motion=await page.evaluate(()=>document.getAnimations().map(animation=>animation.effect?.getComputedTiming().duration).filter(duration=>typeof duration==='number'&&duration>1));
  expect(motion).toEqual([]);
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
  const closeMenu=menu.getByRole('button',{name:'Закрыть меню'});
  await expect(closeMenu).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(menu.getByRole('link',{name:'Войти'})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(closeMenu).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);await expect(trigger).toBeFocused();
});

test('the white preview text stays readable in both themes and screen sizes',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const theme of ['light','dark'] as const) {
    await page.goto('/settings');
    await page.getByRole('combobox',{name:'Оформление',exact:true}).selectOption(theme);
    for(const viewport of [{width:390,height:844},{width:1440,height:900}]) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
      await expect(page.locator('.studio-result')).toBeVisible();
      const result=await page.evaluate(()=>{
        const block=document.querySelector('.studio-result')!;
        const luminance=(value:string)=>{
          const channels=value.match(/[\d.]+/g)?.slice(0,3).map(Number);
          if(!channels||channels.length!==3)throw new Error(`Unsupported color: ${value}`);
          const [r,g,b]=channels.map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
          return .2126*r+.7152*g+.0722*b;
        };
        const background=getComputedStyle(block).backgroundColor,bg=luminance(background);
        const texts=['span','p'].map(selector=>{
          const element=block.querySelector(selector)!;const style=getComputedStyle(element),fg=luminance(style.color);
          return {selector,size:parseFloat(style.fontSize),ratio:(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05)};
        });
        return {background,texts,width:document.documentElement.scrollWidth,viewport:innerWidth};
      });
      expect(result.background).toBe('rgb(255, 255, 255)');
      for(const text of result.texts) {
        expect(text.size,`${theme} ${viewport.width} ${text.selector}`).toBeGreaterThanOrEqual(12);
        expect(text.ratio,`${theme} ${viewport.width} ${text.selector}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(result.width).toBeLessThanOrEqual(result.viewport);
    }
  }
});

test('lesson code can be scrolled by keyboard and locked days have a name',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:320,height:844});
  await page.goto('/courses/html/home');
  const locked=page.locator('.day-strip .locked-day').first();
  await expect(locked).toBeDisabled();
  await expect(locked).toHaveAccessibleName(/День 2/);
  const code=page.locator('#html-day-01-section-1 pre');
  await code.scrollIntoViewIfNeeded();
  const dimensions=await code.evaluate(element=>({width:element.clientWidth,scrollWidth:element.scrollWidth}));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.width);
  await page.keyboard.press('Tab');
  await code.focus();
  await expect(code).toBeFocused();
  const outline=await code.evaluate(element=>({style:getComputedStyle(element).outlineStyle,width:parseFloat(getComputedStyle(element).outlineWidth)}));
  expect(outline.style).not.toBe('none');expect(outline.width).toBeGreaterThan(0);
  await page.keyboard.press('ArrowRight');
  await expect.poll(()=>code.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);
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

test('catalog symbols have readable contrast in both themes',async({page})=>{
  for(const theme of ['light','dark'] as const) {
    await page.goto('/settings');
    await page.getByRole('combobox',{name:'Оформление',exact:true}).selectOption(theme);
    await page.goto('/courses');
    const symbols=page.locator('.course-card .course-symbol');
    await expect(symbols.first()).toBeVisible();
    const failures=await symbols.evaluateAll(elements=>elements.flatMap(element=>{
      const parse=(value:string)=>{
        const values=value.match(/[\d.]+/g)?.map(Number)??[];
        if(values.length<3)throw new Error(`Unsupported color: ${value}`);
        if(values.length>3&&values[3]<.999)throw new Error(`Catalog symbol color is not opaque: ${value}`);
        return values.slice(0,3).map(channel=>value.startsWith('color(srgb')?channel:channel/255);
      };
      const luminance=(value:string)=>{
        const [r,g,b]=parse(value).map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4);
        return .2126*r+.7152*g+.0722*b;
      };
      const style=getComputedStyle(element);
      const foreground=luminance(style.color),background=luminance(style.backgroundColor);
      const ratio=(Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05);
      return ratio<4.5?[{symbol:element.textContent,ratio:Math.round(ratio*100)/100,foreground:style.color,background:style.backgroundColor,image:style.backgroundImage}]:[];
    }));
    expect(failures,theme).toEqual([]);
  }
});

test('the mobile drawer scrolls as one layer above the assistant',async({page})=>{
  await page.setViewportSize({width:360,height:568});await page.goto('/home');
  await page.getByRole('button',{name:'Открыть меню'}).click();
  const drawer=page.getByRole('dialog',{name:'Навигация по курсу'});
  await expect(drawer).toBeVisible();
  const close=drawer.getByRole('button',{name:'Закрыть меню'});
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(drawer.locator('.profile-row')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await expect(page.locator('.agent-bubble')).toBeHidden();
  const answers=drawer.getByRole('link',{name:'Ответы и интервью',exact:true});
  await answers.scrollIntoViewIfNeeded();await expect(answers).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Открыть меню'})).toBeFocused();
});

test('header menus support keyboard focus and changing the interface language',async({page})=>{
  await page.goto('/home');
  const language=page.locator('.language-link');
  await expect(language).not.toHaveAttribute('aria-controls');
  await language.click();
  await expect(language).toHaveAttribute('aria-controls','language-menu-options');
  const languages=page.locator('#language-menu-options');
  const languageItems=languages.getByRole('menuitemradio');
  await expect(languageItems).toHaveCount(6);
  await expect(languageItems.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(languageItems.last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(languageItems.first()).toBeFocused();
  await page.keyboard.press('End');
  await expect(languageItems.last()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(language).toBeFocused();
  await expect(language).not.toHaveAttribute('aria-controls');
  await language.click();
  await languages.getByRole('menuitemradio',{name:/English/}).click();
  await expect(language).toHaveText('EN');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  const account=page.locator('.header-profile');
  await expect(account).not.toHaveAttribute('aria-controls');
  await account.click();
  await expect(account).toHaveAttribute('aria-controls','account-menu-options');
  const accountItems=page.locator('#account-menu-options').getByRole('menuitem');
  await expect(accountItems).toHaveCount(3);
  await expect(accountItems.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(accountItems.last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(accountItems.first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(account).toBeFocused();
  await expect(account).not.toHaveAttribute('aria-controls');
});

test('the stored dark theme is applied before application scripts hydrate',async({page})=>{
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{localStorage.setItem('devatlas-theme','dark');});
  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/,route=>route.abort());
  await page.goto('/login',{waitUntil:'domcontentloaded'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor)).toBe('rgb(13, 20, 34)');
});

test('key screens fit the requested widths in both themes without infinite learning animations',async({page})=>{
  test.setTimeout(300000);
  const routes=['/','/login','/home','/courses','/courses/html/home','/courses/html/plan','/practice','/settings','/plans','/community','/answers','/notes','/revision','/weak-topics','/study','/tests','/privacy','/terms'];
  const widths=[320,360,390,600,860,1100,1280,1440];
  const failures:Array<{theme:string;route:string;viewport:number;width:number;overflowing:string[]}>=[];
  const targetFailures:Array<{theme:string;route:string;targets:string[]}>=[];
  for(const theme of ['light','dark'] as const) {
    await page.goto('/settings');
    await page.getByRole('combobox',{name:'Оформление',exact:true}).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
    for(const route of routes) {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
      await expect(page.locator('h1').first()).toBeVisible();
      await page.waitForLoadState('networkidle',{timeout:5000}).catch(()=>{});
      const infiniteAnimations=await page.evaluate(()=>document.getAnimations().filter(animation=>animation.effect?.getComputedTiming().iterations===Infinity).map(animation=>animation instanceof CSSAnimation?animation.animationName:'unknown'));
      if(route==='/') expect(infiniteAnimations.length,`${theme} ${route}: ${infiniteAnimations.join(', ')}`).toBeLessThanOrEqual(2);
      else expect(infiniteAnimations,`${theme} ${route}`).toEqual([]);
      for(const width of widths) {
        await page.setViewportSize({width,height:900});
        const layout=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,overflowing:Array.from(document.querySelectorAll('*')).filter(element=>element.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(element=>`${element.tagName}.${String(element.className)}`)}));
        if(layout.width>layout.viewport)failures.push({theme,route,...layout});
        if(width===390) {
          const targets=await page.evaluate(()=>Array.from(document.querySelectorAll<HTMLElement>('a[href],button,select,summary,input:not([type=hidden])')).flatMap(element=>{
            const rect=element.getBoundingClientRect(),style=getComputedStyle(element);
            if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0||!rect.width||!rect.height||element.closest('[inert],[aria-hidden=true]')||element.matches(':disabled,[aria-disabled=true]'))return [];
            if(element instanceof HTMLInputElement&&['radio','checkbox'].includes(element.type)) {
              const label=element.labels?.[0]?.getBoundingClientRect();
              if(label&&label.width>=44&&label.height>=44)return [];
            }
            return rect.width<44||rect.height<44?[`${element.tagName}.${String(element.className)}: ${Math.round(rect.width)}×${Math.round(rect.height)}`]:[];
          }));
          if(targets.length)targetFailures.push({theme,route,targets});
        }
      }
    }
  }
  expect(failures).toEqual([]);
  expect(targetFailures).toEqual([]);
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
  if(await page.evaluate(()=>matchMedia('(max-width: 860px)').matches)) {
    await openMenu.click();
    await expect(page.locator('.sidebar')).toHaveClass(/\bis-open\b/);
  }
  await page.evaluate(()=>{(window as Window & {devatlasTransitions?:number}).devatlasTransitions=0;});
  await page.locator('.sidebar').getByRole('link',{name:'Практика',exact:true}).click();
  await expect(page).toHaveURL('/practice');
  await expect.poll(()=>page.evaluate(()=>(window as Window & {devatlasTransitions?:number}).devatlasTransitions??0)).toBeGreaterThan(0);
});

test('sidebar navigation works when view transitions are unavailable',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(document,'startViewTransition',{value:undefined,configurable:true});
  });
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/home');
  const openMenu=page.getByRole('button',{name:'Открыть меню'});
  if(await page.evaluate(()=>matchMedia('(max-width: 860px)').matches)) {
    await openMenu.click();
    await expect(page.locator('.sidebar')).toHaveClass(/\bis-open\b/);
  }
  await page.locator('.sidebar').getByRole('link',{name:'Практика',exact:true}).click();
  await expect(page).toHaveURL('/practice');
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  expect(errors).toEqual([]);
});

test('six interface languages fit key mobile pages',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile','Mobile-only locale layout coverage.');
  test.setTimeout(180000);
  const routes=['/','/login','/home','/courses','/practice','/settings','/plans','/community','/privacy','/terms'];
  const issues:Array<{locale:string;route:string;viewport:number;width:number}>=[];
  await page.goto('/');
  for(const locale of ['ru','uk','en','tg','ja','ko']) {
    await page.context().addCookies([{name:'react-mentor-locale',value:locale,url:'http://127.0.0.1:3100'}]);
    await page.evaluate(language=>{
      const contentLanguage=language==='ru'?'ru':language==='tg'?'tg':'en';
      localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{language,contentLanguage,theme:'light'}}));
      localStorage.setItem('devatlas-theme','light');
    },locale);
    for(const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang',locale);
      for(const width of [320,390]) {
        await page.setViewportSize({width,height:844});
        const layout=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));
        if(layout.width>layout.viewport)issues.push({locale,route,...layout});
      }
    }
  }
  expect(issues).toEqual([]);
});
