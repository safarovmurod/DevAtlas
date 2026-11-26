// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { COURSE_IDS } from '@/lib/courses/ids';
import { coursePath } from '@/lib/courses/links';
import { INTERFACE_LOCALES } from '@/lib/locale';
import { pageTitle, type PageTitleKey } from '@/lib/page-titles';
import { PRIVATE_PATHS, publicPageMetadata, robotsRules, sitemapEntries } from '@/lib/seo';
import { publicSiteUrl } from '@/lib/site-url';

describe('public site address', () => {
  it('prefers the configured HTTPS address and keeps only its origin', () => {
    const url = publicSiteUrl({
      REACT_MENTOR_SITE_URL: ' https://devatlas.example/some/path?x=1 ',
      VERCEL_PROJECT_PRODUCTION_URL: 'devatlas.vercel.app',
    });
    expect(url.href).toBe('https://devatlas.example/');
  });

  it('falls back to the Vercel production domain, then to localhost', () => {
    expect(publicSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'devatlas.vercel.app' }).href).toBe(
      'https://devatlas.vercel.app/',
    );
    expect(publicSiteUrl({}).href).toBe('http://localhost:3000/');
  });

  it('skips a malformed or non-HTTPS configured address', () => {
    for (const value of ['not a url', 'http://devatlas.example', 'javascript:alert(1)'])
      expect(
        publicSiteUrl({
          REACT_MENTOR_SITE_URL: value,
          VERCEL_PROJECT_PRODUCTION_URL: 'devatlas.vercel.app',
        }).href,
      ).toBe('https://devatlas.vercel.app/');
  });
});

describe('robots.txt', () => {
  const base = new URL('https://devatlas.example');

  it('allows the site, hides private screens and points to the sitemap', () => {
    const robots = robotsRules(base);
    expect(robots.sitemap).toBe('https://devatlas.example/sitemap.xml');
    expect(robots.rules).toEqual({ userAgent: '*', allow: '/', disallow: PRIVATE_PATHS });
    for (const path of ['/api/', '/admin', '/auth/', '/settings', '/progress', '/answers/export'])
      expect(PRIVATE_PATHS).toContain(path);
  });

  it('never blocks a page that the sitemap lists (robots rules match by prefix)', () => {
    for (const entry of sitemapEntries(base)) {
      const path = new URL(entry.url).pathname;
      expect(PRIVATE_PATHS.filter((prefix) => path.startsWith(prefix))).toEqual([]);
    }
  });
});

describe('sitemap.xml', () => {
  const base = new URL('https://devatlas.example');
  const urls = sitemapEntries(base).map((entry) => entry.url);

  it('lists the public pages and every catalog course once', () => {
    for (const path of ['/', '/courses', '/start', '/plans', '/privacy', '/terms'])
      expect(urls).toContain(new URL(path, base).toString());
    for (const course of COURSE_CATALOG)
      expect(urls).toContain(new URL(coursePath(course.id), base).toString());
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('lists only categories that contain a course', () => {
    const categories = urls.filter((url) => url.includes('/courses/category/'));
    expect(categories.length).toBeGreaterThan(0);
    for (const url of categories) {
      const id = url.split('/').pop();
      expect(COURSE_CATALOG.some((course) => course.category === id)).toBe(true);
    }
  });

  it('uses absolute URLs on the configured origin only', () => {
    for (const url of urls) expect(url.startsWith('https://devatlas.example/')).toBe(true);
  });
});

describe('course links and page titles', () => {
  it('opens React at its entry page and every other course at its plan', () => {
    expect(coursePath('react')).toBe('/courses/react');
    expect(coursePath('html')).toBe('/courses/html/plan');
    for (const id of COURSE_IDS) expect(coursePath(id)).toMatch(/^\/courses\/[a-z0-9-]+/);
  });

  it('has a non-empty title for every page in every interface language', () => {
    const keys: PageTitleKey[] = [
      'courses',
      'home',
      'plan',
      'study',
      'tests',
      'practice',
      'revision',
      'answers',
      'settings',
      'signIn',
      'onboarding',
      'start',
      'progress',
      'plans',
      'community',
    ];
    for (const locale of INTERFACE_LOCALES)
      for (const key of keys) expect(pageTitle(key, locale).trim().length).toBeGreaterThan(0);
    expect(pageTitle('courses', 'tg')).toBe('Ҳамаи курсҳо');
    expect(pageTitle('start', 'es')).toBe(pageTitle('start', 'en'));
  });

  it('builds a canonical address only when one is given', () => {
    const withCanonical = publicPageMetadata('en', 'Courses', 'All courses', '/courses');
    expect(withCanonical.alternates).toEqual({ canonical: '/courses' });
    expect(withCanonical.openGraph).toMatchObject({ siteName: 'DevAtlas', locale: 'en_US' });
    expect(publicPageMetadata('tg', 'Day', 'Text').alternates).toBeUndefined();
  });
});
