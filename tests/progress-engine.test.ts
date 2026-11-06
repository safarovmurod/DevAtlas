import { describe, it, expect } from 'vitest';
import {
  calculateTopicMastery,
  calculateCourseProgress,
  calculateStreak,
  generateDailyPlan,
} from '@/lib/progress/progress-engine';
import { StudyEvent, TopicMastery } from '@/types';

describe('Progress Engine Formulas', () => {
  it('calculates topic mastery with normalized weights when all categories are present', () => {
    const events: StudyEvent[] = [
      {
        id: '1',
        workspaceId: 'ws1',
        userId: 'u1',
        topicId: 'usestate',
        eventType: 'practice_passed',
        score: 100,
        correct: true,
        durationSeconds: 60,
        idempotencyKey: 'k1',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        workspaceId: 'ws1',
        userId: 'u1',
        topicId: 'usestate',
        eventType: 'quiz_answered',
        score: 80,
        correct: true,
        durationSeconds: 30,
        idempotencyKey: 'k2',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        workspaceId: 'ws1',
        userId: 'u1',
        topicId: 'usestate',
        eventType: 'interview_answered',
        score: 70,
        correct: true,
        durationSeconds: 45,
        idempotencyKey: 'k3',
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        workspaceId: 'ws1',
        userId: 'u1',
        topicId: 'usestate',
        eventType: 'revision_completed',
        score: 90,
        correct: true,
        durationSeconds: 20,
        idempotencyKey: 'k4',
        createdAt: new Date().toISOString(),
      },
    ];

    const mastery = calculateTopicMastery('usestate', events);

    // Expected: 100 * 0.40 + 80 * 0.25 + 70 * 0.20 + 90 * 0.15
    // = 40 + 20 + 14 + 13.5 = 87.5 -> Math.round = 88
    expect(mastery.masteryScore).toBe(88);
    expect(mastery.isWeak).toBe(false);
  });

  it('normalizes weights when only Practice and Quiz attempts exist', () => {
    const events: StudyEvent[] = [
      {
        id: '1',
        workspaceId: 'ws1',
        userId: 'u1',
        topicId: 'usestate',
        eventType: 'practice_passed',
        score: 100,
        correct: true,
        durationSeconds: 60,
        idempotencyKey: 'k1',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        workspaceId: 'ws1',
        userId: 'u1',
        topicId: 'usestate',
        eventType: 'quiz_answered',
        score: 80,
        correct: true,
        durationSeconds: 30,
        idempotencyKey: 'k2',
        createdAt: new Date().toISOString(),
      },
    ];

    const mastery = calculateTopicMastery('usestate', events);

    // Practice = 40%, Quiz = 25%. Total = 65%
    // 100 * (0.40 / 0.65) + 80 * (0.25 / 0.65) = 61.53 + 30.76 = 92.3 -> 92
    expect(mastery.masteryScore).toBe(92);
  });

  it('calculates course progress = Coverage * 0.60 + Mastery * 0.40', () => {
    const masteries: Record<string, TopicMastery> = {
      usestate: {
        topicId: 'usestate',
        masteryScore: 80,
        practiceScore: 80,
        quizScore: 80,
        interviewScore: 80,
        revisionScore: 80,
        attemptsCount: 2,
        isWeak: false,
        mistakesCount: 0,
      },
    };

    const completedIds = new Set<string>(['usestate']);
    const progress = calculateCourseProgress(masteries, completedIds);

    expect(progress.completedTopicsCount).toBe(1);
    expect(progress.masteryPct).toBe(80);
    expect(progress.totalProgressPct).toBeGreaterThanOrEqual(32);
  });

  it('calculates daily plan matching user available time', () => {
    const masteries: Record<string, TopicMastery> = {
      useeffect: {
        topicId: 'useeffect',
        masteryScore: 40,
        practiceScore: 40,
        quizScore: 40,
        interviewScore: 40,
        revisionScore: 40,
        attemptsCount: 3,
        isWeak: true,
        mistakesCount: 3,
      },
    };

    const plan = generateDailyPlan(60, masteries);

    expect(plan.dailyTimeMinutes).toBe(60);
    expect(plan.allocated.practice).toBe(24); // 40% of 60
    expect(plan.allocated.lesson).toBe(15);   // 25% of 60
    expect(plan.allocated.interview).toBe(12); // 20% of 60
    expect(plan.allocated.revision).toBe(9);   // 15% of 60
    expect(plan.recommendedTopicIds).toContain('useeffect');
  });

  it('calculates active streak correctly', () => {
    const streak = calculateStreak([], 12 * 60); // 12 minutes active today
    expect(streak.activeToday).toBe(true);
    expect(streak.minutesToday).toBe(12);
    expect(streak.currentStreak).toBe(1);
  });
});
