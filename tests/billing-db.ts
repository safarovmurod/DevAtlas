import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { DAY, USER_A, USER_B } from './billing-helpers';

/**
 * A real PostgreSQL (PGlite) with the membership, admin and billing migrations applied.
 * auth.* is a small model of Supabase's identity tables and JWT helpers.
 */
const migration = (file: string) =>
  readFile(new URL('../supabase/migrations/' + file, import.meta.url), 'utf8');

export async function createBillingDb() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth;
  create table auth.users(id uuid primary key, banned_until timestamptz);
  create table auth.mfa_factors(user_id uuid, status text);
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  create function auth.jwt() returns jsonb language sql as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
  create function public.react_mentor_session_allowed() returns boolean language sql as $$ select true $$;
  create table public.react_mentor_profiles(user_id uuid primary key references auth.users(id), display_name text);
  grant usage on schema auth, public to anon, authenticated, service_role;
  grant execute on all functions in schema auth to anon, authenticated, service_role;`);
  for (const file of [
    '20261022010000_memberships_chat.sql',
    '20261115000000_chat_ultra_only.sql',
    '20261116000000_admin_tools.sql',
    '20261117000000_billing_dodo.sql',
    // Applying twice must succeed: the migration is idempotent.
    '20261117000000_billing_dodo.sql',
  ])
    await db.exec(await migration(file));
  return db;
}

export async function resetBillingDb(db: PGlite) {
  await db.exec(`reset role; truncate auth.users cascade;
  truncate public.react_mentor_webhook_events;
  insert into auth.users(id) values('${USER_A}'),('${USER_B}');`);
}

export type EventArgs = {
  id: string;
  type: string;
  at: string;
  user: string;
  grant: boolean;
  tier: string | null;
  expires: string | null;
  customer: string;
  sub: string;
  status: string;
  cancel: boolean;
};

export function eventArgs(overrides: Partial<EventArgs> = {}): EventArgs {
  return {
    id: 'wh_1',
    type: 'subscription.active',
    at: new Date().toISOString(),
    user: USER_A,
    grant: true,
    tier: 'pro',
    expires: new Date(Date.now() + 30 * DAY).toISOString(),
    customer: 'cus_1',
    sub: 'sub_1',
    status: 'active',
    cancel: false,
    ...overrides,
  };
}

export async function applyEvent(db: PGlite, overrides: Partial<EventArgs> = {}) {
  const a = eventArgs(overrides);
  const result = await db.query<{ result: string }>(
    'select public.react_mentor_apply_payment_event($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) as result',
    [a.id, a.type, a.at, a.user, a.grant, a.tier, a.expires, a.customer, a.sub, a.status, a.cancel],
  );
  return result.rows[0].result;
}
