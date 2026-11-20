'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useAccount } from '@/components/account/account-provider';
import { PageHeading } from '@/components/learning/page-heading';
import { LEARNING_TOPICS, topicTitle } from '@/content/course';
import { courseDisplayName } from '@/lib/catalog-copy';
import { isCourseId, type ImportedCourseId } from '@/lib/courses/ids';
import { dateKey } from '@/lib/learning';
import { buildProgressReport } from '@/lib/progress/weekly-report';
import { useLearningStore } from '@/stores/learning-store';
import { CourseProgressCard } from './course-progress-card';
import { durationParts, formatDay, progressCopy, type ProgressCopy } from './progress-copy';
import { buildReportSources } from './report-sources';
import { useCoursePlans } from './use-course-plans';
import { WeekCard, type ReportLabels } from './week-card';
import { WeeklyActivityChart } from './weekly-activity-chart';

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--depth-1)]">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ copy }: { copy: ProgressCopy }) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-[var(--depth-1)]">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-brand">
        <BarChart3 size={24} aria-hidden="true" />
      </span>
      <h2 className="mt-3 text-lg font-semibold text-foreground">{copy.emptyTitle}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{copy.emptyText}</p>
      <Link
        href="/courses"
        className="button primary mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground no-underline"
      >
        {copy.emptyAction}
      </Link>
    </section>
  );
}

export function ProgressReport() {
  const state = useLearningStore();
  const account = useAccount();
  const copy = progressCopy(state.language);
  const today = dateKey();
  const createdAt = account.user?.created_at;
  const registeredOn = createdAt ? dateKey(new Date(createdAt)) : null;

  const report = useMemo(
    () => buildProgressReport({ sources: buildReportSources(state), registeredOn, today }),
    [state, registeredOn, today],
  );

  const courseIds = report.courses
    .map((course) => course.id)
    .filter((id): id is ImportedCourseId => isCourseId(id) && id !== 'react');
  const plans = useCoursePlans(courseIds, state.contentLanguage);

  const topicTitles = useMemo(
    () => new Map(LEARNING_TOPICS.map((topic) => [topic.id, topicTitle(topic, state.language)])),
    [state.language],
  );
  const nameOf = (sourceId: string) =>
    isCourseId(sourceId) ? courseDisplayName(sourceId, state.language) : sourceId;
  const titleOf = (sourceId: string, itemId: string) => {
    if (sourceId === 'react') return topicTitles.get(itemId) ?? null;
    return plans[sourceId]?.find((day) => day.id === itemId)?.title ?? null;
  };
  const labels: ReportLabels = { copy, titleOf, nameOf };

  const header = <PageHeading title={copy.title} subtitle={copy.subtitle} />;
  if (!state.ready || account.loading) {
    return (
      <>
        {header}
        <p className="text-sm text-muted-foreground">{copy.loading}</p>
      </>
    );
  }
  if (!report.hasActivity) {
    return (
      <>
        {header}
        <EmptyState copy={copy} />
      </>
    );
  }

  const time = durationParts(report.totals.seconds);
  const startLine = [
    report.startDate ? copy.startedOn(formatDay(report.startDate, copy.dateLocale)) : null,
    copy.nowInWeek(report.currentWeek),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      {header}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label={copy.summaryActiveDays} value={String(report.totals.activeDays)} />
        <StatTile label={copy.summaryTime} value={copy.duration(time.hours, time.minutes)} />
        <StatTile label={copy.summaryStreak} value={copy.days(report.totals.streak)} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{startLine}</p>

      <WeeklyActivityChart weeks={report.weeks} today={today} locale={state.language} copy={copy} />

      <div className="mt-6 space-y-4">
        {report.weeks.map((week) => (
          <WeekCard key={week.number} week={week} labels={labels} />
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-foreground">{copy.courses}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {report.courses.map((course) => {
            const plan = course.id === 'react' ? undefined : plans[course.id];
            const nextTitle =
              course.nextDay === null
                ? null
                : (plan?.find((day) => day.day === course.nextDay)?.title ?? null);
            return (
              <CourseProgressCard
                key={course.id}
                course={course}
                name={nameOf(course.id)}
                nextTitle={nextTitle}
                copy={copy}
              />
            );
          })}
        </div>
      </section>

      <ul className="mt-8 space-y-1.5 text-xs text-muted-foreground">
        {copy.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </>
  );
}
