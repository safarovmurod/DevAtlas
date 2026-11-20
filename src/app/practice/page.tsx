import { PageTransition } from '@/components/layout/page-transition';
import { coursePublishedDays } from '@/content/courses/catalog';
import { PracticeHub } from '@/components/learning/practice-hub';
import { PracticeEntry } from '@/components/learning/practice-entry';
import { getTopic } from '@/content/course';
import { redirect } from 'next/navigation';
import { isCourseId } from '@/lib/courses/ids';
import { notFound } from 'next/navigation';

/**
 * Practice is part of the day page of each course ("My day": lesson + practice together).
 * Old links to /practice?course=...&day=... open that page. React keeps its practice lab.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; topic?: string; day?: string; course?: string }>;
}) {
  const params = await searchParams;
  const month = Number(params.month);
  if (params.course && !isCourseId(params.course)) notFound();
  if (params.course && isCourseId(params.course) && params.course !== 'react') {
    const day = params.day !== undefined ? Number(params.day) : undefined;
    if (
      day !== undefined &&
      (!Number.isInteger(day) || day < 1 || day > coursePublishedDays(params.course))
    )
      notFound();
    redirect(
      `/courses/${params.course}/home${day !== undefined ? `?day=${day}` : ''}#day-practice`,
    );
  }
  if (month === 3 || getTopic(params.topic || '')?.month === 3) {
    const day =
      params.day !== undefined && params.day !== '' ? Number(params.day) : undefined;
    if (
      day !== undefined &&
      (!Number.isInteger(day) || day < 1 || day > coursePublishedDays('nextjs'))
    )
      notFound();
    redirect(`/courses/nextjs/home${day !== undefined ? `?day=${day}` : ''}#day-practice`);
  }
  if (!params.course && !params.month && !params.topic && !params.day)
    return (
      <PageTransition>
        <PracticeEntry />
      </PageTransition>
    );
  return (
    <PageTransition>
      <PracticeHub
        initialMonth={[1, 2, 3].includes(month) ? month : undefined}
        initialTopic={params.topic}
        initialDay={Number(params.day) || undefined}
      />
    </PageTransition>
  );
}
