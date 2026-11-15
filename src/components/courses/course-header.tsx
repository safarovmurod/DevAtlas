'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { courseDisplayName } from '@/lib/catalog-copy';
import { courseDayCount } from '@/lib/course-copy';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { useLearningStore } from '@/stores/learning-store';
import { CourseIcon } from './course-icon';

/**
 * Top of every course page: a clean hero with the course logo (it flies in
 * from the catalog card), the page title and real progress in confirmed days.
 * Sections live in the sidebar, so there is no second tab strip here.
 */
export function CourseHeader({
  courseId,
  section,
  title,
  totalDays,
  doneDays,
}: {
  courseId: ImportedCourseId;
  section: string;
  title: string;
  day: number;
  totalDays: number;
  doneDays: number;
}) {
  const language = useLearningStore((state) => state.language);
  const ui = LEARNING_UI_COPY[language];
  const percent = totalDays ? Math.round((doneDays / totalDays) * 100) : 0;

  return (
    <header className="mb-6 grid gap-5">
      <Link
        href="/courses"
        transitionTypes={['nav-back']}
        className="inline-flex min-h-11 w-fit items-center gap-2 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {ui.allCourses}
      </Link>

      <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <CourseIcon courseId={courseId} size={64} shared />
        <div className="grid min-w-0 flex-1 gap-1.5">
          <span className="font-mono text-xs font-medium tracking-wider text-brand uppercase">
            {courseDisplayName(courseId, language)} · {courseDayCount(totalDays, language)}
          </span>
          <h1 className="text-[26px] leading-[34px] font-semibold tracking-tight sm:text-[32px] sm:leading-10">
            {title}
          </h1>
          <p className="text-[15px] leading-6 text-muted-foreground">
            {section === 'plan' ? ui.planIntro : ui.dayIntro}
          </p>
        </div>
        {totalDays > 0 && (
          <div className="grid w-full gap-2 sm:w-56">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">
                {doneDays} / {totalDays} {ui.completedDays}
              </span>
              <span className="font-mono text-xs font-semibold text-brand">{percent}%</span>
            </div>
            <Progress value={percent} label={`${doneDays} / ${totalDays} ${ui.completedDays}`} />
          </div>
        )}
      </div>
    </header>
  );
}
