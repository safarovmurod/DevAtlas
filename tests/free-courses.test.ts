// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/courses/content', () => ({
  loadCourseContent: vi.fn().mockResolvedValue({ lessons: [] }),
}));
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { MEMBERSHIP_COPY } from '@/lib/billing/copy';
import { planName } from '@/lib/billing/plans';
import { courseAccessTier } from '@/lib/courses/access';
import { GET } from '@/app/api/courses/[courseId]/route';

describe('published course access tiers', () => {
  it('protects only the catalog courses explicitly assigned to Pro or Ultra', () => {
    expect(
      COURSE_CATALOG.filter((course) => courseAccessTier(course.id) === 'pro').map(
        (course) => course.id,
      ),
    ).toEqual(['javascript-pro', 'backend-pro', 'ux-pro', 'business-pro']);
    expect(
      COURSE_CATALOG.filter((course) => courseAccessTier(course.id) === 'expert').map(
        (course) => course.id,
      ),
    ).toEqual(['architecture-expert']);
    expect(courseAccessTier('html')).toBe('starter');
    expect(courseAccessTier('unknown')).toBeNull();
  });

  it('does not send Pro or Ultra lessons to a signed-out request', async () => {
    for (const courseId of ['javascript-pro', 'architecture-expert']) {
      const response = await GET(new Request('https://example.test/api/courses/' + courseId), {
        params: Promise.resolve({ courseId }),
      });
      expect(response.status).toBe(401);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    }
  });

  it('describes the old Pro Ultra plan as Pro and Ultra in every language', () => {
    for (const [locale, copy] of Object.entries(MEMBERSHIP_COPY)) {
      const text = JSON.stringify(copy);
      expect(text, locale).not.toContain('Pro Ultra');
      expect(copy.communityIntro, locale).toContain('Ultra');
      expect(copy.membership, locale).toContain('Ultra');
    }
  });

  it('keeps display names distinct from stored tiers', () => {
    expect(planName('starter')).toBe('Start');
    expect(planName('pro')).toBe('Pro');
    expect(planName('expert')).toBe('Ultra');
  });
});
