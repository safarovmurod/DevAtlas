import {test,expect} from '@playwright/test';
test('written rubric persists honest self review and invalidates it after answer edits',async({page})=>{
 await page.addInitScript(()=>{if(window.top===window.self&&!localStorage.getItem('react-mentor-learning-v2'))localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{language:'ru',contentLanguage:'ru'}}));});
 await page.goto('/practice?course=communication&day=1');
 const answer='Для учебного расписания нужна таблица с днями и временем. Пришлите её, пожалуйста, до пятницы 15:00 по вашему местному времени. Если срок неудобен, предложите другой. Что стоит уточнить?';
 await page.locator('.written-practice textarea').fill(answer);
 const panel=page.locator('.written-rubric-review');
 await expect(panel.locator('fieldset')).toHaveCount(3);
 for(const field of await panel.locator('fieldset').all())await field.getByRole('radio').last().check();
 const reflection='В моём ответе названы таблица и её содержание, указан срок, предложена возможность уточнения без обвинений.';
 await panel.getByRole('textbox').fill(reflection);
 await panel.getByRole('button',{name:'Сохранить Self Reviewed и продолжить'}).click();
 await expect(panel.getByRole('status')).toContainText('Self Reviewed');
 await expect(panel.getByRole('status')).toContainText('100%');
 const record=await page.evaluate(()=>{
  const progress=JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.communication;
  return {review:JSON.parse(progress.drafts['written-review-v1:communication-day-01']),practice:progress.completedPractice,award:progress.awards['practice:communication-day-01']};
 });
 expect(record.review.method).toBe('Self Reviewed');expect(record.review.verified).toBeUndefined();expect(record.practice).toContain('communication-day-01');expect(record.award).toBe(4);
 await page.reload();await expect(panel.getByRole('textbox')).toHaveValue(reflection);await expect(panel.getByRole('status')).toContainText('100%');
 await page.locator('.written-practice textarea').fill(answer+' Новая редакция.');
 await expect(panel.locator('.written-review-result')).toHaveCount(0);await expect(panel).toContainText('другому черновику');
 await page.setViewportSize({width:320,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
