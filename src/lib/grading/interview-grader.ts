import { InterviewQuestion, InterviewGradeResult } from '@/types';

/**
 * Deterministic semantic rubric grader for interview free-text answers
 */
export function gradeInterviewAnswer(
  question: InterviewQuestion,
  userAnswer: string,
  isStrict: boolean = false,
): InterviewGradeResult {
  const normalized = userAnswer.toLowerCase().trim();

  if (!normalized || normalized.length < 5) {
    return {
      verdict: 'incorrect',
      score: 0,
      feedback: 'Хато: Ҷавоби шумо холӣ ё беҳад кӯтоҳ аст. Лутфан мафҳумро муфассалтар шарҳ диҳед.',
      correctParts: [],
      missingParts: question.rubric.requiredConcepts,
      wrongParts: ['Ҷавоби холӣ'],
      shortCorrection: question.sampleGoodAnswer,
      deepExplanation: question.rubric.goodAnswerSummary,
    };
  }

  const { requiredConcepts, forbiddenContradictions, keyTerms } = question.rubric;

  // Check matched key terms & concepts
  const matchedTerms = keyTerms.filter((term) => normalized.includes(term.toLowerCase()));
  const matchedConcepts = requiredConcepts.filter((concept) => {
    const parts = concept.toLowerCase().split(' ');
    // Check if key words of concept are mentioned
    return parts.some((p) => p.length > 3 && normalized.includes(p));
  });

  // Check contradictions
  const foundContradictions = (forbiddenContradictions || []).filter((contra) => {
    const parts = contra
      .toLowerCase()
      .split(' ')
      .filter((p) => p.length >= 3);
    return parts.length > 0 && parts.every((p) => normalized.includes(p));
  });

  // Concept coverage percentage
  const conceptCoverage =
    requiredConcepts.length > 0 ? matchedConcepts.length / requiredConcepts.length : 1;

  const termCoverage = keyTerms.length > 0 ? matchedTerms.length / keyTerms.length : 1;

  let score = Math.round(conceptCoverage * 60 + termCoverage * 40);

  // If at least half the core concepts are matched without contradiction, grant partial pass (60-84)
  if (conceptCoverage >= 0.5 && foundContradictions.length === 0) {
    score = Math.max(65, score);
  }
  if (conceptCoverage >= 0.9 && foundContradictions.length === 0) {
    score = Math.max(88, score);
  }

  // Penalize for explicit contradictions
  if (foundContradictions.length > 0) {
    score = Math.max(0, score - 40);
  }

  // Strict mode penalty for missing core concepts
  if (isStrict && conceptCoverage < 0.6) {
    score = Math.min(score, 50);
  }

  const missingParts = requiredConcepts.filter((c) => !matchedConcepts.includes(c));

  let verdict: 'correct' | 'partially_correct' | 'incorrect' = 'incorrect';
  let feedback = '';

  if (score >= 85 && foundContradictions.length === 0) {
    verdict = 'correct';
    feedback = 'Дуруст. Шумо мафҳуми асосиро дақиқ фаҳмондед.';
  } else if (score >= 60 && foundContradictions.length === 0) {
    verdict = 'partially_correct';
    const missingDesc = missingParts[0] || 'шарҳи амиқтар';
    feedback = `Норм, лекин "${missingDesc}" намераса.`;
  } else {
    verdict = 'incorrect';
    if (foundContradictions.length > 0) {
      feedback = `Хато: ту гуфтӣ, ки "${foundContradictions[0]}", вале ин хатост.`;
    } else {
      feedback = `Хато: мафҳумҳои асосӣ ба мисли "${missingParts.slice(0, 2).join(', ')}" шарҳ дода нашуданд.`;
    }
  }

  return {
    verdict,
    score,
    feedback,
    correctParts: matchedConcepts,
    missingParts,
    wrongParts: foundContradictions,
    shortCorrection: `Ҷавоби хуб: ${question.sampleGoodAnswer}`,
    deepExplanation: `${question.rubric.goodAnswerSummary}\n\nНамунаи ҷавоби нопурра: "${question.samplePoorAnswer}"`,
  };
}
