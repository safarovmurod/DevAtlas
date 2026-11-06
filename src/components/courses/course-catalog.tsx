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
import { CatalogFilterPanel, type CatalogFilters } from './catalog-filters';
import { CATEGORY_ICONS } from './category-icons';
import { CourseCard, type CourseStatus } from './course-card';
import { BROWSE_COPY, CATALOG_UI, courseCountLabel } from './course-catalog-copy';

const NO_FILTERS: CatalogFilters = {
  category: 'all',
  subtrack: 'all',
  access: 'all',
  start: 'all',
  length: 'all',
};

// JavaScript month 2 is reached through the month tabs on the JS1 card.
const CATALOG_COURSES = COURSE_CATALOG.filter((course) => course.id !== 'javascript-2');

/** Duration buckets match the published programs: up to 14 days, 30 days, 44+ days. */
export function courseLengthBucket(days: number): 'short' | 'month' | 'long' {
  return days <= 14 ? 'short' : days <= 30 ? 'month' : 'long';
}

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

function matchesFilters(
  course: CourseCatalogEntry,
  filters: CatalogFilters,
  query: string,
  language: InterfaceLocale,
) {
  const { category, subtrack, access, start, length } = filters;
  if (access !== 'all' && (course.accessTier ?? 'starter') !== access) return false;
  if (start === 'zero' && course.prerequisite) return false;
  if (start === 'next' && !course.prerequisite) return false;
  if (length !== 'all' && courseLengthBucket(course.publishedDays ?? 0) !== length) return false;
  if (category !== 'all' && course.category !== category) return false;
  if (subtrack !== 'all' && course.category === 'programming' && course.subtrack !== subtrack)
    return false;

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
function groupCourses(courses: CourseCatalogEntry[]): CourseGroup[] {
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

/** The course catalog: categories, filters, search and course cards. */
export function CourseCatalog() {
  const router = useRouter();
  const language = useLearningStore((state) => state.language);
  const selected = useLearningStore((state) => (state.courseChosen ? state.selectedCourse : null));
  const labels = CATALOG_UI[language];
  const browse = BROWSE_COPY[language];

  const [statuses, setStatuses] = useState<CourseStatus[] | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CatalogFilters>(NO_FILTERS);

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
    router.push(id === 'react' ? '/courses/react' : `/courses/${id}/plan`, {
      transitionTypes: ['nav-fade'],
    });
  }

  function updateFilters(changes: Partial<CatalogFilters>) {
    setFilters((current) => ({ ...current, ...changes }));
  }

  function resetFilters() {
    setFilters(NO_FILTERS);
    setQuery('');
  }

  const visibleCourses = CATALOG_COURSES.filter((course) =>
    matchesFilters(course, filters, query, language),
  );
  const groups = groupCourses(visibleCourses);

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
      <OnboardingBanner />

      <CatalogFilterPanel courses={CATALOG_COURSES} filters={filters} onChange={updateFilters} />

      <div className="catalog-toolbar">
        <div>
          <h2>
            <BookOpen size={19} />
            {browse.browse}
          </h2>
          <span className="catalog-result-count" aria-live="polite">
            {courseCountLabel(visibleCourses.length, language)}
          </span>
        </div>
        <label className="catalog-search">
          <Search size={17} />
          <input
            aria-label={browse.searchLabel}
            placeholder={browse.search}
            value={query}
            onChange={(event) => {
              // Search looks through every category and access level.
              setQuery(event.target.value);
              updateFilters({ category: 'all', subtrack: 'all', access: 'all' });
            }}
          />
        </label>
      </div>

      <div className="catalog-groups">
        {groups.map((group) => {
          const Icon = CATEGORY_ICONS[group.category];
          return (
            <section
              className="catalog-course-group"
              key={group.key}
              aria-labelledby={'catalog-group-' + group.key}
            >
              <div className="catalog-group-heading">
                <span className="group-category-icon" data-category={group.category}>
                  <Icon size={18} />
                </span>
                <div>
                  {group.subtrack && (
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
              <div className="course-grid">
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

      {visibleCourses.length === 0 && (
        <div role="status" className="catalog-empty">
          <Search size={25} />
          <p>{query ? browse.noResults : browse.empty}</p>
          <button className="button subtle" onClick={resetFilters}>
            {browse.reset}
          </button>
        </div>
      )}
    </section>
  );
}
