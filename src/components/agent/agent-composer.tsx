'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { agentQuickPrompts } from '@/lib/agent/site-agent';
import type { InterfaceLocale } from '@/lib/locale';
import { AGENT_COPY, MIC_COPY } from './site-agent-copy';
import { SPEECH_LOCALE, recognitionConstructor, type Recognition } from './speech';

export const MAX_INPUT = 800;
const noSubscription = () => () => undefined;

/** Bottom of the assistant panel: quick questions, the input, voice input and send. */
export function AgentComposer({
  language,
  loading,
  input,
  onInput,
  onAsk,
  inputRef,
}: {
  language: InterfaceLocale;
  loading: boolean;
  input: string;
  onInput: (value: string) => void;
  onAsk: (text: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const copy = AGENT_COPY[language];
  const mic = MIC_COPY[language];
  const [listening, setListening] = useState(false);
  const [micNotice, setMicNotice] = useState('');
  const recognition = useRef<Recognition | null>(null);
  const micSupported = useSyncExternalStore(
    noSubscription,
    () => recognitionConstructor() !== null,
    () => false,
  );

  // Closing the panel also stops listening.
  useEffect(() => () => recognition.current?.stop(), []);

  function toggleMic() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const Constructor = recognitionConstructor();
    if (!Constructor) return;
    const next = new Constructor();
    next.lang = SPEECH_LOCALE[language];
    next.interimResults = true;
    next.continuous = false;
    // The transcript lands in the input for review instead of being sent blindly.
    next.onresult = (event) =>
      onInput(
        Array.from(event.results)
          .map((result) => result[0]?.transcript ?? '')
          .join(' ')
          .slice(0, MAX_INPUT),
      );
    next.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed')
        setMicNotice(mic.denied);
      else if (event.error === 'language-not-supported') setMicNotice(mic.unsupported);
      else setMicNotice('');
    };
    next.onend = () => {
      setListening(false);
      inputRef.current?.focus();
    };
    recognition.current = next;
    setMicNotice('');
    try {
      next.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  return (
    <div className="agent-composer">
      <p className="agent-footnote">{copy.historyNote}</p>
      <div className="agent-chips">
        {agentQuickPrompts(language).map((chip) => (
          <button key={chip} type="button" disabled={loading} onClick={() => onAsk(chip)}>
            {chip}
          </button>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onAsk(input);
        }}
      >
        <label className="sr-only" htmlFor="agent-input">
          {copy.inputLabel}
        </label>
        <textarea
          id="agent-input"
          ref={inputRef}
          value={input}
          rows={2}
          maxLength={MAX_INPUT}
          disabled={loading}
          onChange={(event) => onInput(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends, Shift+Enter makes a new line.
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onAsk(input);
            }
          }}
          placeholder={copy.placeholder}
        />
        {micSupported && (
          <button
            type="button"
            className={'icon-button' + (listening ? ' is-active' : '')}
            onClick={toggleMic}
            disabled={loading}
            aria-pressed={listening}
            aria-label={listening ? mic.stop : mic.start}
            title={listening ? mic.stop : mic.start}
          >
            {listening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
        )}
        <button
          className="button primary"
          type="submit"
          disabled={loading || !input.trim()}
          aria-label={copy.send}
        >
          <Send size={16} />
        </button>
      </form>
      {(listening || micNotice) && (
        <p className={'agent-footnote' + (micNotice ? ' warning-text' : '')} role="status">
          {micNotice || mic.listening}
        </p>
      )}
      <p className="agent-footnote">{copy.guideNote}</p>
    </div>
  );
}
