import {test,expect,type Page} from '@playwright/test';
import sql from '../src/content/courses/sql.json';
const solution=sql.lessons[0].practice!.solution;
async function code(page:Page,value:string){
 await expect(page.locator('.monaco-editor')).toBeVisible({timeout:30000});
 await page.evaluate(value=>(window as unknown as {monaco:{editor:{getModels:()=>{setValue:(code:string)=>void}[]}}}).monaco.editor.getModels()[0].setValue(value),value);
}
test('real SQLite grades changed fixtures and recovers after terminating an infinite query',async({page})=>{
 test.setTimeout(90000);
 await page.addInitScript(()=>{if(window.top===window.self)localStorage.setItem('react-mentor-learning-v2',JSON.stringify({version:2,state:{language:'ru',contentLanguage:'ru'}}));});
 await page.goto('/practice?course=sql&day=1');
 const panel=page.locator('.sqlite-practice'),run=panel.getByRole('button',{name:'Запустить и проверить SQL'});
 await code(page,solution);await run.click();
 await expect(panel.getByRole('status')).toContainText('SQL пройден локально',{timeout:30000});
 await expect(panel.locator('li')).toHaveCount(7);
 await code(page,solution.replace('SELECT name, price * 3 AS total FROM products WHERE id = 1;',"SELECT 'Tea', 36;"));
 await expect(panel.locator('.sqlite-result')).toHaveCount(0);await run.click();
 await expect(panel.getByRole('status')).toContainText('Исправьте SQL');
 await expect(panel.locator('li.warning-text')).not.toHaveCount(0);
 await code(page,'WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n) SELECT sum(x) FROM n;');
 await run.click();await expect(panel.getByRole('alert')).toContainText('5 секунд',{timeout:15000});
 await code(page,solution);await run.click();
 await expect(panel.getByRole('status')).toContainText('SQL пройден локально');
 await page.setViewportSize({width:320,height:740});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
