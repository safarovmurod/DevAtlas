'use client';

import { useEffect } from 'react';
import { useLearningStore } from '@/stores/learning-store';
import { persistManualLocale, type InterfaceLocale } from '@/lib/locale';

/** Shown when saved progress in this browser could not be read. */
const STORAGE_ERROR: Record<InterfaceLocale, string> = {
  ru: 'Не удалось прочитать сохранённые данные. Не очищайте браузер.',
  tg: 'Маълумоти нигоҳдошташуда хонда нашуд. Маълумоти браузерро тоза накунед.',
  en: 'Saved data could not be read. Do not clear your browser data.',
  es: 'No se pudieron leer los datos guardados. No borres los datos del navegador.',
};

export function LearningProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: InterfaceLocale;
}) {
  const language = useLearningStore((state) => state.language);
  const ready = useLearningStore((state) => state.ready);
  const chosenAt = useLearningStore((state) => state.preferenceClock.language);
  const theme = useLearningStore((state) => state.theme);
  const storageError = useLearningStore((state) => state.storageError);
  useEffect(() => {
    document.documentElement.lang = ready ? language : initialLocale;
    if (ready) {
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem('devatlas-theme', theme);
      } catch {
        /* Presentation can still follow the in-memory preference. */
      }
    }
  }, [language, theme, ready, initialLocale]);
  // Older account caches may predate the manual-choice cookie. Sync only an
  // explicit stored choice; automatic geo defaults must never become a lock.
  useEffect(() => {
    if (ready && chosenAt) persistManualLocale(language);
  }, [language, ready, chosenAt]);
  return (
    <>
      {storageError && (
        <div role="alert" className="storage-alert">
          {STORAGE_ERROR[language]}
        </div>
      )}
      {children}
    </>
  );
}
