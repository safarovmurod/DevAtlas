'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Compass, Search } from 'lucide-react';
import { OnboardingBanner } from '@/components/onboarding/onboarding-banner';
import {
  COURSE_CATEGORIES,
  PROGRAMMING_SUBTRACKS,
  categoryLabel,
  subtrackLabel,
  type CourseCategoryId,
  type ProgrammingSubtrackId,
} from '@/content/course-categories';
import { COURSE_CATALOG, type CourseCatalogEntry } from '@/content/courses/catalog';
import { courseDescription, courseDisplayName } from '@/lib/catalog-copy';
import { isCourseId, type CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { CatalogCategoryGrid } from './catalog-filters';
import { CatalogOverview } from './catalog-overview';
import { CATEGORY_ICONS } from './category-icons';
import { CourseCard, type CourseStatus } from './course-card';
import { MyCourses } from './my-courses';
import { BROWSE_COPY, CATALOG_UI, courseCountLabel } from './course-catalog-copy';

// JavaScript month 2 is reached through the month tabs on the JS1 card.
export const CATALOG_COURSES = COURSE_CATALOG.filter((course) => course.id !== 'javascript-2');

function isCourseStatusList(data: unknown): data is CourseStatus[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        item &&
        isCourseId(item.id) &&
        typeof item.ready === 'boolean' &&
        Number.isInteger(item.lessons) &&
        item.lessons >= 0 &&
        Number.isInteger(item.files) &&
        item.files >= 0,
    )
  );
}

/** Search looks through names, descriptions and direction labels. */
export function matchesSearch(
  course: CourseCatalogEntry,
  query: string,
  language: InterfaceLocale,
) {
  const searchable = [
    course.name,
    courseDisplayName(course.id, language),
    course.ru,
    course.en,
    courseDescription(course.id, language),
    categoryLabel(course.category, language),
    course.subtrack ? subtrackLabel(course.subtrack, language) : '',
  ];
  return searchable.join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}

type CourseGroup = {
  key: string;
  category: CourseCategoryId;
  subtrack: ProgrammingSubtrackId | null;
  courses: CourseCatalogEntry[];
};

/** Programming is grouped by specialization, every other category is one group. */
export function groupCourses(courses: CourseCatalogEntry[]): CourseGroup[] {
  return COURSE_CATEGORIES.flatMap(({ id }): CourseGroup[] => {
    if (id !== 'programming') {
      const inCategory = courses.filter((course) => course.category === id);
      return [{ key: id, category: id, subtrack: null, courses: inCategory }];
    }
    return PROGRAMMING_SUBTRACKS.map((track) => ({
      key: id + '-' + track.id,
      category: id,
      subtrack: track.id,
      courses: courses.filter((course) => course.category === id && course.subtrack === track.id),
    }));
  }).filter((group) => group.courses.length > 0);
}

/** Ready-lesson statuses from the server and the "open this course" action. */
export function useCourseChoice() {
  const router = useRouter();
  const selected = useLearningStore((state) => (state.courseChosen ? state.selectedCourse : null));
  const [statuses, setStatuses] = useState<CourseStatus[] | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);

  // How many lessons each course has ready on the server.
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/courses', {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unavailable');
        const data: unknown = await response.json();
        if (!isCourseStatusList(data)) throw new Error('Invalid course status');
        if (!controller.signal.aborted) setStatuses(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatusFailed(true);
      });
    return () => controller.abort();
  }, []);

  function choose(id: CourseId) {
    useLearningStore.getState().chooseCourse(id);
    useAppStore.setState({ sidebarOpen: false, tutorDrawerOpen: false, tutorQuestion: null });
    // Straight into the course: the logo morphs from the card into the page header.
    router.push(id === 'react' ? '/courses/react' : `/courses/${id}/plan`, {
      transitionTypes: ['nav-forward'],
    });
  }

  return { statuses, statusFailed, selected, choose };
}

/** Course groups with a heading each; programming shows its specializations. */
export function CourseGroupList({
  courses,
  showCategory = true,
}: {
  courses: CourseCatalogEntry[];
  showCategory?: boolean;
}) {
  const language = useLearningStore((state) => state.language);
  const { statuses, statusFailed, selected, choose } = useCourseChoice();
  const groups = groupCourses(courses);

  return (
    <div className="catalog-groups">
      {groups.map((group) => {
        const Icon = CATEGORY_ICONS[group.category];
        return (
          <section
            className="catalog-course-group"
            key={group.key}
            aria-labelledby={
              showCategory || group.subtrack ? 'catalog-group-' + group.key : undefined
            }
          >
            {/* A direction page already names the direction; only specializations need a heading. */}
            {(showCategory || group.subtrack) && (
              <div className="catalog-group-heading">
                <span className="group-category-icon" data-category={group.category}>
                  <Icon size={18} />
                </span>
                <div>
                  {group.subtrack && showCategory && (
                    <span className="group-parent-category">
                      {categoryLabel(group.category, language)}
                    </span>
                  )}
                  <h2 id={'catalog-group-' + group.key}>
                    {group.subtrack
                      ? subtrackLabel(group.subtrack, language)
                      : categoryLabel(group.category, language)}
                  </h2>
                </div>
                <span className="group-course-count">
                  {courseCountLabel(group.courses.length, language)}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  statuses={statuses}
                  statusFailed={statusFailed}
                  selectedCourse={selected}
                  onChoose={choose}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** The course catalog: direction cards and a search across every course. */
export function CourseCatalog() {
  const language = useLearningStore((state) => state.language);
  const labels = CATALOG_UI[language];
  const browse = BROWSE_COPY[language];
  const [query, setQuery] = useState('');

  const searching = query.trim() !== '';
  const found = searching
    ? CATALOG_COURSES.filter((course) => matchesSearch(course, query, language))
    : [];

  return (
    <section className="course-catalog">
      <div className="course-intro">
        <span className="eyebrow">
          <Compass size={16} />
          {labels.eyebrow}
        </span>
        <h1>{labels.title}</h1>
        <p>{labels.intro}</p>
      </div>
      <CatalogOverview />
      <MyCourses />
      <OnboardingBanner />

      <div className="catalog-toolbar">
        <div>
          <h2>
            <BookOpen size={19} />
            {browse.browse}
          </h2>
          {searching && (
            <span className="catalog-result-count" aria-live="polite">
              {courseCountLabel(found.length, language)}
            </span>
          )}
        </div>
        <label className="catalog-search">
          <Search size={17} />
          <input
            aria-label={browse.searchLabel}
            placeholder={browse.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {searching ? (
        <>
          <CourseGroupList courses={found} />
          {found.length === 0 && (
            <div role="status" className="catalog-empty">
              <Search size={25} />
              <p>{browse.noResults}</p>
              <button className="button subtle" onClick={() => setQuery('')}>
                {browse.reset}
              </button>
            </div>
          )}
        </>
      ) : (
        <CatalogCategoryGrid courses={CATALOG_COURSES} />
      )}
    </section>
  );
}
