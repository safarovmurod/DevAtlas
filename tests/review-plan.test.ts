// @vitest-environment node
import {it,expect} from 'vitest';
import {reviewPlan} from '@/lib/progress/review-plan';
import {emptyCourseProgress} from '@/lib/account/progress';
const lesson={id:'lesson',title:'Actual lesson',questionIds:['q1','q2'],lessonHref:'/lesson/one',quizHref:'/tests'};
it('uses current mistakes and real due dates, without treating an unseen question as weak',()=>{
 const p=emptyCourseProgress();
 p.answers.a={questionId:'q1',topicId:'lesson',mode:'test',correct:false,answer:'wrong',date:'2026-10-20'};
 p.reviews.q1={questionId:'q1',topicId:'lesson',repetitions:0,due:'2026-10-27'};
 p.reviews.q2={questionId:'q2',topicId:'lesson',repetitions:0,due:'2026-10-20'};
 expect(reviewPlan([lesson],p,'2026-10-26')[0]).toMatchObject({weak:['q1'],due:[],attempted:['q1'],reviewIds:['q1']});
 p.answers.b={...p.answers.a,correct:true,date:'2026-10-25'};
 p.reviews.q1.repetitions=1;p.reviews.q1.due='2026-10-26';
 expect(reviewPlan([lesson],p,'2026-10-26')[0]).toMatchObject({weak:[],due:['q1'],reviewIds:['q1']});
});
it('handles historical imports conservatively and ignores unrelated/future answers',()=>{
 const p=emptyCourseProgress();
 for(const [id,correct,date] of [['a',false,'2026-10-25'],['b',true,'2026-10-24'],['c',true,'2026-10-27']] as const)p.answers[id]={questionId:'q1',topicId:'lesson',mode:'test',correct,answer:'x',date};
 p.answers.other={...p.answers.a,questionId:'unknown'};
 expect(reviewPlan([lesson],p,'2026-10-26')[0].weak).toEqual(['q1']);
 p.answers.a.correct=true;expect(reviewPlan([lesson],p,'2026-10-26')[0].reviewIds).toEqual([]);
 expect(()=>reviewPlan([lesson],p,'not a date')).toThrow();
});
