'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

const ERROR_COPY: Record<
  InterfaceLocale,
  {
    eyebrow: string;
    title: string;
    description: string;
    reference: string;
    retry: string;
    home: string;
    catalog: string;
  }
> = {
  ru: {
    eyebrow: 'Сбой страницы',
    title: 'Что-то пошло не так',
    description:
      'Во время открытия раздела возникла непредвиденная ошибка. Ваш прогресс в безопасности — попробуйте обновить раздел или вернитесь на главную.',
    reference: 'Код обращения',
    retry: 'Повторить попытку',
    home: 'На главную',
    catalog: 'Каталог курсов',
  },
  tg: {
    eyebrow: 'Хатогии саҳифа',
    title: 'Хатогии ғайричашмдошт рух дод',
    description:
      'Ҳангоми кушодани ин бахш мушкил ба миён омад. Пешрафти шумо бехатар аст — дубора кӯшиш кунед ё ба саҳифаи асосӣ баргардед.',
    reference: 'Рамзи муроҷиат',
    retry: 'Аз нав кӯшиш кардан',
    home: 'Ба саҳифаи асосӣ',
    catalog: 'Каталоги курсҳо',
  },
  en: {
    eyebrow: 'Page interruption',
    title: 'Something went wrong',
    description:
      'An unexpected error occurred while opening this view. Your learning progress is safe — try reloading this section or return home.',
    reference: 'Reference ID',
    retry: 'Try again',
    home: 'Back to home',
    catalog: 'Course catalog',
  },
  es: {
    eyebrow: 'Interrupción de página',
    title: 'Algo salió mal',
    description:
      'Ocurrió un error inesperado al abrir esta sección. Tu progreso está a salvo: intenta recargar o vuelve al inicio.',
    reference: 'Código de referencia',
    retry: 'Intentar de nuevo',
    home: 'Volver al inicio',
    catalog: 'Catálogo de cursos',
  },
};

function getSafeDigest(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const digest = (error as { digest?: unknown }).digest;
  if (typeof digest !== 'string') return null;
  const clean = digest.trim();
  return /^[a-zA-Z0-9_-]{4,64}$/.test(clean) ? clean : null;
}

export default function ErrorBoundaryPage({
  error,
  retry,
  reset,
}: {
  error: unknown;
  retry?: () => void;
  reset: () => void;
}) {
  const language = useLearningStore((state) => state.language);
  const copy = ERROR_COPY[language] ?? ERROR_COPY.ru;
  const digest = getSafeDigest(error);
  const handleRetry = () => {
    if (typeof retry === 'function') retry();
    else reset();
  };

  return (
    <div className="mx-auto flex min-h-[65svh] w-full max-w-[640px] items-center justify-center px-4 py-12">
      <section
        role="alert"
        aria-labelledby="app-error-heading"
        className="w-full rounded-2xl border border-slate-400/20 bg-[var(--card,#0e1526)] p-6 shadow-[0_24px_64px_-24px_rgba(2,6,23,0.5)] sm:p-8"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent,#818cf8)]/25 bg-[var(--primary-soft,rgba(79,70,229,0.15))] px-3.5 py-1 text-xs font-semibold tracking-wider text-[var(--accent,#818cf8)] uppercase">
          <AlertTriangle size={14} aria-hidden="true" className="text-[var(--accent,#38bdf8)]" />
          <span>{copy.eyebrow}</span>
        </div>

        <h1
          id="app-error-heading"
          className="text-2xl leading-tight font-bold tracking-[-0.02em] text-[var(--text,#f8fafc)] sm:text-3xl"
        >
          {copy.title}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[var(--text-2,#cbd5e1)] sm:text-base">
          {copy.description}
        </p>

        {digest && (
          <p className="mt-3 font-mono text-xs text-[var(--text-muted,#94a3b8)]">
            {copy.reference}: {digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>{copy.retry}</span>
          </button>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-400/25 bg-transparent px-5 py-2.5 text-sm font-semibold text-[var(--text,#f8fafc)] no-underline transition-colors hover:border-[#38bdf8]/45 hover:bg-slate-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
          >
            <Home size={16} aria-hidden="true" />
            <span>{copy.home}</span>
          </Link>

          <Link
            href="/courses"
            className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--accent,#38bdf8)] no-underline transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
          >
            {copy.catalog}
          </Link>
        </div>
      </section>
    </div>
  );
}
