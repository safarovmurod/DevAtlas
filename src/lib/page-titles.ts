import type { Metadata } from 'next';
import { UI as ONBOARDING_UI } from '@/components/onboarding/onboarding-copy';
import { START_HERE_TITLE } from '@/content/start-here';
import { AUTH_COPY } from '@/lib/auth-copy';
import { BOOKMARKS_COPY } from '@/lib/bookmarks';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { getRequestLocale } from '@/lib/request-locale';

/** The sidebar's own labels for these sections (src/components/layout/sidebar.tsx). */
const SIDEBAR_LABELS: Record<
  InterfaceLocale,
  { progress: string; plans: string; community: string }
> = {
  ru: { progress: 'Прогресс', plans: 'Тарифы', community: 'Сообщество' },
  en: { progress: 'Progress', plans: 'Plans', community: 'Community' },
  tg: { progress: 'Пешрафт', plans: 'Тарифҳо', community: 'Ҷомеа' },
  es: { progress: 'Progreso', plans: 'Planes', community: 'Comunidad' },
};

export type PageTitleKey =
  | 'courses'
  | 'home'
  | 'plan'
  | 'study'
  | 'tests'
  | 'practice'
  | 'revision'
  | 'answers'
  | 'settings'
  | 'signIn'
  | 'onboarding'
  | 'start'
  | 'progress'
  | 'plans'
  | 'community'
  | 'bookmarks';

/** Browser-tab title of a page, taken from the interface copy the page already shows. */
export function pageTitle(key: PageTitleKey, locale: InterfaceLocale): string {
  const copy = COPY[locale];
  switch (key) {
    case 'courses':
      return LEARNING_UI_COPY[locale].allCourses;
    case 'home':
      return copy.home;
    case 'plan':
      return copy.plan;
    case 'study':
      return copy.learn;
    case 'tests':
      return copy.tests;
    case 'practice':
      return copy.practice;
    case 'revision':
      return copy.revision;
    case 'answers':
      return copy.answers;
    case 'settings':
      return copy.settings;
    case 'signIn':
      return AUTH_COPY[locale].loginTab;
    case 'onboarding':
      return ONBOARDING_UI[locale].title;
    case 'bookmarks':
      return BOOKMARKS_COPY[locale].title;
    case 'start':
      // The day-0 page has RU/TG/EN text; the Spanish interface shows its English version.
      return START_HERE_TITLE[locale === 'es' ? 'en' : locale];
    default:
      return SIDEBAR_LABELS[locale][key];
  }
}

/** generateMetadata for a page whose title is one interface label. */
export async function titleMetadata(key: PageTitleKey): Promise<Metadata> {
  return { title: pageTitle(key, await getRequestLocale()) };
}
