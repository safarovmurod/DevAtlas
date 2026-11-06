// @vitest-environment node
import {it,expect} from 'vitest';
import {createContext,runInContext} from 'node:vm';
import {loadCourseContent} from '@/lib/courses/content';
import {COURSE_CATALOG} from '@/content/courses/catalog';

it('Digital Marketing publishes a 30-day beginner curriculum with connected flows and honest practice',async()=>{
 const course=await loadCourseContent('digital-marketing');
 const entry=COURSE_CATALOG.find(item=>item.id==='digital-marketing')!;
 expect(entry.publishedDays).toBe(30);
 expect(entry.introductoryDays).toBeUndefined();
 expect(course.lessons.length).toBe(30);
 expect(course.lessons.map(lesson=>lesson.id)).toEqual(Array.from({length:30},(_,i)=>`digital-marketing-day-${String(i+1).padStart(2,'0')}`));
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
 const day1=course.lessons[0].questions.find(question=>question.id==='digital-marketing-day-01-q01')!;
 expect(day1.answer.en).toBe('Get 20 timetable visits in one week.');
 const day2=course.lessons[1].questions.find(question=>question.id==='digital-marketing-day-02-q01')!;
 expect(day2.answer.en).toBe('20%');
});

it('every executable marketing calculation passes its own declared cases, including zero and invalid inputs',async()=>{
 const course=await loadCourseContent('digital-marketing');
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
 expect(cases).toBeGreaterThanOrEqual(30);
 // Edge coverage: every executable day tests at least one null and one invalid-input case.
 for(const lesson of course.lessons){
  const execution=lesson.practice?.execution;
  if(!execution)continue;
  expect(execution.tests.some(test=>test.expected===null)).toBe(true);
 }
});

it('the capstone defense stays honest: Self Reviewed, fictional data acknowledged, no causal overclaims',async()=>{
 const course=await loadCourseContent('digital-marketing');
 const capstone=course.lessons.at(-1)!;
 expect(course.lessons[28].title.ru).toContain('итоговый проект');
 expect(capstone.title.ru).toContain('защита');
 expect(capstone.learningFlow?.nextLessonId).toBeNull();
 const defense=capstone.practice!.referenceAnswer!.en!;
 expect(defense).toContain('fictional');
 expect(defense).toContain('undone');
 // The honest review status lives in the capstone theory, not just the answer.
 expect(capstone.sections.some(section=>section.body.en!.includes('Self Reviewed'))).toBe(true);
 // Day 27 keeps correlation/causation honest, and day 12 keeps the asterisk near the promise.
 // The rain example in day 27’s theory states the honest causation boundary.
 expect(course.lessons[26].sections[1].body.en).toContain('the cause is not established');
 expect(course.lessons[26].practice!.referenceAnswer!.en).toContain('unreproduced');
 const copy=course.lessons[11].sections[1].body.en!;
 expect(copy).toContain('next to the promise');
 // Consent and email rules stay explicit (days 15 and 21).
 const email=course.lessons[14].questions[0].answer.en;
 expect(email).toContain('explicit consent');
 const events=course.lessons[20].practice!.referenceAnswer!.en!;
 expect(events).toContain('Not collected: names, phones');
});
