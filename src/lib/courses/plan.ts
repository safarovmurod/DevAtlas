import type { CourseLesson } from './schema';
import {learningStatus,type LearningEvidence} from '@/lib/practice/learning-evidence';

export interface CoursePlanDay { day: number; lesson: CourseLesson; section: 'answers' | 'practice' | 'tests'; }

// Publish each actual lesson once. Never pad a short curriculum with generated review days.
// Explicitly scheduled curricula may retain unscheduled reference lessons in their library.
export function courseMonthPlan(lessons: CourseLesson[]): CoursePlanDay[] {
  if (!lessons.length) return [];
  const scheduled = lessons.filter(lesson => lesson.day !== undefined).sort((a,b) => a.day! - b.day!);
  if (scheduled.length) return scheduled.map(lesson => ({day:lesson.day!,lesson,section:'answers'}));
  return lessons.map((lesson,index)=>({day:index+1,lesson,section:'answers'}));
}

export type CourseDayStatus = 'done' | 'current' | 'upcoming';
export interface CourseDayItem {
  day: number;
  lesson: CourseLesson;
  section: 'answers' | 'practice' | 'tests';
  status: CourseDayStatus;
}

/** Legacy study readiness permits continuation; it never certifies mastery. */
export function courseDayReady(item: CoursePlanDay, completedTopics: readonly string[], completedPractice: readonly string[]): boolean {
  if (item.section === 'tests') return true;
  return (item.section === 'practice' || completedTopics.includes(item.lesson.id))
    && (!item.lesson.practice || completedPractice.includes(item.lesson.id));
}

export function courseDayReadiness(item:CoursePlanDay,completedTopics:readonly string[],completedPractice:readonly string[],evidence:LearningEvidence|undefined,currentVersion:number){
  const status=learningStatus(evidence,currentVersion);
  return {canContinue:courseDayReady(item,completedTopics,completedPractice),status,mastered:status==='Mastered'};
}

// День «answers» завершён, когда урок отмечен изученным; «practice» — когда сдана практика.
// День «tests» повторению не мешает: вопросы доступны в любой момент.
export function courseDayProgress(
  plan: ReturnType<typeof courseMonthPlan>,
  completedTopics: readonly string[],
  completedPractice: readonly string[],
  confirmedDays?: readonly string[],
): { days: CourseDayItem[]; current: CourseDayItem | null } {
  let current: CourseDayItem | null = null;
  let previousConfirmed = true;
  const days = plan.map(item => {
    if (confirmedDays !== undefined) {
      const done = previousConfirmed && confirmedDays.includes(String(item.day)) && courseDayReady(item, completedTopics, completedPractice);
      const status: CourseDayStatus = done ? 'done' : previousConfirmed ? 'current' : 'upcoming';
      const entry = { ...item, status };
      if (status === 'current') current = entry;
      previousConfirmed = done;
      return entry;
    }
    const done = courseDayReady(item, completedTopics, completedPractice);
    let status: CourseDayStatus = 'upcoming';
    if (done) status = 'done';
    else if (!current) { status = 'current'; current = { ...item, status }; }
    return { ...item, status };
  });
  return { days, current };
}
