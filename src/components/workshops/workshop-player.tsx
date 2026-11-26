'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Terminal } from 'lucide-react';
import { PageHeading } from '@/components/learning/page-heading';
import type { WorkshopCourse } from '@/content/workshops/workshops-data';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

const PLAYER_COPY: Record<
  InterfaceLocale,
  {
    back: string;
    templateLabel: string;
    copyCode: string;
    copied: string;
    trySandbox: string;
    practiceLabel: string;
    quizLabel: string;
    correct: string;
    wrong: string;
    completedBadge: string;
    nextLesson: string;
    allDone: string;
  }
> = {
  tg: {
    back: 'Ҳамаи воркшопҳо',
    templateLabel: 'Шаблон / Коди тайёр',
    copyCode: 'Нусхабардорӣ',
    copied: 'Нусхабардорӣ шуд!',
    trySandbox: 'Санҷиш дар Sandbox',
    practiceLabel: 'Супориши амалӣ',
    quizLabel: 'Санҷиши зуд барои бастани дарс',
    correct: '✅ Дуруст! Дарс хатм шуд.',
    wrong: '❌ Нодуруст — бори дигар интихоб кунед.',
    completedBadge: 'Хатмшуда',
    nextLesson: 'Дарси навбатӣ →',
    allDone: '🎉 Табрик! Шумо ҳамаи дарсҳои ин воркшопро хатм кардед!',
  },
  ru: {
    back: 'Все воркшопы',
    templateLabel: 'Готовый шаблон / код',
    copyCode: 'Скопировать',
    copied: 'Скопировано!',
    trySandbox: 'Проверить в Sandbox',
    practiceLabel: 'Практическое задание',
    quizLabel: 'Быстрая проверка для завершения урока',
    correct: '✅ Верно! Урок засчитан.',
    wrong: '❌ Неверно — попробуйте другой вариант.',
    completedBadge: 'Пройдено',
    nextLesson: 'Следующий урок →',
    allDone: '🎉 Поздравляем! Вы прошли все уроки этого воркшопа!',
  },
  en: {
    back: 'All workshops',
    templateLabel: 'Starter Template / Code',
    copyCode: 'Copy',
    copied: 'Copied!',
    trySandbox: 'Try in Sandbox',
    practiceLabel: 'Hands-on Task',
    quizLabel: 'Quick check to complete this lesson',
    correct: '✅ Correct! Lesson completed.',
    wrong: '❌ Not quite — try another answer.',
    completedBadge: 'Done',
    nextLesson: 'Next lesson →',
    allDone: '🎉 Great job! You completed every lesson in this workshop!',
  },
  es: {
    back: 'Todos los talleres',
    templateLabel: 'Plantilla / Código',
    copyCode: 'Copiar',
    copied: '¡Copiado!',
    trySandbox: 'Probar en Sandbox',
    practiceLabel: 'Tarea práctica',
    quizLabel: 'Comprobación rápida',
    correct: '✅ ¡Correcto! Lección completada.',
    wrong: '❌ Inténtalo de nuevo.',
    completedBadge: 'Hecho',
    nextLesson: 'Siguiente lección →',
    allDone: '🎉 ¡Completaste todas las lecciones de este taller!',
  },
};

export function WorkshopPlayer({ workshop }: { workshop: WorkshopCourse }) {
  const locale = useLearningStore((s) => s.language);
  const copy = PLAYER_COPY[locale];
  const storageKey = `devatlas-workshop-done-v1:${workshop.slug}`;

  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          queueMicrotask(() => setCompletedIds(parsed.filter((v): v is string => typeof v === 'string')));
        }
      }
    } catch {
      // Ignore storage errors.
    }
  }, [storageKey]);

  const lesson = workshop.lessons[activeIndex] ?? workshop.lessons[0];
  const isAllDone = workshop.lessons.every((item) => completedIds.includes(item.id));

  function answerQuiz(optionIdx: number) {
    setSelectedOption(optionIdx);
    if (optionIdx === lesson.quiz.correctIndex && !completedIds.includes(lesson.id)) {
      const next = [...completedIds, lesson.id];
      setCompletedIds(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore storage errors.
      }
    }
  }

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(lesson.templateCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures.
    }
  }

  return (
    <section className="space-y-6">
      <Link
        href="/workshops"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand no-underline hover:underline"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {copy.back}
      </Link>

      <PageHeading title={workshop.title[locale]} subtitle={workshop.summary[locale]} />

      {isAllDone && (
        <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          {copy.allDone}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
        {/* Lesson Sidebar */}
        <div className="space-y-2">
          {workshop.lessons.map((item, idx) => {
            const done = completedIds.includes(item.id);
            const active = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setSelectedOption(null);
                }}
                className={
                  'flex w-full items-center justify-between gap-2 rounded-2xl border p-3.5 text-left text-xs font-semibold transition-colors ' +
                  (active
                    ? 'border-primary bg-primary-soft text-brand'
                    : 'border-border bg-card text-foreground hover:border-primary/40')
                }
              >
                <span className="leading-5">{item.title[locale]}</span>
                {done && <CheckCircle2 size={16} className="shrink-0 text-emerald-500" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {/* Lesson Content */}
        <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-[var(--depth-1)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-xl font-bold text-foreground">{lesson.title[locale]}</h2>
            {completedIds.includes(lesson.id) && (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {copy.completedBadge}
              </span>
            )}
          </div>

          <p className="m-0 text-sm leading-7 text-foreground/90">{lesson.explanation[locale]}</p>

          <div className="overflow-hidden rounded-2xl border border-border bg-[#0b1020] text-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5 text-xs">
              <span className="font-mono text-sky-300">
                {copy.templateLabel}: {lesson.templateTitle}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void copyTemplate()}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white hover:bg-white/10"
                >
                  <Copy size={12} aria-hidden="true" />
                  {copied ? copy.copied : copy.copyCode}
                </button>
                <Link
                  href="/sandbox"
                  className="inline-flex items-center gap-1 rounded-lg border border-sky-400/35 bg-sky-500/15 px-2.5 py-1 text-xs text-sky-200 no-underline hover:bg-sky-500/25"
                >
                  <Terminal size={12} aria-hidden="true" />
                  {copy.trySandbox}
                </Link>
              </div>
            </div>
            <pre className="m-0 overflow-x-auto p-4 font-mono text-xs leading-6">
              {lesson.templateCode}
            </pre>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-primary-soft/35 p-4">
            <p className="m-0 text-xs font-bold text-brand">{copy.practiceLabel}</p>
            <p className="mt-1 mb-0 text-sm leading-6 text-foreground">
              {lesson.practiceTask[locale]}
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
            <p className="m-0 text-xs font-semibold text-muted-foreground">{copy.quizLabel}</p>
            <p className="m-0 text-sm font-bold text-foreground">{lesson.quiz.question[locale]}</p>
            <div className="grid gap-2">
              {lesson.quiz.options[locale].map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => answerQuiz(idx)}
                  className={
                    'rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors ' +
                    (selectedOption === idx
                      ? idx === lesson.quiz.correctIndex
                        ? 'border-emerald-500 bg-emerald-500/15 text-foreground'
                        : 'border-rose-500 bg-rose-500/15 text-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/50')
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
            {selectedOption !== null && (
              <p className="m-0 text-xs font-semibold text-foreground">
                {selectedOption === lesson.quiz.correctIndex ? copy.correct : copy.wrong}
              </p>
            )}
          </div>

          {activeIndex + 1 < workshop.lessons.length && (
            <button
              type="button"
              onClick={() => {
                setActiveIndex((prev) => prev + 1);
                setSelectedOption(null);
              }}
              className="button primary text-xs"
            >
              {copy.nextLesson}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
