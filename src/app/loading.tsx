'use client';

import { AtlasLoader3D } from '@/components/learning/atlas-loader-3d';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

const LOADING_COPY: Record<InterfaceLocale, { title: string; subtitle: string }> = {
  ru: {
    title: 'Загрузка DevAtlas',
    subtitle: 'Подготавливаем рабочее пространство...',
  },
  tg: {
    title: 'Боргирии DevAtlas',
    subtitle: 'Фазои таълимӣ омода шуда истодааст...',
  },
  en: {
    title: 'Loading DevAtlas',
    subtitle: 'Preparing your learning workspace...',
  },
  es: {
    title: 'Cargando DevAtlas',
    subtitle: 'Preparando tu espacio de aprendizaje...',
  },
};

export default function Loading() {
  const language = useLearningStore((state) => state.language);
  const copy = LOADING_COPY[language] ?? LOADING_COPY.ru;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[55svh] w-full flex-col items-center justify-center px-4 py-12 text-center"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-400/15 bg-[var(--card,#0e1526)]/90 px-8 py-7 shadow-[0_20px_60px_-24px_rgba(2,6,23,0.45)]">
        <AtlasLoader3D size="lg" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-[var(--text,#f8fafc)]">{copy.title}</p>
          <p className="text-xs text-[var(--text-muted,#94a3b8)]">{copy.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
