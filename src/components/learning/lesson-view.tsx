'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Code2, BookOpen, MessageSquareText } from 'lucide-react';
import { getTopic, questionsForTopic, topicTitle } from '@/content/course';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { tr } from '@/lib/translate';
import { PageHeading } from './page-heading';
import { QuestionAnswer } from './question-answer';
export function LessonView({ topicId }: { topicId: string }) {
  const state = useLearningStore();
  const copy = COPY[state.language];
  const [tab, setTab] = useState('lesson');
  const [query, setQuery] = useState('');
  const topic = getTopic(topicId)!;
  const questions = questionsForTopic(topicId);
  const filtered = questions.filter((question) =>
    question.question.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title={topicTitle(topic, state.language)}
        subtitle={copy.month + ' ' + topic.month}
        back={'/plan/' + topic.month}
      >
        <button
          className="button primary"
          disabled={state.completedTopics.includes(topicId)}
          onClick={() => state.completeTopic(topicId)}
        >
          <CheckCircle2 size={17} />
          {state.completedTopics.includes(topicId) ? copy.completed : copy.complete}
        </button>
      </PageHeading>
      <div className="tabs" role="tablist" aria-label={copy.lesson}>
        {[
          ['lesson', copy.lesson, BookOpen],
          ['questions', copy.questions, MessageSquareText],
          ['practice', copy.practice, Code2],
        ].map(([id, label, Icon]) => {
          const TabIcon = Icon as typeof BookOpen;
          return (
            <button
              role="tab"
              aria-selected={tab === id}
              key={String(id)}
              onClick={() => setTab(String(id))}
            >
              <TabIcon size={17} />
              {String(label)}
              {id === 'questions' && <span className="count">{questions.length}</span>}
            </button>
          );
        })}
      </div>
      {tab === 'lesson' && (
        <div className="lesson-grid">
          <article className="panel lesson-article">
            {topic.explanation.map((section, index) => (
              <section key={index} lang={state.contentLanguage}>
                <h2>{tr(section.title, state.contentLanguage)}</h2>
                <p className="preserve-lines">{tr(section.text, state.contentLanguage)}</p>
              </section>
            ))}
            {topic.code.map((code, index) => (
              <details className="code-disclosure" key={index} open={index === 0}>
                <summary>
                  {copy.code} {index + 1}
                </summary>
                <pre tabIndex={0}>
                  <code>{code}</code>
                </pre>
              </details>
            ))}
            <p className="source-line">
              {copy.source}: {topic.source}
            </p>
          </article>
          <aside className="lesson-aside">
            <section className="panel">
              <h3>{copy.flow}</h3>
              <ol className="flow-steps">
                {topic.flow.map((step, index) => (
                  <li key={index}>
                    <span>{index + 1}</span>
                    <p lang={state.contentLanguage}>{tr(step, state.contentLanguage)}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section className="panel">
              <h3>{copy.questions}</h3>
              <p>
                {questions.length} {copy.questionsOf}
              </p>
              <Link className="button primary full-width" href={'/study?topic=' + topicId}>
                {copy.learn}
                <ArrowRight size={16} />
              </Link>
              <Link className="button subtle full-width" href={'/tests?topic=' + topicId}>
                {copy.tests}
              </Link>
            </section>
          </aside>
        </div>
      )}
      {tab === 'questions' && (
        <section className="panel">
          <div className="section-heading">
            <h2>{copy.questions}</h2>
            <div className="button-row">
              <Link className="button subtle" href={'/tests?topic=' + topicId}>
                {copy.tests}
              </Link>
              <Link className="button subtle" href={'/interview?topic=' + topicId}>
                {copy.interview}
              </Link>
            </div>
          </div>
          <input
            className="search-input"
            aria-label={copy.search}
            placeholder={copy.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="question-list">
            {filtered.map((question, index) => (
              <details key={question.id}>
                <summary>
                  <span>{index + 1}</span>
                  <span lang={state.contentLanguage}>
                    {tr(question.question, state.contentLanguage)}
                  </span>
                </summary>
                <QuestionAnswer question={question} />
              </details>
            ))}
          </div>
        </section>
      )}
      {tab === 'practice' && (
        <section className="panel practice-intro">
          <Code2 size={28} />
          <h2>{copy.practiceCount}</h2>
          <p lang={state.contentLanguage}>
            {state.contentLanguage === 'ru'
              ? 'Потренируй эту тему: меняй пример, запускай код и проверяй результат.'
              : state.contentLanguage === 'en'
                ? 'Practice this topic: change the example, run the code and check the result.'
                : 'Ҳамин мавзӯъро бо код, тағйир додани мисол ва санҷидани натиҷа машқ кун.'}
          </p>
          <Link
            className="button primary"
            href={'/practice?topic=' + topicId + '&month=' + topic.month}
          >
            {copy.practice}
            <ArrowRight size={17} />
          </Link>
        </section>
      )}
    </>
  );
}
