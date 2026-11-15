'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import type { AgentLink } from '@/lib/agent/agent-reply';
import { guideContext, siteGuideAnswer } from '@/lib/agent/site-agent';
import { guideLanguage } from '@/lib/agent/guide-text';
import { matchVoiceCommand } from '@/lib/agent/voice-commands';
import { spokenText } from '@/lib/agent/voice-answer';
import type { InterfaceLocale } from '@/lib/locale';
import { smalltalkKind, smalltalkLanguage, smalltalkReply } from '@/lib/tutor/smalltalk';
import { useAppStore } from '@/stores/app-store';
import { askTutor, tutorLanguage, type SpokenTurn } from './ask-tutor';
import { AGENT_COPY } from './site-agent-copy';
import {
  SPEECH_LOCALE,
  recognitionConstructor,
  speak,
  stopSpeaking,
  type Recognition,
} from './speech';

export type VoicePhase = 'idle' | 'listening' | 'thinking' | 'speaking';
export type VoiceNotice = '' | 'noSpeech' | 'micDenied' | 'languageUnsupported' | 'noVoiceOutput';

const MAX_SPOKEN_QUESTION = 400;
const NO_PROGRESS = {
  completedTopics: [],
  completedPractice: [],
  confirmedDays: [],
  masteredQuestions: [],
};
const noSubscription = () => () => undefined;

interface Progress {
  completedTopics: readonly string[];
  completedPractice: readonly string[];
  confirmedDays: readonly string[];
  masteredQuestions: readonly string[];
  drafts?: Record<string, string>;
}

/**
 * The voice assistant's brain: listens once per tap, decides what was asked
 * (a command, a question about the site, a greeting or a course question),
 * speaks the answer and keeps a one-line caption of it.
 */
export function useVoiceAssistant({
  language,
  owner,
  courseId,
  progress,
}: {
  language: InterfaceLocale;
  owner: string | null;
  courseId: string;
  progress?: Progress;
}) {
  const router = useRouter();
  const copy = AGENT_COPY[language];
  const supported = useSyncExternalStore(
    noSubscription,
    () => recognitionConstructor() !== null,
    () => false,
  );
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [heard, setHeard] = useState('');
  const [caption, setCaption] = useState('');
  const [links, setLinks] = useState<AgentLink[]>([]);
  const [notice, setNotice] = useState<VoiceNotice>('');

  const recognition = useRef<Recognition | null>(null);
  const transcript = useRef('');
  const failed = useRef(false);
  const pending = useRef<AbortController | null>(null);
  const turns = useRef<SpokenTurn[]>([]);
  // Every spoken answer gets a number so a cancelled answer cannot end a newer one.
  const speechId = useRef(0);
  const latest = useRef<(text: string) => Promise<void>>(async () => undefined);

  const say = useCallback(
    (text: string, nextLinks: AgentLink[] = [], textLanguage: InterfaceLocale = language) => {
      const spoken = spokenText(text);
      const id = ++speechId.current;
      setCaption(spoken);
      setLinks(nextLinks.slice(0, 2));
      setPhase('speaking');
      const started = speak(spoken, textLanguage, () => {
        if (speechId.current === id) setPhase('idle');
      });
      if (!started) {
        setNotice('noVoiceOutput');
        setPhase('idle');
      }
    },
    [language],
  );

  /** Stops listening, speaking and any answer that is still on its way. */
  const cancelAll = useCallback(() => {
    speechId.current++;
    pending.current?.abort();
    pending.current = null;
    const active = recognition.current;
    recognition.current = null;
    if (active) {
      active.onend = null;
      active.onresult = null;
      active.onerror = null;
      if (active.abort) active.abort();
      else active.stop();
    }
    stopSpeaking();
    setPhase('idle');
  }, []);

  const handle = async (text: string) => {
    const command = matchVoiceCommand(text, courseId);
    if (command?.type === 'stop') {
      cancelAll();
      return;
    }
    if (command?.type === 'help') return say(copy.help);
    if (command?.type === 'tutor') {
      say(copy.tutorOpened);
      useAppStore.getState().setTutorDrawerOpen(true);
      return;
    }
    if (command?.type === 'navigate') {
      say(copy.nav[command.target]);
      router.push(command.href);
      return;
    }
    const talk = smalltalkKind(text);
    if (talk === 'greeting') return say(copy.greeting);
    if (talk === 'capabilities') return say(copy.help);
    if (talk) {
      const spokenIn = smalltalkLanguage(text, tutorLanguage(language));
      return say(smalltalkReply(talk, spokenIn, text), [], spokenIn);
    }

    // Questions about the platform are answered by the guide, without a network request.
    const guide = siteGuideAnswer(
      text,
      guideContext({ language, selectedCourse: courseId, progress: progress ?? NO_PROGRESS }),
    );
    if (guide) return say(guide.reply, guide.links, guideLanguage(language));

    // Questions about a topic go to the tutor, which keeps its own sign-in and budget gates.
    setPhase('thinking');
    const request = new AbortController();
    pending.current = request;
    try {
      const reply = await askTutor({
        text,
        courseId,
        owner,
        history: turns.current,
        language,
        signal: request.signal,
      });
      if (request.signal.aborted) return;
      if (reply.kind !== 'error')
        turns.current = [
          ...turns.current,
          { role: 'user' as const, content: text },
          { role: 'assistant' as const, content: reply.text },
        ].slice(-4);
      say(reply.text, reply.links, reply.kind === 'error' ? language : tutorLanguage(language));
    } catch {
      if (!request.signal.aborted) say(copy.unavailable);
    } finally {
      if (pending.current === request) pending.current = null;
    }
  };
  useEffect(() => {
    latest.current = handle;
  });

  /**
   * Listens once. Chrome has no Tajik recognizer, so Tajik falls back to Russian,
   * which people in Tajikistan often speak too.
   */
  const listen = useCallback(function run(lang: string, canFallBack: boolean) {
    const Constructor = recognitionConstructor();
    if (!Constructor) return;
    const next = new Constructor();
    next.lang = lang;
    next.interimResults = true;
    next.continuous = false;
    let languageMissing = false;
    next.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim()
        .slice(0, MAX_SPOKEN_QUESTION);
      transcript.current = text;
      setHeard(text);
    };
    next.onerror = (event) => {
      failed.current = true;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed')
        setNotice('micDenied');
      else if (event.error === 'language-not-supported') {
        languageMissing = true;
        if (!canFallBack) setNotice('languageUnsupported');
      } else if (event.error !== 'aborted') setNotice('noSpeech');
    };
    next.onend = () => {
      if (recognition.current === next) recognition.current = null;
      if (languageMissing && canFallBack) {
        failed.current = false;
        run('ru-RU', false);
        return;
      }
      const text = transcript.current.trim();
      if (text && !failed.current) void latest.current(text);
      else {
        setPhase('idle');
        if (!failed.current) setNotice('noSpeech');
      }
    };
    recognition.current = next;
    try {
      next.start();
      setPhase('listening');
    } catch {
      recognition.current = null;
      setPhase('idle');
    }
  }, []);

  const start = useCallback(() => {
    if (recognition.current) {
      // A second tap while listening finishes the recording.
      recognition.current.stop();
      return;
    }
    if (!recognitionConstructor()) return;
    cancelAll();
    transcript.current = '';
    failed.current = false;
    setHeard('');
    setCaption('');
    setLinks([]);
    setNotice('');
    listen(SPEECH_LOCALE[language], language === 'tg');
  }, [cancelAll, language, listen]);

  // Leaving the page stops listening, speaking and any pending answer.
  useEffect(() => cancelAll, [cancelAll]);

  return { supported, phase, heard, caption, links, notice, start, stop: cancelAll };
}
