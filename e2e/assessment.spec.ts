import {test,expect} from '@playwright/test';
import bank from '../src/content/assessments/html-first-page';
import html from '../src/content/courses/html.json';
import {ASSESSMENT_COPY as copy} from '../src/lib/practice/assessment-copy';

test('assessment restores drafts, grades actual code and rotates retry forms',async({page})=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  if(window.top!==window.self)return;
  const key='react-mentor-learning-v2';
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:2,state:{language:'ru',contentLanguage:'ru'}}));
 });
 const initial=page.waitForResponse(response=>response.url().includes('/api/assessments?')&&response.status()===200);
 await page.goto('/practice?course=html&day=1');
 const view=await (await initial).json();
 expect(JSON.stringify(view)).not.toMatch(/correctOptionId|acceptedAnswers|correctPairs/);
 const variant=bank.variants.find(variant=>variant.id===view.variantId)!;
 const panel=page.locator('.lesson-assessment');
 await expect(panel.locator('fieldset')).toHaveCount(8);
 for(const question of variant.questions){
  const field=panel.locator('fieldset').filter({has:page.locator('legend').filter({hasText:question.prompt.ru})});
  if('correctOptionId' in question)await field.locator(`input[value="${question.correctOptionId}"]`).check();
  else if('correctOptionIds' in question)for(const id of question.correctOptionIds)await field.locator(`input[value="${id}"]`).check();
  else if('acceptedAnswers' in question)await field.locator('input').fill(question.acceptedAnswers[0]);
  else for(const [index,left] of question.left.entries())await field.locator('select').nth(index).selectOption(question.correctPairs[left.id]);
 }
 await page.reload();
 await expect(panel.locator('fieldset')).toHaveCount(8);
 const draft=await page.evaluate(()=>JSON.parse(localStorage.getItem('devatlas-assessment-draft-v1:guest:html:html-day-01')!));
 expect(draft.variantId).toBe(view.variantId);expect(Object.keys(draft.answers)).toHaveLength(8);
 await expect(page.locator('.monaco-editor')).toBeVisible({timeout:30000});
 const setCode=async(code:string)=>page.evaluate(value=>{
  (window as unknown as {monaco:{editor:{getModels:()=>{setValue:(code:string)=>void}[]}}}).monaco.editor.getModels()[0].setValue(value);
 },code);
 await setCode('<p>Incomplete</p>');
 await panel.getByRole('button',{name:copy.submit.ru,exact:true}).click();
 await expect(panel.locator('.assessment-result')).toContainText('100%');
 await expect(panel.locator('.assessment-result h4')).toHaveText(copy.needsReview.ru);
 await setCode(html.lessons[0].practice!.solution!);
 await expect(panel.locator('.assessment-result')).toHaveCount(0);
 await panel.getByRole('button',{name:copy.submit.ru,exact:true}).click();
 await expect(panel.locator('.assessment-result h4')).toHaveText(copy.mastered.ru);
 await expect(panel.locator('.assessment-result')).toContainText(copy.local.ru);
 const nextResponse=page.waitForResponse(response=>response.url().includes('excludeVariant=')&&response.status()===200);
 await panel.getByRole('button',{name:copy.retry.ru,exact:true}).click();
 const next=await (await nextResponse).json();expect(next.variantId).not.toBe(view.variantId);
 await expect(panel.locator('input:checked')).toHaveCount(0);
 await expect(panel.locator('.assessment-result')).toHaveCount(0);
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 expect(errors).toEqual([]);
});
