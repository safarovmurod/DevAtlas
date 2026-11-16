'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CodeOrderGame } from '@/components/games/code-order-game';
import { buildPuzzle } from '@/lib/games/code-order';
import type { CourseProgress } from '@/lib/account/progress';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import type { CoursePlanDay } from '@/lib/courses/plan';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { useLearningStore } from '@/stores/learning-store';
import type { PracticeAccess } from '@/lib/billing/practice-access';
import { CoursePractice } from './course-practice';
import { PracticeLock } from './practice-lock';
import { CourseQuestion } from './course-question';
import {
  Extra,
  FlowChallenge,
  FlowDemo,
  FlowGuided,
  FlowNotes,
  FlowPrediction,
  FlowRecap,
  StepCard,
} from './lesson-flow';
import { useDayCopy, useFlowText } from './lesson-flow-copy';

/** Step 1: the short lesson. The first section is open, everything else is one click away. */
export function LearnStep({
  courseId,
  lesson,
  plan,
  studied,
}: {
  courseId: ImportedCourseId;
  lesson: CourseLesson;
  plan: CoursePlanDay[];
  studied: boolean;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const completeCourseLesson = useLearningStore((state) => state.completeCourseLesson);
  const copy = COPY[language];
  const ui = LEARNING_UI_COPY[language];
  const t = useDayCopy();
  const text = (value: CourseLesson['title']) => courseText(value, contentLanguage);
  const flow = lesson.learningFlow;
  const sections = useRef<HTMLDivElement>(null);
  const [allOpen, setAllOpen] = useState(false);

  // The order game only exists when the lesson has enough code lines or steps.
  const locale = contentLanguage === 'tg' || contentLanguage === 'en' ? contentLanguage : 'ru';
  const hasGame =
    buildPuzzle(
      lesson.sections.map((section) => ({
        code: section.code,
        title: section.title[locale] ?? section.title.ru,
      })),
      lesson.id,
    ) !== null;

  function toggleAll() {
    const next = !allOpen;
    setAllOpen(next);
    sections.current
      ?.querySelectorAll<HTMLDetailsElement>('details[data-lesson-section]')
      .forEach((element, index) => {
        element.open = next || index === 0;
      });
  }

  return (
    <StepCard step="learn" title={t('learn')} done={studied}>
      <div className="grid gap-2" ref={sections}>
        {lesson.sections.length > 1 && (
          <button type="button" className="text-link justify-self-end text-sm" onClick={toggleAll}>
            {allOpen ? t('collapse') : t('expand')}
          </button>
        )}
        {lesson.sections.map((part, index) => (
          <Extra
            key={index}
            section
            open={index === 0}
            id={`${lesson.id}-section-${index}`}
            summary={text(part.title)}
          >
            <TopicParts lesson={lesson} index={index} />
          </Extra>
        ))}
      </div>

      {flow && <FlowDemo flow={flow} />}
      {flow && <FlowPrediction flow={flow} lessonId={lesson.id} />}
      {hasGame && (
        <Extra summary={t('game')}>
          <CodeOrderGame sections={lesson.sections} seed={lesson.id} />
        </Extra>
      )}

      {lesson.prerequisiteDays?.length ? (
        <Extra summary={ui.connections}>
          <p>{ui.connectionsIntro}</p>
          {lesson.prerequisiteDays.map((previous) => {
            const previousDay = plan.find((item) => item.day === previous);
            if (!previousDay) return null;
            return (
              <Link
                key={previous}
                className="text-link"
                href={courseSectionHref(courseId, 'home', previous)}
              >
                {ui.day} {previous} — {text(previousDay.lesson.title)}
              </Link>
            );
          })}
        </Extra>
      ) : null}

      <div>
        <button
          className="button primary"
          disabled={studied}
          onClick={() => completeCourseLesson(courseId, lesson.id)}
        >
          {studied && <CheckCircle2 size={16} aria-hidden="true" />}
          {studied ? copy.completed : copy.markLearned}
        </button>
      </div>
    </StepCard>
  );
}

/** Step 2: the task of the day, right under the lesson. */
export function PracticeStep({
  courseId,
  lesson,
  practiced,
  access = 'open',
}: {
  courseId: ImportedCourseId;
  lesson: CourseLesson;
  practiced: boolean;
  /** The task and editor render only when the plan includes practice. */
  access?: PracticeAccess;
}) {
  const t = useDayCopy();
  const flow = lesson.learningFlow;
  return (
    <StepCard step="practice" title={t('practice')} done={practiced}>
      {flow && <FlowGuided flow={flow} />}
      {flow && <FlowChallenge flow={flow} />}
      {lesson.practice ? (
        access === 'open' ? (
          <CoursePractice courseId={courseId} lesson={lesson} />
        ) : (
          <PracticeLock access={access} />
        )
      ) : (
        <p className="text-sm text-muted-foreground">{t('noPractice')}</p>
      )}
    </StepCard>
  );
}

/** Step 3: the quiz of the day, a short recap and links to more questions. */
export function CheckStep({
  courseId,
  lesson,
  day,
  progress,
  checked,
  practiceOpen = true,
}: {
  courseId: ImportedCourseId;
  lesson: CourseLesson;
  day: number;
  progress: CourseProgress;
  checked: boolean;
  /** The graded assessment lives inside the practice block. */
  practiceOpen?: boolean;
}) {
  const language = useLearningStore((state) => state.language);
  const ui = LEARNING_UI_COPY[language];
  const t = useDayCopy();
  const { label } = useFlowText();
  const flow = lesson.learningFlow;
  const total = lesson.questions.length;
  const right = lesson.questions.filter((question) =>
    progress.masteredQuestions.includes(question.id),
  ).length;
  // The assessment form lives at the end of the practice of the first HTML day.
  const hasAssessment =
    practiceOpen && flow && flow.assessmentMode !== 'local-only' && lesson.id === 'html-day-01';

  return (
    <StepCard step="check" title={t('check')} done={checked}>
      {total > 0 ? (
        <>
          <p className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
            {t('quiz')}
            <span className="badge">
              {t('quizScore')}: {right} / {total}
            </span>
          </p>
          {lesson.questions.map((question) => (
            <CourseQuestion
              key={'test' + question.id}
              courseId={courseId}
              lesson={lesson}
              question={question}
              mode="test"
            />
          ))}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t('noQuiz')}</p>
      )}

      {flow && <FlowRecap flow={flow} />}
      {flow && <FlowNotes flow={flow} lessonId={lesson.id} />}

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {hasAssessment && (
          <a className="text-link" href={`#${lesson.id}-assessment`}>
            {label('test')}
          </a>
        )}
        <Link className="text-link" href={courseSectionHref(courseId, 'answers', day)}>
          {t('qa')}
        </Link>
        <Link className="text-link" href={courseSectionHref(courseId, 'tests', day)}>
          {ui.testsInterview}
        </Link>
      </div>
    </StepCard>
  );
}

/**
 * One topic in a fixed, short order: What is it? → question → answer → example.
 * Only the presentation changes; the authored text and IDs stay the same.
 */
function TopicParts({ lesson, index }: { lesson: CourseLesson; index: number }) {
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const t = useDayCopy();
  const text = (value: CourseLesson['title']) => courseText(value, contentLanguage);
  const part = lesson.sections[index];
  const question = lesson.questions.find((item) => item.relatedSection === index);
  const label = 'text-xs font-semibold tracking-wide text-brand uppercase';
  return (
    <div className="grid gap-4" data-topic-parts="">
      <div className="grid gap-1">
        <span className={label}>{t('whatIs')}</span>
        <p className="preserve-lines m-0">{text(part.body)}</p>
      </div>
      {question && (
        <div className="grid gap-1">
          <span className={label}>{t('question')}</span>
          <p className="m-0 font-medium">{text(question.question)}</p>
          <details>
            <summary className="cursor-pointer text-sm font-medium text-brand">
              {t('showAnswer')}
            </summary>
            <p className="preserve-lines mt-2 mb-0">{text(question.answer)}</p>
          </details>
        </div>
      )}
      {part.code && (
        <div className="grid gap-1">
          <span className={label}>{t('sample')}</span>
          <pre tabIndex={0}>
            <code>{part.code}</code>
          </pre>
          {part.output && (
            <p className="m-0 text-sm">
              <span className="font-medium">{t('result')}: </span>
              <code className="preserve-lines">{text(part.output)}</code>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
