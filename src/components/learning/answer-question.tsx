'use client';
import { useState } from 'react';
import { CheckCircle2, Copy, NotebookPen } from 'lucide-react';
import type { AnswerQuestion, AnswerTopic, SourceAnswerQuestion } from '@/content/answers';
import { COPY } from '@/lib/i18n';
import { COPY_CODE_ERROR } from '@/lib/learning-ui-copy';
import type { ContentLocale, InterfaceLocale } from '@/lib/locale';
import { tr } from '@/lib/translate';
import { useLearningStore } from '@/stores/learning-store';
import { ANSWER_READER_COPY } from './answer-reader-copy';

/** A code example with a copy button. */
export function AnswerCodeBlock({ code, language }: { code: string; language: InterfaceLocale }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }
  return (
    <div className="answer-code">
      <div className="answer-code-toolbar">
        <button type="button" className="button subtle" onClick={copyCode}>
          <Copy size={15} />
          {status === 'copied' ? COPY[language].copied : COPY[language].copy}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
      {status === 'error' && <p role="alert">{COPY_CODE_ERROR[language]}</p>}
    </div>
  );
}

/** One question: answer, extra explanations, code, diagrams and the study buttons. */
export function ReadingQuestion({
  question,
  index,
  topic,
}: {
  question: AnswerQuestion;
  index: number;
  topic: AnswerTopic;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const learned = useLearningStore((state) =>
    question.aliases.some((id) => state.studied.includes(id)),
  );
  const noteExists = useLearningStore((state) =>
    state.notes.some((note) => question.aliases.some((id) => note.id === 'answer:' + id)),
  );
  const markStudied = useLearningStore((state) => state.markStudied);
  const saveNote = useLearningStore((state) => state.saveNote);
  const copy = COPY[language];
  const text = ANSWER_READER_COPY[language];
  const translate = (value: string) => tr(value, contentLanguage);

  /** Saves the whole answer, its variants and sources as one note. */
  function save() {
    const content = [
      question.answer,
      ...question.deeper,
      question.explanation,
      ...question.code,
      ...question.diagrams.map((diagram) => diagram.steps.join(' → ')),
      ...topic.explanation.map((section) => section.title + '\n' + section.text),
      topic.flow.join(' → '),
      ...topic.code,
      ...question.variants.flatMap((variant) => [
        variant.topicTitle,
        variant.context,
        variant.answer,
        ...variant.deeper,
        variant.explanation,
        ...variant.code,
        ...variant.diagrams.map((diagram) => diagram.steps.join(' → ')),
        ...variant.topicExplanation.map((section) => section.title + '\n' + section.text),
        variant.flow.join(' → '),
        ...variant.topicCode,
        'Источник: ' +
          variant.topicSources.join(' + ') +
          ' / ' +
          variant.topicSourceId +
          ' / ' +
          variant.sourceId,
      ]),
      'Источник: ' + topic.sources.join(' + ') + ' / ' + topic.sourceId + ' / ' + question.sourceId,
    ]
      .filter(Boolean)
      .join('\n\n');
    saveNote({ id: 'answer:' + question.id, title: question.question, content });
  }
  return (
    <details className="answer-reading-question" id={question.id} open={index === 0}>
      <summary>
        <span className="answer-number">{index + 1}</span>
        <span lang={contentLanguage}>{translate(question.question)}</span>
        {learned && <CheckCircle2 size={17} aria-label={copy.learned} />}
      </summary>
      <div className="answer-reading-body" lang={contentLanguage}>
        <AnswerContent question={question} language={language} contentLanguage={contentLanguage} />
        {question.variants.map((variant) => (
          <section className="answer-variant" key={variant.id}>
            <h3>
              {text.addition} · {translate(variant.topicTitle)}
            </h3>
            {variant.context && <p className="preserve-lines">{translate(variant.context)}</p>}
            <AnswerContent
              question={variant}
              language={language}
              contentLanguage={contentLanguage}
            />
            {variant.topicExplanation.map((section, i) => (
              <section key={i}>
                <h3>{translate(section.title)}</h3>
                <p className="preserve-lines">{translate(section.text)}</p>
              </section>
            ))}
            {variant.topicCode.map((code, i) => (
              <AnswerCodeBlock key={i} code={code} language={language} />
            ))}
            {variant.flow.length > 0 && <Flow steps={variant.flow} language={contentLanguage} />}
            <p className="source-line">
              {copy.source}: {variant.topicSources.join(' + ')} · {variant.topicSourceId} ·{' '}
              {variant.sourceId}
            </p>
          </section>
        ))}
        <div className="button-row">
          <button
            className="button primary"
            disabled={learned}
            onClick={() => markStudied(question.id)}
          >
            <CheckCircle2 size={16} />
            {learned ? copy.learned : copy.markLearned}
          </button>
          <button className="button subtle" disabled={noteExists} onClick={save}>
            <NotebookPen size={16} />
            {noteExists ? copy.saved : text.saveToNotes}
          </button>
        </div>
      </div>
    </details>
  );
}
/** The answer body shared by a question and its variants. */
function AnswerContent({
  question,
  language,
  contentLanguage,
}: {
  question: SourceAnswerQuestion;
  language: InterfaceLocale;
  contentLanguage: ContentLocale;
}) {
  const copy = COPY[language];
  const translate = (value: string) => tr(value, contentLanguage);
  return (
    <div className="answer-content-block">
      <h3>{copy.answer}</h3>
      <p className="preserve-lines">{translate(question.answer)}</p>
      {question.deeper.length > 0 && (
        <section className="answer-deeper">
          <h3>{translate(question.deeperTitle)}</h3>
          <ul>
            {question.deeper.map((point, i) => (
              <li key={i}>{translate(point)}</li>
            ))}
          </ul>
        </section>
      )}
      {question.code.map((code, i) => (
        <section key={i}>
          <h3>{translate(question.codeLabel) || copy.code}</h3>
          <AnswerCodeBlock code={code} language={language} />
        </section>
      ))}
      {question.explanation && (
        <section>
          <h3>{ANSWER_READER_COPY[language].whatHappened}</h3>
          <p className="preserve-lines">{translate(question.explanation)}</p>
        </section>
      )}
      {question.diagrams.map((diagram, i) => (
        <section key={i}>
          <h3>{translate(diagram.title)}</h3>
          <Flow steps={diagram.steps} language={contentLanguage} />
        </section>
      ))}
    </div>
  );
}
/** Numbered steps of a process. */
export function Flow({ steps, language }: { steps: string[]; language: ContentLocale }) {
  return (
    <ol className="flow-steps">
      {steps.map((step, index) => (
        <li key={index}>
          <span>{index + 1}</span>
          <p lang={language}>{tr(step, language)}</p>
        </li>
      ))}
    </ol>
  );
}
