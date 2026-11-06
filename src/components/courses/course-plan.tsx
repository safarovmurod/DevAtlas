'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import type { CourseProgress } from '@/lib/account/progress';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import type { CourseDayItem } from '@/lib/courses/plan';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { PROGRESSION_COPY } from '@/lib/progression-copy';
import { useLearningStore } from '@/stores/learning-store';
import { MASTERY_LABELS } from './course-workspace-copy';

/** Days from 15 onwards are marked as the harder half of a course. */
const HARDER_FROM_DAY = 15;

/** Course overview: overall progress and one card per day. */
export function CoursePlan({
  courseId,
  days,
  selectedDay,
  progress,
}: {
  courseId: ImportedCourseId;
  days: CourseDayItem[];
  selectedDay: number;
  progress: CourseProgress;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const ui = LEARNING_UI_COPY[language];
  const gate = PROGRESSION_COPY[language];
  const text = (value: CourseLesson['title']) => courseText(value, contentLanguage);

  const isMastered = (questionId: string) => progress.masteredQuestions.includes(questionId);
  const doneDays = days.filter((entry) => entry.status === 'done').length;
  const totalQuestions = days.reduce((sum, entry) => sum + entry.lesson.questions.length, 0);
  const masteredQuestions = days.reduce(
    (sum, entry) => sum + entry.lesson.questions.filter((q) => isMastered(q.id)).length,
    0,
  );
  const percentDone = (doneDays / Math.max(1, days.length)) * 100;

  return (
    <>
      <div className="panel learning-overview">
        <BookOpen size={22} />
        <div>
          <h2>{ui.firstFile}</h2>
          <p>
            {doneDays} / {days.length} {ui.completedDays} · {MASTERY_LABELS.quiz[language]}{' '}
            {masteredQuestions} / {totalQuestions}
          </p>
          <div className="progress-track">
            <span style={{ width: `${percentDone}%` }} />
          </div>
        </div>
      </div>

      <div className="day-card-grid">
        {days.map((entry) => {
          if (entry.status === 'upcoming') {
            return (
              <article
                key={entry.day}
                className="panel day-card is-locked"
                aria-label={`${gate.day} ${entry.day}: ${gate.locked}`}
              >
                <span className="eyebrow">
                  {gate.day} {entry.day}
                </span>
                <h2>{text(entry.lesson.title)}</h2>
                <p>{gate.locked}</p>
              </article>
            );
          }

          const questions = entry.lesson.questions;
          const allMastered = questions.length > 0 && questions.every((q) => isMastered(q.id));
          const className =
            'panel day-card ' +
            (selectedDay === entry.day ? 'is-current' : '') +
            (entry.status === 'done' ? ' is-done' : '') +
            (entry.status === 'current' ? ' is-next' : '');

          return (
            <Link
              prefetch={false}
              key={entry.day}
              href={courseSectionHref(courseId, 'home', entry.day)}
              className={className}
              aria-current={selectedDay === entry.day ? 'step' : undefined}
            >
              <div className="between">
                <span className="eyebrow">
                  {ui.day} {entry.day}
                </span>
                {entry.status === 'done' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <span className="badge">
                    {entry.status === 'current'
                      ? ui.current
                      : entry.day < HARDER_FROM_DAY
                        ? ui.basics
                        : ui.harder}
                  </span>
                )}
                {allMastered && (
                  <span className="badge mastery-badge">{MASTERY_LABELS.done[language]}</span>
                )}
              </div>
              <h2>{text(entry.lesson.title)}</h2>
              <p>{text(entry.lesson.summary)}</p>
              <span className="text-link">
                {ui.openDay} <ArrowRight size={15} />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
