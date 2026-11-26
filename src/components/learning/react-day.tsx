'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ListChecks, LockKeyhole, Sparkles } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { awardedXP } from '@/lib/learning';
import { LEARNING_TOPICS, topicTitle } from '@/content/course';
import { tr } from '@/lib/translate';
import { reactDayProgress, reactMonthDays } from '@/lib/react-plan';
import { lessonTranslationNotice } from '@/lib/learning-ui-copy';
import { DAY_COPY } from '@/components/courses/course-day';
import { PracticeLock, PRACTICE_LOCK_COPY } from '@/components/courses/practice-lock';
import { usePracticeAccess } from '@/components/courses/use-practice-access';
import { isInterviewDay } from '@/lib/courses/strict-attempt';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { useAccount } from '@/components/account/account-provider';
import { BookmarkButton } from './bookmark-button';
const DAY_UI = {
  ru: {
    title: 'Время разобраться в React.',
    intro: 'Изучаем выбранный день, затем применяем в коде.',
    day: 'День',
    selectDay: 'Выбор дня',
    prepTitle: 'Подготовка к React',
    prepText:
      'Сначала пройдите HTML + CSS и два месяца JavaScript. Здесь понадобится Node.js и редактор. На каждом шаге изменяйте свой накопительный проект.',
    start: 'Начать день',
    apply: 'Применяем',
    study: 'Изучаем',
    steps: 'Шаг за шагом',
    previous: 'Используем результат дня',
    guide: 'React · официальное руководство',
    practice: 'Практика этого дня',
    tests: 'Тесты и интервью',
    next: 'Следующий день',
  },
  en: {
    title: 'Time to understand React.',
    intro: 'Study the selected day, then apply it in code.',
    day: 'Day',
    selectDay: 'Select day',
    prepTitle: 'Getting ready for React',
    prepText:
      'Complete HTML + CSS and two months of JavaScript first. You will need Node.js and a code editor. Continue building on your project each day.',
    start: 'Start day',
    apply: 'Apply it',
    study: 'Learning',
    steps: 'Step by step',
    previous: 'Use the result from day',
    guide: 'React · official guide',
    practice: 'Practice for this day',
    tests: 'Tests and interview',
    next: 'Next day',
  },
  tg: {
    title: 'Вақти омӯхтани React расид.',
    intro: 'Мавзӯи рӯзи интихобшударо меомӯзем ва баъд дар код истифода мебарем.',
    day: 'Рӯз',
    selectDay: 'Интихоби рӯз',
    prepTitle: 'Омодагӣ ба React',
    prepText:
      'Аввал HTML + CSS ва ду моҳи JavaScript-ро гузаред. Node.js ва муҳаррири код лозим мешаванд. Ҳар рӯз лоиҳаи худро такмил диҳед.',
    start: 'Оғози рӯзи',
    apply: 'Амалия',
    study: 'Омӯзиш',
    steps: 'Қадам ба қадам',
    previous: 'Аз натиҷаи рӯзи гузашта истифода баред:',
    guide: 'React · дастури расмӣ',
    practice: 'Машқи ҳамин рӯз',
    tests: 'Санҷиш ва мусоҳиба',
    next: 'Рӯзи баъдӣ',
  },
  es: {
    title: 'Hora de entender React.',
    intro: 'Estudia el día elegido y luego aplícalo en código.',
    day: 'Día',
    selectDay: 'Elegir día',
    prepTitle: 'Preparación para React',
    prepText:
      'Antes completa HTML + CSS y dos meses de JavaScript. Necesitarás Node.js y un editor de código. Cada día sigue mejorando tu proyecto.',
    start: 'Empezar el día',
    apply: 'Aplícalo',
    study: 'Estudio',
    steps: 'Paso a paso',
    previous: 'Usa el resultado del día',
    guide: 'React · guía oficial',
    practice: 'Práctica de este día',
    tests: 'Pruebas y entrevista',
    next: 'Día siguiente',
  },
};

export function ReactDay({
  requestedDay,
  requestedMonth,
}: {
  requestedDay?: number;
  requestedMonth?: number;
}) {
  const state = useLearningStore(),
    copy = COPY[state.language],
    labels = DAY_UI[state.language as keyof typeof DAY_UI] || DAY_UI.en;
  const account = useAccount();
  const [tab, setTab] = useState<'learn' | 'practice'>('learn');
  const practiceAccess = usePracticeAccess();
  const flow = DAY_COPY[state.language];
  const ui = LEARNING_UI_COPY[state.language];
  const month = requestedMonth || (state.activeMonth === 2 ? 2 : 1);
  // Never invent a selected day on first course entry; plan selection is authoritative.
  const stored = state.drafts['react-selected-day']?.split(':').map(Number);
  const remembered =
    stored?.[0] === month && Number.isInteger(stored[1]) && stored[1] >= 0 && stored[1] <= 30
      ? stored[1]
      : undefined;
  const days = reactDayProgress(
    month,
    state.completedTopics,
    state.completedPractice,
    state.confirmedDays,
    state.daySubmissions,
  );
  const rememberedAvailable = days.find((item) => item.day === remembered);
  const day =
    requestedDay ??
    rememberedAvailable?.day ??
    days.find((item) => item.status === 'current')?.day ??
    (days.every((item) => item.status === 'done') ? days.at(-1)?.day : 1) ??
    1;
  const entry = days.find((item) => item.day === day);
  const monthOneBlocker =
    month === 2
      ? reactMonthDays(1).find((item) => !state.confirmedDays.includes(`1:${item.day}`))
      : undefined;
  const blocker =
    monthOneBlocker ??
    days.find((item) => item.day < day && !state.confirmedDays.includes(`${month}:${item.day}`));
  const reactTopics = LEARNING_TOPICS.filter((topic) => topic.month <= 2);
  const learned = reactTopics.filter((topic) => state.completedTopics.includes(topic.id)).length;
  const saveDraft = state.saveDraft,
    setPreferences = state.setPreferences;
  useEffect(() => {
    if (!blocker && day !== undefined && state.drafts['react-selected-day'] !== `${month}:${day}`)
      saveDraft('react-selected-day', `${month}:${day}`);
    if (state.activeMonth !== month) setPreferences({ activeMonth: month });
  }, [blocker, day, month, state.drafts, state.activeMonth, saveDraft, setPreferences]);
  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">
            React · {copy.month} {month}
            {day === undefined ? '' : ' · ' + labels.day + ' ' + day}
          </span>
          <h1>{labels.title}</h1>
          <p>
            {account.profile?.displayName ? account.profile.displayName + ', ' : ''}
            {labels.intro}
          </p>
        </div>
        <Link className="button subtle" href={`/plan/${month}`}>
          {copy.plan} <ArrowRight size={17} />
        </Link>
      </div>
      <div className="stats-grid">
        <div className="stat">
          <BookOpen size={19} />
          <span>{copy.progress}</span>
          <strong>
            {learned}
            <small> / {reactTopics.length}</small>
          </strong>
        </div>
        <div className="stat">
          <ListChecks size={19} />
          <span>{copy.readCount}</span>
          <strong>{state.studied.length}</strong>
        </div>
        <div className="stat">
          <Sparkles size={19} />
          <span>{copy.totalXP}</span>
          <strong>
            {awardedXP(state.awards)}
            <small> XP</small>
          </strong>
        </div>
      </div>
      <div className="react-day-content">
        {lessonTranslationNotice(state.language) && (
          <p role="note">{lessonTranslationNotice(state.language)}</p>
        )}
        {day === undefined ? (
          <article className="panel course-lesson">
            <h2>{labels.selectDay}</h2>
            <p>{labels.intro}</p>
            <Link className="button primary" href={`/plan/${month}`}>
              {copy.plan}
              <ArrowRight size={16} />
            </Link>
          </article>
        ) : day === 0 ? (
          <article className="panel course-lesson">
            <h2>{labels.prepTitle}</h2>
            <p>{labels.prepText}</p>
            <Link className="button primary" href={`/plan/${month}`}>
              {copy.plan} <ArrowRight size={16} />
            </Link>
          </article>
        ) : blocker ? (
          <article className="panel course-lesson">
            <p role="alert">{flow.blocked(blocker.day)}</p>
            <Link
              className="button primary"
              href={`/home?month=${monthOneBlocker ? 1 : month}&day=${blocker.day}`}
            >
              {ui.day} {blocker.day}
            </Link>
          </article>
        ) : entry ? (
          <>
            <div className="section-heading flex-wrap">
              <h2>
                {labels.day} {day} · {entry.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="badge">{entry.practiceOnly ? labels.apply : labels.study}</span>
                <BookmarkButton target={{ courseId: 'react', month, day }} title={entry.title} />
              </div>
            </div>
            {isInterviewDay(day) && !state.confirmedDays.includes(`${month}:${day}`) && (
              <p role="status" className="rounded-xl border border-border bg-primary-soft p-4">
                {flow.notice}
              </p>
            )}
            <div
              role="group"
              aria-label={copy.home}
              className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-muted p-1"
            >
              <button
                type="button"
                className={`button ${tab === 'learn' ? 'primary' : 'subtle'}`}
                aria-pressed={tab === 'learn'}
                onClick={() => setTab('learn')}
              >
                {copy.learn}
              </button>
              <button
                type="button"
                className={`button ${tab === 'practice' ? 'primary' : 'subtle'}`}
                aria-pressed={tab === 'practice'}
                title={
                  practiceAccess === 'locked' ? PRACTICE_LOCK_COPY[state.language].title : undefined
                }
                onClick={() => setTab('practice')}
              >
                {practiceAccess === 'locked' && <LockKeyhole size={16} aria-hidden="true" />}
                {copy.practice}
              </button>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {tab === 'learn' ? flow.learn : flow.practice}
            </p>
            {tab === 'practice' &&
              (practiceAccess === 'open' ? (
                <div className="grid gap-2">
                  {entry.topics.map((topic) => (
                    <Link
                      className="button subtle w-fit"
                      key={topic.id}
                      href={`/practice?month=${month}&topic=${topic.id}&day=${day}`}
                    >
                      {topicTitle(topic, state.language)}
                      <ArrowRight size={16} />
                    </Link>
                  ))}
                </div>
              ) : (
                <PracticeLock access={practiceAccess} />
              ))}
            {tab === 'learn' &&
              entry.topics.map((topic) => (
                <article className="panel course-lesson" key={topic.id}>
                  <h2>{topicTitle(topic, state.language)}</h2>
                  {topic.explanation.map((part, index) => (
                    <section className="day-explanation" key={index}>
                      <h3>{tr(part.title, state.contentLanguage)}</h3>
                      <p className="preserve-lines">{tr(part.text, state.contentLanguage)}</p>
                    </section>
                  ))}
                  {topic.code[0] && (
                    <pre tabIndex={0}>
                      <code>{topic.code[0]}</code>
                    </pre>
                  )}
                  <aside className="lesson-connections">
                    <h3>{labels.steps}</h3>
                    <ol>
                      {topic.flow.map((step, index) => (
                        <li key={index}>{tr(step, state.contentLanguage)}</li>
                      ))}
                    </ol>
                  </aside>
                  <p className="source-line">
                    <a href="https://react.dev/learn" target="_blank" rel="noreferrer">
                      {labels.guide}
                    </a>
                  </p>
                  <div className="button-row">
                    <button
                      className="button subtle"
                      disabled={state.completedTopics.includes(topic.id)}
                      onClick={() => state.completeTopic(topic.id)}
                    >
                      {state.completedTopics.includes(topic.id) ? copy.completed : copy.markLearned}
                    </button>
                  </div>
                </article>
              ))}
            <Link
              className="button subtle w-fit"
              href={`/answers?month=${month}&day=${day}`}
              transitionTypes={['nav-forward']}
            >
              {ui.answersInterview}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
