'use client';

import Link from 'next/link';
import { ArrowRight, Compass, Home } from 'lucide-react';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

const NOT_FOUND_COPY: Record<
  InterfaceLocale,
  {
    eyebrow: string;
    title: string;
    description: string;
    courses: string;
    home: string;
  }
> = {
  ru: {
    eyebrow: '404 · Маршрут не найден',
    title: 'Страница не найдена',
    description:
      'Возможно, ссылка устарела или адрес был введён с опечаткой. Перейдите в каталог курсов или вернитесь на главную страницу DevAtlas.',
    courses: 'Перейти к курсам',
    home: 'На главную',
  },
  tg: {
    eyebrow: '404 · Суроға ёфт нашуд',
    title: 'Саҳифа ёфт нашуд',
    description:
      'Шояд пайванд кӯҳна шудааст ё суроға бо хато ворид гардидааст. Ба каталоги курсҳо гузаред ё ба саҳифаи асосии DevAtlas баргардед.',
    courses: 'Гузаштан ба курсҳо',
    home: 'Ба саҳифаи асосӣ',
  },
  en: {
    eyebrow: '404 · Route not found',
    title: 'Page not found',
    description:
      'The link may be outdated or the address may contain a typo. Explore the course catalog or return to the DevAtlas home page.',
    courses: 'Explore courses',
    home: 'Back to home',
  },
  es: {
    eyebrow: '404 · Ruta no encontrada',
    title: 'Página no encontrada',
    description:
      'Es posible que el enlace haya cambiado o que la dirección tenga un error. Explora el catálogo de cursos o vuelve a la página principal de DevAtlas.',
    courses: 'Explorar cursos',
    home: 'Volver al inicio',
  },
};

export default function NotFound() {
  const language = useLearningStore((state) => state.language);
  const copy = NOT_FOUND_COPY[language] ?? NOT_FOUND_COPY.ru;

  return (
    <div className="mx-auto flex min-h-[65svh] w-full max-w-[640px] items-center justify-center px-4 py-12">
      <section
        aria-labelledby="not-found-heading"
        className="w-full rounded-2xl border border-slate-400/20 bg-[var(--card,#0e1526)] p-6 shadow-[0_24px_64px_-24px_rgba(2,6,23,0.5)] sm:p-8"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent,#38bdf8)]/25 bg-[var(--primary-soft,rgba(79,70,229,0.15))] px-3.5 py-1 font-mono text-xs font-semibold tracking-wider text-[var(--accent,#38bdf8)] uppercase">
          <Compass size={14} aria-hidden="true" className="text-[var(--accent,#818cf8)]" />
          <span>{copy.eyebrow}</span>
        </div>

        <h1
          id="not-found-heading"
          className="text-2xl leading-tight font-bold tracking-[-0.02em] text-[var(--text,#f8fafc)] sm:text-3xl"
        >
          {copy.title}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[var(--text-2,#cbd5e1)] sm:text-base">
          {copy.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/courses"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white no-underline ring-1 ring-inset ring-white/15 transition-colors hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
          >
            <span>{copy.courses}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-400/25 bg-transparent px-5 py-2.5 text-sm font-semibold text-[var(--text,#f8fafc)] no-underline transition-colors hover:border-[#38bdf8]/45 hover:bg-slate-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
          >
            <Home size={16} aria-hidden="true" />
            <span>{copy.home}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
