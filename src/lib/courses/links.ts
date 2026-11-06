import type { ImportedCourseId } from './ids';

/**
 * Link to one section of a course on a given day.
 * Practice lives on its own page; every other section is a course sub-route.
 */
export function courseSectionHref(courseId: ImportedCourseId, section: string, day: number) {
  if (section === 'practice') return `/practice?course=${courseId}&day=${day}`;
  return `/courses/${courseId}/${section}?day=${day}`;
}
