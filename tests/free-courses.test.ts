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

describe('every course is free', () => {
  it('needs no membership for any course, Pro and Expert levels included', () => {
    for (const course of COURSE_CATALOG) expect(courseAccessTier(course.id)).toBe('starter');
    expect(courseAccessTier('unknown')).toBeNull();
  });

  it('serves a Pro and an Expert course without any sign-in', async () => {
    for (const courseId of ['javascript-pro', 'architecture-expert']) {
      const response = await GET(new Request('https://example.test/api/courses/' + courseId), {
        params: Promise.resolve({ courseId }),
      });
      expect(response.status).toBe(200);
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

  it('keeps the plan split without locking any course while payments are not connected', () => {
    expect(planName('starter')).toBe('Start');
    expect(planName('pro')).toBe('Pro');
    expect(planName('expert')).toBe('Ultra');
    for (const course of COURSE_CATALOG) expect(courseAccessTier(course.id)).toBe('starter');
  });
});
