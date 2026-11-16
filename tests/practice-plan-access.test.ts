// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  server: vi.fn(),
  user: vi.fn(),
  membership: vi.fn(),
  admin: vi.fn(),
  access: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: mocks.server }));
vi.mock('@/lib/account/require-user', () => ({ authenticatedUser: mocks.user }));
vi.mock('@/lib/billing/entitlements', () => ({ serverMembership: mocks.membership }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: mocks.admin }));
vi.mock('@/lib/courses/access-server', () => ({ authorizeCourseContent: mocks.access }));

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
  });
});
