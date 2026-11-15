'use client';
import { useState } from 'react';
import { useLearningStore } from '@/stores/learning-store';
import type { InterfaceLocale } from '@/lib/locale';
import { useAccount } from './account-provider';

const GUEST_NAME: Record<InterfaceLocale, string> = {
  ru: 'Гость',
  tg: 'Меҳмон',
  en: 'Guest',
  es: 'Invitado',
};

export function AccountAvatar() {
  const { profile } = useAccount();
  const language = useLearningStore((state) => state.language);
  const [failed, setFailed] = useState<string | null>(null);
  const name = profile?.displayName || GUEST_NAME[language];
  const url = profile?.avatarUrl;
  return (
    <span className="avatar" aria-label={name}>
      {url && failed !== url /* User uploads, private signed URL. */ ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" onError={() => setFailed(url)} />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}
