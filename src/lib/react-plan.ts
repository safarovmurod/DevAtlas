import { LEARNING_TOPICS, type LearningTopic } from '@/content/course';
export interface ReactDay {
  day: number;
  title: string;
  topics: LearningTopic[];
  practiceOnly: boolean;
}
export function reactDayComplete(
  day: ReactDay,
  completedTopics: readonly string[],
  completedPractice: readonly string[],
) {
  return day.practiceOnly
    ? day.topics.every((topic) =>
        completedPractice.some((id) => id.startsWith(topic.id + '-exercise-')),
      )
    : day.topics.every((topic) => completedTopics.includes(topic.id));
}
const projectSteps = [
  'Собираем интерфейс',
  'Работа с формой',
  'Обработка ошибок',
  'Связываем компоненты',
  'Данные и загрузка',
  'Проверяем крайние случаи',
  'Адаптируем телефон',
  'Проверяем регрессии',
  'Объясняем проект',
];
export function reactMonthDays(month: number): ReactDay[] {
  const topics = LEARNING_TOPICS.filter((topic) => topic.month === month);
  return Array.from({ length: 30 }, (_, index) => {
    const start = topics.length >= 30 ? Math.floor((index * topics.length) / 30) : index;
    const end = topics.length >= 30 ? Math.floor(((index + 1) * topics.length) / 30) : index + 1;
    const learning = topics.slice(start, end);
    const practiceOnly = learning.length === 0;
    const selected = learning.length
      ? learning
      : [topics[(index - topics.length) % topics.length]].filter(Boolean);
    const projectIndex = Math.max(0, index - topics.length);
    return {
      day: index + 1,
      title: practiceOnly
        ? projectSteps[projectIndex % projectSteps.length] + ': ' + selected[0]?.titleRu
        : selected.map((t) => t.titleRu).join(' · '),
      topics: selected,
      practiceOnly,
    };
  });
}

/** Acknowledging theory alone does not finish a day: apply each topic in practice. */
export function reactDayReady(
  day: ReactDay,
  completedTopics: readonly string[],
  completedPractice: readonly string[],
) {
  return (
    day.topics.length > 0 &&
    day.topics.every(
      (topic) =>
        (day.practiceOnly || completedTopics.includes(topic.id)) &&
        completedPractice.some(
          (id) =>
            id.startsWith(topic.id + '-exercise-') ||
            (topic.id === 'local-practice' && id.startsWith('local-project-')),
        ),
    )
  );
}

/**
 * Every day is open. `current` is the first day that is not confirmed yet, the rest
 * of the unfinished days are `open`. A day is `done` only when it is confirmed and ready.
 */
export function reactDayProgress(
  month: number,
  completedTopics: readonly string[],
  completedPractice: readonly string[],
  confirmedDays: readonly string[],
  daySubmissions: Readonly<Record<string, unknown>> = {},
) {
  let currentFound = false;
  return reactMonthDays(month).map((day) => {
    const done =
      confirmedDays.includes(`${month}:${day.day}`) &&
      (Object.hasOwn(daySubmissions, `react-month-${month}-day-${day.day}`) ||
        reactDayReady(day, completedTopics, completedPractice));
    const status: 'done' | 'current' | 'open' = done ? 'done' : currentFound ? 'open' : 'current';
    if (!done) currentFound = true;
    return { ...day, status };
  });
}

/** First React day (month 1, then month 2) that is not confirmed yet. */
export function reactCurrentDay(
  completedTopics: readonly string[],
  completedPractice: readonly string[],
  confirmedDays: readonly string[],
) {
  for (const month of [1, 2]) {
    const current = reactDayProgress(month, completedTopics, completedPractice, confirmedDays).find(
      (item) => item.status === 'current',
    );
    if (current) return { month, day: current.day };
  }
  return null;
}
