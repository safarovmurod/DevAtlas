'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import { CodeOrderGame } from '@/components/games/code-order-game';
import type { CourseProgress } from '@/lib/account/progress';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { courseDayReady, type CourseDayItem, type CoursePlanDay } from '@/lib/courses/plan';
import { courseText, type CourseContent, type CourseLesson } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { PROGRESSION_COPY } from '@/lib/progression-copy';
import { useLearningStore } from '@/stores/learning-store';
import { CoursePractice } from './course-practice';
import { CourseQuestion } from './course-question';
import { DayConfirmation } from './day-confirmation';
import { LessonFlowActivities, LessonFlowIntro } from './lesson-flow';

/** Row of day numbers. Locked days are shown but cannot be opened. */
function DayStrip({
  courseId,
  section,
  days,
  selectedDay,
}: {
  courseId: ImportedCourseId;
  section: string;
  days: CourseDayItem[];
  selectedDay: number;
}) {
  const language = useLearningStore((state) => state.language);
  const copy = COPY[language];
  const ui = LEARNING_UI_COPY[language];
  const gate = PROGRESSION_COPY[language];
  const strip = useRef<HTMLElement>(null);

  // Keep the selected day in the middle of the scrollable strip.
  useEffect(() => {
    const element = strip.current;
    const selected = element?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!element || !selected) return;
    const parent = element.getBoundingClientRect();
    const child = selected.getBoundingClientRect();
    element.scrollLeft += child.left - parent.left - (parent.width - child.width) / 2;
  }, [selectedDay, section]);

  return (
    <nav className="day-strip" ref={strip} aria-label={ui.chooseDay}>
      {days.map((entry) =>
        entry.status === 'upcoming' ? (
          <button
            type="button"
            disabled
            key={entry.day}
            className="locked-day"
            aria-disabled="true"
            aria-label={`${ui.day} ${entry.day}: ${gate.locked}`}
            title={gate.locked}
          >
            {entry.day}
            <LockKeyhole size={12} aria-hidden="true" />
          </button>
        ) : (
          <Link
            prefetch={false}
            key={entry.day}
            href={courseSectionHref(courseId, section, entry.day)}
            transitionTypes={[entry.day < selectedDay ? 'nav-back' : 'nav-forward']}
            aria-current={selectedDay === entry.day ? 'step' : undefined}
            aria-label={`${ui.day} ${entry.day}${entry.status === 'done' ? ` · ${copy.completed}` : ''}`}
          >
            {entry.day}
            {entry.status === 'done' && <CheckCircle2 size={12} aria-hidden="true" />}
          </Link>
        ),
      )}
    </nav>
  );
}

/** Theory of the day: sections, code examples, the order game and links. */
function LessonExplanation({
  courseId,
  lesson,
  content,
  plan,
  progress,
  day,
}: {
  courseId: ImportedCourseId;
  lesson: CourseLesson;
  content: CourseContent;
  plan: CoursePlanDay[];
  progress: CourseProgress;
  day: number;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const completeCourseLesson = useLearningStore((state) => state.completeCourseLesson);
  const copy = COPY[language];
  const ui = LEARNING_UI_COPY[language];
  const text = (value: CourseLesson['title']) => courseText(value, contentLanguage);
  const link = (section: string, targetDay = day) =>
    courseSectionHref(courseId, section, targetDay);

  const studied = progress.completedTopics.includes(lesson.id);
  const flow = lesson.learningFlow;
  const nextLesson = content.lessons.find((next) => next.id === flow?.nextLessonId);

  return (
    <>
      {flow && (
        <LessonFlowIntro
          flow={flow}
          lessonId={lesson.id}
          practiceHref={link('practice')}
          studied={studied}
          practiced={progress.completedPractice.includes(lesson.id)}
        />
      )}

      {lesson.sections.map((part, index) => (
        <section className="day-explanation" id={`${lesson.id}-section-${index}`} key={index}>
          <h3>{text(part.title)}</h3>
          <p className="preserve-lines">{text(part.body)}</p>
          {part.code && (
            <pre tabIndex={0}>
              <code>{part.code}</code>
            </pre>
          )}
        </section>
      ))}

      <CodeOrderGame sections={lesson.sections} seed={lesson.id} />

      {flow && (
        <LessonFlowActivities
          flow={flow}
          lessonId={lesson.id}
          practiceHref={link('practice')}
          nextTitle={nextLesson?.title}
        />
      )}

      {lesson.prerequisiteDays?.length ? (
        <aside className="lesson-connections">
          <h3>{ui.connections}</h3>
          <p>{ui.connectionsIntro}</p>
          {lesson.prerequisiteDays.map((previous) => {
            const previousDay = plan.find((item) => item.day === previous);
            if (!previousDay) return null;
            return (
              <Link key={previous} href={link('home', previous)}>
                {ui.day} {previous} — {text(previousDay.lesson.title)}
              </Link>
            );
          })}
        </aside>
      ) : null}

      <div className="button-row">
        <button
          className="button subtle"
          disabled={studied}
          onClick={() => completeCourseLesson(courseId, lesson.id)}
        >
          {studied ? copy.completed : copy.markLearned}
        </button>
        <Link className="button primary" href={link('practice')}>
          {ui.dayPractice} <ArrowRight size={16} />
        </Link>
        <Link className="text-link" href={link('tests')}>
          {ui.testsInterview}
        </Link>
      </div>
    </>
  );
}

/** Quiz questions first, then the same questions as interview practice. */
function LessonQuestions({
  courseId,
  lesson,
}: {
  courseId: ImportedCourseId;
  lesson: CourseLesson;
}) {
  const ui = LEARNING_UI_COPY[useLearningStore((state) => state.language)];
  return (
    <>
      <section>
        <h3>1. {ui.tests}</h3>
        <p>{ui.testIntro}</p>
        {lesson.questions.map((question) => (
          <CourseQuestion
            key={'test' + question.id}
            courseId={courseId}
            lesson={lesson}
            question={question}
            mode="test"
          />
        ))}
      </section>
      <section className="interview-block">
        <h3>2. {ui.interview}</h3>
        <p>{ui.interviewIntro}</p>
        {lesson.questions.map((question) => (
          <CourseQuestion
            key={'interview' + question.id}
            courseId={courseId}
            lesson={lesson}
            question={question}
            mode="interview"
          />
        ))}
      </section>
    </>
  );
}

/** One course day in the "home", "practice" or "tests" section. */
export function CourseDay({
  courseId,
  section,
  content,
  plan,
  days,
  currentDay,
  day,
  lesson,
  entry,
  progress,
}: {
  courseId: ImportedCourseId;
  section: string;
  content: CourseContent;
  plan: CoursePlanDay[];
  days: CourseDayItem[];
  currentDay: number;
  day: number;
  lesson: CourseLesson | undefined;
  entry: CourseDayItem | undefined;
  progress: CourseProgress;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const ui = LEARNING_UI_COPY[language];
  const gate = PROGRESSION_COPY[language];
  const text = (value: CourseLesson['title']) => courseText(value, contentLanguage);

  const locked = !entry || entry.status === 'upcoming';
  const canConfirm =
    !locked && courseDayReady(entry, progress.completedTopics, progress.completedPractice);

  return (
    <>
      <DayStrip courseId={courseId} section={section} days={days} selectedDay={day} />
      <div className="between day-context">
        <span className="badge">
          {ui.day} {day}
        </span>
        <Link className="text-link" href={courseSectionHref(courseId, 'plan', day)}>
          {ui.studyPlan} <ArrowRight size={15} />
        </Link>
      </div>

      {locked ? (
        <article className="panel course-lesson" role="status">
          <h2>{gate.locked}</h2>
          <Link className="button primary" href={courseSectionHref(courseId, 'home', currentDay)}>
            {gate.open}
          </Link>
        </article>
      ) : lesson ? (
        <article className="panel course-lesson" id={lesson.id} key={lesson.id}>
          <h2>{text(lesson.title)}</h2>
          <p>{text(lesson.summary)}</p>

          {section === 'home' && (
            <LessonExplanation
              courseId={courseId}
              lesson={lesson}
              content={content}
              plan={plan}
              progress={progress}
              day={day}
            />
          )}

          {section === 'practice' && lesson.practice && (
            <>
              <Link className="text-link" href={courseSectionHref(courseId, 'home', day)}>
                {ui.backExplanation}
              </Link>
              <CoursePractice courseId={courseId} lesson={lesson} />
            </>
          )}

          {(section === 'tests' || section === 'interview') && (
            <LessonQuestions courseId={courseId} lesson={lesson} />
          )}

          <DayConfirmation
            courseId={courseId}
            day={day}
            plan={plan}
            lesson={lesson}
            progress={progress}
            isDone={entry.status === 'done'}
            canConfirm={canConfirm}
          />
        </article>
      ) : (
        <p role="alert">{ui.missingDay}</p>
      )}
    </>
  );
}
