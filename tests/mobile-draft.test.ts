// @vitest-environment node
import {it,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import {courseContentSchema} from '@/lib/courses/schema';

// The published Mobile course must stay identical to its authoring drafts,
// keep the historical quiz identities from the original two-day module and
// match the verified Expo example and solution files.
it('Mobile publishes thirty-seven days that match the drafts, preserve quiz identities and connect the learning flow',async()=>{
 const course=JSON.parse(await readFile('src/content/courses/mobile.json','utf8'));
 const drafts=await Promise.all(Array.from({length:37},(_,index)=>index+1).map(async day=>JSON.parse(await readFile(`content/mobile-lab/drafts/day-${String(day).padStart(2,'0')}.json`,'utf8'))));
 const parsed=courseContentSchema.parse(course);
 expect(parsed.lessons.map((lesson:{id:string})=>lesson.id)).toEqual(drafts.map(draft=>draft.id));
 for(const [index,lesson] of parsed.lessons.entries()){
  const day=index+1;expect(lesson.id).toBe(`mobile-day-${String(day).padStart(2,'0')}`);
  expect(lesson.prerequisiteDays).toEqual(day===1?[]:[day-1]);
  expect(lesson).toEqual(drafts[index]);
  expect(lesson.questions).toHaveLength(5);expect(new Set(lesson.questions.map(question=>question.question.en)).size).toBe(5);expect(lesson.learningFlow?.assessmentMode).toBe('local-only');
  expect(lesson.learningFlow?.nextLessonId).toBe(day<37?`mobile-day-${String(day+1).padStart(2,'0')}`:null);
  if(day<=2){const original=course.lessons[index].questions[0];expect(original.correctIndex).toBe(day===1?0:1);expect(original.options.map((option:{en:string})=>option.en)).toEqual(day===1?['Text','div']:['The result of setCount(0)','() => setCount(0)']);}
  // Quiz quality: per-question hints and correct answers spread over the options.
  expect(new Set(lesson.questions.map(question=>question.hint?.en)).size).toBe(5);
  expect(new Set(lesson.questions.map(question=>question.correctIndex)).size).toBeGreaterThan(1);
  const example=await readFile(`content/mobile-lab/examples/day-${String(day).padStart(2,'0')}.tsx.txt`,'utf8');
  expect(lesson.sections.find(section=>section.code)?.code?.trim()).toBe(example.replaceAll('\r\n','\n').trim());
  const solution=await readFile(`content/mobile-lab/solutions/day-${String(day).padStart(2,'0')}.tsx.txt`,'utf8');
  expect(lesson.practice?.solution.trim()).toBe(solution.replaceAll('\r\n','\n').trim());
 }
});
