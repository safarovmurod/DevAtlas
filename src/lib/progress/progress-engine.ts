import { StudyEvent, TopicMastery, CourseProgress, StreakInfo, DailyPlan } from '@/types';
import { TOPICS } from '@/content/topics';

export interface ProgressCalculationResult {
  courseProgress: CourseProgress;
  topicMasteries: Record<string, TopicMastery>;
  weakTopics: TopicMastery[];
  streakInfo: StreakInfo;
  dailyPlan: DailyPlan;
}

/**
 * Calculates topic mastery from verified events using normalized weights:
 * Practice: 40%, Quiz: 25%, Interview: 20%, Revision: 15%
 */
export function calculateTopicMastery(topicId: string, events: StudyEvent[]): TopicMastery {
  const topicEvents = events.filter((e) => e.topicId === topicId);

  const practiceEvents = topicEvents.filter(
    (e) => e.eventType === 'practice_passed' || e.eventType === 'practice_failed',
  );
  const quizEvents = topicEvents.filter((e) => e.eventType === 'quiz_answered');
  const interviewEvents = topicEvents.filter((e) => e.eventType === 'interview_answered');
  const revisionEvents = topicEvents.filter((e) => e.eventType === 'revision_completed');

  const calcCatScore = (evts: StudyEvent[]): number | null => {
    if (evts.length === 0) return null;
    const totalScore = evts.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round(totalScore / evts.length);
  };

  const pScore = calcCatScore(practiceEvents);
  const qScore = calcCatScore(quizEvents);
  const iScore = calcCatScore(interviewEvents);
  const rScore = calcCatScore(revisionEvents);

  // Default weights
  const defaultWeights = {
    practice: 0.4,
    quiz: 0.25,
    interview: 0.2,
    revision: 0.15,
  };

  // Re-normalize weights if categories are missing attempts
  let totalAvailableWeight = 0;
  if (pScore !== null) totalAvailableWeight += defaultWeights.practice;
  if (qScore !== null) totalAvailableWeight += defaultWeights.quiz;
  if (iScore !== null) totalAvailableWeight += defaultWeights.interview;
  if (rScore !== null) totalAvailableWeight += defaultWeights.revision;

  let masteryScore = 0;
  if (totalAvailableWeight > 0) {
    let weightedSum = 0;
    if (pScore !== null) weightedSum += pScore * (defaultWeights.practice / totalAvailableWeight);
    if (qScore !== null) weightedSum += qScore * (defaultWeights.quiz / totalAvailableWeight);
    if (iScore !== null) weightedSum += iScore * (defaultWeights.interview / totalAvailableWeight);
    if (rScore !== null) weightedSum += rScore * (defaultWeights.revision / totalAvailableWeight);
    masteryScore = Math.round(weightedSum);
  }

  const mistakesCount = topicEvents.filter(
    (e) => e.correct === false || e.eventType === 'practice_failed',
  ).length;

  return {
    topicId,
    masteryScore,
    practiceScore: pScore || 0,
    quizScore: qScore || 0,
    interviewScore: iScore || 0,
    revisionScore: rScore || 0,
    attemptsCount: topicEvents.length,
    isWeak: topicEvents.length > 0 && masteryScore < 60,
    mistakesCount,
  };
}

/**
 * Calculates total Course Progress:
 * CourseProgress = Coverage * 0.60 + Mastery * 0.40
 */
export function calculateCourseProgress(
  topicMasteries: Record<string, TopicMastery>,
  completedTopicIds: Set<string>,
): CourseProgress {
  const totalTopics = TOPICS.length;
  const completedCount = completedTopicIds.size;

  const coveragePct = Math.min(100, Math.round((completedCount / totalTopics) * 100));

  // Mastery is the average of touched topics, or 0 if none
  const touchedMasteries = Object.values(topicMasteries).filter((m) => m.attemptsCount > 0);
  const avgMastery =
    touchedMasteries.length > 0
      ? Math.round(
          touchedMasteries.reduce((sum, m) => sum + m.masteryScore, 0) / touchedMasteries.length,
        )
      : 0;

  const totalProgressPct = Math.round(coveragePct * 0.6 + avgMastery * 0.4);

  return {
    coveragePct,
    masteryPct: avgMastery,
    totalProgressPct,
    completedTopicsCount: completedCount,
    totalTopicsCount: totalTopics,
  };
}

/**
 * Calculates timezone-safe streak and active study minutes
 */
export function calculateStreak(events: StudyEvent[], activeSecondsToday: number): StreakInfo {
  const todayKey = new Date().toISOString().slice(0, 10);
  const minutesToday = Math.round(activeSecondsToday / 60);

  // Group verified events by date (YYYY-MM-DD)
  const daysWithActivity = new Set<string>();
  events.forEach((e) => {
    const dateKey = e.createdAt.slice(0, 10);
    daysWithActivity.add(dateKey);
  });

  const activeToday = minutesToday >= 10 || daysWithActivity.has(todayKey);

  // Calculate consecutive streak back in time
  let currentStreak = 0;
  const checkDate = new Date();

  // If today has activity, include it, otherwise start checking from yesterday
  if (!activeToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = checkDate.toISOString().slice(0, 10);
    if (daysWithActivity.has(key) || (key === todayKey && activeToday)) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(currentStreak, 1),
    lastActiveDateKey: todayKey,
    activeToday,
    minutesToday,
  };
}

/**
 * Generates an adaptive Daily Plan based on available time, weak topics, and mistakes
 */
export function generateDailyPlan(
  dailyTimeMinutes: number,
  topicMasteries: Record<string, TopicMastery>,
): DailyPlan {
  const targetTime = dailyTimeMinutes || 60;

  // Split time: 15% Revision, 40% Practice, 25% Lesson, 20% Interview
  const allocated = {
    revision: Math.round(targetTime * 0.15),
    practice: Math.round(targetTime * 0.4),
    lesson: Math.round(targetTime * 0.25),
    interview: Math.round(targetTime * 0.2),
  };

  // Find weak topics sorted by mistake count desc
  const weakList = Object.values(topicMasteries)
    .filter((m) => m.isWeak)
    .sort((a, b) => b.mistakesCount - a.mistakesCount);

  const recommendedIds = weakList.map((m) => m.topicId);

  // Fallback to first topics if no weak topics yet
  if (recommendedIds.length === 0) {
    recommendedIds.push('usestate', 'useeffect', 'array_map');
  }

  let reason = 'Машқҳо барои оғози омӯзиш тавсия шуданд.';
  if (weakList.length > 0) {
    const topWeak = TOPICS.find((t) => t.id === weakList[0].topicId);
    reason = `Мавзӯи "${topWeak?.title || weakList[0].topicId}" тавсия шуд: ${weakList[0].mistakesCount} хато дар амалия.`;
  }

  return {
    dailyTimeMinutes: targetTime,
    allocated,
    recommendedTopicIds: recommendedIds.slice(0, 3),
    reason,
  };
}
