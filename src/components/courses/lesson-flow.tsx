'use client';
import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { COPY } from '@/lib/i18n';
import type { CourseText } from '@/lib/courses/schema';
import { LEARNING_FLOW_STAGES, type LearningFlow } from '@/lib/courses/learning-flow';
import { localAssessment, localReview, useFlowText } from './lesson-flow-copy';
import { CodeTrace, HtmlDocumentExplorer } from './lesson-flow-demos';

// The guided lesson: learn → understand → watch → try → practice → test → review → master.

/** Local-only courses check in the tests tab; others have an assessment on the practice page. */
const assessmentHref = (flow: LearningFlow, lessonId: string, practiceHref: string) =>
  flow.assessmentMode === 'local-only'
    ? practiceHref.replace('/practice', '/tests')
    : `${practiceHref}#${lessonId}-assessment`;
/** Anchor id of one flow stage inside the lesson page. */
const anchor = (id: string, stage: string) => `${id}-flow-${stage}`;
const subscribeHash = (notify: () => void) => {
  window.addEventListener('hashchange', notify);
  return () => window.removeEventListener('hashchange', notify);
};
const currentHash = () => {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return '';
  }
};
/** Top of the lesson: the stage navigation, the day's goals and a real-world use. */
export function LessonFlowIntro({
  flow,
  lessonId,
  practiceHref,
  studied,
  practiced,
}: {
  flow: LearningFlow;
  lessonId: string;
  practiceHref: string;
  studied: boolean;
  practiced: boolean;
}) {
  const { text, label, ui } = useFlowText();
  const hash = useSyncExternalStore(subscribeHash, currentHash, () => '');
  const current = LEARNING_FLOW_STAGES.find((stage) => hash === anchor(lessonId, stage)) || 'learn';
  return (
    <div className="lesson-flow-intro" id={anchor(lessonId, 'learn')}>
      <nav className="learning-flow-nav" aria-label={label('route')}>
        {LEARNING_FLOW_STAGES.map((stage, index) => {
          const done = (stage === 'learn' && studied) || (stage === 'practice' && practiced);
          return (
            <Link
              key={stage}
              href={
                stage === 'test'
                  ? assessmentHref(flow, lessonId, practiceHref)
                  : `#${anchor(lessonId, stage)}`
              }
              aria-current={stage === current ? 'step' : undefined}
              aria-label={label(stage) + (done ? ` · ${COPY[ui].completed}` : '')}
            >
              <span className="flow-step-number" aria-hidden="true">
                {done ? <CheckCircle2 size={15} /> : index + 1}
              </span>
              {label(stage)}
            </Link>
          );
        })}
      </nav>
      <h3>{label('goals')}</h3>
      <ul>
        {flow.objectives.map((objective, index) => (
          <li key={index}>{text(objective)}</li>
        ))}
      </ul>
      <h3>{label('real')}</h3>
      <p>{text(flow.realWorld)}</p>
    </div>
  );
}

/** The interactive part of the lesson after the theory sections. */
export function LessonFlowActivities({
  flow,
  lessonId,
  practiceHref,
  nextTitle,
}: {
  flow: LearningFlow;
  lessonId: string;
  practiceHref: string;
  nextTitle?: CourseText;
}) {
  const { language, ui, text, label } = useFlowText();
  const [answer, setAnswer] = useState<number | null>(null),
    [hint, setHint] = useState(false);
  const passed = answer === flow.prediction.correctIndex;
  return (
    <div className="lesson-flow-activities">
      <section id={anchor(lessonId, 'understand')}>
        <h3>{label('understand')}</h3>
        <fieldset className="assessment-question">
          <legend>{text(flow.prediction.prompt)}</legend>
          <p className="small muted">{label('predict')}</p>
          {flow.prediction.options.map((option, index) => (
            <label className="assessment-choice" key={index}>
              <input
                type="radio"
                name={lessonId + '-prediction'}
                checked={answer === index}
                onChange={() => setAnswer(index)}
              />
              {text(option)}
            </label>
          ))}
          <button className="button subtle" type="button" onClick={() => setHint(true)}>
            {label('hint')}
          </button>
          {hint && <p>{text(flow.prediction.hint)}</p>}
          {answer !== null && (
            <p role="status">
              {passed
                ? `${label('correct')}. ${text(flow.prediction.explanation)}`
                : `${label('retry')}. ${text(flow.prediction.hint)}`}
            </p>
          )}
        </fieldset>
      </section>
      <section id={anchor(lessonId, 'watch')}>
        <h3>{label('watch')}</h3>
        {flow.demo.kind === 'html-document' ? (
          <HtmlDocumentExplorer key={language} demo={flow.demo} />
        ) : (
          <CodeTrace key={language} demo={flow.demo} />
        )}
      </section>
      <section id={anchor(lessonId, 'try')}>
        <h3>{label('try')}</h3>
        <ol>
          {flow.guidedPractice.steps.map((step, index) => (
            <li key={index}>{text(step)}</li>
          ))}
        </ol>
        <details>
          <summary>{label('hint')}</summary>
          <p>{text(flow.guidedPractice.hint)}</p>
        </details>
        <p>{text(flow.guidedPractice.success)}</p>
      </section>
      <section id={anchor(lessonId, 'practice')}>
        <h3>{label('practice')}</h3>
        <h4>{label('challenge')}</h4>
        <p>{text(flow.miniChallenge.task)}</p>
        <ul>
          {flow.miniChallenge.criteria.map((criterion, index) => (
            <li key={index}>{text(criterion)}</li>
          ))}
        </ul>
        <details>
          <summary>{label('example')}</summary>
          <p>{text(flow.miniChallenge.example)}</p>
        </details>
        <Link className="button primary" href={practiceHref}>
          {label('open')}
        </Link>
      </section>
      <section id={anchor(lessonId, 'review')}>
        <h3>{label('review')}</h3>
        <h4>{label('summary')}</h4>
        <ul>
          {flow.summary.map((point, index) => (
            <li key={index}>{text(point)}</li>
          ))}
        </ul>
        {flow.review.map((prompt, index) => (
          <p key={index}>{text(prompt)}</p>
        ))}
      </section>
      <section id={anchor(lessonId, 'master')}>
        <h3>{label('master')}</h3>
        <p>
          {flow.assessmentMode === 'local-only'
            ? lessonId.startsWith('backend-')
              ? localAssessment[ui]
              : localReview[ui]
            : label('threshold')}
        </p>
        <Link className="text-link" href={assessmentHref(flow, lessonId, practiceHref)}>
          {label('test')}
        </Link>
        {flow.nextLessonId === null ? (
          <p>{flow.continuationNotice ? text(flow.continuationNotice) : label('end')}</p>
        ) : (
          nextTitle && (
            <p>
              {label('next')}: {text(nextTitle)}
            </p>
          )
        )}
      </section>
    </div>
  );
}
