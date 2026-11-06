'use client';
import { useState } from 'react';
import type { LearningFlow } from '@/lib/courses/learning-flow';
import { traceCopy, useFlowText } from './lesson-flow-copy';

/** Escapes text before it is placed inside the HTML example. */
const escaped = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/** Interactive HTML example: edit title, h1 or p and see the real page update. */
export function HtmlDocumentExplorer({
  demo,
}: {
  demo: Extract<LearningFlow['demo'], { kind: 'html-document' }>;
}) {
  const { language, text, label } = useFlowText();
  const [selected, setSelected] = useState<'title' | 'h1' | 'p'>('title');
  const [values, setValues] = useState({
    title: text(demo.tabTitle),
    h1: text(demo.heading),
    p: text(demo.paragraph),
  });
  const code = `<!doctype html>\n<html lang="${language}">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>${escaped(values.title)}</title>\n  </head>\n  <body>\n    <h1>${escaped(values.h1)}</h1>\n    <p>${escaped(values.p)}</p>\n  </body>\n</html>`;
  const node = (id: typeof selected) => (
    <button
      type="button"
      className="button subtle"
      aria-pressed={selected === id}
      onClick={() => setSelected(id)}
    >
      {id}
    </button>
  );
  return (
    <div className="html-document-explorer">
      <p>{label('simplified')}</p>
      <ul className="dom-element-tree">
        <li>
          html
          <ul>
            <li>
              head
              <ul>
                <li>{node('title')}</li>
              </ul>
            </li>
            <li>
              body
              <ul>
                <li>{node('h1')}</li>
                <li>{node('p')}</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
      <label className="dom-text-input">
        {label('node')}: {selected}
        <input
          aria-label={`${label('node')}: ${selected}`}
          maxLength={160}
          value={values[selected]}
          onChange={(event) => setValues((old) => ({ ...old, [selected]: event.target.value }))}
        />
      </label>
      <p className="demo-browser-tab">
        {label('tab')}: <strong>{values.title}</strong>
      </p>
      <iframe
        className="html-preview"
        title={label('preview')}
        sandbox=""
        referrerPolicy="no-referrer"
        srcDoc={code}
      />
      <details open>
        <summary>{label('code')}</summary>
        <pre tabIndex={0}>
          <code>{code}</code>
        </pre>
      </details>
    </div>
  );
}

/** Walks through a fixed code example line by line. It never runs the learner's code. */
export function CodeTrace({
  demo,
}: {
  demo: Extract<LearningFlow['demo'], { kind: 'code-trace' }>;
}) {
  const { text, ui } = useFlowText();
  const [index, setIndex] = useState(0);
  const step = demo.steps[index];
  return (
    <div className="code-trace">
      <p>{traceCopy.note[ui]}</p>
      <pre tabIndex={0}>
        <code>
          {demo.code.split('\n').map((line, i) => (
            <span
              key={i}
              className="code-trace-line"
              aria-current={step.line === i + 1 ? 'step' : undefined}
            >
              {i + 1}. {line || ' '}
            </span>
          ))}
        </code>
      </pre>
      <div aria-live="polite">
        <p>
          {index + 1} / {demo.steps.length}: {text(step.explanation)}
        </p>
        <pre tabIndex={0}>
          <code>{step.values}</code>
        </pre>
      </div>
      <div className="button-row">
        <button
          type="button"
          className="button subtle"
          disabled={index === 0}
          onClick={() => setIndex((value) => value - 1)}
        >
          {traceCopy.previous[ui]}
        </button>
        <button
          type="button"
          className="button subtle"
          disabled={index === demo.steps.length - 1}
          onClick={() => setIndex((value) => value + 1)}
        >
          {traceCopy.next[ui]}
        </button>
      </div>
    </div>
  );
}
