import type { WeekReport } from '@/lib/progress/weekly-report';
import { durationParts, formatDay, type ProgressCopy } from './progress-copy';

/** Lookups the cards need from the page: titles of lessons and names of courses. */
export interface ReportLabels {
  copy: ProgressCopy;
  titleOf: (sourceId: string, itemId: string) => string | null;
  nameOf: (sourceId: string) => string;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function WeekCard({ week, labels }: { week: WeekReport; labels: ReportLabels }) {
  const { copy } = labels;
  const current = week.status === 'current';
  const time = durationParts(week.seconds);
  const studied = week.items.filter((item) => item.answers > 0 || item.practice > 0);
  const mistakes = week.items.filter((item) => item.mistakes > 0);
  const itemName = (sourceId: string, itemId: string) =>
    labels.titleOf(sourceId, itemId) ?? `${labels.nameOf(sourceId)} · ${copy.lessonFallback}`;

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{copy.weekTitle(week.number)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDay(week.start, copy.dateLocale)} – {formatDay(week.end, copy.dateLocale)}
          </p>
        </div>
        <span
          className={
            current
              ? 'rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary'
              : 'rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'
          }
        >
          {current ? copy.weekCurrent : copy.weekEnded}
        </span>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label={copy.metricScore} value={week.score === null ? '—' : `${week.score}%`} />
        <Metric
          label={copy.metricAnswers}
          value={week.answers ? copy.answersOfCorrect(week.correct, week.answers) : '—'}
        />
        <Metric
          label={copy.metricInterview}
          value={
            week.interviewAnswers
              ? copy.answersOfCorrect(week.interviewCorrect, week.interviewAnswers)
              : '—'
          }
        />
        <Metric label={copy.metricPractice} value={String(week.practiceDone)} />
        <Metric label={copy.metricActiveDays} value={String(week.activeDays)} />
        <Metric label={copy.metricTime} value={copy.duration(time.hours, time.minutes)} />
        <Metric label={copy.metricMistakes} value={String(week.mistakes)} />
      </dl>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold text-foreground">{copy.studied}</h3>
          {studied.length ? (
            <ul className="mt-2 space-y-2">
              {studied.map((item) => (
                <li
                  key={item.sourceId + item.itemId}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="text-foreground">{itemName(item.sourceId, item.itemId)}</span>
                  {item.answers > 0 && (
                    <span className="shrink-0 text-muted-foreground">
                      {copy.answersCount(item.answers)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{copy.nothingStudied}</p>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-foreground">{copy.mistakesTitle}</h3>
          {mistakes.length ? (
            <ul className="mt-2 space-y-2">
              {mistakes.map((item) => (
                <li
                  key={item.sourceId + item.itemId}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="text-foreground">{itemName(item.sourceId, item.itemId)}</span>
                  <span className="shrink-0 text-destructive">
                    {copy.mistakesCount(item.mistakes)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{copy.noMistakes}</p>
          )}
        </section>
      </div>

      {week.left.length > 0 && (
        <section className="mt-5 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">{copy.left}</h3>
          <ul className="mt-2 space-y-1.5">
            {week.left.map((course) => (
              <li key={course.sourceId} className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-foreground">{labels.nameOf(course.sourceId)}</span>
                <span className="text-muted-foreground">
                  {copy.leftOf(course.daysLeft, course.total)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
