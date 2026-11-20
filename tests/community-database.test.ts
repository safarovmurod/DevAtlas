// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

// Real PostgreSQL (PGlite) run of the community migration. storage.* is a small model of
// Supabase Storage (buckets, objects, foldername); live Supabase is a separate check.
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
let db: PGlite;
async function actor(id = A, allowed = true) {
  await admin();
  if (!allowed) {
    await db.query(
      `insert into auth.mfa_factors(user_id, status)
       select $1, 'verified'
       where not exists (select 1 from auth.mfa_factors where user_id = $1 and status = 'verified')`,
      [id],
    );
  }
  const aal = allowed ? 'aal2' : 'aal1';
  await db.exec(
    `reset role; set request.jwt.claim.sub='${id}'; set request.jwt.claims='{"aal":"${aal}"}'; set role authenticated;`,
  );
}
async function admin() {
  await db.exec('reset role');
}
async function object(name: string, mime: string, size: number | null, owner = A) {
  await admin();
  const metadata =
    size === null
      ? JSON.stringify({ mimetype: mime })
      : JSON.stringify({ mimetype: mime, size });
  await db.query(
    `insert into storage.objects(bucket_id,name,owner_id,metadata) values('community-media',$1,$2,$3::jsonb)`,
    [name, owner, metadata],
  );
}
const file = (ext: string, owner = A) => `${owner}/${crypto.randomUUID()}.${ext}`;
const insertObject =
  "insert into storage.objects(bucket_id,name,owner_id,metadata) values('community-media',$1,$2,'{}')";

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
  create schema storage;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,owner_id text,metadata jsonb,created_at timestamptz default now());
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
  grant usage on schema auth,public,storage to anon,authenticated,service_role;
  grant select,insert,delete on storage.objects to authenticated;
  grant execute on all functions in schema auth,storage to anon,authenticated,service_role;`);
  for (const name of [
    '20261022010000_memberships_chat.sql',
    '20261115000000_chat_ultra_only.sql',
    '20261116000000_admin_tools.sql',
    '20261117000000_billing_dodo.sql',
    '20261118000000_community_all_members.sql',
    '20261119000000_backend_hardening.sql',
    // Idempotent: running it again must succeed.
    '20261119000000_backend_hardening.sql',
  ])
    await db.exec(
      await readFile(new URL('../supabase/migrations/' + name, import.meta.url), 'utf8'),
    );
}, 30000);
beforeEach(async () => {
  await admin();
  await db.exec(`truncate auth.users cascade; truncate auth.mfa_factors; truncate storage.objects;
  insert into auth.users(id) values('${A}'),('${B}');
  insert into public.react_mentor_profiles values('${A}','Learner A'),('${B}','Learner B');`);
});
afterAll(async () => {
  await db?.close();
});

describe('community chat for every signed-in member', () => {
  it('creates a private bucket with type and size limits', async () => {
    const { rows } = await db.query(
      "select public,file_size_limit,allowed_mime_types from storage.buckets where id='community-media'",
    );
    expect(rows[0]).toEqual({
      public: false,
      file_size_limit: 26214400,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
    });
  });

  it('lets a member without a paid plan read and write; a blocked session cannot', async () => {
    await actor(A);
    await db.query("select public.react_mentor_send_message('Hello')");
    expect((await db.query('select * from public.react_mentor_chat_messages')).rows).toHaveLength(
      1,
    );
    await actor(B, false);
    expect((await db.query('select * from public.react_mentor_chat_messages')).rows).toHaveLength(
      0,
    );
    await expect(db.query("select public.react_mentor_send_message('Blocked')")).rejects.toThrow(
      /membership/i,
    );
  });

  it('stores text as text, derives the author and keeps the rate limit', async () => {
    await actor(A);
    await db.query("select public.react_mentor_send_message('<img src=x onerror=alert(1)>')");
    expect(
      (await db.query('select author_id,body,kind from public.react_mentor_chat_messages')).rows,
    ).toEqual([{ author_id: A, body: '<img src=x onerror=alert(1)>', kind: 'text' }]);
    await expect(
      db.query("select public.react_mentor_send_post('code','x','js',null)"),
    ).rejects.toThrow(/too many/i);
    await expect(db.query('delete from public.react_mentor_chat_messages')).rejects.toThrow(
      /permission denied/i,
    );
  });

  it('stores code blocks with a validated language', async () => {
    await actor(A);
    await expect(
      db.query("select public.react_mentor_send_post('code','x','<script>',null)"),
    ).rejects.toThrow(/invalid message/i);
    await db.query("select public.react_mentor_send_post('code','const a = 1;','js',null)");
    expect(
      (await db.query('select kind,code_language from public.react_mentor_chat_messages')).rows,
    ).toEqual([{ kind: 'code', code_language: 'js' }]);
  });

  it('accepts only own uploaded media of an allowed type and size', async () => {
    const big = file('png');
    await object(big, 'image/png', 5 * 1024 * 1024 + 1);
    const other = file('png', B);
    await object(other, 'image/png', 100, B);
    const good = file('mp4');
    await object(good, 'video/mp4', 1000);
    await actor(A);
    for (const path of [big, other, file('png')])
      await expect(
        db.query("select public.react_mentor_send_post('image','',null,$1)", [path]),
      ).rejects.toThrow(/invalid attachment/i);
    await db.query("select public.react_mentor_send_post('video','Demo',null,$1)", [good]);
    expect(
      (await db.query('select kind,attachment_mime from public.react_mentor_chat_messages')).rows,
    ).toEqual([{ kind: 'video', attachment_mime: 'video/mp4' }]);
  });

  it('lets authors delete only their own messages', async () => {
    const media = file('webp');
    await object(media, 'image/webp', 100);
    await actor(A);
    const { rows } = await db.query<{ id: string }>(
      "select public.react_mentor_send_post('image','',null,$1) as id",
      [media],
    );
    await actor(B);
    await expect(
      db.query('select public.react_mentor_delete_message($1)', [rows[0].id]),
    ).rejects.toThrow(/not found/i);
    await actor(A);
    const removed = await db.query<{ path: string }>(
      'select public.react_mentor_delete_message($1) as path',
      [rows[0].id],
    );
    expect(removed.rows[0].path).toBe(media);
    expect((await db.query('select * from public.react_mentor_chat_messages')).rows).toHaveLength(
      0,
    );
  });

  it('lets members upload only into their own folder', async () => {
    await actor(A);
    await db.query(insertObject, [file('png'), A]);
    await expect(db.query(insertObject, [file('png', B), A])).rejects.toThrow(
      /row-level security/i,
    );
    await expect(db.query(insertObject, [`${A}/evil.html`, A])).rejects.toThrow(
      /row-level security/i,
    );
    await actor(A, false);
    await expect(db.query(insertObject, [file('png'), A])).rejects.toThrow(/row-level security/i);
  });

  it('rejects attachments with missing (NULL), zero, negative or non-numeric object_size', async () => {
    const nullImage = file('png');
    await object(nullImage, 'image/png', null);
    const nullVideo = file('mp4');
    await object(nullVideo, 'video/mp4', null);
    const zeroImage = file('png');
    await object(zeroImage, 'image/png', 0);
    const negativeImage = file('png');
    await object(negativeImage, 'image/png', -10);
    const malformedSize = file('png');
    await admin();
    await db.query(
      `insert into storage.objects(bucket_id,name,owner_id,metadata) values('community-media',$1,$2,$3::jsonb)`,
      [malformedSize, A, JSON.stringify({ mimetype: 'image/png', size: 'not-a-number' })],
    );

    await actor(A);
    for (const [kind, path] of [
      ['image', nullImage],
      ['video', nullVideo],
      ['image', zeroImage],
      ['image', negativeImage],
      ['image', malformedSize],
    ] as const) {
      await expect(
        db.query('select public.react_mentor_send_post($1,$2,null,$3)', [kind, '', path]),
      ).rejects.toThrow(/invalid attachment/i);
    }
  });

  it('blocks banned and aal1 users from deleting community-media objects while allowing verified owners', async () => {
    const media = file('png');
    await object(media, 'image/png', 512, A);

    // Banned owner cannot delete own object even with aal2.
    await admin();
    await db.exec(`update auth.users set banned_until = now() + interval '1 day' where id = '${A}'`);
    await actor(A, true);
    expect(
      (await db.query('delete from storage.objects where name = $1 returning name', [media])).rows,
    ).toHaveLength(0);

    // Unban A, require MFA and use aal1: still cannot delete own object.
    await admin();
    await db.exec(`update auth.users set banned_until = null where id = '${A}'`);
    await actor(A, false);
    expect(
      (await db.query('delete from storage.objects where name = $1 returning name', [media])).rows,
    ).toHaveLength(0);

    // Another active member cannot delete A's object.
    await actor(B, true);
    expect(
      (await db.query('delete from storage.objects where name = $1 returning name', [media])).rows,
    ).toHaveLength(0);

    // Unbanned owner with aal2 can delete own object.
    await actor(A, true);
    expect(
      (await db.query('delete from storage.objects where name = $1 returning name', [media])).rows,
    ).toEqual([{ name: media }]);
  });
});
