'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { courseName } from '@/content/courses/catalog';
import {
  ONBOARDING_STORAGE_KEY,
  courseRoute,
  onboardingLocale,
  readOnboarding,
} from '@/lib/onboarding';
import { LEVEL_LABEL } from '@/lib/placement';

const COPY = {
  tg: {
    ask: 'Намедонед аз куҷо сар кунед? 15 савол ҷавоб диҳед — курс ва графики рӯзона тайёр мешавад.',
    go: 'Саволҳоро сар кардан',
    day0: 'Рӯзи 0',
    plan: 'Нақшаи шумо',
    perDay: 'дақ. дар рӯз',
    open: 'Кушодан',
    redo: 'Аз нав',
  },
  ru: {
    ask: 'Не знаете, с чего начать? Ответьте на 15 вопросов — получите курс и график на каждый день.',
    go: 'Пройти вопросы',
    day0: 'День 0',
    plan: 'Ваш план',
    perDay: 'мин. в день',
    open: 'Открыть',
    redo: 'Заново',
  },
  en: {
    ask: 'Not sure where to start? Answer 15 questions to get a course and a daily schedule.',
    go: 'Start the questions',
    day0: 'Day 0',
    plan: 'Your plan',
    perDay: 'min a day',
    open: 'Open',
    redo: 'Redo',
  },
};

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}
function readRaw() {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function OnboardingBanner() {
  const locale = onboardingLocale(useLearningStore((state) => state.language));
  const copy = COPY[locale];
  // undefined on the server; the saved plan string in the browser.
  const raw = useSyncExternalStore(subscribe, readRaw, () => undefined);
  const stored = useMemo(() => (raw === undefined ? undefined : readOnboarding()), [raw]);
  if (stored === undefined) return null;
  if (!stored)
    return (
      <div className="panel onboarding-banner">
        <Sparkles size={20} />
        <p>{copy.ask}</p>
        <div className="button-row">
          <Link className="button primary" href="/onboarding">
            {copy.go}
          </Link>
          <Link className="button subtle" href="/start">
            {copy.day0}
          </Link>
        </div>
      </div>
    );
  const { plan } = stored;
  return (
    <div className="panel onboarding-banner">
      <CalendarDays size={20} />
      <p>
        <strong>{copy.plan}:</strong> {courseName(plan.courseId)} ·{' '}
        {LEVEL_LABEL[plan.level][locale]} · {plan.minutesPerDay} {copy.perDay} · {plan.daysPerWeek}
        ×7
      </p>
      <div className="button-row">
        <Link className="button primary" href={courseRoute(plan.courseId)}>
          {copy.open}
        </Link>
        <Link className="button subtle" href="/onboarding">
          {copy.redo}
        </Link>
      </div>
    </div>
  );
}
