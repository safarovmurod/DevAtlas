'use client';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { courseDisplayName } from '@/lib/catalog-copy';
import { courseDayCount } from '@/lib/course-copy';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { cn } from '@/lib/utils';
import { useLearningStore } from '@/stores/learning-store';
import { CourseIcon } from './course-icon';

const SECTIONS = [
  'plan',
  'home',
  'practice',
  'tests',
  'revision',
  'weak-topics',
  'answers',
] as const;

/**
 * Top of every course page (mockup react_1): course logo and name, the page
 * title, real progress in confirmed days and tabs to the course sections.
 */
export function CourseHeader({
  courseId,
  section,
  title,
  day,
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
  const copy = COPY[language];
  const ui = LEARNING_UI_COPY[language];
  const percent = totalDays ? Math.round((doneDays / totalDays) * 100) : 0;
  const activeSection = section === 'interview' ? 'tests' : section;

  const tabLabel: Record<(typeof SECTIONS)[number], string> = {
    plan: copy.plan,
    home: copy.home,
    practice: copy.practice,
    tests: ui.testsInterview,
    revision: copy.revision,
    'weak-topics': copy.weak,
    answers: ui.answersInterview,
  };

  return (
    <div className="mb-6 grid gap-3">
      <Link
        href="/courses"
        className="back-link inline-flex w-fit items-center gap-2 text-sm text-muted-foreground no-underline hover:text-foreground"
        transitionTypes={['nav-back']}
      >
        <Layers size={16} aria-hidden="true" />
        {ui.allCourses}
      </Link>

      <Card className="grid gap-5 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <CourseIcon courseId={courseId} size={56} className="hidden sm:block" />
          <div className="grid min-w-0 gap-1.5">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-brand">
              {courseDisplayName(courseId, language)} · {courseDayCount(totalDays, language)}
            </span>
            <h1 className="text-[26px] leading-[34px] font-semibold tracking-tight sm:text-[32px] sm:leading-10">
              {title}
            </h1>
            <p className="text-[15px] leading-6 text-muted-foreground">
              {section === 'plan' ? ui.planIntro : ui.dayIntro}
            </p>
          </div>
        </div>

        {totalDays > 0 && (
          <div className="grid gap-2 rounded-lg bg-muted p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-foreground">
                {doneDays} / {totalDays} {ui.completedDays}
              </span>
              <span className="font-mono text-xs font-semibold text-brand">{percent}%</span>
            </div>
            <Progress value={percent} label={`${doneDays} / ${totalDays} ${ui.completedDays}`} />
          </div>
        )}

        <nav aria-label={courseDisplayName(courseId, language)} className="overflow-x-auto">
          <ul className="flex min-w-max gap-1 border-b border-border">
            {SECTIONS.map((target) => (
              <li key={target}>
                <Link
                  href={courseSectionHref(courseId, target, day)}
                  aria-current={activeSection === target ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap no-underline transition-colors',
                    activeSection === target
                      ? 'border-primary text-brand'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tabLabel[target]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Card>
    </div>
  );
}
