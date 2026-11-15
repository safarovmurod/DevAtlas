'use client';

import { useState, type FormEvent } from 'react';
import { matchesWrittenAnswer } from '@/lib/grading/written-answer';
import { COPY } from '@/lib/i18n';
import { useLearningStore } from '@/stores/learning-store';

const FEEDBACK = {
  ru: 'Ответ не совпал с ожидаемым. Сверьтесь с разбором и попробуйте ещё раз.',
  tg: 'Ҷавоб мувофиқ наомад. Намунаро бинед ва бори дигар кӯшиш кунед.',
  en: 'The answer did not match. Compare it with the reference and try again.',
  es: 'La respuesta no coincide. Compárala con el ejemplo e inténtalo de nuevo.',
};

export function WrittenAnswer({
  reference,
  accepted,
  caseSensitive,
  saved,
  onCheck,
}: {
  reference: string;
  accepted: readonly (string | undefined)[];
  caseSensitive?: boolean;
  saved?: { answer: string; correct: boolean };
  onCheck: (correct: boolean, answer: string) => void;
}) {
  const language = useLearningStore((state) => state.language);
  const ready = useLearningStore((state) => state.ready);
  const copy = COPY[language];
  const [draft, setDraft] = useState<string | null>(null);
  const answer = saved?.correct ? saved.answer : (draft ?? saved?.answer ?? '');
  const submitted = Boolean(saved && answer.trim() === saved.answer);

  function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = answer.trim();
    if (!ready || !value || saved?.correct || submitted) return;
    onCheck(matchesWrittenAnswer(value, accepted, caseSensitive), value);
  }

  return (
    <form className="grid min-w-0 gap-3" onSubmit={check}>
      <label className="answer-input grid gap-1.5">
        <span>{copy.yourAnswer}</span>
        <textarea
          className="w-full resize-y rounded-xl border border-border bg-background p-3"
          rows={3}
          maxLength={1500}
          value={answer}
          readOnly={saved?.correct}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <button
        type="submit"
        className="button primary justify-self-start"
        disabled={!ready || !answer.trim() || saved?.correct || submitted}
      >
        {copy.check}
      </button>
      {submitted && (
        <p role="status" className={saved?.correct ? 'success-text' : 'warning-text'}>
          {saved?.correct ? copy.correct : FEEDBACK[language]}
        </p>
      )}
      {saved && (
        <details>
          <summary>{copy.showAnswer}</summary>
          <p className="preserve-lines">{reference}</p>
        </details>
      )}
    </form>
  );
}
