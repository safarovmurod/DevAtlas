'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Code2, Copy, Paperclip, SendHorizontal, Trash2, X } from 'lucide-react';
import { useAccount } from '@/components/account/account-provider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import { useLearningStore } from '@/stores/learning-store';
import { highlightCode } from '@/lib/community/highlight';
import {
  COMMUNITY_BUCKET,
  COMMUNITY_CODE_MAX,
  COMMUNITY_TEXT_MAX,
  communityMediaProblem,
} from '@/lib/community/limits';
import { cn } from '@/lib/utils';
import { COMMUNITY_COPY } from './community-copy';

/** Touch targets stay at least 44×44 px. */
const TOUCH = { width: 44, height: 44 };

export type CommunityMessage = {
  id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
  kind: 'text' | 'code' | 'image' | 'video';
  code_language: string | null;
  media_type: string | null;
  media_url: string | null;
  mine: boolean;
};
type ErrorKey =
  'login' | 'membership' | 'setup' | 'service' | 'rate' | 'invalid' | 'type' | 'size' | 'upload';

export function errorKey(status: number, code?: string): ErrorKey {
  if (code === 'setup_required') return 'setup';
  if (code === 'invalid_type') return 'type';
  if (code === 'too_large') return 'size';
  return status === 401
    ? 'login'
    : status === 403
      ? 'membership'
      : status === 429
        ? 'rate'
        : status === 400 || status === 413
          ? 'invalid'
          : 'service';
}

class CommunityError extends Error {
  constructor(readonly key: ErrorKey) {
    super(key);
  }
}

async function session(userId: string) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new CommunityError('login');
  const { data, error } = await getSessionWithTimeout(client);
  if (error || !data.session || data.session.user.id !== userId) throw new CommunityError('login');
  return { client, token: data.session.access_token };
}

async function request<T = { ok: true }>(userId: string, body?: Record<string, unknown>) {
  const { token } = await session(userId);
  const response = await fetch('/api/community', {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new CommunityError(errorKey(response.status, data?.error));
  return data as T;
}

const failure = (cause: unknown): ErrorKey =>
  cause instanceof CommunityError ? cause.key : 'service';

const LANGUAGES = ['js', 'ts', 'jsx', 'html', 'css', 'python', 'sql', 'json', 'bash'];

export function CommunityScreen() {
  const { user } = useAccount();
  return <CommunitySession key={user?.id || 'guest'} />;
}

function CommunitySession() {
  const { user } = useAccount();
  const locale = useLearningStore((state) => state.language);
  const copy = COMMUNITY_COPY[locale];
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [online, setOnline] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | ErrorKey>('loading');
  const [attempt, setAttempt] = useState(0);
  const [text, setText] = useState('');
  const [codeMode, setCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('js');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<ErrorKey | 'failed' | ''>('');
  const list = useRef<HTMLOListElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const uid = user?.id;

  async function reload() {
    if (!uid) return;
    const result = await request<{ messages: CommunityMessage[]; online: number }>(uid);
    setMessages(result.messages);
    setOnline(result.online);
    setState('ready');
  }

  useEffect(() => {
    let active = true;
    let busy = false;
    let connected = false;
    let lastHeartbeat = 0;
    async function refresh() {
      if (!uid) {
        if (active) setState('login');
        return;
      }
      if (busy || document.hidden) return;
      busy = true;
      try {
        if (Date.now() - lastHeartbeat > 30_000) {
          await request(uid, { kind: 'heartbeat' });
          lastHeartbeat = Date.now();
        }
        const result = await request<{ messages: CommunityMessage[]; online: number }>(uid);
        if (!active) return;
        setMessages(result.messages);
        setOnline(result.online);
        setState('ready');
        connected = true;
      } catch (cause) {
        if (active) setState(failure(cause));
      } finally {
        busy = false;
      }
    }
    void refresh();
    // Polling every 5 seconds while the tab is visible.
    const timer = setInterval(() => void refresh(), 5_000);
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      if (uid && connected) void request(uid, { kind: 'leave' }).catch(() => undefined);
    };
  }, [uid, attempt]);

  // Keep the newest message in view.
  const lastId = messages.at(-1)?.id;
  useEffect(() => {
    const element = list.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [lastId]);

  function pickFile(next: File | null) {
    setNotice('');
    if (!next) return setFile(null);
    const problem = communityMediaProblem(next.type, next.size);
    if (problem) {
      setNotice(problem);
      if (fileInput.current) fileInput.current.value = '';
      return;
    }
    setCodeMode(false);
    setFile(next);
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!uid || sending) return;
    const value = text.trim();
    const max = codeMode ? COMMUNITY_CODE_MAX : COMMUNITY_TEXT_MAX;
    if ((!file && !value) || value.length > max) return setNotice('invalid');
    setSending(true);
    setNotice('');
    try {
      if (file) {
        const ticket = await request<{ path: string; token: string }>(uid, {
          kind: 'upload',
          type: file.type,
          size: file.size,
        });
        const { client } = await session(uid);
        const uploaded = await client.storage
          .from(COMMUNITY_BUCKET)
          .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
        if (uploaded.error) throw new CommunityError('upload');
        await request(uid, { kind: 'media', path: ticket.path, ...(value ? { text: value } : {}) });
      } else if (codeMode) {
        await request(uid, { kind: 'code', text: value, language: codeLanguage });
      } else {
        await request(uid, { kind: 'message', text: value });
      }
      setText('');
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      await reload();
    } catch (cause) {
      const key = failure(cause);
      setNotice(key === 'service' ? 'failed' : key);
    } finally {
      setSending(false);
    }
  }

  async function remove(id: string) {
    if (!uid || !window.confirm(copy.confirmDelete)) return;
    try {
      await request(uid, { kind: 'delete', id });
      setMessages((current) => current.filter((message) => message.id !== id));
    } catch (cause) {
      setNotice(failure(cause));
    }
  }

  return (
    <section className="mx-auto grid max-w-[880px] gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-semibold tracking-tight">{copy.title}</h1>
        {state === 'ready' && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <span aria-hidden="true" className="size-2 rounded-full bg-success" />
            {online} {copy.online}
          </span>
        )}
      </header>

      <div className="flex min-h-[60vh] flex-col overflow-hidden rounded-2xl border border-border bg-card">
        {state === 'loading' ? (
          <p role="status" className="m-auto text-sm text-muted-foreground">
            {copy.loading}
          </p>
        ) : state !== 'ready' ? (
          <div className="m-auto grid justify-items-center gap-3 p-6 text-center">
            <p role="status" className="m-0">
              {copy[state]}
            </p>
            {state === 'login' ? (
              <Link href="/login" className="button primary">
                {copy.signin}
              </Link>
            ) : (
              <button className="button primary" onClick={() => setAttempt((n) => n + 1)}>
                {copy.retry}
              </button>
            )}
          </div>
        ) : (
          <>
            <ol
              ref={list}
              aria-label={copy.title}
              className="m-0 flex max-h-[60vh] flex-1 list-none flex-col gap-2 overflow-y-auto bg-muted/40 p-3 sm:p-4"
            >
              {messages.length === 0 && (
                <li className="m-auto text-sm text-muted-foreground">{copy.empty}</li>
              )}
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  locale={locale}
                  onDelete={() => void remove(message.id)}
                />
              ))}
            </ol>

            <form onSubmit={send} className="grid gap-2 border-t border-border p-3">
              {file && (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    className="icon-button"
                    style={TOUCH}
                    aria-label={copy.remove}
                    onClick={() => {
                      setFile(null);
                      if (fileInput.current) fileInput.current.value = '';
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {codeMode && (
                <label className="flex items-center gap-2 text-sm">
                  {copy.language}
                  <select
                    value={codeLanguage}
                    onChange={(event) => setCodeLanguage(event.target.value)}
                    className="rounded-md border border-border bg-card px-2 py-1"
                  >
                    {LANGUAGES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div className="flex items-end gap-2">
                <input
                  ref={fileInput}
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  aria-label={copy.attach}
                  onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="icon-button shrink-0"
                  style={TOUCH}
                  aria-label={copy.attach}
                  title={copy.attach}
                  onClick={() => fileInput.current?.click()}
                >
                  <Paperclip size={19} />
                </button>
                <button
                  type="button"
                  className={cn('icon-button shrink-0', codeMode && 'bg-primary-soft text-brand')}
                  style={TOUCH}
                  aria-label={copy.codeOn}
                  aria-pressed={codeMode}
                  title={copy.code}
                  disabled={!!file}
                  onClick={() => setCodeMode((value) => !value)}
                >
                  <Code2 size={19} />
                </button>
                <textarea
                  aria-label={file ? copy.caption : copy.message}
                  placeholder={file ? copy.caption : copy.message}
                  rows={codeMode ? 6 : 1}
                  maxLength={codeMode ? COMMUNITY_CODE_MAX : COMMUNITY_TEXT_MAX}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && !codeMode) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  className={cn(
                    'min-h-11 flex-1 resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-[15px]',
                    codeMode && 'font-mono text-[13px]',
                  )}
                />
                <button
                  className="button primary shrink-0"
                  aria-label={copy.send}
                  disabled={sending || (!text.trim() && !file)}
                >
                  <SendHorizontal size={18} />
                  <span className="max-sm:sr-only">{sending ? copy.sending : copy.send}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      <p className="m-0 min-h-5 text-sm text-warning" role="status">
        {notice ? copy[notice] : ''}
      </p>
    </section>
  );
}

function MessageBubble({
  message,
  locale,
  onDelete,
}: {
  message: CommunityMessage;
  locale: string;
  onDelete: () => void;
}) {
  const copy = COMMUNITY_COPY[useLearningStore((state) => state.language)];
  return (
    <li className={cn('flex', message.mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'group grid max-w-[min(85%,640px)] gap-1.5 rounded-2xl px-3 py-2 shadow-sm',
          message.mine ? 'rounded-br-md bg-primary-soft' : 'rounded-bl-md bg-card',
        )}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <strong className="text-foreground">
            {message.mine ? copy.you : message.author_name}
          </strong>
          <time dateTime={message.created_at}>
            {new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
              new Date(message.created_at),
            )}
          </time>
          {message.mine && (
            <button
              type="button"
              className="ml-auto inline-flex items-center text-muted-foreground hover:text-destructive"
              aria-label={copy.delete}
              title={copy.delete}
              onClick={onDelete}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        {message.kind === 'image' && message.media_url && (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
          <img
            src={message.media_url}
            alt=""
            loading="lazy"
            className="max-h-80 w-auto max-w-full rounded-xl object-contain"
          />
        )}
        {message.kind === 'video' && message.media_url && (
          <video
            src={message.media_url}
            controls
            preload="metadata"
            className="max-h-80 w-full rounded-xl bg-black"
          />
        )}
        {message.kind === 'code' ? (
          <CodeBlock code={message.body} language={message.code_language} />
        ) : (
          message.body && (
            <p className="m-0 text-[15px] leading-6 break-words whitespace-pre-wrap">
              {message.body}
            </p>
          )
        )}
      </div>
    </li>
  );
}

const TOKEN_CLASS = {
  plain: '',
  keyword: 'text-[#c678dd]',
  string: 'text-[#98c379]',
  comment: 'text-[#7f848e] italic',
  number: 'text-[#d19a66]',
};

function CodeBlock({ code, language }: { code: string; language: string | null }) {
  const copy = COMMUNITY_COPY[useLearningStore((state) => state.language)];
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl bg-[#1e2127] text-[#abb2bf]">
      <div className="flex items-center justify-between px-3 py-1 text-xs text-[#7f848e]">
        <span>{language ?? 'code'}</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 hover:text-white"
          onClick={() => {
            void navigator.clipboard?.writeText(code).then(() => setCopied(true));
          }}
        >
          <Copy size={12} />
          {copied ? copy.copied : copy.copy}
        </button>
      </div>
      <pre className="m-0 max-h-96 overflow-auto px-3 pb-3 font-mono text-[13px] leading-5">
        <code>
          {highlightCode(code).map((token, index) => (
            <span key={index} className={TOKEN_CLASS[token.type]}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
