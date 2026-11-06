'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import {
  ONBOARDING_QUESTIONS,
  buildPlan,
  onboardingLocale,
  saveOnboarding,
  type OnboardingAnswers,
  type OnboardingPlan,
} from '@/lib/onboarding';
import {
  DONT_KNOW,
  PLACEMENT_BANK,
  placementDirection,
  scorePlacement,
  type PlacementResult,
} from '@/lib/placement';
import { useLearningStore } from '@/stores/learning-store';
import { TEST_UI, UI } from './onboarding-copy';
import { OnboardingResult } from './onboarding-result';

/** Placement questions have three answers; index 3 is the extra «I don't know» button. */
const DONT_KNOW_INDEX = 3;

/** Every onboarding screen has the same logo link above its card. */
function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <main className="onboarding">
      <Link href="/" className="public-brand">
        <span className="brand-icon">
          <Compass size={22} />
        </span>
        Dev<span>Atlas</span>
      </Link>
      {children}
    </main>
  );
}

/**
 * Onboarding: 15 questions about goals and time, then an optional short
 * knowledge check, then a personal plan with a recommended course.
 */
export function OnboardingQuiz() {
  const store = useLearningStore();
  const locale = onboardingLocale(store.language);
  const ui = UI[locale];
  const testUi = TEST_UI[locale];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  /** null = still on the 15 questions; -1 = test intro; 0..5 = test question. */
  const [testIndex, setTestIndex] = useState<number | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const question = ONBOARDING_QUESTIONS[index];
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
    if (question.id === 'language' && (value === 'tg' || value === 'ru' || value === 'en'))
      store.setPreferences({ language: value });
    if (index < ONBOARDING_QUESTIONS.length - 1) {
      setIndex(index + 1);
      return;
    }
    // Someone who has never written code gets nothing from a code test: their level is clear already.
    if (next.coded === 'never') {
      finish(next);
      return;
    }
    setTestIndex(-1);
  }

  function answerTest(option: number) {
    if (testIndex === null || testIndex < 0) return;
    const nextAnswers = { ...testAnswers, [bank[testIndex].id]: option };
    setTestAnswers(nextAnswers);
    if (testIndex < bank.length - 1) {
      setTestIndex(testIndex + 1);
      return;
    }
    finish(answers, scorePlacement(placementDirection(answers.direction), nextAnswers));
  }

  function restart() {
    setPlan(null);
    setIndex(0);
    setAnswers({});
    setTestAnswers({});
    setTestIndex(null);
  }

  if (plan) {
    return (
      <OnboardingShell>
        <OnboardingResult plan={plan} locale={locale} onRestart={restart} />
      </OnboardingShell>
    );
  }

  if (testIndex === -1) {
    return (
      <OnboardingShell>
        <section className="panel onboarding-card" aria-labelledby="placement-title">
          <h1 id="placement-title">{testUi.title}</h1>
          <p>{testUi.intro}</p>
          <div className="button-row">
            <button className="button primary" onClick={() => setTestIndex(0)}>
              {testUi.start} <ArrowRight size={16} />
            </button>
            <button className="button subtle" onClick={() => finish(answers)}>
              {testUi.skip}
            </button>
          </div>
        </section>
      </OnboardingShell>
    );
  }

  if (testIndex !== null) {
    const item = bank[testIndex];
    return (
      <OnboardingShell>
        <section className="panel onboarding-card" aria-labelledby="placement-question">
          <p className="eyebrow">
            {testUi.title} · {testUi.step} {testIndex + 1} {testUi.of} {bank.length}
          </p>
          <div className="onboarding-progress" aria-hidden="true">
            <span style={{ width: `${(testIndex / bank.length) * 100}%` }} />
          </div>
          <h2 id="placement-question">{item.question[locale]}</h2>
          {item.code && (
            <pre className="placement-code">
              <code>{item.code}</code>
            </pre>
          )}
          <div className="answer-options">
            {item.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                className="answer-option"
                onClick={() => answerTest(optionIndex)}
              >
                {option[locale]}
              </button>
            ))}
            <button className="answer-option dont-know" onClick={() => answerTest(DONT_KNOW_INDEX)}>
              {DONT_KNOW[locale]}
            </button>
          </div>
          {testIndex > 0 && (
            <button
              className="button subtle onboarding-back"
              onClick={() => setTestIndex(testIndex - 1)}
            >
              <ArrowLeft size={16} /> {ui.back}
            </button>
          )}
        </section>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell>
      <section className="panel onboarding-card" aria-labelledby="onboarding-question">
        {index === 0 && (
          <>
            <h1>{ui.title}</h1>
            <p className="muted">{ui.subtitle}</p>
          </>
        )}
        <p className="eyebrow">
          {ui.step} {index + 1} {ui.of} {ONBOARDING_QUESTIONS.length}
        </p>
        <div className="onboarding-progress" aria-hidden="true">
          <span style={{ width: `${(index / ONBOARDING_QUESTIONS.length) * 100}%` }} />
        </div>
        <h2 id="onboarding-question">{question.question[locale]}</h2>
        <div className="answer-options">
          {question.options.map((option) => (
            <button
              key={option.value}
              className={
                'answer-option' + (answers[question.id] === option.value ? ' selected' : '')
              }
              onClick={() => choose(option.value)}
            >
              {option.label[locale]}
            </button>
          ))}
        </div>
        {index > 0 && (
          <button className="button subtle onboarding-back" onClick={() => setIndex(index - 1)}>
            <ArrowLeft size={16} /> {ui.back}
          </button>
        )}
      </section>
    </OnboardingShell>
  );
}
