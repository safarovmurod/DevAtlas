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
  es: 'React · 2 meses',
  en: 'React · 2 months',
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
