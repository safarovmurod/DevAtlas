'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { REVIEW_COPY, ReviewSummary, reviewTotals } from '@/components/learning/review-summary';
import type { CourseProgress } from '@/lib/account/progress';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { courseMonthPlan } from '@/lib/courses/plan';
import { courseText, type CourseDelivery } from '@/lib/courses/schema';
import { dateKey } from '@/lib/learning';
import { reviewPlan } from '@/lib/progress/review-plan';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { useLearningStore } from '@/stores/learning-store';
import { CourseQuestion } from './course-question';
import { courseDisplayName } from '@/lib/catalog-copy';

/**
 * One review page: questions with a mistake and questions that are due again today.
 * (Revision and weak topics used to be two pages doing almost the same job.)
 */
export function CourseReview({
  courseId,
  content,
  progress,
  currentDay,
}: {
  courseId: ImportedCourseId;
  content: CourseDelivery;
  progress: CourseProgress;
  currentDay: number;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const ui = LEARNING_UI_COPY[language];

  const days = courseMonthPlan(content.lessons);
  const lessons = days.map(({ day, lesson }) => ({
    id: lesson.id,
    title: courseText(lesson.title, contentLanguage),
    questionIds: [
      ...lesson.questions.map((question) => question.id),
      ...(lesson.interview ? [lesson.interview.id] : []),
    ],
    lessonHref: courseSectionHref(courseId, 'home', day),
    quizHref: courseSectionHref(courseId, 'tests', day),
  }));

  // The queue is fixed once it has questions, so an answered question does not
  // disappear from the list while the learner is still reading the feedback.
  const live = reviewPlan(lessons, progress, dateKey());
  const [plan, setPlan] = useState(live);
  const hasQuestions = (items: typeof live) => items.some((lesson) => lesson.reviewIds.length > 0);
  if (!hasQuestions(plan) && hasQuestions(live)) setPlan(live);
  const selected = plan.filter((lesson) => lesson.reviewIds.length > 0);
  const totals = reviewTotals(selected);

  return (
    <section className="grid gap-5" aria-label={REVIEW_COPY.title[language]}>
      <ReviewSummary {...totals} />

      {!selected.length && (
        <div className="grid justify-items-start gap-3 rounded-2xl border border-border bg-card p-5">
          <p>{REVIEW_COPY.empty[language]}</p>
          <Link className="button primary" href={courseSectionHref(courseId, 'home', currentDay)}>
            {REVIEW_COPY.openDay[language]}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}

      {selected.map((item) => {
        const lesson = content.lessons.find((candidate) => candidate.id === item.id);
        if (!lesson) return null;
        const queue = new Set(item.reviewIds);
        const questions = lesson.questions.filter((question) => queue.has(question.id));
        const day = days.find((entry) => entry.lesson.id === lesson.id)?.day;
        return (
          <article
            className="grid gap-4 rounded-2xl border border-border bg-card p-5"
            key={lesson.id}
          >
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {day !== undefined && (
                <span className="badge">
                  {ui.day} {day}
                </span>
              )}
              <h2 className="min-w-0 flex-1 text-lg font-semibold">
                {courseText(lesson.title, contentLanguage)}
              </h2>
              <Link className="text-link text-sm" href={item.lessonHref}>
                {REVIEW_COPY.theory[language]}
              </Link>
            </header>
            <p className="text-sm font-medium text-brand">
              {courseDisplayName(courseId, language)}
            </p>
            {lesson.practice && day !== undefined && (
              <Link
                className="text-link w-fit text-sm"
                href={courseSectionHref(courseId, 'practice', day)}
              >
                {LEARNING_UI_COPY[language].day} {day} ·{' '}
                {{ ru: 'Практика', en: 'Practice', tg: 'Машқ', es: 'Práctica' }[language]}
              </Link>
            )}
            {lesson.interview && queue.has(lesson.interview.id) && (
              <CourseQuestion
                courseId={courseId}
                lesson={lesson}
                question={lesson.interview}
                mode="interview"
              />
            )}
            {questions.map((question) => (
              <CourseQuestion
                key={question.id}
                courseId={courseId}
                lesson={lesson}
                question={question}
                mode="revision"
              />
            ))}
          </article>
        );
      })}
    </section>
  );
}
