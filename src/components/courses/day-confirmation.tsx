'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { CourseProgress } from '@/lib/account/progress';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import type { CoursePlanDay } from '@/lib/courses/plan';
import type { CourseLesson } from '@/lib/courses/schema';
import { PROGRESSION_COPY } from '@/lib/progression-copy';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import { useLearningStore } from '@/stores/learning-store';
import { MASTERY_LABELS, SERVER_CONFIRMATION_FAILED } from './course-workspace-copy';

/**
 * Only HTML day 1 has protected server evidence today. For it, a signed-in
 * learner's completion is also recorded on the server. Other days, guests and
 * an unconfigured server are confirmed locally only.
 */
async function recordServerConfirmation(courseId: ImportedCourseId, day: number) {
  if (courseId !== 'html' || day !== 1) return;
  const client = getSupabaseBrowserClient();
  if (!client) return;

  const { data, error } = await getSessionWithTimeout(client);
  if (error) throw error;
  if (!data.session) return;

  const response = await fetch('/api/practice/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify({ courseId: 'html', day: 1 }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error('Server confirmation failed');
}

/** End of a lesson day: quiz result and the button that opens the next day. */
export function DayConfirmation({
  courseId,
  day,
  plan,
  lesson,
  progress,
  isDone,
  canConfirm,
}: {
  courseId: ImportedCourseId;
  day: number;
  plan: CoursePlanDay[];
  lesson: CourseLesson;
  progress: CourseProgress;
  isDone: boolean;
  canConfirm: boolean;
}) {
  const language = useLearningStore((state) => state.language);
  const confirmCourseDay = useLearningStore((state) => state.confirmCourseDay);
  const gate = PROGRESSION_COPY[language];
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const total = lesson.questions.length;
  const passed = lesson.questions.filter((question) =>
    progress.masteredQuestions.includes(question.id),
  ).length;
  const hasNextDay = plan.some((item) => item.day === day + 1);

  async function confirmDay() {
    // The store name belongs to the signed-in account. If the learner switches
    // account while we wait, the result must not be saved into the new one.
    const studyScope = useLearningStore.persist.getOptions().name;
    const sameAccount = () => useLearningStore.persist.getOptions().name === studyScope;

    setError('');
    setConfirming(true);
    try {
      // Study can continue even when the server is down; verified mastery is
      // simply not granted in that case.
      await recordServerConfirmation(courseId, day);
    } catch {
      if (sameAccount()) setError(SERVER_CONFIRMATION_FAILED[language]);
    } finally {
      if (sameAccount()) confirmCourseDay(courseId, day, plan);
      setConfirming(false);
    }
  }

  return (
    <section className="day-confirmation" aria-label={gate.confirm}>
      <p role="status">{isDone ? gate.confirmed : canConfirm ? gate.ready : gate.missing}</p>

      {total > 0 && (
        <p className="mastery-status" role="status">
          {passed === total
            ? MASTERY_LABELS.done[language]
            : `${MASTERY_LABELS.quiz[language]} ${passed}/${total}`}{' '}
          —{' '}
          <Link className="text-link" href={courseSectionHref(courseId, 'tests', day)}>
            {MASTERY_LABELS.retry[language]}
          </Link>
        </p>
      )}

      <div className="button-row">
        <button
          className="button primary"
          disabled={confirming || isDone || !canConfirm}
          onClick={confirmDay}
        >
          {isDone ? gate.confirmed : gate.confirm}
        </button>
        {isDone && hasNextDay && (
          <Link
            className="button subtle"
            href={courseSectionHref(courseId, 'home', day + 1)}
            transitionTypes={['nav-forward']}
          >
            {gate.next} {day + 1}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {error && <p role="alert">{error}</p>}
    </section>
  );
}
