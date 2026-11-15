import type { InterfaceLocale } from './locale';

export const COURSE_MATERIAL_LABEL: Record<InterfaceLocale, string> = {
  ru: 'Материал',
  en: 'Material',
  tg: 'Мавод',
  es: 'Material',
};

export function courseDayCount(count: number, locale: InterfaceLocale) {
  const plural = new Intl.PluralRules(locale).select(count);
  if (locale === 'ru')
    return `${count} ${plural === 'one' ? 'день' : plural === 'few' ? 'дня' : 'дней'}`;
  if (locale === 'tg') return `${count} рӯз`;
  if (locale === 'es') return `${count} ${count === 1 ? 'día' : 'días'}`;
  return `${count} ${count === 1 ? 'day' : 'days'}`;
}

export function courseTopicCount(count: number, locale: 'ru') {
  const plural = new Intl.PluralRules(locale).select(count);
  return `${count} ${plural === 'one' ? 'тема' : plural === 'few' ? 'темы' : 'тем'}`;
}
