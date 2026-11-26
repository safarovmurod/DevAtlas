import type { Metadata, MetadataRoute } from 'next';
import { COURSE_CATEGORY_IDS } from '@/content/course-categories';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { coursePath } from '@/lib/courses/links';
import type { InterfaceLocale } from '@/lib/locale';

export const SITE_NAME = 'DevAtlas';

/** Account, admin, API and personal study screens have no public content for search engines. */
export const PRIVATE_PATHS = [
  '/api/',
  '/admin',
  '/auth/',
  '/settings',
  '/devices',
  '/progress',
  '/bookmarks',
  '/home',
  '/notes',
  '/study',
  '/revision',
  '/weak-topics',
  '/onboarding',
  '/community',
  '/answers/export',
  '/course-files/',
];

export function robotsRules(base: URL): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
    sitemap: new URL('/sitemap.xml', base).toString(),
  };
}

/** Public pages only. Personal study screens and per-day query URLs are not listed. */
export function sitemapEntries(base: URL): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, base).toString();
  const categories = COURSE_CATEGORY_IDS.filter((id) =>
    COURSE_CATALOG.some((course) => course.category === id),
  );
  return [
    { url: url('/'), changeFrequency: 'weekly', priority: 1 },
    { url: url('/courses'), changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/start'), changeFrequency: 'monthly', priority: 0.7 },
    ...categories.map((id) => ({
      url: url(`/courses/category/${id}`),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...COURSE_CATALOG.map((course) => ({
      url: url(coursePath(course.id)),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: url('/plans'), changeFrequency: 'monthly', priority: 0.5 },
    { url: url('/privacy'), changeFrequency: 'yearly', priority: 0.3 },
    { url: url('/terms'), changeFrequency: 'yearly', priority: 0.3 },
  ];
}

const OPEN_GRAPH_LOCALES: Record<InterfaceLocale, string> = {
  en: 'en_US',
  ru: 'ru_RU',
  tg: 'tg_TJ',
  es: 'es_ES',
};

/** Title, description, canonical address and social preview of a public page. */
export function publicPageMetadata(
  locale: InterfaceLocale,
  title: string,
  description: string,
  canonicalPath?: string,
): Metadata {
  return {
    title,
    description,
    ...(canonicalPath ? { alternates: { canonical: canonicalPath } } : {}),
    ...socialMetadata(locale, title, description),
  };
}

/** A page's openGraph replaces its parent's, so each page repeats the shared fields. */
export function socialMetadata(
  locale: InterfaceLocale,
  title: string,
  description: string,
): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: OPEN_GRAPH_LOCALES[locale],
      title,
      description,
    },
    twitter: { card: 'summary', title, description },
  };
}
