'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useAppStore } from '@/stores/app-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import {
  GripVertical,
  X,
  Send,
  Sparkles,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  BookOpen,
  Compass,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useLearningStore } from '@/stores/learning-store';
import {
  isDeepFollowUp,
  type TutorExplainStyle,
  type TutorSource,
  type TutorStrikeNotice,
  type TutorWebSource,
} from '@/lib/tutor/shared';
import { useAccount } from '@/components/account/account-provider';
import { usePlanAccess } from '@/components/courses/use-practice-access';
import { AtlasLoader3D } from '@/components/learning/atlas-loader-3d';
import { BlockCountdown } from '@/components/ui/block-countdown';
import { RulesModal, RULES_COPY } from '@/components/layout/rules-modal';
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
  webSources?: TutorWebSource[];
  warning?: TutorStrikeNotice;
  followUp?: boolean;
  subject?: string;
  autoNavigated?: boolean;
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

function safeInternalPath(href: string | undefined): string | null {
  if (!href || !href.startsWith('/') || href.startsWith('//') || /[\\\u0000-\u001f]/.test(href))
    return null;
  return href;
}

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

/** Splits assistant replies into plain paragraphs and formatted fenced code blocks safely. */
function MessageBody({ text }: { text: string }) {
  if (!text.includes('```')) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }
  const parts = text.split(/(```[a-z0-9+#-]*\n[\s\S]*?```)/gi);
  return (
    <div className="grid gap-2">
      {parts.map((part, index) => {
        const match = part.match(/^```([a-z0-9+#-]*)\n([\s\S]*?)```$/i);
        if (match) {
          const lang = match[1] || 'code';
          const code = match[2].trimEnd();
          return (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-slate-700/60 bg-[#0b1120] text-[#e2e8f0]"
            >
              <div className="border-b border-slate-700/60 px-3 py-1 font-mono text-[11px] text-sky-300">
                {lang}
              </div>
              <pre className="m-0 max-h-64 overflow-auto p-3 font-mono text-xs leading-5">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        const trimmed = part.trim();
        return trimmed ? (
          <p key={index} className="m-0 whitespace-pre-wrap">
            {trimmed}
          </p>
        ) : null;
      })}
    </div>
  );
}

const AUTO_NAV_LABEL = {
  tg: 'Дарси мувофиқ дар пасманзар кушода шуд ✓',
  ru: 'Нужный урок открыт на странице ✓',
  en: 'Opened matching lesson ✓',
  es: 'Lección abierta automáticamente ✓',
} as const;

const STYLE_BUTTONS = {
  tg: { simpler: 'Сода кн', another_example: 'Дигар мисол', from_zero: 'Аз нол' },
  ru: { simpler: 'Проще', another_example: 'Другой пример', from_zero: 'С нуля' },
  en: { simpler: 'Simpler', another_example: 'Another example', from_zero: 'From zero' },
  es: { simpler: 'Más simple', another_example: 'Otro ejemplo', from_zero: 'Desde cero' },
} as const;

export function TutorDrawer() {
  const router = useContext(AppRouterContext);
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
  const rulesCopy = RULES_COPY[uiLanguage];
  const prompts = LEARNING_UI_COPY[language];
  const courseId = useLearningStore((state) => state.selectedCourse);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '',
    },
  ]);
  const [blockedNotice, setBlockedNotice] = useState<TutorStrikeNotice | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
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
  const blocked = Boolean(blockedNotice?.blocked);
  const composerDisabled = loading || locked || blocked;

  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= MOBILE_WIDTH) drag.current = null;
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Load current moderation/block status when drawer opens so countdown appears immediately.
  useEffect(() => {
    if (!open || !account.user) return;
    let alive = true;
    void (async () => {
      try {
        const client = getSupabaseBrowserClient();
        const session = client ? (await getSessionWithTimeout(client)).data.session : null;
        if (!session?.access_token || !alive) return;
        const res = await fetch('/api/tutor', {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + session.access_token },
          cache: 'no-store',
          signal: AbortSignal.timeout(8_000),
        });
        if (!res.ok || !alive) return;
        const data = (await res.json()) as {
          moderation?: {
            blocked?: boolean;
            blockReason?: 'profanity' | 'off_topic' | null;
            offTopic?: TutorStrikeNotice;
            profanity?: TutorStrikeNotice;
          };
        };
        if (data.moderation?.blocked) {
          const active =
            data.moderation.blockReason === 'profanity'
              ? data.moderation.profanity
              : data.moderation.offTopic;
          setBlockedNotice(active ?? null);
        } else {
          setBlockedNotice(null);
        }
      } catch {
        // Non-blocking status check.
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, account.user]);

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
      if (event.key === 'Escape' && !rulesOpen) setOpen(false);
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
  }, [open, setOpen, rulesOpen]);

  useEffect(() => {
    if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
  }, [messages, loading, open]);

  async function send(deep = false, style: TutorExplainStyle = 'default') {
    if (locked || blocked) return;
    const isPreset = style !== 'default';
    if (sending.current || (!deep && !isPreset && !input.trim())) return;
    const followUp = deep || isPreset || isDeepFollowUp(input);
    const lastQuestion = [...messages]
      .reverse()
      .find((message) => message.sender === 'user' && !message.followUp);
    const lastReply = [...messages]
      .reverse()
      .find(
        (message) =>
          message.sender === 'assistant' &&
          message.subject === lastQuestion?.text &&
          !message.error &&
          !message.warning,
      );
    if ((deep || isPreset) && !lastQuestion && !selectedQuestion) return;
    sending.current = true;
    setLoading(true);
    const presetLabel = isPreset ? STYLE_BUTTONS[uiLanguage][style] : '';
    const text = deep ? prompts.promptDeep : isPreset ? presetLabel : input.trim();
    const query = followUp ? selectedQuestion?.text || lastQuestion?.text || text : text;
    const questionId = followUp
      ? selectedQuestion?.id || lastReply?.source?.questionId
      : selectedQuestion?.text === text
        ? selectedQuestion.id
        : undefined;
    const history = messages
      .filter((message) => message.id !== 'welcome' && !message.error && !message.warning)
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
    if (!deep && !isPreset) setInput('');
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
          isDeep: deep,
          ...(isPreset ? { style } : {}),
          history,
          topicId,
          questionId,
          language,
        }),
        signal: AbortSignal.timeout(40000),
      });
      const data = await response.json();
      if (data?.warning?.blocked) {
        setBlockedNotice(data.warning as TutorStrikeNotice);
      }
      if (!response.ok) {
        if (
          (data?.error === 'tutor_blocked' || data?.error === 'profanity_blocked') &&
          typeof data.reply === 'string' &&
          data.reply.trim()
        ) {
          setMessages((previous) => [
            ...previous,
            {
              id: crypto.randomUUID(),
              sender: 'assistant',
              text: data.reply,
              warning: data.warning,
              error: true,
            },
          ]);
          return;
        }
        throw new TutorRequestError(tutorErrorKey(response.status, data.error));
      }
      if (typeof data.reply !== 'string' || !data.reply.trim())
        throw new TutorRequestError('tutorEmpty');

      // Direct auto-navigation to the exact matching lesson page while keeping chat examples open.
      const matchedHref = safeInternalPath(
        data.source?.lessonHref ||
          data.source?.href ||
          (data.source?.topicId ? '/lesson/' + encodeURIComponent(data.source.topicId) : undefined),
      );
      let autoNavigated = false;
      if (
        router &&
        matchedHref &&
        !data.warning &&
        window.location.pathname + window.location.search !== matchedHref
      ) {
        router.push(matchedHref);
        autoNavigated = true;
      }

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: data.reply,
          source: data.source,
          webSources: Array.isArray(data.webSources) ? data.webSources : undefined,
          warning: data.warning,
          subject: query,
          autoNavigated,
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
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="icon-button"
              onClick={() => setRulesOpen(true)}
              aria-label={rulesCopy.buttonLabel}
              title={rulesCopy.buttonLabel}
            >
              <HelpCircle size={18} />
            </button>
            <button
              className="icon-button"
              onClick={() => setOpen(false)}
              aria-label={ui.tutorClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div
          className="tutor-messages"
          aria-live="polite"
          aria-relevant="additions"
          ref={messageList}
        >
          {messages.map((message) => {
            const primaryHref = safeInternalPath(
              message.source?.lessonHref ||
                message.source?.href ||
                (message.source
                  ? '/lesson/' + encodeURIComponent(message.source.topicId)
                  : undefined),
            );
            const answersHref = safeInternalPath(message.source?.href);
            const showAnswersLink = Boolean(answersHref && answersHref !== primaryHref);
            return (
              <div
                key={message.id}
                className={
                  'tutor-message ' +
                  message.sender +
                  (message.warning ? ' tutor-warning' : '') +
                  (message.error ? ' tutor-error' : '')
                }
              >
                {message.warning && (
                  <div className="tutor-warning-badge" role="status">
                    <AlertTriangle size={14} aria-hidden="true" />
                    <span>
                      {chatCopy.warningBadge} {message.warning.strikes}/{message.warning.maxStrikes}
                    </span>
                  </div>
                )}
                {message.autoNavigated && (
                  <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
                    <Compass size={13} aria-hidden="true" />
                    <span>{AUTO_NAV_LABEL[uiLanguage]}</span>
                  </div>
                )}
                <MessageBody
                  text={
                    message.id === 'welcome'
                      ? chatCopy.welcome
                      : message.errorKey
                        ? ui[message.errorKey]
                        : message.text
                  }
                />
                {message.source && primaryHref && (
                  <div className="tutor-source tutor-source-card">
                    <div className="tutor-source-meta">
                      <BookOpen size={14} aria-hidden="true" />
                      <span>
                        {ui.source}{' '}
                        {message.source.courseTitle ? `${message.source.courseTitle} · ` : ''}
                        {message.source.title}
                      </span>
                    </div>
                    <div className="tutor-source-links">
                      <Link
                        className="tutor-source-link"
                        href={primaryHref}
                        onClick={() => setOpen(false)}
                      >
                        <span>{chatCopy.openLesson}</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                      {showAnswersLink && answersHref && (
                        <Link
                          className="tutor-source-link subtle"
                          href={answersHref}
                          onClick={() => setOpen(false)}
                        >
                          <span>{chatCopy.openAnswers}</span>
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                {message.webSources && message.webSources.length > 0 && (
                  <div className="tutor-web-sources">
                    <span>{chatCopy.webSources}</span>
                    {message.webSources.map((src) => (
                      <a
                        key={src.url}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tutor-web-link"
                      >
                        {src.title}
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div role="status" className="tutor-loading flex items-center justify-center py-3">
              <AtlasLoader3D size="sm" />
              <span className="sr-only">{ui.tutorLoading}</span>
            </div>
          )}
        </div>
        <div className="tutor-composer">
          {blocked && (
            <div className="mb-2 grid gap-2">
              <div className="tutor-blocked-banner" role="alert">
                <AlertTriangle size={16} aria-hidden="true" />
                <p>{chatCopy.blockedBanner}</p>
              </div>
              <BlockCountdown
                blockedUntil={blockedNotice?.blockedUntil}
                language={uiLanguage}
                compact
                onExpire={() => setBlockedNotice(null)}
              />
            </div>
          )}
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
              disabled={composerDisabled}
              onClick={() =>
                setInput(courseId === 'react' ? prompts.promptReact : prompts.promptTopic)
              }
            >
              {courseId === 'react' ? 'useState?' : ui.tutorTopic}
            </button>
            <button
              className="button subtle"
              disabled={
                composerDisabled ||
                (!selectedQuestion &&
                  !messages.some((message) => message.sender === 'user' && !message.followUp))
              }
              onClick={() => void send(true)}
            >
              <Layers size={15} />
              {ui.tutorDeep}
            </button>
            {messages.some((message) => message.sender === 'user' && !message.followUp) && (
              <>
                <button
                  type="button"
                  className="button subtle"
                  disabled={composerDisabled}
                  onClick={() => void send(false, 'simpler')}
                >
                  {STYLE_BUTTONS[uiLanguage].simpler}
                </button>
                <button
                  type="button"
                  className="button subtle"
                  disabled={composerDisabled}
                  onClick={() => void send(false, 'another_example')}
                >
                  {STYLE_BUTTONS[uiLanguage].another_example}
                </button>
                <button
                  type="button"
                  className="button subtle"
                  disabled={composerDisabled}
                  onClick={() => void send(false, 'from_zero')}
                >
                  {STYLE_BUTTONS[uiLanguage].from_zero}
                </button>
              </>
            )}
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
              disabled={composerDisabled}
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
                disabled={composerDisabled || !input.trim()}
                aria-label={ui.tutorSend}
              >
                <Send size={17} />
                {ui.tutorSend}
              </button>
            </div>
          </form>
        </div>
      </aside>
      <RulesModal open={rulesOpen} language={uiLanguage} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
