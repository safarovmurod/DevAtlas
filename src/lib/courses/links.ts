import type { CourseId, ImportedCourseId } from './ids';

/**
 * Link to one section of a course on a given day.
 * Practice lives on its own page; every other section is a course sub-route.
 */
export function courseSectionHref(courseId: ImportedCourseId, section: string, day: number) {
  if (section === 'practice') return `/practice?course=${courseId}&day=${day}`;
  return `/courses/${courseId}/${section}?day=${day}`;
}

/** Where a course is introduced: React has its own entry page, every other course opens its plan. */
export function coursePath(courseId: CourseId) {
  return courseId === 'react' ? '/courses/react' : `/courses/${courseId}/plan`;
}
