'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, Smartphone } from 'lucide-react';
import { COURSE_CATALOG, courseName } from '@/content/courses/catalog';
import { courseRoute, type OnboardingLocale, type OnboardingPlan } from '@/lib/onboarding';
import { LEVEL_LABEL } from '@/lib/placement';
import { STUDY_DAYS, TEST_UI, UI, WEEKDAYS } from './onboarding-copy';

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
          {testUi.level}: {LEVEL_LABEL[plan.level][locale]}
        </span>
        {plan.score && (
          <span>
            {testUi.score}: {plan.score.correct} / {plan.score.total}
          </span>
        )}
      </p>
      <p>{plan.reason[locale]}</p>
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
