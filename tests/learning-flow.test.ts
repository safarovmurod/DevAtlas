// @vitest-environment node
import {it,expect} from 'vitest';
import html from '@/content/courses/html.json';
import {courseContentSchema} from '@/lib/courses/schema';
import {LEARNING_FLOW_STAGES,learningFlowSchema} from '@/lib/courses/learning-flow';
import bank from '@/content/assessments/html-first-page';
import {COURSE_IDS} from '@/lib/courses/ids';
import {loadCourseContent} from '@/lib/courses/content';
import {loadAssessmentBank} from '@/lib/practice/assessment-banks';

it('validates the pilot flow against actual theory, practice and assessment',()=>{
 const course=courseContentSchema.parse(html),lesson=course.lessons[0],flow=lesson.learningFlow!;
 expect(flow.walkthroughSections).toEqual(lesson.sections.map((_,index)=>index));
 expect(flow.assessmentVersion).toBe(bank.version);expect(lesson.id).toBe(bank.lessonId);
 expect(course.lessons.find(next=>next.id===flow.nextLessonId)?.day).toBe(2);
 expect(LEARNING_FLOW_STAGES).toEqual(['learn','understand','watch','try','practice','test','review','master']);
 const legacy=structuredClone(course);delete legacy.lessons[0].learningFlow;
 expect(courseContentSchema.safeParse(legacy).success).toBe(true);
});
it('rejects missing translations, dangling references and impossible predictions',()=>{
 const course=courseContentSchema.parse(html),flow=course.lessons[0].learningFlow!;
 expect(learningFlowSchema.safeParse({...flow,objectives:[{ru:'Only Russian'},{ru:'Another'}]}).success).toBe(false);
 expect(learningFlowSchema.safeParse({...flow,prediction:{...flow.prediction,correctIndex:10}}).success).toBe(false);
 const broken=structuredClone(course);broken.lessons[0].learningFlow!.walkthroughSections=[99];
 expect(courseContentSchema.safeParse(broken).success).toBe(false);
 broken.lessons[0].learningFlow!.walkthroughSections=[0];broken.lessons[0].learningFlow!.nextLessonId='missing';
 expect(courseContentSchema.safeParse(broken).success).toBe(false);
 broken.lessons[0].learningFlow!.nextLessonId=flow.nextLessonId;delete broken.lessons[0].practice;
 expect(courseContentSchema.safeParse(broken).success).toBe(false);
});

it('requires an available matching server assessment for every published interactive flow',async()=>{
 for(const id of COURSE_IDS){
  if(id==='react')continue;
  const course=await loadCourseContent(id);
  for(const lesson of course.lessons){
   if(!lesson.learningFlow)continue;
   const assessment=await loadAssessmentBank(id,lesson.id);
   expect(assessment,`${id}/${lesson.id} assessment`).not.toBeNull();
   expect(assessment!.version).toBe(lesson.learningFlow.assessmentVersion);
   for(const source of assessment!.sourceIds)expect(lesson.sourceIds).toContain(source);
  }
 }
});
