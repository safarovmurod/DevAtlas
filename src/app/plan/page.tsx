'use client';
import { PageTransition } from '@/components/layout/page-transition';

import { MonthCards } from '@/components/learning/month-cards';
import { PageHeading } from '@/components/learning/page-heading';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import type { InterfaceLocale } from '@/lib/locale';

const DURATION: Record<InterfaceLocale, string> = {
  ru: 'React · 2 месяца',
  tg: 'React · 2 моҳ',
  uk: 'React · 2 місяці',
  en: 'React · 2 months',
  ja: 'React · 2か月',
  ko: 'React · 2개월',
};
/** React course: choose month 1 or month 2. */
export default function PlanPage() {
  const language = useLearningStore((state) => state.language);
  return (
    <PageTransition>
      <>
        <PageHeading title={COPY[language].plan} subtitle={DURATION[language]} />
        <MonthCards />
      </>
    </PageTransition>
  );
}
