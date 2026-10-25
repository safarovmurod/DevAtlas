// @vitest-environment node
import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import bank from '@/content/assessments/html-first-page';
import {assessmentBankSchema,assessmentSubmissionSchema,assessmentView,type AssessmentQuestion,type AssessmentSubmission} from '@/lib/practice/assessment';
import {answerPasses,gradeAssessment} from '@/lib/practice/assessment-grader';
import {learningStatus,stageReadiness,type LearningEvidence} from '@/lib/practice/learning-evidence';

const html=JSON.parse(readFileSync('src/content/courses/html.json','utf8'));
const code=html.lessons.find((lesson:{id:string})=>lesson.id==='html-day-01').practice.solution;
const expected=(question:AssessmentQuestion)=>'correctOptionId' in question?question.correctOptionId:'correctOptionIds' in question?question.correctOptionIds:'acceptedAnswers' in question?question.acceptedAnswers[0]:question.correctPairs;
function submission(variant=bank.variants[0]):AssessmentSubmission{
  return {courseId:bank.courseId,lessonId:bank.lessonId,version:bank.version,variantId:variant.id,attemptId:'11111111-1111-4111-8111-111111111111',answers:variant.questions.map(question=>({questionId:question.id,answer:expected(question)})),code};
}

describe('real deterministic assessment grading',()=>{
 it('grades both independently authored retry forms against real valid HTML',()=>{
  for(const variant of bank.variants){
   const result=gradeAssessment(bank,submission(variant));
   expect(result).toMatchObject({mastered:true,quiz:{total:8,correct:8,percent:100,criticalTotal:2,criticalCorrect:2},practice:{passed:true}});
  }
  expect(bank.variants[0].questions.map(q=>q.prompt)).not.toEqual(bank.variants[1].questions.map(q=>q.prompt));
 });
 it('requires practice, 80 percent and every critical question independently',()=>{
  const input=submission();input.answers[2].answer='wrong';
  expect(gradeAssessment(bank,input).mastered).toBe(true);
  input.answers[3].answer='wrong';expect(gradeAssessment(bank,input).mastered).toBe(false);
  const critical=submission();critical.answers[0].answer='wrong';
  expect(gradeAssessment(bank,critical)).toMatchObject({mastered:false,quiz:{percent:87,criticalCorrect:1}});
  expect(gradeAssessment(bank,{...submission(),code:'<p>Not a complete document</p>'})).toMatchObject({mastered:false,practice:{passed:false},quiz:{percent:100}});
 });
 it('does not omit unanswered questions from the denominator or accept duplicate answers',()=>{
  expect(gradeAssessment(bank,{...submission(),answers:[]})).toMatchObject({mastered:false,quiz:{total:8,correct:0}});
  const input=submission();input.answers.push(input.answers[0]);
  expect(assessmentSubmissionSchema.safeParse(input).success).toBe(false);
  expect(()=>gradeAssessment(bank,input)).toThrow('Invalid submitted question set');
  expect(()=>gradeAssessment(bank,{...submission(),version:99})).toThrow('version mismatch');
 });
 it('accepts equivalent text and unordered selections without string-equal source requirements',()=>{
  const multiple=bank.variants[0].questions.find(q=>q.kind==='multiple-choice')!;
  expect(answerPasses(multiple,['title','encoding','viewport'])).toBe(true);
  expect(answerPasses(multiple,['title','title','encoding','viewport'])).toBe(false);
  const short=bank.variants[0].questions.find(q=>q.kind==='short-answer')!;
  expect(answerPasses(short,'  <P>  ')).toBe(true);
  expect(answerPasses(short,'div')).toBe(false);
  const matching=bank.variants[0].questions.find(q=>q.kind==='matching')!;
  expect(answerPasses(matching,{p:'paragraph',h1:'heading',title:'tab'})).toBe(true);
  expect(answerPasses(matching,{p:'paragraph',h1:'heading',title:'tab',extra:'tab'})).toBe(false);
 });
 it('strips canonical answers from learner DTOs and gives a hint on first failure',()=>{
  const view=assessmentView(bank,bank.variants[0].id);
  expect(JSON.stringify(view)).not.toMatch(/correctOptionId|correctOptionIds|correctPairs|acceptedAnswers|explanation/);
  const result=gradeAssessment(bank,{...submission(),answers:[]});
  expect(result.feedback[0].explanation).toEqual(bank.variants[0].questions[0].hints[0]);
 });
 it('rejects invalid authoring and verifies source and translation references',()=>{
  const broken=structuredClone(bank);broken.variants[0].questions.push(broken.variants[0].questions[0]);
  expect(assessmentBankSchema.safeParse(broken).success).toBe(false);
  for(const source of bank.sourceIds)expect(html.sources.map((s:{id:string})=>s.id)).toContain(source);
  for(const variant of bank.variants)for(const question of variant.questions){
   expect(question.relatedSection).toBeLessThan(html.lessons[0].sections.length);
   expect(question.hints.length).toBeGreaterThanOrEqual(2);
   for(const locale of ['ru','tg','en'] as const){expect(question.prompt[locale]).toBeTruthy();expect(question.explanation[locale]).toBeTruthy();}
  }
 });
});

describe('honest mastery and paid readiness',()=>{
 const evidence:LearningEvidence={lessonVersion:1,read:true,needsReview:false,practice:{submitted:true,passed:true,method:'Auto Verified',subjectiveReviewRequired:false,humanReviewed:false},quiz:{total:10,correct:8,criticalTotal:2,criticalCorrect:2}};
 it('requires real practice review instead of a checkbox or AI feedback',()=>{
  expect(learningStatus(evidence,1)).toBe('Mastered');
  for(const method of ['Self Reviewed','AI Feedback'] as const)expect(learningStatus({...evidence,practice:{...evidence.practice,method}},1)).toBe('Tested');
  expect(learningStatus({...evidence,practice:{...evidence.practice,subjectiveReviewRequired:true}},1)).toBe('Tested');
  expect(learningStatus({...evidence,practice:{...evidence.practice,method:'Human Reviewed',subjectiveReviewRequired:true,humanReviewed:true}},1)).toBe('Mastered');
 });
 it('keeps old and stale evidence distinct without erasing legacy progress',()=>{
  expect(learningStatus(undefined,1)).toBe('Not Started');
  expect(learningStatus({...evidence,lessonVersion:1},2)).toBe('Needs Review');
  expect(learningStatus({...evidence,needsReview:true},1)).toBe('Needs Review');
  expect(learningStatus({...evidence,quiz:{total:0,correct:0,criticalTotal:0,criticalCorrect:0},practice:{...evidence.practice,submitted:false,passed:false}},1)).toBe('Studying');
 });
 it('never treats prerequisites as paid content authorization',()=>{
  expect(stageReadiness({previousStageMastered:false,placementPassed:false})).toEqual({ready:false,blocksPaidContent:false});
  expect(stageReadiness({previousStageMastered:false,placementPassed:true})).toEqual({ready:true,blocksPaidContent:false});
 });
});
