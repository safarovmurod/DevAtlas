// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { CORE_INTERVIEW_QUESTIONS } from '@/content/interview-questions';

const mocks = vi.hoisted(() => ({ user: vi.fn(), server: vi.fn(), membership: vi.fn(), budget: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/account/require-user', () => ({ authenticatedUser: mocks.user }));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: mocks.server }));
vi.mock('@/lib/billing/entitlements', () => ({ serverMembership: mocks.membership }));
vi.mock('@/lib/tutor/quota', () => ({ TUTOR_MAX_OUTPUT_TOKENS: 256, reserveTutorBudget: mocks.budget }));

function request(body: Record<string, unknown> = {}, token = 'verified-session', extra: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/tutor', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}), ...extra },
    body: JSON.stringify({ action: 'ask', userText: 'Hello!', language: 'en', ...body }),
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  vi.stubEnv('AI_TUTOR_ENABLED', 'false');
  vi.stubGlobal('fetch', mocks.fetch);
  mocks.server.mockReturnValue({});
  mocks.user.mockResolvedValue({ id: 'verified-user' });
  mocks.membership.mockResolvedValue({ available: true, tier: 'pro' });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Tutor feature and course authorization', () => {
  const cases = (['starter', 'pro', 'expert'] as const).flatMap(tier =>
    (['react', 'javascript-pro', 'architecture-expert'] as const).flatMap(courseId =>
      (['chat', 'voice'] as const).map(channel => ({ tier, courseId, channel }))),
  );
  it.each(cases)('$tier / $courseId / $channel uses both trusted policies', async ({ tier, courseId, channel }) => {
    mocks.membership.mockResolvedValue({ available: true, tier });
    const { POST } = await import('@/app/api/tutor/route');
    const response = await POST(request({ courseId, channel }));
    const featureAllowed = channel === 'voice' ? tier === 'expert' : tier !== 'starter';
    const courseAllowed = courseId !== 'architecture-expert' || tier === 'expert';
    expect(response.status).toBe(featureAllowed && courseAllowed ? 200 : 403);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    if (!featureAllowed) expect(await response.json()).toEqual({ error: 'membership_required', requiredPlan: channel === 'voice' ? 'ultra' : 'pro' });
    else if (!courseAllowed) expect(await response.json()).toEqual({ error: 'membership_required', requiredTier: 'expert' });
    else expect(await response.json()).toMatchObject({ mode: 'local', usage: { totalTokens: 0 } });
    expect(mocks.server).toHaveBeenCalledWith('Bearer verified-session');
    expect(mocks.membership).toHaveBeenCalledWith(expect.anything(), 'verified-user');
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.budget).not.toHaveBeenCalled();
  });

  it.each(['react', 'javascript-pro', 'architecture-expert'])('rejects guest or invalid sessions before local replies for %s', async courseId => {
    const { POST } = await import('@/app/api/tutor/route');
    const guest = await POST(request({ courseId }, '', { cookie: 'tier=expert', 'x-membership-tier': 'expert' }));
    expect(guest.status).toBe(401);
    expect(await guest.json()).toEqual({ error: 'authentication_required' });
    expect(mocks.user).not.toHaveBeenCalled();
    expect(mocks.membership).not.toHaveBeenCalled();
    mocks.user.mockResolvedValue(null);
    expect((await POST(request({ courseId }, 'forged-session'))).status).toBe(401);
    expect(mocks.membership).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it.each(['react', 'javascript-pro'])('fails closed when trusted membership cannot be read for %s', async courseId => {
    const { POST } = await import('@/app/api/tutor/route');
    mocks.membership.mockResolvedValue({ available: false, tier: 'starter' });
    expect((await POST(request({ courseId }))).status).toBe(503);
    mocks.membership.mockRejectedValue(new Error('private database diagnostic'));
    const response = await POST(request({ courseId }));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private database diagnostic');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('keeps deterministic React grading free without a token or membership lookup', async () => {
    const { POST } = await import('@/app/api/tutor/route');
    const question = CORE_INTERVIEW_QUESTIONS[0];
    const response = await POST(request({ action: 'grade_interview', questionId: question.id, userText: 'My written answer' }, ''));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ mode: 'local' });
    expect(mocks.user).not.toHaveBeenCalled();
    expect(mocks.server).not.toHaveBeenCalled();
    expect(mocks.membership).not.toHaveBeenCalled();
    expect(mocks.budget).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect((await POST(request({ action: 'grade_interview', questionId: 'missing', userText: 'Answer' }, ''))).status).toBe(404);
  });

  it('keeps the paid-course content guard even for a deterministic grading request', async () => {
    const { POST } = await import('@/app/api/tutor/route');
    const response = await POST(request({ action: 'grade_interview', courseId: 'javascript-pro', questionId: CORE_INTERVIEW_QUESTIONS[0].id }, ''));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'authentication_required' });
    expect(mocks.membership).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('fails closed for local Tutor replies in production when account storage is unavailable', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    mocks.server.mockReturnValue(null);
    const { POST } = await import('@/app/api/tutor/route');
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'service_unavailable' });
    expect(mocks.user).not.toHaveBeenCalled();
    expect(mocks.membership).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('does not expose an official local answer to Start through a source ID', async () => {
    mocks.membership.mockResolvedValue({ available: true, tier: 'starter' });
    const { POST } = await import('@/app/api/tutor/route');
    const body = { userText: 'Explain the question', questionId: 'quiz-q001', isDeep: true };
    expect((await POST(request(body))).status).toBe(403);
    mocks.membership.mockResolvedValue({ available: true, tier: 'pro' });
    const response = await POST(request(body));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ mode: 'local', source: { questionId: 'quiz-q001' } });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
