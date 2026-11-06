'use client';

import { useEffect } from 'react';
import { useLearningStore } from '@/stores/learning-store';
import { persistManualLocale, type InterfaceLocale } from '@/lib/locale';

/** Shown when saved progress in this browser could not be read. */
const STORAGE_ERROR: Record<InterfaceLocale, string> = {
  ru: 'Не удалось прочитать сохранённые данные. Не очищайте браузер.',
  tg: 'Маълумоти нигоҳдошташуда хонда нашуд. Маълумоти браузерро тоза накунед.',
  en: 'Saved data could not be read. Do not clear your browser data.',
  uk: 'Не вдалося прочитати збережені дані. Не очищуйте браузер.',
  ja: '保存されたデータを読み込めませんでした。ブラウザーのデータを消去しないでください。',
  ko: '저장된 데이터를 읽지 못했습니다. 브라우저 데이터를 지우지 마세요.',
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
