'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Flame, TrendingUp } from 'lucide-react';
import type { InterfaceLocale } from '@/lib/locale';
import { addDays, type ProgressSource } from '@/lib/progress/weekly-report';
import { readOnboarding } from '@/lib/onboarding';
import { STUDY_DAYS, WEEKDAYS } from '@/components/onboarding/onboarding-copy';

const COPY: Record<
  InterfaceLocale,
  {
    title: string;
    subtitle: string;
    prev: string;
    next: string;
    studied: string;
    missed: string;
    today: string;
    rest: string;
    whatIfTitle: string;
    studiedDays: string;
    missedDays: string;
    avgPerDay: string;
    minutesUnit: string;
    whatIfNoMiss: (missed: number, wouldBe: number, total: number, pct: number) => string;
    whatIfPerfect: string;
    paceEstimate: (currentDate: string, scheduledDate: string) => string;
    dateLocale: string;
  }
> = {
  tg: {
    title: 'Тақвими омӯзиш ва таҳлили пропускҳо',
    subtitle:
      'Ҳар рӯзи хондашуда, рӯзҳои пропуск ва муқоиса: агар пропуск намекардед, дар куҷо мебудед.',
    prev: 'Моҳи пеш',
    next: 'Моҳи баъд',
    studied: 'Хонда шуд',
    missed: 'Пропуск',
    today: 'Имрӯз',
    rest: 'Истироҳат',
    whatIfTitle: 'Агар пропуск намекардед…',
    studiedDays: 'Рӯзҳои фаъол',
    missedDays: 'Пропускҳо',
    avgPerDay: 'Миёна дар рӯз',
    minutesUnit: 'дақ',
    whatIfNoMiss: (missed, wouldBe, total, pct) =>
      `Шумо ${missed} рӯзи графикро пропуск кардед. Агар пропуск намекардед, имрӯз дар рӯзи ${wouldBe} аз ${total} (${pct}%) мебудед — ${missed} дарс пештар!`,
    whatIfPerfect: 'Офарин! Шумо ягон рӯзи графикро пропуск накардаед — 100% дар реҷа ҳастед!',
    paceEstimate: (cur, sched) =>
      `Бо суръати ҳозира тахминан ${cur} тамом мешавад (бе пропуск: ${sched}).`,
    dateLocale: 'ru-RU',
  },
  ru: {
    title: 'Календарь обучения и анализ пропусков',
    subtitle: 'Отмечены все учебные дни, пропуски и расчёт — где бы вы были без пропусков.',
    prev: 'Предыдущий месяц',
    next: 'Следующий месяц',
    studied: 'Занимались',
    missed: 'Пропуск',
    today: 'Сегодня',
    rest: 'Выходной',
    whatIfTitle: 'Если бы не было пропусков…',
    studiedDays: 'Активных дней',
    missedDays: 'Пропущено',
    avgPerDay: 'В среднем за день',
    minutesUnit: 'мин',
    whatIfNoMiss: (missed, wouldBe, total, pct) =>
      `Пропущено учебных дней: ${missed}. Без пропусков сегодня вы были бы на дне ${wouldBe} из ${total} (${pct}%) — на ${missed} уроков впереди!`,
    whatIfPerfect: 'Отличный темп! Вы не пропустили ни одного учебного дня по графику.',
    paceEstimate: (cur, sched) => `При текущем темпе финиш около ${cur} (без пропусков: ${sched}).`,
    dateLocale: 'ru-RU',
  },
  en: {
    title: 'Study Calendar & Missed-Day Analysis',
    subtitle: 'Track every studied day, missed scheduled days, and your on-schedule projection.',
    prev: 'Previous month',
    next: 'Next month',
    studied: 'Studied',
    missed: 'Missed',
    today: 'Today',
    rest: 'Rest day',
    whatIfTitle: 'What if you had not missed days…',
    studiedDays: 'Active days',
    missedDays: 'Missed days',
    avgPerDay: 'Daily avg',
    minutesUnit: 'min',
    whatIfNoMiss: (missed, wouldBe, total, pct) =>
      `You missed ${missed} scheduled study day(s). Without misses, you would already be on day ${wouldBe} of ${total} (${pct}%) — ${missed} lessons ahead!`,
    whatIfPerfect: 'Outstanding! Zero missed scheduled days — you are 100% on track.',
    paceEstimate: (cur, sched) =>
      `At current pace, projected finish is ${cur} (on schedule: ${sched}).`,
    dateLocale: 'en-US',
  },
  es: {
    title: 'Calendario de estudio y análisis de faltas',
    subtitle: 'Ve cada día estudiado, los días perdidos y dónde estarías sin faltas.',
    prev: 'Mes anterior',
    next: 'Mes siguiente',
    studied: 'Estudiado',
    missed: 'Falta',
    today: 'Hoy',
    rest: 'Descanso',
    whatIfTitle: 'Si no hubieras faltado ningún día…',
    studiedDays: 'Días activos',
    missedDays: 'Faltas',
    avgPerDay: 'Media diaria',
    minutesUnit: 'min',
    whatIfNoMiss: (missed, wouldBe, total, pct) =>
      `Faltaste ${missed} día(s) del plan. Sin faltas ya estarías en el día ${wouldBe} de ${total} (${pct}%) — ¡${missed} lecciones más adelante!`,
    whatIfPerfect: '¡Excelente! Ningún día perdido según tu horario.',
    paceEstimate: (cur, sched) =>
      `Al ritmo actual terminarías sobre el ${cur} (sin faltas: ${sched}).`,
    dateLocale: 'es-ES',
  },
};

function mondayFirstWeekday(dayKey: string): number {
  const dow = new Date(dayKey + 'T00:00:00Z').getUTCDay();
  return dow === 0 ? 6 : dow - 1; // 0 = Mon .. 6 = Sun
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function StudyCalendar({
  sources,
  startDate,
  today,
  totalSeconds,
  primaryCourseTotal,
  primaryCourseDone,
  locale,
}: {
  sources: readonly ProgressSource[];
  startDate: string | null;
  today: string;
  totalSeconds: number;
  primaryCourseTotal: number;
  primaryCourseDone: number;
  locale: InterfaceLocale;
}) {
  const copy = COPY[locale] ?? COPY.ru;
  const todayDate = new Date(today + 'T00:00:00Z');
  const [viewYear, setViewYear] = useState(todayDate.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getUTCMonth());

  // Determine learner's scheduled weekdays from onboarding plan (defaults to Mon-Fri if none).
  const scheduledWeekdays = useMemo(() => {
    const saved = readOnboarding();
    const dpw = saved?.plan?.daysPerWeek ?? 5;
    return new Set(STUDY_DAYS[dpw] ?? STUDY_DAYS[5]);
  }, []);

  // Aggregate per-day activity across all courses (seconds + answers).
  const dayStats = useMemo(() => {
    const map = new Map<string, { seconds: number; answers: number }>();
    const bump = (day: string, sec: number, ans: number) => {
      const prev = map.get(day) ?? { seconds: 0, answers: 0 };
      prev.seconds += sec;
      prev.answers += ans;
      map.set(day, prev);
    };
    for (const src of sources) {
      for (const [day, sec] of Object.entries(src.studySeconds)) {
        if (sec > 0) bump(day, sec, 0);
      }
      for (const ans of Object.values(src.answers)) {
        if (ans.date) bump(ans.date, 0, 1);
      }
    }
    return map;
  }, [sources]);

  // Compute exact missed scheduled days between startDate and yesterday.
  const analysis = useMemo(() => {
    const origin = startDate && startDate <= today ? startDate : today;
    let scheduledElapsed = 0;
    let activeCount = 0;
    let missedCount = 0;

    let cursor = origin;
    // Cap scan at 365 days for safety.
    for (let guard = 0; guard < 366 && cursor <= today; guard++) {
      const hasStudy = dayStats.has(cursor);
      if (hasStudy) activeCount += 1;
      const isScheduled = scheduledWeekdays.has(mondayFirstWeekday(cursor));
      if (isScheduled && cursor < today) {
        scheduledElapsed += 1;
        if (!hasStudy) missedCount += 1;
      } else if (isScheduled && cursor === today) {
        scheduledElapsed += 1;
      }
      cursor = addDays(cursor, 1);
    }

    const totalDays = Math.max(1, primaryCourseTotal || 30);
    const actualDone = Math.max(primaryCourseDone, Math.min(totalDays, activeCount));
    const wouldBeDone = Math.min(totalDays, actualDone + missedCount);
    const wouldBePercent = Math.round((wouldBeDone / totalDays) * 100);
    const avgMin = activeCount > 0 ? Math.max(1, Math.round(totalSeconds / 60 / activeCount)) : 0;

    const remaining = Math.max(0, totalDays - actualDone);
    const activeRatio = scheduledElapsed > 0 ? Math.max(0.25, activeCount / scheduledElapsed) : 1;
    const daysPerWeek = Math.max(1, scheduledWeekdays.size);
    const calendarDaysOnSchedule = Math.ceil((remaining / daysPerWeek) * 7);
    const calendarDaysCurrentPace = Math.ceil(calendarDaysOnSchedule / activeRatio);

    const fmt = (key: string) =>
      new Intl.DateTimeFormat(copy.dateLocale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(key + 'T00:00:00Z'));

    return {
      activeCount,
      missedCount,
      wouldBeDone,
      totalDays,
      wouldBePercent,
      avgMin,
      currentFinish: fmt(addDays(today, calendarDaysCurrentPace)),
      scheduledFinish: fmt(addDays(today, calendarDaysOnSchedule)),
    };
  }, [
    startDate,
    today,
    dayStats,
    scheduledWeekdays,
    primaryCourseTotal,
    primaryCourseDone,
    totalSeconds,
    copy.dateLocale,
  ]);

  // Build calendar grid for viewYear / viewMonth (Monday first).
  const cells = useMemo(() => {
    const firstKey = `${monthKey(viewYear, viewMonth)}-01`;
    const leadBlanks = mondayFirstWeekday(firstKey);
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
    const list: (null | {
      key: string;
      dayNum: number;
      status: 'studied' | 'missed' | 'today' | 'upcoming' | 'rest' | 'before';
      minutes: number;
      answers: number;
    })[] = [];

    for (let i = 0; i < leadBlanks; i++) list.push(null);

    const origin = startDate ?? today;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${monthKey(viewYear, viewMonth)}-${pad2(d)}`;
      const stat = dayStats.get(key);
      const isToday = key === today;
      const isScheduled = scheduledWeekdays.has(mondayFirstWeekday(key));
      let status: 'studied' | 'missed' | 'today' | 'upcoming' | 'rest' | 'before';
      if (stat) status = 'studied';
      else if (isToday) status = 'today';
      else if (key < origin) status = 'before';
      else if (key < today) status = isScheduled ? 'missed' : 'rest';
      else status = isScheduled ? 'upcoming' : 'rest';
      list.push({
        key,
        dayNum: d,
        status,
        minutes: stat ? Math.max(1, Math.round(stat.seconds / 60)) : 0,
        answers: stat?.answers ?? 0,
      });
    }
    return list;
  }, [viewYear, viewMonth, dayStats, startDate, today, scheduledWeekdays]);

  const monthTitle = new Intl.DateTimeFormat(copy.dateLocale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(viewYear, viewMonth, 1)));

  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(d.getUTCFullYear());
    setViewMonth(d.getUTCMonth());
  }

  return (
    <section
      aria-labelledby="study-calendar-heading"
      className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--depth-1)] lg:grid-cols-[1.25fr_1fr]"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              id="study-calendar-heading"
              className="m-0 flex items-center gap-2 text-base font-semibold text-foreground"
            >
              <CalendarDays size={18} className="text-brand" aria-hidden="true" />
              {copy.title}
            </h2>
            <p className="mt-1 mb-0 text-xs text-muted-foreground">{copy.subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="icon-button !size-11"
              aria-label={copy.prev}
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[120px] text-center text-sm font-semibold capitalize">
              {monthTitle}
            </span>
            <button
              type="button"
              className="icon-button !size-11"
              aria-label={copy.next}
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-muted-foreground">
          {WEEKDAYS[locale].map((dayName) => (
            <span key={dayName} className="py-1">
              {dayName}
            </span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {cells.map((cell, idx) =>
            cell === null ? (
              <span key={`blank-${idx}`} className="h-10" aria-hidden="true" />
            ) : (
              <div
                key={cell.key}
                title={
                  cell.status === 'studied'
                    ? `${cell.key}: ${cell.minutes} ${copy.minutesUnit}${cell.answers ? ` · ${cell.answers}✓` : ''}`
                    : `${cell.key}: ${cell.status === 'missed' ? copy.missed : cell.status === 'today' ? copy.today : copy.rest}`
                }
                className={
                  'flex h-10 flex-col items-center justify-center rounded-xl border text-xs font-semibold tabular-nums transition-colors ' +
                  (cell.status === 'studied'
                    ? 'border-success/50 bg-success-soft text-success'
                    : cell.status === 'missed'
                      ? 'border-dashed border-warning/60 bg-warning/10 text-warning'
                      : cell.status === 'today'
                        ? 'border-primary bg-primary-soft text-brand ring-2 ring-primary/30'
                        : cell.status === 'upcoming'
                          ? 'border-border/70 bg-muted/35 text-foreground/80'
                          : 'border-transparent bg-transparent text-muted-foreground/55')
                }
              >
                <span>{cell.dayNum}</span>
                {cell.status === 'studied' && cell.minutes > 0 && (
                  <span className="text-[9px] leading-none opacity-80">{cell.minutes}′</span>
                )}
              </div>
            ),
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded bg-success-soft border border-success/50" />
            {copy.studied}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded bg-warning/15 border border-dashed border-warning/60" />
            {copy.missed}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded bg-primary-soft border border-primary" />
            {copy.today}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded bg-muted border border-border" />
            {copy.rest}
          </span>
        </div>
      </div>

      {/* What-If No Missed Days Reality Comparison */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border/80 bg-muted/35 p-4">
        <div className="grid gap-3">
          <h3 className="m-0 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp size={17} className="text-brand" aria-hidden="true" />
            {copy.whatIfTitle}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <strong className="block text-xl font-bold tabular-nums text-success">
                {analysis.activeCount}
              </strong>
              <span className="text-[11px] text-muted-foreground">{copy.studiedDays}</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <strong className="block text-xl font-bold tabular-nums text-warning">
                {analysis.missedCount}
              </strong>
              <span className="text-[11px] text-muted-foreground">{copy.missedDays}</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <strong className="block text-xl font-bold tabular-nums text-foreground">
                {analysis.avgMin} {copy.minutesUnit}
              </strong>
              <span className="text-[11px] text-muted-foreground">{copy.avgPerDay}</span>
            </div>
          </div>

          <p className="m-0 rounded-xl border border-primary/25 bg-primary-soft/50 p-3 text-xs leading-5 text-foreground sm:text-sm">
            {analysis.missedCount > 0
              ? copy.whatIfNoMiss(
                  analysis.missedCount,
                  analysis.wouldBeDone,
                  analysis.totalDays,
                  analysis.wouldBePercent,
                )
              : copy.whatIfPerfect}
          </p>
        </div>

        <p className="m-0 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <Flame size={15} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <span>{copy.paceEstimate(analysis.currentFinish, analysis.scheduledFinish)}</span>
        </p>
      </div>
    </section>
  );
}
