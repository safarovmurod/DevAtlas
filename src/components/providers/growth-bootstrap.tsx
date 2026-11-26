'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import type { InterfaceLocale } from '@/lib/locale';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type TelegramWebApp = {
  ready?: () => void;
  expand?: () => void;
  initDataUnsafe?: { start_param?: string };
};

const INSTALL_COPY: Record<InterfaceLocale, { label: string; dismiss: string }> = {
  tg: { label: 'Насб ба телефон (App)', dismiss: 'Пӯшидан' },
  ru: { label: 'Установить приложение', dismiss: 'Закрыть' },
  en: { label: 'Install DevAtlas App', dismiss: 'Dismiss' },
  es: { label: 'Instalar DevAtlas App', dismiss: 'Cerrar' },
};

const REF_STORAGE_KEY = 'devatlas-captured-ref-v1';
const DISMISS_KEY = 'devatlas-pwa-dismissed-v1';

export function GrowthBootstrap() {
  const locale = useLearningStore((s) => s.language);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Telegram Mini App handshake
    const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready?.();
        tg.expand?.();
      } catch {
        // Ignore Telegram bridge runtime errors outside Telegram.
      }
    }

    // 2. Capture referral code from URL ?ref= or Telegram start_param
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = (params.get('ref') || tg?.initDataUnsafe?.start_param || '').trim();
      if (/^[a-zA-Z0-9_-]{2,32}$/.test(ref)) {
        const previous = window.localStorage.getItem(REF_STORAGE_KEY);
        if (previous !== ref) {
          window.localStorage.setItem(REF_STORAGE_KEY, ref);
          const visitorHash = `v_${Math.random().toString(36).slice(2, 12)}`;
          void fetch('/api/referrals/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: ref,
              landingPath: window.location.pathname,
              visitorHash,
            }),
          }).catch(() => undefined);
        }
      }
    } catch {
      // Ignore storage/URL errors.
    }

    // 3. Register PWA Service Worker
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    // 4. Listen for PWA Install prompt
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') {
        queueMicrotask(() => setDismissed(true));
      }
    } catch {
      // Ignore sessionStorage errors.
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!installEvent || dismissed) return null;

  const copy = INSTALL_COPY[locale];

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt().catch(() => undefined);
    setInstallEvent(null);
  }

  function handleDismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Ignore storage errors.
    }
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-2xl border border-primary/35 bg-card px-3.5 py-2.5 text-foreground shadow-lg sm:bottom-5">
      <button
        type="button"
        onClick={() => void handleInstall()}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
      >
        <Download size={14} aria-hidden="true" />
        {copy.label}
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={copy.dismiss}
        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
