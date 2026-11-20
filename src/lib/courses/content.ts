import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { courseContentSchema, type CourseContent } from './schema';
import { COURSE_IDS, type ImportedCourseId } from './ids';
import { downloadCourseObject, getCourseRelease, type CourseRelease } from './course-storage';

type CourseCache = Map<ImportedCourseId, Promise<CourseContent>>;

const importedCourseIds = COURSE_IDS.filter((id) => id !== 'react');
const localContent = new Map<ImportedCourseId, Promise<CourseContent>>();
const releaseContent = new WeakMap<CourseRelease, CourseCache>();

function loadCachedCourse(cache: CourseCache, id: ImportedCourseId, read: () => Promise<unknown>) {
  const cached = cache.get(id);
  if (cached) return cached;

  const pending = read()
    .then((source) => {
      const course = courseContentSchema.parse(source);
      if (course.courseId !== id) throw new Error(`Unexpected course ID for ${id}`);
      return course;
    })
    .catch((error) => {
      cache.delete(id);
      throw error;
    });
  cache.set(id, pending);
  return pending;
}

export async function loadLocalCourseContent(id: ImportedCourseId): Promise<CourseContent> {
  if (!importedCourseIds.includes(id)) throw new Error('Unknown imported course');

  return loadCachedCourse(localContent, id, async () => {
    if (id === 'nextjs') return (await import('@/content/courses/nextjs')).default;

    const filename = path.join(process.cwd(), 'src', 'content', 'courses', `${id}.json`);
    return JSON.parse(await readFile(filename, 'utf8'));
  });
}

export async function loadCourseContent(id: ImportedCourseId): Promise<CourseContent> {
  if (!importedCourseIds.includes(id)) throw new Error('Unknown imported course');

  const release = await getCourseRelease();
  if (!release) return loadLocalCourseContent(id);

  let cache = releaseContent.get(release);
  if (!cache) {
    cache = new Map();
    releaseContent.set(release, cache);
  }

  return loadCachedCourse(cache, id, async () => {
    const bytes = await downloadCourseObject(release.courses[id]);
    return JSON.parse(bytes.toString('utf8'));
  });
}
