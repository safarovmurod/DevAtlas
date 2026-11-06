import {test,expect} from '@playwright/test';
import html from '../src/content/courses/html.json';
import {QUIZ_QUESTIONS} from '../src/content/course';
test('imported-course review grades real choices and updates its schedule without certifying mastery',async({page},testInfo)=>{
 const lesson=html.lessons[0],question=lesson.questions[0];
 await page.addInitScript(({lessonId,questionId})=>{
  if(window.top!==window.self||localStorage.getItem('react-mentor-learning-v2'))return;
  localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{language:'ru',contentLanguage:'ru',selectedCourse:'html',courseChosen:true,courses:{html:{answers:{previous:{questionId,topicId:lessonId,mode:'test',correct:false,answer:'wrong',date:'2020-01-01'}},reviews:{[questionId]:{questionId,topicId:lessonId,repetitions:0,due:'2020-01-02'}}}}}}));
 },{lessonId:lesson.id,questionId:question.id});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.goto('/courses/html/revision');await expect(page.getByRole('heading',{name:'Повторение',exact:true})).toBeVisible();
 const panel=page.locator('.course-question');await expect(panel).toHaveCount(1);
 await panel.getByRole('radio').nth(question.correctIndex).check();await panel.getByRole('button',{name:'Проверить',exact:true}).click();
 await expect(panel.getByRole('status')).toHaveText('Верно');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.html);
 expect(saved.answers[Object.keys(saved.answers).find(key=>key.includes(':revision:'))!].correct).toBe(true);
 expect(saved.masteredQuestions).toEqual([]);expect(saved.awards[`revision:${question.id}`]).toBe(5);
 await page.reload();await expect(page.locator('.course-question')).toHaveCount(0);await expect(page.locator('.learning-review')).toContainText('Пока нет тем');
 await page.goto('/courses/html/weak-topics');await expect(page.getByRole('heading',{name:'Сложные темы',exact:true})).toBeVisible();
 await page.setViewportSize({width:320,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath('review-320px.png')});expect(errors).toEqual([]);
});
test('React review preserves both queued questions after rescheduling the first',async({page})=>{
 const questions=QUIZ_QUESTIONS.filter(question=>question.options.length&&question.month<=2).slice(0,2);
 await page.addInitScript(items=>{
  if(window.top!==window.self||localStorage.getItem('react-mentor-learning-v2'))return;
  const answers:Record<string,unknown>={},reviews:Record<string,unknown>={};
  for(const item of items){answers['previous:'+item.id]={questionId:item.id,topicId:item.topicId,mode:'test',correct:false,answer:'wrong',date:'2020-01-01'};reviews[item.id]={questionId:item.id,topicId:item.topicId,repetitions:0,due:'2020-01-02'};}
  localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{language:'ru',contentLanguage:'tg',selectedCourse:'react',courseChosen:true,answers,reviews}}));
 },questions.map(({id,topicId})=>({id,topicId})));
 await page.goto('/revision?start=1');await expect(page.getByText('Вопрос 1 / 2',{exact:true})).toBeVisible();
 for(const [index,question] of questions.entries()){
  await page.locator('.answer-option').filter({hasText:question.answer}).click();await page.getByRole('button',{name:'Проверить',exact:true}).click();
  if(index===0){await expect(page.getByText('Вопрос 1 / 2',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Следующий',exact:true}).click();await expect(page.getByText('Вопрос 2 / 2',{exact:true})).toBeVisible();}
  else await page.getByRole('button',{name:'Завершить',exact:true}).click();
 }
 await expect(page.locator('.session-complete')).toContainText('2 / 2');
});
test('agent ignores unowned legacy history and persists its actual guest reply',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.addInitScript(()=>{
  if(window.top!==window.self||localStorage.getItem('react-mentor-learning-v2'))return;
  localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{language:'en',contentLanguage:'en',selectedCourse:'html',courseChosen:true}}));
  localStorage.setItem('devatlas-agent-chat-v1',JSON.stringify([{id:'old',sender:'user',text:'Unowned legacy conversation'}]));
 });
 await page.goto('/courses/html/plan');await expect(page).toHaveTitle(/DevAtlas/);await page.getByRole('button',{name:'DevAtlas assistant',exact:true}).click();
 await expect(page.getByText('Unowned legacy conversation')).toHaveCount(0);
 const response=page.waitForResponse(response=>response.url().endsWith('/api/tutor')&&response.request().method()==='POST');
 await page.getByLabel('Ask the assistant',{exact:true}).fill('Explain the HTML document');await page.getByRole('button',{name:'Send',exact:true}).click();
 expect((await response).status()).toBe(200);await expect(page.locator('.agent-message.assistant')).toHaveCount(2);
 await expect(page.locator('.agent-message.assistant').last().locator('.agent-kind')).toHaveText('Local');
 for(const theme of ['light','dark']){
 await page.evaluate(value=>{document.documentElement.dataset.theme=value;},theme);
 const contrast=await page.locator('.agent-message.user p').evaluate(element=>{
  const rgb=(value:string)=>(value.match(/[0-9.]+/g)??[]).slice(0,3).map(Number);
  const luminance=(values:number[])=>values.map(value=>{const v=value/255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;}).reduce((n,value,index)=>n+value*[0.2126,0.7152,0.0722][index],0);
  const text=luminance(rgb(getComputedStyle(element).color)),background=luminance(rgb(getComputedStyle(element.parentElement!).backgroundColor));
  return (Math.max(text,background)+0.05)/(Math.min(text,background)+0.05);
 });expect(contrast,theme).toBeGreaterThanOrEqual(4.5);
 }
 await page.evaluate(()=>{document.documentElement.dataset.theme='light';});
 await page.reload();await page.getByRole('button',{name:'DevAtlas assistant',exact:true}).click();await expect(page.locator('.agent-message.user')).toHaveText('Explain the HTML document');
 expect(await page.evaluate(()=>localStorage.getItem('devatlas-agent-chat-v1'))).toContain('Unowned legacy conversation');
 await page.setViewportSize({width:320,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.locator('.agent-messages').evaluate(element=>element.clientHeight)).toBeGreaterThan(180);
 await expect(page.locator('.agent-panel')).toHaveAttribute('aria-modal','true');
 await page.screenshot({path:testInfo.outputPath('agent-320px.png')});
 await page.keyboard.press('Escape');await expect(page.locator('.agent-panel')).toHaveCount(0);expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');expect(errors).toEqual([]);
});
