// @vitest-environment node
import {it,expect} from 'vitest';
import {createContext,runInContext} from 'node:vm';
import {loadCourseContent} from '@/lib/courses/content';
import {COURSE_CATALOG} from '@/content/courses/catalog';

it('Data Analytics publishes a 30-day beginner curriculum with connected flows and honest practice',async()=>{
 const course=await loadCourseContent('data-analytics');
 const entry=COURSE_CATALOG.find(item=>item.id==='data-analytics')!;
 expect(entry.publishedDays).toBe(30);
 expect(entry.introductoryDays).toBeUndefined();
 expect(entry.runtime).toBeUndefined();
 expect(course.lessons.length).toBe(30);
 expect(course.lessons.map(lesson=>lesson.id)).toEqual(Array.from({length:30},(_,i)=>`data-analytics-day-${String(i+1).padStart(2,'0')}`));
 for(const [index,lesson] of course.lessons.entries()){
  expect(lesson.level).toBe('beginner');
  expect(['written','code']).toContain(lesson.practice!.kind);
  expect(lesson.questions.length).toBeGreaterThanOrEqual(5);
  expect(new Set(lesson.questions.map(question=>question.question.en)).size).toBe(lesson.questions.length);
  expect(lesson.learningFlow?.nextLessonId).toBe(course.lessons[index+1]?.id??null);
  expect(lesson.learningFlow?.assessmentMode).toBe('local-only');
  for(const section of lesson.sections){
   expect(new Set(Object.values(section.body)).size).toBe(3);
   for(const language of ['ru','tg','en'] as const)expect(section.body[language]!.length).toBeGreaterThan(120);
  }
 }
 // The two historical introductory lessons keep their original quiz concepts.
 const day1=course.lessons[0].questions.find(question=>question.id==='data-analytics-day-01-q01')!;
 expect(day1.answer.en).toContain('unknown and an observed zero are different');
 const day2=course.lessons[1].questions.find(question=>question.id==='data-analytics-day-02-q01')!;
 expect(day2.answer.en).toBe('3');
 expect(course.lessons[1].practice!.referenceAnswer!.en).toContain('mean 30/5 = 6, median 3');
});

it('every executable statistics function passes its own declared cases, including null and invalid inputs',async()=>{
 const course=await loadCourseContent('data-analytics');
 let cases=0,codeDays=0;
 for(const lesson of course.lessons){
  const execution=lesson.practice?.execution;
  if(!execution)continue;
  codeDays++;
  // Trusted repository-authored reference only. Learner code never runs in this Node process.
  const source=lesson.practice!.solution.replace(/\bexport /g,'');
  const context=createContext({URL,TextEncoder});
  const fn=runInContext(source+';'+execution.functionName,context,{timeout:1000}) as (...args:unknown[])=>unknown;
  for(const test of execution.tests){
   const args=structuredClone(test.args),before=JSON.stringify(args);
   expect(JSON.stringify(await fn(...args))).toBe(JSON.stringify(test.expected));
   expect(JSON.stringify(args)).toBe(before);
   cases++;
  }
 }
 expect(codeDays).toBe(5);
 expect(cases).toBe(34);
 // Edge coverage: every executable day tests at least one null-expected invalid case.
 for(const lesson of course.lessons){
  const execution=lesson.practice?.execution;
  if(!execution)continue;
  expect(execution.tests.some(test=>test.expected===null)).toBe(true);
 }
});

it('SQL workflow days declare local-SQL practice and keep one reconciled canonical dataset',async()=>{
 const course=await loadCourseContent('data-analytics');
 const sqlDays=course.lessons.filter(lesson=>lesson.day!==undefined&&lesson.day>=17&&lesson.day<=21);
 expect(sqlDays.length).toBe(5);
 for(const lesson of sqlDays){
  expect(lesson.practice!.kind).toBe('code');
  expect(lesson.practice!.execution).toBeUndefined();
  expect(lesson.practice!.solution).toMatch(/\bSELECT\b/);
  expect(lesson.learningFlow?.demo.kind).toBe('code-trace');
 }
 // The canonical cafeteria dataset reconciles everywhere it is quoted: the cleaned
 // table is 11 rows, revenue 1125, days 455/210/460, categories 495/365/265.
 const text=JSON.stringify(course.lessons.map(lesson=>lesson.sections.map(section=>section.body.ru).join(' ')));
 expect(text).not.toContain('1130');
 expect(text).not.toContain('1045');
 const day18=course.lessons[17].sections[1].body.ru!;
 expect(day18).toContain('понедельник 4/455');
 expect(day18).toContain('вторник 2/210');
 expect(day18).toContain('среда 5/460');
 expect(day18).toContain('455+210+460 = 1125');
 const day14=course.lessons[13].practice!.solution;
 expect(day14).toContain('напитки 495, выпечка 365, другие 265');
 expect(day14).toContain('495+365+265 = 1125');
});

it('the final report stays honest: Self Reviewed status, fictional data, causation never overclaimed',async()=>{
 const course=await loadCourseContent('data-analytics');
 const capstone=course.lessons.at(-1)!;
 expect(capstone.learningFlow?.nextLessonId).toBeNull();
 expect(capstone.title.ru).toContain('итоговый отчёт');
 const report=capstone.practice!.referenceAnswer!.en!;
 expect(report).toContain('unchecked');
 // Day 26 separates correlation from causation; day 20 reports NULLs with a denominator.
 const correlation=course.lessons[25].sections[0].body.en!;
 expect(correlation).toContain('associated');
 const nulls=course.lessons[19].sections[2].body.ru!;
 expect(nulls).toContain('1125 единиц по 11 оплаченным заказам');
});
