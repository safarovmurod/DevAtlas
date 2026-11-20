// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  server: vi.fn(),
  user: vi.fn(),
  membership: vi.fn(),
  admin: vi.fn(),
  access: vi.fn(),
  courseRelease: vi.fn(),
  downloadObject: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: mocks.server }));
vi.mock('@/lib/account/require-user', () => ({ authenticatedUser: mocks.user }));
vi.mock('@/lib/billing/entitlements', () => ({ serverMembership: mocks.membership }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: mocks.admin }));
vi.mock('@/lib/courses/access-server', () => ({ authorizeCourseContent: mocks.access }));
vi.mock('@/lib/courses/course-storage', () => ({
  getCourseRelease: mocks.courseRelease,
  downloadCourseObject: mocks.downloadObject,
}));

import { practicePlanDenial } from '@/lib/practice/plan-access';

function request(path: string, body?: unknown, token = 'valid') {
  return new Request('http://localhost' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: 'Bearer ' + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.server.mockReturnValue({});
  mocks.user.mockResolvedValue({ id: 'learner' });
  mocks.membership.mockResolvedValue({ tier: 'starter', available: true });
  mocks.access.mockResolvedValue({ allowed: true });
  mocks.courseRelease.mockResolvedValue(null);
});

describe('server practice plan check', () => {
  it('refuses Start, guests and unknown sessions; lets Pro and Ultra through', async () => {
    expect((await practicePlanDenial(request('/x')))?.status).toBe(403);
    expect(await (await practicePlanDenial(request('/x')))!.json()).toEqual({
      error: 'membership_required',
      requiredPlan: 'pro',
    });
    expect((await practicePlanDenial(request('/x', undefined, '')))?.status).toBe(401);
    mocks.user.mockResolvedValueOnce(null);
    expect((await practicePlanDenial(request('/x')))?.status).toBe(401);
    mocks.membership.mockResolvedValueOnce({ tier: 'pro', available: true });
    expect(await practicePlanDenial(request('/x'))).toBeNull();
    mocks.membership.mockResolvedValueOnce({ tier: 'expert', available: true });
    expect(await practicePlanDenial(request('/x'))).toBeNull();
  });

  it('fails closed when the plan cannot be read, open only without accounts', async () => {
    mocks.membership.mockResolvedValueOnce({ tier: 'starter', available: false });
    expect((await practicePlanDenial(request('/x')))?.status).toBe(503);
    mocks.membership.mockRejectedValueOnce(new Error('offline'));
    expect((await practicePlanDenial(request('/x')))?.status).toBe(503);
    mocks.server.mockReturnValue(null);
    expect(await practicePlanDenial(request('/x', undefined, ''))).toBeNull();
  });

  it('a Start account cannot submit practice or take the graded assessment by calling the API', async () => {
    const rpc = vi.fn();
    mocks.admin.mockReturnValue({ rpc });
    const submit = await import('@/app/api/practice/submit/route');
    const response = await submit.POST(
      request('/api/practice/submit', {
        courseId: 'html',
        lessonId: 'html-day-01',
        code: '<!doctype html>',
      }),
    );
    expect(response.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();

    const assessments = await import('@/app/api/assessments/route');
    expect(
      (await assessments.GET(request('/api/assessments?courseId=html&lessonId=html-day-01')))
        .status,
    ).toBe(403);
    const graded = await assessments.POST(
      request('/api/assessments', {
        courseId: 'html',
        lessonId: 'html-day-01',
        version: 1,
        variantId: 'first-page-a',
        attemptId: '11111111-1111-4111-8111-111111111111',
        answers: [],
        code: '<p>x</p>',
      }),
    );
    expect(graded.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();

    const confirm = await import('@/app/api/practice/confirm/route');
    const deniedConfirm = await confirm.POST(
      request('/api/practice/confirm', { courseId: 'html', day: 1 }),
    );
    expect(deniedConfirm.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();

    mocks.membership.mockResolvedValueOnce({ tier: 'pro', available: true });
    mocks.admin.mockReturnValue({
      rpc: rpc.mockResolvedValueOnce({ data: true, error: null }),
      from: () => ({
        select: () => ({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    });
    const allowedConfirm = await confirm.POST(
      request('/api/practice/confirm', { courseId: 'html', day: 1 }),
    );
    expect(allowedConfirm.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('react_mentor_confirm_verified_html_day', {
      learner_id: 'learner',
    });
  });

  it('serves the private React practice library to Pro and Ultra accounts', async () => {
    const { GET } = await import('@/app/api/practice/react-library/route');
    const path = '/api/practice/react-library';
    const guest = await GET(request(path, undefined, ''));
    expect(guest.status).toBe(401);
    expect(await guest.json()).not.toHaveProperty('html');
    const starter = await GET(request(path));
    expect(starter.status).toBe(403);
    expect(await starter.json()).not.toHaveProperty('html');

    for (const tier of ['pro', 'expert']) {
      mocks.membership.mockResolvedValueOnce({ tier, available: true });
      const response = await GET(request(path));
      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('private, no-store');
      const { html } = await response.json();
      expect(html).toContain('<script id="DATA"');
      expect(html).toContain("connect-src 'none'");
    }
  });

  it('loads the stored React practice library only after checking the plan', async () => {
    const { GET } = await import('@/app/api/practice/react-library/route');
    const path = '/api/practice/react-library';
    const reactPractice = { sha256: 'a'.repeat(64), bytes: 42 };
    mocks.courseRelease.mockResolvedValue({ reactPractice });
    mocks.downloadObject.mockResolvedValue(Buffer.from('<!doctype html><head></head>'));

    expect((await GET(request(path))).status).toBe(403);
    expect(mocks.courseRelease).not.toHaveBeenCalled();
    expect(mocks.downloadObject).not.toHaveBeenCalled();

    mocks.membership.mockResolvedValue({ tier: 'pro', available: true });
    const response = await GET(request(path));
    expect(response.status).toBe(200);
    expect((await response.json()).html).toContain('Content-Security-Policy');
    expect(mocks.downloadObject).toHaveBeenCalledWith(reactPractice);
  });
});
