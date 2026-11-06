import type {
  AssessmentAnswer,
  AssessmentBank,
  AssessmentGrade,
  AssessmentQuestion,
  AssessmentSubmission,
} from './assessment';
import { validateFirstHtmlLesson } from './html-validator';

const normalized = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
const sameSet = (a: string[], b: string[]) =>
  a.length === new Set(a).size && a.length === b.length && a.every((value) => b.includes(value));

export function answerPasses(
  question: AssessmentQuestion,
  answer: AssessmentAnswer | undefined,
): boolean {
  if ('correctOptionId' in question)
    return typeof answer === 'string' && answer === question.correctOptionId;
  if ('correctOptionIds' in question)
    return Array.isArray(answer) && sameSet(answer, question.correctOptionIds);
  if ('acceptedAnswers' in question)
    return (
      typeof answer === 'string' &&
      question.acceptedAnswers.some((expected) => normalized(expected) === normalized(answer))
    );
  if (question.kind === 'matching')
    return (
      !!answer &&
      typeof answer === 'object' &&
      !Array.isArray(answer) &&
      Object.keys(answer).length === Object.keys(question.correctPairs).length &&
      Object.entries(question.correctPairs).every(([left, right]) => answer[left] === right)
    );
  return false;
}

/** Pure deterministic grading. No submitted code is evaluated or executed. */
export function gradeAssessment(
  bank: AssessmentBank,
  submission: AssessmentSubmission,
): AssessmentGrade {
  if (
    bank.courseId !== submission.courseId ||
    bank.lessonId !== submission.lessonId ||
    bank.version !== submission.version
  )
    throw new Error('Assessment version mismatch');
  const variant = bank.variants.find((variant) => variant.id === submission.variantId);
  if (!variant) throw new Error('Unknown assessment variant');
  const ids = new Set(variant.questions.map((question) => question.id));
  if (
    new Set(submission.answers.map((answer) => answer.questionId)).size !==
      submission.answers.length ||
    submission.answers.some((answer) => !ids.has(answer.questionId))
  )
    throw new Error('Invalid submitted question set');
  const answers = new Map(submission.answers.map((answer) => [answer.questionId, answer.answer]));
  const feedback = variant.questions.map((question) => {
    const passed = answerPasses(question, answers.get(question.id));
    return {
      questionId: question.id,
      critical: question.critical,
      passed,
      explanation: passed ? question.explanation : question.hints[0],
      relatedSection: question.relatedSection,
    };
  });
  const correct = feedback.filter((result) => result.passed).length,
    critical = feedback.filter((result) => result.critical);
  const percent = Math.floor((correct * 100) / feedback.length);
  // This first adapter reuses the existing reviewed HTML checker. Unsupported
  // runtimes are never simulated or run inside the Next.js server.
  if (bank.courseId !== 'html' || bank.lessonId !== 'html-day-01')
    throw new Error('Practice validator unavailable');
  const checks = validateFirstHtmlLesson(submission.code);
  const passed = checks.length > 0 && checks.every((check) => check.passed);
  const criticalCorrect = critical.filter((result) => result.passed).length;
  return {
    method: 'automatic',
    quiz: {
      total: feedback.length,
      correct,
      percent,
      criticalTotal: critical.length,
      criticalCorrect,
    },
    feedback,
    practice: { passed, checks },
    mastered: passed && percent >= 80 && criticalCorrect === critical.length,
  };
}
