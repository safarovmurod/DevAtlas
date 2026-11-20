// @vitest-environment node
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COURSE_IDS, type ImportedCourseId } from '@/lib/courses/ids';

const mocks = vi.hoisted(() => {
  const download = vi.fn();
  const from = vi.fn(() => ({ download }));
  return { download, from, admin: vi.fn(() => ({ storage: { from } })) };
});
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: mocks.admin }));

function pointer(bytes: Buffer) {
  return { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
}

function fixture(courseId: ImportedCourseId = 'html') {
  const course = { courseId, sources: [], files: [], lessons: [] };
  const courseBytes = Buffer.from(JSON.stringify(course));
  const coursePointer = pointer(courseBytes);
  const practice = pointer(Buffer.from('<html>Practice</html>'));
  const manifest = {
    version: 1,
    courses: Object.fromEntries(
      COURSE_IDS.filter((id) => id !== 'react').map((id) => [id, coursePointer]),
    ),
    files: {},
    reactPractice: practice,
  };
  return { course, courseBytes, coursePointer, manifest };
}

function configureManifest(manifest: unknown, objects = new Map<string, Buffer>()) {
  const bytes = Buffer.from(JSON.stringify(manifest));
  const { sha256 } = pointer(bytes);
  const path = `releases/${sha256}.json`;
  objects.set(path, bytes);
  vi.stubEnv('DEVATLAS_COURSE_RELEASE', sha256);
  mocks.download.mockImplementation((key) => ({
    asStream: async () => {
      const bytes = objects.get(key);
      return bytes
        ? { data: new Response(new Uint8Array(bytes)).body, error: null }
        : { data: null, error: {} };
    },
  }));
  return path;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.stubEnv('DEVATLAS_COURSE_RELEASE', undefined);
});
afterEach(() => vi.unstubAllEnvs());

describe('course storage releases', () => {
  it('loads local lessons and the TypeScript-backed Next.js course without using storage', async () => {
    const { loadCourseContent, loadLocalCourseContent } = await import('@/lib/courses/content');
    const html = await loadCourseContent('html');
    expect(html).toMatchObject({ courseId: 'html' });
    expect(html.lessons.length).toBeGreaterThan(0);
    expect(await loadLocalCourseContent('html')).toBe(html);
    expect(await loadCourseContent('nextjs')).toMatchObject({ courseId: 'nextjs' });
    await expect(loadLocalCourseContent('../package' as ImportedCourseId)).rejects.toThrow(
      'Unknown imported course',
    );
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it.each(['', ' \t '])('treats a blank release identifier %j as unset', async (sha256) => {
    vi.stubEnv('DEVATLAS_COURSE_RELEASE', sha256);
    const { getCourseRelease } = await import('@/lib/courses/course-storage');
    await expect(getCourseRelease()).resolves.toBeNull();
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it.each(['a'.repeat(63), 'A'.repeat(64), '../release', ' ' + 'a'.repeat(64)])(
    'rejects invalid release identifier %j',
    async (sha256) => {
      vi.stubEnv('DEVATLAS_COURSE_RELEASE', sha256);
      const { getCourseRelease } = await import('@/lib/courses/course-storage');
      await expect(getCourseRelease()).rejects.toThrow('Invalid DEVATLAS_COURSE_RELEASE');
      expect(mocks.admin).not.toHaveBeenCalled();
    },
  );

  it('loads and caches the exact verified course and manifest in the private bucket', async () => {
    const { course, courseBytes, coursePointer, manifest } = fixture();
    const objectPath = `objects/${coursePointer.sha256}`;
    const manifestPath = configureManifest(manifest, new Map([[objectPath, courseBytes]]));
    const { loadCourseContent, loadLocalCourseContent } = await import('@/lib/courses/content');
    const { getCourseRelease } = await import('@/lib/courses/course-storage');
    const [first, second] = await Promise.all([
      loadCourseContent('html'),
      loadCourseContent('html'),
    ]);
    expect(first).toEqual(course);
    expect(second).toBe(first);
    expect(await getCourseRelease()).toEqual(manifest);
    expect(mocks.download.mock.calls).toEqual([[manifestPath], [objectPath]]);
    expect(mocks.from.mock.calls).toEqual([
      ['devatlas-course-content'],
      ['devatlas-course-content'],
    ]);
    expect((await loadLocalCourseContent('html')).lessons.length).toBeGreaterThan(0);
    expect(mocks.download).toHaveBeenCalledTimes(2);
  });

  it('evicts failures from both caches, checks integrity and refuses a local fallback', async () => {
    const { course, courseBytes, coursePointer, manifest } = fixture();
    const objectPath = `objects/${coursePointer.sha256}`;
    const objects = new Map<string, Buffer>();
    const manifestPath = configureManifest(manifest, objects);
    const goodManifest = objects.get(manifestPath)!;
    objects.set(manifestPath, Buffer.from('{}'));
    const { loadCourseContent } = await import('@/lib/courses/content');
    await expect(loadCourseContent('html')).rejects.toThrow('integrity verification');

    objects.set(manifestPath, goodManifest);
    await expect(loadCourseContent('html')).rejects.toThrow(
      'Could not read course content storage',
    );
    objects.set(objectPath, Buffer.alloc(courseBytes.length));
    await expect(loadCourseContent('html')).rejects.toThrow('integrity verification');
    objects.set(objectPath, courseBytes);
    await expect(loadCourseContent('html')).resolves.toEqual(course);
    expect(mocks.download.mock.calls).toEqual([
      [manifestPath],
      [manifestPath],
      [objectPath],
      [objectPath],
      [objectPath],
    ]);
  });

  it('rejects a verified course object with the wrong course ID', async () => {
    const { courseBytes, coursePointer, manifest } = fixture('css');
    configureManifest(manifest, new Map([[`objects/${coursePointer.sha256}`, courseBytes]]));
    const { loadCourseContent } = await import('@/lib/courses/content');
    await expect(loadCourseContent('html')).rejects.toThrow('Unexpected course ID for html');
  });

  it('validates that a manifest accounts for every course and ties file names to their bytes', async () => {
    const { manifest, coursePointer } = fixture();
    const { getCourseRelease } = await import('@/lib/courses/course-storage');
    delete manifest.courses.html;
    configureManifest(manifest);
    await expect(getCourseRelease()).rejects.toThrow();

    const files = {
      [`${'0'.repeat(64)}.zip`]: {
        ...coursePointer,
        owners: [{ courseId: 'backend', title: 'Bundle' }],
      },
    };
    configureManifest({ ...fixture().manifest, files });
    await expect(getCourseRelease()).rejects.toThrow(
      'Course file name does not match the object digest',
    );
  });

  it('rejects a declared oversize object before network access and stops oversized responses', async () => {
    const { downloadCourseObject } = await import('@/lib/courses/course-storage');
    const bytes = Buffer.from('extra bytes');
    const reference = pointer(bytes);
    await expect(downloadCourseObject({ ...reference, bytes: 0 })).rejects.toThrow();
    await expect(
      downloadCourseObject({ ...reference, bytes: 16 * 1024 * 1024 + 1 }),
    ).rejects.toThrow();
    expect(mocks.admin).not.toHaveBeenCalled();

    configureManifest({}, new Map([[`objects/${reference.sha256}`, bytes]]));
    await expect(downloadCourseObject({ ...reference, bytes: 1 })).rejects.toThrow(
      'exceeds its byte limit',
    );
    await expect(downloadCourseObject({ ...reference, bytes: bytes.length + 1 })).rejects.toThrow(
      'integrity verification',
    );
  });
});
