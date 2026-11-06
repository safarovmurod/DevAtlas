import { createHash, randomInt } from 'node:crypto';
import {
  assessmentSubmissionSchema,
  assessmentView,
  type AssessmentResponse,
} from '@/lib/practice/assessment';
import { loadAssessmentBank } from '@/lib/practice/assessment-banks';
import { gradeAssessment } from '@/lib/practice/assessment-grader';
import { isCourseId } from '@/lib/courses/ids';
import { authorizeCourseContent } from '@/lib/courses/access-server';
import { authenticatedUser } from '@/lib/account/require-user';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';

export const runtime = 'nodejs';
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
async function contentAccess(request: Request, courseId: string) {
  if (!isCourseId(courseId) || courseId === 'react')
    return json({ error: 'assessment_not_available' }, 404);
  const access = await authorizeCourseContent(request, courseId);
  return access.allowed ? null : access.response;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams,
    courseId = params.get('courseId') ?? '',
    lessonId = params.get('lessonId') ?? '';
  const denied = await contentAccess(request, courseId);
  if (denied) return denied;
  const bank = await loadAssessmentBank(courseId, lessonId);
  if (!bank) return json({ error: 'assessment_not_available' }, 404);
  const requested = params.get('variantId');
  if (requested) {
    if (!bank.variants.some((variant) => variant.id === requested))
      return json({ error: 'unknown_assessment_variant' }, 400);
    return json(assessmentView(bank, requested));
  }
  const candidates = bank.variants.filter((variant) => variant.id !== params.get('excludeVariant'));
  const selected = candidates[randomInt(candidates.length)];
  return json(assessmentView(bank, selected.id));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await readBoundedJson(request, 128000);
  } catch (error) {
    return json(
      { error: 'invalid_or_oversized_request' },
      error instanceof RequestBodyError ? error.status : 400,
    );
  }
  const parsed = assessmentSubmissionSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'invalid_assessment_submission' }, 400);
  const input = parsed.data,
    denied = await contentAccess(request, input.courseId);
  if (denied) return denied;
  const bank = await loadAssessmentBank(input.courseId, input.lessonId);
  if (!bank) return json({ error: 'assessment_not_available' }, 404);
  const user = request.headers.has('authorization') ? await authenticatedUser(request) : null;
  if (request.headers.has('authorization') && !user)
    return json({ error: 'authentication_required' }, 401);
  let grade;
  try {
    grade = gradeAssessment(bank, input);
  } catch {
    return json({ error: 'invalid_assessment_version_or_questions' }, 400);
  }
  const result: AssessmentResponse = {
    attemptId: input.attemptId,
    grade,
    attestation: 'local',
    persistence: 'local',
  };
  // A guest can receive real deterministic feedback, but never a durable
  // server attestation or server XP from user-editable browser progress.
  if (!user) return json(result);
  const admin = getSupabaseAdminClient();
  if (!admin) return json({ ...result, persistence: 'unavailable' });
  try {
    const { error } = await admin.rpc('react_mentor_record_assessment', {
      learner_id: user.id,
      attempt: input.attemptId,
      course: bank.courseId,
      lesson: bank.lessonId,
      version: bank.version,
      submission_hash: createHash('sha256').update(JSON.stringify(input)).digest('hex'),
      total: grade.quiz.total,
      correct: grade.quiz.correct,
      critical_total: grade.quiz.criticalTotal,
      critical_correct: grade.quiz.criticalCorrect,
      practice_passed: grade.practice.passed,
    });
    if (error?.code === 'PT409') return json({ error: 'attempt_id_conflict' }, 409);
    if (error) return json({ ...result, persistence: 'unavailable' });
    return json({ ...result, attestation: 'server', persistence: 'saved' });
  } catch {
    return json({ ...result, persistence: 'unavailable' });
  }
}
