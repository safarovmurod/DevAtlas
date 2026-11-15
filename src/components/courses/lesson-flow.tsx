'use client';
import { useState, type ReactNode } from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LEARNING_FLOW_STAGES, LearningFlow } from '@/lib/courses/learning-flow';
import { localAssessment, localReview, useDayCopy, useFlowText } from './lesson-flow-copy';
import { CodeTrace, HtmlDocumentExplorer } from './lesson-flow-demos';

// One day is three short steps: Learn → Practice → Check.
// The authored flow data (goals, prediction, demo, guided practice, recap) lives in
// collapsible blocks inside those steps, so a beginner sees the main path first.

export type DayStep = (typeof LEARNING_FLOW_STAGES)[number];
/** Anchor id of one step on the day page. */
export const stepAnchor = (step: DayStep) => `day-${step}`;

const STEPS: readonly DayStep[] = ['learn', 'practice', 'check'];
const HINTS = {
  learn: 'nowLearn',
  practice: 'nowPractice',
  check: 'nowCheck',
  confirm: 'nowConfirm',
  done: 'nowDone',
} as const;

/** Three step chips and one line that says what to do now. */
export function LessonSteps({
  done,
  current,
}: {
  done: Record<DayStep, boolean>;
  current: DayStep | 'confirm' | 'done';
}) {
  const t = useDayCopy();
  return (
    <nav aria-label={t('steps')} className="grid gap-2.5">
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((step, index) => (
          <li key={step} className="min-w-0">
            <a
              href={`#${stepAnchor(step)}`}
              aria-current={current === step ? 'step' : undefined}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-[13px] leading-4 font-medium no-underline transition-colors sm:min-h-12 sm:flex-row sm:justify-start sm:gap-2 sm:px-3 sm:text-sm',
                current === step
                  ? 'border-primary bg-primary-soft text-brand'
                  : done[step]
                    ? 'border-transparent bg-success-soft text-success'
                    : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  done[step] ? 'text-success' : 'bg-muted text-muted-foreground',
                )}
              >
                {done[step] ? <CheckCircle2 size={18} /> : index + 1}
              </span>
              <span className="min-w-0 text-center sm:text-left">
                {t(step)}
                {done[step] && <span className="sr-only"> ✓</span>}
              </span>
            </a>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground" role="status">
        {t(HINTS[current])}
      </p>
    </nav>
  );
}

/** One numbered step of the day. */
export function StepCard({
  step,
  title,
  done,
  children,
}: {
  step: DayStep;
  title: string;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={stepAnchor(step)}
      aria-labelledby={`${stepAnchor(step)}-title`}
      className="grid min-w-0 scroll-mt-24 grid-cols-1 gap-4 border-t border-border pt-6"
    >
      <h3
        id={`${stepAnchor(step)}-title`}
        className="flex items-center gap-2.5 text-lg font-semibold text-foreground"
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full text-sm',
            done ? 'bg-success-soft text-success' : 'bg-primary-soft text-brand',
          )}
        >
          {done ? <CheckCircle2 size={17} /> : STEPS.indexOf(step) + 1}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** A collapsed extra: one line until the learner opens it. */
export function Extra({
  summary,
  open,
  id,
  section,
  children,
}: {
  summary: ReactNode;
  open?: boolean;
  id?: string;
  /** Marks a lesson theory section, so the "open all" button can find it. */
  section?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      id={id}
      open={open}
      data-lesson-section={section ? '' : undefined}
      className="group min-w-0 scroll-mt-24 rounded-xl border border-border bg-muted/40"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[15px] font-medium text-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">{summary}</span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className="shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
        />
      </summary>
      <div className="grid min-w-0 grid-cols-1 gap-3 border-t border-border px-4 py-4 text-[15px] leading-7">
        {children}
      </div>
    </details>
  );
}

const list = 'grid list-disc gap-1.5 pl-5 marker:text-brand';

/** Goals of the day and a real-world use. */
export function FlowGoals({ flow }: { flow: LearningFlow }) {
  const { text, label } = useFlowText();
  const t = useDayCopy();
  return (
    <Extra summary={t('goals')}>
      <ul className={list}>
        {flow.objectives.map((objective, index) => (
          <li key={index}>{text(objective)}</li>
        ))}
      </ul>
      <p className="font-medium text-foreground">{label('real')}</p>
      <p>{text(flow.realWorld)}</p>
    </Extra>
  );
}

/** "What will change?" question with a hint and an explanation. */
export function FlowPrediction({ flow, lessonId }: { flow: LearningFlow; lessonId: string }) {
  const { text, label } = useFlowText();
  const t = useDayCopy();
  const [answer, setAnswer] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const passed = answer === flow.prediction.correctIndex;
  return (
    <Extra summary={t('guess')} id={`${lessonId}-flow-understand`}>
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
    </Extra>
  );
}

/** The worked example: a clickable HTML document or a line-by-line code walk. */
export function FlowDemo({ flow }: { flow: LearningFlow }) {
  const { language } = useFlowText();
  const t = useDayCopy();
  return (
    <Extra summary={t('example')}>
      {flow.demo.kind === 'html-document' ? (
        <HtmlDocumentExplorer key={language} demo={flow.demo} />
      ) : (
        <CodeTrace key={language} demo={flow.demo} />
      )}
    </Extra>
  );
}

/** Small guided steps to try before the independent task. */
export function FlowGuided({ flow }: { flow: LearningFlow }) {
  const { text, label } = useFlowText();
  const t = useDayCopy();
  return (
    <Extra summary={t('warmup')}>
      <ol className="grid list-decimal gap-1.5 pl-5 marker:text-brand">
        {flow.guidedPractice.steps.map((step, index) => (
          <li key={index}>{text(step)}</li>
        ))}
      </ol>
      <details>
        <summary className="cursor-pointer font-medium">{label('hint')}</summary>
        <p className="mt-2">{text(flow.guidedPractice.hint)}</p>
      </details>
      <p>{text(flow.guidedPractice.success)}</p>
    </Extra>
  );
}

/** The mini challenge of the day with its self-check criteria. */
export function FlowChallenge({ flow }: { flow: LearningFlow }) {
  const { text, label } = useFlowText();
  return (
    <Extra summary={label('challenge')}>
      <p>{text(flow.miniChallenge.task)}</p>
      <ul className={list}>
        {flow.miniChallenge.criteria.map((criterion, index) => (
          <li key={index}>{text(criterion)}</li>
        ))}
      </ul>
      <details>
        <summary className="cursor-pointer font-medium">{label('example')}</summary>
        <p className="mt-2">{text(flow.miniChallenge.example)}</p>
      </details>
    </Extra>
  );
}

/** What to remember and what to ask yourself tomorrow. */
export function FlowRecap({ flow }: { flow: LearningFlow }) {
  const { text, label } = useFlowText();
  return (
    <Extra summary={label('summary')}>
      <ul className={list}>
        {flow.summary.map((point, index) => (
          <li key={index}>{text(point)}</li>
        ))}
      </ul>
      {flow.review.map((prompt, index) => (
        <p key={index}>{text(prompt)}</p>
      ))}
    </Extra>
  );
}

/**
 * Honest note about what this day's checks prove, and the end-of-block notice.
 * Quizzes and self-reviewed practice never claim verified mastery.
 */
export function FlowNotes({ flow, lessonId }: { flow: LearningFlow; lessonId: string }) {
  const { ui, text, label } = useFlowText();
  return (
    <div
      id={`${lessonId}-flow-master`}
      className="grid gap-1.5 text-xs leading-5 text-muted-foreground"
    >
      <p>
        {flow.assessmentMode === 'local-only'
          ? lessonId.startsWith('backend-')
            ? localAssessment[ui]
            : localReview[ui]
          : label('threshold')}
      </p>
      {flow.nextLessonId === null && (
        <p>{flow.continuationNotice ? text(flow.continuationNotice) : label('end')}</p>
      )}
    </div>
  );
}
