'use client';
import { useState } from 'react';
import source from '@/content/imported/practice.json';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import type { InterfaceLocale } from '@/lib/locale';
import { PracticeWorkspace } from './practice-workspace';

const SOURCE_PRACTICE_COPY: Record<InterfaceLocale, { sourceNote: string; codeParts: string }> = {
  ru: {
    sourceNote:
      'Исходный пример из вашего HTML. API-адреса сохранены как в источнике; запросы отсюда не отправляются.',
    codeParts: 'Что делает каждая часть кода',
  },
  en: {
    sourceNote:
      'Original example from your HTML. API addresses are preserved; this page does not send those requests.',
    codeParts: 'What each part of the code does',
  },
  tg: {
    sourceNote:
      'Мисоли аслӣ аз HTML-и шумо. Суроғаҳои API мисли манбаъ нигоҳ дошта шудаанд; аз ин саҳифа дархост фиристода намешавад.',
    codeParts: 'Ҳар қисми код чӣ кор мекунад',
  },
  uk: {
    sourceNote:
      'Оригінальний приклад із вашого HTML. API-адреси збережено як у джерелі; звідси запити не надсилаються.',
    codeParts: 'Що робить кожна частина коду',
  },
  ja: {
    sourceNote:
      'あなたのHTMLにある元の例です。APIのアドレスは元のままで、このページからリクエストは送信されません。',
    codeParts: 'コードの各部分の役割',
  },
  ko: {
    sourceNote:
      '내 HTML의 원본 예제입니다. API 주소는 원본 그대로이며, 이 페이지에서는 요청을 보내지 않습니다.',
    codeParts: '코드의 각 부분이 하는 일',
  },
};
type SourceLesson = {
  group: string;
  title: string;
  method: string;
  intro: string;
  files: string[];
  blocks: { path: string; kind?: string; code: string; practiceCode: string; hintCode?: string }[];
  steps: string[][];
  memory: string;
  concepts?: string[][];
  relationNote?: string;
  usage?: { path: string; code: string; practiceCode: string }[];
};
export function SourcePractice() {
  const language = useLearningStore((state) => state.language);
  const copy = COPY[language];
  const [group, setGroup] = useState('Redux');
  const [active, setActive] = useState('r-setup');
  const [fileIndex, setFileIndex] = useState(0);
  const lessons = source.lessons as Record<string, SourceLesson>;
  const lesson = lessons[active];
  const block = lesson.blocks[fileIndex] || lesson.blocks[0];
  function changeGroup(value: string) {
    setGroup(value);
    setActive(Object.keys(lessons).find((id) => lessons[id].group === value)!);
    setFileIndex(0);
  }
  return (
    <section>
      <div className="filters">
        <select
          aria-label={copy.global}
          value={group}
          onChange={(event) => changeGroup(event.target.value)}
        >
          {source.groups.map(([name]) => (
            <option key={String(name)} value={String(name)}>
              {String(name)}
            </option>
          ))}
        </select>
        <select
          aria-label={copy.task}
          value={active}
          onChange={(event) => {
            setActive(event.target.value);
            setFileIndex(0);
          }}
        >
          {Object.entries(lessons)
            .filter(([, item]) => item.group === group)
            .map(([id, item]) => (
              <option value={id} key={id}>
                {item.title}
              </option>
            ))}
        </select>
      </div>
      <div className="panel source-intro">
        <h2>{lesson.title}</h2>
        <p lang="tg">{lesson.intro}</p>
        <ol className="source-steps">
          {lesson.steps.map((step, index) => (
            <li key={index}>
              <strong>{step[1]}</strong>
              <p lang="tg">{step[2]}</p>
              <code>{step[3]}</code>
            </li>
          ))}
        </ol>
        <p className="callout" lang="tg">
          {lesson.relationNote || lesson.memory}
        </p>
        <p className="small muted">{SOURCE_PRACTICE_COPY[language].sourceNote}</p>
      </div>
      <div className="tabs" role="tablist" aria-label={copy.files}>
        {lesson.blocks.map((item, index) => (
          <button
            role="tab"
            aria-selected={fileIndex === index}
            key={item.path}
            onClick={() => setFileIndex(index)}
          >
            {item.path}
          </button>
        ))}
      </div>
      {block && (
        <PracticeWorkspace
          key={active + '-' + fileIndex}
          exercise={{
            id: 'source-' + active + '-' + fileIndex,
            title: lesson.title,
            task: lesson.intro,
            starter: block.practiceCode,
            solution: block.code,
            hint: block.hintCode || '',
            files: [block.path],
            criteria: lesson.steps.map((step) => step[2]),
          }}
        />
      )}
      {lesson.concepts && (
        <details className="panel">
          <summary>{SOURCE_PRACTICE_COPY[language].codeParts}</summary>
          <div className="concept-grid">
            {lesson.concepts.map((concept, index) => (
              <section key={index}>
                <h3>{concept[0]}</h3>
                <p lang="tg">{concept.slice(1).join(' · ')}</p>
              </section>
            ))}
          </div>
        </details>
      )}
      {group in source.fullFiles && (
        <details className="panel">
          <summary>
            {copy.files} · {group}
          </summary>
          {source.fullFiles[group as keyof typeof source.fullFiles].map((file) => (
            <details key={file.path} className="code-disclosure">
              <summary>{file.path}</summary>
              <pre tabIndex={0}>
                <code>{file.code}</code>
              </pre>
            </details>
          ))}
        </details>
      )}
    </section>
  );
}
