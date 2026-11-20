import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import type { CourseAccessTier } from './access';
import type { ImportedCourseId } from './ids';
import { courseDeliverySchema, type CourseDelivery } from './schema';

/** Either the course content, or the HTTP status the server refused with. */
export type CourseLoadResult = { content: CourseDelivery } | { status: number };

/**
 * Loads course content in the browser. Paid courses send the learner's
 * access token so the server can check the membership.
 * Network, timeout and invalid-data problems are thrown as errors.
 */
export async function fetchCourseContent(
  courseId: ImportedCourseId,
  requiredTier: CourseAccessTier | null,
  signal: AbortSignal,
  options: { includePractice?: boolean; expectedUserId?: string | null } = {},
): Promise<CourseLoadResult> {
  const headers: Record<string, string> = {};
  if (requiredTier !== 'starter' || options.includePractice) {
    const client = getSupabaseBrowserClient();
    if (client) {
      const { data } = await getSessionWithTimeout(client);
      if ('expectedUserId' in options && (data.session?.user.id ?? null) !== options.expectedUserId)
        return { status: 401 };
      if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`;
    }
  }

  if (signal.aborted) throw signal.reason;
  const response = await fetch(`/api/courses/${courseId}${options.includePractice ? '?practice=1' : ''}`, { signal, headers, cache: 'no-store' });
  if (!response.ok) return { status: response.status };
  return { content: courseDeliverySchema.parse(await response.json()) };
}
