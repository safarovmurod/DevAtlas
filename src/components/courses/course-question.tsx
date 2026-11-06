'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { dateKey } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning-store';
import { WRONG_ANSWER } from './course-workspace-copy';

type Question = CourseLesson['questions'][number];

/**
 * One lesson question.
 * - "test" and "revision": pick one option and check it.
 * - "interview": write an answer, open the reference answer and rate yourself.
 */
export function CourseQuestion({
  courseId,
  lesson,
  question,
  mode,
}: {
  courseId: ImportedCourseId;
  lesson: CourseLesson;
  question: Question;
  mode: 'test' | 'interview' | 'revision';
}) {
  const state = useLearningStore();
  const copy = COPY[state.language];
  const text = (value: CourseLesson['title']) => courseText(value, state.contentLanguage);

  // Answers are stored per day, so a question can be practised again tomorrow.
  const saved = state.courses[courseId]?.answers[`${dateKey()}:${mode}:${question.id}`];
  const [choice, setChoice] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');

  const isChoiceQuestion = mode !== 'interview';
  const solved = saved?.correct === true;
  const relatedSection =
    question.relatedSection === undefined ? undefined : lesson.sections[question.relatedSection];

  function record(correct: boolean, value: string) {
    state.recordCourseAnswer(
      courseId,
      { id: question.id, topicId: lesson.id },
      mode,
      correct,
      value,
    );
  }

  return (
    <div className="course-question">
      <h3>{text(question.question)}</h3>

      {isChoiceQuestion ? (
        <>
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
            className="button primary"
            disabled={solved || choice === null}
            onClick={() => record(choice === question.correctIndex, String(choice))}
          >
            {copy.check}
          </button>
        </>
      ) : (
        <>
          <label>
            {copy.yourAnswer}
            <textarea
              rows={4}
              value={saved?.answer ?? answer}
              disabled={!!saved}
              onChange={(event) => setAnswer(event.target.value)}
            />
          </label>
          <details>
            <summary>{copy.showAnswer}</summary>
            <p className="preserve-lines">{text(question.answer)}</p>
            <p>{copy.selfCheck}</p>
            <div className="button-row">
              {[true, false].map((correct) => (
                <button
                  key={String(correct)}
                  className="button subtle"
                  disabled={!!saved || !answer.trim()}
                  onClick={() => record(correct, answer.trim())}
                >
                  {correct ? copy.remembered : copy.forgotten}
                </button>
              ))}
            </div>
          </details>
        </>
      )}

      {saved && <p role="status">{saved.correct ? copy.correct : WRONG_ANSWER[state.language]}</p>}

      {/* After a wrong choice, point to the theory section that explains it. */}
      {isChoiceQuestion && saved && !saved.correct && question.hint && relatedSection && (
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

      {isChoiceQuestion && solved && <p className="preserve-lines">{text(question.answer)}</p>}
    </div>
  );
}
