import {z} from 'zod';

export const assessmentText=z.object({ru:z.string().min(1),tg:z.string().min(1),en:z.string().min(1)});
const identifier=z.string().regex(/^[a-z0-9][a-z0-9_-]{0,119}$/);
const option=z.object({id:identifier,text:assessmentText});
const common={id:identifier,prompt:assessmentText,critical:z.boolean(),hints:z.array(assessmentText).min(1).max(5),explanation:assessmentText,relatedSection:z.number().int().nonnegative()};
const choice=z.object({...common,kind:z.enum(['single-choice','code-output','find-bug','scenario']),options:z.array(option).min(3).max(6),correctOptionId:identifier});
const multiple=z.object({...common,kind:z.literal('multiple-choice'),options:z.array(option).min(3).max(6),correctOptionIds:z.array(identifier).min(1).max(6)});
const text=z.object({...common,kind:z.enum(['fill-blank','short-answer']),acceptedAnswers:z.array(z.string().min(1).max(500)).min(1).max(10)});
const matching=z.object({...common,kind:z.literal('matching'),left:z.array(option).min(2).max(6),right:z.array(option).min(2).max(6),correctPairs:z.record(identifier,identifier)});
export const assessmentQuestion=z.union([choice,multiple,text,matching]);
export const assessmentBankSchema=z.object({
  courseId:identifier,lessonId:identifier,version:z.number().int().positive(),
  sourceIds:z.array(identifier).min(1),
  objectives:z.array(assessmentText).min(1).max(10),
  variants:z.array(z.object({id:identifier,questions:z.array(assessmentQuestion).min(5).max(10)})).min(2).max(10),
}).superRefine((bank,ctx)=>{
  const variants=new Set<string>();
  for(const variant of bank.variants){
    if(variants.has(variant.id))ctx.addIssue({code:'custom',message:'Duplicate assessment variant'});
    variants.add(variant.id);
    const ids=new Set<string>();
    for(const question of variant.questions){
      if(ids.has(question.id))ctx.addIssue({code:'custom',message:'Duplicate question ID'});
      ids.add(question.id);
      if('options' in question){
        const options=new Set(question.options.map(option=>option.id));
        if(options.size!==question.options.length)ctx.addIssue({code:'custom',message:'Duplicate option ID'});
        const correct='correctOptionId' in question?[question.correctOptionId]:question.correctOptionIds;
        if(new Set(correct).size!==correct.length||correct.some(id=>!options.has(id)))ctx.addIssue({code:'custom',message:'Invalid correct option'});
      }
      if(question.kind==='matching'){
        const left=new Set(question.left.map(option=>option.id)),right=new Set(question.right.map(option=>option.id));
        if(left.size!==question.left.length||right.size!==question.right.length||Object.keys(question.correctPairs).length!==left.size||Object.entries(question.correctPairs).some(([a,b])=>!left.has(a)||!right.has(b))||new Set(Object.values(question.correctPairs)).size!==left.size)ctx.addIssue({code:'custom',message:'Invalid matching pairs'});
      }
    }
    if(!variant.questions.some(question=>question.critical))ctx.addIssue({code:'custom',message:'Assessment needs critical checks'});
  }
});

export type AssessmentBank=z.infer<typeof assessmentBankSchema>;
export type AssessmentQuestion=z.infer<typeof assessmentQuestion>;
export type AssessmentAnswer=string|string[]|Record<string,string>;
export const assessmentSubmissionSchema=z.object({
  courseId:identifier,lessonId:identifier,version:z.number().int().positive(),variantId:identifier,
  attemptId:z.string().uuid(),
  answers:z.array(z.object({questionId:identifier,answer:z.union([z.string().max(500),z.array(z.string().max(120)).max(6),z.record(identifier,z.string().max(120))])}).strict()).max(10),
  code:z.string().max(100000),
}).strict().superRefine((value,ctx)=>{
  if(new Set(value.answers.map(answer=>answer.questionId)).size!==value.answers.length)ctx.addIssue({code:'custom',message:'Duplicate submitted answer'});
});
export type AssessmentSubmission=z.infer<typeof assessmentSubmissionSchema>;

export type PublicAssessmentQuestion<T=AssessmentQuestion>=T extends AssessmentQuestion?Omit<T,'correctOptionId'|'correctOptionIds'|'acceptedAnswers'|'correctPairs'|'explanation'>:never;
export interface AssessmentFeedback {questionId:string;passed:boolean;critical:boolean;explanation:z.infer<typeof assessmentText>;relatedSection:number}
export interface AssessmentGrade {
  method:'automatic';
  quiz:{total:number;correct:number;percent:number;criticalTotal:number;criticalCorrect:number};
  feedback:AssessmentFeedback[];
  practice:{passed:boolean;checks:{id:string;passed:boolean}[]};
  mastered:boolean;
}
export interface AssessmentView {
  courseId:string;lessonId:string;version:number;variantId:string;objectives:z.infer<typeof assessmentText>[];
  questions:PublicAssessmentQuestion[];
}
export interface AssessmentResponse {
  attemptId:string;grade:AssessmentGrade;attestation:'local'|'server';
  persistence:'local'|'saved'|'unavailable';
}

/** Learner DTO deliberately excludes all canonical answer keys and explanations. */
export function assessmentView(bank:AssessmentBank,variantId:string):AssessmentView {
  const variant=bank.variants.find(variant=>variant.id===variantId);
  if(!variant)throw new Error('Unknown assessment variant');
  return {courseId:bank.courseId,lessonId:bank.lessonId,version:bank.version,variantId,objectives:bank.objectives,
    questions:variant.questions.map(question=>{
      const {correctOptionId: _single,correctOptionIds: _multiple,acceptedAnswers: _text,correctPairs: _pairs,explanation: _explanation,...publicFields}=question as AssessmentQuestion&{correctOptionId?:string;correctOptionIds?:string[];acceptedAnswers?:string[];correctPairs?:Record<string,string>};
      return publicFields;
    }),
  };
}
