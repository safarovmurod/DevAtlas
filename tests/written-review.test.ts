// @vitest-environment node
import {it,expect} from 'vitest';
import communication from '@/content/courses/communication.json';
import {courseContentSchema} from '@/lib/courses/schema';
import {reviewSummary,writtenAnswerHash,writtenReviewSchema,writtenRubricSchema} from '@/lib/practice/written-review';
const course=courseContentSchema.parse(communication),rubric=course.lessons[0].practice!.rubric!;
const review={method:'Self Reviewed' as const,rubricVersion:1,answerSha256:'a'.repeat(64),ratings:{'context-outcome':2,'deadline-clarification':2,'tone-privacy':2},reflection:'The message gives a concrete deliverable, deadline and a neutral clarification route.'};
it('cannot turn even a perfect self review into verified mastery',()=>{
 expect(reviewSummary(rubric,writtenReviewSchema.parse(review))).toEqual({method:'Self Reviewed',percent:100,needsReview:false,verifiedMastery:false});
 expect(reviewSummary(rubric,{...review,ratings:{...review.ratings,'deadline-clarification':1}})).toEqual({method:'Self Reviewed',percent:80,needsReview:true,verifiedMastery:false});
 expect(writtenReviewSchema.safeParse({...review,method:'Human Reviewed'}).success).toBe(false);
 expect(writtenReviewSchema.safeParse({...review,verified:true}).success).toBe(false);
});
it('rejects stale, incomplete and incompatible reviews',()=>{
 expect(()=>reviewSummary(rubric,{...review,rubricVersion:2})).toThrow('stale');
 expect(()=>reviewSummary(rubric,{...review,ratings:{'context-outcome':2}})).toThrow('Incomplete');
 expect(writtenReviewSchema.safeParse({...review,ratings:{...review.ratings,'tone-privacy':3}}).success).toBe(false);
 expect(writtenReviewSchema.safeParse({...review,reflection:'yes'}).success).toBe(false);
 const invalid=structuredClone(course);invalid.lessons[0].practice!.kind='code';
 expect(courseContentSchema.safeParse(invalid).success).toBe(false);
 invalid.lessons[0].practice!.kind='written';delete invalid.lessons[0].summary.en;
 expect(courseContentSchema.safeParse(invalid).success).toBe(false);
});
it('requires complete three-language rubric descriptors and unique criteria',()=>{
 const invalid=structuredClone(rubric);invalid.criteria.push(invalid.criteria[0]);
 expect(writtenRubricSchema.safeParse(invalid).success).toBe(false);
 expect(writtenRubricSchema.safeParse({...rubric,reviewQuestions:[{ru:'Only Russian'},{ru:'Another'}]}).success).toBe(false);
 expect(rubric.criteria).toHaveLength(course.lessons[0].practice!.criteria.length);
});
it('binds a restored review to the exact written answer using real SHA-256',async()=>{
 const hash=await writtenAnswerHash('A fictional message');expect(hash).toMatch(/^[a-f0-9]{64}$/);
 expect(await writtenAnswerHash('A fictional message')).toBe(hash);
 expect(await writtenAnswerHash('An edited message')).not.toBe(hash);
});
