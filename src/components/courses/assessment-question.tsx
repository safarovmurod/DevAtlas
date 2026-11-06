'use client';
import Link from 'next/link';
import type { ContentLocale } from '@/lib/locale';
import type {
  AssessmentAnswer,
  AssessmentFeedback,
  AssessmentView,
} from '@/lib/practice/assessment';
import { ASSESSMENT_COPY } from '@/lib/practice/assessment-copy';
import { useLearningStore } from '@/stores/learning-store';

type Question = AssessmentView['questions'][number];

const asList = (answer: AssessmentAnswer | undefined) => (Array.isArray(answer) ? answer : []);
const asPairs = (answer: AssessmentAnswer | undefined) =>
  answer && typeof answer === 'object' && !Array.isArray(answer) ? answer : {};

/** One assessment question: options, matching selects or a text field, with hints and feedback. */
export function AssessmentQuestionField({
  question,
  number,
  variantId,
  answer,
  feedback,
  hintsShown,
  disabled,
  language,
  reviewHref,
  onAnswer,
  onHint,
}: {
  question: Question;
  number: number;
  variantId: string;
  answer: AssessmentAnswer | undefined;
  feedback: AssessmentFeedback | undefined;
  hintsShown: number;
  disabled: boolean;
  language: ContentLocale;
  reviewHref: string;
  onAnswer: (answer: AssessmentAnswer) => void;
  onHint: () => void;
}) {
  const uiLanguage = useLearningStore((state) => state.language);
  const label = (key: keyof typeof ASSESSMENT_COPY) => ASSESSMENT_COPY[key][uiLanguage];
  const name = `${variantId}:${question.id}`;

  function renderAnswerInput() {
    if ('options' in question) {
      const multiple = question.kind === 'multiple-choice';
      return question.options.map((option) => {
        const selected = asList(answer);
        return (
          <label className="assessment-choice" key={option.id}>
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={option.id}
              checked={multiple ? selected.includes(option.id) : answer === option.id}
              onChange={(event) => {
                if (!multiple) return onAnswer(option.id);
                onAnswer(
                  event.target.checked
                    ? [...selected, option.id]
                    : selected.filter((id) => id !== option.id),
                );
              }}
            />
            {option.text[language]}
          </label>
        );
      });
    }

    if (question.kind === 'matching') {
      const pairs = asPairs(answer);
      return question.left.map((left) => (
        <label className="assessment-match" key={left.id}>
          {left.text[language]}
          <select
            aria-label={`${question.prompt[language]} — ${left.text[language]}`}
            value={pairs[left.id] ?? ''}
            onChange={(event) => onAnswer({ ...pairs, [left.id]: event.target.value })}
          >
            <option value="">{label('choose')}</option>
            {question.right.map((right) => (
              <option value={right.id} key={right.id}>
                {right.text[language]}
              </option>
            ))}
          </select>
        </label>
      ));
    }

    return (
      <input
        className="assessment-text"
        aria-label={question.prompt[language]}
        autoComplete="off"
        maxLength={500}
        value={typeof answer === 'string' ? answer : ''}
        onChange={(event) => onAnswer(event.target.value)}
      />
    );
  }

  return (
    <fieldset className="assessment-question" disabled={disabled}>
      <legend>
        {number}. {question.prompt[language]}{' '}
        {question.critical && <strong>({label('critical')})</strong>}
      </legend>

      {renderAnswerInput()}

      <button
        className="text-link"
        type="button"
        disabled={hintsShown >= question.hints.length}
        onClick={onHint}
      >
        {label('hint')}
      </button>
      {question.hints.slice(0, hintsShown).map((hint, index) => (
        <p className="small muted" key={index}>
          {hint[language]}
        </p>
      ))}

      {feedback && (
        <div className={feedback.passed ? 'success-text' : 'warning-text'}>
          <p>
            {feedback.passed ? label('correct') : label('needsReview')}:{' '}
            {feedback.explanation[language]}
          </p>
          <Link href={reviewHref}>{label('review')}</Link>
        </div>
      )}
    </fieldset>
  );
}
