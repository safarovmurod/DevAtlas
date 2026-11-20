import type { CourseContent, CourseDelivery } from './schema';

/** Public lesson/quiz view. Never mutate the cached canonical authoring content. */
export function publicCourseContent(content: CourseContent): CourseDelivery {
  return {
    ...content,
    lessons: content.lessons.map((lesson) => {
      const { practice, learningFlow, ...publicLesson } = lesson;
      const publicFlow = learningFlow ? (() => {
        const { guidedPractice: _guided, miniChallenge: _challenge, ...freeFlow } = learningFlow;
        return freeFlow;
      })() : undefined;
      return {
        ...publicLesson,
        practiceAvailable: Boolean(practice),
        ...(publicFlow ? { learningFlow: publicFlow } : {}),
      };
    }),
  };
}
