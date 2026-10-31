// @vitest-environment node
import {it,expect} from 'vitest';
import {createContext,runInContext} from 'node:vm';
import {loadCourseContent} from '@/lib/courses/content';
import {COURSE_CATALOG} from '@/content/courses/catalog';

it('Business Foundations publishes a 30-day beginner curriculum with connected flows and honest practice',async()=>{
 const course=await loadCourseContent('business-foundations');
 const entry=COURSE_CATALOG.find(item=>item.id==='business-foundations')!;
 expect(entry.publishedDays).toBe(30);
 expect(entry.introductoryDays).toBeUndefined();
 expect(entry.runtime).toBeUndefined();
 expect(course.lessons.length).toBe(30);
 expect(course.lessons.map(lesson=>lesson.id)).toEqual(Array.from({length:30},(_,i)=>`business-foundations-day-${String(i+1).padStart(2,'0')}`));
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
 const day1=course.lessons[0].questions.find(question=>question.id==='business-foundations-day-01-q01')!;
 expect(day1.answer.en).toBe('How did you handle this task last time?');
 const day2=course.lessons[1].questions.find(question=>question.id==='business-foundations-day-02-q01')!;
 expect(day2.answer.en).toBe('150');
 expect(course.lessons[1].practice!.referenceAnswer!.en).toContain('Practice units: price 15');
});

it('every executable business calculation passes its own declared cases, including invalid inputs',async()=>{
 const course=await loadCourseContent('business-foundations');
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
 expect(codeDays).toBe(4);
 expect(cases).toBe(28);
 for(const lesson of course.lessons){
  const execution=lesson.practice?.execution;
  if(!execution)continue;
  expect(execution.tests.some(test=>test.expected===null)).toBe(true);
 }
});

it('the model keeps one canonical scenario and honest statuses through the course',async()=>{
 const course=await loadCourseContent('business-foundations');
 // The canonical numbers recur and stay consistent: margin 3.5, fixed+invisible 2.6,
 // break-even 1 sale, the 35-target plan of 13 a month, the 4/10 price pair.
 const text=JSON.stringify(course.lessons.map(lesson=>lesson.sections.map(section=>section.body.ru).join(' ')));
 expect(text).toContain('маржа 3.5');
 expect(text).not.toContain('маржа 3,4');
 const day15=course.lessons[14].sections[1].body.ru!;
 expect(day15).toContain('32.4');
 const day18=course.lessons[17].sections[1].body.ru!;
 expect(day18).toContain('11');
 const day28=course.lessons[27].sections[1].body.ru!;
 expect(day28).toContain('13');
 // The offer's honesty clause is a checkable commitment; answers never promise guarantees.
 const offer=course.lessons[10].sections[2].body.ru!;
 expect(offer).toContain('второй месяц бесплатно');
 const answers=JSON.stringify(course.lessons.filter(lesson=>lesson.practice!.referenceAnswer).map(lesson=>lesson.practice!.referenceAnswer!.ru));
 expect(answers).not.toContain('гарантированный доход');
 // The final day legitimately ends the course.
 const capstone=course.lessons.at(-1)!;
 expect(capstone.learningFlow?.nextLessonId).toBeNull();
 expect(capstone.title.ru).toContain('защита');
 const defense=capstone.practice!.referenceAnswer!.en!;
 expect(defense).toContain('untested, the plan is');
});
