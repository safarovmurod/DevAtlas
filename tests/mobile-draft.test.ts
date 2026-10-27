// @vitest-environment node
import {it,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import {courseContentSchema} from '@/lib/courses/schema';

it('Mobile drafts preserve existing quiz identities, connect the learning flow and match the Expo examples without changing published days',async()=>{
 const course=JSON.parse(await readFile('src/content/courses/mobile.json','utf8'));
 const drafts=await Promise.all([1,2,3,4,5,6,7,8].map(async day=>JSON.parse(await readFile(`content/mobile-lab/drafts/day-${String(day).padStart(2,'0')}.json`,'utf8'))));
 const parsed=courseContentSchema.parse({...course,lessons:drafts});
 expect(course.lessons.map((lesson:{id:string})=>lesson.id)).toEqual(['mobile-day-01','mobile-day-02']);
 for(const [index,lesson] of parsed.lessons.entries()){
  const day=index+1;expect(lesson.id).toBe(`mobile-day-${String(day).padStart(2,'0')}`);
  expect(lesson.prerequisiteDays).toEqual(day===1?[]:[day-1]);
  expect(lesson.questions).toHaveLength(5);expect(new Set(lesson.questions.map(question=>question.question.en)).size).toBe(5);expect(lesson.learningFlow?.assessmentMode).toBe('local-only');
  expect(lesson.learningFlow?.nextLessonId).toBe(day<8?`mobile-day-0${day+1}`:null);
  if(day<=2){const original=course.lessons[index].questions[0],current=lesson.questions[0];expect(current.id).toBe(original.id);expect(current.options).toEqual(original.options);expect(current.correctIndex).toBe(original.correctIndex);}
  for(const section of lesson.sections)for(const language of ['ru','tg','en'] as const)expect(section.body[language]!.length).toBeGreaterThan(100);
  const example=await readFile(`content/mobile-lab/examples/day-${String(day).padStart(2,'0')}.tsx.txt`,'utf8');
  expect(lesson.sections.find(section=>section.code)?.code?.trim()).toBe(example.replaceAll('\r\n','\n').trim());
  const solution=await readFile(`content/mobile-lab/solutions/day-${String(day).padStart(2,'0')}.tsx.txt`,'utf8');
  expect(lesson.practice?.solution.trim()).toBe(solution.replaceAll('\r\n','\n').trim());
 }
});
