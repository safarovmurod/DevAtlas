import type { InterfaceLocale } from '@/lib/locale';

export type LocalizedText = Record<InterfaceLocale, string>;
/** Arguments in the order ru, en, tg, uk, ja, ko. */
export function text(
  ru: string,
  en: string,
  tg: string,
  uk: string,
  ja: string,
  ko: string,
): LocalizedText {
  return { ru, en, tg, uk, ja, ko };
}
