import { BarChart3 } from 'lucide-react';
import type { InterfaceLocale } from '@/lib/locale';
import type { WeekReport } from '@/lib/progress/weekly-report';
import { durationParts, type ProgressCopy } from './progress-copy';

const RECENT_WEEKS = 8;
const CHART_COPY = {
  en: {
    title: 'Weekly activity',
    description: 'See how many answers you gave each week.',
    correct: 'correct',
    incorrect: 'incorrect',
    noAnswers: 'No answers recorded in this period.',
  },
  ru: {
    title: 'Активность по неделям',
    description: 'Посмотрите, сколько ответов вы дали за каждую неделю.',
    correct: 'верно',
    incorrect: 'неверно',
    noAnswers: 'За этот период нет записанных ответов.',
  },
  tg: {
    title: 'Фаъолият ҳафта ба ҳафта',
    description: 'Бинед, ки дар ҳар ҳафта чанд ҷавоб додед.',
    correct: 'дуруст',
    incorrect: 'нодуруст',
    noAnswers: 'Дар ин давра ҷавоб сабт нашудааст.',
  },
  es: {
    title: 'Actividad semanal',
    description: 'Consulta cuántas respuestas diste cada semana.',
    correct: 'correctas',
    incorrect: 'incorrectas',
    noAnswers: 'No hay respuestas registradas en este periodo.',
  },
} satisfies Record<InterfaceLocale, Record<string, string>>;

export function WeeklyActivityChart({
  weeks,
  today,
  locale,
  copy,
}: {
  weeks: readonly WeekReport[];
  today: string;
  locale: InterfaceLocale;
  copy: ProgressCopy;
}) {
  if (!weeks.some((week) => week.activeDays > 0)) return null;

  const recent = weeks.slice(-RECENT_WEEKS);
  const maxAnswers = Math.max(...recent.map((week) => week.answers));
  const text = CHART_COPY[locale];
  const number = new Intl.NumberFormat(copy.dateLocale);
  const day = new Intl.DateTimeFormat(copy.dateLocale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  const date = (key: string) => new Date(key + 'T00:00:00Z');

  return (
    <section
      aria-labelledby="weekly-activity-title"
      className="mt-6 min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="weekly-activity-title" className="text-base font-semibold text-foreground">
              {text.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{text.description}</p>
          </div>
        </div>
        {maxAnswers > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
              {text.correct}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-rose-500 bg-[repeating-linear-gradient(135deg,transparent_0_3px,#8813374d_3px_5px)]" />
              {text.incorrect}
            </span>
          </div>
        )}
      </header>

      {maxAnswers === 0 && (
        <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
          {text.noAnswers}
        </p>
      )}

      <ol className="mt-4 divide-y divide-border">
        {recent.map((week) => {
          const end = week.end > today ? today : week.end;
          const time = durationParts(week.seconds);
          const timeLabel =
            week.seconds < 60
              ? `< ${copy.duration(0, 1)}`
              : copy.duration(time.hours, time.minutes);
          return (
            <li
              key={week.number}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-center gap-x-4 gap-y-2 py-3 lg:grid-cols-[minmax(9rem,1fr)_minmax(8rem,1.7fr)_minmax(10rem,1fr)]"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
                  {copy.weekTitle(week.number)}
                  {week.status === 'current' && (
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] leading-snug font-medium text-primary">
                      {copy.weekCurrent}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {day.formatRange(date(week.start), date(end))}
                </p>
              </div>
              {maxAnswers > 0 && (
                <div
                  className="col-span-2 col-start-1 row-start-2 flex h-2.5 overflow-hidden rounded-full bg-muted lg:col-span-1 lg:col-start-2 lg:row-start-1"
                  aria-hidden="true"
                >
                  <div
                    className="shrink-0 bg-emerald-600 dark:bg-emerald-400"
                    style={{ width: `${(week.correct / maxAnswers) * 100}%` }}
                  />
                  <div
                    className="shrink-0 bg-rose-500 bg-[repeating-linear-gradient(135deg,transparent_0_3px,#8813374d_3px_5px)]"
                    style={{ width: `${(week.mistakes / maxAnswers) * 100}%` }}
                  />
                </div>
              )}
              <div className="col-start-2 row-start-1 text-right text-xs text-muted-foreground lg:col-start-3">
                {week.answers > 0 ? (
                  <p className="text-sm font-medium text-foreground tabular-nums">
                    <span>
                      {text.correct}: {number.format(week.correct)}
                    </span>
                    <span> · </span>
                    <span>
                      {text.incorrect}: {number.format(week.mistakes)}
                    </span>
                  </p>
                ) : (
                  <p>{copy.answersCount(0)}</p>
                )}
                {week.seconds > 0 && (
                  <p className="mt-0.5">
                    {copy.metricTime}: {timeLabel}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
