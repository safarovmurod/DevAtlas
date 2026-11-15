'use client';

import { useEffect, useState } from 'react';
import { courseAccessTier } from '@/lib/courses/access';
import { fetchCourseContent } from '@/lib/courses/fetch-course';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseMonthPlan } from '@/lib/courses/plan';
import { courseText } from '@/lib/courses/schema';

export type ContentLanguage = 'tg' | 'ru' | 'en';

/** One scheduled day of a course: its number, lesson id and title in the learner's content language. */
export interface PlanDay {
  day: number;
  id: string;
  title: string;
}

// Only successful loads stay cached, so a failed request is tried again later.
const cache = new Map<string, Promise<PlanDay[] | null>>();

function loadPlan(courseId: ImportedCourseId, language: ContentLanguage) {
  const key = `${courseId}:${language}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchCourseContent(courseId, courseAccessTier(courseId), new AbortController().signal)
      .then((result) => {
        if (!('content' in result)) return null;
        return courseMonthPlan(result.content.lessons).map((item) => ({
          day: item.day,
          id: item.lesson.id,
          title: courseText(item.lesson.title, language),
        }));
      })
      .catch(() => null)
      .then((plan) => {
        if (!plan) cache.delete(key);
        return plan;
      });
    cache.set(key, pending);
  }
  return pending;
}

/**
 * Lesson titles of the given courses. A course maps to undefined while loading,
 * to null when its content could not be loaded (for example a paid course without access).
 */
export function useCoursePlans(courseIds: readonly ImportedCourseId[], language: ContentLanguage) {
  const [plans, setPlans] = useState<Record<string, PlanDay[] | null | undefined>>({});
  // A string key keeps the effect from re-running on every new array with the same ids.
  const idList = courseIds.join(',');
  useEffect(() => {
    let active = true;
    for (const courseId of idList.split(',').filter(Boolean) as ImportedCourseId[]) {
      void loadPlan(courseId, language).then((plan) => {
        if (active) setPlans((current) => ({ ...current, [courseId]: plan }));
      });
    }
    return () => {
      active = false;
    };
  }, [idList, language]);
  return plans;
}
