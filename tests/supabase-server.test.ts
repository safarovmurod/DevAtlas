// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nextConfig from '../next.config';
import { selectTutorProvider } from '@/lib/tutor/provider';

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('getSupabaseServerClient', () => {
  it('does not leak setInterval timers across repeated per-request calls', async () => {
    vi.useFakeTimers();
    const intervalSpy = vi.spyOn(globalThis, 'setInterval');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-placeholder-123456');

    const { getSupabaseServerClient } = await import('@/lib/supabase/server');
    expect(vi.getTimerCount()).toBe(0);
    for (let i = 0; i < 5; i++) {
      const client = getSupabaseServerClient(`Bearer token-${i}`);
      expect(client).not.toBeNull();
    }
    expect(intervalSpy).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    ['missing url', '', 'anon-key-placeholder-123456'],
    ['missing key', 'https://example.supabase.co', ''],
    ['whitespace url', '   \t\n ', 'anon-key-placeholder-123456'],
    ['whitespace key', 'https://example.supabase.co', '   \t\n '],
    ['non-http url', 'ftp://example.supabase.co', 'anon-key-placeholder-123456'],
    ['bare host url', 'example.supabase.co', 'anon-key-placeholder-123456'],
    ['malformed http url', 'http://[invalid', 'anon-key-placeholder-123456'],
    ['scheme-only url', 'https://', 'anon-key-placeholder-123456'],
    ['too-short key', 'https://example.supabase.co', '   1234567890   '],
  ])('returns null without throwing for %s', async (_label, url, key) => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', url);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', key);

    const { getSupabaseServerClient } = await import('@/lib/supabase/server');
    expect(() => getSupabaseServerClient()).not.toThrow();
    expect(getSupabaseServerClient()).toBeNull();
  });

  it('trims valid surrounding whitespace in URL and anon key', async () => {
    vi.useFakeTimers();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '  https://example.supabase.co  \n');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '  anon-key-placeholder-123456  ');

    const { getSupabaseServerClient } = await import('@/lib/supabase/server');
    expect(getSupabaseServerClient('Bearer test')).not.toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('getSupabaseAdminClient', () => {
  it('trims valid URL/service-role key and avoids timers', async () => {
    vi.useFakeTimers();
    const intervalSpy = vi.spyOn(globalThis, 'setInterval');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '  https://example.supabase.co  ');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '  service-role-placeholder-123456  ');

    const { getSupabaseAdminClient, isSupabaseAdminConfigured } = await import(
      '@/lib/supabase/admin'
    );
    expect(isSupabaseAdminConfigured).toBe(true);
    expect(getSupabaseAdminClient()).not.toBeNull();
    expect(intervalSpy).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('returns null for blank or malformed env vars', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://[broken');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '   service-role-placeholder-123456   ');

    const { getSupabaseAdminClient, isSupabaseAdminConfigured } = await import(
      '@/lib/supabase/admin'
    );
    expect(isSupabaseAdminConfigured).toBe(false);
    expect(getSupabaseAdminClient()).toBeNull();
  });
});

describe('selectTutorProvider env trimming', () => {
  it('trims Gemini keys/models and ignores whitespace-only GEMINI_API_KEY or legacy providers', () => {
    expect(
      selectTutorProvider({
        GEMINI_API_KEY: '  gemini-secret-key \n',
        GEMINI_MODEL: ' gemini-3.5-flash ',
      }),
    ).toEqual({ kind: 'gemini', key: 'gemini-secret-key', model: 'gemini-3.5-flash' });

    expect(
      selectTutorProvider({
        GEMINI_API_KEY: '   \t ',
        AI_PROVIDER_KEY: '  legacy-secret  ',
      }),
    ).toBeNull();
  });
});

describe('next.config.ts security headers', () => {
  it('sets sandbox CSP for /course-files/:path* and preserves /api/:path* no-store', async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    expect(rules).toContainEqual({
      source: '/course-files/:path*',
      headers: [{ key: 'Content-Security-Policy', value: "sandbox; default-src 'none'" }],
    });
    expect(rules).toContainEqual({
      source: '/api/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    });
  });
});
