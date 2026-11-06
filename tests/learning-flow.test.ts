// @vitest-environment node
import {it,expect} from 'vitest';
import html from '@/content/courses/html.json';
import {courseContentSchema} from '@/lib/courses/schema';
import {LEARNING_FLOW_STAGES,learningFlowSchema} from '@/lib/courses/learning-flow';
import bank from '@/content/assessments/html-first-page';
import {COURSE_CATALOG} from '@/content/courses/catalog';
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

it('requires matching server assessment or an explicit local-only flow that cannot claim attestation',async()=>{
 for(const id of COURSE_IDS){
  if(id==='react')continue;
  const course=await loadCourseContent(id);
  for(const lesson of course.lessons){
   if(!lesson.learningFlow)continue;
   const assessment=await loadAssessmentBank(id,lesson.id);
   if(lesson.learningFlow.assessmentMode==='local-only'){
    expect(assessment).toBeNull();
    expect(lesson.questions.length).toBeGreaterThanOrEqual(5);
    expect(lesson.practice).toBeDefined();
    // Code courses trace real code; document courses render a real practice
    // document with no code sections. Both stay local simulations: neither
    // fakes execution output and neither claims server attestation.
    if(lesson.learningFlow.demo.kind==='html-document'){
     // Document courses declare no runtime: written practice runs on paper,
     // and the demo renders a real practice document, not execution output.
     expect(lesson.practice!.kind).toBe('written');
     expect(lesson.sections.some(section=>section.code!==undefined)).toBe(false);
     expect(COURSE_CATALOG.find(course=>course.id===id)?.runtime).toBeUndefined();
    }else{
     // Code-trace demos trace locally authored code; where that code executes
     // is governed by the catalog runtime and the taxonomy test, not here.
     expect(lesson.learningFlow.demo.kind).toBe('code-trace');
    }
    continue;
   }
   expect(assessment,`${id}/${lesson.id} assessment`).not.toBeNull();
   expect(assessment!.version).toBe(lesson.learningFlow.assessmentVersion);
   for(const source of assessment!.sourceIds)expect(lesson.sourceIds).toContain(source);
  }
 }
},30000);

it('allows an explicit course ending only at the last scheduled day and rejects loops/skips',()=>{
 const course=courseContentSchema.parse(html),flow=course.lessons[0].learningFlow!;
 const last=course.lessons.filter(item=>item.day!==undefined).sort((a,b)=>a.day!-b.day!).at(-1)!;
 // An authored terminal flow must still provide every learning activity and translation.
 Object.assign(last,{...structuredClone(course.lessons[0]),id:last.id,day:last.day,questions:course.lessons[0].questions.map(question=>({...question,id:question.id+'-terminal'})),learningFlow:{...flow,nextLessonId:null}});
 expect(courseContentSchema.safeParse(course).success).toBe(true);
 course.lessons[0].learningFlow={...flow,nextLessonId:null};
 expect(courseContentSchema.safeParse(course).success).toBe(false);
 for(const nextLessonId of [course.lessons[0].id,last.id]){
  course.lessons[0].learningFlow={...flow,nextLessonId};
  expect(courseContentSchema.safeParse(course).success).toBe(false);
 }
});
