// @vitest-environment node
import { expect, it } from 'vitest';
import { loadCourseContent } from '@/lib/courses/content';
import { reviewSummary, writtenAnswerHash } from '@/lib/practice/written-review';

it('loads translated feedback with a theory destination for each UX question', async () => {
  const { lessons } = await loadCourseContent('ux-design');

  for (const lesson of lessons) {
    expect(lesson.sections.length, lesson.id).toBeGreaterThanOrEqual(4);
    for (const question of lesson.questions) {
      expect(question.hint, question.id).toEqual({
        ru: expect.stringMatching(/\S/),
        tg: expect.stringMatching(/\S/),
        en: expect.stringMatching(/\S/),
      });
      expect(lesson.sections[question.relatedSection ?? -1], question.id).toBeDefined();
      expect(question.answer, question.id).toEqual(question.options[question.correctIndex]);
    }
  }
});

it('retains the day 24 assessment slots while linking recovery and stopping to the lesson', async () => {
  const { lessons } = await loadCourseContent('ux-design');
  const day = lessons.find((lesson) => lesson.day === 24)!;
  const recovery = day.questions.find((question) => question.id === 'ux-design-day-24-q03')!;
  const delay = day.questions.find((question) => question.id === 'ux-design-day-24-q04')!;

  expect(recovery.correctIndex).toBe(0);
  expect(recovery.options[0].en).toContain('ordinary path may not expose this risk');
  expect(delay.correctIndex).toBe(0);
  expect(delay.options[0].en).toContain('continuing, skipping or stopping');
  expect(day.sections[delay.relatedSection!].body.en).toContain('stop immediately');
});

it('uses the authored capstone with the real written review evaluator without granting mastery', async () => {
  const { lessons } = await loadCourseContent('ux-design');
  const practice = lessons.at(-1)?.practice;
  const rubric = practice?.rubric;
  if (!practice?.referenceAnswer?.en || !rubric) throw new Error('Missing example or capstone rubric');

  const ratings = Object.fromEntries(rubric.criteria.map((criterion) => [criterion.id, 2]));
  const result = reviewSummary(rubric, {
    method: 'Self Reviewed',
    rubricVersion: rubric.version,
    answerSha256: await writtenAnswerHash(practice.referenceAnswer.en),
    ratings,
    reflection: 'The draft states the synthetic evidence and the browser checks still needed.',
  });

  expect(result).toMatchObject({ method: 'Self Reviewed', percent: 100, verifiedMastery: false });
  expect(() => reviewSummary(rubric, {
    method: 'Self Reviewed',
    rubricVersion: rubric.version,
    answerSha256: '0'.repeat(64),
    ratings: { 'problem-evidence': 2 },
    reflection: 'The remaining case evidence was not reviewed.',
  })).toThrow('Incomplete or stale rubric review');
});
