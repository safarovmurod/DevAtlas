'use client';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '@/components/account/account-provider';
import { useLearningStore } from '@/stores/learning-store';
import { ASSESSMENT_COPY } from '@/lib/practice/assessment-copy';
import type {
  AssessmentAnswer,
  AssessmentResponse,
  AssessmentSubmission,
  AssessmentView,
} from '@/lib/practice/assessment';
import { AssessmentQuestionField } from './assessment-question';
import { readDraft, saveDraft, tokenFor } from './assessment-storage';

const LOAD_TIMEOUT_MS = 15_000;
const SUBMIT_TIMEOUT_MS = 20_000;

/**
 * Server-graded lesson assessment: quiz questions plus the learner's code.
 * Each account gets its own session, so switching accounts starts fresh.
 */
export function LessonAssessment(props: {
  courseId: string;
  lessonId: string;
  code: string;
  onPracticePassed?: (code: string) => void;
}) {
  const { user } = useAccount();
  const actor = user?.id ?? 'guest';
  return (
    <AssessmentSession
      key={`${actor}:${props.courseId}:${props.lessonId}`}
      {...props}
      actor={actor}
    />
  );
}

function AssessmentSession({
  courseId,
  lessonId,
  code,
  actor,
  onPracticePassed,
}: {
  courseId: string;
  lessonId: string;
  code: string;
  actor: string;
  onPracticePassed?: (code: string) => void;
}) {
  const uiLanguage = useLearningStore((state) => state.language);
  const language = useLearningStore((state) => state.contentLanguage);
  const label = (key: keyof typeof ASSESSMENT_COPY) => ASSESSMENT_COPY[key][uiLanguage];
  const storageKey = `devatlas-assessment-draft-v1:${actor}:${courseId}:${lessonId}`;
  const [restored] = useState(() => readDraft(storageKey));
  const [view, setView] = useState<AssessmentView | null>(null);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [hints, setHints] = useState<Record<string, number>>({});
  // A retry asks for a different question variant than the one just answered.
  const [exclude, setExclude] = useState('');
  const [reload, setReload] = useState(0);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ledger, setLedger] = useState<
    { attempt_id: string; lesson_version: number; mastered: boolean }[]
  >([]);
  const [result, setResult] = useState<{
    response: AssessmentResponse;
    answers: typeof answers;
    code: string;
  } | null>(null);
  const request = useRef<AbortController | null>(null);
  const sending = useRef(false);
  // The same answers are resent with the same attempt id, so a retry after a
  // network error is never counted twice.
  const pending = useRef<{
    payload: AssessmentSubmission;
    answers: typeof answers;
    code: string;
    variant: string;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const token = await tokenFor(actor);
        const params = new URLSearchParams({ courseId, lessonId });
        if (exclude) params.set('excludeVariant', exclude);
        else if (restored.draft) params.set('variantId', restored.draft.variantId);
        const response = await fetch('/api/assessments?' + params, {
          headers: token ? { Authorization: 'Bearer ' + token } : {},
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(LOAD_TIMEOUT_MS)]),
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Assessment unavailable');
        const data = (await response.json()) as AssessmentView;
        if (controller.signal.aborted) return;
        setView(data);
        setError(false);
        setAnswers(
          !exclude &&
            restored.draft?.version === data.version &&
            restored.draft.variantId === data.variantId
            ? restored.draft.answers
            : {},
        );
        if (token) {
          try {
            const progress = await fetch(
              '/api/assessments/progress?' + new URLSearchParams({ courseId, lessonId }),
              {
                headers: { Authorization: 'Bearer ' + token },
                signal: AbortSignal.any([controller.signal, AbortSignal.timeout(LOAD_TIMEOUT_MS)]),
                cache: 'no-store',
              },
            );
            if (progress.ok) {
              const history = await progress.json();
              if (!controller.signal.aborted) setLedger(history.attempts ?? []);
            }
          } catch {
            /* History availability never prevents a new practice attempt. */
          }
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }
    void load();
    return () => {
      controller.abort();
      request.current?.abort();
    };
  }, [actor, courseId, lessonId, exclude, reload, restored]);

  function update(id: string, answer: AssessmentAnswer) {
    const next = { ...answers, [id]: answer };
    setAnswers(next);
    // A corrupt draft is kept untouched so it can still be inspected.
    if (view && !restored.corrupt) saveDraft(storageKey, view, next);
  }
  async function submit() {
    if (!view || sending.current) return;
    sending.current = true;
    setBusy(true);
    setError(false);
    const controller = new AbortController();
    request.current = controller;
    const snapshot = answers;
    const submittedCode = code;
    if (
      !pending.current ||
      pending.current.answers !== answers ||
      pending.current.code !== code ||
      pending.current.variant !== view.variantId
    ) {
      pending.current = {
        answers,
        code,
        variant: view.variantId,
        payload: {
          courseId,
          lessonId,
          version: view.version,
          variantId: view.variantId,
          attemptId: crypto.randomUUID(),
          answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
          code,
        },
      };
    }
    const payload = pending.current.payload;
    try {
      const token = await tokenFor(actor);
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(SUBMIT_TIMEOUT_MS)]),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Assessment failed');
      const data = (await response.json()) as AssessmentResponse;
      if (controller.signal.aborted) return;
      setResult({ response: data, answers: snapshot, code: submittedCode });
      if (data.grade.practice.passed) onPracticePassed?.(submittedCode);
      if (data.attestation === 'server')
        setLedger((old) =>
          old.some((item) => item.attempt_id === data.attemptId)
            ? old
            : [
                {
                  attempt_id: data.attemptId,
                  lesson_version: view.version,
                  mastered: data.grade.mastered,
                },
                ...old,
              ],
        );
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      sending.current = false;
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  function retry() {
    if (!view) return;
    setExclude(view.variantId);
    setReload((value) => value + 1);
    setView(null);
    setAnswers({});
    setHints({});
    setResult(null);
    pending.current = null;
  }
  // A result is shown only while the answers and code are still the ones that were graded.
  const active = result?.answers === answers && result.code === code ? result.response : null;
  if (!view)
    return (
      <section
        id={`${lessonId}-assessment`}
        className="panel lesson-assessment"
        aria-label={label('title')}
      >
        <p role="status">{error ? label('error') : label('loading')}</p>
        {error && (
          <button className="button subtle" onClick={() => setReload((value) => value + 1)}>
            {label('retryLoad')}
          </button>
        )}
      </section>
    );
  return (
    <section
      id={`${lessonId}-assessment`}
      className="panel lesson-assessment"
      aria-label={label('title')}
    >
      <h3>{label('title')}</h3>
      <h4>{label('goals')}</h4>
      <ul>
        {view.objectives.map((goal, index) => (
          <li key={index}>{goal[language]}</li>
        ))}
      </ul>
      <p>{label('practice')}</p>
      {restored.corrupt && <p role="alert">{label('restoreError')}</p>}
      {ledger.length > 0 && (
        <p className="small muted">
          {label('ledger')}: {ledger.length}.{' '}
          {ledger.some((attempt) => attempt.lesson_version === view.version && attempt.mastered)
            ? label('recordedMastery')
            : ''}
        </p>
      )}
      {view.questions.map((question, index) => {
        const feedback = active?.grade.feedback.find((item) => item.questionId === question.id);
        return (
          <AssessmentQuestionField
            key={`${view.variantId}:${question.id}`}
            question={question}
            number={index + 1}
            variantId={view.variantId}
            answer={answers[question.id]}
            feedback={feedback}
            hintsShown={hints[question.id] ?? 0}
            disabled={busy}
            language={language}
            reviewHref={`/courses/${courseId}/home?day=1#${lessonId}-section-${feedback?.relatedSection}`}
            onAnswer={(answer) => update(question.id, answer)}
            onHint={() =>
              setHints((old) => ({ ...old, [question.id]: (old[question.id] ?? 0) + 1 }))
            }
          />
        );
      })}
      <div className="button-row">
        <button
          className="button primary"
          type="button"
          disabled={busy || Object.keys(answers).length === 0}
          onClick={() => void submit()}
        >
          {busy ? label('submitting') : label('submit')}
        </button>
        <button className="button subtle" type="button" disabled={busy} onClick={retry}>
          {label('retry')}
        </button>
      </div>
      {error && <p role="alert">{label('error')}</p>}
      {active && (
        <div className="assessment-result" aria-live="polite">
          <h4>{active.grade.mastered ? label('mastered') : label('needsReview')}</h4>
          <p>
            {label('quiz')}: {active.grade.quiz.correct}/{active.grade.quiz.total} (
            {active.grade.quiz.percent}%). {label('critical')}: {active.grade.quiz.criticalCorrect}/
            {active.grade.quiz.criticalTotal}. {label('code')}:{' '}
            {active.grade.practice.checks.filter((check) => check.passed).length}/
            {active.grade.practice.checks.length}.
          </p>
          <p>
            {active.attestation === 'server'
              ? label('server')
              : active.persistence === 'unavailable'
                ? label('unavailable')
                : label('local')}
          </p>
        </div>
      )}
    </section>
  );
}
