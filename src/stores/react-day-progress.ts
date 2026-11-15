import learningIndex from '@/content/learning-index.json';

// Day rules of the two-month React course. They use the lightweight topic
// index, not the full React lesson content.

const DAYS_PER_MONTH = 30;

type ReactProgress = {
  completedTopics: readonly string[];
  completedPractice: readonly string[];
  confirmedDays: readonly string[];
};

/**
 * Topics studied on one day. A month with 30 or more topics is spread evenly
 * over 30 days; a shorter month has one topic per day and later days repeat
 * earlier topics as review.
 */
function dayTopics(month: number, day: number) {
  const topics = learningIndex.topics.filter((topic) => topic.month === month);
  const index = day - 1;
  const spread = topics.length >= DAYS_PER_MONTH;
  const start = spread ? Math.floor((index * topics.length) / DAYS_PER_MONTH) : index;
  const end = spread ? Math.floor(((index + 1) * topics.length) / DAYS_PER_MONTH) : index + 1;
  const learning = topics.slice(start, end);
  if (learning.length) return { topics: learning, isReview: false };
  const review = topics[(index - topics.length) % topics.length];
  return { topics: review ? [review] : [], isReview: true };
}

function hasPractice(progress: ReactProgress, topicId: string) {
  return progress.completedPractice.some(
    (id) =>
      id.startsWith(topicId + '-exercise-') ||
      (topicId === 'local-practice' && id.startsWith('local-project-')),
  );
}

/** A day is ready when every topic of it is studied (review days excepted) and practised. */
function reactDayReady(progress: ReactProgress, month: number, day: number) {
  const { topics, isReview } = dayTopics(month, day);
  return (
    topics.length > 0 &&
    topics.every(
      (topic) =>
        (isReview || progress.completedTopics.includes(topic.id)) &&
        hasPractice(progress, topic.id),
    )
  );
}

/**
 * Every React day is open and can be confirmed in any order: the day must be a real day
 * of month 1 or 2, ready (its own topics learned and practised) and not confirmed yet.
 */
export function canConfirmReactDay(progress: ReactProgress, month: number, day: number) {
  if (month !== 1 && month !== 2) return false;
  if (!Number.isInteger(day) || day < 1 || day > DAYS_PER_MONTH) return false;
  if (progress.confirmedDays.includes(`${month}:${day}`)) return false;
  return reactDayReady(progress, month, day);
}
