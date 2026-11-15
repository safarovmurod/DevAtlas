// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  contentLocaleFor,
  INTERFACE_LOCALES,
  localeFromAcceptLanguage,
  migrateSavedLocale,
  negotiateLocale,
} from '@/lib/locale';

describe('visitor locale: saved preference, geolocation, browser language', () => {
  it('supports exactly English, Russian, Tajik and Spanish', () => {
    expect([...INTERFACE_LOCALES].sort()).toEqual(['en', 'es', 'ru', 'tg']);
  });
  it.each([
    ['RU', 'ru'],
    ['US', 'en'],
    ['TJ', 'tg'],
    ['ES', 'es'],
    ['MX', 'es'],
    ['AR', 'es'],
    ['ru', 'ru'],
    ['tj', 'tg'],
    ['es', 'es'],
  ] as const)('country %s resolves to %s', (country, expected) => {
    expect(negotiateLocale({ country, acceptLanguage: 'en-US,en;q=0.9' })).toBe(expected);
  });
  it('countries of removed languages follow the browser language, not a removed locale', () => {
    expect(negotiateLocale({ country: 'UA', acceptLanguage: 'uk-UA,ru;q=0.8' })).toBe('ru');
    expect(negotiateLocale({ country: 'JP', acceptLanguage: 'ja-JP' })).toBe('en');
    expect(negotiateLocale({ country: 'KR', acceptLanguage: 'ko-KR,es;q=0.5' })).toBe('es');
  });
  it('a saved manual choice always wins over country and browser language', () => {
    expect(negotiateLocale({ country: 'RU', savedLocale: 'tg', acceptLanguage: 'es-ES' })).toBe(
      'tg',
    );
    expect(negotiateLocale({ country: 'ES', savedLocale: 'en', acceptLanguage: 'ru-RU' })).toBe(
      'en',
    );
    expect(negotiateLocale({ country: 'US', savedLocale: 'es' })).toBe('es');
  });
  it('ignores untrusted/unsupported saved values, including removed languages', () => {
    expect(negotiateLocale({ country: 'US', savedLocale: '<script>' })).toBe('en');
    expect(negotiateLocale({ country: 'DE', savedLocale: 'uk', acceptLanguage: 'es-MX' })).toBe(
      'es',
    );
    expect(negotiateLocale({ country: 'DE', savedLocale: 'ja' })).toBe('en');
    expect(negotiateLocale({ country: 'DE', savedLocale: 'ko', acceptLanguage: 'ru' })).toBe('ru');
  });
  it('prefers Cloudflare visitor geolocation when the Vercel IP is a proxy', () => {
    expect(negotiateLocale({ cloudflareCountry: 'ES', country: 'US', acceptLanguage: 'en' })).toBe(
      'es',
    );
    expect(negotiateLocale({ cloudflareCountry: 'TJ', country: 'RU', acceptLanguage: 'ru' })).toBe(
      'tg',
    );
    expect(
      negotiateLocale({ cloudflareCountry: 'DE', country: 'RU', acceptLanguage: 'es-ES,es;q=0.9' }),
    ).toBe('es');
    expect(
      negotiateLocale({ cloudflareCountry: 'XX', country: 'US', acceptLanguage: 'ru-RU' }),
    ).toBe('ru');
  });
  it('uses browser languages for other countries, weighted by q', () => {
    expect(negotiateLocale({ country: 'DE', acceptLanguage: 'de-DE,es-ES;q=0.9,ru;q=0.7' })).toBe(
      'es',
    );
    expect(negotiateLocale({ country: 'FR', acceptLanguage: 'fr-CA,ru-RU;q=0.6,en-US;q=0.8' })).toBe(
      'en',
    );
    expect(negotiateLocale({ country: 'ZZ', acceptLanguage: 'tg-TJ,tg;q=0.9' })).toBe('tg');
    expect(negotiateLocale({ country: 'ZZ', acceptLanguage: 'ja-JP,ko-KR;q=0.9' })).toBe('en');
    expect(negotiateLocale({ country: 'ZZ', acceptLanguage: 'uk-UA,uk;q=0.9' })).toBe('en');
    expect(negotiateLocale({ country: 'ZZ', acceptLanguage: 'fr-FR,de-DE;q=0.8' })).toBe('en');
  });
  it('respects q=0, invalid q, and deterministic tie order', () => {
    expect(localeFromAcceptLanguage('es;q=0,ru;q=0.9,en;q=0.8')).toBe('ru');
    expect(localeFromAcceptLanguage('ru;q=0,es;q=bogus,en;q=0.3')).toBe('en');
    expect(localeFromAcceptLanguage('es;q=0.8,en;q=0.8')).toBe('es');
  });
  it('shows lesson text in English for Spanish; there are no invented translations', () => {
    expect(contentLocaleFor('es')).toBe('en');
    expect(contentLocaleFor('tg')).toBe('tg');
    expect(contentLocaleFor('ru')).toBe('ru');
    expect(contentLocaleFor('en')).toBe('en');
  });
});

describe('saved languages of older versions', () => {
  it('keeps supported languages', () => {
    for (const locale of INTERFACE_LOCALES) expect(migrateSavedLocale(locale)).toBe(locale);
  });
  it.each(['uk', 'ja', 'ko'])('moves a saved %s to English without a matching browser language', (old) => {
    expect(migrateSavedLocale(old)).toBe('en');
    expect(migrateSavedLocale(old, ['de-DE', 'fr'])).toBe('en');
  });
  it('moves a removed language to the browser language when that is supported', () => {
    expect(migrateSavedLocale('uk', ['uk-UA', 'ru-RU', 'en'])).toBe('ru');
    expect(migrateSavedLocale('ja', ['es-MX'])).toBe('es');
    expect(migrateSavedLocale('ko', ['tg-TJ'])).toBe('tg');
  });
  it('does not accept unknown values', () => {
    expect(migrateSavedLocale('xx')).toBeNull();
    expect(migrateSavedLocale(undefined)).toBeNull();
    expect(migrateSavedLocale(42)).toBeNull();
  });
});
