// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
let db: PGlite;

type StrikeRow = { strikes: number; blocked: boolean; blocked_until: string | null };

const getStrike = (id = A) =>
  db.query<StrikeRow>('select * from public.react_mentor_get_tutor_strike($1)', [id]);
const recordStrike = (id = A) =>
  db.query<StrikeRow>('select * from public.react_mentor_record_tutor_strike($1)', [id]);

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.role() returns text language sql as $$select current_setting('request.jwt.claim.role',true)$$;
    grant usage on schema auth,public to anon,authenticated,service_role;
    grant execute on all functions in schema auth to anon,authenticated,service_role;
  `);
  const sql = await readFile(
    new URL('../supabase/migrations/20261122000000_tutor_strikes.sql', import.meta.url),
    'utf8',
  );
  // Verify idempotency by applying the migration twice.
  await db.exec(sql);
  await db.exec(sql);
}, 30000);

beforeEach(async () => {
  await db.exec(`
    reset role;
    truncate auth.users cascade;
    insert into auth.users values('${A}'),('${B}');
    set request.jwt.claim.role='service_role';
    set role service_role;
  `);
});

afterAll(async () => {
  await db?.close();
});

describe('AI Tutor 3-strike / 3-day block SQL & RLS', () => {
  it('escalates 1 -> 2 -> 3 (blocked for 3 days) and keeps users isolated', async () => {
    expect((await getStrike(A)).rows[0]).toEqual({ strikes: 0, blocked: false, blocked_until: null });

    const s1 = (await recordStrike(A)).rows[0];
    expect(s1).toEqual({ strikes: 1, blocked: false, blocked_until: null });
    expect((await getStrike(B)).rows[0]).toEqual({ strikes: 0, blocked: false, blocked_until: null });

    const s2 = (await recordStrike(A)).rows[0];
    expect(s2).toEqual({ strikes: 2, blocked: false, blocked_until: null });

    const s3 = (await recordStrike(A)).rows[0];
    expect(s3.strikes).toBe(3);
    expect(s3.blocked).toBe(true);
    expect(s3.blocked_until).not.toBeNull();
    const diffHours =
      (new Date(s3.blocked_until as string).getTime() - Date.now()) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThan(71);
    expect(diffHours).toBeLessThan(73);

    // Status remains blocked until 3 days pass.
    const check = (await getStrike(A)).rows[0];
    expect(check.blocked).toBe(true);
    expect(check.strikes).toBe(3);
  });

  it('resets after the 3-day block expires so the next violation starts back at 1/3', async () => {
    await recordStrike(A);
    await recordStrike(A);
    await recordStrike(A);
    await db.exec(`
      reset role;
      update public.react_mentor_tutor_strikes
         set blocked_until = now() - interval '1 minute'
       where user_id = '${A}';
      set request.jwt.claim.role='service_role';
      set role service_role;
    `);
    expect((await getStrike(A)).rows[0]).toEqual({ strikes: 0, blocked: false, blocked_until: null });
    expect((await recordStrike(A)).rows[0]).toEqual({
      strikes: 1,
      blocked: false,
      blocked_until: null,
    });
  });

  it('denies anon and authenticated callers from reading or mutating strike records', async () => {
    await recordStrike(A);
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`reset role; set request.jwt.claim.role='${role}'; set role ${role};`);
      await expect(getStrike(A)).rejects.toThrow(/permission denied/i);
      await expect(recordStrike(A)).rejects.toThrow(/permission denied/i);
      await expect(db.query('select * from public.react_mentor_tutor_strikes')).rejects.toThrow(
        /permission denied/i,
      );
      await expect(db.query('delete from public.react_mentor_tutor_strikes')).rejects.toThrow(
        /permission denied/i,
      );
    }
  });
});
