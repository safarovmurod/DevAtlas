import { agentMaterialLink, type AgentMessage } from '@/lib/agent/private-history';
import { LEARNING_UI_COPY, tutorErrorKey } from '@/lib/learning-ui-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';

const TUTOR_TIMEOUT_MS = 50_000;
const HISTORY_MESSAGES = 4;
const HISTORY_CHARACTERS = 600;

/** The tutor answers in Russian, Tajik or English; other interface languages map to the closest one. */
function tutorLanguage(language: InterfaceLocale) {
  if (language === 'uk') return 'ru';
  if (language === 'ja' || language === 'ko') return 'en';
  return language;
}

/** The last few real messages give the tutor context. Greetings, errors and notices are skipped. */
function recentHistory(messages: AgentMessage[]) {
  return messages
    .filter(
      (message) =>
        message.id !== 'greeting' && message.kind !== 'error' && message.kind !== 'notice',
    )
    .slice(-HISTORY_MESSAGES)
    .map((message) => ({
      role: message.sender === 'assistant' ? 'assistant' : 'user',
      content: message.text.slice(0, HISTORY_CHARACTERS),
    }));
}

/**
 * Sends a lesson question to /api/tutor and returns the assistant message to show.
 * Throws when the network fails, the request is cancelled or the signed-in
 * account changed while waiting (the answer must not reach another account).
 */
export async function askTutor({
  text,
  courseId,
  owner,
  history,
  language,
  signal,
}: {
  text: string;
  courseId: string;
  owner: string | null;
  history: AgentMessage[];
  language: InterfaceLocale;
  signal: AbortSignal;
}): Promise<AgentMessage> {
  const client = getSupabaseBrowserClient();
  const session = client ? (await getSessionWithTimeout(client)).data.session : null;
  if (signal.aborted) throw new Error('Cancelled');
  if ((session?.user?.id ?? null) !== owner) throw new Error('Account changed');

  const response = await fetch('/api/tutor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: 'Bearer ' + session.access_token } : {}),
    },
    body: JSON.stringify({
      action: 'ask',
      courseId,
      userText: text,
      isDeep: false,
      history: recentHistory(history),
      language: tutorLanguage(language),
    }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(TUTOR_TIMEOUT_MS)]),
  });
  const data = await response.json();
  const copy = LEARNING_UI_COPY[language];
  const id = crypto.randomUUID();

  if (!response.ok)
    return {
      id,
      sender: 'assistant',
      kind: 'error',
      text: copy[tutorErrorKey(response.status, data.error)],
    };
  if (typeof data.reply !== 'string' || !data.reply.trim())
    return { id, sender: 'assistant', kind: 'error', text: copy.tutorEmpty };

  const source = agentMaterialLink(data.source);
  return {
    id,
    sender: 'assistant',
    kind: data.mode === 'online' ? 'online' : source ? 'materials' : 'notice',
    text: data.reply,
    links: source ? [source] : [],
  };
}
