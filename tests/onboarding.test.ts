import { describe, expect, it } from 'vitest';
import { ONBOARDING_QUESTIONS, buildPlan, courseRoute, recommendCourse } from '@/lib/onboarding';
import { COURSE_CATALOG } from '@/content/courses/catalog';

describe('onboarding', () => {
  it('asks exactly 15 questions with unique ids and complete TG/RU/EN copy', () => {
    expect(ONBOARDING_QUESTIONS).toHaveLength(15);
    expect(new Set(ONBOARDING_QUESTIONS.map(question => question.id)).size).toBe(15);
    for (const question of ONBOARDING_QUESTIONS) {
      for (const text of [question.question, ...question.options.map(option => option.label)]) {
        expect(text.tg.trim() && text.ru.trim() && text.en.trim()).toBeTruthy();
      }
      expect(question.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('starts a complete beginner at HTML + CSS', () => {
    expect(recommendCourse({ direction: 'frontend', html: 'none', javascript: 'none' }).id).toBe('html');
    expect(recommendCourse({ direction: 'unknown' }).id).toBe('html');
  });

  it('moves along the frontend route by known skills', () => {
    expect(recommendCourse({ direction: 'frontend', html: 'basic', javascript: 'none' }).id).toBe('javascript-1');
    expect(recommendCourse({ direction: 'frontend', html: 'good', javascript: 'basic' }).id).toBe('javascript-2');
    expect(recommendCourse({ direction: 'frontend', javascript: 'good', react: 'none' }).id).toBe('react');
    expect(recommendCourse({ direction: 'frontend', javascript: 'good', react: 'good' }).id).toBe('nextjs');
  });

  it('routes other directions to existing catalog courses', () => {
    const ids = new Set(COURSE_CATALOG.map(course => course.id));
    for (const direction of ['backend', 'mobile', 'data', 'design', 'business']) {
      for (const javascript of ['none', 'good']) {
        expect(ids.has(recommendCourse({ direction, javascript, react: javascript, coded: 'never' }).id)).toBe(true);
      }
    }
  });

  it('builds a daily split that adds up and an honest pace', () => {
    const plan = buildPlan({ direction: 'frontend', minutes: '45', days: '5', deadline: '1' });
    expect(plan.split.theory + plan.split.practice + plan.split.review).toBe(45);
    expect(plan.split.practice).toBeGreaterThan(plan.split.theory);
    // HTML: 30 course days × 60 min / (45 × 5) weekly minutes = 8 weeks, longer than one month.
    expect(plan.weeks).toBe(8);
    expect(plan.tight).toBe(true);
    expect(buildPlan({ minutes: '180', days: '7', deadline: '0' }).tight).toBe(false);
  });

  it('flags phone-only learners and weekly interviews', () => {
    const plan = buildPlan({ device: 'phone', interview: 'yes' });
    expect(plan.phoneOnly).toBe(true);
    expect(plan.interviewWeekly).toBe(true);
    expect(courseRoute('react')).toBe('/courses/react');
    expect(courseRoute('html')).toBe('/courses/html/plan');
  });
});

describe('day 0', () => {
  it('sends complete beginners to Day 0', () => {
    expect(buildPlan({ coded: 'never' }).beginner).toBe(true);
    expect(buildPlan({ coded: 'yes', computer: 'good' }).beginner).toBe(false);
  });
});
