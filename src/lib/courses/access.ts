import { COURSE_CATALOG } from '@/content/courses/catalog';
import type { MembershipTier } from '@/lib/billing/entitlements';

export type CourseAccessTier = MembershipTier;
const rank: Record<CourseAccessTier, number> = { starter: 0, pro: 1, expert: 2 };

/**
 * Courses that need a paid membership. It is empty: every course, including the
 * Pro and Expert level courses, is free. The server guard stays in place, so a
 * future "Pro Ultra" plan only has to list its course ids here.
 */
const MEMBERS_ONLY: Partial<Record<string, CourseAccessTier>> = {};

/** Unknown catalog IDs are never treated as courses, so they never become free by accident. */
export function courseAccessTier(courseId: string): CourseAccessTier | null {
  const course = COURSE_CATALOG.find((entry) => entry.id === courseId);
  return course ? (MEMBERS_ONLY[courseId] ?? 'starter') : null;
}

/** Course access comes from trusted membership, never selected UI plan or account metadata. */
export function hasCourseAccess(
  memberTier: CourseAccessTier,
  requiredTier: CourseAccessTier,
): boolean {
  return rank[memberTier] >= rank[requiredTier];
}
