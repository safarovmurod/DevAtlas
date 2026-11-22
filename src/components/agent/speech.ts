import type { InterfaceLocale } from '@/lib/locale';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';

/** Browser language codes for speaking and listening. */
export const SPEECH_LOCALE: Record<InterfaceLocale, string> = {
  ru: 'ru-RU',
  tg: 'tg-TJ',
  es: 'es-ES',
  en: 'en-US',
};

let activeAudio: HTMLAudioElement | null = null;
let activeBlobUrl: string | null = null;
let activeFetch: AbortController | null = null;
let activeMeterFrame = 0;
let activeAudioCtx: AudioContext | null = null;
let speakGeneration = 0;

/** True when the browser can read text aloud. */
export function speechOutputAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** True in real browsers (not jsdom unit tests) where studio Audio playback + AnalyserNode work. */
function canUseStudioVoice(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent ?? '')) return false;
  return (
    typeof Audio === 'function' &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  );
}

function cleanupAudioPlayback() {
  if (activeMeterFrame) {
    cancelAnimationFrame(activeMeterFrame);
    activeMeterFrame = 0;
  }
  if (activeFetch) {
    activeFetch.abort();
    activeFetch = null;
  }
  if (activeAudio) {
    activeAudio.onended = null;
    activeAudio.onerror = null;
    try {
      activeAudio.pause();
      activeAudio.src = '';
    } catch {
      // Ignore audio teardown failures.
    }
    activeAudio = null;
  }
  if (activeBlobUrl) {
    try {
      URL.revokeObjectURL(activeBlobUrl);
    } catch {
      // Ignore revoke failures.
    }
    activeBlobUrl = null;
  }
  if (activeAudioCtx) {
    const ctx = activeAudioCtx;
    activeAudioCtx = null;
    void ctx.close().catch(() => undefined);
  }
}

function speakWithBrowserSynthesis(
  text: string,
  language: InterfaceLocale,
  onEnd?: () => void,
): boolean {
  if (!speechOutputAvailable()) return false;
  let locale = SPEECH_LOCALE[language];
  const utterance = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, '').slice(0, 600));
  const voices = window.speechSynthesis.getVoices();
  const find = (code: string) =>
    voices.find((candidate) => candidate.lang.toLowerCase().startsWith(code.slice(0, 2)));
  let voice = find(locale);
  // Browsers rarely ship a Tajik voice; Russian voice reads Cyrillic fallback cleanly.
  if (!voice && language === 'tg') {
    locale = SPEECH_LOCALE.ru;
    voice = find(locale);
  }
  utterance.lang = locale;
  utterance.rate = 0.98;
  utterance.pitch = 1.02;
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export type SpeakOptions = {
  /** Called with normalized 0..1 audio amplitude while studio voice plays. */
  onLevel?: (level: number) => void;
  /** Disable server TTS for offline/local-only commands if desired. */
  preferServer?: boolean;
};

/**
 * Reads an answer aloud. In real browsers, first calls `/api/voice/speak` (powered by Gemini
 * studio human voices with authentic Tajik/Russian/English/Spanish pronunciation and live
 * Web Audio amplitude metering for the 3D avatar), falling back seamlessly to browser speech
 * synthesis if offline or unauthenticated.
 */
export function speak(
  text: string,
  language: InterfaceLocale,
  onEnd?: () => void,
  options: SpeakOptions = {},
): boolean {
  const cleaned = text
    .replace(/https?:\/\/\S+/g, '')
    .trim()
    .slice(0, 600);
  if (!cleaned) return false;
  const gen = ++speakGeneration;
  cleanupAudioPlayback();
  if (speechOutputAvailable()) window.speechSynthesis.cancel();

  const useServer = options.preferServer !== false && canUseStudioVoice();
  if (!useServer) {
    return speakWithBrowserSynthesis(cleaned, language, onEnd);
  }

  const controller = new AbortController();
  activeFetch = controller;

  void (async () => {
    try {
      const client = getSupabaseBrowserClient();
      const session = client ? (await getSessionWithTimeout(client)).data.session : null;
      if (gen !== speakGeneration || controller.signal.aborted) return;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers.Authorization = 'Bearer ' + session.access_token;

      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: cleaned, language }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(22_000)]),
      });
      if (gen !== speakGeneration || controller.signal.aborted) return;
      if (!res.ok) throw new Error('tts_fallback');

      const blob = await res.blob();
      if (gen !== speakGeneration || controller.signal.aborted || blob.size < 100)
        throw new Error('tts_empty');

      const url = URL.createObjectURL(blob);
      activeBlobUrl = url;
      const audio = new Audio(url);
      activeAudio = audio;

      // Wire real-time Web Audio AnalyserNode so the 3D instructor pulses to the actual human voice.
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx && options.onLevel) {
          const ctx = new AudioCtx();
          activeAudioCtx = ctx;
          const src = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          src.connect(analyser);
          analyser.connect(ctx.destination);
          const bins = new Uint8Array(analyser.frequencyBinCount);
          const sample = () => {
            if (gen !== speakGeneration || !activeAudio || activeAudio.paused) {
              options.onLevel?.(0);
              return;
            }
            analyser.getByteTimeDomainData(bins);
            let sum = 0;
            for (let i = 0; i < bins.length; i++) {
              const v = (bins[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.min(1, Math.sqrt(sum / bins.length) * 3.4);
            options.onLevel?.(rms);
            activeMeterFrame = requestAnimationFrame(sample);
          };
          audio.onplay = () => {
            if (ctx.state === 'suspended') void ctx.resume();
            activeMeterFrame = requestAnimationFrame(sample);
          };
        }
      } catch {
        // Analyser is purely visual; audio still plays cleanly without it.
      }

      const finish = () => {
        if (gen !== speakGeneration) return;
        options.onLevel?.(0);
        cleanupAudioPlayback();
        onEnd?.();
      };
      audio.onended = finish;
      audio.onerror = () => {
        if (gen !== speakGeneration) return;
        options.onLevel?.(0);
        cleanupAudioPlayback();
        if (!speakWithBrowserSynthesis(cleaned, language, onEnd)) onEnd?.();
      };
      await audio.play();
    } catch {
      if (gen !== speakGeneration || controller.signal.aborted) return;
      options.onLevel?.(0);
      cleanupAudioPlayback();
      const started = speakWithBrowserSynthesis(cleaned, language, onEnd);
      if (!started) onEnd?.();
    }
  })();

  return true;
}

/** Stops any answer that is being read aloud. */
export function stopSpeaking() {
  speakGeneration++;
  cleanupAudioPlayback();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

/** The part of the browser speech-to-text API that the assistant uses. */
export type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort?(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

/**
 * Browser speech-to-text. Chrome, Edge and Safari support it; Firefox does
 * not, so the assistant then points to the AI Tutor chat.
 */
export function recognitionConstructor(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}
