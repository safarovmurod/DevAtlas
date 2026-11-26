'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Flame, Sparkles } from 'lucide-react';
import { PageHeading } from '@/components/learning/page-heading';
import { WORKSHOPS } from '@/content/workshops/workshops-data';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

const HUB_COPY: Record<
  InterfaceLocale,
  {
    title: string;
    subtitle: string;
    lessonsCount: (n: number) => string;
    startBtn: string;
    bannerText: string;
    openSandbox: string;
    openPrograms: string;
  }
> = {
  tg: {
    title: 'Дарсҳои нав бо талаботи баланд (Воркшопҳо)',
    subtitle:
      '6 самти пурхаридортарин дар бозори имрӯза: Telegram-ботҳо, Фриланс, AI барои бизнес, No-Code сайтҳо, Excel+AI ва Барномасозӣ барои кӯдакон.',
    lessonsCount: (n) => `${n} дарси интерактивӣ`,
    startBtn: 'Оғози дарс',
    bannerText: 'Ҳар дарс дорои шаблон/коди тайёр, тест ва супориши амалӣ мебошад.',
    openSandbox: 'Кушодани Code Sandbox',
    openPrograms: 'Марафонҳо ва B2B',
  },
  ru: {
    title: 'Новые востребованные курсы (Воркшопы)',
    subtitle:
      '6 самых актуальных направлений рынка: Telegram-боты, Фриланс, AI для бизнеса, No-Code сайты, Excel+AI и Программирование для детей.',
    lessonsCount: (n) => `${n} интерактивных урока`,
    startBtn: 'Открыть курс',
    bannerText: 'В каждом уроке: готовые шаблоны кода/промптов, мини-тест и практическая задача.',
    openSandbox: 'Открыть Code Sandbox',
    openPrograms: 'Буткемпы и B2B',
  },
  en: {
    title: 'High-Demand Express Workshops',
    subtitle:
      '6 market-ready practical tracks: Telegram Bots, Freelancing, No-Code AI Automation, Fast Websites, Excel+AI, and Coding for Kids.',
    lessonsCount: (n) => `${n} interactive lessons`,
    startBtn: 'Start workshop',
    bannerText: 'Every lesson includes copyable templates/code, an instant quiz check, and a real task.',
    openSandbox: 'Open Code Sandbox',
    openPrograms: 'Bootcamps & B2B',
  },
  es: {
    title: 'Talleres Express de Alta Demanda',
    subtitle:
      '6 rutas prácticas listas para el mercado: Bots de Telegram, Freelance, IA para negocios, Sitios No-Code, Excel+IA y Niños.',
    lessonsCount: (n) => `${n} lecciones interactivas`,
    startBtn: 'Empezar taller',
    bannerText: 'Cada lección incluye plantillas copiables, test interactivo y reto práctico.',
    openSandbox: 'Abrir Code Sandbox',
    openPrograms: 'Bootcamps y B2B',
  },
};

export function WorkshopsHub() {
  const locale = useLearningStore((s) => s.language);
  const copy = HUB_COPY[locale];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeading title={copy.title} subtitle={copy.subtitle} />
        <div className="flex flex-wrap gap-2">
          <Link href="/sandbox" className="button subtle text-xs no-underline">
            {copy.openSandbox}
          </Link>
          <Link href="/programs" className="button subtle text-xs no-underline">
            {copy.openPrograms}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary-soft/40 px-4 py-3 text-xs font-medium text-foreground">
        <Flame size={16} className="shrink-0 text-brand" aria-hidden="true" />
        <span>{copy.bannerText}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {WORKSHOPS.map((workshop) => (
          <div
            key={workshop.slug}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--depth-1)] transition-colors hover:border-primary/45"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-brand">
                <Sparkles size={12} aria-hidden="true" />
                {workshop.badge[locale]}
              </span>
              <span className="text-xs text-muted-foreground">{workshop.durationLabel[locale]}</span>
            </div>

            <h2 className="mt-3 mb-0 text-base font-bold text-foreground">
              {workshop.title[locale]}
            </h2>
            <p className="mt-2 mb-4 text-xs leading-5 text-muted-foreground">
              {workshop.summary[locale]}
            </p>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen size={14} aria-hidden="true" />
                {copy.lessonsCount(workshop.lessons.length)}
              </span>
              <Link
                href={`/workshops/${workshop.slug}`}
                className="button primary inline-flex items-center gap-1.5 text-xs no-underline"
              >
                {copy.startBtn}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
