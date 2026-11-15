// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeAdmin, type FakeUser } from './fake-supabase-admin';

const mocks = vi.hoisted(() => ({ server: vi.fn(), admin: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: mocks.server }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: mocks.admin }));

import { requireAdmin } from '@/lib/account/require-admin';
import { authenticatedUser } from '@/lib/account/require-user';
import { DELETE as deleteUser, GET as listUsers } from '@/app/api/admin/users/route';
import { POST as changeMembership } from '@/app/api/admin/memberships/route';
import { POST as changeRole } from '@/app/api/admin/roles/route';
import { POST as changeBan } from '@/app/api/admin/bans/route';
import { POST as sendNotification } from '@/app/api/admin/notifications/route';
import { GET as readAudit } from '@/app/api/admin/audit/route';

const OWNER_ID = '00000000-0000-4000-8000-000000000001';
const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const TARGET_ID = '22222222-2222-4222-8222-222222222222';
const OTHER_ID = '33333333-3333-4333-8333-333333333333';
const DAY = 86_400_000;

const owner: FakeUser = {
  id: OWNER_ID,
  email: 'owner@example.test',
  app_metadata: { provider: 'email', providers: ['email'], app_role: 'admin', app_owner: true },
};
const helper: FakeUser = {
  id: ADMIN_ID,
  email: 'helper@example.test',
  app_metadata: { provider: 'google', providers: ['google'], app_role: 'admin' },
};
const learner: FakeUser = { id: TARGET_ID, email: 'learner@example.test' };
const other: FakeUser = { id: OTHER_ID, email: 'other@example.test' };

function request(
  body?: unknown,
  options: { token?: string | null; method?: string; url?: string } = {},
) {
  const token = options.token === undefined ? 'token' : options.token;
  return new Request(options.url ?? 'https://example.test/api/admin', {
    method: options.method ?? (body === undefined ? 'GET' : 'POST'),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  });
}

/** The signed-in caller as seen by `auth.getUser` on the anon server client. */
function signIn(
  user: FakeUser | null,
  options: { level?: string; confirmed?: boolean; anonymous?: boolean; banned?: boolean } = {},
) {
  const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
  const client = {
    rpc,
    auth: {
      getUser: vi.fn().mockResolvedValue(
        user
          ? {
              data: {
                user: {
                  ...user,
                  is_anonymous: options.anonymous ?? false,
                  email_confirmed_at: options.confirmed === false ? null : '2026-01-01',
                  banned_until: options.banned ? new Date(Date.now() + DAY).toISOString() : null,
                },
              },
              error: null,
            }
          : { data: { user: null }, error: { message: 'bad' } },
      ),
      mfa: {
        getAuthenticatorAssuranceLevel: vi
          .fn()
          .mockResolvedValue({ data: { currentLevel: options.level ?? 'aal2' }, error: null }),
      },
    },
  };
  mocks.server.mockReturnValue(client);
  return client;
}

function backend(users: FakeUser[] = [owner, helper, learner, other], tables = {}) {
  const fake = fakeAdmin(users, tables);
  mocks.admin.mockReturnValue(fake.client);
  return fake;
}

const body = async (response: Response) => response.json();

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'info').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('requireAdmin', () => {
  it('rejects a missing or invalid token', async () => {
    expect(await requireAdmin(request(undefined, { token: null }))).toMatchObject({
      ok: false,
      status: 401,
    });
    signIn(null);
    expect(await requireAdmin(request())).toMatchObject({ ok: false, status: 401 });
  });

  it('rejects ordinary users and unconfirmed or anonymous accounts', async () => {
    for (const [user, options] of [
      [learner, {}],
      [{ ...learner, app_metadata: { app_role: 'user' } }, {}],
      [helper, { confirmed: false }],
      [helper, { anonymous: true }],
    ] as const) {
      signIn(user, options);
      expect(await requireAdmin(request())).toMatchObject({
        ok: false,
        status: 403,
        error: 'admin_required',
      });
    }
  });

  it('requires the aal2 level even for an admin', async () => {
    signIn(helper, { level: 'aal1' });
    expect(await requireAdmin(request())).toMatchObject({ status: 403, error: 'mfa_required' });
  });

  it('refuses a banned admin whose access token is still valid', async () => {
    signIn(helper, { banned: true });
    expect(await requireAdmin(request())).toMatchObject({ status: 403, error: 'account_banned' });
  });

  it('accepts an admin whose session passed the second factor', async () => {
    signIn(helper);
    expect(await requireAdmin(request())).toMatchObject({ ok: true });
  });
});

describe('authenticatedUser', () => {
  it('refuses a banned learner before any database call', async () => {
    const client = signIn(learner, { banned: true });
    expect(await authenticatedUser(request())).toBeNull();
    expect(client.rpc).not.toHaveBeenCalled();
    signIn(learner);
    expect(await authenticatedUser(request())).toMatchObject({ id: TARGET_ID });
  });
});

describe('every admin route checks the caller before touching data', () => {
  const calls: [string, () => Promise<Response>][] = [
    ['list users', () => listUsers(request())],
    [
      'delete user',
      () => deleteUser(request({ userId: TARGET_ID, confirmEmail: 'a@b.c' }, { method: 'DELETE' })),
    ],
    ['membership', () => changeMembership(request({ action: 'revoke', userId: TARGET_ID }))],
    ['role', () => changeRole(request({ action: 'grant', userId: TARGET_ID }))],
    ['ban', () => changeBan(request({ action: 'ban', userId: TARGET_ID, days: 1 }))],
    ['notify', () => sendNotification(request({ userId: TARGET_ID, message: 'hi' }))],
    ['audit', () => readAudit(request())],
  ];

  it.each(calls)(
    '%s: 401 for a bad token, 403 for a learner, a banned admin or without aal2',
    async (_, call) => {
      signIn(null);
      expect((await call()).status).toBe(401);
      signIn(learner);
      expect((await call()).status).toBe(403);
      signIn(helper, { level: 'aal1' });
      const noMfa = await call();
      expect(noMfa.status).toBe(403);
      expect(await body(noMfa)).toEqual({ error: 'mfa_required' });
      signIn(helper, { banned: true });
      expect((await call()).status).toBe(403);
      expect(mocks.admin).not.toHaveBeenCalled();
    },
  );
});

describe('request validation', () => {
  it('rejects malformed or oversized bodies before any data access', async () => {
    signIn(helper);
    const cases: [(r: Request) => Promise<Response>, unknown][] = [
      [changeMembership, { action: 'grant', userId: 'not-a-uuid', tier: 'pro', days: 30 }],
      [changeMembership, { action: 'grant', userId: TARGET_ID, tier: 'admin', days: 30 }],
      [changeMembership, { action: 'grant', userId: TARGET_ID, tier: 'pro', days: 0 }],
      [changeMembership, { action: 'grant', userId: TARGET_ID, tier: 'pro', days: 99999 }],
      [changeMembership, { action: 'delete-user', userId: TARGET_ID }],
      [changeRole, { action: 'promote', userId: TARGET_ID }],
      [changeRole, { userId: TARGET_ID }],
      [changeBan, { action: 'ban', userId: TARGET_ID, days: 0 }],
      [changeBan, { action: 'ban', userId: TARGET_ID, days: 1.5 }],
      [changeBan, { action: 'ban', userId: TARGET_ID }],
      [sendNotification, { userId: TARGET_ID, message: '' }],
      [sendNotification, { userId: TARGET_ID, message: '   \n  ' }],
      [sendNotification, { userId: TARGET_ID, message: 'x'.repeat(501) }],
      [sendNotification, { userId: 'nope', message: 'hi' }],
      [sendNotification, { userId: TARGET_ID, message: 42 }],
      [changeRole, '{not json'],
    ];
    for (const [route, payload] of cases) {
      const response = await route(request(payload));
      expect(response.status).toBe(400);
    }
    const huge = await sendNotification(request({ userId: TARGET_ID, message: 'x'.repeat(5000) }));
    expect(huge.status).toBe(413);
    expect(mocks.admin).not.toHaveBeenCalled();
  });
});

describe('owner protection', () => {
  it('blocks every destructive action against the owner, even by another admin', async () => {
    signIn(helper);
    const fake = backend([owner, helper], {
      react_mentor_memberships: [
        { user_id: OWNER_ID, tier: 'expert', expires_at: '2099-01-01T00:00:00.000Z' },
      ],
    });
    const attempts = [
      changeRole(request({ action: 'revoke', userId: OWNER_ID })),
      changeBan(request({ action: 'ban', userId: OWNER_ID, days: null })),
      changeMembership(request({ action: 'revoke', userId: OWNER_ID })),
      deleteUser(
        request({ userId: OWNER_ID, confirmEmail: 'owner@example.test' }, { method: 'DELETE' }),
      ),
    ];
    for (const response of await Promise.all(attempts)) {
      expect(response.status).toBe(403);
      expect(await body(response)).toEqual({ error: 'owner_protected' });
    }
    expect(fake.spies.updateUserById).not.toHaveBeenCalled();
    expect(fake.spies.deleteUser).not.toHaveBeenCalled();
    expect(fake.data.react_mentor_memberships).toHaveLength(1);
    expect(fake.data.react_mentor_admin_audit).toHaveLength(0);
  });

  it('still lets an admin extend the owner membership', async () => {
    signIn(helper);
    const end = new Date(Date.now() + 5 * DAY).toISOString();
    backend([owner, helper], {
      react_mentor_memberships: [{ user_id: OWNER_ID, tier: 'pro', expires_at: end }],
    });
    const response = await changeMembership(
      request({ action: 'extend', userId: OWNER_ID, days: 3 }),
    );
    expect(response.status).toBe(200);
  });

  it('does not let an admin take days off the owner membership', async () => {
    signIn(helper);
    const end = new Date(Date.now() + 5 * DAY).toISOString();
    const fake = backend([owner, helper], {
      react_mentor_memberships: [{ user_id: OWNER_ID, tier: 'pro', expires_at: end }],
    });
    const response = await changeMembership(
      request({ action: 'shorten', userId: OWNER_ID, days: 3 }),
    );
    expect(response.status).toBe(403);
    expect(fake.data.react_mentor_memberships[0].expires_at).toBe(end);
  });
});

describe('taking days off a membership', () => {
  it('moves the end date back, keeps the tier and logs negative days', async () => {
    signIn(helper);
    const end = new Date(Date.now() + 20 * DAY).toISOString();
    const fake = backend(undefined, {
      react_mentor_memberships: [{ user_id: TARGET_ID, tier: 'expert', expires_at: end }],
    });
    const response = await changeMembership(
      request({ action: 'shorten', userId: TARGET_ID, days: 5 }),
    );
    expect(response.status).toBe(200);
    const saved = fake.data.react_mentor_memberships[0];
    expect(saved.tier).toBe('expert');
    expect(new Date(end).getTime() - new Date(String(saved.expires_at)).getTime()).toBe(5 * DAY);
    expect(fake.data.react_mentor_admin_audit[0]).toMatchObject({
      action: 'membership_extend',
      details: expect.objectContaining({ days: -5 }),
    });
  });

  it('never goes below today: too many days end the plan now', async () => {
    signIn(helper);
    const end = new Date(Date.now() + 2 * DAY).toISOString();
    const fake = backend(undefined, {
      react_mentor_memberships: [{ user_id: TARGET_ID, tier: 'pro', expires_at: end }],
    });
    const before = Date.now();
    const response = await changeMembership(
      request({ action: 'shorten', userId: TARGET_ID, days: 30 }),
    );
    expect(response.status).toBe(200);
    const saved = new Date(String(fake.data.react_mentor_memberships[0].expires_at)).getTime();
    expect(saved).toBeGreaterThanOrEqual(before);
    expect(saved).toBeLessThanOrEqual(Date.now());
  });

  it('refuses an expired or missing plan and bad day counts', async () => {
    signIn(helper);
    const fake = backend(undefined, {
      react_mentor_memberships: [
        { user_id: TARGET_ID, tier: 'pro', expires_at: new Date(Date.now() - DAY).toISOString() },
      ],
    });
    expect(
      (await changeMembership(request({ action: 'shorten', userId: TARGET_ID, days: 1 }))).status,
    ).toBe(409);
    for (const days of [0, -3, 4000, 1.5])
      expect(
        (await changeMembership(request({ action: 'shorten', userId: TARGET_ID, days }))).status,
      ).toBe(400);
    fake.data.react_mentor_memberships.length = 0;
    expect(
      (await changeMembership(request({ action: 'shorten', userId: TARGET_ID, days: 1 }))).status,
    ).toBe(404);
  });
});

describe('admin role', () => {
  it('only the owner grants or removes the role', async () => {
    signIn(helper);
    const fake = backend();
    const response = await changeRole(request({ action: 'grant', userId: TARGET_ID }));
    expect(response.status).toBe(403);
    expect(await body(response)).toEqual({ error: 'owner_required' });
    expect(fake.spies.updateUserById).not.toHaveBeenCalled();
  });

  it('owner grants the role, keeps other metadata and gets the updated user back', async () => {
    signIn(owner);
    const fake = backend();
    const response = await changeRole(request({ action: 'grant', userId: TARGET_ID }));
    expect(response.status).toBe(200);
    expect((await body(response)).user).toMatchObject({
      id: TARGET_ID,
      isAdmin: true,
      isOwner: false,
    });
    expect(fake.accounts.get(TARGET_ID)?.app_metadata).toMatchObject({
      app_role: 'admin',
      providers: ['email'],
    });
    expect(fake.data.react_mentor_admin_audit[0]).toMatchObject({
      action: 'role_grant',
      actor_id: OWNER_ID,
      target_id: TARGET_ID,
    });
  });

  it('owner removes the role from an admin but not from themself', async () => {
    signIn(owner);
    const fake = backend();
    const removed = await changeRole(request({ action: 'revoke', userId: ADMIN_ID }));
    expect(removed.status).toBe(200);
    expect((await body(removed)).user.isAdmin).toBe(false);
    expect(fake.accounts.get(ADMIN_ID)?.app_metadata).not.toHaveProperty('app_role');
    expect(fake.accounts.get(ADMIN_ID)?.app_metadata).toMatchObject({ providers: ['google'] });

    const self = await changeRole(request({ action: 'revoke', userId: OWNER_ID }));
    expect(self.status).toBe(403);
    expect(fake.accounts.get(OWNER_ID)?.app_metadata).toMatchObject({
      app_role: 'admin',
      app_owner: true,
    });
  });

  it('refuses to promote an unconfirmed or banned account', async () => {
    signIn(owner);
    backend([
      owner,
      { ...learner, email_confirmed_at: null },
      { ...other, banned_until: new Date(Date.now() + DAY).toISOString() },
    ]);
    expect((await changeRole(request({ action: 'grant', userId: TARGET_ID }))).status).toBe(400);
    expect((await changeRole(request({ action: 'grant', userId: OTHER_ID }))).status).toBe(409);
  });

  it('returns 404 for an unknown account', async () => {
    signIn(owner);
    backend([owner]);
    expect((await changeRole(request({ action: 'grant', userId: TARGET_ID }))).status).toBe(404);
  });
});

describe('ban and unban', () => {
  it('bans for a number of days through ban_duration and shows it in the row', async () => {
    signIn(helper);
    const fake = backend();
    const response = await changeBan(request({ action: 'ban', userId: TARGET_ID, days: 7 }));
    expect(response.status).toBe(200);
    expect(fake.spies.updateUserById).toHaveBeenCalledWith(TARGET_ID, { ban_duration: '168h' });
    const user = (await body(response)).user;
    expect(new Date(user.bannedUntil).getTime() - Date.now()).toBeGreaterThan(6.99 * DAY);
    expect(fake.data.react_mentor_admin_audit[0]).toMatchObject({
      action: 'ban',
      details: { days: 7 },
    });
  });

  it('bans until lifted and unbans with "none"', async () => {
    signIn(helper);
    const fake = backend();
    await changeBan(request({ action: 'ban', userId: TARGET_ID, days: null }));
    expect(fake.spies.updateUserById).toHaveBeenLastCalledWith(TARGET_ID, {
      ban_duration: '876000h',
    });
    const lifted = await changeBan(request({ action: 'unban', userId: TARGET_ID }));
    expect(fake.spies.updateUserById).toHaveBeenLastCalledWith(TARGET_ID, { ban_duration: 'none' });
    expect((await body(lifted)).user.bannedUntil).toBeNull();
  });

  it('cannot ban yourself or another admin', async () => {
    signIn(helper);
    const fake = backend();
    const self = await changeBan(request({ action: 'ban', userId: ADMIN_ID, days: 1 }));
    expect(await body(self)).toEqual({ error: 'cannot_target_self' });
    signIn(owner);
    const admin = await changeBan(request({ action: 'ban', userId: ADMIN_ID, days: 1 }));
    expect(await body(admin)).toEqual({ error: 'admin_protected' });
    expect(fake.spies.updateUserById).not.toHaveBeenCalled();
  });
});

describe('notifications', () => {
  it('stores trimmed plain text from the server with the sender', async () => {
    signIn(helper);
    const fake = backend();
    const response = await sendNotification(
      request({ userId: TARGET_ID, message: '  Салом!\u0007 <b>Дарс</b>  ' }),
    );
    expect(response.status).toBe(200);
    expect(fake.data.react_mentor_notifications).toEqual([
      expect.objectContaining({
        user_id: TARGET_ID,
        body: 'Салом! <b>Дарс</b>',
        created_by: ADMIN_ID,
      }),
    ]);
    expect(fake.data.react_mentor_admin_audit[0]).toMatchObject({
      action: 'notify',
      details: { length: 'Салом! <b>Дарс</b>'.length },
    });
  });

  it('accepts exactly 500 characters and refuses unknown accounts', async () => {
    signIn(helper);
    backend();
    expect(
      (await sendNotification(request({ userId: TARGET_ID, message: 'я'.repeat(500) }))).status,
    ).toBe(200);
    backend([helper]);
    expect((await sendNotification(request({ userId: TARGET_ID, message: 'hi' }))).status).toBe(
      404,
    );
  });

  it('reports a database failure instead of pretending success', async () => {
    signIn(helper);
    const fake = backend();
    fake.failing.add('react_mentor_notifications');
    expect((await sendNotification(request({ userId: TARGET_ID, message: 'hi' }))).status).toBe(
      503,
    );
  });
});

describe('memberships', () => {
  it('grants a plan and records who gave it', async () => {
    signIn(helper);
    const fake = backend();
    const response = await changeMembership(
      request({ action: 'grant', userId: TARGET_ID, tier: 'expert', days: 10 }),
    );
    expect(response.status).toBe(200);
    const saved = fake.data.react_mentor_memberships[0];
    expect(saved).toMatchObject({
      user_id: TARGET_ID,
      tier: 'expert',
      source: 'admin',
      granted_by: ADMIN_ID,
    });
    const days = (new Date(String(saved.expires_at)).getTime() - Date.now()) / DAY;
    expect(days).toBeGreaterThan(9.99);
    expect(days).toBeLessThan(10.01);
    expect((await body(response)).user.membership).toMatchObject({
      tier: 'expert',
      active: true,
      daysLeft: 10,
      source: 'admin',
      grantedByEmail: 'helper@example.test',
    });
  });

  it('extends from the current end date and keeps tier and granter', async () => {
    signIn(helper);
    const end = new Date(Date.now() + 20 * DAY).toISOString();
    const fake = backend(undefined, {
      react_mentor_memberships: [
        {
          user_id: TARGET_ID,
          tier: 'expert',
          expires_at: end,
          source: 'admin',
          granted_by: OWNER_ID,
          granted_at: '2026-11-01T00:00:00.000Z',
        },
      ],
    });
    const response = await changeMembership(
      request({ action: 'extend', userId: TARGET_ID, days: 5 }),
    );
    expect(response.status).toBe(200);
    const saved = fake.data.react_mentor_memberships[0];
    expect(saved).toMatchObject({ tier: 'expert', granted_by: OWNER_ID });
    expect(new Date(String(saved.expires_at)).getTime() - new Date(end).getTime()).toBe(5 * DAY);
    expect((await body(response)).user.membership.grantedByEmail).toBe('owner@example.test');
  });

  it('refuses to extend or revoke when there is no membership', async () => {
    signIn(helper);
    const fake = backend();
    expect(
      (await changeMembership(request({ action: 'extend', userId: TARGET_ID, days: 5 }))).status,
    ).toBe(404);
    expect((await changeMembership(request({ action: 'revoke', userId: TARGET_ID }))).status).toBe(
      404,
    );
    expect(fake.data.react_mentor_memberships).toHaveLength(0);
  });

  it('revokes an existing membership and returns the row without it', async () => {
    signIn(helper);
    const fake = backend(undefined, {
      react_mentor_memberships: [
        { user_id: TARGET_ID, tier: 'pro', expires_at: '2099-01-01T00:00:00.000Z' },
      ],
    });
    const response = await changeMembership(request({ action: 'revoke', userId: TARGET_ID }));
    expect(response.status).toBe(200);
    expect((await body(response)).user.membership).toBeNull();
    expect(fake.data.react_mentor_memberships).toHaveLength(0);
    expect(fake.data.react_mentor_admin_audit[0]).toMatchObject({ action: 'membership_revoke' });
  });
});

describe('user list', () => {
  const past = new Date(Date.now() - DAY).toISOString();
  const future = new Date(Date.now() + 3 * DAY).toISOString();
  function seeded() {
    return backend(
      [
        owner,
        helper,
        learner,
        { ...other, banned_until: new Date(Date.now() + DAY).toISOString() },
      ],
      {
        react_mentor_memberships: [
          { user_id: TARGET_ID, tier: 'pro', expires_at: future, granted_by: OWNER_ID },
          { user_id: OTHER_ID, tier: 'expert', expires_at: past },
        ],
      },
    );
  }
  const list = async (query = '') =>
    body(
      await listUsers(request(undefined, { url: 'https://example.test/api/admin/users' + query })),
    );

  it('lists everyone with status, membership details and the viewer', async () => {
    signIn(owner);
    seeded();
    const result = await list();
    expect(result).toMatchObject({
      total: 4,
      filter: 'all',
      viewer: { id: OWNER_ID, isOwner: true },
    });
    const byId = Object.fromEntries(result.users.map((user: { id: string }) => [user.id, user]));
    expect(byId[OWNER_ID]).toMatchObject({ isOwner: true, isAdmin: true });
    expect(byId[TARGET_ID].membership).toMatchObject({
      active: true,
      daysLeft: 3,
      grantedByEmail: 'owner@example.test',
    });
    expect(byId[OTHER_ID].membership).toMatchObject({ active: false, daysLeft: 0 });
    expect(byId[OTHER_ID].bannedUntil).not.toBeNull();
  });

  it('filters by paid, expired, admins and banned, and searches by email on the server', async () => {
    signIn(helper);
    seeded();
    const ids = async (query: string) =>
      (await list(query)).users.map((user: { id: string }) => user.id).sort();
    expect(await ids('?filter=paid')).toEqual([TARGET_ID]);
    expect(await ids('?filter=expired')).toEqual([OTHER_ID]);
    expect(await ids('?filter=admins')).toEqual([OWNER_ID, ADMIN_ID].sort());
    expect(await ids('?filter=banned')).toEqual([OTHER_ID]);
    expect(await ids('?q=LEARNER')).toEqual([TARGET_ID]);
    expect(await ids('?q=example.test&filter=admins')).toEqual([OWNER_ID, ADMIN_ID].sort());
    expect((await list('?filter=everything')).filter).toBe('all');
    expect((await list('?q=helper')).viewer).toEqual({ id: ADMIN_ID, isOwner: false });
  });
});

describe('account deletion', () => {
  const del = (payload: unknown) => deleteUser(request(payload, { method: 'DELETE' }));

  it('refuses without the exact email, for yourself, for admins and for the owner', async () => {
    signIn(helper);
    const fake = backend();
    expect((await del({ userId: TARGET_ID, confirmEmail: 'other@example.test' })).status).toBe(400);
    expect((await del({ userId: ADMIN_ID, confirmEmail: 'helper@example.test' })).status).toBe(403);
    expect((await del({ userId: 'bad', confirmEmail: 'x@example.test' })).status).toBe(400);
    signIn(owner);
    expect((await del({ userId: ADMIN_ID, confirmEmail: 'helper@example.test' })).status).toBe(403);
    expect(fake.spies.deleteUser).not.toHaveBeenCalled();
  });

  it('deletes after the email matches, ignoring case, and logs it', async () => {
    signIn(helper);
    const fake = backend(undefined, {
      react_mentor_memberships: [
        { user_id: TARGET_ID, tier: 'pro', expires_at: '2099-01-01T00:00:00.000Z' },
      ],
    });
    const response = await del({ userId: TARGET_ID, confirmEmail: ' LEARNER@example.TEST ' });
    expect(response.status).toBe(200);
    expect(await body(response)).toEqual({ deleted: true, userId: TARGET_ID });
    expect(fake.spies.deleteUser).toHaveBeenCalledWith(TARGET_ID);
    expect(fake.accounts.has(TARGET_ID)).toBe(false);
    expect(fake.data.react_mentor_memberships).toHaveLength(0);
    expect(fake.data.react_mentor_admin_audit[0]).toMatchObject({
      action: 'delete_user',
      target_email: 'learner@example.test',
    });
  });
});

describe('audit log', () => {
  it('returns the newest entries first with a bounded limit', async () => {
    signIn(helper);
    backend(undefined, {
      react_mentor_admin_audit: [
        {
          id: 'a',
          action: 'ban',
          actor_email: 'x',
          created_at: '2026-11-01T00:00:00Z',
          details: {},
        },
        {
          id: 'b',
          action: 'unban',
          actor_email: 'x',
          created_at: '2026-11-02T00:00:00Z',
          details: {},
        },
        {
          id: 'c',
          action: 'notify',
          actor_email: 'x',
          created_at: '2026-11-03T00:00:00Z',
          details: {},
        },
      ],
    });
    const url = (limit: string) => `https://example.test/api/admin/audit?limit=${limit}`;
    const two = await body(await readAudit(request(undefined, { url: url('2') })));
    expect(two.entries.map((entry: { id: string }) => entry.id)).toEqual(['c', 'b']);
    const all = await body(await readAudit(request(undefined, { url: url('abc') })));
    expect(all.entries).toHaveLength(3);
  });
});
