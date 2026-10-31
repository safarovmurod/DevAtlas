// @vitest-environment node
import {it,expect} from 'vitest';
import {loadCourseContent} from '@/lib/courses/content';
import {COURSE_CATALOG} from '@/content/courses/catalog';

it('Communication publishes a 30-day beginner curriculum with connected flows and honest practice',async()=>{
 const course=await loadCourseContent('communication');
 const entry=COURSE_CATALOG.find(item=>item.id==='communication')!;
 expect(entry.publishedDays).toBe(30);
 expect(entry.introductoryDays).toBeUndefined();
 expect(entry.runtime).toBeUndefined();
 expect(course.lessons.length).toBe(30);
 expect(course.lessons.map(lesson=>lesson.id)).toEqual(Array.from({length:30},(_,i)=>`communication-day-${String(i+1).padStart(2,'0')}`));
 for(const [index,lesson] of course.lessons.entries()){
  expect(lesson.level).toBe('beginner');
  expect(lesson.practice!.kind).toBe('written');
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
 const day1=course.lessons[0].questions.find(question=>question.id==='communication-day-01-q01')!;
 expect(day1.answer.en).toBe('A specific action and deadline.');
 const day2=course.lessons[1].questions.find(question=>question.id==='communication-day-02-q01')!;
 expect(day2.answer.en).toBe('Two rows have no time listed.');
 // The original written rubric survives the upgrade (day 1 carried one; day 2 did not).
 expect(course.lessons[0].practice!.rubric).toBeDefined();
});

it('the course keeps one canonical club scenario and honest statuses through all 30 days',async()=>{
 const course=await loadCourseContent('communication');
 // The canonical through-numbers recur: Friday 19:00, the Anya/Mark names, the 4/10-style pairs.
 const text=JSON.stringify(course.lessons.map(lesson=>lesson.sections.map(section=>section.body.ru).join(' ')));
 expect(text).toContain('пятница 19:00');
 expect(text).toContain('Аня');
 // Day 30 legitimately ends the course.
 const capstone=course.lessons.at(-1)!;
 expect(capstone.learningFlow?.nextLessonId).toBeNull();
 expect(capstone.title.ru).toContain('итог');
 const report=capstone.practice!.referenceAnswer!.en!;
 expect(report).toContain('weak spots');
 // No personality labels in any answer: "always" accusations are absent from reference answers.
 const answers=JSON.stringify(course.lessons.filter(lesson=>lesson.practice!.referenceAnswer).map(lesson=>lesson.practice!.referenceAnswer!.ru));
 expect(answers).not.toContain('Вы всегда');
});
