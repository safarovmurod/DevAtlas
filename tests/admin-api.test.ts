// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ server: vi.fn(), admin: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: mocks.server }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: mocks.admin }));

import { requireAdmin } from '@/lib/account/require-admin';
import { DELETE as deleteUser, GET as listUsers } from '@/app/api/admin/users/route';
import { POST as changeMembership } from '@/app/api/admin/memberships/route';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const TARGET_ID = '22222222-2222-4222-8222-222222222222';

function request(body?: unknown, token: string | null = 'token', method?: string) {
  return new Request('https://example.test/api/admin', {
    method: method ?? (body === undefined ? 'GET' : 'POST'),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function authClient(options: {
  appRole?: string | null;
  level?: string;
  confirmed?: boolean;
  anonymous?: boolean;
  userError?: boolean;
}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue(
        options.userError
          ? { data: { user: null }, error: { message: 'bad' } }
          : {
              data: {
                user: {
                  id: ADMIN_ID,
                  is_anonymous: options.anonymous ?? false,
                  email_confirmed_at: options.confirmed === false ? null : '2026-01-01',
                  app_metadata: {
                    app_role: options.appRole === undefined ? 'admin' : options.appRole,
                  },
                },
              },
              error: null,
            },
      ),
      mfa: {
        getAuthenticatorAssuranceLevel: vi
          .fn()
          .mockResolvedValue({ data: { currentLevel: options.level ?? 'aal2' }, error: null }),
      },
    },
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'info').mockImplementation(() => undefined);
});

describe('requireAdmin', () => {
  it('rejects a missing or invalid token', async () => {
    expect(await requireAdmin(request(undefined, null))).toMatchObject({ ok: false, status: 401 });
    mocks.server.mockReturnValue(authClient({ userError: true }));
    expect(await requireAdmin(request())).toMatchObject({ ok: false, status: 401 });
  });

  it('rejects ordinary users and unconfirmed or anonymous accounts', async () => {
    for (const options of [
      { appRole: null },
      { appRole: 'user' },
      { confirmed: false },
      { anonymous: true },
    ]) {
      mocks.server.mockReturnValue(authClient(options));
      expect(await requireAdmin(request())).toMatchObject({
        ok: false,
        status: 403,
        error: 'admin_required',
      });
    }
  });

  it('requires the aal2 level even for an admin', async () => {
    mocks.server.mockReturnValue(authClient({ level: 'aal1' }));
    expect(await requireAdmin(request())).toMatchObject({
      ok: false,
      status: 403,
      error: 'mfa_required',
    });
  });

  it('accepts an admin whose session passed the second factor', async () => {
    mocks.server.mockReturnValue(authClient({}));
    expect(await requireAdmin(request())).toMatchObject({ ok: true });
  });
});

describe('admin routes never touch data before the admin check', () => {
  it('blocks both routes for a non-admin', async () => {
    mocks.server.mockReturnValue(authClient({ appRole: null }));
    expect((await listUsers(request())).status).toBe(403);
    expect((await changeMembership(request({ action: 'revoke', userId: TARGET_ID }))).status).toBe(
      403,
    );
    expect(mocks.admin).not.toHaveBeenCalled();
  });
});

describe('membership changes', () => {
  function adminClient(existing: { tier: string; expires_at: string } | null) {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const eqDelete = vi.fn().mockResolvedValue({ error: null });
    const client = {
      auth: {
        admin: {
          getUserById: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: TARGET_ID } }, error: null }),
        },
      },
      from: vi.fn().mockReturnValue({
        select: () => ({
          eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: existing, error: null }) }),
        }),
        upsert,
        delete: () => ({ eq: eqDelete }),
      }),
    };
    return { client, upsert, eqDelete };
  }

  it('rejects bad payloads and unknown plans', async () => {
    mocks.server.mockReturnValue(authClient({}));
    for (const body of [
      { action: 'grant', userId: 'not-a-uuid', tier: 'pro', days: 30 },
      { action: 'grant', userId: TARGET_ID, tier: 'admin', days: 30 },
      { action: 'grant', userId: TARGET_ID, tier: 'pro', days: 0 },
      { action: 'grant', userId: TARGET_ID, tier: 'pro', days: 99999 },
      { action: 'delete-user', userId: TARGET_ID },
    ])
      expect((await changeMembership(request(body))).status).toBe(400);
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it('grants a plan for the requested number of days', async () => {
    mocks.server.mockReturnValue(authClient({}));
    const { client, upsert } = adminClient(null);
    mocks.admin.mockReturnValue(client);
    const response = await changeMembership(
      request({ action: 'grant', userId: TARGET_ID, tier: 'expert', days: 10 }),
    );
    expect(response.status).toBe(200);
    const saved = upsert.mock.calls[0][0];
    expect(saved).toMatchObject({ user_id: TARGET_ID, tier: 'expert' });
    const days = (new Date(saved.expires_at).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(9.99);
    expect(days).toBeLessThan(10.01);
  });

  it('extends from the current end date and keeps the tier', async () => {
    mocks.server.mockReturnValue(authClient({}));
    const end = new Date(Date.now() + 20 * 86_400_000).toISOString();
    const { client, upsert } = adminClient({ tier: 'expert', expires_at: end });
    mocks.admin.mockReturnValue(client);
    expect(
      (await changeMembership(request({ action: 'extend', userId: TARGET_ID, days: 5 }))).status,
    ).toBe(200);
    const saved = upsert.mock.calls[0][0];
    expect(saved.tier).toBe('expert');
    expect(new Date(saved.expires_at).getTime() - new Date(end).getTime()).toBe(5 * 86_400_000);
  });

  it('refuses to extend or revoke when there is no membership', async () => {
    mocks.server.mockReturnValue(authClient({}));
    const { client, upsert, eqDelete } = adminClient(null);
    mocks.admin.mockReturnValue(client);
    expect(
      (await changeMembership(request({ action: 'extend', userId: TARGET_ID, days: 5 }))).status,
    ).toBe(404);
    expect((await changeMembership(request({ action: 'revoke', userId: TARGET_ID }))).status).toBe(
      404,
    );
    expect(upsert).not.toHaveBeenCalled();
    expect(eqDelete).not.toHaveBeenCalled();
  });

  it('revokes an existing membership', async () => {
    mocks.server.mockReturnValue(authClient({}));
    const { client, eqDelete } = adminClient({ tier: 'pro', expires_at: '2030-01-01T00:00:00Z' });
    mocks.admin.mockReturnValue(client);
    expect((await changeMembership(request({ action: 'revoke', userId: TARGET_ID }))).status).toBe(
      200,
    );
    expect(eqDelete).toHaveBeenCalledWith('user_id', TARGET_ID);
  });
});

describe('account deletion', () => {
  function deleter(target: { email: string; app_metadata?: Record<string, unknown> } | null) {
    const deleteUserFn = vi.fn().mockResolvedValue({ error: null });
    const client = {
      auth: {
        admin: {
          getUserById: vi
            .fn()
            .mockResolvedValue(
              target
                ? { data: { user: { id: TARGET_ID, ...target } }, error: null }
                : { data: { user: null }, error: { message: 'nf' } },
            ),
          deleteUser: deleteUserFn,
        },
      },
    };
    return { client, deleteUserFn };
  }
  const del = (body: unknown) => deleteUser(request(body, 'token', 'DELETE'));

  it('blocks a non-admin before touching data', async () => {
    mocks.server.mockReturnValue(authClient({ appRole: null }));
    expect((await del({ userId: TARGET_ID, confirmEmail: 'a@b.c' })).status).toBe(403);
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it('refuses without the exact email, for yourself and for other admins', async () => {
    mocks.server.mockReturnValue(authClient({}));
    const { client, deleteUserFn } = deleter({ email: 'user@example.test' });
    mocks.admin.mockReturnValue(client);
    expect((await del({ userId: TARGET_ID, confirmEmail: 'other@example.test' })).status).toBe(400);
    expect((await del({ userId: ADMIN_ID, confirmEmail: 'x@example.test' })).status).toBe(403);
    expect((await del({ userId: 'bad', confirmEmail: 'x@example.test' })).status).toBe(400);
    const adminTarget = deleter({
      email: 'boss@example.test',
      app_metadata: { app_role: 'admin' },
    });
    mocks.admin.mockReturnValue(adminTarget.client);
    expect((await del({ userId: TARGET_ID, confirmEmail: 'boss@example.test' })).status).toBe(403);
    expect(deleteUserFn).not.toHaveBeenCalled();
    expect(adminTarget.deleteUserFn).not.toHaveBeenCalled();
  });

  it('deletes only after the email matches, ignoring letter case', async () => {
    mocks.server.mockReturnValue(authClient({}));
    const { client, deleteUserFn } = deleter({ email: 'User@Example.test' });
    mocks.admin.mockReturnValue(client);
    expect((await del({ userId: TARGET_ID, confirmEmail: ' user@example.TEST ' })).status).toBe(
      200,
    );
    expect(deleteUserFn).toHaveBeenCalledWith(TARGET_ID);
  });
});
