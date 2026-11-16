'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { CourseProgress } from '@/lib/account/progress';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { courseDayReady, type CourseDayItem, type CoursePlanDay } from '@/lib/courses/plan';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { cn } from '@/lib/utils';
import { useLearningStore } from '@/stores/learning-store';
import { LessonSteps } from './lesson-flow';
import { DayFinish } from './lesson-flow-finish';
import { CheckStep, LearnStep, PracticeStep } from './lesson-flow-steps';
import { CourseQuestion } from './course-question';
import { usePracticeAccess } from './use-practice-access';

/** Row of day numbers. Every day is open; the finished ones get a check mark. */
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
    <nav
      className="day-strip mb-5 flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      ref={strip}
      aria-label={ui.chooseDay}
    >
      {days.map((entry) => (
        <Link
          prefetch={false}
          key={entry.day}
          href={courseSectionHref(courseId, section, entry.day)}
          transitionTypes={[entry.day < selectedDay ? 'nav-back' : 'nav-forward']}
          aria-current={selectedDay === entry.day ? 'step' : undefined}
          aria-label={`${ui.day} ${entry.day}${entry.status === 'done' ? ` · ${copy.completed}` : ''}`}
          className={cn(
            'inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 text-sm font-semibold no-underline transition-colors duration-200',
            selectedDay === entry.day
              ? 'bg-primary text-primary-foreground'
              : entry.status === 'done'
                ? 'bg-success-soft text-success hover:bg-success-soft/70'
                : entry.status === 'current'
                  ? 'text-brand ring-1 ring-primary/50 hover:bg-muted'
                  : 'text-foreground hover:bg-muted',
          )}
        >
          {entry.day}
          {entry.status === 'done' && <CheckCircle2 size={12} aria-hidden="true" />}
        </Link>
      ))}
    </nav>
  );
}

/** Quiz questions and the day's written interview. */
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
        {(lesson.interview ? [lesson.interview] : lesson.questions).map((question) => (
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

/**
 * One course day.
 * "home" is the whole day on one page: Learn → Practice → Check.
 * "tests" is the long quiz and interview list of the same day.
 */
export function CourseDay({
  courseId,
  section,
  plan,
  days,
  day,
  lesson,
  entry,
  progress,
}: {
  courseId: ImportedCourseId;
  section: string;
  plan: CoursePlanDay[];
  days: CourseDayItem[];
  day: number;
  lesson: CourseLesson | undefined;
  entry: CourseDayItem | undefined;
  progress: CourseProgress;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const ui = LEARNING_UI_COPY[language];
  const text = (value: CourseLesson['title']) => courseText(value, contentLanguage);
  const testsPage = section === 'tests' || section === 'interview';
  const stripSection = testsPage ? 'tests' : 'home';

  // A locked practice never blocks the day: the lesson and quiz stay free.
  const practiceAccess = usePracticeAccess();
  const practiceRequired = practiceAccess !== 'locked';
  const studied = !!lesson && progress.completedTopics.includes(lesson.id);
  const practiced =
    !!lesson && (!lesson.practice || progress.completedPractice.includes(lesson.id));
  const checked =
    !!lesson &&
    lesson.questions.every((question) => progress.masteredQuestions.includes(question.id));
  const isDone = entry?.status === 'done';
  const ready = entry
    ? courseDayReady(entry, progress.completedTopics, progress.completedPractice, practiceRequired)
    : studied && (practiced || !practiceRequired);
  const current = isDone
    ? 'done'
    : !studied
      ? 'learn'
      : !practiced && practiceRequired
        ? 'practice'
        : !checked
          ? 'check'
          : 'confirm';

  return (
    <>
      <DayStrip courseId={courseId} section={stripSection} days={days} selectedDay={day} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="badge">
          {ui.day} {day}
        </span>
        <Link
          className="text-link inline-flex items-center gap-1"
          href={courseSectionHref(courseId, 'plan', day)}
        >
          {ui.studyPlan} <ArrowRight size={15} />
        </Link>
      </div>

      {lesson ? (
        <article
          className="grid min-w-0 grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-4 sm:p-7 [&_pre]:max-w-full [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-code [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:leading-6 [&_pre]:text-code-foreground"
          id={lesson.id}
          key={lesson.id}
        >
          <header className="grid gap-2">
            <h2 className="text-2xl leading-8 font-semibold tracking-tight">
              {text(lesson.title)}
            </h2>
            <p className="max-w-[80ch] text-[15px] leading-6 text-muted-foreground">
              {text(lesson.summary)}
            </p>
          </header>

          {testsPage ? (
            <>
              <LessonQuestions courseId={courseId} lesson={lesson} />
              <Link className="text-link" href={courseSectionHref(courseId, 'home', day)}>
                {ui.backExplanation}
              </Link>
            </>
          ) : (
            <>
              <LessonSteps
                done={{ learn: studied, practice: practiced, check: checked }}
                current={current}
              />
              <LearnStep courseId={courseId} lesson={lesson} plan={plan} studied={studied} />
              <PracticeStep
                courseId={courseId}
                lesson={lesson}
                practiced={practiced}
                access={practiceAccess}
              />
              <CheckStep
                courseId={courseId}
                lesson={lesson}
                day={day}
                progress={progress}
                checked={checked}
                practiceOpen={practiceAccess === 'open'}
              />
              <DayFinish
                courseId={courseId}
                day={day}
                plan={plan}
                isDone={isDone}
                ready={ready}
                practiceRequired={practiceRequired}
              />
            </>
          )}
        </article>
      ) : (
        <p role="alert">{ui.missingDay}</p>
      )}
    </>
  );
}
