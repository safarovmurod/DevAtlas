import { COURSE_CATALOG } from '@/content/courses/catalog';
import type { CourseId } from '@/lib/courses/ids';

// The course audit checks these metadata counts against the actual curriculum.
const courseFileCounts: Partial<Record<CourseId, number>> = { backend: 1 };

export function GET() {
  const courses = COURSE_CATALOG.map((course) => {
    const lessons = course.publishedDays ?? 0;
    const status = {
      id: course.id,
      ready: lessons > 0,
      lessons,
      files: courseFileCounts[course.id] ?? 0,
    };

    return course.id === 'react' ? status : { ...status, accessTier: course.accessTier ?? 'starter' };
  });
  return Response.json(courses, { headers: { 'Cache-Control': 'public, max-age=60' } });
}
