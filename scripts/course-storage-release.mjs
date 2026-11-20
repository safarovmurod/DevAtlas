/** Offline verification by default. --publish is the only mode that contacts Storage. */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

export const COURSE_BUCKET = 'devatlas-course-content';
export const MAX_OBJECT_BYTES = 16 * 1024 * 1024;
export const MAX_MANIFEST_BYTES = 256 * 1024;
const root = fileURLToPath(new URL('../', import.meta.url));
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

/** @typedef {{sha256: string, bytes: number}} ObjectPointer */
/** @typedef {ObjectPointer & {owners: {courseId: string, title: string}[]}} FilePointer */

function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.keys(value).sort(compare).map((key) => [key, sorted(value[key])]));
  return value;
}
export const canonicalBytes = (value) => Buffer.from(JSON.stringify(sorted(value)) + '\n', 'utf8');

function describe(bytes, label) {
  if (!bytes.length || bytes.length > MAX_OBJECT_BYTES)
    throw new Error(`${label}: object must contain 1–${MAX_OBJECT_BYTES} bytes`);
  return { sha256: digest(bytes), bytes: bytes.length };
}

/** Use actual parsed loaders, including the generated Next.js course, entirely in memory. */
export async function loadLocalCourses() {
  const result = await build({
    absWorkingDir: root, bundle: true, platform: 'node', format: 'esm', target: 'node22',
    write: false, logLevel: 'silent',
    stdin: { resolveDir: root, sourcefile: 'course-storage-release-entry.ts', contents: `
      import { COURSE_IDS } from './src/lib/courses/ids';
      import { loadLocalCourseContent } from './src/lib/courses/content';
      export const ids = COURSE_IDS.filter(id => id !== 'react');
      export async function courses() {
        return Promise.all(ids.map(id => loadLocalCourseContent(id)));
      }` },
  });
  const module = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
  if (module.ids.length !== 42 || new Set(module.ids).size !== 42)
    throw new Error('Expected exactly 42 distinct imported course loaders');
  return { courseIds: module.ids, courses: await module.courses() };
}

/** No disk output or network: authored files are read and never removed or rewritten. */
export async function createRelease({
  courses, courseIds,
  filesRoot = path.join(root, 'content/course-files'),
  reactPracticePath = path.join(root, 'content/practice-local-global.html'),
}) {
  const expected = [...courseIds].sort(compare);
  if (new Set(expected).size !== expected.length || expected.includes('react') ||
      courses.length !== expected.length ||
      courses.map((course) => course.courseId).sort(compare).some((id, index) => id !== expected[index]))
    throw new Error('Course IDs do not match the imported loader inventory');
  /** @type {Record<string, ObjectPointer>} */
  const courseObjects = {};
  /** @type {Record<string, FilePointer>} */
  const fileObjects = {};
  const objects = new Map();
  function add(bytes, label) {
    const entry = describe(bytes, label);
    const previous = objects.get(entry.sha256);
    if (previous && !previous.equals(bytes)) throw new Error('Conflicting content digest');
    objects.set(entry.sha256, bytes);
    return entry;
  }
  for (const course of [...courses].sort((a, b) => compare(a.courseId, b.courseId))) {
    courseObjects[course.courseId] = add(canonicalBytes(course), `Course ${course.courseId}`);
    for (const file of course.files) {
      const match = /^\/course-files\/([a-f0-9]{64}\.[a-z0-9]+)$/.exec(file.url);
      if (!match) throw new Error(`Course ${course.courseId}: invalid attachment path`);
      const filename = match[1];
      const bytes = await readFile(path.join(filesRoot, filename));
      const entry = add(bytes, `Attachment ${filename}`);
      if (entry.sha256 !== file.sha256 || entry.bytes !== file.bytes || !filename.startsWith(entry.sha256 + '.'))
        throw new Error(`Course ${course.courseId}: attachment checksum/size mismatch for ${filename}`);
      const existing = fileObjects[filename];
      if (existing && (existing.sha256 !== entry.sha256 || existing.bytes !== entry.bytes))
        throw new Error(`Conflicting attachment metadata for ${filename}`);
      const owner = { courseId: course.courseId, title: file.title };
      const target = existing ?? { ...entry, owners: [] };
      if (!target.owners.some((item) => item.courseId === owner.courseId && item.title === owner.title))
        target.owners.push(owner);
      fileObjects[filename] = target;
    }
  }
  for (const entry of Object.values(fileObjects))
    entry.owners.sort((a, b) => compare(a.courseId, b.courseId) || compare(a.title, b.title));
  const reactBytes = await readFile(reactPracticePath);
  if (!/^\s*<!doctype html>/i.test(reactBytes.toString('utf8')))
    throw new Error('React practice file must be the authored HTML document');
  const manifest = {
    version: 1,
    courses: courseObjects,
    files: fileObjects,
    reactPractice: add(reactBytes, 'React practice'),
  };
  const manifestBytes = canonicalBytes(manifest);
  if (manifestBytes.length > MAX_MANIFEST_BYTES) throw new Error('Release manifest exceeds 256 KiB');
  const release = describe(manifestBytes, 'Release manifest').sha256;
  return { manifest, manifestBytes, release, objects };
}

export function releaseSummary(bundle) {
  return {
    bucket: COURSE_BUCKET, release: bundle.release,
    manifestPath: `releases/${bundle.release}.json`, manifestBytes: bundle.manifestBytes.length,
    courses: Object.entries(bundle.manifest.courses).map(([courseId, entry]) => ({ courseId, ...entry })),
    files: Object.entries(bundle.manifest.files).map(([filename, entry]) => ({ filename, ...entry })),
    reactPractice: bundle.manifest.reactPractice,
    uniqueObjects: bundle.objects.size,
    objectBytes: [...bundle.objects.values()].reduce((total, bytes) => total + bytes.length, 0),
    maxObjectBytes: Math.max(...[...bundle.objects.values()].map((bytes) => bytes.length)),
  };
}

/**
 * The decoded JWT role is only a local key-type check; Storage verifies the credential.
 * @param {string | undefined} projectRef
 * @param {Record<string, string | undefined>} [env]
 */
export function publishTarget(projectRef, env = process.env) {
  if (!projectRef || !/^[a-z]{20}$/.test(projectRef))
    throw new Error('--publish requires an explicit 20-letter --project-ref');
  const expected = `https://${projectRef}.supabase.co`;
  const supplied = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || expected;
  let url;
  try { url = new URL(supplied); } catch { throw new Error('Invalid Supabase target URL'); }
  if (url.origin !== expected || url.pathname !== '/' || url.search || url.hash || url.username || url.password)
    throw new Error('Supabase URL does not match the explicit project reference');
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error('Publishing requires SUPABASE_SERVICE_ROLE_KEY in the environment');
  if (!/^sb_secret_[A-Za-z0-9_-]+$/.test(key)) {
    let claims;
    try {
      const parts = key.split('.');
      if (parts.length !== 3) throw new Error();
      claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    } catch { throw new Error('Publishing requires a server secret or service_role credential'); }
    if (claims.role !== 'service_role' || (claims.ref && claims.ref !== projectRef))
      throw new Error('Publishing requires a service_role credential for the explicit target');
  }
  return { projectRef, url: expected, key };
}

function checkBundle(bundle) {
  if (bundle.manifestBytes.length > MAX_MANIFEST_BYTES) throw new Error('Release manifest exceeds 256 KiB');
  if (!canonicalBytes(bundle.manifest).equals(bundle.manifestBytes) || digest(bundle.manifestBytes) !== bundle.release)
    throw new Error('Release manifest checksum mismatch');
  describe(bundle.manifestBytes, 'Release manifest');
  const entries = [...Object.values(bundle.manifest.courses), ...Object.values(bundle.manifest.files), bundle.manifest.reactPractice];
  for (const entry of entries) {
    const bytes = bundle.objects.get(entry.sha256);
    if (!bytes || bytes.length !== entry.bytes || describe(bytes, 'Release object').sha256 !== entry.sha256)
      throw new Error('Release object checksum/size mismatch');
  }
  if (new Set(entries.map((entry) => entry.sha256)).size !== bundle.objects.size)
    throw new Error('Release contains unreferenced objects');
}

/** Immutable uploads only; no bucket updates, upserts, deletes or active-release pointer. */
export async function publishRelease(bundle, target, clientFactory) {
  checkBundle(bundle);
  const checked = publishTarget(target.projectRef, { SUPABASE_URL: target.url, SUPABASE_SERVICE_ROLE_KEY: target.key });
  const factory = clientFactory ?? (await import('@supabase/supabase-js')).createClient;
  const client = factory(checked.url, checked.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(60000) }) },
  });
  const bucket = await client.storage.getBucket(COURSE_BUCKET);
  if (bucket.error || !bucket.data || bucket.data.id !== COURSE_BUCKET)
    throw new Error('Private course bucket is unavailable; review/apply its migration separately');
  if (bucket.data.public !== false)
    throw new Error('Course bucket is public; operator review is required, no objects were uploaded');
  const needed = Math.max(bundle.manifestBytes.length, ...[...bundle.objects.values()].map((bytes) => bytes.length));
  if (bucket.data.file_size_limit != null && Number(bucket.data.file_size_limit) < needed)
    throw new Error('Existing course bucket size limit is incompatible; operator review is required');
  if (bucket.data.allowed_mime_types != null &&
      !['application/json', 'application/octet-stream'].every((type) =>
        bucket.data.allowed_mime_types.includes(type) || bucket.data.allowed_mime_types.includes('application/*') || bucket.data.allowed_mime_types.includes('*/*')))
    throw new Error('Existing course bucket MIME limits are incompatible; operator review is required');
  const storage = client.storage.from(COURSE_BUCKET);
  let uploaded = 0, verifiedExisting = 0;
  async function immutable(pathname, bytes, contentType) {
    const result = await storage.upload(pathname, bytes, { upsert: false, contentType, cacheControl: '31536000' });
    const duplicate = result.error && (
      result.error.status === 409 || result.error.statusCode === '409' ||
      ['ResourceAlreadyExists', 'KeyAlreadyExists', 'Duplicate'].includes(result.error.code));
    if (result.error && !duplicate) throw new Error(`Storage upload failed for ${pathname}`);
    const downloaded = await storage.download(pathname);
    if (downloaded.error || !downloaded.data) throw new Error(`Storage verification failed for ${pathname}`);
    const actual = Buffer.from(await downloaded.data.arrayBuffer());
    if (!actual.equals(bytes)) throw new Error(`Stored bytes differ for ${pathname}; nothing was overwritten`);
    if (duplicate) verifiedExisting++; else uploaded++;
  }
  for (const [hash, bytes] of [...bundle.objects].sort(([a], [b]) => compare(a, b)))
    await immutable(`objects/${hash}`, bytes, 'application/octet-stream');
  // A manifest can only become available after every referenced object's read-back passes.
  await immutable(`releases/${bundle.release}.json`, bundle.manifestBytes, 'application/json');
  return { projectRef: checked.projectRef, ...releaseSummary(bundle), uploaded, verifiedExisting };
}

export function parseArguments(argv) {
  let mode = 'verify', projectRef, explicitMode;
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (['--verify', '--dry-run', '--publish'].includes(argument)) {
      const next = argument === '--publish' ? 'publish' : 'verify';
      if (explicitMode && explicitMode !== next) throw new Error('Choose verification or publishing, not both');
      mode = explicitMode = next;
    } else if (argument === '--project-ref' && !projectRef && argv[index + 1]) {
      projectRef = argv[++index];
    } else throw new Error('Unknown or incomplete release argument; credentials belong only in environment variables');
  }
  if (mode === 'publish' && !projectRef) throw new Error('--publish requires --project-ref');
  return { mode, projectRef };
}

export async function main(argv = process.argv.slice(2), env = process.env) {
  const options = parseArguments(argv);
  const target = options.mode === 'publish' ? publishTarget(options.projectRef, env) : null;
  const local = await loadLocalCourses();
  const bundle = await createRelease(local);
  const result = target ? await publishRelease(bundle, target) : releaseSummary(bundle);
  console.log(JSON.stringify({ mode: options.mode, ...result }, null, 2));
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url)
  main().catch((error) => { console.error(error instanceof Error ? error.message : 'Course release failed'); process.exitCode = 1; });
