'use client';

import { useState } from 'react';
import { CheckCircle2, Eye, FileCode2, Play } from 'lucide-react';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { CodeEditor } from '@/components/learning/code-editor';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { EMMET_FROM_DAY } from '@/lib/editor-copy';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import type { ImportedCourseId } from '@/lib/courses/ids';
import {
  gradeHtmlDocument,
  safeHtmlPreview,
  HTML_CHECK_IDS,
  type HtmlCheck,
} from '@/lib/grading/html-grader';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import type { PracticeSubmissionResult } from '@/lib/practice/types';
import dynamic from 'next/dynamic';
import { PRACTICE_COPY, RUBRIC, practiceFileName, type HtmlCheckId } from './course-practice-copy';

// Heavy practice tools load only when a lesson needs them.
const FunctionPractice = dynamic(() =>
  import('./function-practice').then((module) => module.FunctionPractice),
);
const WrittenRubricReview = dynamic(() =>
  import('./written-rubric-review').then((module) => module.WrittenRubricReview),
);
const SqlitePractice = dynamic(() =>
  import('./sqlite-practice').then((module) => module.SqlitePractice),
);
const LessonAssessment = dynamic(() =>
  import('./lesson-assessment').then((module) => module.LessonAssessment),
);

/** The practice part of a course day: task, editor or answer field, checks and solution. */
export function CoursePractice({
  courseId,
  lesson,
}: {
  courseId: ImportedCourseId;
  lesson: CourseLesson;
}) {
  const state = useLearningStore();
  const copy = COPY[state.language];
  const ui = LEARNING_UI_COPY[state.language];
  // Rendered only for lessons that have practice.
  const practice = lesson.practice!;
  const [checks, setChecks] = useState<number[]>([]);
  const [results, setResults] = useState<HtmlCheck[] | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverStatus, setServerStatus] = useState<'verified' | 'unavailable' | null>(null);
  const code = state.courses[courseId]?.drafts[lesson.id] ?? practice.execution?.starter ?? '';
  const completed = state.courses[courseId]?.completedPractice.includes(lesson.id);
  // Only HTML day 1 has an automatic structure check; other code tasks are self-checked.
  const automatic = courseId === 'html' && lesson.id === 'html-day-01';
  const written = practice.kind === 'written';
  const language =
    COURSE_CATALOG.find((course) => course.id === courseId)?.editorLanguage ?? 'typescript';
  const filename = practiceFileName(courseId, language);
  const rubric = RUBRIC[state.language];
  const labels = PRACTICE_COPY[state.language];

  function update(value: string) {
    state.saveCourseDraft(courseId, lesson.id, value);
    setResults(null);
    setServerStatus(null);
  }
  /** Runs the HTML check; when it passes, also asks the server to verify and record XP. */
  async function verify() {
    // Ignore the server answer if the account or the code changed meanwhile.
    const storageName = useLearningStore.persist.getOptions().name;
    const current = () =>
      useLearningStore.persist.getOptions().name === storageName &&
      useLearningStore.getState().courses[courseId]?.drafts[lesson.id] === code;
    const next = gradeHtmlDocument(code);
    setResults(next);
    setPreview(code);
    setServerStatus(null);
    if (!next.every((check) => check.passed)) return;
    state.completeCoursePractice(courseId, lesson.id, true);
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setSubmitting(true);
    try {
      const { data, error } = await getSessionWithTimeout(client);
      if (error) throw error;
      if (!data.session) return;
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + data.session.access_token,
        },
        body: JSON.stringify({ courseId, lessonId: lesson.id, code }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error('Server assessment unavailable');
      const result: PracticeSubmissionResult = await response.json();
      if (result.verified !== true || !result.passed)
        throw new Error('Server assessment did not pass');
      if (current()) setServerStatus('verified');
    } catch {
      if (current()) setServerStatus('unavailable');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="course-practice-studio">
      <details className="practice-instructions" open>
        <summary>{labels.instructions}</summary>
        <p className="preserve-lines">{courseText(practice.task, state.contentLanguage)}</p>
        {(practice.hints ?? [practice.hint]).map((hint, index) => (
          <details key={index} className="practice-hint">
            <summary>
              {copy.hint}
              {practice.hints ? ` ${index + 1}` : null}
            </summary>
            <p className="preserve-lines">{courseText(hint, state.contentLanguage)}</p>
          </details>
        ))}
      </details>
      {written ? (
        <div className="written-practice">
          <label htmlFor={lesson.id + '-answer'}>{copy.yourAnswer}</label>
          <textarea
            id={lesson.id + '-answer'}
            rows={10}
            value={code}
            onChange={(event) => update(event.target.value)}
            maxLength={100000}
          />
          <p className="small muted">{copy.saved}</p>
        </div>
      ) : (
        <div className="editor-panel">
          <div className="editor-header">
            <span>
              <FileCode2 size={16} />
              {filename}
            </span>
            <span>{language}</span>
          </div>
          <CodeEditor
            path={courseId + '/' + lesson.id + '/' + filename}
            language={language}
            label={ui.yourCode}
            value={code}
            onChange={update}
            pasteGuard
            emmet={
              courseId === 'html' || courseId === 'css'
                ? (lesson.day ?? 0) >= EMMET_FROM_DAY
                : undefined
            }
          />
          <div className="editor-footer">
            <span>{copy.saved}</span>
            <div className="button-row">
              {courseId === 'html' && (
                <button
                  className="button subtle"
                  disabled={!code.trim()}
                  onClick={() => setPreview(code)}
                >
                  <Eye size={16} />
                  {ui.showHtml}
                </button>
              )}
              {automatic && (
                <button
                  className="button primary"
                  disabled={!code.trim() || submitting}
                  onClick={verify}
                >
                  <Play size={16} />
                  {submitting ? copy.loading : labels.verify}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {courseId === 'html' && preview !== null && (
        <iframe
          title={ui.htmlResult}
          className="html-preview"
          sandbox=""
          referrerPolicy="no-referrer"
          srcDoc={safeHtmlPreview(preview)}
        />
      )}
      {practice.execution && <FunctionPractice code={code} execution={practice.execution} />}
      {courseId === 'sql' && lesson.id === 'sql-day-01' && <SqlitePractice code={code} />}
      {automatic ? (
        <section className="practice-validation" aria-live="polite">
          <p className="small muted">{labels.note}</p>
          <ul>
            {(results ?? HTML_CHECK_IDS.map((id) => ({ id, passed: false }))).map((check) => (
              <li
                key={check.id}
                className={results ? (check.passed ? 'success-text' : 'warning-text') : ''}
              >
                <span aria-hidden="true">{results ? (check.passed ? '✓' : '×') : '○'}</span>{' '}
                {rubric[check.id as HtmlCheckId]}
              </li>
            ))}
          </ul>
          {results && (
            <p role="status">
              {results.every((check) => check.passed) ? labels.passed : labels.failed}
            </p>
          )}
          <p className="small muted">{labels.local}</p>
        </section>
      ) : practice.rubric ? (
        <WrittenRubricReview
          courseId={courseId}
          lessonId={lesson.id}
          answer={code}
          rubric={practice.rubric}
          criteria={practice.criteria}
        />
      ) : (
        <section className="practice-validation">
          <p>{copy.manualHint}</p>
          {practice.criteria.map((criterion, index) => (
            <label className="course-criterion" key={index}>
              <input
                type="checkbox"
                checked={!!completed || checks.includes(index)}
                disabled={completed}
                onChange={(event) =>
                  setChecks(
                    event.target.checked
                      ? [...checks, index]
                      : checks.filter((value) => value !== index),
                  )
                }
              />
              {courseText(criterion, state.contentLanguage)}
            </label>
          ))}
          <button
            className="button subtle"
            disabled={completed || !code.trim() || checks.length !== practice.criteria.length}
            onClick={() => state.completeCoursePractice(courseId, lesson.id)}
          >
            <CheckCircle2 size={16} />
            {completed ? copy.completed : copy.manual}
          </button>
        </section>
      )}
      <details className="solution">
        <summary>{copy.solution}</summary>
        {written ? (
          <p className="preserve-lines">
            {practice.referenceAnswer
              ? courseText(practice.referenceAnswer, state.contentLanguage)
              : practice.solution}
          </p>
        ) : (
          <pre tabIndex={0}>
            <code>{practice.solution}</code>
          </pre>
        )}
      </details>
      {serverStatus && (
        <p role="status" className={serverStatus === 'verified' ? 'success-text' : 'warning-text'}>
          {serverStatus === 'verified' ? labels.serverVerified : labels.serverUnavailable}
        </p>
      )}
      {courseId === 'html' && lesson.id === 'html-day-01' && (
        <LessonAssessment
          courseId={courseId}
          lessonId={lesson.id}
          code={code}
          onPracticePassed={(submittedCode) => {
            // Reuse the existing completion/XP path, including its server verifier.
            // A response for an edited draft must never complete the newer draft.
            if (useLearningStore.getState().courses[courseId]?.drafts[lesson.id] === submittedCode)
              void verify();
          }}
        />
      )}
    </div>
  );
}
