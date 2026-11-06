import {test,expect} from '@playwright/test';
test('lesson flow teaches prediction and independently editable HTML structure',async({page})=>{
 await page.addInitScript(()=>{
  if(window.top!==window.self)return;
  localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{language:'ru',contentLanguage:'ru'}}));
 });
 await page.goto('/courses/html/home?day=1');
 const nav=page.getByRole('navigation',{name:'Учебный маршрут'});
 await expect(nav.getByRole('link')).toHaveCount(8);
 const prediction=page.locator('#html-day-01-flow-understand');
 await prediction.getByRole('radio').nth(1).check();
 await expect(prediction.getByRole('status')).toContainText('Попробуйте ещё раз');
 await prediction.getByRole('radio').first().check();
 await expect(prediction.getByRole('status')).toContainText('Прогноз верный');
 const demo=page.locator('.html-document-explorer');
 const frame=demo.frameLocator('iframe');
 await expect(frame.getByRole('heading')).toHaveText('Встреча в субботу');
 await demo.getByRole('textbox').fill('Мой клуб');
 await expect(demo.locator('.demo-browser-tab')).toContainText('Мой клуб');
 await expect(frame.getByRole('heading')).toHaveText('Встреча в субботу');
 await demo.getByRole('button',{name:'h1',exact:true}).click();
 await demo.getByRole('textbox').fill('Встреча завтра');
 await expect(frame.getByRole('heading')).toHaveText('Встреча завтра');
 await expect(demo.locator('.demo-browser-tab')).toContainText('Мой клуб');
 // Input is literal text, never parsed into a new executable element.
 await demo.getByRole('textbox').fill('<img src=x onerror=alert(1)>');
 await expect(frame.getByRole('heading')).toHaveText('<img src=x onerror=alert(1)>');
 await expect(frame.locator('img,script')).toHaveCount(0);
 await expect(demo.locator('iframe')).toHaveAttribute('sandbox','');
 await expect(page.locator('.day-explanation')).toHaveCount(5);
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await nav.getByRole('link').nth(5).click();
 await expect(page).toHaveURL(/\/practice\?course=html&day=1#html-day-01-assessment/);
 await expect(page.locator('.lesson-assessment fieldset')).toHaveCount(8);
});
