import type { AssessmentBank } from './assessment';

/** Only imported from server routes. Unregistered lessons are explicitly unsupported. */
export async function loadAssessmentBank(
  courseId: string,
  lessonId: string,
): Promise<AssessmentBank | null> {
  if (typeof window !== 'undefined') throw new Error('Assessment keys are server-only');
  if (courseId === 'html' && lessonId === 'html-day-01')
    return (await import('@/content/assessments/html-first-page')).default;
  return null;
}
