import ru from '@/content/imported/translations-ru.json';
import en from '@/content/imported/translations-en.json';
import { translateReactTopicDetail } from '@/content/supplemental-react';

export type ContentLanguage = 'tg' | 'ru' | 'en';

// tg — оригинали худи матн; ru/en — аз луғати тарҷума, агар сатр ёфт нашавад, аслӣ нишон дода мешавад.
const DICTS: Record<'ru' | 'en', Record<string, string>> = { ru, en };

export function tr(text: string, lang: ContentLanguage) {
  if (lang === 'tg') return text;
  return translateReactTopicDetail(text, lang) ?? (DICTS[lang][text] || text);
}
