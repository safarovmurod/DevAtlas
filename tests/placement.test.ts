import { describe, expect, it } from 'vitest';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { buildPlan } from '@/lib/onboarding';
import { PLACEMENT_BANK, placementDirection, scorePlacement, type PlacementDirection } from '@/lib/placement';

const DIRECTIONS = Object.keys(PLACEMENT_BANK) as PlacementDirection[];
const allRight = (direction: PlacementDirection): Record<string, number> => Object.fromEntries(PLACEMENT_BANK[direction].map(q => [q.id, q.correctIndex]));
const rightUpTo = (direction: PlacementDirection, tier: number): Record<string, number> => Object.fromEntries(PLACEMENT_BANK[direction].map(q => [q.id, q.tier <= tier ? q.correctIndex : 3]));

describe('placement test bank', () => {
  it('has six questions per direction, two per tier, with complete TG/RU/EN text', () => {
    const ids = new Set<string>();
    for (const direction of DIRECTIONS) {
      const bank = PLACEMENT_BANK[direction];
      expect(bank).toHaveLength(6);
      for (const tier of [1, 2, 3]) expect(bank.filter(q => q.tier === tier), `${direction} tier ${tier}`).toHaveLength(2);
      for (const q of bank) {
        ids.add(q.id);
        for (const text of [q.question, ...q.options]) expect(text.tg.trim() && text.ru.trim() && text.en.trim(), q.id).toBeTruthy();
        expect(new Set(q.options.map(option => option.ru)).size, q.id).toBe(3);
      }
    }
    expect(ids.size).toBe(DIRECTIONS.length * 6);
  });

  it('is not guessable by position: no answer slot holds more than 45% of correct answers', () => {
    const all = DIRECTIONS.flatMap(direction => PLACEMENT_BANK[direction]);
    for (const slot of [0, 1, 2]) expect(all.filter(q => q.correctIndex === slot).length / all.length).toBeLessThanOrEqual(0.45);
  });

  it('maps every result to a course that exists in the catalog', () => {
    const ids = new Set(COURSE_CATALOG.map(course => course.id));
    for (const direction of DIRECTIONS) for (const tier of [0, 1, 2, 3]) {
      expect(ids.has(scorePlacement(direction, rightUpTo(direction, tier)).courseId), `${direction} ${tier}`).toBe(true);
    }
  });
});

describe('placement scoring', () => {
  it('places "I don\'t know" everywhere as a beginner at the start of the track', () => {
    const result = scorePlacement('frontend', {});
    expect(result).toMatchObject({ correct: 0, passedTiers: 0, level: 'beginner', courseId: 'html' });
  });

  it('climbs the frontend ladder tier by tier', () => {
    expect(scorePlacement('frontend', rightUpTo('frontend', 1))).toMatchObject({ passedTiers: 1, level: 'middle', courseId: 'javascript-1' });
    expect(scorePlacement('frontend', rightUpTo('frontend', 2))).toMatchObject({ passedTiers: 2, level: 'middle', courseId: 'react' });
    expect(scorePlacement('frontend', allRight('frontend'))).toMatchObject({ correct: 6, passedTiers: 3, level: 'advanced', courseId: 'javascript-pro' });
  });

  it('counts a tier only when both of its questions are right and lower tiers passed', () => {
    const answers = allRight('backend');
    answers['be-1b'] = 3;   // missed one basic question
    expect(scorePlacement('backend', answers)).toMatchObject({ correct: 5, passedTiers: 0, level: 'beginner', courseId: 'backend' });
  });

  it('sends advanced people in other directions to their advanced courses', () => {
    expect(scorePlacement('backend', allRight('backend')).courseId).toBe('backend-pro');
    expect(scorePlacement('design', allRight('design')).courseId).toBe('ux-pro');
    expect(scorePlacement('business', allRight('business')).courseId).toBe('business-pro');
  });

  it('treats unknown directions as frontend', () => {
    expect(placementDirection('unknown')).toBe('frontend');
    expect(placementDirection(undefined)).toBe('frontend');
    expect(placementDirection('data')).toBe('data');
  });
});

describe('plan with a placement result', () => {
  const answers = { direction: 'frontend', coded: 'yes', javascript: 'good', react: 'good', minutes: '45', days: '5' };

  it('uses the tested course and level and flags an over-confident self-estimate', () => {
    const plan = buildPlan(answers, scorePlacement('frontend', rightUpTo('frontend', 1)));
    expect(plan).toMatchObject({ courseId: 'javascript-1', level: 'middle', levelSource: 'test', score: { correct: 2, total: 6 }, selfMismatch: 'lower' });
  });

  it('flags a person who knows more than they thought', () => {
    const plan = buildPlan({ direction: 'frontend', coded: 'little', html: 'none', minutes: '45', days: '5' }, scorePlacement('frontend', allRight('frontend')));
    expect(plan).toMatchObject({ level: 'advanced', selfMismatch: 'higher', courseId: 'javascript-pro' });
  });

  it('falls back to the self-estimate when the test is skipped', () => {
    const plan = buildPlan(answers);
    expect(plan).toMatchObject({ courseId: 'nextjs', level: 'advanced', levelSource: 'self', selfMismatch: null });
    expect(plan.score).toBeUndefined();
    expect(buildPlan({ direction: 'frontend', coded: 'never' })).toMatchObject({ level: 'beginner', beginner: true });
  });
});
