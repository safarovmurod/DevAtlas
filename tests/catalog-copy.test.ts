import { describe, expect, it } from 'vitest';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { COURSE_IDS } from '@/lib/courses/ids';
import { courseDescription, courseDisplayName } from '@/lib/catalog-copy';
import { INTERFACE_LOCALES } from '@/lib/locale';

describe('localized course catalog', () => {
  it('provides a name and actual translated description for every course and interface language', () => {
    expect(COURSE_CATALOG.map(course => course.id).sort()).toEqual([...COURSE_IDS].sort());
    for (const id of COURSE_IDS) {
      for (const locale of INTERFACE_LOCALES) {
        expect(courseDisplayName(id, locale).trim()).not.toBe('');
        expect(courseDescription(id, locale).trim()).not.toBe('');
        if (locale !== 'en') expect(courseDescription(id, locale)).not.toBe(courseDescription(id, 'en'));
      }
    }
  });

  it('translates subject names rather than exposing the English catalog metadata', () => {
    for (const course of COURSE_CATALOG.filter(course => course.category !== 'programming')) {
      for (const locale of INTERFACE_LOCALES.filter(locale => locale !== 'en')) {
        expect(courseDisplayName(course.id, locale)).not.toBe(course.name);
        expect(courseDisplayName(course.id, locale)).not.toBe(courseDisplayName(course.id, 'en'));
      }
    }
    expect(courseDisplayName('javascript-pro', 'ru')).toBe('JavaScript · Pro');
    expect(courseDisplayName('architecture-expert', 'es')).toBe('Arquitectura · Expert');
    expect(courseDisplayName('digital-marketing', 'ru')).toBe('Цифровой маркетинг');
    expect(courseDisplayName('business-foundations', 'tg')).toBe('Асосҳои соҳибкорӣ');
    expect(courseDisplayName('communication', 'es')).toBe('Comunicación');
    expect(courseDisplayName('content-creation', 'es')).toBe('Creación de contenido');
  });

  it('keeps technology proper names and labels introductory modules with their current scope', () => {
    for (const course of COURSE_CATALOG) {
      for (const locale of INTERFACE_LOCALES) {
        if (course.category === 'programming' && !course.accessTier && !['backend', 'mobile'].includes(course.id)) {
          expect(courseDisplayName(course.id, locale)).toBe(course.name);
        }
        if (course.introductoryDays) {
          expect(course.introductoryDays).toBe(course.publishedDays);
          expect(courseDescription(course.id, locale)).toContain(String(course.introductoryDays));
          expect(courseDescription(course.id, locale)).not.toMatch(/сертификат|certificate|certificado/i);
        }
      }
    }
  });
});
