'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import type { CoursePlanDay } from '@/lib/courses/plan';
import { PROGRESSION_COPY } from '@/lib/progression-copy';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import { useLearningStore } from '@/stores/learning-store';
import { SERVER_CONFIRMATION_FAILED } from './course-workspace-copy';
import { useDayCopy } from './lesson-flow-copy';

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

/**
 * End of the day: one status line, one confirm button, and the next day.
 * Days are never locked. Confirming only records progress.
 */
export function DayFinish({
  courseId,
  day,
  plan,
  isDone,
  ready,
  practiceRequired = true,
}: {
  courseId: ImportedCourseId;
  day: number;
  plan: CoursePlanDay[];
  isDone: boolean;
  /** Lesson is marked as learned and practice is done. */
  ready: boolean;
  /** False when the plan locks practice: the day is then confirmed locally without it. */
  practiceRequired?: boolean;
}) {
  const language = useLearningStore((state) => state.language);
  const confirmCourseDay = useLearningStore((state) => state.confirmCourseDay);
  const gate = PROGRESSION_COPY[language];
  const t = useDayCopy();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
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
      // Server evidence needs verified practice, which a locked plan cannot have.
      if (practiceRequired) await recordServerConfirmation(courseId, day);
    } catch {
      if (sameAccount()) setError(SERVER_CONFIRMATION_FAILED[language]);
    } finally {
      if (sameAccount()) confirmCourseDay(courseId, day, plan, practiceRequired);
      setConfirming(false);
    }
  }

  return (
    <section
      aria-label={gate.confirm}
      className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"
    >
      <p
        role="status"
        className="flex items-center gap-2 text-sm font-medium text-foreground sm:text-[15px]"
      >
        {isDone && <CheckCircle2 size={18} aria-hidden="true" className="shrink-0 text-success" />}
        {isDone ? gate.confirmed : ready ? t('ready') : gate.missing}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          className="button primary"
          disabled={confirming || isDone || !ready}
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
      {error && (
        <p role="alert" className="text-sm text-muted-foreground sm:basis-full">
          {error}
        </p>
      )}
    </section>
  );
}
