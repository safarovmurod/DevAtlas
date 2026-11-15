import type { CourseReport } from '@/lib/progress/weekly-report';
import { durationParts, formatDay, type ProgressCopy } from './progress-copy';

export function CourseProgressCard({
  course,
  name,
  nextTitle,
  copy,
}: {
  course: CourseReport;
  name: string;
  /** Title of the next day, when its lesson content is available. */
  nextTitle: string | null;
  copy: ProgressCopy;
}) {
  const time = durationParts(course.seconds);
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <span className="shrink-0 text-sm font-semibold text-foreground">{course.percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={course.percent}
        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${course.percent}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {copy.courseDays(course.daysDone, course.total)}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-muted p-3">
          <dt className="text-xs text-muted-foreground">{copy.metricTime}</dt>
          <dd className="mt-1 font-semibold text-foreground">
            {copy.duration(time.hours, time.minutes)}
          </dd>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <dt className="text-xs text-muted-foreground">{copy.metricAnswers}</dt>
          <dd className="mt-1 font-semibold text-foreground">
            {course.answers ? `${course.correct} / ${course.answers}` : '—'}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        {course.lastActivity
          ? copy.lastActivity(formatDay(course.lastActivity, copy.dateLocale))
          : copy.noActivityDate}
      </p>
      {course.nextDay !== null && (
        <p className="mt-1 text-sm text-foreground">{copy.nextDay(course.nextDay, nextTitle)}</p>
      )}
    </article>
  );
}
