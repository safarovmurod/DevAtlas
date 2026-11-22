'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Cpu,
  Laptop,
  Route,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { COURSE_CATALOG, courseName } from '@/content/courses/catalog';
import {
  courseRoute,
  pickText,
  type OnboardingLocale,
  type OnboardingPlan,
} from '@/lib/onboarding';
import { LEVEL_LABEL } from '@/lib/placement';
import { STUDY_DAYS, TEST_UI, UI, WEEKDAYS } from './onboarding-copy';

const EXTRA_RESULT_COPY: Record<
  OnboardingLocale,
  {
    bundleLabel: (n: number) => string;
    hardwareTitle: string;
    pcMandatory: string;
    pcRecommended: string;
    roadmapTitle: string;
    startHere: string;
  }
> = {
  tg: {
    bundleLabel: (n) =>
      n > 1 ? `Дар 1 рӯз ${n} дарсро якҷо мегузаред (пешравии тез)` : '1 дарс дар 1 рӯзи омӯзиш',
    hardwareTitle: 'Тавсияи компютер / ноутбук барои ин курс',
    pcMandatory: 'Барои ин курс ПК ё ноутбук ҳатмист',
    pcRecommended: 'Ноутбук тавсия мешавад',
    roadmapTitle: 'Харитаи пурраи роҳи шумо (қадам ба қадам)',
    startHere: 'Аз ин ҷо сар кунед',
  },
  ru: {
    bundleLabel: (n) =>
      n > 1 ? `Объединяйте ${n} урока в 1 день (ускоренный график)` : '1 урок за 1 учебный день',
    hardwareTitle: 'Рекомендация ПК / ноутбука для этого курса',
    pcMandatory: 'Для этого направления ПК или ноутбук обязателен',
    pcRecommended: 'Рекомендуем ноутбук',
    roadmapTitle: 'Полная дорожная карта обучения (шаг за шагом)',
    startHere: 'Ваш старт',
  },
  en: {
    bundleLabel: (n) =>
      n > 1 ? `Bundle ${n} course days per study day (fast track)` : '1 course day per study day',
    hardwareTitle: 'PC / Laptop recommendation for this path',
    pcMandatory: 'A PC or laptop is required for this course',
    pcRecommended: 'Laptop recommended',
    roadmapTitle: 'Complete step-by-step learning roadmap',
    startHere: 'Start here',
  },
  es: {
    bundleLabel: (n) =>
      n > 1 ? `Agrupa ${n} lecciones por día (ritmo rápido)` : '1 lección por día de estudio',
    hardwareTitle: 'Recomendación de PC / portátil para este curso',
    pcMandatory: 'Se requiere PC o portátil para esta ruta',
    pcRecommended: 'Portátil recomendado',
    roadmapTitle: 'Hoja de ruta completa paso a paso',
    startHere: 'Tu inicio',
  },
};

/** The personal plan shown at the end of onboarding. */
export function OnboardingResult({
  plan,
  locale,
  onRestart,
}: {
  plan: OnboardingPlan;
  locale: OnboardingLocale;
  onRestart: () => void;
}) {
  const ui = UI[locale];
  const testUi = TEST_UI[locale];
  const extra = EXTRA_RESULT_COPY[locale];
  const studyDays = STUDY_DAYS[plan.daysPerWeek] ?? STUDY_DAYS[5];
  const entry = COURSE_CATALOG.find((course) => course.id === plan.courseId);
  // A paid course is suggested together with its free previous course.
  const proPrerequisite =
    entry?.accessTier && entry.accessTier !== 'starter' ? entry.prerequisite : null;

  return (
    <section className="panel onboarding-card" aria-labelledby="onboarding-result">
      <p className="eyebrow">{ui.result}</p>
      <h1 id="onboarding-result">
        {ui.course}: {courseName(plan.courseId)}
      </h1>
      <p className="onboarding-level">
        <span className={'level-badge level-' + plan.level}>
          {testUi.level}: {pickText(LEVEL_LABEL[plan.level], locale)}
        </span>
        {plan.score && (
          <span>
            {testUi.score}: {plan.score.correct} / {plan.score.total}
          </span>
        )}
      </p>
      <p>{pickText(plan.reason, locale)}</p>
      {plan.learnerProfile && (
        <div className="flex items-start gap-2.5 rounded-xl border border-primary/25 bg-primary-soft/50 px-3.5 py-3 text-sm leading-6">
          <Sparkles size={17} className="mt-1 shrink-0 text-brand" aria-hidden="true" />
          <div className="grid gap-1">
            <p className="m-0">{pickText(plan.learnerProfile, locale)}</p>
            <span className="text-xs font-semibold text-brand">
              {extra.bundleLabel(plan.lessonsPerSession ?? 1)}
            </span>
          </div>
        </div>
      )}
      {plan.levelSource === 'self' && <p className="muted small">{testUi.self}</p>}
      {plan.selfMismatch && <p className="warning-text">{testUi[plan.selfMismatch]}</p>}
      {proPrerequisite && (
        <p className="warning-text">
          {testUi.pro}{' '}
          <Link href={courseRoute(proPrerequisite)}>{courseName(proPrerequisite)}</Link>
        </p>
      )}

      <p className="onboarding-pace">
        <CalendarDays size={18} /> {plan.minutesPerDay} {ui.perDay} · {plan.daysPerWeek}{' '}
        {ui.perWeek} · {ui.finish} {plan.weeks} {ui.weeks}
      </p>
      <div className="onboarding-week" role="list">
        {WEEKDAYS[locale].map((name, day) => (
          <span role="listitem" key={name} className={studyDays.includes(day) ? 'active' : ''}>
            {name}
            <b>{studyDays.includes(day) ? plan.minutesPerDay + "'" : '—'}</b>
          </span>
        ))}
      </div>

      <h2>{ui.day}</h2>
      <ul className="onboarding-split">
        <li>
          <b>{plan.split.theory}'</b> {ui.theory}
        </li>
        <li>
          <b>{plan.split.practice}'</b> {ui.practice}
        </li>
        <li>
          <b>{plan.split.review}'</b> {ui.review}
        </li>
      </ul>
      {plan.tight && <p className="warning-text">{ui.tight}</p>}

      {plan.phoneOnly && (
        <p className="warning-text">
          <Smartphone size={16} /> {ui.phone}
        </p>
      )}

      {/* Specific PC / Laptop hardware recommendation when course needs a PC or learner uses phone only */}
      {plan.hardware && (plan.phoneOnly || plan.beginner || plan.hardware.required) && (
        <div className="rounded-xl border border-border bg-muted/45 p-4 grid gap-2.5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="flex items-center gap-2 text-foreground">
              <Laptop size={18} className="text-brand shrink-0" aria-hidden="true" />
              {extra.hardwareTitle}
            </strong>
            <span
              className={
                'rounded-full px-2.5 py-0.5 text-xs font-semibold ' +
                (plan.hardware.required
                  ? 'bg-warning/15 text-warning'
                  : 'bg-primary-soft text-brand')
              }
            >
              {plan.hardware.required ? extra.pcMandatory : extra.pcRecommended}
            </span>
          </div>
          <p className="m-0 font-medium text-foreground">{pickText(plan.hardware.title, locale)}</p>
          <p className="m-0 text-xs leading-5 text-muted-foreground">
            {pickText(plan.hardware.reason, locale)}
          </p>
          <div className="grid gap-1.5 rounded-lg border border-border/70 bg-card p-3 text-xs sm:grid-cols-3">
            <div>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Cpu size={13} aria-hidden="true" /> CPU
              </span>
              <strong className="mt-0.5 block text-foreground">{plan.hardware.cpu}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">RAM</span>
              <strong className="mt-0.5 block text-foreground">{plan.hardware.ram}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">SSD</span>
              <strong className="mt-0.5 block text-foreground">{plan.hardware.storage}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Complete step-by-step multi-course roadmap */}
      {plan.roadmap && plan.roadmap.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-4 grid gap-3">
          <h2 className="m-0 flex items-center gap-2 text-base font-semibold">
            <Route size={18} className="text-brand" aria-hidden="true" />
            {extra.roadmapTitle}
          </h2>
          <ol className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            {plan.roadmap.map((item) => (
              <li key={item.courseId}>
                <Link
                  href={courseRoute(item.courseId)}
                  className={
                    'flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm no-underline transition-colors ' +
                    (item.isCurrent
                      ? 'border-primary bg-primary-soft/70 font-semibold text-foreground'
                      : 'border-border bg-muted/35 text-foreground hover:border-primary/40')
                  }
                >
                  <div className="min-w-0">
                    <span className="block truncate">{courseName(item.courseId)}</span>
                    <small className="block text-xs text-muted-foreground">
                      {pickText(item.stageLabel, locale)}
                    </small>
                  </div>
                  {item.isCurrent ? (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      {extra.startHere}
                    </span>
                  ) : (
                    <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {plan.interviewWeekly && (
        <p>
          <CheckCircle2 size={16} /> {ui.interview}
        </p>
      )}

      <div className="button-row">
        {plan.beginner ? (
          <Link className="button primary" href="/start">
            {ui.day0} <ArrowRight size={16} />
          </Link>
        ) : null}
        <Link
          className={'button ' + (plan.beginner ? 'subtle' : 'primary')}
          href={courseRoute(plan.courseId)}
        >
          {ui.start} <ArrowRight size={16} />
        </Link>
        <Link className="button subtle" href="/login">
          {ui.login}
        </Link>
        <button className="button subtle" onClick={onRestart}>
          {ui.again}
        </button>
      </div>
    </section>
  );
}
