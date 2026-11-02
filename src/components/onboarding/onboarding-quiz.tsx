'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Compass, Smartphone } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COURSE_CATALOG, courseName } from '@/content/courses/catalog';
import { ONBOARDING_QUESTIONS, buildPlan, courseRoute, onboardingLocale, saveOnboarding, type OnboardingAnswers, type OnboardingPlan } from '@/lib/onboarding';
import { DONT_KNOW, LEVEL_LABEL, PLACEMENT_BANK, placementDirection, scorePlacement, type PlacementResult } from '@/lib/placement';

const UI = {
  tg: { title: 'Роҳи омӯзиши худро ёбед', subtitle: '15 саволи кӯтоҳ. Дар охир курси мувофиқ ва графики рӯзона тайёр мешавад.', step: 'Савол', of: 'аз', back: 'Ақиб', next: 'Минбаъда', result: 'Нақшаи шумо', course: 'Курси тавсияшуда', perDay: 'дақиқа дар рӯз', perWeek: 'рӯз дар ҳафта', day: 'Як рӯзи омӯзиш', theory: 'Назария ва мисол', practice: 'Кодро бо даст навиштан', review: 'Такрор, бозӣ ва тест', finish: 'Тахминан тамом мешавад баъд аз', weeks: 'ҳафта', tight: 'Мӯҳлати интихобкардаатон кӯтоҳ аст. Вақти рӯзонаро зиёд кунед ё мӯҳлатро дарозтар гиред — шитоб ёддоштро суст мекунад.', phone: 'Назария ва тестҳоро дар телефон хондан мумкин аст, аммо барои практикаи код компютер лозим мешавад.', interview: 'Ҳар ҳафта як машқи интервью ба нақша гирифта шуд.', start: 'Курсро сар кардан', day0: 'Аввал Рӯзи 0: VS Code ва консол', login: 'Ворид шавед, то пешрафт нигоҳ дошта шавад', again: 'Аз нав ҷавоб додан' },
  ru: { title: 'Найдите свой путь обучения', subtitle: '15 коротких вопросов. В конце — подходящий курс и график на каждый день.', step: 'Вопрос', of: 'из', back: 'Назад', next: 'Далее', result: 'Ваш план', course: 'Рекомендованный курс', perDay: 'минут в день', perWeek: 'дней в неделю', day: 'Один учебный день', theory: 'Теория и пример', practice: 'Писать код руками', review: 'Повтор, игра и тест', finish: 'Примерно закончите через', weeks: 'нед.', tight: 'Выбранный срок слишком короткий. Добавьте времени в день или возьмите срок длиннее — спешка мешает запоминанию.', phone: 'Теорию и тесты можно проходить с телефона, но для практики кода понадобится компьютер.', interview: 'Каждую неделю в плане есть тренировка собеседования.', start: 'Начать курс', day0: 'Сначала День 0: VS Code и консоль', login: 'Войдите, чтобы сохранить прогресс', again: 'Пройти заново' },
  en: { title: 'Find your learning path', subtitle: '15 short questions. At the end you get a matching course and a daily schedule.', step: 'Question', of: 'of', back: 'Back', next: 'Next', result: 'Your plan', course: 'Recommended course', perDay: 'minutes a day', perWeek: 'days a week', day: 'One study day', theory: 'Theory and example', practice: 'Typing code by hand', review: 'Review, game and quiz', finish: 'Estimated finish in', weeks: 'weeks', tight: 'Your deadline is too short. Add daily time or allow longer — rushing hurts retention.', phone: 'You can read theory and take quizzes on a phone, but code practice needs a computer.', interview: 'A weekly interview practice is in your plan.', start: 'Start the course', day0: 'First, Day 0: VS Code and the console', login: 'Sign in to keep your progress', again: 'Answer again' },
};
const TEST_UI = {
  tg: { title: 'Санҷиши кӯтоҳи дониш', intro: '6 савол, тақрибан 3 дақиқа. Агар ҷавобро надонед, «Намедонам»-ро пахш кунед — ин ростқавлтарин роҳ барои ёфтани курси дуруст аст.', start: 'Сар кардан', skip: 'Гузаштан бе санҷиш', step: 'Савол', of: 'аз', level: 'Сатҳи шумо', score: 'Ҷавобҳои дуруст', self: 'Сатҳ аз рӯи ҷавобҳои шумо муайян шуд (санҷиш гузаронида нашуд).', lower: 'Шумо худро баландтар баҳо додед, аз он чи санҷиш нишон дод. Аз асос сар кардан баъдтар вақтро сарфа мекунад.', higher: 'Санҷиш нишон дод, ки шумо аз он чи фикр мекардед, бештар медонед — курси мушкилтар пешниҳод шуд.', pro: 'Ин курси Pro аст. Бепул метавонед аз курси пешинааш сар кунед:' },
  ru: { title: 'Короткая проверка знаний', intro: '6 вопросов, примерно 3 минуты. Если не знаете ответ, нажмите «Не знаю» — так курс подберётся точнее всего.', start: 'Начать', skip: 'Пропустить проверку', step: 'Вопрос', of: 'из', level: 'Ваш уровень', score: 'Верных ответов', self: 'Уровень определён по вашим ответам (проверка не проходилась).', lower: 'Вы оценили себя выше, чем показала проверка. Начать с основ сейчас — значит сэкономить время потом.', higher: 'Проверка показала, что вы знаете больше, чем думали, — предложен курс сложнее.', pro: 'Это курс Pro. Бесплатно можно начать с предыдущего курса:' },
  en: { title: 'Quick knowledge check', intro: '6 questions, about 3 minutes. If you do not know an answer, choose “I don’t know” — that finds the right course most accurately.', start: 'Start', skip: 'Skip the check', step: 'Question', of: 'of', level: 'Your level', score: 'Correct answers', self: 'Level estimated from your answers (the check was skipped).', lower: 'You rated yourself higher than the check showed. Starting with the basics now saves time later.', higher: 'The check shows you know more than you thought — a harder course is suggested.', pro: 'This is a Pro course. You can start free with the course before it:' },
};

const WEEKDAYS = { tg: ['Дш', 'Сш', 'Чш', 'Пш', 'Ҷм', 'Шб', 'Яш'], ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };
/** Study days are spread through the week so rest days fall between them. */
const STUDY_DAYS: Record<number, number[]> = { 3: [0, 2, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] };

export function OnboardingQuiz() {
  const store = useLearningStore();
  const locale = onboardingLocale(store.language);
  const ui = UI[locale];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  /** null = still on the 15 questions; -1 = test intro; 0..5 = test question. */
  const [testIndex, setTestIndex] = useState<number | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const question = ONBOARDING_QUESTIONS[index];
  const testUi = TEST_UI[locale];
  const bank = PLACEMENT_BANK[placementDirection(answers.direction)];

  function finish(finalAnswers: OnboardingAnswers, placement?: PlacementResult) {
    const result = buildPlan(finalAnswers, placement);
    saveOnboarding(finalAnswers, result);
    store.chooseCourse(result.courseId);
    setTestIndex(null);
    setPlan(result);
  }

  function choose(value: string) {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (question.id === 'language' && (value === 'tg' || value === 'ru' || value === 'en')) store.setPreferences({ language: value });
    if (index < ONBOARDING_QUESTIONS.length - 1) { setIndex(index + 1); return; }
    // Someone who has never written code gets nothing from a code test: their level is clear already.
    if (next.coded === 'never') { finish(next); return; }
    setTestIndex(-1);
  }

  function answerTest(option: number) {
    if (testIndex === null || testIndex < 0) return;
    const nextAnswers = { ...testAnswers, [bank[testIndex].id]: option };
    setTestAnswers(nextAnswers);
    if (testIndex < bank.length - 1) { setTestIndex(testIndex + 1); return; }
    finish(answers, scorePlacement(placementDirection(answers.direction), nextAnswers));
  }

  function restart() { setPlan(null); setIndex(0); setAnswers({}); setTestAnswers({}); setTestIndex(null); }

  if (plan) {
    const studyDays = STUDY_DAYS[plan.daysPerWeek] ?? STUDY_DAYS[5];
    const entry = COURSE_CATALOG.find(course => course.id === plan.courseId);
    const proPrerequisite = entry?.accessTier && entry.accessTier !== 'starter' ? entry.prerequisite : null;
    return <main className="onboarding">
      <Link href="/" className="public-brand"><span className="brand-icon"><Compass size={22} /></span>Dev<span>Atlas</span></Link>
      <section className="panel onboarding-card" aria-labelledby="onboarding-result">
        <p className="eyebrow">{ui.result}</p>
        <h1 id="onboarding-result">{ui.course}: {courseName(plan.courseId)}</h1>
        <p className="onboarding-level"><span className={'level-badge level-' + plan.level}>{testUi.level}: {LEVEL_LABEL[plan.level][locale]}</span>{plan.score && <span>{testUi.score}: {plan.score.correct} / {plan.score.total}</span>}</p>
        <p>{plan.reason[locale]}</p>
        {plan.levelSource === 'self' && <p className="muted small">{testUi.self}</p>}
        {plan.selfMismatch && <p className="warning-text">{testUi[plan.selfMismatch]}</p>}
        {proPrerequisite && <p className="warning-text">{testUi.pro} <Link href={courseRoute(proPrerequisite)}>{courseName(proPrerequisite)}</Link></p>}
        <p className="onboarding-pace"><CalendarDays size={18} /> {plan.minutesPerDay} {ui.perDay} · {plan.daysPerWeek} {ui.perWeek} · {ui.finish} {plan.weeks} {ui.weeks}</p>
        <div className="onboarding-week" role="list">{WEEKDAYS[locale].map((name, day) => <span role="listitem" key={name} className={studyDays.includes(day) ? 'active' : ''}>{name}<b>{studyDays.includes(day) ? plan.minutesPerDay + "'" : '—'}</b></span>)}</div>
        <h2>{ui.day}</h2>
        <ul className="onboarding-split">
          <li><b>{plan.split.theory}'</b> {ui.theory}</li>
          <li><b>{plan.split.practice}'</b> {ui.practice}</li>
          <li><b>{plan.split.review}'</b> {ui.review}</li>
        </ul>
        {plan.tight && <p className="warning-text">{ui.tight}</p>}
        {plan.phoneOnly && <p className="warning-text"><Smartphone size={16} /> {ui.phone}</p>}
        {plan.interviewWeekly && <p><CheckCircle2 size={16} /> {ui.interview}</p>}
        <div className="button-row">
          {plan.beginner ? <Link className="button primary" href="/start">{ui.day0} <ArrowRight size={16} /></Link> : null}
          <Link className={'button ' + (plan.beginner ? 'subtle' : 'primary')} href={courseRoute(plan.courseId)}>{ui.start} <ArrowRight size={16} /></Link>
          <Link className="button subtle" href="/login">{ui.login}</Link>
          <button className="button subtle" onClick={restart}>{ui.again}</button>
        </div>
      </section>
    </main>;
  }

  if (testIndex === -1) {
    return <main className="onboarding">
      <Link href="/" className="public-brand"><span className="brand-icon"><Compass size={22} /></span>Dev<span>Atlas</span></Link>
      <section className="panel onboarding-card" aria-labelledby="placement-title">
        <h1 id="placement-title">{testUi.title}</h1>
        <p>{testUi.intro}</p>
        <div className="button-row">
          <button className="button primary" onClick={() => setTestIndex(0)}>{testUi.start} <ArrowRight size={16} /></button>
          <button className="button subtle" onClick={() => finish(answers)}>{testUi.skip}</button>
        </div>
      </section>
    </main>;
  }

  if (testIndex !== null && testIndex >= 0) {
    const item = bank[testIndex];
    return <main className="onboarding">
      <Link href="/" className="public-brand"><span className="brand-icon"><Compass size={22} /></span>Dev<span>Atlas</span></Link>
      <section className="panel onboarding-card" aria-labelledby="placement-question">
        <p className="eyebrow">{testUi.title} · {testUi.step} {testIndex + 1} {testUi.of} {bank.length}</p>
        <div className="onboarding-progress" aria-hidden="true"><span style={{ width: `${(testIndex / bank.length) * 100}%` }} /></div>
        <h2 id="placement-question">{item.question[locale]}</h2>
        {item.code && <pre className="placement-code"><code>{item.code}</code></pre>}
        <div className="answer-options">
          {item.options.map((option, optionIndex) => <button key={optionIndex} className="answer-option" onClick={() => answerTest(optionIndex)}>{option[locale]}</button>)}
          <button className="answer-option dont-know" onClick={() => answerTest(3)}>{DONT_KNOW[locale]}</button>
        </div>
        {testIndex > 0 && <button className="button subtle onboarding-back" onClick={() => setTestIndex(testIndex - 1)}><ArrowLeft size={16} /> {ui.back}</button>}
      </section>
    </main>;
  }

  return <main className="onboarding">
    <Link href="/" className="public-brand"><span className="brand-icon"><Compass size={22} /></span>Dev<span>Atlas</span></Link>
    <section className="panel onboarding-card" aria-labelledby="onboarding-question">
      {index === 0 && <><h1>{ui.title}</h1><p className="muted">{ui.subtitle}</p></>}
      <p className="eyebrow">{ui.step} {index + 1} {ui.of} {ONBOARDING_QUESTIONS.length}</p>
      <div className="onboarding-progress" aria-hidden="true"><span style={{ width: `${(index / ONBOARDING_QUESTIONS.length) * 100}%` }} /></div>
      <h2 id="onboarding-question">{question.question[locale]}</h2>
      <div className="answer-options">{question.options.map(option => <button key={option.value} className={'answer-option' + (answers[question.id] === option.value ? ' selected' : '')} onClick={() => choose(option.value)}>{option.label[locale]}</button>)}</div>
      {index > 0 && <button className="button subtle onboarding-back" onClick={() => setIndex(index - 1)}><ArrowLeft size={16} /> {ui.back}</button>}
    </section>
  </main>;
}
