'use client';
import Link from 'next/link';
import type { CourseProgress } from '@/lib/account/progress';
import { dateKey } from '@/lib/learning';
import { reviewPlan, type ReviewLesson } from '@/lib/progress/review-plan';
import { useLearningStore } from '@/stores/learning-store';
const t = (ru: string, tg: string, en: string, uk: string, ja: string, ko: string) => ({
  ru,
  tg,
  en,
  uk,
  ja,
  ko,
});
export const REVIEW_COPY = {
  weak: t(
    'Темы для проработки',
    'Мавзӯъҳо барои такмил',
    'Topics to work on',
    'Теми для опрацювання',
    '取り組むテーマ',
    '보완할 주제',
  ),
  revision: t(
    'Повторение по результатам',
    'Такрор аз рӯйи натиҷаҳо',
    'Review from your results',
    'Повторення за результатами',
    '結果に基づく復習',
    '결과 기반 복습',
  ),
  note: t(
    'Здесь учитываются сохранённые ответы и сроки повторения. Результаты обычного теста и самооценка не являются подтверждённым освоением курса.',
    'Дар ин ҷо ҷавобҳои сабтшуда ва муҳлати такрор ба ҳисоб гирифта мешаванд. Натиҷаи тести одӣ ва худбаҳодиҳӣ азхудкунии тасдиқшудаи курс нестанд.',
    'This uses saved answers and scheduled review dates. Ordinary quiz results and self ratings do not certify course mastery.',
    'Тут враховано збережені відповіді та строки повторення. Звичайні тести й самооцінка не засвідчують опанування курсу.',
    '保存された回答と復習予定日を使います。通常のクイズや自己評価はコース習得の証明ではありません。',
    '저장된 답변과 복습 예정일을 사용합니다. 일반 퀴즈 결과와 자체 평가는 과정 숙달을 인증하지 않습니다.',
  ),
  empty: t(
    'Пока нет тем с ошибками или наступившим повторением. Пройдите тест изученного урока — здесь появятся ваши результаты.',
    'Ҳоло мавзӯи хато ё такрори муҳлатрасида нест. Тести дарси омӯхтаро гузаред — натиҷаҳо дар ин ҷо пайдо мешаванд.',
    'No mistakes or due reviews yet. Take a quiz for a lesson you studied to build your review plan.',
    'Ще немає тем із помилками чи повторенням на сьогодні. Пройдіть тест вивченого уроку.',
    '間違いのあるテーマや期限の来た復習はまだありません。学んだレッスンのクイズを受けてください。',
    '아직 오답 주제나 복습할 항목이 없습니다. 학습한 수업의 퀴즈를 풀어 보세요.',
  ),
  wrong: t(
    'Требуют проработки',
    'Такмил лозим',
    'Needs work',
    'Потребують опрацювання',
    '取り組みが必要',
    '보완 필요',
  ),
  due: t(
    'Срок повторения наступил',
    'Муҳлати такрор расид',
    'Due for review',
    'Час повторити',
    '復習期限',
    '복습 예정',
  ),
  theory: t(
    'Повторить объяснение',
    'Шарҳро такрор кунед',
    'Review explanation',
    'Повторити пояснення',
    '説明を復習',
    '설명 복습',
  ),
  quiz: t(
    'Проверить снова',
    'Боз санҷед',
    'Check again',
    'Перевірити знову',
    'もう一度確認',
    '다시 확인',
  ),
  todo: t(
    'Вопросов для повторения',
    'Саволҳо барои такрор',
    'Questions to review',
    'Питань для повторення',
    '復習する問題',
    '복습할 문제',
  ),
};
export function ReviewBoard({
  lessons,
  progress,
  mode,
}: {
  lessons: ReviewLesson[];
  progress: Pick<CourseProgress, 'answers' | 'reviews'>;
  mode: 'weak' | 'revision';
}) {
  const language = useLearningStore((state) => state.language),
    copy = (key: keyof typeof REVIEW_COPY) => REVIEW_COPY[key][language];
  const plan = reviewPlan(lessons, progress, dateKey()),
    selected = plan.filter((lesson) =>
      mode === 'weak' ? lesson.weak.length : lesson.reviewIds.length,
    );
  return (
    <section className="learning-review" aria-label={copy(mode)}>
      <h2>{copy(mode)}</h2>
      <p>{copy('note')}</p>
      <p role="status">
        {copy('todo')}: {selected.reduce((n, item) => n + item.reviewIds.length, 0)}
      </p>
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
