import type { InterfaceLocale } from '@/lib/locale';

/** Browser language codes for speaking and listening. */
export const SPEECH_LOCALE: Record<InterfaceLocale, string> = {
  ru: 'ru-RU',
  tg: 'tg-TJ',
  es: 'es-ES',
  en: 'en-US',
};

/** True when the browser can read text aloud. */
export function speechOutputAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Reads an answer aloud. Links are skipped and long answers are cut to 600 characters.
 * `onEnd` runs when speaking finishes or fails. Returns false when the browser cannot speak.
 */
export function speak(text: string, language: InterfaceLocale, onEnd?: () => void): boolean {
  if (!speechOutputAvailable()) return false;
  let locale = SPEECH_LOCALE[language];
  const utterance = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, '').slice(0, 600));
  const voices = window.speechSynthesis.getVoices();
  const find = (code: string) =>
    voices.find((candidate) => candidate.lang.toLowerCase().startsWith(code.slice(0, 2)));
  let voice = find(locale);
  // Browsers have no Tajik voice. A Russian voice reads Tajik Cyrillic clearly enough.
  if (!voice && language === 'tg') {
    locale = SPEECH_LOCALE.ru;
    voice = find(locale);
  }
  utterance.lang = locale;
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

/** Stops any answer that is being read aloud. */
export function stopSpeaking() {
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
