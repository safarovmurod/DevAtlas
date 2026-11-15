// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

// Real PostgreSQL execution of the admin tools migration. auth.* is a small model of
// Supabase's JWT boundary (uid, aal claim, MFA factors, banned_until).
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
let db: PGlite;

async function actor(role: 'authenticated' | 'service_role' | 'anon', id = A, aal = 'aal1') {
  await db.exec(`reset role;
  set request.jwt.claim.sub='${id}';
  set request.jwt.claims='{"aal":"${aal}"}';
  set role ${role};`);
}
async function owner() {
  await db.exec('reset role');
}
const migration = (file: string) =>
  readFile(new URL('../supabase/migrations/' + file, import.meta.url), 'utf8');

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth;
  create table auth.users(id uuid primary key, banned_until timestamptz);
  create table auth.mfa_factors(user_id uuid, status text);
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  create function auth.jwt() returns jsonb language sql as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
  create function public.react_mentor_session_allowed() returns boolean language sql as $$ select false $$;
  create table public.react_mentor_profiles(user_id uuid primary key references auth.users(id), display_name text);
  grant usage on schema auth, public to anon, authenticated, service_role;
  grant execute on all functions in schema auth to anon, authenticated, service_role;`);
  for (const file of [
    '20261022010000_memberships_chat.sql',
    '20261115000000_chat_ultra_only.sql',
    '20261116000000_admin_tools.sql',
    // Applying twice must succeed: the migration is idempotent.
    '20261116000000_admin_tools.sql',
  ])
    await db.exec(await migration(file));
}, 30000);

beforeEach(async () => {
  await owner();
  await db.exec(`truncate auth.users cascade; truncate auth.mfa_factors;
  truncate public.react_mentor_admin_audit;
  insert into auth.users(id) values('${A}'),('${B}');`);
});
afterAll(async () => {
  await db?.close();
});

describe('session check with bans', () => {
  it('allows a normal session and rejects a banned account immediately', async () => {
    await actor('authenticated', A);
    expect((await db.query('select public.react_mentor_session_allowed() as ok')).rows).toEqual([
      { ok: true },
    ]);
    await owner();
    await db.exec(`update auth.users set banned_until = now() + interval '1 day' where id='${A}'`);
    await actor('authenticated', A);
    expect((await db.query('select public.react_mentor_session_allowed() as ok')).rows).toEqual([
      { ok: false },
    ]);
    await owner();
    await db.exec(
      `update auth.users set banned_until = now() - interval '1 minute' where id='${A}'`,
    );
    await actor('authenticated', A);
    expect((await db.query('select public.react_mentor_session_allowed() as ok')).rows).toEqual([
      { ok: true },
    ]);
  });

  it('still requires aal2 for an account with a verified factor', async () => {
    await owner();
    await db.exec(`insert into auth.mfa_factors values('${A}','verified')`);
    await actor('authenticated', A, 'aal1');
    expect((await db.query('select public.react_mentor_session_allowed() as ok')).rows[0]).toEqual({
      ok: false,
    });
    await actor('authenticated', A, 'aal2');
    expect((await db.query('select public.react_mentor_session_allowed() as ok')).rows[0]).toEqual({
      ok: true,
    });
  });
});

describe('membership provenance', () => {
  it('records source and granter, rejects unknown sources and stays private', async () => {
    await actor('service_role', B);
    await db.query(
      "insert into public.react_mentor_memberships(user_id,tier,expires_at,granted_by,granted_at) values($1,'pro',now()+interval '1 day',$2,now())",
      [A, B],
    );
    await expect(
      db.query(
        "insert into public.react_mentor_memberships(user_id,tier,expires_at,source) values($1,'pro',now()+interval '1 day','gift')",
        [B],
      ),
    ).rejects.toThrow(/source_check/);
    await actor('authenticated', A);
    expect(
      (await db.query('select tier, source from public.react_mentor_memberships')).rows,
    ).toEqual([{ tier: 'pro', source: 'admin' }]);
    await expect(
      db.query("update public.react_mentor_memberships set source='payment'"),
    ).rejects.toThrow(/permission denied/i);
  });
});

describe('user notifications', () => {
  async function send(to = A, body = 'Салом!') {
    await actor('service_role', B);
    const result = await db.query<{ id: string }>(
      'insert into public.react_mentor_notifications(user_id, body, created_by) values($1,$2,$3) returning id',
      [to, body, B],
    );
    return result.rows[0].id;
  }

  it('lets only the server create messages and limits their length', async () => {
    await actor('authenticated', A);
    await expect(
      db.query("insert into public.react_mentor_notifications(user_id, body) values($1,'x')", [A]),
    ).rejects.toThrow(/permission denied/i);
    await actor('anon', A);
    await expect(db.query('select id from public.react_mentor_notifications')).rejects.toThrow(
      /permission denied/i,
    );
    await expect(send(A, '   ')).rejects.toThrow(/check/i);
    await expect(send(A, 'x'.repeat(501))).rejects.toThrow(/check/i);
    expect(await send(A, 'x'.repeat(500))).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('shows each user only their own unread messages and hides the sender', async () => {
    await send(A, 'for A');
    await send(B, 'for B');
    await actor('authenticated', A);
    expect(
      (await db.query('select body from public.react_mentor_notifications where read_at is null'))
        .rows,
    ).toEqual([{ body: 'for A' }]);
    await expect(
      db.query('select created_by from public.react_mentor_notifications'),
    ).rejects.toThrow(/permission denied/i);
    await expect(
      db.query("update public.react_mentor_notifications set body='changed'"),
    ).rejects.toThrow(/permission denied/i);
  });

  it('marks only your own message as read, through the RPC', async () => {
    const mine = await send(A, 'mine');
    const theirs = await send(B, 'theirs');
    await actor('authenticated', A);
    await db.query('select public.react_mentor_mark_notification_read($1)', [mine]);
    await db.query('select public.react_mentor_mark_notification_read($1)', [theirs]);
    await owner();
    const rows = (
      await db.query<{ body: string; read: boolean }>(
        'select body, read_at is not null as read from public.react_mentor_notifications order by body',
      )
    ).rows;
    expect(rows).toEqual([
      { body: 'mine', read: true },
      { body: 'theirs', read: false },
    ]);
  });

  it('hides messages from a banned account', async () => {
    await send(A, 'hello');
    await owner();
    await db.exec(`update auth.users set banned_until = now() + interval '1 day' where id='${A}'`);
    await actor('authenticated', A);
    expect((await db.query('select id from public.react_mentor_notifications')).rows).toHaveLength(
      0,
    );
  });
});

describe('admin audit log', () => {
  it('is append-only for the server and invisible to learners', async () => {
    await actor('service_role', B);
    await db.query(
      "insert into public.react_mentor_admin_audit(actor_id, action, target_id, details) values($1,'ban',$2,'{\"days\":7}')",
      [B, A],
    );
    expect((await db.query('select action from public.react_mentor_admin_audit')).rows).toEqual([
      { action: 'ban' },
    ]);
    await expect(db.query('delete from public.react_mentor_admin_audit')).rejects.toThrow(
      /permission denied/i,
    );
    await expect(
      db.query("update public.react_mentor_admin_audit set action='unban'"),
    ).rejects.toThrow(/permission denied/i);
    await expect(
      db.query("insert into public.react_mentor_admin_audit(actor_id, action) values($1,'hack')", [
        B,
      ]),
    ).rejects.toThrow(/check/i);
    await actor('authenticated', A);
    await expect(db.query('select * from public.react_mentor_admin_audit')).rejects.toThrow(
      /permission denied/i,
    );
  });
});
