'use client';

import { AtlasLoader3D } from '@/components/learning/atlas-loader-3d';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

const SR_LABEL: Record<InterfaceLocale, string> = {
  ru: 'Загрузка DevAtlas',
  tg: 'Боргирии DevAtlas',
  en: 'Loading DevAtlas',
  es: 'Cargando DevAtlas',
};

/** Pure 3D loading stage with screen-reader accessibility and zero boilerplate text clutter. */
export default function Loading() {
  const language = useLearningStore((state) => state.language);
  const label = SR_LABEL[language] ?? SR_LABEL.ru;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="flex min-h-[55svh] w-full items-center justify-center px-4 py-12"
    >
      <AtlasLoader3D size="lg" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
