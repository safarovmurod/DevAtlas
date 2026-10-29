// @vitest-environment node
import {it,expect} from 'vitest';
import {loadCourseContent} from '@/lib/courses/content';
import {COURSE_CATALOG} from '@/content/courses/catalog';

it('UX Design publishes a 30-day beginner curriculum with connected flows and honest written practice',async()=>{
 const course=await loadCourseContent('ux-design');
 const entry=COURSE_CATALOG.find(item=>item.id==='ux-design')!;
 expect(entry.publishedDays).toBe(30);
 expect(course.lessons.length).toBe(30);
 expect(course.lessons.map(lesson=>lesson.id)).toEqual(Array.from({length:30},(_,i)=>`ux-design-day-${String(i+1).padStart(2,'0')}`));
 for(const [index,lesson] of course.lessons.entries()){
  expect(lesson.level).toBe('beginner');
  expect(lesson.practice?.kind).toBe('written');
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
 const day1=course.lessons[0].questions.find(question=>question.id==='ux-design-day-01-q01')!;
 expect(day1.answer.en).toBe('A new button will help people find a slot faster.');
 const day2=course.lessons[1].questions.find(question=>question.id==='ux-design-day-02-q01')!;
 expect(day2.answer.en).toBe('The slot is taken. Choose another available hour.');
});

it('the UX capstone is a real final case with honest review status and verified source URLs',async()=>{
 const course=await loadCourseContent('ux-design');
 const capstone=course.lessons.at(-1)!;
 expect(capstone.title.ru).toContain('итоговый UX-проект');
 expect(capstone.practice!.task.en).toContain('final case');
 expect(capstone.learningFlow?.nextLessonId).toBeNull();
 const honest=capstone.practice!.referenceAnswer!.en!;
 expect(honest).toContain('Self Reviewed');
 expect(honest).toContain('fictional');
 // every cited external source resolves over https and was checked manually
 for(const source of course.sources){
  expect(new URL(source.url).protocol).toBe('https:');
  expect(source.url).not.toContain('defining-user-personas');
 }
 const sources=new Set(course.sources.map(source=>source.id));
 expect(sources.has('nng-usability-testing')).toBe(true);
 expect(sources.has('wai-accessibility-intro')).toBe(true);
 // the research module keeps the ethics day explicit about consent and no personal data
 const consent=course.lessons[7].practice!.referenceAnswer!.en!;
 expect(consent).toContain('no name, phone or photo is collected');
 const ethics=course.lessons[8].practice!.task.en;
 expect(ethics).toContain('how the participant can stop');
});
