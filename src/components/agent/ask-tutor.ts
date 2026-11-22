import { agentMaterialLink, type AgentLink, type AgentReply } from '@/lib/agent/agent-reply';
import { LEARNING_UI_COPY, tutorErrorKey } from '@/lib/learning-ui-copy';
import type { InterfaceLocale } from '@/lib/locale';
import type { TutorStrikeNotice } from '@/lib/tutor/shared';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';

const TUTOR_TIMEOUT_MS = 50_000;
const HISTORY_MESSAGES = 4;
const HISTORY_CHARACTERS = 600;

export interface SpokenTurn {
  role: 'user' | 'assistant';
  content: string;
}

export type VoiceTutorReply = AgentReply & {
  warning?: TutorStrikeNotice;
  primaryHref?: string | null;
};

/** The tutor answers in the interface language: Russian, Tajik, English or Spanish. */
export function tutorLanguage(language: InterfaceLocale): InterfaceLocale {
  return language;
}

/**
 * Sends a spoken question to /api/tutor and returns the reply to speak, full text with code
 * examples, links, and any strike/block warning metadata.
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
}): Promise<VoiceTutorReply> {
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
  const warning =
    data?.warning && typeof data.warning === 'object'
      ? (data.warning as TutorStrikeNotice)
      : undefined;

  if (!response.ok) {
    if (
      (data?.error === 'tutor_blocked' || data?.error === 'profanity_blocked') &&
      typeof data.reply === 'string' &&
      data.reply.trim()
    ) {
      return { kind: 'error', text: data.reply, links: [], warning };
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
    kind: warning
      ? 'notice'
      : data.mode === 'online'
        ? 'online'
        : links.length
          ? 'materials'
          : 'notice',
    text: data.reply,
    links,
    warning,
    primaryHref: links[0]?.href ?? null,
  };
}
