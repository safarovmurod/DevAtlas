'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Compass, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { CourseIcon } from '@/components/courses/course-icon';
import {
  CAREER_QUESTIONS,
  recommendCareerTrack,
} from '@/lib/career/career-finder';
import { courseDisplayName } from '@/lib/catalog-copy';
import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

const COPY: Record<
  InterfaceLocale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    stepOf: (step: number, total: number) => string;
    resultBadge: string;
    roadmapTitle: string;
    startFirst: string;
    viewPlans: string;
    restart: string;
    shareTelegram: string;
    backHome: string;
  }
> = {
  tg: {
    eyebrow: 'ТЕСТИ РОЙГОНИ 2-ДАҚИҚАӢ',
    title: 'Кадом касби IT ба шумо мувофиқ аст?',
    subtitle:
      'Ба 4 саволи сода ҷавоб диҳед — DevAtlas самти беҳтарин ва нақшаи қадам ба қадами курсҳоро бароятон месозад.',
    stepOf: (step, total) => `Саволи ${step} аз ${total}`,
    resultBadge: 'Самти беҳтарин барои шумо',
    roadmapTitle: 'Нақшаи омӯзиши шумо дар DevAtlas',
    startFirst: 'Оғози курси аввал (Ройгон)',
    viewPlans: 'Дидани тарифҳои Pro / Ultra',
    restart: 'Аз нав гузаштан',
    shareTelegram: 'Натиҷаро ба Telegram фирист',
    backHome: 'Бозгашт ба саҳифаи асосӣ',
  },
  ru: {
    eyebrow: 'БЕСПЛАТНЫЙ ТЕСТ НА 2 МИНУТЫ',
    title: 'Какая IT-профессия подходит именно вам?',
    subtitle:
      'Ответьте на 4 коротких вопроса — DevAtlas подберёт лучшее направление и пошаговый маршрут курсов.',
    stepOf: (step, total) => `Вопрос ${step} из ${total}`,
    resultBadge: 'Лучшее направление для вас',
    roadmapTitle: 'Ваш пошаговый план в DevAtlas',
    startFirst: 'Начать первый курс (бесплатно)',
    viewPlans: 'Посмотреть тарифы Pro / Ultra',
    restart: 'Пройти заново',
    shareTelegram: 'Поделиться в Telegram',
    backHome: 'На главную',
  },
  en: {
    eyebrow: 'FREE 2-MINUTE QUIZ',
    title: 'Which Tech Career Fits You Best?',
    subtitle:
      'Answer 4 quick questions and DevAtlas will build a personalized learning roadmap from our real courses.',
    stepOf: (step, total) => `Question ${step} of ${total}`,
    resultBadge: 'Best-fit track for you',
    roadmapTitle: 'Your DevAtlas Step-by-Step Roadmap',
    startFirst: 'Start first course free',
    viewPlans: 'Explore Pro & Ultra',
    restart: 'Retake quiz',
    shareTelegram: 'Share on Telegram',
    backHome: 'Back to home',
  },
  es: {
    eyebrow: 'TEST GRATIS DE 2 MINUTOS',
    title: '¿Qué carrera tecnológica encaja contigo?',
    subtitle:
      'Responde 4 preguntas rápidas y DevAtlas generará tu ruta personalizada con nuestros cursos reales.',
    stepOf: (step, total) => `Pregunta ${step} de ${total}`,
    resultBadge: 'Tu mejor ruta',
    roadmapTitle: 'Tu plan paso a paso en DevAtlas',
    startFirst: 'Empezar primer curso gratis',
    viewPlans: 'Ver planes Pro / Ultra',
    restart: 'Repetir test',
    shareTelegram: 'Compartir en Telegram',
    backHome: 'Volver al inicio',
  },
};

function courseHref(courseId: CourseId): string {
  return courseId === 'react' ? '/plan/1' : `/courses/${courseId}/home`;
}

export function CareerFinderScreen() {
  const locale = useLearningStore((s) => s.language);
  const copy = COPY[locale];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const finished = step >= CAREER_QUESTIONS.length;
  const currentQuestion = CAREER_QUESTIONS[step];
  const result = useMemo(() => recommendCareerTrack(answers), [answers]);

  function choose(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setStep((prev) => prev + 1);
  }

  function reset() {
    setAnswers({});
    setStep(0);
  }

  const shareUrl =
    typeof window === 'undefined' ? '/career-test' : `${window.location.origin}/career-test`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
    `${result.title[locale]} — DevAtlas Career Finder`,
  )}`;

  return (
    <main className="min-h-[100dvh] bg-[#060913] px-4 py-10 text-white sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-bold tracking-[0.2em] text-sky-400 no-underline uppercase">
            DEVATLAS
          </Link>
          <Link href="/" className="text-xs font-medium text-slate-300 no-underline hover:text-white">
            {copy.backHome}
          </Link>
        </div>

        <div className="rounded-3xl border border-indigo-400/25 bg-[#0d1428] p-6 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85)] sm:p-10">
          {!finished && currentQuestion ? (
            <div className="space-y-6">
              <div>
                <p className="m-0 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] text-sky-400 uppercase">
                  <Compass size={14} aria-hidden="true" />
                  {copy.eyebrow}
                </p>
                <h1 className="m-0 mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {copy.title}
                </h1>
                <p className="mt-2 mb-0 text-sm text-slate-300">{copy.subtitle}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{copy.stepOf(step + 1, CAREER_QUESTIONS.length)}</span>
                  <span className="font-mono">
                    {Math.round(((step + 1) / CAREER_QUESTIONS.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-300"
                    style={{ width: `${((step + 1) / CAREER_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              <h2 className="m-0 text-lg font-semibold text-white">
                {currentQuestion.question[locale]}
              </h2>

              <div className="grid gap-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(currentQuestion.id, option.id)}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/5 px-5 py-4 text-left text-sm font-medium text-white transition-all hover:border-sky-400/60 hover:bg-indigo-500/15"
                  >
                    <span>{option.label[locale]}</span>
                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-300"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/35">
                <Sparkles size={14} aria-hidden="true" />
                {copy.resultBadge}
              </span>

              <div>
                <h1 className="m-0 text-2xl font-bold text-white sm:text-3xl">
                  {result.title[locale]}
                </h1>
                <p className="mt-2.5 mb-0 text-sm leading-6 text-slate-300">
                  {result.summary[locale]}
                </p>
                <p className="mt-2 mb-0 text-xs font-medium text-sky-300">
                  {result.firstIncomeHint[locale]}
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="m-0 text-sm font-semibold text-slate-200">{copy.roadmapTitle}</h2>
                <ol className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2">
                  {result.roadmap.map((courseId, index) => (
                    <li key={courseId}>
                      <Link
                        href={courseHref(courseId)}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a1020] p-3 text-white no-underline transition-colors hover:border-indigo-400/50"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 font-mono text-xs font-bold text-indigo-300">
                          {index + 1}
                        </span>
                        <CourseIcon courseId={courseId} size={24} />
                        <span className="truncate text-sm font-semibold">
                          {courseDisplayName(courseId, locale)}
                        </span>
                        <CheckCircle2 size={15} className="ml-auto shrink-0 text-emerald-400/70" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={courseHref(result.roadmap[0])}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white no-underline hover:bg-indigo-500"
                >
                  {copy.startFirst}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  href="/plans"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white no-underline hover:bg-white/10"
                >
                  {copy.viewPlans}
                </Link>
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-500/15 px-4 text-sm font-semibold text-sky-200 no-underline hover:bg-sky-500/25"
                >
                  <Share2 size={15} aria-hidden="true" />
                  {copy.shareTelegram}
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-transparent px-4 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <RotateCcw size={15} aria-hidden="true" />
                  {copy.restart}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
