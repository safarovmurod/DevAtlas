// Authored assessment keys are loaded by the server registry only, never by UI components.
import { assessmentBankSchema } from '@/lib/practice/assessment';
import { t } from './html-first-page-helpers';
import { a } from './html-first-page-variant-a';
import { b } from './html-first-page-variant-b';

export default assessmentBankSchema.parse({
  courseId: 'html',
  lessonId: 'html-day-01',
  version: 1,
  sourceIds: ['mdn-html-basics', 'whatwg-html'],
  objectives: [
    t(
      'Отличать настройки вкладки от видимого содержимого.',
      'Танзимоти варақаро аз мазмуни намоён фарқ кардан.',
      'Distinguish tab settings from visible content.',
    ),
    t(
      'Объяснять основные теги и атрибуты первой страницы.',
      'Тегҳо ва атрибутҳои асосии саҳифаи аввалро фаҳмондан.',
      'Explain the first page’s main tags and attributes.',
    ),
    t(
      'Создать и проверить собственный HTML-документ, а не скопировать строку ответа.',
      'Ҳуҷҷати HTML-и худро сохта санҷидан, на танҳо нусхабардории ҷавоб.',
      'Create and check your own HTML document rather than copy an answer string.',
    ),
  ],
  variants: [
    {
      id: 'first-page-a',
      questions: a.map((question) => ({
        ...question,
        hints: [...question.hints, question.explanation],
      })),
    },
    {
      id: 'first-page-b',
      questions: b.map((question) => ({
        ...question,
        hints: [...question.hints, question.explanation],
      })),
    },
  ],
});
