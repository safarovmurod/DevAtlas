'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import { GripVertical, X, Send, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';
import { useLearningStore } from '@/stores/learning-store';
import { isDeepFollowUp, type TutorSource } from '@/lib/tutor/shared';
import { useAccount } from '@/components/account/account-provider';
import { usePlanAccess } from '@/components/courses/use-practice-access';
import { MEMBERSHIP_COPY } from '@/lib/billing/copy';
import { LEARNING_UI_COPY, tutorErrorKey, type TutorErrorKey } from '@/lib/learning-ui-copy';
import { TUTOR_COPY } from '@/lib/tutor/copy';

interface ChatMsg {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  error?: boolean;
  errorKey?: TutorErrorKey;
  source?: TutorSource;
  followUp?: boolean;
  subject?: string;
}

class TutorRequestError extends Error {
  constructor(readonly key: TutorErrorKey) {
    super(key);
  }
}

const DEFAULT_WIDTH = 440;
const MIN_WIDTH = 360;
const MAX_WIDTH = 920;
const MOBILE_WIDTH = 640;
const WIDTH_KEY = 'devatlas:tutor-panel-width';

function storedWidth() {
  if (typeof window === 'undefined') return DEFAULT_WIDTH;
  try {
    const width = Number(window.localStorage.getItem(WIDTH_KEY));
    if (Number.isFinite(width) && width >= MIN_WIDTH && width <= MAX_WIDTH) return width;
  } catch {
    return DEFAULT_WIDTH;
  }
  return DEFAULT_WIDTH;
}

function rememberWidth(width: number) {
  try {
    window.localStorage.setItem(WIDTH_KEY, String(width));
  } catch {
    return;
  }
}

export function TutorDrawer() {
  const account = useAccount();
  const open = useAppStore((state) => state.tutorDrawerOpen);
  const tutorAccess = usePlanAccess('aiTutor', open);
  const locked = tutorAccess !== 'open';
  const setOpen = useAppStore((state) => state.setTutorDrawerOpen);
  const selectedQuestion = useAppStore((state) => state.tutorQuestion);
  const setSelectedQuestion = useAppStore((state) => state.setTutorQuestion);
  const language = useLearningStore((state) => state.contentLanguage);
  const uiLanguage = useLearningStore((state) => state.language);
  const ui = LEARNING_UI_COPY[uiLanguage];
  const chatCopy = TUTOR_COPY[uiLanguage];
  const prompts = LEARNING_UI_COPY[language];
  const courseId = useLearningStore((state) => state.selectedCourse);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferredWidth, setPreferredWidth] = useState(storedWidth);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth,
  );
  const drag = useRef<{
    pointer: number;
    startX: number;
    startWidth: number;
    width: number;
  } | null>(null);
  const sending = useRef(false);
  const dialog = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageList = useRef<HTMLDivElement>(null);
  const canResize = viewportWidth > MOBILE_WIDTH;
  const maxWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, viewportWidth - 48));
  const panelWidth = Math.min(preferredWidth, maxWidth);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= MOBILE_WIDTH) drag.current = null;
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  function clampWidth(width: number) {
    return Math.min(maxWidth, Math.max(MIN_WIDTH, Math.round(width)));
  }

  function finishDrag(pointer: number) {
    const current = drag.current;
    if (!current || current.pointer !== pointer) return;
    drag.current = null;
    if (current.width !== current.startWidth) rememberWidth(current.width);
  }

  useEffect(() => {
    if (open && selectedQuestion) setInput(selectedQuestion.text);
  }, [open, selectedQuestion]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), a[href], [role="separator"][tabindex="0"]',
      );
      if (!controls?.length) return;
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      drag.current = null;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [open, setOpen]);

  useEffect(() => {
    if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
  }, [messages, loading, open]);

  async function send(deep = false) {
    if (locked) return;
    if (sending.current || (!deep && !input.trim())) return;
    const followUp = deep || isDeepFollowUp(input);
    const lastQuestion = [...messages]
      .reverse()
      .find((message) => message.sender === 'user' && !message.followUp);
    const lastReply = [...messages]
      .reverse()
      .find(
        (message) =>
          message.sender === 'assistant' &&
          message.subject === lastQuestion?.text &&
          !message.error,
      );
    if (deep && !lastQuestion && !selectedQuestion) return;
    sending.current = true;
    setLoading(true);
    const text = deep ? prompts.promptDeep : input.trim();
    const query = followUp ? selectedQuestion?.text || lastQuestion?.text || text : text;
    const questionId = followUp
      ? selectedQuestion?.id || lastReply?.source?.questionId
      : selectedQuestion?.text === text
        ? selectedQuestion.id
        : undefined;
    const history = messages
      .filter((message) => message.id !== 'welcome' && !message.error)
      .slice(-4)
      .map((message) => ({
        role: message.sender,
        content: message.text.slice(0, 600),
      }));
    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        sender: 'user',
        text: selectedQuestion && deep ? selectedQuestion.text : text,
        followUp: followUp && !selectedQuestion,
      },
    ]);
    setSelectedQuestion(null);
    if (!deep) setInput('');
    try {
      const topicId = window.location.pathname.match(/^\/lesson\/([^/]+)$/)?.[1];
      const client = getSupabaseBrowserClient();
      const session = client ? await getSessionWithTimeout(client) : null;
      const token = session?.data.session?.access_token;
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({
          action: 'ask',
          courseId,
          userText: query,
          isDeep: followUp,
          history,
          topicId,
          questionId,
          language,
        }),
        signal: AbortSignal.timeout(50000),
      });
      const data = await response.json();
      if (!response.ok) throw new TutorRequestError(tutorErrorKey(response.status, data.error));
      if (typeof data.reply !== 'string' || !data.reply.trim())
        throw new TutorRequestError('tutorEmpty');
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: data.reply,
          source: data.source,
          subject: query,
        },
      ]);
    } catch (caught) {
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          error: true,
          text: '',
          errorKey: caught instanceof TutorRequestError ? caught.key : 'tutorConnection',
        },
      ]);
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div className="tutor-backdrop" onClick={() => setOpen(false)}>
      <aside
        id="tutor-panel"
        className="tutor-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutor-title"
        ref={dialog}
        style={canResize ? { width: panelWidth } : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        {canResize && (
          <div
            className="tutor-resize"
            role="separator"
            tabIndex={0}
            aria-label={chatCopy.resize}
            aria-controls="tutor-panel"
            aria-orientation="vertical"
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={maxWidth}
            aria-valuenow={panelWidth}
            onPointerDown={(event) => {
              if (event.button !== 0 || drag.current) return;
              event.preventDefault();
              const handle = event.currentTarget;
              handle.focus({ preventScroll: true });
              handle.setPointerCapture(event.pointerId);
              drag.current = {
                pointer: event.pointerId,
                startX: event.clientX,
                startWidth: panelWidth,
                width: panelWidth,
              };
            }}
            onPointerMove={(event) => {
              const current = drag.current;
              if (!current || event.pointerId !== current.pointer) return;
              const width = clampWidth(current.startWidth + current.startX - event.clientX);
              current.width = width;
              setPreferredWidth(width);
            }}
            onPointerUp={(event) => finishDrag(event.pointerId)}
            onPointerCancel={(event) => finishDrag(event.pointerId)}
            onLostPointerCapture={(event) => finishDrag(event.pointerId)}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 64 : 24;
              let width: number;
              if (event.key === 'ArrowLeft') width = panelWidth + step;
              else if (event.key === 'ArrowRight') width = panelWidth - step;
              else if (event.key === 'Home') width = MIN_WIDTH;
              else if (event.key === 'End') width = maxWidth;
              else return;
              event.preventDefault();
              const next = clampWidth(width);
              setPreferredWidth(next);
              rememberWidth(next);
            }}
          >
            <GripVertical size={16} aria-hidden="true" />
          </div>
        )}
        <div className="tutor-heading">
          <div>
            <h2 id="tutor-title">
              <Sparkles size={19} /> AI Tutor
            </h2>
          </div>
          <button className="icon-button" onClick={() => setOpen(false)} aria-label={ui.tutorClose}>
            <X size={20} />
          </button>
        </div>
        <div
          className="tutor-messages"
          aria-live="polite"
          aria-relevant="additions"
          ref={messageList}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={'tutor-message ' + message.sender + (message.error ? ' tutor-error' : '')}
            >
              <p>
                {message.id === 'welcome'
                  ? chatCopy.welcome
                  : message.errorKey
                    ? ui[message.errorKey]
                    : message.text}
              </p>
              {message.source && (
                <Link
                  className="tutor-source"
                  href={
                    message.source.href || '/lesson/' + encodeURIComponent(message.source.topicId)
                  }
                  onClick={() => setOpen(false)}
                >
                  {ui.source} {message.source.title}
                </Link>
              )}
            </div>
          ))}
          {loading && (
            <p role="status" className="tutor-loading">
              {ui.tutorLoading}
            </p>
          )}
        </div>
        <div className="tutor-composer">
          {locked ? (
            <div className="tutor-signin">
              <p role="status">{MEMBERSHIP_COPY[uiLanguage].features.aiTutor} · Pro</p>
              <Link className="button subtle" href="/plans" onClick={() => setOpen(false)}>
                Pro
              </Link>
            </div>
          ) : (
            !account.user && (
              <div className="tutor-signin">
                <p>{ui.tutorSignIn}</p>
                <Link className="button subtle" href="/login" onClick={() => setOpen(false)}>
                  {ui.tutorLogin}
                </Link>
              </div>
            )
          )}
          <div className="tutor-shortcuts">
            <button
              className="button subtle"
              disabled={loading || locked}
              onClick={() =>
                setInput(courseId === 'react' ? prompts.promptReact : prompts.promptTopic)
              }
            >
              {courseId === 'react' ? 'useState?' : ui.tutorTopic}
            </button>
            <button
              className="button subtle"
              disabled={
                loading ||
                locked ||
                (!selectedQuestion &&
                  !messages.some((message) => message.sender === 'user' && !message.followUp))
              }
              onClick={() => send(true)}
            >
              <Layers size={15} />
              {ui.tutorDeep}
            </button>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <label className="sr-only" htmlFor="tutor-input">
              {ui.tutorQuestion}
            </label>
            <textarea
              id="tutor-input"
              ref={inputRef}
              value={input}
              maxLength={1500}
              rows={3}
              disabled={loading || locked}
              aria-describedby={canResize ? 'tutor-key-hint' : undefined}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key !== 'Enter' ||
                  event.shiftKey ||
                  event.ctrlKey ||
                  event.altKey ||
                  event.metaKey ||
                  event.nativeEvent.isComposing ||
                  event.nativeEvent.keyCode === 229
                ) {
                  return;
                }
                event.preventDefault();
                if (input.trim()) event.currentTarget.form?.requestSubmit();
              }}
              placeholder={ui.tutorPlaceholder}
            />
            <div className="tutor-composer-actions">
              <p id="tutor-key-hint" className="tutor-key-hint">
                {chatCopy.sendHint}
              </p>
              <button
                className="button primary"
                type="submit"
                disabled={loading || locked || !input.trim()}
                aria-label={ui.tutorSend}
              >
                <Send size={17} />
                {ui.tutorSend}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}
