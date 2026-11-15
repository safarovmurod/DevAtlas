import { coursePublishedDays } from '@/content/courses/catalog';
import type { Progress } from '@/lib/account/progress';
import { isCourseId } from '@/lib/courses/ids';
import type { ProgressSource } from '@/lib/progress/weekly-report';

const REACT_MONTHS = [1, 2];
const REACT_DAYS_PER_MONTH = 30;

/** React confirms days as "month:day"; the report numbers them 1..60 across both months. */
export function reactDayNumber(id: string): number | null {
  const [month, day] = id.split(':').map(Number);
  if (!REACT_MONTHS.includes(month)) return null;
  if (!Number.isInteger(day) || day < 1 || day > REACT_DAYS_PER_MONTH) return null;
  return (month - 1) * REACT_DAYS_PER_MONTH + day;
}

/**
 * Study time of React alone. The top-level total counts every course too,
 * because a course adds its seconds to both places; subtracting them leaves React.
 */
export function reactStudySeconds(state: Progress): Record<string, number> {
  const seconds: Record<string, number> = { ...state.studySeconds };
  for (const course of Object.values(state.courses)) {
    if (!course) continue;
    for (const [day, value] of Object.entries(course.studySeconds)) {
      seconds[day] = Math.max(0, (seconds[day] ?? 0) - value);
    }
  }
  return seconds;
}

/** Every course the learner has data for, React included, in the shape the report reads. */
export function buildReportSources(state: Progress): ProgressSource[] {
  const react: ProgressSource = {
    id: 'react',
    total: coursePublishedDays('react'),
    confirmedDays: state.confirmedDays
      .map(reactDayNumber)
      .filter((day): day is number => day !== null),
    completedTopics: state.completedTopics,
    completedPractice: state.completedPractice,
    answers: state.answers,
    studySeconds: reactStudySeconds(state),
    draftClock: state.draftClock,
  };
  const courses = Object.entries(state.courses).flatMap(([id, progress]) => {
    if (!progress || !isCourseId(id) || id === 'react') return [];
    const source: ProgressSource = {
      id,
      total: coursePublishedDays(id),
      confirmedDays: progress.confirmedDays.map(Number).filter(Number.isInteger),
      completedTopics: progress.completedTopics,
      completedPractice: progress.completedPractice,
      answers: progress.answers,
      studySeconds: progress.studySeconds,
      draftClock: progress.draftClock,
    };
    return [source];
  });
  return [react, ...courses];
}
