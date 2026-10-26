// @vitest-environment node
import {beforeAll,it,expect} from 'vitest';
import initSqlJs,{type SqlJsStatic} from 'sql.js';
import path from 'node:path';
import sql from '@/content/courses/sql.json';
import {gradeFirstSqlLesson} from '@/lib/practice/sqlite-grader';
let SQL:SqlJsStatic;
const solution=sql.lessons[0].practice!.solution;
beforeAll(async()=>{SQL=await initSqlJs({locateFile:()=>path.resolve('node_modules/sql.js/dist/sql-wasm.wasm')});},30000);
it('executes real SQLite and accepts equivalent query expressions and aliases',()=>{
 for(const code of [solution,solution.replace('price * 3 AS total','price + price + price AS cost'),solution.replace(/\b(id|name|price)\b/g,word=>word.toUpperCase())]){
  const result=gradeFirstSqlLesson(SQL,code);expect(result.error).toBeUndefined();expect(result.passed).toBe(true);expect(result.checks).toHaveLength(7);expect(result.engineVersion).toMatch(/^3\./);
 }
});
it('rejects memorized output and checks changed data and missing predicates',()=>{
 const hardcoded=solution.replace('SELECT name, price * 3 AS total FROM products WHERE id = 1;',"SELECT 'Tea', 36;");
 expect(gradeFirstSqlLesson(SQL,hardcoded)).toMatchObject({passed:false,checks:expect.arrayContaining([expect.objectContaining({id:'changed-data',passed:false})])});
 expect(gradeFirstSqlLesson(SQL,solution.replace('WHERE id = 1',''))).toMatchObject({passed:false,checks:expect.arrayContaining([expect.objectContaining({id:'missing-id',passed:false})])});
});
it('checks actual constraints rather than recognizing keywords in a comment',()=>{
 const code=solution.replace('CHECK (price >= 0)','').replace('name TEXT NOT NULL','name TEXT');
 const result=gradeFirstSqlLesson(SQL,code+' -- CHECK (price >= 0) NOT NULL');
 expect(result.passed).toBe(false);
 expect(result.checks).toEqual(expect.arrayContaining([expect.objectContaining({id:'negative-price',passed:false}),expect.objectContaining({id:'null-name',passed:false})]));
});
it('keeps attempts isolated and reports real syntax and size errors',()=>{
 expect(gradeFirstSqlLesson(SQL,solution).passed).toBe(true);expect(gradeFirstSqlLesson(SQL,solution).passed).toBe(true);
 expect(gradeFirstSqlLesson(SQL,'SELECT * FROM products')).toMatchObject({passed:false,error:expect.stringContaining('no such table')});
 expect(gradeFirstSqlLesson(SQL,'not sql')).toMatchObject({passed:false,error:expect.any(String)});
 expect(gradeFirstSqlLesson(SQL,' '.repeat(32769))).toMatchObject({passed:false,error:expect.stringContaining('32768')});
 expect(gradeFirstSqlLesson(SQL,'--'+'қ'.repeat(20000))).toMatchObject({passed:false,error:expect.stringContaining('32768')});
 expect(gradeFirstSqlLesson(SQL,"WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<9) SELECT printf('%.*c',2000,'x') FROM n")).toMatchObject({passed:false,error:expect.stringContaining('16 KiB')});
});
