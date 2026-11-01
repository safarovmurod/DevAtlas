'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Compass, Smartphone } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { courseName } from '@/content/courses/catalog';
import { ONBOARDING_QUESTIONS, buildPlan, courseRoute, onboardingLocale, saveOnboarding, type OnboardingAnswers, type OnboardingPlan } from '@/lib/onboarding';

const UI = {
  tg: { title: 'Роҳи омӯзиши худро ёбед', subtitle: '15 саволи кӯтоҳ. Дар охир курси мувофиқ ва графики рӯзона тайёр мешавад.', step: 'Савол', of: 'аз', back: 'Ақиб', next: 'Минбаъда', result: 'Нақшаи шумо', course: 'Курси тавсияшуда', perDay: 'дақиқа дар рӯз', perWeek: 'рӯз дар ҳафта', day: 'Як рӯзи омӯзиш', theory: 'Назария ва мисол', practice: 'Кодро бо даст навиштан', review: 'Такрор, бозӣ ва тест', finish: 'Тахминан тамом мешавад баъд аз', weeks: 'ҳафта', tight: 'Мӯҳлати интихобкардаатон кӯтоҳ аст. Вақти рӯзонаро зиёд кунед ё мӯҳлатро дарозтар гиред — шитоб ёддоштро суст мекунад.', phone: 'Назария ва тестҳоро дар телефон хондан мумкин аст, аммо барои практикаи код компютер лозим мешавад.', interview: 'Ҳар ҳафта як машқи интервью ба нақша гирифта шуд.', start: 'Курсро сар кардан', day0: 'Аввал Рӯзи 0: VS Code ва консол', login: 'Ворид шавед, то пешрафт нигоҳ дошта шавад', again: 'Аз нав ҷавоб додан' },
  ru: { title: 'Найдите свой путь обучения', subtitle: '15 коротких вопросов. В конце — подходящий курс и график на каждый день.', step: 'Вопрос', of: 'из', back: 'Назад', next: 'Далее', result: 'Ваш план', course: 'Рекомендованный курс', perDay: 'минут в день', perWeek: 'дней в неделю', day: 'Один учебный день', theory: 'Теория и пример', practice: 'Писать код руками', review: 'Повтор, игра и тест', finish: 'Примерно закончите через', weeks: 'нед.', tight: 'Выбранный срок слишком короткий. Добавьте времени в день или возьмите срок длиннее — спешка мешает запоминанию.', phone: 'Теорию и тесты можно проходить с телефона, но для практики кода понадобится компьютер.', interview: 'Каждую неделю в плане есть тренировка собеседования.', start: 'Начать курс', day0: 'Сначала День 0: VS Code и консоль', login: 'Войдите, чтобы сохранить прогресс', again: 'Пройти заново' },
  en: { title: 'Find your learning path', subtitle: '15 short questions. At the end you get a matching course and a daily schedule.', step: 'Question', of: 'of', back: 'Back', next: 'Next', result: 'Your plan', course: 'Recommended course', perDay: 'minutes a day', perWeek: 'days a week', day: 'One study day', theory: 'Theory and example', practice: 'Typing code by hand', review: 'Review, game and quiz', finish: 'Estimated finish in', weeks: 'weeks', tight: 'Your deadline is too short. Add daily time or allow longer — rushing hurts retention.', phone: 'You can read theory and take quizzes on a phone, but code practice needs a computer.', interview: 'A weekly interview practice is in your plan.', start: 'Start the course', day0: 'First, Day 0: VS Code and the console', login: 'Sign in to keep your progress', again: 'Answer again' },
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
  const question = ONBOARDING_QUESTIONS[index];

  function choose(value: string) {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (question.id === 'language' && (value === 'tg' || value === 'ru' || value === 'en')) store.setPreferences({ language: value });
    if (index < ONBOARDING_QUESTIONS.length - 1) { setIndex(index + 1); return; }
    const result = buildPlan(next);
    saveOnboarding(next, result);
    store.chooseCourse(result.courseId);
    setPlan(result);
  }

  if (plan) {
    const studyDays = STUDY_DAYS[plan.daysPerWeek] ?? STUDY_DAYS[5];
    return <main className="onboarding">
      <Link href="/" className="public-brand"><span className="brand-icon"><Compass size={22} /></span>Dev<span>Atlas</span></Link>
      <section className="panel onboarding-card" aria-labelledby="onboarding-result">
        <p className="eyebrow">{ui.result}</p>
        <h1 id="onboarding-result">{ui.course}: {courseName(plan.courseId)}</h1>
        <p>{plan.reason[locale]}</p>
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
          <button className="button subtle" onClick={() => { setPlan(null); setIndex(0); setAnswers({}); }}>{ui.again}</button>
        </div>
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
