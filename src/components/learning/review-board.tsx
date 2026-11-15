'use client';
import Link from 'next/link';
import type { CourseProgress } from '@/lib/account/progress';
import { LEARNING_TOPICS, QUIZ_QUESTIONS, topicTitle } from '@/content/course';
import { dateKey } from '@/lib/learning';
import { reviewPlan, type ReviewLesson } from '@/lib/progress/review-plan';
import { useLearningStore } from '@/stores/learning-store';
import { PageHeading } from './page-heading';
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

/**
 * The single review list: lessons with a mistake or a due question, with links to the
 * explanation and to a new check. `mode` is kept for the old two-page callers.
 */
export function ReviewBoard({
  lessons,
  progress,
  mode = 'all',
}: {
  lessons: ReviewLesson[];
  progress: Pick<CourseProgress, 'answers' | 'reviews'>;
  mode?: 'weak' | 'revision' | 'all';
}) {
  const language = useLearningStore((state) => state.language),
    copy = (key: keyof typeof REVIEW_COPY) => REVIEW_COPY[key][language];
  const plan = reviewPlan(lessons, progress, dateKey()),
    selected = plan.filter((lesson) =>
      mode === 'weak' ? lesson.weak.length : lesson.reviewIds.length,
    );
  const totals = reviewTotals(selected);
  return (
    <section className="learning-review grid gap-4" aria-label={copy('title')}>
      <ReviewSummary {...totals} />
      {!selected.length && <p className="panel">{copy('empty')}</p>}
      <div className="day-card-grid">
        {selected.map((lesson) => (
          <article className="panel" key={lesson.id}>
            <h3>{lesson.title}</h3>
            <p>
              {copy('wrong')}: {lesson.weak.length} · {copy('due')}: {lesson.due.length}
            </p>
            <div className="button-row">
              <Link className="button subtle" href={lesson.lessonHref}>
                {copy('theory')}
              </Link>
              <Link className="button primary" href={lesson.quizHref}>
                {copy('quiz')}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/** React review: one page with mistakes and due questions of both months. */
export function ReactRevision() {
  const state = useLearningStore();
  const lessons = LEARNING_TOPICS.filter((topic) => topic.month <= 2).map((topic) => ({
    id: topic.id,
    title: topicTitle(topic, state.language),
    questionIds: QUIZ_QUESTIONS.filter((question) => question.topicId === topic.id).map(
      (question) => question.id,
    ),
    lessonHref: `/lesson/${topic.id}`,
    quizHref: `/revision?start=1&topic=${topic.id}`,
  }));
  return (
    <>
      <PageHeading title={REVIEW_COPY.title[state.language]} subtitle="React" />
      <ReviewBoard lessons={lessons} progress={state} />
    </>
  );
}
