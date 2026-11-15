'use client';
import Link from 'next/link';
import { ArrowUpRight, Gift, GraduationCap, Library, type LucideIcon } from 'lucide-react';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { courseDisplayName } from '@/lib/catalog-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { useCourseProgress } from '@/lib/use-course-progress';
import { cn } from '@/lib/utils';
import { CourseIcon } from './course-icon';

const COPY: Record<
  InterfaceLocale,
  { courses: string; free: string; lessons: string; current: string; resume: string }
> = {
  ru: {
    courses: 'Курсов',
    free: 'Бесплатных',
    lessons: 'Уроков',
    current: 'Текущий курс',
    resume: 'Продолжить',
  },
  tg: {
    courses: 'Курсҳо',
    free: 'Ройгон',
    lessons: 'Дарсҳо',
    current: 'Курси ҷорӣ',
    resume: 'Идома додан',
  },
  en: {
    courses: 'Courses',
    free: 'Free',
    lessons: 'Lessons',
    current: 'Current course',
    resume: 'Continue',
  },
  es: {
    courses: 'Cursos',
    free: 'Gratis',
    lessons: 'Lecciones',
    current: 'Curso actual',
    resume: 'Continuar',
  },
};

const CATALOG = COURSE_CATALOG.filter((course) => course.id !== 'javascript-2');
const FREE = CATALOG.filter((course) => (course.accessTier ?? 'starter') === 'starter').length;
const LESSONS = COURSE_CATALOG.reduce((sum, course) => sum + (course.publishedDays ?? 0), 0);

function Stat({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 shadow-[0_14px_30px_-22px_rgb(40_25_10/0.45)] transition-[transform,box-shadow] duration-200 ease-out">
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-2xl sm:size-12',
          tone,
        )}
      >
        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="grid">
        <strong className="text-2xl leading-8 font-semibold tracking-tight sm:text-[28px]">
          {value}
        </strong>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

/** Dashboard row at the top of the catalog: current course and quick numbers. */
export function CatalogOverview() {
  const { course, language, percent, label } = useCourseProgress();
  const copy = COPY[language];
  const href = course === 'react' ? '/courses/react' : `/courses/${course}/plan`;

  return (
    <section className="grid grid-cols-3 gap-3 sm:gap-4 xl:grid-cols-4" aria-label={copy.current}>
      <Link
        href={href}
        transitionTypes={['nav-forward']}
        className="group relative flex flex-col justify-between gap-5 overflow-hidden rounded-2xl bg-[#17120f] p-5 text-white no-underline shadow-[0_22px_40px_-24px_rgb(23_18_15/0.8)] transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-0.5 col-span-3 xl:col-span-1"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-[#ff9301]/25 blur-3xl"
        />
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
            <CourseIcon courseId={course} size={34} />
          </span>
          <div className="grid min-w-0">
            <small className="text-xs text-white/60">{copy.current}</small>
            <strong className="truncate text-base font-semibold">
              {courseDisplayName(course, language)}
            </strong>
          </div>
          <ArrowUpRight
            size={20}
            aria-hidden="true"
            className="ml-auto text-white/60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
        <div className="grid gap-2">
          <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            className="h-1.5 overflow-hidden rounded-full bg-white/15"
          >
            <span
              className="block h-full rounded-full bg-[#ff9301]"
              style={{ width: `${Math.round(percent)}%` }}
            />
          </div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-mono text-xs text-white/60">{label}</span>
            <span className="font-medium text-[#ffb84d]">{copy.resume}</span>
          </div>
        </div>
      </Link>
      <Stat
        icon={Library}
        value={CATALOG.length}
        label={copy.courses}
        tone="bg-violet-500/12 text-violet-600"
      />
      <Stat icon={Gift} value={FREE} label={copy.free} tone="bg-emerald-500/12 text-emerald-600" />
      <Stat
        icon={GraduationCap}
        value={LESSONS}
        label={copy.lessons}
        tone="bg-amber-500/15 text-amber-600"
      />
    </section>
  );
}
