import type { CourseProgress } from '@/lib/account/progress';
export interface ReviewLesson {
  id: string;
  title: string;
  questionIds: string[];
  lessonHref: string;
  quizHref: string;
}
/** Review priority comes from actual saved attempts, never page views or XP. */
export function reviewPlan(
  lessons: ReviewLesson[],
  progress: Pick<CourseProgress, 'answers' | 'reviews'>,
  today: string,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error('Invalid review date');
  const known = new Set(lessons.flatMap((lesson) => lesson.questionIds));
  const answers = new Map<string, CourseProgress['answers'][string][]>();
  for (const answer of Object.values(progress.answers)) {
    if (!known.has(answer.questionId) || answer.date > today) continue;
    const list = answers.get(answer.questionId) ?? [];
    list.push(answer);
    answers.set(answer.questionId, list);
  }
  return lessons.map((lesson) => {
    const weak: string[] = [],
      due: string[] = [],
      attempted: string[] = [];
    for (const id of new Set(lesson.questionIds)) {
      const records = answers.get(id) ?? [],
        review = progress.reviews[id];
      if (records.length) attempted.push(id);
      const latest = records.reduce(
        (date, record) => (record.date > date ? record.date : date),
        '',
      );
      // The scheduler holds the outcome of the last attempt across modes; when
      // importing older answers without it, conflicting same-day answers are
      // conservatively offered for review rather than called mastered.
      if (
        records.length &&
        (review
          ? review.repetitions === 0
          : records.some((record) => record.date === latest && !record.correct))
      )
        weak.push(id);
      if (records.length && review && /^\d{4}-\d{2}-\d{2}$/.test(review.due) && review.due <= today)
        due.push(id);
    }
    return { ...lesson, weak, due, attempted, reviewIds: [...new Set([...weak, ...due])] };
  });
}
