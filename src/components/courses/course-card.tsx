'use client';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CourseCatalogEntry } from '@/content/courses/catalog';
import { courseDescription, courseDisplayName } from '@/lib/catalog-copy';
import { courseDayCount } from '@/lib/course-copy';
import type { CourseId } from '@/lib/courses/ids';
import { PREMIUM_COPY } from '@/lib/premium-copy';
import { cn } from '@/lib/utils';
import { useLearningStore } from '@/stores/learning-store';
import { BROWSE_COPY, CATALOG_UI } from './course-catalog-copy';
import { CourseIcon } from './course-icon';

/** How many lessons the server has ready for a course. */
export type CourseStatus = { id: CourseId; ready: boolean; lessons: number; files: number };

const TIER_STYLE = {
  starter: 'bg-success-soft text-success',
  pro: 'bg-primary-soft text-link',
  expert: 'bg-[var(--tier-expert-bg)] text-[var(--tier-expert-text)]',
} as const;

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
      className={cn(
        'course-card flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-5 transition-colors hover:border-primary',
        isSelected ? 'course-selected border-primary' : 'border-border',
      )}
      data-course={course.id}
      data-category={course.category}
      data-access-tier={tier}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="course-symbol rounded-xl bg-muted text-foreground">
          <CourseIcon courseId={course.id} size={48} />
        </span>
        <div className="course-badges flex flex-wrap justify-end gap-1.5">
          <span
            className={cn(
              'course-tier rounded-full px-2.5 py-1 text-xs font-semibold',
              `tier-${tier}`,
              TIER_STYLE[tier],
            )}
          >
            {tierLabel}
          </span>
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
          <span className="font-mono text-xs text-link">
            {courseDayCount(course.publishedDays, language)} · {tierLabel}
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

      <Button
        variant={isSelected ? 'default' : 'secondary'}
        className="w-full justify-between"
        aria-pressed={isSelected}
        onClick={() =>
          // Continue month 2 if the learner is already studying it.
          onChoose(isJavaScript && selectedCourse === 'javascript-2' ? 'javascript-2' : course.id)
        }
        aria-label={labels.choose + ' ' + name}
      >
        {isSelected ? labels.continue : labels.choose}
        <ArrowRight size={17} aria-hidden="true" />
      </Button>
    </article>
  );
}
