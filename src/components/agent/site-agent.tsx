'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { useAccount } from '@/components/account/account-provider';
import {
  agentStorageKey,
  readAgentHistory,
  saveAgentHistory,
  type AgentMessage,
} from '@/lib/agent/private-history';
import { agentGreeting, guideContext, siteGuideAnswer } from '@/lib/agent/site-agent';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { askTutor } from './ask-tutor';
import { AgentComposer } from './agent-composer';
import { AGENT_COPY } from './site-agent-copy';
import { speak, stopSpeaking } from './speech';

const MAX_MESSAGES = 40;
const NO_PROGRESS = {
  completedTopics: [],
  completedPractice: [],
  confirmedDays: [],
  masteredQuestions: [],
};

function greeting(language: InterfaceLocale, id = 'greeting'): AgentMessage {
  return { id, sender: 'assistant', kind: 'guide', text: agentGreeting(language) };
}

/** Each account (or the guest) gets its own chat, so switching accounts starts a fresh session. */
export function SiteAgent() {
  const { user } = useAccount();
  return <SiteAgentSession key={user?.id ?? 'guest'} owner={user?.id ?? null} />;
}

/** Small label above an assistant message that says where the answer came from. */
function messageKindLabel(kind: AgentMessage['kind'], language: InterfaceLocale) {
  const copy = AGENT_COPY[language];
  if (kind === 'guide') return copy.kindGuide;
  if (kind === 'materials') return copy.kindMaterials;
  if (kind === 'online') return 'AI · AnyModel';
  if (kind === 'notice') return LEARNING_UI_COPY[language].tutorLocal;
  return copy.kindNoMatch;
}

function SiteAgentSession({ owner }: { owner: string | null }) {
  const language = useLearningStore((state) => state.language);
  const courseId = useLearningStore((state) => state.selectedCourse);
  const progress = useLearningStore((state) =>
    courseId === 'react' ? undefined : state.courses[courseId],
  );
  const tutorOpen = useAppStore((state) => state.tutorDrawerOpen);
  const copy = AGENT_COPY[language];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[] | null>(null);
  const [voice, setVoice] = useState(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        localStorage.getItem(agentStorageKey(owner, 'voice')) === 'on'
      );
    } catch {
      return false;
    }
  });
  const sending = useRef(false);
  const pending = useRef<AbortController | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The first client render restores the saved chat (or greets). This is
  // React's "adjust state during render" pattern, as in AccountShell.
  if (messages === null) {
    let restored: AgentMessage[] | null = null;
    if (typeof window !== 'undefined') {
      try {
        restored = readAgentHistory(localStorage, owner);
      } catch {
        // A corrupted history falls back to the greeting.
      }
    }
    setMessages(restored ?? [greeting(language)]);
  }

  // The tutor drawer and the assistant never stay open together.
  if (tutorOpen && open) setOpen(false);

  useEffect(() => {
    if (!messages) return;
    try {
      saveAgentHistory(localStorage, owner, messages);
    } catch {
      // Storage is blocked: the chat lives in memory only.
    }
  }, [messages, owner]);

  // Leaving the page stops speaking and any pending answer.
  useEffect(
    () => () => {
      pending.current?.abort();
      stopSpeaking();
    },
    [],
  );

  // On small phones the open panel is a modal: lock page scroll and keep Tab inside.
  useEffect(() => {
    if (!open || tutorOpen) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const media = window.matchMedia?.('(max-width: 560px)');
    const apply = () => {
      const modal = media?.matches ?? false;
      panel.current?.setAttribute('aria-modal', String(modal));
      document.body.style.overflow = modal ? 'hidden' : previousOverflow;
    };
    apply();
    inputRef.current?.focus();
    media?.addEventListener('change', apply);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !media?.matches) return;
      const controls = panel.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],textarea:not([disabled])',
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      media?.removeEventListener('change', apply);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, tutorOpen]);

  // Always show the newest message.
  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [messages, loading, open]);

  function toggleVoice() {
    const next = !voice;
    setVoice(next);
    try {
      localStorage.setItem(agentStorageKey(owner, 'voice'), next ? 'on' : 'off');
    } catch {
      // The preference is cosmetic.
    }
    if (!next) stopSpeaking();
  }

  function push(message: AgentMessage) {
    setMessages((previous) => [...(previous ?? []), message].slice(-MAX_MESSAGES));
    if (message.sender === 'assistant' && voice && message.kind !== 'error')
      speak(message.text, language);
  }

  function finishSending() {
    sending.current = false;
    setLoading(false);
    inputRef.current?.focus();
  }

  function cancel() {
    pending.current?.abort();
    pending.current = null;
    sending.current = false;
    setLoading(false);
  }

  function clear() {
    cancel();
    setMessages([greeting(language, crypto.randomUUID())]);
  }

  async function ask(rawText: string) {
    const text = rawText.trim();
    if (sending.current || !text) return;
    sending.current = true;
    setLoading(true);
    push({ id: crypto.randomUUID(), sender: 'user', text });
    setInput('');

    // Questions about the platform itself are answered locally by the guide.
    const context = guideContext({
      language,
      selectedCourse: courseId,
      progress: progress ?? NO_PROGRESS,
    });
    const guide = siteGuideAnswer(text, context);
    if (guide) {
      const linksLine = guide.links.map((link) => link.label).join(' · ');
      push({
        id: crypto.randomUUID(),
        sender: 'assistant',
        kind: 'guide',
        text: guide.reply + (linksLine ? '\n\n' + linksLine : ''),
        links: guide.links,
      });
      finishSending();
      return;
    }

    // Lesson questions go to the tutor. The request is bound to this chat:
    // a cleared or closed chat never accepts a late answer.
    const request = new AbortController();
    pending.current = request;
    try {
      const reply = await askTutor({
        text,
        courseId,
        owner,
        history: messages ?? [],
        language,
        signal: request.signal,
      });
      if (!request.signal.aborted) push(reply);
    } catch {
      if (!request.signal.aborted)
        push({
          id: crypto.randomUUID(),
          sender: 'assistant',
          kind: 'error',
          text: copy.unavailable,
          links: [],
        });
    } finally {
      if (pending.current === request) {
        pending.current = null;
        finishSending();
      }
    }
  }

  return (
    <>
      {!tutorOpen && (
        <button
          type="button"
          className={'agent-bubble' + (open ? ' is-open' : '')}
          aria-expanded={open}
          aria-label={copy.assistant}
          title={copy.assistant}
          onClick={() => setOpen((value) => !value)}
        >
          <Bot size={24} />
          <span className="agent-pulse" aria-hidden="true" />
        </button>
      )}

      {open && !tutorOpen && (
        <aside ref={panel} className="agent-panel" role="dialog" aria-label={copy.assistant}>
          <header className="agent-heading">
            <div>
              <h2>
                <Bot size={18} />
                {copy.assistant}
              </h2>
              <p>{copy.subtitle}</p>
            </div>
            <div className="agent-tools">
              <button
                type="button"
                className={'icon-button' + (voice ? ' is-active' : '')}
                onClick={toggleVoice}
                aria-pressed={voice}
                aria-label={voice ? copy.voiceOff : copy.voiceOn}
                title={voice ? copy.voiceIsOn : copy.voiceIsOff}
              >
                {voice ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={clear}
                aria-label={copy.clear}
                title={copy.clear}
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => setOpen(false)}
                aria-label={copy.close}
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="agent-messages" aria-live="polite" ref={list}>
            {(messages ?? []).map((message) => (
              <div key={message.id} className={'agent-message ' + message.sender}>
                {message.kind && message.sender === 'assistant' && (
                  <span className="agent-kind">{messageKindLabel(message.kind, language)}</span>
                )}
                <p>{message.text}</p>
                {message.links?.length ? (
                  <div className="agent-links">
                    {message.links.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading && (
              <>
                <button type="button" className="button subtle" onClick={cancel}>
                  {copy.stop}
                </button>
                <p role="status" className="agent-loading">
                  {copy.thinking}
                </p>
              </>
            )}
          </div>

          <AgentComposer
            language={language}
            loading={loading}
            input={input}
            onInput={setInput}
            onAsk={(text) => void ask(text)}
            inputRef={inputRef}
          />
        </aside>
      )}
    </>
  );
}
