// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  buildReportSources,
  reactDayNumber,
  reactStudySeconds,
} from '@/components/progress/report-sources';
import { emptyCourseProgress, emptyProgress } from '@/lib/account/progress';
import {
  addDays,
  buildProgressReport,
  isDayKey,
  practiceTopicId,
  type ProgressSource,
  type ReportAnswer,
} from '@/lib/progress/weekly-report';

const source = (overrides: Partial<ProgressSource> = {}): ProgressSource => ({
  id: 'html',
  total: 30,
  confirmedDays: [],
  completedTopics: [],
  completedPractice: [],
  answers: {},
  studySeconds: {},
  draftClock: {},
  ...overrides,
});

const answer = (
  questionId: string,
  date: string,
  correct: boolean,
  mode = 'test',
  topicId = 'html-day-01',
): ReportAnswer => ({ questionId, topicId, mode, correct, date });

/** Stores answers the way the learning store does: one record per day, mode and question. */
const answersBy = (...list: ReportAnswer[]) =>
  Object.fromEntries(list.map((item, index) => [`${item.date}:${item.mode}:${index}`, item]));

/** Timestamp at noon UTC on a day, so the Dushanbe day key is the same date. */
const noonUtc = (day: string) => Date.parse(day + 'T12:00:00Z');

describe('buildProgressReport: empty state', () => {
  it('has no activity and no weeks for a guest who has not studied', () => {
    const report = buildProgressReport({
      sources: [source()],
      registeredOn: null,
      today: '2026-11-15',
    });
    expect(report.hasActivity).toBe(false);
    expect(report.startDate).toBeNull();
    expect(report.weeks).toEqual([]);
    expect(report.courses).toEqual([]);
    expect(report.totals).toEqual({
      activeDays: 0,
      seconds: 0,
      streak: 0,
      answers: 0,
      correct: 0,
      practiceDone: 0,
    });
  });

  it('keeps the registration date as the start even before any activity', () => {
    const report = buildProgressReport({
      sources: [source()],
      registeredOn: '2026-11-01',
      today: '2026-11-15',
    });
    expect(report.hasActivity).toBe(false);
    expect(report.startDate).toBe('2026-11-01');
  });
});

describe('buildProgressReport: week boundaries', () => {
  it('shows week 1 while it runs and week 2 only after week 1 has ended', () => {
    const base = { sources: [source()], registeredOn: '2026-11-01' };

    const lastDayOfWeekOne = buildProgressReport({ ...base, today: '2026-11-07' });
    expect(lastDayOfWeekOne.weeks).toHaveLength(1);
    expect(lastDayOfWeekOne.weeks[0]).toMatchObject({
      number: 1,
      start: '2026-11-01',
      end: '2026-11-07',
      status: 'current',
    });
    expect(lastDayOfWeekOne.currentWeek).toBe(1);

    const firstDayOfWeekTwo = buildProgressReport({ ...base, today: '2026-11-08' });
    expect(firstDayOfWeekTwo.weeks).toHaveLength(2);
    expect(firstDayOfWeekTwo.weeks[0]).toMatchObject({ start: '2026-11-01', status: 'ended' });
    expect(firstDayOfWeekTwo.weeks[1]).toMatchObject({
      number: 2,
      start: '2026-11-08',
      end: '2026-11-14',
      status: 'current',
    });
    expect(firstDayOfWeekTwo.currentWeek).toBe(2);
  });

  it('counts many weeks from the start date across a long period', () => {
    const report = buildProgressReport({
      sources: [source({ completedTopics: ['a'] })],
      registeredOn: '2026-01-05',
      today: '2026-11-15',
    });
    const days =
      (Date.parse('2026-11-15T00:00:00Z') - Date.parse('2026-01-05T00:00:00Z')) / 86_400_000;
    expect(report.weeks).toHaveLength(Math.floor(days / 7) + 1);
    expect(report.weeks.at(-1)?.start).toBe(addDays('2026-01-05', (report.weeks.length - 1) * 7));
  });

  it('starts at the earlier of registration and the first dated activity', () => {
    const later = buildProgressReport({
      sources: [source({ answers: answersBy(answer('q1', '2026-11-03', true)) })],
      registeredOn: '2026-10-20',
      today: '2026-11-15',
    });
    expect(later.startDate).toBe('2026-10-20');

    const activityFirst = buildProgressReport({
      sources: [source({ answers: answersBy(answer('q1', '2026-11-03', true)) })],
      registeredOn: '2026-11-09',
      today: '2026-11-15',
    });
    expect(activityFirst.startDate).toBe('2026-11-03');
  });

  it('ignores a registration date that is not a real calendar day', () => {
    const report = buildProgressReport({
      sources: [source({ answers: answersBy(answer('q1', '2026-11-03', true)) })],
      registeredOn: '2026-02-30',
      today: '2026-11-15',
    });
    expect(report.startDate).toBe('2026-11-03');
  });

  it('rejects an invalid report date', () => {
    expect(() =>
      buildProgressReport({ sources: [], registeredOn: null, today: 'not-a-date' }),
    ).toThrow('Invalid report date');
  });
});

describe('buildProgressReport: weekly numbers', () => {
  const sample = () =>
    buildProgressReport({
      sources: [
        source({
          answers: answersBy(
            answer('q1', '2026-11-02', true),
            answer('q2', '2026-11-03', true),
            answer('q3', '2026-11-03', false),
            answer('q4', '2026-11-04', true, 'interview'),
          ),
          studySeconds: { '2026-11-02': 5400, '2026-11-03': 0 },
          completedPractice: ['html-day-01'],
          draftClock: { 'html-day-01': noonUtc('2026-11-05') },
        }),
      ],
      registeredOn: '2026-11-02',
      today: '2026-11-15',
    });

  it('reports score, answers, interview answers and mistakes for the week', () => {
    const week = sample().weeks[0];
    expect(week).toMatchObject({
      number: 1,
      answers: 4,
      correct: 3,
      score: 75,
      interviewAnswers: 1,
      interviewCorrect: 1,
      mistakes: 1,
      practiceDone: 1,
    });
  });

  it('counts active days from answers, study time and dated practice without duplicates', () => {
    const week = sample().weeks[0];
    expect(week.activeDays).toBe(4);
    expect(week.seconds).toBe(5400);
  });

  it('lists what was studied with mistakes and practice per topic', () => {
    const week = sample().weeks[0];
    expect(week.items).toEqual([
      {
        sourceId: 'html',
        itemId: 'html-day-01',
        answers: 4,
        mistakes: 1,
        practice: 1,
      },
    ]);
  });

  it('leaves the score empty when nothing was answered that week', () => {
    const report = buildProgressReport({
      sources: [source({ studySeconds: { '2026-11-02': 600 } })],
      registeredOn: '2026-11-02',
      today: '2026-11-09',
    });
    expect(report.weeks[0]).toMatchObject({ answers: 0, score: null, seconds: 600 });
  });

  it('dates practice by its draft save time in the local (Dushanbe) day', () => {
    // 2026-11-15 20:00 UTC is already 2026-11-16 in Dushanbe (UTC+5).
    const report = buildProgressReport({
      sources: [
        source({
          completedPractice: ['html-day-02'],
          draftClock: { 'html-day-02': Date.parse('2026-11-15T20:00:00Z') },
        }),
      ],
      registeredOn: '2026-11-09',
      today: '2026-11-16',
    });
    // Registered on 11-09, so week 2 starts on 11-16 (Dushanbe), not on the UTC date 11-15.
    expect(report.weeks[1]).toMatchObject({ start: '2026-11-16', practiceDone: 1 });
    expect(report.weeks[0].practiceDone).toBe(0);
  });

  it('counts undated practice in totals only', () => {
    const report = buildProgressReport({
      sources: [source({ completedPractice: ['html-day-01'] })],
      registeredOn: '2026-11-02',
      today: '2026-11-15',
    });
    expect(report.totals.practiceDone).toBe(1);
    expect(report.weeks.every((week) => week.practiceDone === 0)).toBe(true);
  });

  it('shows what is left in each course that had activity that week', () => {
    const report = buildProgressReport({
      sources: [
        source({ id: 'css', total: 10, confirmedDays: [1, 2], studySeconds: { '2026-11-02': 60 } }),
        source({ id: 'git', total: 9, confirmedDays: [1], studySeconds: { '2026-11-09': 60 } }),
      ],
      registeredOn: '2026-11-02',
      today: '2026-11-09',
    });
    expect(report.weeks[0].left).toEqual([
      { sourceId: 'css', total: 10, daysDone: 2, daysLeft: 8 },
    ]);
    expect(report.weeks[1].left).toEqual([{ sourceId: 'git', total: 9, daysDone: 1, daysLeft: 8 }]);
  });
});

describe('buildProgressReport: courses', () => {
  it('counts only valid, unique confirmed days and reports the next one', () => {
    const report = buildProgressReport({
      sources: [
        source({
          id: 'html',
          total: 30,
          confirmedDays: [1, 1, 2, 31, 0, 2.5],
          completedTopics: ['html-day-01'],
        }),
      ],
      registeredOn: null,
      today: '2026-11-15',
    });
    expect(report.courses[0]).toMatchObject({
      id: 'html',
      total: 30,
      daysDone: 2,
      percent: 7,
      nextDay: 3,
      lastActivity: null,
    });
  });

  it('reports no next day when every day is confirmed', () => {
    const report = buildProgressReport({
      sources: [source({ total: 3, confirmedDays: [1, 2, 3], completedTopics: ['x'] })],
      registeredOn: null,
      today: '2026-11-15',
    });
    expect(report.courses[0]).toMatchObject({ daysDone: 3, percent: 100, nextDay: null });
  });

  it('leaves out courses that were only opened or have only drafts', () => {
    const report = buildProgressReport({
      sources: [
        source({ id: 'css', draftClock: { 'selected-day-v3': noonUtc('2026-11-10') } }),
        source({ id: 'git', completedTopics: ['git-day-01'] }),
      ],
      registeredOn: null,
      today: '2026-11-15',
    });
    expect(report.courses.map((course) => course.id)).toEqual(['git']);
  });

  it('sorts started courses by the most recent activity', () => {
    const report = buildProgressReport({
      sources: [
        source({
          id: 'css',
          answers: answersBy(answer('q1', '2026-11-10', true, 'test', 'css-day-01')),
        }),
        source({
          id: 'git',
          answers: answersBy(answer('q2', '2026-11-12', false, 'test', 'git-day-01')),
        }),
      ],
      registeredOn: '2026-11-01',
      today: '2026-11-15',
    });
    expect(report.courses.map((course) => [course.id, course.lastActivity])).toEqual([
      ['git', '2026-11-12'],
      ['css', '2026-11-10'],
    ]);
    expect(report.courses[0]).toMatchObject({ answers: 1, correct: 0 });
  });

  it('adds study time per course and reports the total', () => {
    const report = buildProgressReport({
      sources: [
        source({ id: 'css', studySeconds: { '2026-11-10': 1200, '2026-11-11': 300 } }),
        source({ id: 'git', completedTopics: ['x'], studySeconds: { '2026-11-12': 60 } }),
      ],
      registeredOn: '2026-11-10',
      today: '2026-11-15',
    });
    expect(report.totals.seconds).toBe(1560);
    expect(report.courses.find((course) => course.id === 'css')?.seconds).toBe(1500);
  });
});

describe('buildProgressReport: totals and streak', () => {
  it('counts a streak that ends today', () => {
    const report = buildProgressReport({
      sources: [
        source({
          answers: answersBy(
            answer('q1', '2026-11-13', true),
            answer('q2', '2026-11-14', true),
            answer('q3', '2026-11-15', true),
          ),
        }),
      ],
      registeredOn: '2026-11-13',
      today: '2026-11-15',
    });
    expect(report.totals.streak).toBe(3);
    expect(report.totals.activeDays).toBe(3);
  });

  it('keeps yesterday streak alive until today has activity', () => {
    const report = buildProgressReport({
      sources: [
        source({
          answers: answersBy(answer('q1', '2026-11-13', true), answer('q2', '2026-11-14', true)),
        }),
      ],
      registeredOn: '2026-11-13',
      today: '2026-11-15',
    });
    expect(report.totals.streak).toBe(2);
  });

  it('resets the streak after a gap', () => {
    const report = buildProgressReport({
      sources: [source({ answers: answersBy(answer('q1', '2026-11-10', true)) })],
      registeredOn: '2026-11-10',
      today: '2026-11-15',
    });
    expect(report.totals.streak).toBe(0);
  });

  it('ignores answers dated after today', () => {
    const report = buildProgressReport({
      sources: [source({ answers: answersBy(answer('q1', '2026-11-20', true)) })],
      registeredOn: '2026-11-10',
      today: '2026-11-15',
    });
    expect(report.totals.answers).toBe(0);
    expect(report.weeks.every((week) => week.answers === 0)).toBe(true);
  });

  it('totals answers and correct across every source', () => {
    const report = buildProgressReport({
      sources: [
        source({ id: 'css', answers: answersBy(answer('q1', '2026-11-10', true)) }),
        source({
          id: 'react',
          answers: answersBy(answer('q2', '2026-11-11', false, 'learn', 'topic-1')),
        }),
      ],
      registeredOn: '2026-11-10',
      today: '2026-11-15',
    });
    expect(report.totals).toMatchObject({ answers: 2, correct: 1 });
  });
});

describe('practiceTopicId and date helpers', () => {
  it('maps React exercise ids to their topic and keeps course ids unchanged', () => {
    expect(practiceTopicId('react', 'topic-3-exercise-2')).toBe('topic-3');
    expect(practiceTopicId('react', 'local-project-4')).toBe('local-practice');
    expect(practiceTopicId('html', 'html-day-01')).toBe('html-day-01');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-11-28', 5)).toBe('2026-12-03');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('accepts only real calendar day keys', () => {
    expect(isDayKey('2026-11-15')).toBe(true);
    expect(isDayKey('2026-02-30')).toBe(false);
    expect(isDayKey('15.11.2026')).toBe(false);
    expect(isDayKey(undefined)).toBe(false);
  });
});

describe('store adapters for the report', () => {
  it('maps React month:day confirmations to day numbers 1..60', () => {
    expect(reactDayNumber('1:1')).toBe(1);
    expect(reactDayNumber('1:30')).toBe(30);
    expect(reactDayNumber('2:1')).toBe(31);
    expect(reactDayNumber('2:30')).toBe(60);
    expect(reactDayNumber('3:1')).toBeNull();
    expect(reactDayNumber('1:31')).toBeNull();
    expect(reactDayNumber('garbage')).toBeNull();
  });

  it('leaves React its own study time, without the seconds spent in courses', () => {
    const state = {
      ...emptyProgress(),
      studySeconds: { '2026-11-10': 1000 },
      courses: {
        html: { ...emptyCourseProgress(), studySeconds: { '2026-11-10': 400 } },
      },
    };
    expect(reactStudySeconds(state)).toEqual({ '2026-11-10': 600 });
  });

  it('builds React and course sources from the store snapshot', () => {
    const state = {
      ...emptyProgress(),
      confirmedDays: ['1:1', '2:3'],
      completedTopics: ['topic-1'],
      courses: {
        html: { ...emptyCourseProgress(), confirmedDays: ['1', '2'] },
      },
    };
    const [react, html] = buildReportSources(state);
    expect(react).toMatchObject({
      id: 'react',
      total: 60,
      confirmedDays: [1, 33],
      completedTopics: ['topic-1'],
    });
    expect(html).toMatchObject({ id: 'html', total: 30, confirmedDays: [1, 2] });
  });
});
