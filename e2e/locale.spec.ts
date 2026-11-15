import { expect, test } from '@playwright/test';

const expected = [
  {country:'RU',lang:'ru',heading:'От нового интереса',policy:'Конфиденциальность'},
  {country:'US',lang:'en',heading:'Turn your curiosity',policy:'Privacy'},
  {country:'TJ',lang:'tg',heading:'Аз шавқи нав',policy:'Махфият'},
  {country:'ES',lang:'es',heading:'De la curiosidad',policy:'Privacidad'},
] as const;

for (const item of expected) {
  test(`a first-time visitor from ${item.country} sees ${item.lang} on public pages and inside settings`, async ({page}) => {
    await page.setExtraHTTPHeaders({'x-vercel-ip-country':item.country});
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang',item.lang);
    await expect(page.getByRole('heading', {name:new RegExp(item.heading)})).toBeVisible();
    await expect(page.locator('footer').getByRole('link',{name:item.policy})).toHaveAttribute('href','/privacy');

    await page.goto('/settings');
    await expect(page.locator('.language-link')).toHaveText(item.lang.toUpperCase());
    await expect(page.locator('select').first()).toHaveValue(item.lang);
    const expectedContentLanguage=item.lang==='es'?'en':item.lang;
    await expect(page.locator('select').nth(1)).toHaveValue(expectedContentLanguage);
    await page.reload();
    await expect(page.locator('select').first()).toHaveValue(item.lang);
  });
}

test('the language selector offers exactly English, Russian, Tajik and Spanish',async({page})=>{
  await page.goto('/settings');
  await expect(page.locator('select').first().locator('option')).toHaveText(['English','Русский','Тоҷикӣ','Español']);
});

test('Cloudflare visitor country wins over Vercel proxy IP country',async({page})=>{
  await page.setExtraHTTPHeaders({'x-vercel-ip-country':'US','cf-ipcountry':'ES'});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','es');
  await expect(page.getByRole('heading',{name:/De la curiosidad/})).toBeVisible();
});

test('manual preference survives refresh, navigation and country changes',async({page})=>{
  await page.setExtraHTTPHeaders({'x-vercel-ip-country':'ES'});
  await page.goto('/settings');
  await expect(page.locator('select').first()).toHaveValue('es');
  await page.locator('select').first().selectOption('tg');
  await expect(page.locator('html')).toHaveAttribute('lang','tg');
  await expect(page.locator('select').first()).toHaveValue('tg');
  await page.reload();
  await expect(page.locator('select').first()).toHaveValue('tg');
  await page.setExtraHTTPHeaders({'x-vercel-ip-country':'RU'});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','tg');
  await expect(page.getByRole('heading',{name:/Аз шавқи нав/})).toBeVisible();
});

test('existing stored account/browser language wins over first-visit geolocation',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('react-mentor-learning-v2',JSON.stringify({
      version:2, state:{language:'en',contentLanguage:'en',preferenceClock:{language:42},selectedCourse:'react',courseChosen:true},
    }));
  });
  await page.setExtraHTTPHeaders({'x-vercel-ip-country':'RU'});
  await page.goto('/settings');
  await expect(page.locator('select').first()).toHaveValue('en');
  await expect(page.locator('.language-link')).toHaveText('EN');
});

for (const removed of ['uk','ja','ko']) {
  test(`a saved ${removed} language from an older version moves to English without an error`,async({page})=>{
    const errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(old=>{
      localStorage.setItem('react-mentor-learning-v2',JSON.stringify({
        version:2, state:{language:old,contentLanguage:'en',preferenceClock:{language:42}},
      }));
    },removed);
    await page.context().addCookies([{name:'react-mentor-locale',value:removed,url:'http://127.0.0.1:3100'}]);
    await page.setExtraHTTPHeaders({'x-vercel-ip-country':'DE','accept-language':'de-DE,de;q=0.9'});
    await page.goto('/settings');
    await expect(page.locator('html')).toHaveAttribute('lang','en');
    await expect(page.locator('select').first()).toHaveValue('en');
    await expect(page.locator('.language-link')).toHaveText('EN');
    expect(errors).toEqual([]);
  });
}

test('a removed-language cookie falls back to the browser language on the server',async({request})=>{
  const response=await request.get('/',{headers:{
    'x-vercel-ip-country':'DE',
    'accept-language':'es-ES,es;q=0.9',
    cookie:'react-mentor-locale=ja',
  }});
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('<html lang="es"');
});

test('unknown-country initial HTTP requests honor Accept-Language and English fallback',async({request})=>{
  // Use explicit request headers; device profiles can override Accept-Language
  // on browser navigation. This checks the actual Next.js server response.
  const spanish=await request.get('/',{headers:{
    'x-vercel-ip-country':'DE',
    'accept-language':'de-DE,de;q=0.9,es-ES;q=0.7,en;q=0.6',
  }});
  expect(spanish.ok()).toBe(true);
  expect(await spanish.text()).toContain('<html lang="es"');

  const english=await request.get('/',{headers:{
    'x-vercel-ip-country':'BR',
    'accept-language':'pt-BR,fr-FR;q=0.8',
  }});
  expect(english.ok()).toBe(true);
  expect(await english.text()).toContain('<html lang="en"');
});
