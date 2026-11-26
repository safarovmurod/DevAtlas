'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { ERROR_COPY } from '@/lib/error-copy';
import { useLearningStore } from '@/stores/learning-store';
import './globals.css';

/** Replaces the root layout when the layout itself fails, so it renders its own document. */
export default function GlobalError({
  retry,
  reset,
}: {
  error: unknown;
  retry?: () => void;
  reset: () => void;
}) {
  const language = useLearningStore((state) => state.language);
  const copy = ERROR_COPY[language] ?? ERROR_COPY.ru;

  // The root layout's theme script did not run for this document.
  useEffect(() => {
    try {
      const theme = localStorage.getItem('devatlas-theme');
      if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme;
    } catch {
      // Storage can be unavailable; the light theme stays.
    }
  }, []);

  return (
    <html lang={language}>
      <body>
        <title>{copy.title}</title>
        <main className="mx-auto flex min-h-svh w-full max-w-[640px] items-center justify-center px-4 py-12">
          <section
            role="alert"
            aria-labelledby="global-error-heading"
            className="w-full rounded-2xl border border-slate-400/20 bg-[var(--card,#ffffff)] p-6 sm:p-8"
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[var(--accent,#4338ca)] uppercase">
              <AlertTriangle size={14} aria-hidden="true" />
              <span>{copy.eyebrow}</span>
            </div>
            <h1
              id="global-error-heading"
              className="text-2xl leading-tight font-bold text-[var(--text,#0f172a)] sm:text-3xl"
            >
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-2,#475569)] sm:text-base">
              {copy.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => (typeof retry === 'function' ? retry() : reset())}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
              >
                <RotateCcw size={16} aria-hidden="true" />
                <span>{copy.retry}</span>
              </button>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-400/25 px-5 py-2.5 text-sm font-semibold text-[var(--text,#0f172a)] no-underline hover:bg-slate-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
              >
                {copy.home}
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
