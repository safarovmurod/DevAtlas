import { z } from 'zod';
const text = z.object({
  ru: z.string().trim().min(1),
  tg: z.string().trim().min(1),
  en: z.string().trim().min(1),
});
export const writtenRubricSchema = z
  .object({
    version: z.number().int().positive(),
    criteria: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z][a-z0-9-]{0,79}$/),
          weight: z.number().int().min(1).max(5),
          levels: z.tuple([text, text, text]),
        }),
      )
      .min(1)
      .max(10),
    reviewQuestions: z.array(text).min(2).max(5),
  })
  .superRefine((rubric, ctx) => {
    if (new Set(rubric.criteria.map((criterion) => criterion.id)).size !== rubric.criteria.length)
      ctx.addIssue({ code: 'custom', message: 'Duplicate rubric criterion' });
  });
export type WrittenRubric = z.infer<typeof writtenRubricSchema>;
export const writtenReviewSchema = z
  .object({
    method: z.literal('Self Reviewed'),
    rubricVersion: z.number().int().positive(),
    answerSha256: z.string().regex(/^[a-f0-9]{64}$/),
    ratings: z.record(z.string(), z.number().int().min(0).max(2)),
    reflection: z.string().trim().min(20).max(8000),
  })
  .strict();
export type WrittenReview = z.infer<typeof writtenReviewSchema>;
export function reviewSummary(rubric: WrittenRubric, review: WrittenReview) {
  if (
    review.rubricVersion !== rubric.version ||
    Object.keys(review.ratings).length !== rubric.criteria.length ||
    rubric.criteria.some((item) => !Object.hasOwn(review.ratings, item.id))
  )
    throw new Error('Incomplete or stale rubric review');
  const score = rubric.criteria.reduce(
      (sum, item) => sum + item.weight * review.ratings[item.id],
      0,
    ),
    max = rubric.criteria.reduce((sum, item) => sum + item.weight * 2, 0);
  return {
    method: 'Self Reviewed' as const,
    percent: Math.floor((score * 100) / max),
    needsReview: rubric.criteria.some((item) => review.ratings[item.id] < 2),
    verifiedMastery: false as const,
  };
}
export async function writtenAnswerHash(answer: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(answer));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
