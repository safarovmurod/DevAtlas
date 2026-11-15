'use client';
import { Fragment } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { coursePublishedDays, courseTrack } from '@/content/courses/catalog';
import { courseDisplayName } from '@/lib/catalog-copy';
import { courseDayCount } from '@/lib/course-copy';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { CourseIcon } from './course-icon';
import { TRACK_LABEL } from './course-workspace-copy';

/** The courses of one learning track in order. Every level, Pro and Expert included, is free. */
export function TrackPath({
  courseId,
  language,
}: {
  courseId: ImportedCourseId;
  language: InterfaceLocale;
}) {
  const track = courseTrack(courseId);
  if (!track || track.courses.length < 2) return null;

  return (
    <nav aria-label={TRACK_LABEL[language]} className="mb-5 flex flex-wrap items-center gap-2">
      {track.courses.map((entry, index) => (
        <Fragment key={entry.course}>
          {index > 0 && (
            <ChevronRight size={16} aria-hidden="true" className="text-muted-foreground" />
          )}
          <Link
            href={entry.course === 'react' ? '/courses/react' : `/courses/${entry.course}/plan`}
            transitionTypes={['nav-fade']}
            aria-current={entry.course === courseId ? 'location' : undefined}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium no-underline transition-colors',
              entry.course === courseId
                ? 'border-primary bg-primary-soft text-brand'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            <CourseIcon courseId={entry.course} size={18} className="rounded-md" />
            {courseDisplayName(entry.course, language)} ·{' '}
            {courseDayCount(coursePublishedDays(entry.course), language)}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}

const JAVASCRIPT_MONTHS = ['javascript-1', 'javascript-2'] as const;

/** JavaScript is taught as two monthly courses; this switches between them. */
export function JavaScriptMonths({
  courseId,
  language,
}: {
  courseId: ImportedCourseId;
  language: InterfaceLocale;
}) {
  if (courseId !== 'javascript-1' && courseId !== 'javascript-2') return null;
  const ui = LEARNING_UI_COPY[language];

  return (
    <nav className="course-months" aria-label={ui.jsMonths}>
      {JAVASCRIPT_MONTHS.map((id, index) => (
        <Link
          key={id}
          href={`/courses/${id}/plan`}
          aria-current={id === courseId ? 'page' : undefined}
        >
          <strong>
            {ui.month} {index + 1} · JS{index + 1}
          </strong>
          <span>{index === 0 ? ui.jsBasics : ui.jsApps}</span>
        </Link>
      ))}
    </nav>
  );
}
