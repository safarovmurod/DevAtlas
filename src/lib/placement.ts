import type { CourseId } from '@/lib/courses/ids';
import { OTHER_PLACEMENT_QUESTIONS } from './placement-questions-other';
import { TECH_PLACEMENT_QUESTIONS } from './placement-questions-tech';
import {
  t,
  type PlacementDirection,
  type PlacementLevel,
  type PlacementQuestion,
  type Text,
} from './placement-types';

export type {
  PlacementDirection,
  PlacementLevel,
  PlacementQuestion,
  PlacementTier,
} from './placement-types';

export const DONT_KNOW = t('Намедонам', 'Не знаю', "I don't know");

/** Six questions per direction: two per tier. Answers are spread across positions on purpose. */
export const PLACEMENT_BANK: Record<PlacementDirection, PlacementQuestion[]> = {
  ...TECH_PLACEMENT_QUESTIONS,
  ...OTHER_PLACEMENT_QUESTIONS,
};

/** Course for each number of fully passed tiers (0–3), per direction. */
const LADDER: Record<PlacementDirection, [CourseId, CourseId, CourseId, CourseId]> = {
  frontend: ['html', 'javascript-1', 'react', 'javascript-pro'],
  backend: ['backend', 'backend', 'nodejs', 'backend-pro'],
  mobile: ['html', 'react', 'mobile', 'mobile'],
  data: ['data-analytics', 'python', 'sql', 'algorithms'],
  design: ['ux-design', 'ux-design', 'ux-pro', 'ux-pro'],
  business: ['business-foundations', 'business-foundations', 'digital-marketing', 'business-pro'],
};

export function placementDirection(direction: string | undefined): PlacementDirection {
  return direction === 'backend' ||
    direction === 'mobile' ||
    direction === 'data' ||
    direction === 'design' ||
    direction === 'business'
    ? direction
    : 'frontend';
}

export interface PlacementResult {
  direction: PlacementDirection;
  /** Correct answers out of the six questions. */
  correct: number;
  /** Tiers passed in a row from the bottom: a tier counts only when both of its questions are right. */
  passedTiers: 0 | 1 | 2 | 3;
  level: PlacementLevel;
  courseId: CourseId;
}

/** answers[questionId] = chosen option index; 3 (or anything else) means «I don't know». */
export function scorePlacement(
  direction: PlacementDirection,
  answers: Record<string, number>,
): PlacementResult {
  const bank = PLACEMENT_BANK[direction];
  const right = (q: PlacementQuestion) => answers[q.id] === q.correctIndex;
  let passedTiers: 0 | 1 | 2 | 3 = 0;
  for (const tier of [1, 2, 3] as const) {
    if (bank.filter((q) => q.tier === tier).every(right)) passedTiers = tier;
    else break;
  }
  const level: PlacementLevel =
    passedTiers === 0 ? 'beginner' : passedTiers === 3 ? 'advanced' : 'middle';
  return {
    direction,
    correct: bank.filter(right).length,
    passedTiers,
    level,
    courseId: LADDER[direction][passedTiers],
  };
}

export const LEVEL_LABEL: Record<PlacementLevel, Text> = {
  beginner: t('Навомӯз', 'Новичок', 'Beginner'),
  middle: t('Миёна', 'Средний', 'Intermediate'),
  advanced: t('Баланд', 'Высокий', 'Advanced'),
};
