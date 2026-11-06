'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { AnswerTopic } from '@/content/answers';
import { COPY } from '@/lib/i18n';
import { tr } from '@/lib/translate';
import { useLearningStore } from '@/stores/learning-store';
import { AnswerCodeBlock, Flow, ReadingQuestion } from './answer-question';
import { ANSWER_READER_COPY } from './answer-reader-copy';
import { PageHeading } from './page-heading';

/** File name of the original React material an answer comes from. */
const SOURCE_FILES: Record<string, string> = {
  deep: 'react_deep_understanding.html',
  quiz: 'react_quiz.html',
};
const sourceFile = (source: string) => SOURCE_FILES[source] ?? 'react-interview.html';

/** One answers topic: explanation, code, questions with answers and a link to practice. */
export function AnswerReader({ topic }: { topic: AnswerTopic }) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const studied = useLearningStore((state) => state.studied);
  const [query, setQuery] = useState('');
  useEffect(() => {
    function revealAnswer() {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target instanceof HTMLDetailsElement) target.open = true;
    }
    revealAnswer();
    window.addEventListener('hashchange', revealAnswer);
    return () => window.removeEventListener('hashchange', revealAnswer);
  }, [topic.id]);
  const copy = COPY[language];
  const text = ANSWER_READER_COPY[language];
  const translate = (value: string) => tr(value, contentLanguage);
  const count = topic.questions.filter((question) =>
    question.aliases.some((id) => studied.includes(id)),
  ).length;
  const filtered = topic.questions.filter((question) =>
    [
      question.question,
      question.answer,
      question.explanation,
      ...question.deeper,
      ...question.code,
      ...question.variants.flatMap((variant) => [
        variant.topicTitle,
        variant.answer,
        variant.explanation,
        ...variant.deeper,
        ...variant.code,
      ]),
    ].some(
      (value) =>
        translate(value).toLowerCase().includes(query.toLowerCase()) ||
        value.toLowerCase().includes(query.toLowerCase()),
    ),
  );
  return (
    <>
      <PageHeading title={translate(topic.title)} subtitle={topic.chapter} back="/answers">
        <span className="badge">
          <BookOpen size={15} />
          {topic.sources.includes('deep') ? copy.recommended : copy.interview} · {count}/
          {topic.questions.length} {copy.learned.toLowerCase()}
        </span>
      </PageHeading>
      <div className={'answer-reader-grid ' + (!topic.flow.length ? 'without-flow' : '')}>
        <article className="panel lesson-article" lang={contentLanguage}>
          {topic.context && (
            <section className="answer-context">
              <h2>{text.context}</h2>
              <p className="preserve-lines">{translate(topic.context)}</p>
            </section>
          )}
          {topic.explanation.map((section, index) => (
            <section key={index}>
              <h2>{translate(section.title)}</h2>
              <p className="preserve-lines">{translate(section.text)}</p>
            </section>
          ))}
          {topic.code.map((code, index) => (
            <section key={index}>
              <h2>
                {copy.code} {topic.code.length > 1 ? index + 1 : ''}
              </h2>
              <AnswerCodeBlock code={code} language={language} />
            </section>
          ))}
          <section>
            {topic.questions.length > 0 && (
              <div className="section-heading">
                <h2>
                  {copy.questions} · {topic.questions.length}
                </h2>
              </div>
            )}
            {topic.questions.length > 5 && (
              <input
                className="search-input"
                aria-label={copy.search}
                placeholder={copy.search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            )}
            <div className="answer-reading-list">
              {filtered.map((question) => (
                <ReadingQuestion
                  key={question.id}
                  question={question}
                  topic={topic}
                  index={topic.questions.indexOf(question)}
                />
              ))}
            </div>
            {!filtered.length && topic.questions.length > 0 && <p role="status">{copy.empty}</p>}
            {!topic.questions.length && !topic.relatedQuestions.length && (
              <p>{text.designExample}</p>
            )}
          </section>
          {topic.relatedQuestions.length > 0 && (
            <section className="answer-related">
              <h2>{text.shared}</h2>
              <p>{text.sharedIntro}</p>
              {topic.relatedQuestions.map((reference) => (
                <Link
                  id={reference.id}
                  className="answer-related-link"
                  key={reference.id}
                  href={'/answers/' + reference.topicId + '#' + reference.questionId}
                >
                  <span>{translate(reference.question)}</span>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </section>
          )}
          <p className="source-line">
            {copy.source}: {topic.sources.map(sourceFile).join(' + ')} · {topic.sourceId}
          </p>
        </article>
        <aside className="lesson-aside">
          {topic.questions.length > 0 && (
            <nav className="panel answer-toc" aria-label={copy.questions}>
              <h2>{copy.questions}</h2>
              <ol>
                {topic.questions.map((question) => (
                  <li key={question.id}>
                    <a
                      href={'#' + question.id}
                      onClick={() => {
                        const target = document.getElementById(question.id);
                        if (target instanceof HTMLDetailsElement) target.open = true;
                      }}
                    >
                      {translate(question.question)}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {topic.flow.length > 0 && (
            <section className="panel">
              <h2>{copy.flow}</h2>
              <Flow steps={topic.flow} language={contentLanguage} />
            </section>
          )}
          {topic.lessonId && (
            <section className="panel answers-next-step">
              <h3>{text.practiceTitle}</h3>
              <p>{text.practiceIntro}</p>
              <Link
                className="button primary full-width"
                href={
                  (topic.sources.includes('interview') ? '/interview?topic=' : '/tests?topic=') +
                  topic.lessonId
                }
              >
                {topic.sources.includes('interview') ? copy.interview : copy.tests}
                <ArrowRight size={16} />
              </Link>
              <Link className="button subtle full-width" href={'/lesson/' + topic.lessonId}>
                {copy.openLesson}
              </Link>
            </section>
          )}
          <Link className="button subtle full-width" href="/answers">
            {text.allAnswers}
          </Link>
        </aside>
      </div>
    </>
  );
}
