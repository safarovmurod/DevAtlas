import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import type { CourseAccessTier } from './access';
import type { ImportedCourseId } from './ids';
import { courseContentSchema, type CourseContent } from './schema';

/** Either the course content, or the HTTP status the server refused with. */
export type CourseLoadResult = { content: CourseContent } | { status: number };

/**
 * Loads course content in the browser. Paid courses send the learner's
 * access token so the server can check the membership.
 * Network, timeout and invalid-data problems are thrown as errors.
 */
export async function fetchCourseContent(
  courseId: ImportedCourseId,
  requiredTier: CourseAccessTier | null,
  signal: AbortSignal,
): Promise<CourseLoadResult> {
  const headers: Record<string, string> = {};
  if (requiredTier !== 'starter') {
    const client = getSupabaseBrowserClient();
    if (client) {
      const { data } = await getSessionWithTimeout(client);
      if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`;
    }
  }

  const response = await fetch(`/api/courses/${courseId}`, { signal, headers });
  if (!response.ok) return { status: response.status };
  return { content: courseContentSchema.parse(await response.json()) };
}
