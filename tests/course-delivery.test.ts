// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import html from '@/content/courses/html.json';
import { courseContentSchema, courseDeliverySchema } from '@/lib/courses/schema';
import { publicCourseContent } from '@/lib/courses/delivery';

const mocks = vi.hoisted(() => ({ load: vi.fn(), user: vi.fn(), server: vi.fn(), membership: vi.fn() }));
vi.mock('@/lib/courses/content', () => ({ loadCourseContent: mocks.load }));
vi.mock('@/lib/account/require-user', () => ({ authenticatedUser: mocks.user }));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: mocks.server }));
vi.mock('@/lib/billing/entitlements', () => ({ serverMembership: mocks.membership }));
import { GET } from '@/app/api/courses/[courseId]/route';

const canonical = courseContentSchema.parse(html);
function request(includePractice = false, token = '') {
  return GET(new Request(`https://example.test/api/courses/html${includePractice ? '?practice=1' : ''}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  }), { params: Promise.resolve({ courseId: 'html' }) });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.load.mockResolvedValue(canonical);
  mocks.server.mockReturnValue({});
  mocks.user.mockResolvedValue({ id: 'verified-user' });
  mocks.membership.mockResolvedValue({ available: true, tier: 'starter' });
});

describe('public lessons and paid practice delivery', () => {
  it('redacts every practice field and paid flow field without changing authored content', () => {
    const before = JSON.stringify(canonical);
    const projected = publicCourseContent(canonical);
    expect(courseDeliverySchema.safeParse(projected).success).toBe(true);
    expect(JSON.stringify(canonical)).toBe(before);
    expect(projected.lessons.map(lesson => lesson.id)).toEqual(canonical.lessons.map(lesson => lesson.id));
    for (const [index, lesson] of projected.lessons.entries()) {
      const original = canonical.lessons[index];
      expect(lesson.practiceAvailable).toBe(Boolean(original.practice));
      expect(lesson).not.toHaveProperty('practice');
      expect(lesson.questions).toEqual(original.questions);
      expect(lesson.sections).toEqual(original.sections);
      expect(lesson.prerequisiteDays).toEqual(original.prerequisiteDays);
      if (original.learningFlow) {
        expect(lesson.learningFlow).not.toHaveProperty('guidedPractice');
        expect(lesson.learningFlow).not.toHaveProperty('miniChallenge');
        expect(lesson.learningFlow?.prediction).toEqual(original.learningFlow.prediction);
        expect(lesson.learningFlow?.demo).toEqual(original.learningFlow.demo);
      }
    }
    // Redaction is a delivery contract, never a weakening of authored lesson validation.
    expect(courseContentSchema.safeParse(projected).success).toBe(false);
  });

  it('serves public lesson and quiz data without authenticating or serializing paid practice', async () => {
    const response = await request();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=60');
    expect(await response.json()).toEqual(publicCourseContent(canonical));
    expect(mocks.user).not.toHaveBeenCalled();
    expect(mocks.membership).not.toHaveBeenCalled();
  });

  it('denies guest, forged and Start enrichment before loading protected tasks', async () => {
    expect((await request(true)).status).toBe(401);
    expect(mocks.load).not.toHaveBeenCalled();
    mocks.user.mockResolvedValueOnce(null);
    expect((await request(true, 'forged')).status).toBe(401);
    expect(mocks.load).not.toHaveBeenCalled();
    const starter = await request(true, 'verified');
    expect(starter.status).toBe(403);
    expect(await starter.json()).toEqual({ error: 'membership_required', requiredPlan: 'pro' });
    expect(mocks.load).not.toHaveBeenCalled();
  });

  it.each(['pro', 'expert'])('returns full private practice only for verified %s membership', async tier => {
    mocks.membership.mockResolvedValue({ available: true, tier });
    const response = await request(true, 'verified');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual(canonical);
    expect(mocks.server).toHaveBeenCalledWith('Bearer verified');
    expect(mocks.membership).toHaveBeenCalledWith(expect.anything(), 'verified-user');
  });

  it('fails closed before loading practice when membership storage is unavailable', async () => {
    mocks.membership.mockResolvedValue({ available: false, tier: 'starter' });
    expect((await request(true, 'verified')).status).toBe(503);
    expect(mocks.load).not.toHaveBeenCalled();
  });

  it('projects the initial server payload on both course and standalone tests pages', async () => {
    const CoursePage = (await import('@/app/courses/[courseId]/[section]/page')).default;
    const TestsPage = (await import('@/app/tests/page')).default;
    const course = await CoursePage({ params: Promise.resolve({ courseId: 'html', section: 'home' }), searchParams: Promise.resolve({ day: '1' }) });
    const tests = await TestsPage({ searchParams: Promise.resolve({ course: 'html', day: '1' }) });
    for (const rendered of [course, tests]) {
      const initial = rendered.props.children.props.initialContent;
      expect(initial).toEqual(publicCourseContent(canonical));
      expect(initial.lessons[0].practiceAvailable).toBe(true);
      expect(initial.lessons[0]).not.toHaveProperty('practice');
    }
  });
});
