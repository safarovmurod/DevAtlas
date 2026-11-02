'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { PageHeading } from '@/components/learning/page-heading';
import { START_HERE_INTRO, START_HERE_TITLE, START_QUESTIONS, START_SECTIONS } from '@/content/start-here';
import { onboardingLocale } from '@/lib/onboarding';

const UI = {
  tg: { steps: 'Қадамҳо', check: 'Худро санҷед', next: 'Ба курси HTML + CSS', plan: 'Нақшаи шахсӣ (15 савол)', right: 'Дуруст!', wrong: 'Не. ' },
  ru: { steps: 'Шаги', check: 'Проверьте себя', next: 'К курсу HTML + CSS', plan: 'Личный план (15 вопросов)', right: 'Верно!', wrong: 'Нет. ' },
  en: { steps: 'Steps', check: 'Check yourself', next: 'Go to HTML + CSS', plan: 'Personal plan (15 questions)', right: 'Correct!', wrong: 'Not quite. ' },
};

export function StartHere() {
  const locale = onboardingLocale(useLearningStore(state => state.contentLanguage));
  const ui = UI[locale];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  return <div className="start-here">
    <PageHeading title={START_HERE_TITLE[locale]} subtitle={START_HERE_INTRO[locale]} back="/courses" />
    {START_SECTIONS.map(section => <section key={section.id} className="day-explanation" id={'start-' + section.id}>
      <h3>{section.title[locale]}</h3>
      <p className="preserve-lines">{section.body[locale]}</p>
      {section.steps && <ol className="start-steps" aria-label={ui.steps}>{section.steps.map((step, index) => <li key={index}>{step[locale]}</li>)}</ol>}
      {section.code && <pre><code>{section.code}</code></pre>}
    </section>)}
    <section className="panel start-check" aria-labelledby="start-check">
      <h3 id="start-check">{ui.check}</h3>
      {START_QUESTIONS.map(question => {
        const chosen = answers[question.id];
        return <div key={question.id} className="start-question">
          <p><strong>{question.question[locale]}</strong></p>
          <div className="answer-options">{question.options.map((option, index) => <button key={index} type="button" className={'answer-option' + (chosen === index ? ' selected' : '')} onClick={() => setAnswers({ ...answers, [question.id]: index })}>{option[locale]}</button>)}</div>
          {chosen !== undefined && <p role="status" className={chosen === question.correctIndex ? 'success-text' : 'warning-text'}>{chosen === question.correctIndex ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {chosen === question.correctIndex ? ui.right : ui.wrong}{question.explanation[locale]}</p>}
        </div>;
      })}
    </section>
    <div className="button-row"><Link className="button primary" href="/courses/html/plan">{ui.next} <ArrowRight size={16} /></Link><Link className="button subtle" href="/onboarding">{ui.plan}</Link></div>
  </div>;
}
