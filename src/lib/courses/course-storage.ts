import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { COURSE_IDS } from './ids';

const bucket = 'devatlas-course-content';
const maxObjectBytes = 16 * 1024 * 1024;
const maxManifestBytes = 256 * 1024;
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const courseId = z.enum(COURSE_IDS).exclude(['react']);
const objectPointer = z.strictObject({
  sha256: digest,
  bytes: z.number().int().positive().max(maxObjectBytes),
});
const filePointer = objectPointer.extend({
  owners: z.array(z.strictObject({ courseId, title: z.string().min(1) })).min(1),
});
const releaseSchema = z
  .strictObject({
    version: z.literal(1),
    courses: z.record(courseId, objectPointer),
    files: z.record(z.string().regex(/^[a-f0-9]{64}\.[a-z0-9]+$/), filePointer),
    reactPractice: objectPointer,
  })
  .refine(
    ({ files }) =>
      Object.entries(files).every(([name, file]) => name.startsWith(`${file.sha256}.`)),
    {
      message: 'Course file name does not match the object digest',
    },
  );

export type CourseRelease = z.infer<typeof releaseSchema>;
type ObjectPointer = z.infer<typeof objectPointer>;

let cachedRelease: { sha256: string; promise: Promise<CourseRelease> } | undefined;

async function downloadVerified(
  path: string,
  sha256: string,
  limit: number,
  expectedBytes?: number,
) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error('Course content storage is unavailable');

  const { data, error } = await admin.storage.from(bucket).download(path).asStream();
  if (error || !data) throw new Error('Could not read course content storage');

  const chunks: Uint8Array[] = [];
  const hash = createHash('sha256');
  const reader = data.getReader();
  let size = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error('Course content object exceeds its byte limit');
      hash.update(value);
      chunks.push(value);
    }
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }

  if ((expectedBytes !== undefined && size !== expectedBytes) || hash.digest('hex') !== sha256)
    throw new Error('Course content object failed integrity verification');

  return Buffer.concat(chunks, size);
}

export async function downloadCourseObject(reference: ObjectPointer): Promise<Buffer<ArrayBuffer>> {
  // Callers may hold file pointers which also carry ownership and title information.
  const { sha256, bytes } = objectPointer.parse({
    sha256: reference.sha256,
    bytes: reference.bytes,
  });
  return downloadVerified(`objects/${sha256}`, sha256, bytes, bytes);
}

export async function getCourseRelease(): Promise<CourseRelease | null> {
  const sha256 = process.env.DEVATLAS_COURSE_RELEASE;
  if (sha256 === undefined || !sha256.trim()) return null;
  if (!digest.safeParse(sha256).success) throw new Error('Invalid DEVATLAS_COURSE_RELEASE');
  if (cachedRelease?.sha256 === sha256) return cachedRelease.promise;

  const promise = downloadVerified(`releases/${sha256}.json`, sha256, maxManifestBytes)
    .then((bytes) => releaseSchema.parse(JSON.parse(bytes.toString('utf8'))))
    .catch((error) => {
      if (cachedRelease?.promise === promise) cachedRelease = undefined;
      throw error;
    });
  cachedRelease = { sha256, promise };
  return promise;
}
