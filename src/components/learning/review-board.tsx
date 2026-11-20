'use client';
import Link from 'next/link';
import type { CourseProgress } from '@/lib/account/progress';
import { LEARNING_TOPICS, QUIZ_QUESTIONS, topicTitle } from '@/content/course';
import { dateKey } from '@/lib/learning';
import { reviewPlan, type ReviewLesson } from '@/lib/progress/review-plan';
import { useLearningStore } from '@/stores/learning-store';
import { PageHeading } from './page-heading';
import { reactAssessmentPlan } from '@/lib/courses/react-assessment-day';
import { courseText } from '@/lib/courses/schema';
import { WrittenAnswer } from './written-answer';
import { REVIEW_COPY, ReviewSummary, reviewTotals } from './review-summary';
export { REVIEW_COPY, ReviewSummary, reviewTotals } from './review-summary';

/**
 * The single review list: lessons with a mistake or a due question, with links to the
 * explanation and to a new check. `mode` is kept for the old two-page callers.
 */
export function ReviewBoard({
  lessons,
  progress,
  mode = 'all',
}: {
  lessons: ReviewLesson[];
  progress: Pick<CourseProgress, 'answers' | 'reviews'>;
  mode?: 'weak' | 'revision' | 'all';
}) {
  const language = useLearningStore((state) => state.language),
    copy = (key: keyof typeof REVIEW_COPY) => REVIEW_COPY[key][language];
  const plan = reviewPlan(lessons, progress, dateKey()),
    selected = plan.filter((lesson) =>
      mode === 'weak' ? lesson.weak.length : lesson.reviewIds.length,
    );
  const totals = reviewTotals(selected);
  return (
    <section className="learning-review grid gap-4" aria-label={copy('title')}>
      <ReviewSummary {...totals} />
      {!selected.length && <p className="panel">{copy('empty')}</p>}
      <div className="day-card-grid">
        {selected.map((lesson) => (
          <article className="panel" key={lesson.id}>
            <h3>{lesson.title}</h3>
            <p>
              {copy('wrong')}: {lesson.weak.length} · {copy('due')}: {lesson.due.length}
            </p>
            <div className="button-row">
              <Link className="button subtle" href={lesson.lessonHref}>
                {copy('theory')}
              </Link>
              <Link className="button primary" href={lesson.quizHref}>
                {copy('quiz')}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/** React review: one page with mistakes and due questions of both months. */
export function ReactRevision() {
  const state = useLearningStore();
  const today = dateKey();
  const lessons = LEARNING_TOPICS.filter((topic) => topic.month <= 2).map((topic) => ({
    id: topic.id,
    title: topicTitle(topic, state.language),
    questionIds: QUIZ_QUESTIONS.filter((question) => question.topicId === topic.id).map(
      (question) => question.id,
    ),
    lessonHref: `/lesson/${topic.id}`,
    quizHref: `/revision?start=1&topic=${topic.id}`,
  }));
  const written = [1, 2].flatMap((month) => {
    const { plan, topicIds } = reactAssessmentPlan(month);
    return plan.flatMap(({ day, lesson }) => {
      const question = lesson.interview;
      if (
        !question ||
        !state.daySubmissions?.[lesson.id]?.answers.some((answer) => answer.id === question.id)
      )
        return [];
      const review = state.reviews[question.id];
      if (!review || (review.repetitions > 0 && review.due > today)) return [];
      return [{ month, day, lesson, question, topicId: topicIds[question.id] }];
    });
  });
  const unique = [...new Map(written.map((item) => [item.question.id, item])).values()];
  const text = (value: (typeof unique)[number]['question']['answer']) =>
    courseText(value, state.contentLanguage);
  return (
    <>
      <PageHeading title={REVIEW_COPY.title[state.language]} subtitle="React" />
      <ReviewBoard lessons={lessons} progress={state} />
      {unique.map(({ month, day, question, topicId }) => (
        <article className="panel mt-4 grid gap-3" key={question.id}>
          <span className="badge w-fit">
            React · {month}/{day}
          </span>
          <h3>{text(question.question)}</h3>
          <WrittenAnswer
            reference={text(question.answer)}
            accepted={[
              question.answer.ru,
              question.answer.tg,
              question.answer.en,
              ...(question.acceptedAnswers ?? []),
            ]}
            caseSensitive={question.caseSensitive}
            saved={state.answers[`${today}:interview:${question.id}`]}
            onCheck={(correct, answer) =>
              state.recordAnswer({ id: question.id, topicId }, 'interview', correct, answer)
            }
          />
          <Link className="text-link w-fit" href={`/home?month=${month}&day=${day}`}>
            {REVIEW_COPY.theory[state.language]}
          </Link>
        </article>
      ))}
    </>
  );
}
