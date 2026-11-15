import { dateKey } from '@/lib/learning';

/**
 * Weekly progress report, computed only from saved learning data.
 *
 * Pure: the caller passes the store snapshot and today's day key, so the same
 * input always gives the same report. Days are local day keys (YYYY-MM-DD).
 *
 * What is dated and what is not:
 * - answers carry a date, study time is stored per day: both go into weeks;
 * - a completed practice has no date of its own, so it is dated by the last
 *   save of its draft (draftClock); without that it only counts in totals;
 * - completed lessons and confirmed days have no date at all: they count in
 *   totals and in course progress, never in a week.
 */

export const REPORT_WEEK_DAYS = 7;
export const INTERVIEW_MODE = 'interview';
const REACT_SOURCE_ID = 'react';
const DAY_MS = 86_400_000;
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export interface ReportAnswer {
  questionId: string;
  topicId: string;
  mode: string;
  correct: boolean;
  date: string;
}

/** One course (or React) with everything the report reads from it. */
export interface ProgressSource {
  id: string;
  /** Scheduled days in the course plan. */
  total: number;
  /** Confirmed day numbers, 1-based. */
  confirmedDays: readonly number[];
  completedTopics: readonly string[];
  completedPractice: readonly string[];
  answers: Readonly<Record<string, ReportAnswer>>;
  /** Study seconds per local day key. */
  studySeconds: Readonly<Record<string, number>>;
  /** Last save time (ms) per draft id. Practice drafts share the id of their practice. */
  draftClock: Readonly<Record<string, number>>;
}

export interface ProgressReportInput {
  sources: readonly ProgressSource[];
  /** Local day key of account creation, or null for a guest. */
  registeredOn: string | null;
  /** Local day key of today. */
  today: string;
  /** Turns a timestamp into a local day key. */
  dayOf?: (ms: number) => string;
}

export interface ReportItem {
  sourceId: string;
  /** Topic or lesson id, as stored in the answers. */
  itemId: string;
  answers: number;
  mistakes: number;
  practice: number;
}

export interface WeekLeft {
  sourceId: string;
  total: number;
  daysDone: number;
  /** As of today: the days are not dated, so this is the current state. */
  daysLeft: number;
}

export interface WeekReport {
  number: number;
  start: string;
  end: string;
  status: 'current' | 'ended';
  answers: number;
  correct: number;
  /** Percent of correct answers, or null when nothing was answered that week. */
  score: number | null;
  interviewAnswers: number;
  interviewCorrect: number;
  practiceDone: number;
  activeDays: number;
  seconds: number;
  mistakes: number;
  /** Topics touched this week, most active first. */
  items: ReportItem[];
  /** Courses that had activity this week, with what is still left in them. */
  left: WeekLeft[];
}

export interface CourseReport {
  id: string;
  total: number;
  daysDone: number;
  percent: number;
  /** First day number not confirmed yet, or null when every day is done. */
  nextDay: number | null;
  lastActivity: string | null;
  seconds: number;
  answers: number;
  correct: number;
}

export interface ReportTotals {
  activeDays: number;
  seconds: number;
  /** Consecutive active days ending today (or yesterday, when today has none yet). */
  streak: number;
  answers: number;
  correct: number;
  practiceDone: number;
}

export interface ProgressReport {
  hasActivity: boolean;
  /** First day of week 1, or null when there is no date to start from. */
  startDate: string | null;
  today: string;
  /** Number of the week that contains today; 0 when the report has no start date. */
  currentWeek: number;
  /** Week 1 first. A week appears once it has started, so week N+1 waits for week N to end. */
  weeks: WeekReport[];
  /** Started courses, most recent activity first. */
  courses: CourseReport[];
  totals: ReportTotals;
}

/** Practice ids of React are `<topic>-exercise-<n>` or `local-project-<n>`. */
export function practiceTopicId(sourceId: string, practiceId: string): string {
  if (sourceId !== REACT_SOURCE_ID) return practiceId;
  const marker = practiceId.indexOf('-exercise-');
  if (marker > 0) return practiceId.slice(0, marker);
  if (practiceId.startsWith('local-project-')) return 'local-practice';
  return practiceId;
}

export function isDayKey(value: unknown): value is string {
  if (typeof value !== 'string' || !DAY_KEY.test(value)) return false;
  const time = Date.parse(value + 'T00:00:00Z');
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value;
}

/** Adds whole days to a day key. Calendar arithmetic in UTC, so no time zone can shift it. */
export function addDays(day: string, days: number): string {
  return new Date(Date.parse(day + 'T00:00:00Z') + days * DAY_MS).toISOString().slice(0, 10);
}

function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / DAY_MS);
}

function defaultDayOf(ms: number): string {
  return dateKey(new Date(ms));
}

function isStarted(source: ProgressSource): boolean {
  return (
    Object.keys(source.answers).length > 0 ||
    source.completedTopics.length > 0 ||
    source.completedPractice.length > 0 ||
    source.confirmedDays.length > 0 ||
    Object.values(source.studySeconds).some((seconds) => seconds > 0)
  );
}

function currentStreak(activeDates: ReadonlySet<string>, today: string): number {
  let cursor = activeDates.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (activeDates.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function buildProgressReport({
  sources,
  registeredOn,
  today,
  dayOf = defaultDayOf,
}: ProgressReportInput): ProgressReport {
  if (!isDayKey(today)) throw new Error('Invalid report date');
  const isPast = (day: unknown): day is string => isDayKey(day) && day <= today;

  // Keep only facts with a valid date that is not in the future.
  const facts = sources.map((source) => {
    const answers = Object.values(source.answers).filter((answer) => isPast(answer.date));
    const seconds = Object.entries(source.studySeconds).filter(
      ([day, value]) => isPast(day) && Number.isFinite(value) && value > 0,
    );
    const practice = source.completedPractice.flatMap((id) => {
      const saved = source.draftClock[id];
      if (!Number.isFinite(saved) || saved <= 0) return [];
      const date = dayOf(saved);
      return isPast(date) ? [{ topicId: practiceTopicId(source.id, id), date }] : [];
    });
    const confirmed = new Set(
      source.confirmedDays.filter(
        (day) => Number.isInteger(day) && day >= 1 && day <= source.total,
      ),
    );
    return { source, answers, seconds, practice, confirmed };
  });

  const activeDates = new Set<string>();
  for (const fact of facts) {
    for (const answer of fact.answers) activeDates.add(answer.date);
    for (const [day] of fact.seconds) activeDates.add(day);
    for (const item of fact.practice) activeDates.add(item.date);
  }
  const earliestActivity = [...activeDates].sort()[0];

  // The report starts at the earlier of registration and the first dated activity.
  const candidates = [registeredOn, earliestActivity].filter(isPast).sort();
  const hasActivity = facts.some((fact) => isStarted(fact.source));
  const startDate = candidates.length > 0 ? candidates[0] : hasActivity ? today : null;

  const origin = startDate ?? today;
  const weekCount = startDate ? Math.floor(dayDiff(origin, today) / REPORT_WEEK_DAYS) + 1 : 0;
  const weeks: WeekReport[] = [];
  for (let number = 1; number <= weekCount; number += 1) {
    const start = addDays(origin, (number - 1) * REPORT_WEEK_DAYS);
    const end = addDays(start, REPORT_WEEK_DAYS - 1);
    const inWeek = (day: string) => day >= start && day <= end;
    const days = new Set<string>();
    const items = new Map<string, ReportItem>();
    const left: WeekLeft[] = [];
    const itemFor = (sourceId: string, itemId: string) => {
      const key = sourceId + '\u0000' + itemId;
      let item = items.get(key);
      if (!item) {
        item = { sourceId, itemId, answers: 0, mistakes: 0, practice: 0 };
        items.set(key, item);
      }
      return item;
    };
    let answers = 0,
      correct = 0,
      interviewAnswers = 0,
      interviewCorrect = 0,
      practiceDone = 0,
      seconds = 0;

    for (const fact of facts) {
      const sourceId = fact.source.id;
      let touched = false;
      for (const answer of fact.answers) {
        if (!inWeek(answer.date)) continue;
        touched = true;
        days.add(answer.date);
        answers += 1;
        if (answer.correct) correct += 1;
        if (answer.mode === INTERVIEW_MODE) {
          interviewAnswers += 1;
          if (answer.correct) interviewCorrect += 1;
        }
        const item = itemFor(sourceId, answer.topicId);
        item.answers += 1;
        if (!answer.correct) item.mistakes += 1;
      }
      for (const [day, value] of fact.seconds) {
        if (!inWeek(day)) continue;
        touched = true;
        days.add(day);
        seconds += value;
      }
      for (const practice of fact.practice) {
        if (!inWeek(practice.date)) continue;
        touched = true;
        days.add(practice.date);
        practiceDone += 1;
        itemFor(sourceId, practice.topicId).practice += 1;
      }
      if (touched) {
        const total = fact.source.total;
        const daysDone = fact.confirmed.size;
        left.push({
          sourceId,
          total,
          daysDone,
          daysLeft: Math.max(0, total - daysDone),
        });
      }
    }

    const weekItems = [...items.values()]
      .filter((item) => item.answers > 0 || item.practice > 0)
      .sort(
        (a, b) =>
          b.answers + b.practice - (a.answers + a.practice) || a.itemId.localeCompare(b.itemId),
      );
    weeks.push({
      number,
      start,
      end,
      status: end < today ? 'ended' : 'current',
      answers,
      correct,
      score: answers > 0 ? Math.round((correct / answers) * 100) : null,
      interviewAnswers,
      interviewCorrect,
      practiceDone,
      activeDays: days.size,
      seconds,
      mistakes: answers - correct,
      items: weekItems,
      left,
    });
  }

  const courses: CourseReport[] = facts
    .filter((fact) => isStarted(fact.source))
    .map((fact) => {
      const { source, answers, seconds, practice, confirmed } = fact;
      const dates = [
        ...answers.map((answer) => answer.date),
        ...seconds.map(([day]) => day),
        ...practice.map((item) => item.date),
      ];
      const total = source.total;
      const daysDone = confirmed.size;
      let nextDay: number | null = null;
      for (let day = 1; day <= total && nextDay === null; day += 1) {
        if (!confirmed.has(day)) nextDay = day;
      }
      return {
        id: source.id,
        total,
        daysDone,
        percent: total > 0 ? Math.round((daysDone / total) * 100) : 0,
        nextDay,
        lastActivity: dates.length
          ? dates.reduce((latest, day) => (day > latest ? day : latest))
          : null,
        seconds: seconds.reduce((sum, [, value]) => sum + value, 0),
        answers: answers.length,
        correct: answers.filter((answer) => answer.correct).length,
      };
    })
    .sort(
      (a, b) =>
        (b.lastActivity ?? '').localeCompare(a.lastActivity ?? '') || a.id.localeCompare(b.id),
    );

  const totals: ReportTotals = {
    activeDays: activeDates.size,
    seconds: facts.reduce(
      (sum, fact) => sum + fact.seconds.reduce((inner, [, value]) => inner + value, 0),
      0,
    ),
    streak: currentStreak(activeDates, today),
    answers: facts.reduce((sum, fact) => sum + fact.answers.length, 0),
    correct: facts.reduce(
      (sum, fact) => sum + fact.answers.filter((answer) => answer.correct).length,
      0,
    ),
    practiceDone: sources.reduce((sum, source) => sum + new Set(source.completedPractice).size, 0),
  };

  return {
    hasActivity,
    startDate,
    today,
    currentWeek: weeks.length,
    weeks,
    courses,
    totals,
  };
}
