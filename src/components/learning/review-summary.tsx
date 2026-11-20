'use client';
import { useLearningStore } from '@/stores/learning-store';

const t = (ru: string, tg: string, en: string, es: string) => ({
  ru,
  tg,
  en,
  es,
});
export const REVIEW_COPY = {
  // One page: revision and weak topics together. "weak" and "revision" stay as the old page titles.
  title: t('Повторение', 'Такрор', 'Review', 'Repaso'),
  lead: t(
    'Вопросы, где вы ошиблись, и те, что пора повторить.',
    'Саволҳое, ки хато кардед ва вақти такрорашон расидааст.',
    'Questions you got wrong and ones that are due for review.',
    'Preguntas que fallaste y las que ya toca repasar.',
  ),
  openDay: t('Открыть мой день', 'Кушодани рӯзи ман', 'Open my day', 'Abrir mi día'),
  weak: t(
    'Темы для проработки',
    'Мавзӯъҳо барои такмил',
    'Topics to work on',
    'Temas para reforzar',
  ),
  revision: t(
    'Повторение по результатам',
    'Такрор аз рӯйи натиҷаҳо',
    'Review from your results',
    'Repaso según tus resultados',
  ),
  note: t(
    'Здесь учитываются сохранённые ответы и сроки повторения. Результаты обычного теста и самооценка не являются подтверждённым освоением курса.',
    'Дар ин ҷо ҷавобҳои сабтшуда ва муҳлати такрор ба ҳисоб гирифта мешаванд. Натиҷаи тести одӣ ва худбаҳодиҳӣ азхудкунии тасдиқшудаи курс нестанд.',
    'This uses saved answers and scheduled review dates. Ordinary quiz results and self ratings do not certify course mastery.',
    'Aquí se tienen en cuenta las respuestas guardadas y las fechas de repaso. Los resultados de una prueba normal y la autoevaluación no certifican el dominio del curso.',
  ),
  empty: t(
    'Пока нет тем с ошибками или наступившим повторением. Пройдите тест изученного урока — здесь появятся ваши результаты.',
    'Ҳоло мавзӯи хато ё такрори муҳлатрасида нест. Тести дарси омӯхтаро гузаред — натиҷаҳо дар ин ҷо пайдо мешаванд.',
    'No mistakes or due reviews yet. Take a quiz for a lesson you studied to build your review plan.',
    'Todavía no hay temas con errores ni repasos pendientes. Haz la prueba de una lección que hayas estudiado y aquí aparecerán tus resultados.',
  ),
  wrong: t('Ошибки', 'Хатоҳо', 'Mistakes', 'Errores'),
  due: t('Срок повторения наступил', 'Муҳлати такрор расид', 'Due for review', 'Toca repasar'),
  theory: t(
    'Повторить объяснение',
    'Шарҳро такрор кунед',
    'Review explanation',
    'Repasar la explicación',
  ),
  quiz: t('Проверить снова', 'Боз санҷед', 'Check again', 'Comprobar de nuevo'),
  todo: t(
    'Вопросов для повторения',
    'Саволҳо барои такрор',
    'Questions to review',
    'Preguntas para repasar',
  ),
};

/** Counts of what is worth repeating, with the honest note about what review does not prove. */
export function ReviewSummary({ total, weak, due }: { total: number; weak: number; due: number }) {
  const language = useLearningStore((state) => state.language);
  const copy = (key: keyof typeof REVIEW_COPY) => REVIEW_COPY[key][language];
  return (
    <div className="grid gap-2">
      <p className="text-[15px] text-muted-foreground">{copy('lead')}</p>
      <p role="status" className="flex flex-wrap items-center gap-2 text-sm">
        <span className="badge">
          {copy('todo')}: {total}
        </span>
        <span className="badge">
          {copy('wrong')}: {weak}
        </span>
        <span className="badge">
          {copy('due')}: {due}
        </span>
      </p>
      <p className="text-xs leading-5 text-muted-foreground">{copy('note')}</p>
    </div>
  );
}

/** Totals over lessons that have something to repeat. */
export function reviewTotals(selected: { weak: string[]; due: string[]; reviewIds: string[] }[]) {
  return {
    total: selected.reduce((sum, lesson) => sum + lesson.reviewIds.length, 0),
    weak: selected.reduce((sum, lesson) => sum + lesson.weak.length, 0),
    due: selected.reduce((sum, lesson) => sum + lesson.due.length, 0),
  };
}

