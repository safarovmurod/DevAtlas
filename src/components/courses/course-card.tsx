'use client';

import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CourseCatalogEntry } from '@/content/courses/catalog';
import { courseDescription, courseDisplayName } from '@/lib/catalog-copy';
import { courseDayCount } from '@/lib/course-copy';
import type { CourseId } from '@/lib/courses/ids';
import { cn } from '@/lib/utils';
import { useLearningStore } from '@/stores/learning-store';
import { BROWSE_COPY, CATALOG_UI } from './course-catalog-copy';
import { CourseIcon } from './course-icon';

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

  const statusText = status
    ? status.ready
      ? labels.ready(status.lessons)
      : labels.wait
    : statusFailed
      ? labels.unavailable
      : labels.checking;

  return (
    <article
      className={cn(
        'course-card group relative flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-5 shadow-[var(--depth-1)] transition-[transform,border-color,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-0.5 hover:shadow-[var(--depth-2)]',
        isSelected
          ? 'course-selected border-primary ring-1 ring-primary/30'
          : 'border-border hover:border-primary/50',
      )}
      data-course={course.id}
      data-category={course.category}
      data-access-tier={tier}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="course-symbol flex size-14 items-center justify-center rounded-2xl bg-muted shadow-xs">
          <CourseIcon courseId={course.id} size={40} shared />
        </span>
        <div className="flex flex-wrap items-start justify-end gap-1.5">
          {tier !== 'starter' && <Badge>{tier === 'expert' ? 'Ultra' : 'Pro'}</Badge>}
          {isSelected ? (
            <Badge variant="active">
              <CheckCircle2 size={14} aria-hidden="true" />
              {labels.selected}
            </Badge>
          ) : course.id === 'html' ? (
            <Badge variant="active">{labels.recommended}</Badge>
          ) : course.introductoryDays ? (
            <Badge className="intro-badge">{browse.intro}</Badge>
          ) : null}
        </div>
      </div>

      <div className="grid gap-1">
        <h3 className="text-base font-semibold text-foreground">{name}</h3>
        {course.publishedDays ? (
          <span className="font-mono text-xs text-brand">
            {courseDayCount(course.publishedDays, language)}
          </span>
        ) : null}
      </div>
      <p className="flex-1 text-sm leading-6 text-muted-foreground">
        {isJavaScript ? labels.jsDescription : courseDescription(course.id, language)}
      </p>

      <div className="grid gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="course-prerequisite">
          {course.prerequisite
            ? labels.after + courseDisplayName(course.prerequisite, language)
            : labels.fromZero}
        </span>
        <span className={cn('course-status', status?.ready && 'course-ready text-success')}>
          {statusText}
        </span>
      </div>

      {/* The whole card is the target: the button stretches over it. */}
      <button
        type="button"
        className="course-open flex min-h-11 items-center justify-between gap-2 rounded-xl text-sm font-medium text-brand before:absolute before:inset-0 before:rounded-2xl focus-visible:outline-2 focus-visible:outline-ring"
        aria-pressed={isSelected}
        aria-label={labels.choose + ' ' + name}
        onClick={() =>
          // Continue month 2 if the learner is already studying it.
          onChoose(isJavaScript && selectedCourse === 'javascript-2' ? 'javascript-2' : course.id)
        }
      >
        <span>{isSelected ? labels.continue : labels.choose}</span>
        <ArrowUpRight
          size={18}
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </button>
    </article>
  );
}
