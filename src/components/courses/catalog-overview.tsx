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
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--depth-1)] transition-[transform,box-shadow,border-color] duration-200 ease-out sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-2xl sm:size-12',
          tone,
        )}
      >
        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="grid">
        <strong className="text-2xl leading-8 font-semibold tracking-tight tabular-nums sm:text-[28px]">
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
        className="group relative col-span-3 flex flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-indigo-400/20 bg-[linear-gradient(145deg,#0f172a_0%,#1e1b4b_100%)] p-5 text-white no-underline shadow-[0_22px_42px_-24px_rgba(15,23,42,0.85)] transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-0.5 xl:col-span-1"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),rgba(79,70,229,0.2)_48%,transparent_72%)] blur-3xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <CourseIcon courseId={course} size={34} />
          </span>
          <div className="grid min-w-0">
            <small className="text-xs text-slate-300/75">{copy.current}</small>
            <strong className="truncate text-base font-semibold">
              {courseDisplayName(course, language)}
            </strong>
          </div>
          <ArrowUpRight
            size={20}
            aria-hidden="true"
            className="ml-auto shrink-0 text-slate-300/70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
        <div className="relative grid gap-2">
          <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            className="h-1.5 overflow-hidden rounded-full bg-white/12"
          >
            <span
              className="block h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#38bdf8]"
              style={{ width: `${Math.round(percent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate whitespace-nowrap font-mono text-xs tabular-nums text-slate-300/80">
              {label}
            </span>
            <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-[#7dd3fc]">
              {copy.resume}
            </span>
          </div>
        </div>
      </Link>
      <Stat
        icon={Library}
        value={CATALOG.length}
        label={copy.courses}
        tone="bg-primary-soft text-brand"
      />
      <Stat icon={Gift} value={FREE} label={copy.free} tone="bg-success-soft text-success" />
      <Stat
        icon={GraduationCap}
        value={LESSONS}
        label={copy.lessons}
        tone="bg-primary-soft text-brand"
      />
    </section>
  );
}
