'use client';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { CourseCatalogEntry } from '@/content/courses/catalog';
import { courseDescription, courseDisplayName } from '@/lib/catalog-copy';
import type { CourseId } from '@/lib/courses/ids';
import { PREMIUM_COPY } from '@/lib/premium-copy';
import { useLearningStore } from '@/stores/learning-store';
import { BROWSE_COPY, CATALOG_UI } from './course-catalog-copy';

/** How many lessons the server has ready for a course. */
export type CourseStatus = { id: CourseId; ready: boolean; lessons: number; files: number };

/** One course in the catalog. JavaScript months 1 and 2 share a single card. */
export function CourseCard({
  course,
  statuses,
  statusFailed,
  selectedCourse,
  onChoose,
}: {
  course: CourseCatalogEntry;
  statuses: CourseStatus[] | null;
  statusFailed: boolean;
  selectedCourse: CourseId | null;
  onChoose: (id: CourseId) => void;
}) {
  const language = useLearningStore((state) => state.language);
  const labels = CATALOG_UI[language];
  const browse = BROWSE_COPY[language];
  const premium = PREMIUM_COPY[language];

  const isJavaScript = course.id === 'javascript-1';
  const parts = statuses?.filter((item) =>
    isJavaScript ? item.id === 'javascript-1' || item.id === 'javascript-2' : item.id === course.id,
  );
  const status = parts?.length
    ? {
        ready: parts.some((item) => item.ready),
        lessons: parts.reduce((sum, item) => sum + item.lessons, 0),
      }
    : undefined;

  const name = isJavaScript ? 'JavaScript' : courseDisplayName(course.id, language);
  const isSelected =
    selectedCourse === course.id || (isJavaScript && selectedCourse === 'javascript-2');
  const tier = course.accessTier ?? 'starter';
  const tierLabel = tier === 'expert' ? 'Expert' : tier === 'pro' ? 'Pro' : premium.starter;

  const statusText = status
    ? status.ready
      ? labels.ready(status.lessons)
      : labels.wait
    : statusFailed
      ? labels.unavailable
      : labels.checking;

  return (
    <article
      className={'panel course-card ' + (isSelected ? 'course-selected' : '')}
      data-course={course.id}
      data-category={course.category}
      data-access-tier={tier}
    >
      <div className="between">
        <span className="course-symbol">{course.symbol}</span>
        <div className="course-badges">
          <span className={'course-tier tier-' + tier}>{tierLabel}</span>
          {isSelected ? (
            <span className="badge">
              <CheckCircle2 size={14} />
              {labels.selected}
            </span>
          ) : course.id === 'html' ? (
            <span className="badge">{labels.recommended}</span>
          ) : course.introductoryDays ? (
            <span className="badge intro-badge">{browse.intro}</span>
          ) : null}
        </div>
      </div>
      <h3>{name}</h3>
      <p>{isJavaScript ? labels.jsDescription : courseDescription(course.id, language)}</p>
      <span className="course-prerequisite">
        {course.prerequisite
          ? labels.after + courseDisplayName(course.prerequisite, language)
          : labels.fromZero}
      </span>
      <span className={'course-status ' + (status?.ready ? 'course-ready' : '')}>{statusText}</span>
      <button
        className={'button ' + (isSelected ? 'primary' : 'subtle')}
        aria-pressed={isSelected}
        onClick={() =>
          // Continue month 2 if the learner is already studying it.
          onChoose(isJavaScript && selectedCourse === 'javascript-2' ? 'javascript-2' : course.id)
        }
        aria-label={labels.choose + ' ' + name}
      >
        {isSelected ? labels.continue : labels.choose}
        <ArrowRight size={17} />
      </button>
    </article>
  );
}
