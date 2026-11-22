// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const LEARNER = '11111111-1111-4111-8111-111111111111';
const OWNER = '22222222-2222-4222-8222-222222222222';
let db: PGlite;

async function actor(role: 'authenticated' | 'service_role' | 'anon', id = LEARNER) {
  await db.exec(`reset role;
  set request.jwt.claim.sub='${id}';
  set request.jwt.claim.role='${role}';
  set request.jwt.claims='{"aal":"aal1"}';
  set role ${role};`);
}
const migration = (file: string) =>
  readFile(new URL('../supabase/migrations/' + file, import.meta.url), 'utf8');

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth;
  create schema storage;
  create table auth.users(id uuid primary key, banned_until timestamptz, raw_app_meta_data jsonb default '{}'::jsonb);
  create table auth.mfa_factors(user_id uuid, status text);
  create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects(bucket_id text, name text, owner_id text, metadata jsonb, created_at timestamptz default now());
  create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  create function auth.role() returns text language sql as $$ select coalesce(nullif(current_setting('request.jwt.claim.role',true),''), current_user) $$;
  create function auth.jwt() returns jsonb language sql as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
  create function public.react_mentor_session_allowed() returns boolean language sql as $$ select false $$;
  create table public.react_mentor_profiles(user_id uuid primary key references auth.users(id) on delete cascade, display_name text);
  grant usage on schema auth, storage, public to anon, authenticated, service_role;
  grant execute on all functions in schema auth, storage to anon, authenticated, service_role;`);
  for (const file of [
    '20261022010000_memberships_chat.sql',
    '20261115000000_chat_ultra_only.sql',
    '20261116000000_admin_tools.sql',
    '20261118000000_community_all_members.sql',
    '20261122000000_tutor_strikes.sql',
    '20261122010000_moderation_and_admin.sql',
    // Idempotency verification
    '20261122010000_moderation_and_admin.sql',
  ]) {
    await db.exec(await migration(file));
  }
}, 40000);

beforeEach(async () => {
  await db.exec('reset role');
  await db.exec(`truncate auth.users cascade; truncate public.react_mentor_admin_audit;
  insert into auth.users(id, raw_app_meta_data) values
    ('${LEARNER}', '{}'::jsonb),
    ('${OWNER}', '{"app_owner":true,"app_role":"admin"}'::jsonb);
  insert into public.react_mentor_profiles(user_id, display_name) values
    ('${LEARNER}', 'Learner'),
    ('${OWNER}', 'Owner');`);
});

afterAll(async () => {
  await db?.close();
});

describe('moderation & admin database migration', () => {
  it('enforces 5-strike profanity block in PostgreSQL, blocks Community Chat RPC, and allows 1-click reset', async () => {
    await actor('service_role');
    for (let i = 1; i <= 4; i++) {
      const res = await db.query<{
        strikes: number;
        blocked: boolean;
        blocked_until: string | null;
      }>(`select * from public.react_mentor_record_profanity_strike('${LEARNER}')`);
      expect(res.rows[0].strikes).toBe(i);
      expect(res.rows[0].blocked).toBe(false);
    }

    // Before 5th strike, learner can still post in Community Chat.
    await actor('authenticated', LEARNER);
    const okMsg = await db.query(`select public.react_mentor_send_message('Салом ба ҳама!') as id`);
    expect(okMsg.rows[0]).toBeTruthy();

    // 5th strike triggers a 3-day block.
    await actor('service_role');
    const fifth = await db.query<{
      strikes: number;
      blocked: boolean;
      blocked_until: string | null;
    }>(`select * from public.react_mentor_record_profanity_strike('${LEARNER}')`);
    expect(fifth.rows[0].strikes).toBe(5);
    expect(fifth.rows[0].blocked).toBe(true);
    expect(fifth.rows[0].blocked_until).toBeTruthy();

    // Direct PostgreSQL RPC call MUST reject Community Chat posts while profanity-blocked!
    await actor('authenticated', LEARNER);
    await expect(
      db.query(`select public.react_mentor_send_message('Trying to bypass block')`),
    ).rejects.toThrow(/Moderation block active/i);

    // 1-click admin moderation reset unblocks immediately.
    await actor('service_role');
    await db.query(`select public.react_mentor_reset_moderation('${LEARNER}')`);
    const status = await db.query<{ profanity_strikes: number; profanity_blocked: boolean }>(
      `select * from public.react_mentor_get_moderation_status('${LEARNER}')`,
    );
    expect(status.rows[0].profanity_strikes).toBe(0);
    expect(status.rows[0].profanity_blocked).toBe(false);
  });

  it('exempts server-verified owner accounts from profanity strikes and blocks', async () => {
    await actor('service_role');
    const res = await db.query<{ strikes: number; blocked: boolean }>(
      `select * from public.react_mentor_record_profanity_strike('${OWNER}')`,
    );
    expect(res.rows[0]).toMatchObject({ strikes: 0, blocked: false });
  });

  it('rejects authenticated or anon callers from invoking moderation RPCs directly', async () => {
    await actor('authenticated', LEARNER);
    await expect(
      db.query(`select * from public.react_mentor_reset_moderation('${LEARNER}')`),
    ).rejects.toThrow();
  });

  it('accepts moderation_reset and broadcast_notify in react_mentor_admin_audit', async () => {
    await actor('service_role');
    await db.exec(`
      insert into public.react_mentor_admin_audit(actor_id, actor_email, action, target_id, details)
      values
        ('${OWNER}', 'safarovmancho@gmail.com', 'moderation_reset', '${LEARNER}', '{}'::jsonb),
        ('${OWNER}', 'safarovmancho@gmail.com', 'broadcast_notify', null, '{"count":3}'::jsonb);
    `);
    const count = await db.query<{ c: string }>(
      `select count(*)::text as c from public.react_mentor_admin_audit`,
    );
    expect(count.rows[0].c).toBe('2');
  });
});
