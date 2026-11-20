'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, Loader2, Mic, Sparkles, Square, X } from 'lucide-react';
import { useAccount } from '@/components/account/account-provider';
import { usePlanAccess } from '@/components/courses/use-practice-access';
import { MEMBERSHIP_COPY } from '@/lib/billing/copy';
import { removeOldAgentChat } from '@/lib/agent/agent-reply';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { AssistantPet } from './assistant-pet';
import { AGENT_COPY } from './site-agent-copy';
import { useVoiceAssistant, type VoiceNotice } from './use-voice-assistant';

/** Each account (or the guest) gets its own assistant session, so switching accounts starts fresh. */
export function SiteAgent() {
  const { user } = useAccount();
  return <SiteAgentSession key={user?.id ?? 'guest'} owner={user?.id ?? null} />;
}

/**
 * The DevAtlas assistant is voice only: it listens, answers by voice, and opens
 * pages when asked. Written questions go to the AI Tutor chat.
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
  const voice = useVoiceAssistant({ language, owner, courseId, progress });

  const [open, setOpen] = useState(false);
  const voiceAccess = usePlanAccess('voiceAssistant', open);
  const bubble = useRef<HTMLButtonElement>(null);
  const mic = useRef<HTMLButtonElement>(null);

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
      if (event.key !== 'Escape') return;
      event.preventDefault();
      stop();
      setOpen(false);
      bubble.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, stop]);

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
          <AssistantPet phase={voice.phase} compact />
          <span className="agent-pulse" aria-hidden="true" />
        </button>
      )}

      {open && !tutorOpen && (
        <aside
          role="dialog"
          aria-label={copy.assistant}
          className="fixed right-[22px] bottom-[90px] z-[var(--z-panel)] flex max-h-[calc(100dvh-106px)] w-[min(340px,calc(100vw-32px))] flex-col overflow-hidden rounded-[18px] border border-border bg-card text-foreground shadow-[var(--shadow-3)] max-[860px]:bottom-[148px] max-[860px]:max-h-[calc(100dvh-164px)] max-[560px]:right-4"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-primary-soft px-4 py-3">
            <h2 className="m-0 flex items-center gap-2 text-[15px]">
              <Bot size={18} aria-hidden="true" />
              {copy.assistant}
            </h2>
            <button type="button" className="icon-button" onClick={close} aria-label={copy.close}>
              <X size={18} />
            </button>
          </header>

          <div className="flex min-h-0 flex-col items-center gap-3 overflow-y-auto px-4 pt-4 pb-5 text-center">
            <AssistantPet phase={voice.phase} />
            {voiceAccess !== 'open' ? (
              <div className="grid justify-items-center gap-2">
                <p role="status">{MEMBERSHIP_COPY[language].features.voiceAssistant} · Ultra</p>
                <Link href="/plans" className="button primary" onClick={close}>
                  Ultra
                </Link>
              </div>
            ) : voice.supported ? (
              <>
                <button
                  ref={mic}
                  type="button"
                  onClick={voice.start}
                  disabled={busy}
                  aria-pressed={listening}
                  aria-label={listening ? copy.micStop : copy.micStart}
                  title={listening ? copy.micStop : copy.micStart}
                  className={
                    'grid size-[72px] shrink-0 place-items-center rounded-full border-0 text-primary-foreground transition-colors disabled:opacity-70 ' +
                    (listening ? 'bg-destructive' : 'bg-primary hover:bg-primary-hover')
                  }
                >
                  {busy ? (
                    <Loader2 size={30} className="animate-spin motion-reduce:animate-none" />
                  ) : listening ? (
                    <Square size={26} fill="currentColor" />
                  ) : (
                    <Mic size={30} />
                  )}
                </button>
                <p role="status" className="m-0 text-sm text-muted-foreground">
                  {status}
                </p>
              </>
            ) : (
              <>
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
              </>
            )}

            {voice.heard && (
              <p className="m-0 text-sm leading-6">
                <span className="text-subtle-foreground">{copy.heard}: </span>«{voice.heard}»
              </p>
            )}
            {voice.caption && (
              <p
                aria-live="polite"
                className="m-0 max-h-44 w-full overflow-y-auto rounded-xl bg-muted px-3 py-2 text-left text-sm leading-6 wrap-anywhere"
              >
                {voice.caption}
              </p>
            )}
            {voice.links.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {voice.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-brand no-underline"
                  >
                    {link.label}
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
    </>
  );
}
