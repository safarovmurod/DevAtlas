'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { COPY } from '@/lib/i18n';
import { useLearningStore } from '@/stores/learning-store';
import { LoadingState } from './loading-state';
import { PracticeHub } from './practice-hub';

/**
 * "/practice" always belongs to the selected course. Every course except React keeps its
 * practice on the day page, so this sends the learner there. React keeps its practice lab.
 * A learner who has not chosen a course yet goes to the catalog.
 */
export function PracticeEntry() {
  const router = useRouter();
  const ready = useLearningStore((state) => state.ready);
  const course = useLearningStore((state) => state.selectedCourse);
  const chosen = useLearningStore((state) => state.courseChosen);
  const language = useLearningStore((state) => state.language);
  const target = !chosen
    ? '/courses'
    : course === 'react'
      ? null
      : `/courses/${course}/home#day-practice`;

  // Progress loads after the first render, so wait for it before reading the selected course.
  useEffect(() => {
    if (ready && target) router.replace(target);
  }, [ready, target, router]);

  if (ready && !target) return <PracticeHub />;
  return <LoadingState label={COPY[language].loading} />;
}
