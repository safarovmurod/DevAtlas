import { agentMaterialLink, type AgentLink, type AgentReply } from '@/lib/agent/agent-reply';
import { LEARNING_UI_COPY, tutorErrorKey } from '@/lib/learning-ui-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';

const TUTOR_TIMEOUT_MS = 50_000;
const HISTORY_MESSAGES = 4;
const HISTORY_CHARACTERS = 600;

export interface SpokenTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** The tutor answers in the interface language: Russian, Tajik, English or Spanish. */
export function tutorLanguage(language: InterfaceLocale): InterfaceLocale {
  return language;
}

/**
 * Sends a spoken question to /api/tutor and returns the reply to speak.
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
  history: SpokenTurn[];
  language: InterfaceLocale;
  signal: AbortSignal;
}): Promise<AgentReply> {
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
      channel: 'voice',
      courseId,
      userText: text,
      isDeep: false,
      history: history.slice(-HISTORY_MESSAGES).map((turn) => ({
        role: turn.role,
        content: turn.content.slice(0, HISTORY_CHARACTERS),
      })),
      language: tutorLanguage(language),
    }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(TUTOR_TIMEOUT_MS)]),
  });
  const data = await response.json();
  const copy = LEARNING_UI_COPY[language];

  if (!response.ok) {
    if (data?.error === 'tutor_blocked' && typeof data.reply === 'string' && data.reply.trim()) {
      return { kind: 'error', text: data.reply, links: [] };
    }
    return { kind: 'error', text: copy[tutorErrorKey(response.status, data.error)], links: [] };
  }
  if (typeof data.reply !== 'string' || !data.reply.trim())
    return { kind: 'error', text: copy.tutorEmpty, links: [] };

  const links: AgentLink[] = [];
  const lessonLink =
    data.source && typeof data.source === 'object' && 'lessonHref' in data.source
      ? agentMaterialLink({ href: data.source.lessonHref, title: data.source.title })
      : null;
  const sourceLink = agentMaterialLink(data.source);
  if (lessonLink) links.push(lessonLink);
  if (sourceLink && !links.some((item) => item.href === sourceLink.href)) links.push(sourceLink);

  return {
    kind: data.warning
      ? 'notice'
      : data.mode === 'online'
        ? 'online'
        : links.length
          ? 'materials'
          : 'notice',
    text: data.reply,
    links,
  };
}
