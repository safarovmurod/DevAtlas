import { COURSE_CATEGORIES, type CourseCategoryId } from '@/content/course-categories';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { LANDING_COPY } from '@/lib/landing-copy';
import type { InterfaceLocale } from '@/lib/locale';

/** The landing shows only the strongest directions; the full list is in the catalog. */
export const FEATURED_DIRECTIONS: CourseCategoryId[] = [
  'programming',
  'ai',
  'design',
  'marketing',
  'analytics',
  'business',
];

export type LandingDirection = {
  id: CourseCategoryId;
  label: string;
  count: number;
  /** "27 курсов", "3 курса", "1 курс" — the plural form of the interface language. */
  countLabel: string;
};

/**
 * Featured directions with the number of courses counted from the real catalog,
 * the same way the catalog page lists them (JavaScript's second month is reached
 * through its first card, so it is not counted twice).
 */
export function landingDirections(
  locale: InterfaceLocale,
  catalog: readonly { id: string; category: string }[] = COURSE_CATALOG,
): LandingDirection[] {
  const courses = catalog.filter((course) => course.id !== 'javascript-2');
  return COURSE_CATEGORIES.filter((category) => FEATURED_DIRECTIONS.includes(category.id)).map(
    (category) => {
      const count = courses.filter((course) => course.category === category.id).length;
      return {
        id: category.id,
        label: category.labels[locale],
        count,
        countLabel: LANDING_COPY[locale].courses(count),
      };
    },
  );
}
