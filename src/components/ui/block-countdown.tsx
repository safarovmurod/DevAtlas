'use client';

import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import type { InterfaceLocale } from '@/lib/locale';

const COPY: Record<
  InterfaceLocale,
  {
    remaining: string;
    unlockAt: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    expired: string;
    dateLocale: string;
  }
> = {
  tg: {
    remaining: 'То кушода шудани дастрасӣ монд:',
    unlockAt: 'Вақти кушодашавӣ:',
    days: 'рӯз',
    hours: 'соат',
    minutes: 'дақ',
    seconds: 'сон',
    expired: 'Мӯҳлат тамом шуд — саҳифаро нав кунед.',
    dateLocale: 'ru-RU',
  },
  ru: {
    remaining: 'До снятия ограничения осталось:',
    unlockAt: 'Разблокировка:',
    days: 'дн',
    hours: 'ч',
    minutes: 'мин',
    seconds: 'сек',
    expired: 'Срок истёк — обновите страницу.',
    dateLocale: 'ru-RU',
  },
  en: {
    remaining: 'Time until access unlocks:',
    unlockAt: 'Unlocks at:',
    days: 'd',
    hours: 'h',
    minutes: 'm',
    seconds: 's',
    expired: 'Block expired — refresh to continue.',
    dateLocale: 'en-US',
  },
  es: {
    remaining: 'Tiempo hasta desbloquear:',
    unlockAt: 'Se desbloquea:',
    days: 'd',
    hours: 'h',
    minutes: 'min',
    seconds: 's',
    expired: 'El bloqueo ha terminado — actualiza la página.',
    dateLocale: 'es-ES',
  },
};

/** Live 1-second ticking countdown timer showing exact days, hours, minutes, seconds and unlock date. */
export function BlockCountdown({
  blockedUntil,
  language,
  onExpire,
  compact = false,
}: {
  blockedUntil: string | null | undefined;
  language: InterfaceLocale;
  onExpire?: () => void;
  compact?: boolean;
}) {
  const targetMs = blockedUntil ? Date.parse(blockedUntil) : NaN;
  const [nowMs, setNowMs] = useState(() => Date.now());
  const copy = COPY[language] ?? COPY.ru;

  useEffect(() => {
    if (!Number.isFinite(targetMs)) return;
    if (Date.now() >= targetMs) {
      onExpire?.();
      return;
    }
    const id = window.setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      if (current >= targetMs) {
        window.clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [targetMs, onExpire]);

  if (!Number.isFinite(targetMs)) return null;
  const diffSec = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  let unlockFormatted = '';
  try {
    unlockFormatted = new Intl.DateTimeFormat(copy.dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(targetMs));
  } catch {
    unlockFormatted = blockedUntil ?? '';
  }

  return (
    <div
      role="timer"
      aria-live="off"
      className={
        'rounded-xl border border-destructive/30 bg-destructive/10 text-left text-foreground ' +
        (compact ? 'px-3 py-2 text-xs' : 'px-3.5 py-2.5 text-xs sm:text-sm')
      }
    >
      {diffSec <= 0 ? (
        <p className="m-0 font-medium text-success">{copy.expired}</p>
      ) : (
        <div className="grid gap-1">
          <div className="flex items-center gap-1.5 font-medium text-destructive">
            <Clock3 size={14} aria-hidden="true" className="shrink-0" />
            <span>{copy.remaining}</span>
          </div>
          <div className="font-mono text-sm font-bold tracking-tight tabular-nums sm:text-base">
            {days > 0 ? `${days} ${copy.days} · ` : ''}
            {pad(hours)} {copy.hours} : {pad(minutes)} {copy.minutes} : {pad(seconds)}{' '}
            {copy.seconds}
          </div>
          <p className="m-0 text-[11px] text-muted-foreground">
            {copy.unlockAt} <strong>{unlockFormatted}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
