import type { InterfaceLocale } from '@/lib/locale';

export type LocalizedText = Record<InterfaceLocale, string>;
/** Arguments in the order ru, en, tg, es. */
export function text(ru: string, en: string, tg: string, es: string): LocalizedText {
  return { ru, en, tg, es };
}
