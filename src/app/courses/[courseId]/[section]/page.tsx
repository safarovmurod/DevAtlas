import { PageTransition } from '@/components/layout/page-transition';
import { courseAccessTier } from '@/lib/courses/access';
import { notFound } from 'next/navigation';
import { isCourseId } from '@/lib/courses/ids';
import { CourseWorkspace } from '@/components/courses/course-workspace';
import { loadCourseContent } from '@/lib/courses/content';
import { publicCourseContent } from '@/lib/courses/delivery';
import { coursePublishedDays } from '@/content/courses/catalog';
import { redirect } from 'next/navigation';
import { courseDescription, courseDisplayName } from '@/lib/catalog-copy';
import { pageTitle, type PageTitleKey } from '@/lib/page-titles';
import { getRequestLocale } from '@/lib/request-locale';
import { publicPageMetadata } from '@/lib/seo';

/** Sections that render a page; the others redirect to one of these. */
const SECTION_TITLES: Record<string, PageTitleKey> = {
  home: 'home',
  plan: 'plan',
  answers: 'answers',
  tests: 'tests',
  revision: 'revision',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string; section: string }>;
}) {
  const { courseId, section } = await params;
  if (!isCourseId(courseId) || courseId === 'react' || !Object.hasOwn(SECTION_TITLES, section))
    return {};
  const locale = await getRequestLocale();
  return publicPageMetadata(
    locale,
    `${courseDisplayName(courseId, locale)} · ${pageTitle(SECTION_TITLES[section], locale)}`,
    courseDescription(courseId, locale),
    // Day pages differ by ?day=, so only the plan has one canonical address.
    section === 'plan' ? `/courses/${courseId}/plan` : undefined,
  );
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string; section: string }>;
  searchParams: Promise<{ day?: string }>;
}) {
  const { courseId, section } = await params;
  if (
    !isCourseId(courseId) ||
    courseId === 'react' ||
    ![
      'home',
      'plan',
      'answers',
      'practice',
      'tests',
      'interview',
      'revision',
      'weak-topics',
    ].includes(section)
  )
    notFound();
  const query = await searchParams;
  const day = query.day !== undefined ? Number(query.day) : undefined;
  // The bound is the course's real published schedule, not a fixed calendar cap.
  if (
    day !== undefined &&
    (!Number.isInteger(day) || day < 0 || day > coursePublishedDays(courseId))
  )
    notFound();
  if (day === 0) redirect(`/courses/${courseId}/${section}?day=1`);
  const dayQuery = day !== undefined ? '?day=' + day : '';
  if (section === 'interview') redirect(`/courses/${courseId}/tests${dayQuery}`);
  // Old links: practice lives on the day page, weak topics are part of the review page.
  if (section === 'practice') redirect(`/courses/${courseId}/home${dayQuery}#day-practice`);
  if (section === 'weak-topics') redirect(`/courses/${courseId}/revision`);
  return (
    <PageTransition>
      <CourseWorkspace
        key={courseId + section + day}
        courseId={courseId}
        section={section}
        day={day}
        initialContent={
          courseAccessTier(courseId) === 'starter'
            ? await loadCourseContent(courseId).then(publicCourseContent, () => undefined)
            : undefined
        }
      />
    </PageTransition>
  );
}
