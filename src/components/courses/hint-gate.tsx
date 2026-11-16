'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Lightbulb, Lock } from 'lucide-react';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

/** A hint opens three minutes after the task was first shown. */
export const HINT_DELAY_MS = 3 * 60 * 1000;

const COPY: Record<InterfaceLocale, { hint: string; in: string }> = {
  ru: { hint: 'Подсказка', in: 'Подсказка через' },
  tg: { hint: 'Ишора', in: 'Ишора баъд аз' },
  en: { hint: 'Hint', in: 'Hint in' },
  es: { hint: 'Pista', in: 'Pista en' },
};

/** "2:41" for the remaining milliseconds. */
export function formatCountdown(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** When the task was first opened in this tab; kept across reloads so a refresh does not reset it. */
export function taskStartedAt(taskId: string, now = Date.now()) {
  const key = 'devatlas-task-start:' + taskId;
  try {
    const saved = Number(sessionStorage.getItem(key));
    if (Number.isFinite(saved) && saved > 0 && saved <= now) return saved;
    sessionStorage.setItem(key, String(now));
  } catch {
    // Blocked storage: the timer starts now.
  }
  return now;
}

const block = (event: React.SyntheticEvent) => event.preventDefault();

/**
 * Locked hint with a visible countdown. Once open, the text cannot be selected, copied or
 * dragged. This only discourages copying: a browser can never fully prevent it.
 */
export function HintGate({
  taskId,
  label,
  children,
}: {
  taskId: string;
  label?: string;
  children: ReactNode;
}) {
  const copy = COPY[useLearningStore((state) => state.language)];
  const [remaining, setRemaining] = useState(HINT_DELAY_MS);

  useEffect(() => {
    const startedAt = taskStartedAt(taskId);
    const tick = () => setRemaining(startedAt + HINT_DELAY_MS - Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [taskId]);

  const title = label ?? copy.hint;

  if (remaining > 0)
    return (
      <p
        className="m-0 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground"
        role="timer"
        aria-live="off"
      >
        <Lock size={15} aria-hidden="true" />
        {copy.in} {formatCountdown(remaining)}
      </p>
    );

  return (
    <details className="practice-hint">
      <summary className="inline-flex items-center gap-1.5">
        <Lightbulb size={15} aria-hidden="true" />
        {title}
      </summary>
      <div
        className="select-none [-webkit-touch-callout:none]"
        data-protected-hint=""
        onCopy={block}
        onCut={block}
        onContextMenu={block}
        onDragStart={block}
      >
        {children}
      </div>
    </details>
  );
}
