'use client';

import Link from 'next/link';
import { DayExam } from '@/components/courses/day-exam';
import { DAY_COPY } from '@/components/courses/course-day';
import { reactAssessmentPlan } from '@/lib/courses/react-assessment-day';
import { courseText } from '@/lib/courses/schema';
import { reactMonthDays } from '@/lib/react-plan';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { useLearningStore } from '@/stores/learning-store';

export function ReactDayAssessment({ month, day }: { month: number; day: number }) {
  const state = useLearningStore();
  const currentMonth = month === 2 ? 2 : 1;
  const days = reactMonthDays(currentMonth);
  const entry = days.find((item) => item.day === day);
  const firstMonth =
    currentMonth === 2
      ? reactMonthDays(1).find((item) => !state.confirmedDays.includes(`1:${item.day}`))
      : undefined;
  const blocker =
    firstMonth ??
    days.find(
      (item) => item.day < day && !state.confirmedDays.includes(`${currentMonth}:${item.day}`),
    );
  const ui = LEARNING_UI_COPY[state.language];
  const { plan, topicIds } = reactAssessmentPlan(currentMonth);
  const item = plan.find((candidate) => candidate.day === day);
  if (!entry || !item) return null;
  return (
    <section className="grid gap-4">
      <Link
        className="button subtle w-fit"
        href={`/home?month=${currentMonth}&day=${day}`}
        transitionTypes={['nav-back']}
      >
        {ui.day} {day}
      </Link>
      <h1>
        {ui.answersInterview} · {ui.day} {day}
      </h1>
      <h2>{courseText(item.lesson.title, state.contentLanguage)}</h2>
      {blocker ? (
        <Link
          className="text-link"
          href={`/home?month=${firstMonth ? 1 : currentMonth}&day=${blocker.day}`}
        >
          {DAY_COPY[state.language].blocked(blocker.day)}
        </Link>
      ) : (
        <DayExam
          courseId="react"
          item={item}
          plan={plan}
          react={{
            month: currentMonth,
            studied: entry.practiceOnly ? [] : entry.topics.map((topic) => topic.id),
            topicIds,
          }}
        />
      )}
    </section>
  );
}
