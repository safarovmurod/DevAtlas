import { isCourseId } from '@/lib/courses/ids';
import { loadCourseContent } from '@/lib/courses/content';
import { courseAccessTier } from '@/lib/courses/access';
import { authorizeCourseContent } from '@/lib/courses/access-server';
import { publicCourseContent } from '@/lib/courses/delivery';
import { featurePlanDenial } from '@/lib/practice/plan-access';

export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (!isCourseId(courseId) || courseId === 'react')
    return Response.json({ error: 'Course not found' }, { status: 404 });
  const access = await authorizeCourseContent(request, courseId);
  if (!access.allowed) return access.response;
  const includePractice = new URL(request.url).searchParams.get('practice') === '1';
  if (includePractice) {
    const denied = await featurePlanDenial(request, 'practiceTasks');
    if (denied) return denied;
  }
  // Only load premium source after authorization. Paid responses must never enter shared caches.
  const content = await loadCourseContent(courseId).catch(() => null);
  if (!content)
    return Response.json({ error: 'course_unavailable' }, {
      status: 503,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  return Response.json(includePractice ? content : publicCourseContent(content), {
    headers: {
      'Cache-Control':
        !includePractice && courseAccessTier(courseId) === 'starter' ? 'public, max-age=60' : 'private, no-store',
    },
  });
}
