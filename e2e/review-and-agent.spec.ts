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
 await page.reload();await expect(page.locator('.course-question')).toHaveCount(0);await expect(page.getByText('Пока нет тем')).toBeVisible();
 await page.goto('/courses/html/weak-topics');await expect(page).toHaveURL('/courses/html/revision');await expect(page.getByRole('heading',{name:'Повторение',exact:true})).toBeVisible();
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
test('the voice assistant has no text chat, removes the guest text chat only and closes with Escape',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.addInitScript(()=>{
  if(window.top!==window.self||localStorage.getItem('react-mentor-learning-v2'))return;
  localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{language:'en',contentLanguage:'en',selectedCourse:'html',courseChosen:true}}));
  localStorage.setItem('devatlas-agent-chat-v1',JSON.stringify([{id:'old',sender:'user',text:'Unowned legacy conversation'}]));
  localStorage.setItem('devatlas-agent-chat-v2:guest',JSON.stringify([{id:'guest',sender:'user',text:'Old guest chat'}]));
  localStorage.setItem('devatlas-agent-chat-v2:account:other',JSON.stringify([{id:'other',sender:'user',text:'Other account chat'}]));
 });
 await page.goto('/courses/html/plan');await expect(page).toHaveTitle(/DevAtlas/);
 const bubble=page.getByRole('button',{name:'DevAtlas assistant',exact:true});await bubble.click();
 const panel=page.getByRole('dialog',{name:'DevAtlas assistant',exact:true});await expect(panel).toBeVisible();
 // Voice only: no message box, no Send button, no chat history.
 await expect(panel.getByRole('textbox')).toHaveCount(0);await expect(panel.getByRole('button',{name:'Send',exact:true})).toHaveCount(0);
 if(process.env.PLAYWRIGHT_PROD_SERVER==='true'){
  await expect(panel.getByRole('link',{name:'Ultra',exact:true})).toBeVisible();
 }else{
  await expect(panel.getByRole('button',{name:'Speak',exact:true}).or(panel.getByRole('button',{name:'Open AI Tutor',exact:true}))).toBeVisible();
 }
 await expect(page.getByText('Old guest chat')).toHaveCount(0);await expect(page.getByText('Unowned legacy conversation')).toHaveCount(0);
 // Only the guest's own old text chat is removed. Other accounts and the unowned v1 chat stay untouched.
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('devatlas-agent-chat-v2:guest'))).toBeNull();
 expect(await page.evaluate(()=>localStorage.getItem('devatlas-agent-chat-v1'))).toContain('Unowned legacy conversation');
 expect(await page.evaluate(()=>localStorage.getItem('devatlas-agent-chat-v2:account:other'))).toContain('Other account chat');
 await page.setViewportSize({width:320,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 // On a phone the panel stays above the assistant button.
 const box={panel:await panel.boundingBox(),bubble:await bubble.boundingBox()};
 expect(box.panel!.y+box.panel!.height).toBeLessThanOrEqual(box.bubble!.y);
 await page.screenshot({path:testInfo.outputPath('agent-320px.png')});
 await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(bubble).toBeFocused();
 expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');expect(errors).toEqual([]);
});
