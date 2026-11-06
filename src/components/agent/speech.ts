import type { InterfaceLocale } from '@/lib/locale';

/** Browser language codes for speaking and listening. */
export const SPEECH_LOCALE: Record<InterfaceLocale, string> = {
  ru: 'ru-RU',
  tg: 'tg-TJ',
  uk: 'uk-UA',
  ja: 'ja-JP',
  ko: 'ko-KR',
  en: 'en-US',
};

/** Reads an answer aloud. Links are skipped and long answers are cut to 600 characters. */
export function speak(text: string, language: InterfaceLocale) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const locale = SPEECH_LOCALE[language];
  const utterance = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, '').slice(0, 600));
  utterance.lang = locale;
  const voice = window.speechSynthesis
    .getVoices()
    .find((candidate) => candidate.lang.toLowerCase().startsWith(locale.slice(0, 2)));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
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
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

/**
 * Browser speech-to-text. Chrome, Edge and Safari support it; Firefox does
 * not, so the microphone button is hidden there.
 */
export function recognitionConstructor(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}
