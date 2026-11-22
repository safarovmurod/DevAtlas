'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Code2,
  Compass,
  HelpCircle,
  Mic,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import { useAccount } from '@/components/account/account-provider';
import { usePlanAccess } from '@/components/courses/use-practice-access';
import { AtlasLoader3D } from '@/components/learning/atlas-loader-3d';
import { RulesModal, RULES_COPY } from '@/components/layout/rules-modal';
import { BlockCountdown } from '@/components/ui/block-countdown';
import { MEMBERSHIP_COPY } from '@/lib/billing/copy';
import { removeOldAgentChat } from '@/lib/agent/agent-reply';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import type { InterfaceLocale } from '@/lib/locale';
import type { TutorStrikeNotice } from '@/lib/tutor/shared';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { AssistantPet } from './assistant-pet';
import { AGENT_COPY } from './site-agent-copy';
import { useVoiceAssistant, type VoiceNotice } from './use-voice-assistant';

const EXTRA_COPY: Record<
  InterfaceLocale,
  { opened: string; codeTitle: string; voiceOnlyHint: string }
> = {
  tg: {
    opened: 'Ба саҳифаи дарс гузаштем ✓',
    codeTitle: 'Мисоли код',
    voiceOnlyHint: 'Ин панел танҳо бо овоз кор мекунад — саволро бо микрофон диҳед.',
  },
  ru: {
    opened: 'Перешли на страницу урока ✓',
    codeTitle: 'Пример кода',
    voiceOnlyHint: 'Панель работает только голосом — нажмите микрофон и спросите.',
  },
  en: {
    opened: 'Navigated to lesson ✓',
    codeTitle: 'Code example',
    voiceOnlyHint: 'Voice-only instructor — tap the microphone and ask.',
  },
  es: {
    opened: 'Abierta la página de la lección ✓',
    codeTitle: 'Ejemplo de código',
    voiceOnlyHint: 'Panel solo por voz — toca el micrófono y pregunta.',
  },
};

function isJsdomEnvironment() {
  return typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent ?? '');
}

/** Smooth typewriter reveal in real browsers; instant full text under reduced-motion or jsdom tests. */
function useTypewriter(text: string): string {
  const [reveal, setReveal] = useState<{ source: string; count: number }>({
    source: text,
    count: text.length,
  });

  const instant =
    !text ||
    isJsdomEnvironment() ||
    (typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (instant) return;
    let idx = 0;
    const step = Math.max(2, Math.ceil(text.length / 45));
    const timer = window.setInterval(() => {
      idx = Math.min(text.length, idx + step);
      setReveal({ source: text, count: idx });
      if (idx >= text.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [text, instant]);

  if (instant) return text;
  return reveal.source === text ? text.slice(0, reveal.count) : '';
}

/** Each account (or the guest) gets its own assistant session, so switching accounts starts fresh. */
export function SiteAgent() {
  const { user } = useAccount();
  return <SiteAgentSession key={user?.id ?? 'guest'} owner={user?.id ?? null} />;
}

/**
 * The DevAtlas assistant is voice only (no text input or Send button): it listens,
 * speaks with a natural teacher voice, renders a reactive 3D mentor, types out the
 * explanation + code examples inside a clean 4-corner card, and opens the exact lesson page.
 */
function SiteAgentSession({ owner }: { owner: string | null }) {
  const language = useLearningStore((state) => state.language);
  const courseId = useLearningStore((state) => state.selectedCourse);
  const progress = useLearningStore((state) =>
    courseId === 'react' ? undefined : state.courses[courseId],
  );
  const tutorOpen = useAppStore((state) => state.tutorDrawerOpen);
  const setTutorOpen = useAppStore((state) => state.setTutorDrawerOpen);
  const copy = AGENT_COPY[language];
  const extra = EXTRA_COPY[language];
  const rulesCopy = RULES_COPY[language];
  const voice = useVoiceAssistant({ language, owner, courseId, progress });

  const [open, setOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const voiceAccess = usePlanAccess('voiceAssistant', open);
  const bubble = useRef<HTMLButtonElement>(null);
  const mic = useRef<HTMLButtonElement>(null);
  const typedCaption = useTypewriter(voice.caption);

  // The tutor drawer and the assistant never stay open together.
  if (tutorOpen && open) setOpen(false);

  // The assistant used to keep a text chat. Nothing shows it any more, so the old copy is removed.
  useEffect(() => {
    try {
      removeOldAgentChat(localStorage, owner);
    } catch {
      // Blocked storage has nothing to clean.
    }
  }, [owner]);

  // Check active moderation block when the panel opens in real browsers.
  const { setWarning } = voice;
  useEffect(() => {
    if (!open || !owner || isJsdomEnvironment()) return;
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
          if (active) setWarning(active);
        }
      } catch {
        // Ignore transient status fetch issues.
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, owner, setWarning]);

  const { stop } = voice;
  function close() {
    stop();
    setOpen(false);
    bubble.current?.focus();
  }

  // Escape closes the panel; the microphone gets focus when it opens.
  useEffect(() => {
    if (!open) return;
    mic.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || rulesOpen) return;
      event.preventDefault();
      stop();
      setOpen(false);
      bubble.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, stop, rulesOpen]);

  const blocked = Boolean(voice.warning?.blocked);

  const status = {
    idle: copy.tapToSpeak,
    listening: copy.listening,
    thinking: copy.thinking,
    speaking: copy.speaking,
  }[voice.phase];
  const notices: Record<Exclude<VoiceNotice, ''>, string> = {
    noSpeech: copy.noSpeech,
    micDenied: copy.micDenied,
    languageUnsupported: copy.languageUnsupported,
    noVoiceOutput: copy.noVoiceOutput,
  };
  const listening = voice.phase === 'listening';
  const busy = voice.phase === 'thinking';

  return (
    <>
      {/* Two round buttons at the bottom: AI Tutor chat and the voice assistant. */}
      <button
        type="button"
        className="agent-bubble tutor-bubble"
        aria-label="AI Tutor"
        title="AI Tutor"
        onClick={() => setTutorOpen(true)}
      >
        <Sparkles size={22} />
      </button>
      {!tutorOpen && (
        <button
          ref={bubble}
          type="button"
          className={'agent-bubble' + (open ? ' is-open' : '')}
          aria-expanded={open}
          aria-label={copy.assistant}
          title={copy.assistant}
          onClick={() => (open ? close() : setOpen(true))}
        >
          <AssistantPet phase={voice.phase} compact audioLevel={voice.audioLevel} />
          <span className="agent-pulse" aria-hidden="true" />
        </button>
      )}

      {open && !tutorOpen && (
        <aside
          role="dialog"
          aria-label={copy.assistant}
          className="fixed right-[22px] bottom-[90px] z-[var(--z-panel)] flex max-h-[calc(100dvh-106px)] w-[min(410px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-[var(--shadow-3)] max-[860px]:bottom-[148px] max-[860px]:max-h-[calc(100dvh-164px)] max-[560px]:right-4"
        >
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-primary-soft/80 px-4 py-3">
            <h2 className="m-0 flex items-center gap-2 text-[15px] font-semibold">
              <Bot size={18} aria-hidden="true" className="text-brand" />
              {copy.assistant}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="icon-button"
                onClick={() => setRulesOpen(true)}
                aria-label={rulesCopy.buttonLabel}
                title={rulesCopy.buttonLabel}
              >
                <HelpCircle size={17} />
              </button>
              <button type="button" className="icon-button" onClick={close} aria-label={copy.close}>
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-col items-center gap-3 overflow-y-auto px-4 pt-4 pb-5 text-center">
            <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-gradient-to-b from-primary-soft/45 to-background/60 px-6 py-3 w-full">
              <AssistantPet phase={voice.phase} audioLevel={voice.audioLevel} />
              {voiceAccess !== 'open' ? (
                <div className="mt-2 grid justify-items-center gap-2">
                  <p role="status" className="m-0 text-sm">
                    {MEMBERSHIP_COPY[language].features.voiceAssistant} · Ultra
                  </p>
                  <Link href="/plans" className="button primary" onClick={close}>
                    Ultra
                  </Link>
                </div>
              ) : blocked ? (
                <div className="mt-2 w-full grid gap-2">
                  <BlockCountdown
                    blockedUntil={voice.warning?.blockedUntil}
                    language={language}
                    compact
                    onExpire={() => voice.setWarning(null)}
                  />
                </div>
              ) : voice.supported ? (
                <div className="mt-2 flex flex-col items-center gap-2">
                  <button
                    ref={mic}
                    type="button"
                    onClick={voice.start}
                    disabled={busy}
                    aria-pressed={listening}
                    aria-label={listening ? copy.micStop : copy.micStart}
                    title={listening ? copy.micStop : copy.micStart}
                    className={
                      'grid size-[68px] shrink-0 place-items-center rounded-full border-0 text-primary-foreground shadow-lg transition-all disabled:opacity-70 ' +
                      (listening
                        ? 'scale-105 bg-destructive ring-4 ring-destructive/30'
                        : 'bg-primary hover:bg-primary-hover')
                    }
                  >
                    {busy ? (
                      <AtlasLoader3D size="sm" />
                    ) : listening ? (
                      <Square size={24} fill="currentColor" />
                    ) : (
                      <Mic size={28} />
                    )}
                  </button>
                  <p role="status" className="m-0 text-sm font-medium text-muted-foreground">
                    {status}
                  </p>
                </div>
              ) : (
                <div className="mt-2 grid justify-items-center gap-2">
                  <p role="status" className="m-0 text-sm leading-6">
                    {copy.unsupported}
                  </p>
                  <button
                    ref={mic}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      setOpen(false);
                      setTutorOpen(true);
                    }}
                  >
                    <Sparkles size={16} aria-hidden="true" />
                    {copy.openTutor}
                  </button>
                </div>
              )}
            </div>

            {voice.warning && !blocked && (
              <div
                role="status"
                className="flex w-full items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-left text-xs font-medium text-warning"
              >
                <AlertTriangle size={15} aria-hidden="true" className="shrink-0" />
                <span>
                  {voice.warning.strikes}/{voice.warning.maxStrikes}
                </span>
              </div>
            )}

            {voice.heard && (
              <div className="w-full rounded-xl border border-border/70 bg-muted/50 px-3 py-2 text-left text-sm leading-6">
                <span className="text-xs font-medium text-subtle-foreground">{copy.heard}: </span>
                <span>«{voice.heard}»</span>
              </div>
            )}

            {voice.navigatedHref && (
              <div className="flex w-full items-center gap-2 rounded-xl border border-success/35 bg-success-soft/60 px-3 py-1.5 text-left text-xs font-medium text-success">
                <Compass size={14} aria-hidden="true" className="shrink-0" />
                <span>{extra.opened}</span>
              </div>
            )}

            {typedCaption && (
              <div
                aria-live="polite"
                className="w-full max-h-52 overflow-y-auto rounded-xl border border-border/80 bg-muted/80 px-3.5 py-2.5 text-left text-sm leading-6 wrap-anywhere"
              >
                <p className="m-0 whitespace-pre-wrap">{typedCaption}</p>
              </div>
            )}

            {voice.codeExamples.length > 0 && (
              <div className="w-full grid gap-2 text-left">
                {voice.codeExamples.map((code, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-xl border border-slate-700/60 bg-[#0b1120] text-[#e2e8f0]"
                  >
                    <div className="flex items-center gap-1.5 border-b border-slate-700/60 px-3 py-1.5 text-[11px] font-semibold text-sky-300">
                      <Code2 size={13} aria-hidden="true" />
                      <span>{extra.codeTitle}</span>
                    </div>
                    <pre className="m-0 max-h-40 overflow-auto p-3 font-mono text-xs leading-5">
                      <code>{code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {voice.links.length > 0 && (
              <div className="flex w-full flex-wrap justify-start gap-2">
                {voice.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/35 bg-primary-soft/60 px-2.5 py-1.5 text-xs font-semibold text-brand no-underline transition-colors hover:bg-primary-soft"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}

            {voice.phase === 'speaking' && (
              <button type="button" className="button subtle" onClick={voice.stop}>
                {copy.stopSpeaking}
              </button>
            )}
            {voice.notice && (
              <p role="status" className="m-0 text-xs leading-5 text-warning">
                {notices[voice.notice]}
              </p>
            )}
          </div>
        </aside>
      )}
      <RulesModal open={rulesOpen} language={language} onClose={() => setRulesOpen(false)} />
    </>
  );
}
