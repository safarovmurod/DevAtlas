'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useLearningStore } from '@/stores/learning-store';
import type { InterfaceLocale } from '@/lib/locale';
import styles from './notification-toaster.module.css';

export const POLL_MS = 10_000;
export const SHOW_MS = 8_000;
const TABLE = 'react_mentor_notifications';

const COPY: Record<InterfaceLocale, { title: string; close: string }> = {
  ru: { title: 'Сообщение от администрации', close: 'Закрыть' },
  tg: { title: 'Паём аз маъмурият', close: 'Пӯшидан' },
  en: { title: 'Message from the admin', close: 'Close' },
  es: { title: 'Mensaje del administrador', close: 'Cerrar' },
};

type Note = { id: string; body: string };

/**
 * Shows admin messages as toasts. Polls Supabase every 10 seconds only while the tab is
 * visible; RLS returns only this account's unread messages. A message is marked read
 * when it appears and disappears by itself after 8 seconds. Text is rendered as text.
 */
export function NotificationToaster({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const seen = useRef(new Set<string>());
  const language = useLearningStore((state) => state.language);
  const copy = COPY[language] ?? COPY.ru;
  // Stable, so each toast keeps its own 8-second timer when another one arrives.
  const dismiss = useCallback(
    (id: string) => setNotes((old) => old.filter((item) => item.id !== id)),
    [],
  );

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    let stopped = false;
    let running = false;

    async function poll() {
      if (!client || stopped || running || document.visibilityState !== 'visible') return;
      running = true;
      try {
        const { data, error } = await client
          .from(TABLE)
          .select('id,body')
          .is('read_at', null)
          .order('created_at', { ascending: true })
          .limit(3);
        if (error) {
          // Table not migrated yet or access refused: stop instead of retrying forever.
          if (['PGRST205', '42P01', '42501'].includes(error.code)) stopped = true;
          return;
        }
        const fresh = ((data ?? []) as Note[]).filter((note) => !seen.current.has(note.id));
        if (!fresh.length || stopped) return;
        for (const note of fresh) {
          seen.current.add(note.id);
          void client.rpc('react_mentor_mark_notification_read', { notification_id: note.id });
        }
        setNotes((old) => [...old, ...fresh].slice(-3));
      } catch {
        // Network errors are retried on the next tick.
      } finally {
        running = false;
      }
    }

    void poll();
    const timer = setInterval(() => void poll(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void poll();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId]);

  if (!notes.length) return null;
  return (
    <div className={styles.stack} aria-live="polite">
      {notes.map((note) => (
        <NoteToast
          key={note.id}
          note={note}
          title={copy.title}
          closeLabel={copy.close}
          onDone={dismiss}
        />
      ))}
    </div>
  );
}

function NoteToast({
  note,
  title,
  closeLabel,
  onDone,
}: {
  note: Note;
  title: string;
  closeLabel: string;
  onDone: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(note.id), SHOW_MS);
    return () => clearTimeout(timer);
  }, [note.id, onDone]);
  return (
    <div className={styles.toast} role="status">
      <div className={styles.head}>
        <strong>{title}</strong>
        <button
          type="button"
          className={styles.close}
          aria-label={closeLabel}
          onClick={() => onDone(note.id)}
        >
          ×
        </button>
      </div>
      <p className={styles.body}>{note.body}</p>
    </div>
  );
}
