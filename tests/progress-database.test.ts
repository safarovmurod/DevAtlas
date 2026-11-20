// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
let db: PGlite;
const migration = (name: string) =>
  readFile(new URL('../supabase/migrations/' + name, import.meta.url), 'utf8');

async function actor(id = A, aal = 'aal1') {
  await db.exec(`reset role; set request.jwt.claim.sub='${id}';
    set request.jwt.claims='{"aal":"${aal}"}'; set role authenticated;`);
}
const save = (revision: number | null, data: unknown = { notes: ['saved'] }) =>
  db.query<{ user_id: string; data: unknown; revision: number }>(
    'select user_id,data,revision from public.react_mentor_save_progress($1,$2::jsonb)',
    [revision, JSON.stringify(data)],
  );
const rows = () => db.query('select user_id,data,revision from public.react_mentor_progress');

beforeAll(async () => {
  db = new PGlite();
  // Supabase identity/storage helpers are modeled locally; the actual account and
  // progress migrations below supply all progress tables, policies and RPC code.
  await db.exec(`create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key);
    create table auth.mfa_factors(user_id uuid, status text);
    create function auth.uid() returns uuid language sql as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.jwt() returns jsonb language sql as $$
      select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    create schema storage;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(bucket_id text,name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(name text) returns text[] language sql as $$
      select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
    grant usage on schema auth,public,storage to anon,authenticated;
    grant execute on all functions in schema auth,storage to anon,authenticated;`);
  await db.exec(await migration('20261004000000_accounts.sql'));
  await db.exec(await migration('20261005000000_progress_conflict.sql'));
  const guard = await migration('20261118010000_progress_revision_guard.sql');
  await db.exec(guard);
  await db.exec(guard); // The additive replacement is safe to apply again.
}, 30000);

beforeEach(async () => {
  await db.exec(`reset role; truncate auth.mfa_factors; truncate auth.users cascade;
    insert into auth.users values('${A}'),('${B}');`);
  await actor();
});
afterAll(async () => { await db?.close(); });

describe('protected progress compare-and-swap', () => {
  it('rejects NULL on both creation and update without writing progress', async () => {
    await expect(save(null)).rejects.toMatchObject({ code: '22023' });
    expect((await rows()).rows).toEqual([]);
    await save(0);
    await expect(save(null, { notes: ['overwrite'] })).rejects.toMatchObject({ code: '22023' });
    expect((await rows()).rows).toEqual([{ user_id: A, data: { notes: ['saved'] }, revision: 1 }]);
  });

  it('preserves revision-zero creation and current-revision updates', async () => {
    expect((await save(0)).rows).toEqual([{ user_id: A, data: { notes: ['saved'] }, revision: 1 }]);
    expect((await save(1, { notes: ['next'] })).rows).toEqual([
      { user_id: A, data: { notes: ['next'] }, revision: 2 },
    ]);
  });

  it('keeps negative and stale revisions as PT409 conflicts without writes', async () => {
    await expect(save(-1)).rejects.toMatchObject({ code: 'PT409' });
    expect((await rows()).rows).toEqual([]);
    await save(0);
    for (const revision of [-1, 0])
      await expect(save(revision, { notes: ['overwrite'] })).rejects.toMatchObject({ code: 'PT409' });
    expect((await rows()).rows).toEqual([{ user_id: A, data: { notes: ['saved'] }, revision: 1 }]);
  });

  it('allows just one competing write at the same expected revision', async () => {
    await save(0);
    const writes = await Promise.allSettled([save(1, { device: 'a' }), save(1, { device: 'b' })]);
    expect(writes.filter((write) => write.status === 'fulfilled')).toHaveLength(1);
    expect(writes.find((write) => write.status === 'rejected')).toMatchObject({
      reason: { code: 'PT409' },
    });
    expect((await rows()).rows[0]).toMatchObject({ user_id: A, revision: 2 });
  });

  it('retains object-only and 2 MB payload checks', async () => {
    for (const data of [null, [], 'text', { text: 'x'.repeat(2097152) }])
      await expect(save(0, data)).rejects.toMatchObject({ code: '22023' });
    expect((await rows()).rows).toEqual([]);
  });

  it('keeps owner-only reads, direct-write denial and MFA enforcement', async () => {
    await save(0);
    await actor(B);
    expect((await rows()).rows).toEqual([]);
    await expect(db.query("update public.react_mentor_progress set data='{}'::jsonb"))
      .rejects.toMatchObject({ code: '42501' });
    await db.exec(`reset role; insert into auth.mfa_factors values('${A}','verified');`);
    await actor(A);
    await expect(save(1)).rejects.toMatchObject({ code: '42501' });
    expect((await rows()).rows).toEqual([]);
    await actor(A, 'aal2');
    expect((await save(1)).rows[0]).toMatchObject({ user_id: A, revision: 2 });
  });

  it('retains authenticated-only execution, SECURITY DEFINER and fixed search_path', async () => {
    await db.exec('reset role');
    const result = await db.query(`select
      has_function_privilege('anon','public.react_mentor_save_progress(bigint,jsonb)','execute') as anon,
      has_function_privilege('authenticated','public.react_mentor_save_progress(bigint,jsonb)','execute') as authenticated,
      prosecdef, proconfig from pg_proc
      where oid='public.react_mentor_save_progress(bigint,jsonb)'::regprocedure`);
    expect(result.rows[0]).toEqual({
      anon: false, authenticated: true, prosecdef: true, proconfig: ['search_path=""'],
    });
    await db.exec('set role anon');
    await expect(save(0)).rejects.toMatchObject({ code: '42501' });
  });
});
