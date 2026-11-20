// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import html from '@/content/courses/html.json';
import { courseContentSchema } from '@/lib/courses/schema';
import { publicCourseContent } from '@/lib/courses/delivery';

const mocks = vi.hoisted(() => ({ client: vi.fn(), session: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: mocks.client }));
vi.mock('@/lib/supabase/session', () => ({ getSessionWithTimeout: mocks.session }));
import { fetchCourseContent } from '@/lib/courses/fetch-course';
const canonical = courseContentSchema.parse(html);
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
  mocks.client.mockReturnValue({});
  mocks.session.mockResolvedValue({ data: { session: { user: { id: 'account-a' }, access_token: 'verified-a' } } });
});
afterEach(() => vi.unstubAllGlobals());

it('loads public Starter delivery without looking up a private session', async () => {
  const projected = publicCourseContent(canonical);
  mocks.fetch.mockResolvedValue(Response.json(projected));
  expect(await fetchCourseContent('html', 'starter', new AbortController().signal)).toEqual({ content: projected });
  expect(mocks.session).not.toHaveBeenCalled();
  expect(mocks.fetch).toHaveBeenCalledWith('/api/courses/html', expect.objectContaining({ headers: {}, cache: 'no-store' }));
});

it('uses authenticated private enrichment even when the course itself is Starter', async () => {
  mocks.fetch.mockResolvedValue(Response.json(canonical));
  const result = await fetchCourseContent('html', 'starter', new AbortController().signal, { includePractice: true, expectedUserId: 'account-a' });
  expect(result).toEqual({ content: canonical });
  expect(mocks.fetch).toHaveBeenCalledWith('/api/courses/html?practice=1', expect.objectContaining({ headers: { Authorization: 'Bearer verified-a' }, cache: 'no-store' }));
});

it.each(['account-b', null])('does not send an old session token when the requested owner is %s', async expectedUserId => {
  const result = await fetchCourseContent('html', 'starter', new AbortController().signal, { includePractice: true, expectedUserId });
  expect(result).toEqual({ status: 401 });
  expect(mocks.fetch).not.toHaveBeenCalled();
});

it('does not start the protected fetch if the account-owned request was cancelled during session lookup', async () => {
  const controller = new AbortController();
  mocks.session.mockImplementation(async () => {
    controller.abort(new Error('account changed'));
    return { data: { session: { user: { id: 'account-a' }, access_token: 'verified-a' } } };
  });
  await expect(fetchCourseContent('html', 'starter', controller.signal, { includePractice: true, expectedUserId: 'account-a' })).rejects.toThrow('account changed');
  expect(mocks.fetch).not.toHaveBeenCalled();
});
