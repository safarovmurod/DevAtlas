'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { dateKey } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning-store';
import { WrittenAnswer } from '@/components/learning/written-answer';
import { WRONG_ANSWER } from './course-workspace-copy';

type Question = CourseLesson['questions'][number];
type QuestionMode =
  | { mode: 'test' | 'revision'; question: Question }
  | { mode: 'interview'; question: Question | NonNullable<CourseLesson['interview']> };

/**
 * One lesson question.
 * - "test" and "revision": pick one option and check it.
 * - "interview": type an answer and check it against the published answers.
 */
export function CourseQuestion({
  courseId,
  lesson,
  question,
  mode,
}: {
  courseId: ImportedCourseId;
  lesson: CourseLesson;
} & QuestionMode) {
  const state = useLearningStore();
  const copy = COPY[state.language];
  const text = (value: CourseLesson['title']) => courseText(value, state.contentLanguage);

  // Answers are stored per day, so a question can be practised again tomorrow.
  const saved = state.courses[courseId]?.answers[`${dateKey()}:${mode}:${question.id}`];
  const [choice, setChoice] = useState<number | null>(null);
  const solved = saved?.correct === true;

  function record(correct: boolean, value: string) {
    state.recordCourseAnswer(
      courseId,
      { id: question.id, topicId: lesson.id },
      mode,
      correct,
      value,
    );
  }

  if (mode === 'interview') {
    const accepted = [
      question.answer.ru,
      question.answer.tg,
      question.answer.en,
      ...('acceptedAnswers' in question ? (question.acceptedAnswers ?? []) : []),
    ];
    if ('options' in question) {
      const option = question.options[question.correctIndex];
      if (option) accepted.push(option.ru, option.tg, option.en);
    }
    return (
      <div className="course-question">
        <h3>{text(question.question)}</h3>
        <WrittenAnswer
          reference={text(question.answer)}
          accepted={accepted}
          caseSensitive={'caseSensitive' in question ? question.caseSensitive : undefined}
          saved={saved}
          onCheck={record}
        />
      </div>
    );
  }

  const relatedSection =
    question.relatedSection === undefined ? undefined : lesson.sections[question.relatedSection];
  return (
    <div className="course-question">
      <h3>{text(question.question)}</h3>

      <div className="course-options">
        {question.options.map((option, index) => (
          <label key={index}>
            <input
              type="radio"
              name={courseId + mode + question.id}
              checked={solved ? saved?.answer === String(index) : choice === index}
              disabled={solved}
              onChange={() => setChoice(index)}
            />
            <span className="course-option-letter" aria-hidden="true">
              {String.fromCharCode(65 + index)}
            </span>
            <span>{text(option)}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        className="button primary"
        disabled={!state.ready || solved || choice === null}
        onClick={() => record(choice === question.correctIndex, String(choice))}
      >
        {copy.check}
      </button>

      {saved && <p role="status">{saved.correct ? copy.correct : WRONG_ANSWER[state.language]}</p>}

      {/* After a wrong choice, point to the theory section that explains it. */}
      {saved && !saved.correct && question.hint && relatedSection && (
        <aside className="question-feedback">
          <p>{text(question.hint)}</p>
          <Link
            className="text-link"
            href={`${courseSectionHref(courseId, 'home', lesson.day ?? 1)}#${lesson.id}-section-${question.relatedSection}`}
          >
            {text(relatedSection.title)}
          </Link>
        </aside>
      )}

      {solved && <p className="preserve-lines">{text(question.answer)}</p>}
    </div>
  );
}
