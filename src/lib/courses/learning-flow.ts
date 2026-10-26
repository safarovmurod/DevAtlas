import {z} from 'zod';

// New authored flows require all three lesson languages; old lessons remain valid.
const text=z.object({ru:z.string().min(1),tg:z.string().min(1),en:z.string().min(1)});
export const LEARNING_FLOW_STAGES=['learn','understand','watch','try','practice','test','review','master'] as const;
export const learningFlowSchema=z.object({
  version:z.literal(1),
  objectives:z.array(text).min(2).max(8),
  realWorld:text,
  walkthroughSections:z.array(z.number().int().nonnegative()).min(1),
  prediction:z.object({prompt:text,options:z.array(text).min(2).max(6),correctIndex:z.number().int().nonnegative(),hint:text,explanation:text}),
  demo:z.object({kind:z.literal('html-document'),tabTitle:text,heading:text,paragraph:text}),
  guidedPractice:z.object({steps:z.array(text).min(2).max(8),hint:text,success:text}),
  independentPractice:z.literal('lesson-practice'),
  assessmentVersion:z.number().int().positive(),
  miniChallenge:z.object({task:text,criteria:z.array(text).min(2),example:text}),
  summary:z.array(text).min(2),
  review:z.array(text).min(2),
  // Explicit null means a real course ending, not a missing/draft lesson.
  nextLessonId:z.string().regex(/^[a-z0-9][a-z0-9_-]{0,119}$/).nullable(),
}).superRefine((flow,ctx)=>{
  if(flow.prediction.correctIndex>=flow.prediction.options.length)ctx.addIssue({code:'custom',message:'Invalid prediction answer'});
  if(new Set(flow.walkthroughSections).size!==flow.walkthroughSections.length)ctx.addIssue({code:'custom',message:'Duplicate walkthrough section'});
});
export type LearningFlow=z.infer<typeof learningFlowSchema>;
