import { describe, it, expect } from 'vitest';
import { gradeInterviewAnswer } from '@/lib/grading/interview-grader';
import { InterviewQuestion } from '@/types';

describe('Interview Semantic Rubric Grader', () => {
  const sampleQuestion: InterviewQuestion = {
    id: 'test_int_1',
    topicId: 'spa_vs_mpa',
    prompt: 'Тафовути SPA аз MPA чист?',
    rubric: {
      requiredConcepts: ['client-side routing', 'no full reload'],
      forbiddenContradictions: ['SPA reload мекунад барои ҳар саҳифа'],
      keyTerms: ['SPA', 'MPA', 'Routing', 'Reload'],
      goodAnswerSummary: 'SPA reload намекунад ва client-side routing дорад.',
    },
    sampleGoodAnswer: 'Дар SPA гузариш бе reload аст ва routing дар клиент иҷро мешавад.',
    samplePoorAnswer: 'SPA сайт аст.',
    category: 'basics',
  };

  it('grades comprehensive answer as correct (>= 85)', () => {
    const answer = 'Дар SPA гузариш байни саҳифаҳо бе full reload анҷом мешавад ва client-side routing истифода мешавад.';
    const result = gradeInterviewAnswer(sampleQuestion, answer, false);

    expect(result.verdict).toBe('correct');
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.missingParts.length).toBe(0);
  });

  it('grades partially correct answer with missing concept (60-84)', () => {
    const answer = 'Дар SPA саҳифа reload намешавад.';
    const result = gradeInterviewAnswer(sampleQuestion, answer, false);

    expect(result.verdict).toBe('partially_correct');
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.score).toBeLessThan(85);
  });

  it('penalizes contradictions and marks incorrect (< 60)', () => {
    const answer = 'SPA reload мекунад барои ҳар саҳифа.';
    const result = gradeInterviewAnswer(sampleQuestion, answer, false);

    expect(result.verdict).toBe('incorrect');
    expect(result.score).toBeLessThan(60);
    expect(result.feedback).toContain('Хато:');
  });

  it('rejects empty or very short answers', () => {
    const result = gradeInterviewAnswer(sampleQuestion, 'не', false);
    expect(result.verdict).toBe('incorrect');
    expect(result.score).toBe(0);
  });
});
