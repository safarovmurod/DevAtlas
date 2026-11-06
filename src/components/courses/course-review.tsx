'use client';
import { useState } from 'react';
import { ReviewBoard } from '@/components/learning/review-board';
import type { CourseProgress } from '@/lib/account/progress';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { courseMonthPlan } from '@/lib/courses/plan';
import { courseText, type CourseContent } from '@/lib/courses/schema';
import { dateKey } from '@/lib/learning';
import { reviewPlan } from '@/lib/progress/review-plan';
import { useLearningStore } from '@/stores/learning-store';
import { CourseQuestion } from './course-question';

/**
 * "Revision" shows questions that are due again today.
 * "Weak topics" shows questions the learner answered wrong.
 */
export function CourseReview({
  courseId,
  content,
  progress,
  mode,
}: {
  courseId: ImportedCourseId;
  content: CourseContent;
  progress: CourseProgress;
  mode: 'weak' | 'revision';
}) {
  const contentLanguage = useLearningStore((state) => state.contentLanguage);

  const lessons = courseMonthPlan(content.lessons).map(({ day, lesson }) => ({
    id: lesson.id,
    title: courseText(lesson.title, contentLanguage),
    questionIds: lesson.questions.map((question) => question.id),
    lessonHref: courseSectionHref(courseId, 'home', day),
    quizHref: courseSectionHref(courseId, 'tests', day),
  }));

  // The queue is fixed when the page opens, so an answered question does not
  // disappear from the list while the learner is still reading the feedback.
  const [queue] = useState(
    () =>
      new Set(
        reviewPlan(lessons, progress, dateKey()).flatMap((lesson) =>
          mode === 'weak' ? lesson.weak : lesson.reviewIds,
        ),
      ),
  );

  return (
    <>
      <ReviewBoard lessons={lessons} progress={progress} mode={mode} />
      {content.lessons.map((lesson) => {
        const questions = lesson.questions.filter((question) => queue.has(question.id));
        if (!questions.length) return null;
        return (
          <section className="panel" key={lesson.id}>
            <h2>{courseText(lesson.title, contentLanguage)}</h2>
            {questions.map((question) => (
              <CourseQuestion
                key={question.id}
                courseId={courseId}
                lesson={lesson}
                question={question}
                mode="revision"
              />
            ))}
          </section>
        );
      })}
    </>
  );
}
