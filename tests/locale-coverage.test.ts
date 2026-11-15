import { describe, expect, it } from 'vitest';
import { COPY } from '@/lib/i18n';
import { PUBLIC_COPY } from '@/lib/public-copy';
import { AUTH_COPY } from '@/lib/auth-copy';
import { ACCOUNT_COPY, localizedAuthError } from '@/lib/account-copy';
import { LEARNING_UI_COPY, contentFallbackNotice, lessonTranslationNotice } from '@/lib/learning-ui-copy';
import { courseText, courseTextLanguage } from '@/lib/courses/schema';
import { contentLocaleFor, INTERFACE_LOCALES, INTERFACE_LANGUAGE_NAMES } from '@/lib/locale';

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,shape(item)]));
  expect(typeof value).toBe('string');
  expect((value as string).trim()).not.toBe('');
  return 'text';
}

describe('supported interface languages', () => {
  for (const [name, dictionary] of Object.entries({ COPY, PUBLIC_COPY, AUTH_COPY, ACCOUNT_COPY, LEARNING_UI_COPY })) {
    it(`${name} contains every nonempty interface key in all supported languages`, () => {
      for (const locale of INTERFACE_LOCALES) {
        expect(shape(dictionary[locale])).toEqual(shape(dictionary.ru));
      }
    });
  }

  it('offers exactly English, Russian, Tajik and Spanish', () => {
    expect([...INTERFACE_LOCALES]).toEqual(['en', 'ru', 'tg', 'es']);
    expect(Object.keys(INTERFACE_LANGUAGE_NAMES).sort()).toEqual(['en', 'es', 'ru', 'tg']);
  });

  it('names each locale in its own language and identifies untranslated lesson coverage', () => {
    expect(INTERFACE_LANGUAGE_NAMES.es).toBe('Español');
    expect(INTERFACE_LANGUAGE_NAMES.tg).toBe('Тоҷикӣ');
    expect(lessonTranslationNotice('es')).toContain('Aún no hay traducción al español');
    expect(lessonTranslationNotice('en')).toBeNull();
    expect(contentLocaleFor('es')).toBe('en');
  });

  it('names the language that really shows in the untranslated-lesson note', () => {
    expect(courseTextLanguage({tg:'т',ru:'р'},'en')).toBe('ru');
    expect(courseTextLanguage({tg:'т',ru:'р',en:'e'},'en')).toBe('en');
    expect(courseTextLanguage({tg:'т',ru:'р'},'tg')).toBe('tg');
    expect(courseText({tg:'т',ru:'р'},'en')).toBe('р');
    expect(contentFallbackNotice('en','ru')).toContain('shown in Russian');
    expect(contentFallbackNotice('en','en')).toContain('shown in English');
    expect(contentFallbackNotice('en','tg')).toContain('shown in Tajik');
    expect(contentFallbackNotice('ru','en')).toContain('показаны на английском');
    expect(contentFallbackNotice('tg','en')).toContain('ба англисӣ');
    expect(contentFallbackNotice('es','tg')).toContain('se muestra en tayiko');
    for (const locale of INTERFACE_LOCALES) for (const language of ['ru','en','tg'] as const)
      expect(contentFallbackNotice(locale,language)).not.toContain('{language}');
  });

  it('shows localized authentication errors without leaking provider details', () => {
    expect(localizedAuthError({code:'invalid_credentials',message:'sensitive server details'},'login','es')).toBe('No se pudo iniciar sesión. Revisa tu correo y tu contraseña.');
    expect(localizedAuthError({status:429,message:'sensitive server details'},'login','es')).toBe('Demasiados intentos. Espera un poco y vuelve a intentarlo.');
  });
});
