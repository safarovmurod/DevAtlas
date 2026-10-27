// @vitest-environment node
import {it,expect} from 'vitest';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createContext,runInContext} from 'node:vm';
import {loadCourseContent} from '@/lib/courses/content';
import {COURSE_CATALOG} from '@/content/courses/catalog';

it('Backend publishes only authored days with complete translations, connected flows, unique checks and honest local evidence',async()=>{
 const course=await loadCourseContent('backend');const entry=COURSE_CATALOG.find(item=>item.id==='backend')!;
 expect(entry.publishedDays).toBe(44);expect(course.lessons.length).toBe(44);expect(entry.prerequisite).toBeNull();
 expect(course.lessons.map(lesson=>lesson.id)).toEqual(Array.from({length:course.lessons.length},(_,i)=>`backend-day-${String(i+1).padStart(2,'0')}`));
 const checkText=(value:unknown):void=>{
  if(Array.isArray(value)){value.forEach(checkText);return;}
  if(value&&typeof value==='object'){
   const row=value as Record<string,unknown>;
   if('ru' in row&&'tg' in row)for(const locale of ['ru','tg','en'])expect(row[locale]).toEqual(expect.any(String));
   Object.values(row).forEach(checkText);
  }
 };
 checkText(course);
 for(const [index,lesson] of course.lessons.entries()){
  expect(lesson.questions.length).toBeGreaterThanOrEqual(5);
  expect(new Set(lesson.questions.map(question=>question.question.en)).size).toBe(lesson.questions.length);
  expect(lesson.learningFlow?.nextLessonId).toBe(course.lessons[index+1]?.id??null);
  expect(lesson.learningFlow?.assessmentMode).toBe('local-only');
  for(const section of lesson.sections)expect(new Set(Object.values(section.body)).size).toBe(3);
  for(const section of lesson.sections)for(const language of ['ru','tg','en'] as const)expect(section.body[language]!.length).toBeGreaterThan(120);
 }
 const book=JSON.parse(await readFile('content/backend-lab/exercise-cases.json','utf8'));
 for(const lesson of course.lessons.slice(9)){
  const number=String(lesson.day).padStart(2,'0');
  expect(lesson.prerequisiteDays).toEqual([lesson.day!-1]);
  expect(lesson.sections[1].code).toBe((await readFile(`content/backend-lab/examples/day-${number}.mjs`,'utf8')).replaceAll('\r\n','\n'));
  for(const language of ['ru','tg','en'] as const)expect(lesson.sections[1].output?.[language]).toBe(book[lesson.day!].expectedOutput);
  if(lesson.day!<40)expect(lesson.practice?.solution).toBe((await readFile(`content/backend-lab/solutions/day-${number}.mjs`,'utf8')).replaceAll('\r\n','\n'));
  else expect(lesson.practice?.task.en).toContain(`node check-project.mjs project --phase ${lesson.day}`);
 }
 // Keep the two historical quiz IDs attached to their original concepts.
 expect(course.lessons[0].questions.find(q=>q.id==='backend-day-01-q')?.answer.en).toContain('404');
 expect(course.lessons[1].questions.find(q=>q.id==='backend-day-02-q')?.question.en).toContain('browser');
 for(const lesson of course.lessons.slice(0,2)){const q=lesson.questions.find(q=>q.id===lesson.id+'-q')!;expect(q.correctIndex).toBe(1);expect(q.options[1].en).toBe(lesson.day===1?'404':'No');}
});

it('all authored browser-function solutions execute against every declared case and retain input data',async()=>{
 const course=await loadCourseContent('backend');let cases=0;
 for(const lesson of course.lessons){
  const execution=lesson.practice?.execution;if(!execution)continue;
  // Trusted repository-authored reference only. Learner code never runs in this Node process.
  const source=lesson.practice!.solution.replace(/\bexport /g,'');const context=createContext({URL,TextEncoder});
  const fn=runInContext(source+';'+execution.functionName,context,{timeout:1000}) as (...args:unknown[])=>unknown;
  for(const test of execution.tests){
   const args=structuredClone(test.args),before=JSON.stringify(args);
   expect(JSON.stringify(await fn(...args))).toBe(JSON.stringify(test.expected));expect(JSON.stringify(args)).toBe(before);cases++;
  }
 }
 expect(cases).toBeGreaterThanOrEqual(30);
});

it('trusted course examples run in real Node and the starter tests fail before implementation, pass for actual authored solutions',async()=>{
 const course=await loadCourseContent('backend');const folder=await mkdtemp(path.join(tmpdir(),'Backend тоҷикӣ '));
 try{
  await writeFile(path.join(folder,'capacity.mjs'),'export function remainingCapacity(limit,used){return limit-used;}');
  const first=course.lessons[0].sections.find(section=>section.code)!.code!;
  const httpFile=path.join(folder,'http-example.mjs');
  await writeFile(httpFile,first.replace("server.listen(3001, '127.0.0.1');","server.listen(0, '127.0.0.1');")+`
await new Promise(resolve=>server.once('listening',resolve));
const base='http://127.0.0.1:'+server.address().port;
try {
 const good=await fetch(base+'/health');if(good.status!==200||(await good.json()).status!=='ok')throw new Error('health failed');
 if((await fetch(base+'/missing')).status!==404)throw new Error('missing failed');
 if((await fetch(base+'/health',{method:'POST'})).status!==404)throw new Error('method failed');
} finally {server.close();server.closeAllConnections();}
`);
  const http=spawnSync(process.execPath,[httpFile],{encoding:'utf8',timeout:10000});expect(http.status,http.stderr).toBe(0);
  for(const lesson of course.lessons.filter(lesson=>lesson.day!==1&&lesson.day!<=9)){
   for(const [index,section] of lesson.sections.entries()){
    if(!section.code)continue;
    const filename=path.join(folder,`day-${lesson.day}-${index}.mjs`);
    if(lesson.day===2)await writeFile(path.join(folder,'validation.mjs'),lesson.practice!.solution);
    await writeFile(filename,section.code);
    const result=spawnSync(process.execPath,[filename],{encoding:'utf8',timeout:5000});
    expect(result.status,`day ${lesson.day}: ${result.stderr}`).toBe(0);
    if(section.output?.en){const lines=section.output.en.split('; ').join('\n');expect(result.stdout.trim().replaceAll("'",'"').replaceAll(' ', '')).toContain(lines.replaceAll(' ',''));}
   }
  }
  const starter=await readFile('content/backend-lab/starter/functions.mjs','utf8');
  await writeFile(path.join(folder,'functions.mjs'),starter);
  await writeFile(path.join(folder,'functions.test.mjs'),await readFile('content/backend-lab/starter/functions.test.mjs'));
  const red=spawnSync(process.execPath,['--test',path.join(folder,'functions.test.mjs')],{encoding:'utf8',timeout:10000});
  expect(red.status).toBe(1);expect(red.stdout).toMatch(/fail 6/);
  const solutions=course.lessons.filter(lesson=>[3,4,5,6,7,9].includes(lesson.day!)).map(lesson=>lesson.practice!.solution.replace(/^function /,'export function ').replace(/^async function /,'export async function '));
  await writeFile(path.join(folder,'functions.mjs'),solutions.join('\n'));
  const green=spawnSync(process.execPath,['--test',path.join(folder,'functions.test.mjs')],{encoding:'utf8',timeout:10000});
  expect(green.status,green.stdout+green.stderr).toBe(0);expect(green.stdout).toMatch(/pass 6/);
 }finally{await rm(folder,{recursive:true,force:true});}
},30000);
