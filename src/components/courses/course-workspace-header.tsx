'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { courseDisplayName } from '@/lib/catalog-copy';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { useLearningStore } from '@/stores/learning-store';
import { CourseIcon } from './course-icon';

/**
 * Slim top of the course pages that are used every day (My day, Review, Answers, Tests):
 * back link, course name, page title and one progress bar. No long text before the lesson.
 */
export function CourseWorkspaceHeader({
  courseId,
  title,
  totalDays,
  doneDays,
}: {
  courseId: ImportedCourseId;
  title: string;
  totalDays: number;
  doneDays: number;
}) {
  const language = useLearningStore((state) => state.language);
  const ui = LEARNING_UI_COPY[language];
  const percent = totalDays ? Math.round((doneDays / totalDays) * 100) : 0;

  return (
    <header className="mb-5 grid gap-3">
      <Link
        href="/courses"
        transitionTypes={['nav-back']}
        className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft
          size={16}
          aria-hidden="true"
          className="transition-transform motion-safe:group-hover:-translate-x-0.5"
        />
        {ui.allCourses}
      </Link>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--depth-1)]">
        <CourseIcon courseId={courseId} size={48} shared />
        <div className="grid min-w-0 flex-1 gap-0.5">
          <span className="truncate font-mono text-xs font-medium tracking-wider text-brand uppercase">
            {courseDisplayName(courseId, language)}
          </span>
          <h1 className="text-2xl leading-8 font-semibold tracking-tight">{title}</h1>
        </div>
        {totalDays > 0 && (
          <div className="grid w-full gap-1.5 sm:w-44">
            <div className="flex items-baseline justify-between text-sm tabular-nums">
              <span className="text-muted-foreground">
                {doneDays} / {totalDays}
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
