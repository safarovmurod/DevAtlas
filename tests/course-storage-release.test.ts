// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  canonicalBytes, createRelease, loadLocalCourses, parseArguments,
  publishRelease, publishTarget, releaseSummary,
} from '../scripts/course-storage-release.mjs';

const BUCKET = 'devatlas-course-content';
const REF = 'abcdefghijklmnopqrst';
const ORIGIN = `https://${REF}.supabase.co`;
const jwt = (role: string, ref = REF) => [
  Buffer.from('{"alg":"HS256"}').toString('base64url'),
  Buffer.from(JSON.stringify({ role, ref })).toString('base64url'), 'signature',
].join('.');
const target = () => publishTarget(REF, { SUPABASE_URL: ORIGIN, SUPABASE_SERVICE_ROLE_KEY: jwt('service_role') });
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
let directory: string;
const attachmentBytes = Buffer.from('trusted local attachment');
const filename = hash(attachmentBytes) + '.pdf';
const course = (courseId = 'html') => ({
  courseId, sources: [], lessons: [],
  files: [{ id: 'handout', title: 'Original handout.pdf', url: '/course-files/' + filename,
    sha256: hash(attachmentBytes), bytes: attachmentBytes.length, sourceIds: [] }],
});
const fixture = (courses = [course()]) => createRelease({
  courses, courseIds: courses.map((item) => item.courseId), filesRoot: directory,
  reactPracticePath: path.join(directory, 'practice.html'),
});

beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'devatlas-course-release-'));
  await writeFile(path.join(directory, filename), attachmentBytes);
  await writeFile(path.join(directory, 'practice.html'), '<!doctype html>\n<html lang="tg">Practice</html>\n');
});
afterEach(() => vi.unstubAllGlobals());
afterAll(async () => {
  if (path.dirname(path.resolve(directory)) !== path.resolve(tmpdir()) ||
      !path.basename(directory).startsWith('devatlas-course-release-'))
    throw new Error('Refusing unexpected fixture cleanup path');
  await rm(directory, { recursive: true, force: true });
});

function storageFixture({ publicBucket = false, failObject = false, corruptDuplicate = false } = {}) {
  const objects = new Map<string, Buffer>();
  const uploads: { pathname: string; upsert: boolean }[] = [];
  const bucket = { id: BUCKET, public: publicBucket, file_size_limit: 16777216,
    allowed_mime_types: ['application/json', 'application/octet-stream'] };
  const upload = vi.fn(async (pathname: string, bytes: Buffer, options: { upsert: boolean }) => {
    uploads.push({ pathname, upsert: options.upsert });
    if (failObject && pathname.startsWith('objects/')) return { error: { status: 503 } };
    if (objects.has(pathname)) return { error: { code: 'ResourceAlreadyExists', status: 409 } };
    objects.set(pathname, Buffer.from(bytes));
    return { error: null };
  });
  const download = vi.fn(async (pathname: string) => ({
    data: objects.has(pathname)
      ? new Blob([new Uint8Array(corruptDuplicate ? Buffer.from('corrupt bytes') : objects.get(pathname)!)]) : null,
    error: null,
  }));
  const client = { storage: { getBucket: vi.fn(async () => ({ data: bucket, error: null })),
    from: vi.fn(() => ({ upload, download })) } };
  return { factory: vi.fn(() => client), objects, uploads, bucket, download };
}

describe('offline course release export', () => {
  it('loads all 42 actual local loaders without fetch, including generated Next.js', async () => {
    const network = vi.fn(() => { throw new Error('Network forbidden during verification'); });
    vi.stubGlobal('fetch', network);
    const local = await loadLocalCourses();
    const release = await createRelease(local);
    expect(local.courseIds).toHaveLength(42);
    expect(new Set(local.courses.map((item: { courseId: string }) => item.courseId)).size).toBe(42);
    expect(release.manifest.courses.nextjs).toBeDefined();
    expect(releaseSummary(release).maxObjectBytes).toBeLessThanOrEqual(16777216);
    expect(network).not.toHaveBeenCalled();
  }, 30000);

  it('produces deterministic exact UTF-8 manifest bytes and shared-file owners', async () => {
    const first = await fixture([course('html'), course('css')]);
    const reordered = [course('css'), course('html')].map((item) =>
      Object.fromEntries(Object.entries(item).reverse()));
    const second = await fixture(reordered as ReturnType<typeof course>[]);
    expect(first.manifestBytes.equals(second.manifestBytes)).toBe(true);
    expect(first.release).toBe(second.release);
    expect(first.release).toBe(hash(first.manifestBytes));
    expect(first.manifestBytes.equals(canonicalBytes(first.manifest))).toBe(true);
    expect(first.manifest.files[filename].owners).toEqual([
      { courseId: 'css', title: 'Original handout.pdf' },
      { courseId: 'html', title: 'Original handout.pdf' },
    ]);
    expect(releaseSummary(first).uniqueObjects).toBe(4);
  });

  it('rejects missing/duplicate course IDs rather than silently publishing a partial set', async () => {
    await expect(createRelease({ courses: [course()], courseIds: ['html', 'css'],
      filesRoot: directory, reactPracticePath: path.join(directory, 'practice.html') })).rejects.toThrow(/course/i);
    await expect(fixture([course(), course()])).rejects.toThrow(/course/i);
  });

  it('rejects attachment mismatches, traversal and objects over 16 MiB', async () => {
    const wrong = course(); wrong.files[0].bytes++;
    await expect(fixture([wrong])).rejects.toThrow(/checksum\/size/);
    const traversal = course(); traversal.files[0].url = '/course-files/../secret';
    await expect(fixture([traversal])).rejects.toThrow(/attachment path/);
    const huge = { ...course(), extra: 'x'.repeat(16777216) };
    await expect(fixture([huge])).rejects.toThrow(/object.*bytes/);
    const largeManifest = course(); largeManifest.files[0].title = 'x'.repeat(262144);
    await expect(fixture([largeManifest])).rejects.toThrow(/manifest exceeds 256 KiB/);
    expect(await readFile(path.join(directory, filename))).toEqual(attachmentBytes);
  });
});

describe('explicit server-only immutable publication', () => {
  it('defaults to offline verification and rejects credential/ambiguous CLI arguments', () => {
    expect(parseArguments([])).toEqual({ mode: 'verify', projectRef: undefined });
    expect(parseArguments(['--dry-run'])).toEqual({ mode: 'verify', projectRef: undefined });
    expect(() => parseArguments(['--publish'])).toThrow(/project-ref/);
    expect(() => parseArguments(['--verify', '--publish', '--project-ref', REF])).toThrow(/not both/);
    try { parseArguments(['credential-must-not-be-printed']); }
    catch (error) { expect(String(error)).not.toContain('credential-must-not-be-printed'); }
  });

  it('rejects normal API roles and mismatched targets before creating a client', async () => {
    const release = await fixture();
    for (const key of [jwt('anon'), jwt('authenticated'), 'sb_publishable_no_admin', 'not-a-key']) {
      const factory = vi.fn();
      await expect(publishRelease(release, { projectRef: REF, url: ORIGIN, key }, factory)).rejects.toThrow(/server|service/i);
      expect(factory).not.toHaveBeenCalled();
    }
    expect(() => publishTarget(REF, { SUPABASE_URL: 'https://otherproject.supabase.co', SUPABASE_SERVICE_ROLE_KEY: jwt('service_role') }))
      .toThrow(/target|reference/i);
    expect(() => publishTarget(REF, { SUPABASE_URL: ORIGIN + '/path', SUPABASE_SERVICE_ROLE_KEY: jwt('service_role') }))
      .toThrow(/target|reference/i);
    expect(() => publishTarget(REF, { SUPABASE_SERVICE_ROLE_KEY: jwt('service_role', 'otherprojectrefvaluex') }))
      .toThrow(/target/i);
    expect(publishTarget(REF, { SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_local_fixture_only' }).url).toBe(ORIGIN);
  });

  it('rejects existing public/incompatible buckets without uploading or changing settings', async () => {
    const release = await fixture();
    const publicStore = storageFixture({ publicBucket: true });
    await expect(publishRelease(release, target(), publicStore.factory)).rejects.toThrow(/public/);
    expect(publicStore.uploads).toEqual([]);
    const smallStore = storageFixture(); smallStore.bucket.file_size_limit = 1;
    await expect(publishRelease(release, target(), smallStore.factory)).rejects.toThrow(/size limit/);
    expect(smallStore.uploads).toEqual([]);
  });

  it('publishes the manifest last, then verifies exact bytes on every duplicate retry', async () => {
    const release = await fixture();
    const store = storageFixture();
    const first = await publishRelease(release, target(), store.factory);
    expect(store.uploads.at(-1)?.pathname).toBe(`releases/${release.release}.json`);
    expect(store.uploads.every((item) => item.upsert === false)).toBe(true);
    expect(first.uploaded).toBe(release.objects.size + 1);
    expect(first.verifiedExisting).toBe(0);
    const second = await publishRelease(release, target(), store.factory);
    expect(second.uploaded).toBe(0);
    expect(second.verifiedExisting).toBe(release.objects.size + 1);
    expect(store.objects.size).toBe(release.objects.size + 1);
    expect(store.download).toHaveBeenCalledTimes(2 * (release.objects.size + 1));
  });

  it('never uploads a manifest after an object failure or corrupt duplicate', async () => {
    const release = await fixture();
    const failed = storageFixture({ failObject: true });
    await expect(publishRelease(release, target(), failed.factory)).rejects.toThrow(/upload failed/);
    expect(failed.uploads.some((item) => item.pathname.startsWith('releases/'))).toBe(false);
    const corrupt = storageFixture({ corruptDuplicate: true });
    const firstHash = [...release.objects.keys()].sort()[0];
    corrupt.objects.set(`objects/${firstHash}`, Buffer.from('corrupt bytes'));
    await expect(publishRelease(release, target(), corrupt.factory)).rejects.toThrow(/bytes differ/);
    expect(corrupt.uploads.some((item) => item.pathname.startsWith('releases/'))).toBe(false);
    expect(corrupt.objects.get(`objects/${firstHash}`)?.toString()).toBe('corrupt bytes');
  });

  it('rejects changed release bytes before any client or request', async () => {
    const release = await fixture();
    release.manifestBytes = Buffer.from('{}');
    const factory = vi.fn();
    await expect(publishRelease(release, target(), factory)).rejects.toThrow(/checksum/);
    expect(factory).not.toHaveBeenCalled();
    release.manifestBytes = Buffer.alloc(262145);
    await expect(publishRelease(release, target(), factory)).rejects.toThrow(/manifest exceeds 256 KiB/);
    expect(factory).not.toHaveBeenCalled();
  });
});

describe('private server-only course bucket migration', () => {
  let db: PGlite;
  let sql: string;
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(bucket_id text,name text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to anon,authenticated,service_role;
      grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;
      create policy broad_other_app on storage.objects for all to anon,authenticated using(true) with check(true);`);
    sql = await readFile(new URL('../supabase/migrations/20261118020000_course_storage.sql', import.meta.url), 'utf8');
    await db.exec(sql); await db.exec(sql);
  }, 30000);
  afterAll(async () => { await db?.close(); });

  it('blocks ordinary API roles even with another broad policy and preserves unrelated buckets', async () => {
    expect((await db.query('select public,file_size_limit,allowed_mime_types from storage.buckets where id=$1', [BUCKET])).rows)
      .toEqual([{ public: false, file_size_limit: 16777216, allowed_mime_types: ['application/json', 'application/octet-stream'] }]);
    await db.exec(`set role service_role; insert into storage.objects values('${BUCKET}','objects/hash'); reset role;`);
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}`);
      expect((await db.query('select name from storage.objects where bucket_id=$1', [BUCKET])).rows).toEqual([]);
      await expect(db.query('insert into storage.objects values($1,$2)', [BUCKET, 'blocked']))
        .rejects.toMatchObject({ code: '42501' });
      expect((await db.query('delete from storage.objects where bucket_id=$1 returning name', [BUCKET])).rows).toEqual([]);
      await db.query('insert into storage.objects values($1,$2)', ['other-app', role]);
      await db.exec('reset role');
    }
  });

  it('refuses a public bucket collision without changing that bucket', async () => {
    await db.query('update storage.buckets set public=true where id=$1', [BUCKET]);
    await expect(db.exec(sql)).rejects.toThrow(/public.*operator review/);
    await db.exec('rollback');
    expect((await db.query('select public from storage.buckets where id=$1', [BUCKET])).rows).toEqual([{ public: true }]);
  });
});
