import { COURSE_CATALOG } from '@/content/courses/catalog';
import learningIndex from '@/content/learning-index.json';
import { COPY } from '@/lib/i18n';
import { useLearningStore } from '@/stores/learning-store';

const LEARNING_TOPICS = learningIndex.topics;

/** Progress of the selected course: confirmed days, or studied topics for React. */
export function useCourseProgress() {
  const language = useLearningStore((state) => state.language);
  const month = useLearningStore((state) => state.activeMonth);
  const completedTopics = useLearningStore((state) => state.completedTopics);
  const completed = completedTopics ?? [];
  const course = useLearningStore((state) => state.selectedCourse);
  const courseCount = useLearningStore((state) =>
    course === 'react' ? 0 : state.courses?.[course]?.confirmedDays?.length || 0,
  );
  const courseTotal =
    COURSE_CATALOG.find((item) => item.id === course)?.publishedDays ??
    (course === 'css' ? 5 : course === 'nextjs' ? 20 : 30);
  const reactMonth = month === 2 ? 2 : 1;
  const total = LEARNING_TOPICS.filter((topic) => topic.month === reactMonth).length;
  const count = LEARNING_TOPICS.filter(
    (topic) => topic.month === reactMonth && completed.includes(topic.id),
  ).length;
  const done = course === 'react' ? count : courseCount;
  const goal = course === 'react' ? total : courseTotal;
  const percent = goal ? (done / goal) * 100 : 0;
  const label =
    (course === 'react' ? COPY[language].month + ' ' + reactMonth + ' · ' : '') +
    done +
    ' / ' +
    goal;
  return { course, language, reactMonth, done, goal, percent, label };
}
