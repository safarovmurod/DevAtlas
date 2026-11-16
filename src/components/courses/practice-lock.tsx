'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import type { PracticeAccess } from '@/lib/billing/practice-access';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

export const PRACTICE_LOCK_COPY: Record<
  InterfaceLocale,
  { title: string; text: string; plans: string; loading: string; note: string }
> = {
  ru: {
    title: 'Практика доступна в тарифе Pro',
    text: 'Урок и тест этого дня открыты. Задание с редактором и проверкой решения входит в Pro и Ultra.',
    plans: 'Посмотреть тарифы',
    loading: 'Проверяем доступ к практике…',
    note: 'Без практики день всё равно можно завершить.',
  },
  tg: {
    title: 'Практика дар тарифи Pro кушода аст',
    text: 'Дарс ва тести ин рӯз кушодаанд. Супориш бо редактор ва санҷиши ҳал ба Pro ва Ultra дохил аст.',
    plans: 'Дидани тарифҳо',
    loading: 'Дастрасӣ ба практика санҷида мешавад…',
    note: 'Бе практика ҳам рӯзро анҷом додан мумкин аст.',
  },
  en: {
    title: 'Practice is part of the Pro plan',
    text: "This day's lesson and quiz are open. The task with the editor and solution check comes with Pro and Ultra.",
    plans: 'View plans',
    loading: 'Checking practice access…',
    note: 'You can still finish the day without the practice.',
  },
  es: {
    title: 'La práctica forma parte del plan Pro',
    text: 'La lección y el test de este día están abiertos. La tarea con editor y comprobación de la solución viene con Pro y Ultra.',
    plans: 'Ver planes',
    loading: 'Comprobando el acceso a la práctica…',
    note: 'Puedes terminar el día sin la práctica.',
  },
};

/**
 * What a learner without the practice plan sees instead of the task and editor.
 * The editor is not rendered at all, so it cannot be reached with the keyboard or DOM.
 */
export function PracticeLock({ access }: { access: Exclude<PracticeAccess, 'open'> }) {
  const language = useLearningStore((state) => state.language);
  const copy = PRACTICE_LOCK_COPY[language];

  if (access === 'loading')
    return (
      <div
        role="status"
        aria-busy="true"
        className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-5"
      >
        <span className="sr-only">{copy.loading}</span>
        <span aria-hidden="true" className="h-4 w-2/5 animate-pulse rounded bg-muted" />
        <span aria-hidden="true" className="h-24 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );

  return (
    <section
      aria-labelledby="practice-lock-title"
      className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6"
      data-practice-locked
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-foreground">
          <Lock size={18} aria-hidden="true" />
        </span>
        <h3 id="practice-lock-title" className="text-base font-semibold text-foreground">
          {copy.title}
        </h3>
        <span className="badge">Pro</span>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{copy.text}</p>
      <p className="text-sm text-muted-foreground">{copy.note}</p>
      <div>
        <Link href="/plans" className="button primary">
          {copy.plans}
        </Link>
      </div>
    </section>
  );
}
