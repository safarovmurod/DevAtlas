// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { courseContentSchema } from '@/lib/courses/schema';

const css = courseContentSchema.parse(JSON.parse(readFileSync('src/content/courses/css.json', 'utf8')));
const locales = ['ru', 'tg', 'en'] as const;
const days = css.lessons.filter(lesson => lesson.day !== undefined);

function checkTranslations(value: unknown, location: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkTranslations(item, `${location}[${index}]`));
  } else if (value && typeof value === 'object') {
    const fields = value as Record<string, unknown>;
    if ('ru' in fields || 'tg' in fields) {
      for (const locale of locales) {
        expect(typeof fields[locale], `${location}.${locale}`).toBe('string');
        expect((fields[locale] as string).trim().length, `${location}.${locale}`).toBeGreaterThan(0);
      }
    }
    for (const [key, item] of Object.entries(fields)) checkTranslations(item, `${location}.${key}`);
  }
}

describe('CSS curriculum quality', () => {
  it('preserves thirty numbered days and all five optional Sass lessons', () => {
    expect(days.map(lesson => lesson.day)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
    expect(days.map(lesson => lesson.id)).toEqual(Array.from({ length: 30 }, (_, index) => `css-day-${String(index + 1).padStart(2, '0')}`));
    expect(css.lessons.filter(lesson => lesson.day === undefined).map(lesson => lesson.id)).toEqual([
      'sass-variables-nesting', 'sass-mixins-extend', 'sass-files-build', 'sass-lists-each', 'sass-conditions-loops',
    ]);
    for (const locale of locales) expect(new Set(days.map(lesson => lesson.title[locale])).size).toBe(30);
  });

  it('has substantial RU/TG/EN sections, three questions and useful hints in every lesson', () => {
    for (const lesson of css.lessons) {
      checkTranslations(lesson, lesson.id);
      expect(lesson.sections.length, lesson.id).toBeGreaterThanOrEqual(4);
      expect(lesson.questions, lesson.id).toHaveLength(3);
      for (const section of lesson.sections) {
        expect(section.body.tg, lesson.id).not.toBe(section.body.ru);
        for (const locale of locales) {
          expect(section.body[locale]!.trim().length, `${lesson.id}: ${locale}`).toBeGreaterThanOrEqual(250);
          expect(section.body[locale]!.trim().length, `${lesson.id}: ${locale}`).toBeLessThanOrEqual(700);
        }
      }
      for (const question of lesson.questions) {
        expect(question.options, question.id).toHaveLength(3);
        expect(question.answer, question.id).toEqual(question.options[question.correctIndex]);
        expect(question.relatedSection, question.id).toBeGreaterThanOrEqual(0);
        expect(question.relatedSection, question.id).toBeLessThan(lesson.sections.length);
        for (const locale of locales) expect(question.hint?.[locale]?.trim().length, question.id).toBeGreaterThan(15);
      }
    }
  });

  it('balances answer positions and avoids conspicuously longer correct options in all languages', () => {
    const positions = [0, 0, 0];
    const longest = { ru: 0, tg: 0, en: 0 };
    for (const lesson of css.lessons) {
      expect(lesson.questions.map(question => question.correctIndex).sort(), lesson.id).toEqual([0, 1, 2]);
      for (const question of lesson.questions) {
        positions[question.correctIndex]++;
        for (const locale of locales) {
          const lengths = question.options.map(option => option[locale]!.length);
          expect(Math.max(...lengths) / Math.min(...lengths), `${question.id}: ${locale}`).toBeLessThanOrEqual(1.8);
          if (lengths.indexOf(Math.max(...lengths)) === question.correctIndex) longest[locale]++;
        }
      }
    }
    const total = css.lessons.reduce((count, lesson) => count + lesson.questions.length, 0);
    expect(Math.max(...positions) / total).toBeLessThanOrEqual(0.45);
    for (const locale of locales) expect(longest[locale] / total, locale).toBeLessThanOrEqual(0.45);
  });

  it('pairs runnable HTML with CSS and keeps independent solutions outside the theory', () => {
    const titles = new Map<string, number>();
    for (const lesson of css.lessons) {
      const practice = lesson.practice!;
      expect(practice.kind, lesson.id).toBe('code');
      expect(practice.solution.length, lesson.id).toBeGreaterThanOrEqual(150);
      expect(practice.solution, lesson.id).toContain('<!doctype html>');
      expect(practice.criteria, lesson.id).toHaveLength(3);
      expect(practice.hints, lesson.id).toHaveLength(2);
      expect(practice.hint, lesson.id).toEqual(practice.hints?.[0]);
      for (const locale of locales) {
        expect(new Set(practice.criteria.map(criterion => criterion[locale])).size, lesson.id).toBe(3);
        for (const criterion of practice.criteria) expect(criterion[locale]!.length, lesson.id).toBeGreaterThan(12);
      }
      expect(lesson.sections.some(section => section.code), lesson.id).toBe(true);
      for (const section of lesson.sections) {
        titles.set(section.title.ru, (titles.get(section.title.ru) ?? 0) + 1);
        if (section.code) {
          expect(section.language, lesson.id).toBe('html');
          expect(section.code, lesson.id).toContain('<style>');
          expect(section.code, lesson.id).toContain('<body>');
          expect(section.output, lesson.id).toBeDefined();
          expect(section.code, lesson.id).not.toBe(practice.solution);
        }
      }
      const theory = lesson.sections.map(section => `${section.code ?? ''} ${section.body.ru}`).join(' ');
      const significantLines = practice.solution.split('\n').map(line => line.trim()).filter(line => line.length > 30);
      expect(significantLines.filter(line => theory.includes(line)).length / significantLines.length, lesson.id).toBeLessThanOrEqual(0.6);
    }
    expect([...titles.values()].every(count => count < 5)).toBe(true);
  });
});
