import {test,expect,type Page} from '@playwright/test';
import course from '../src/content/courses/backend.json';
async function code(page:Page,value:string){
 await expect(page.locator('.monaco-editor')).toBeVisible({timeout:30000});
 await page.evaluate(value=>(window as unknown as {monaco:{editor:{getModels:()=>{setValue:(code:string)=>void}[]}}}).monaco.editor.getModels()[0].setValue(value),value);
}
test.beforeEach(async({page})=>{
 // Only preceding-day activity is a synthetic fixture for the existing sequence gate.
 await page.addInitScript(()=>{
  if(window.top!==window.self||localStorage.getItem('react-mentor-learning-v2'))return;
  const previous=Math.max(0,Number(new URL(location.href).searchParams.get('day')??1)-1);
  const ids=Array.from({length:previous},(_,i)=>'backend-day-'+String(i+1).padStart(2,'0'));
  localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{language:'ru',contentLanguage:'ru',courses:{backend:{dailySets:{},studied:[],answers:{},reviews:{},awards:{},completedTopics:ids,completedPractice:ids,confirmedDays:Array.from({length:previous},(_,i)=>String(i+1)),drafts:{},masteredQuestions:[],notes:[],draftClock:{},noteClock:{},deletedNotes:{},reviewClock:{},studySeconds:{}}}}}));
 });
});
test('Backend executes actual function tests, catches wrong results and timeout, recovers and preserves drafts without granting mastery',async({page})=>{
 test.setTimeout(90000);await page.goto('/practice?course=backend&day=3');
 const panel=page.locator('.function-practice'),run=panel.getByRole('button',{name:'Выполнить тесты функции'});
 await expect(panel).toContainText('серверная аттестация и Mastered не начисляются');
 await run.click();await expect(panel.getByRole('status')).toContainText('Есть ошибки',{timeout:30000});
 const solution=course.lessons[2].practice!.solution;
 await code(page,solution);await expect(panel.getByRole('status')).toHaveCount(0);await run.click();
 await expect(panel.getByRole('status')).toContainText('Локальные тесты пройдены');await expect(panel.locator('li')).toHaveCount(7);
 await code(page,'function isValidQuantity(value) { return true; }');await run.click();await expect(panel.getByRole('status')).toContainText('Есть ошибки');
 await expect(panel.locator('li.warning-text')).not.toHaveCount(0);
 await code(page,'function isValidQuantity(value) { while (true) {} }');await run.click();
 await expect(panel.getByRole('alert')).toContainText('3 секунды',{timeout:12000});
 await code(page,solution);await run.click();await expect(panel.getByRole('status')).toContainText('Локальные тесты пройдены');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.backend);
 expect(stored.drafts['backend-day-03']).toBe(solution);expect(stored.verifiedPractice??[]).not.toContain('backend-day-03');expect(stored.completedPractice).not.toContain('backend-day-03');
 await page.reload();await expect(page.locator('.monaco-editor')).toBeVisible({timeout:30000});
 expect(await page.evaluate(()=>(window as unknown as {monaco:{editor:{getModels:()=>{getValue:()=>string}[]}}}).monaco.editor.getModels()[0].getValue())).toBe(solution);
 await page.setViewportSize({width:320,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Backend flow has keyboard-controlled code traces, local-only assessment copy and the actual ZIP download',async({page,request})=>{
 await page.goto('/courses/backend/home?day=4');
 await expect(page.getByRole('navigation',{name:'Учебный маршрут'}).getByRole('link')).toHaveCount(8);
 const trace=page.locator('.code-trace');await expect(trace).toContainText('не выполнение вашего кода');
 await expect(trace.locator('[aria-current=step]')).toContainText('const quantity = 3');
 await trace.getByRole('button',{name:'Следующий шаг'}).focus();await page.keyboard.press('Enter');
 await expect(trace.locator('[aria-current=step]')).toContainText('const subtotalCents');await expect(trace).toContainText('subtotalCents=750');
 await trace.getByRole('button',{name:'Следующий шаг'}).click();await expect(trace).toContainText('totalCents=850');
 await expect(trace.getByRole('button',{name:'Следующий шаг'})).toBeDisabled();
 await expect(page.locator('#backend-day-04-flow-master')).toContainText('Серверной аттестации Backend пока нет');
 await page.setViewportSize({width:320,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('navigation',{name:'Учебный маршрут'}).getByRole('link').nth(5).click();
 await expect(page).toHaveURL(/\/tests\?course=backend&day=4/);
 await expect(page.locator('.course-question')).toHaveCount(10);
 const question=page.locator('.course-question').first(),first=course.lessons[3].questions[0];
 await question.getByRole('radio').nth(1-first.correctIndex).check();await question.getByRole('button',{name:'Проверить',exact:true}).click();
 await expect(question.locator('.question-feedback')).toContainText(first.hint.ru);
 await expect(question.locator('.question-feedback a')).toHaveAttribute('href',/backend-day-04-section-/);
 await question.getByRole('radio').nth(first.correctIndex).check();await question.getByRole('button',{name:'Проверить',exact:true}).click();
 await expect(question.getByRole('status')).not.toContainText('Неверно');
 await expect(question).toContainText(first.answer.ru);
 await page.goto('/courses/backend/plan');const download=page.getByRole('link',{name:/Backend local Node.js laboratory/});
 await expect(download).toHaveAttribute('href',course.files[0].url);
 const response=await request.get(course.files[0].url);expect(response.status()).toBe(200);expect((await response.body()).length).toBe(course.files[0].bytes);
});
