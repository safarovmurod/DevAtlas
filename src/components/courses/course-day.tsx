'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import type { CourseProgress } from '@/lib/account/progress';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import type { CourseDayItem, CoursePlanDay } from '@/lib/courses/plan';
import { blockingCourseDay, dayExamInterview, isInterviewDay } from '@/lib/courses/strict-attempt';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { cn } from '@/lib/utils';
import { useLearningStore } from '@/stores/learning-store';
import { LearnStep, PracticeStep } from './lesson-flow-steps';
import { PRACTICE_LOCK_COPY } from './practice-lock';
import { DayExam } from './day-exam';
import { usePracticeAccess } from './use-practice-access';
import type { PracticeAccess } from '@/lib/billing/practice-access';
export const DAY_COPY = {
  ru: {
    blocked: (day: number) => `Сначала изучите урок и отправьте тест за день ${day}.`,
    notice: 'Сегодня экзамен: тест и письменное интервью.',
    learn: 'Прочитайте урок и отметьте его как пройденный.',
    practice: 'Откройте задание и примените знания из урока.',
  },
  en: {
    blocked: (day: number) => `Study day ${day} and submit its test first.`,
    notice: 'Today’s exam includes a test and a written interview.',
    learn: 'Read the lesson and mark it complete.',
    practice: 'Open the task and apply what you learned.',
  },
  tg: {
    blocked: (day: number) => `Аввал дарси рӯзи ${day}-ро хонед ва тесташро супоред.`,
    notice: 'Имрӯз имтиҳон: тест ва мусоҳибаи хаттӣ.',
    learn: 'Дарсро хонед ва анҷомашро қайд кунед.',
    practice: 'Машқро кушоед ва чизҳои омӯхтаатонро дар амал санҷед.',
  },
  es: {
    blocked: (day: number) => `Estudia el día ${day} y envía su prueba primero.`,
    notice: 'Hoy hay un examen: prueba y entrevista escrita.',
    learn: 'Lee la lección y márcala como completada.',
    practice: 'Abre la tarea y aplica lo aprendido.',
  },
};

function subscribeHash(notify: () => void) {
  window.addEventListener('hashchange', notify);
  return () => window.removeEventListener('hashchange', notify);
}

function DayStrip({
  courseId,
  section,
  days,
  selectedDay,
  confirmed,
}: {
  courseId: ImportedCourseId;
  section: string;
  days: CourseDayItem[];
  selectedDay: number;
  confirmed: readonly string[];
}) {
  const language = useLearningStore((state) => state.language);
  const copy = COPY[language];
  const ui = LEARNING_UI_COPY[language];
  const strip = useRef<HTMLElement>(null);
  const [blockedDay, setBlockedDay] = useState<number | null>(null);

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
    <>
      <nav
        className="day-strip mb-5 flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-[var(--depth-1)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={strip}
        aria-label={ui.chooseDay}
      >
        {days.map((entry) => {
          const blocker = blockingCourseDay(days, entry.day, confirmed);
          if (blocker)
            return (
              <button
                type="button"
                key={entry.day}
                aria-label={`${ui.day} ${entry.day} · ${DAY_COPY[language].blocked(blocker.day)}`}
                className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 text-sm font-semibold tabular-nums text-muted-foreground hover:bg-muted"
                onClick={() => setBlockedDay(blocker.day)}
              >
                {entry.day}
                <LockKeyhole size={12} aria-hidden="true" />
              </button>
            );
          return (
            <Link
              prefetch={false}
              key={entry.day}
              href={courseSectionHref(courseId, section, entry.day)}
              transitionTypes={[entry.day < selectedDay ? 'nav-back' : 'nav-forward']}
              aria-current={selectedDay === entry.day ? 'step' : undefined}
              aria-label={`${ui.day} ${entry.day}${entry.status === 'done' ? ` · ${copy.completed}` : ''}`}
              className={cn(
                'inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 text-sm font-semibold tabular-nums no-underline transition-colors duration-200',
                selectedDay === entry.day
                  ? 'bg-primary text-primary-foreground shadow-[0_6px_14px_-6px_rgba(79,70,229,0.65)]'
                  : entry.status === 'done'
                    ? 'bg-success-soft text-success hover:bg-success-soft/75'
                    : entry.status === 'current'
                      ? 'text-brand ring-1 ring-primary/50 hover:bg-muted'
                      : 'text-foreground hover:bg-muted',
              )}
            >
              {entry.day}
              {entry.status === 'done' && <CheckCircle2 size={12} aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>
      {blockedDay !== null && (
        <p role="status" className="mb-4 rounded-xl border border-border bg-card p-3 text-sm">
          {DAY_COPY[language].blocked(blockedDay)}
        </p>
      )}
    </>
  );
}

export function CourseDay({
  courseId,
  section,
  plan,
  days,
  day,
  lesson,
  progress,
  practiceAccess: accessOverride,
}: {
  courseId: ImportedCourseId;
  section: string;
  plan: CoursePlanDay[];
  days: CourseDayItem[];
  day: number;
  lesson: CourseLesson | undefined;
  progress: CourseProgress;
  practiceAccess?: PracticeAccess;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const ui = LEARNING_UI_COPY[language];
  const text = (value: CourseLesson['title']) => courseText(value, contentLanguage);
  const testsPage = ['answers', 'tests', 'interview'].includes(section);
  const stripSection = testsPage ? 'answers' : 'home';
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => '',
  );
  const [tabOverride, setTab] = useState<'learn' | 'practice' | null>(null);
  const tab =
    tabOverride ?? (section === 'practice' || hash === '#day-practice' ? 'practice' : 'learn');
  const labels = DAY_COPY[language];

  // A locked practice never blocks the day: the lesson and quiz stay free.
  const accountPracticeAccess = usePracticeAccess();
  const practiceAccess = accessOverride ?? accountPracticeAccess;
  const studied = !!lesson && progress.completedTopics.includes(lesson.id);
  const practiced =
    !!lesson && (!lesson.practice || progress.completedPractice.includes(lesson.id));
  const blocker = blockingCourseDay(days, day, progress.confirmedDays);
  const item = plan.find((entry) => entry.day === day);
  const lockedPractice =
    practiceAccess === 'locked' && Boolean(lesson?.practice || lesson?.practiceAvailable);
  const copy = COPY[language];

  return (
    <>
      <DayStrip
        courseId={courseId}
        section={stripSection}
        days={days}
        selectedDay={day}
        confirmed={progress.confirmedDays}
      />
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

      {blocker ? (
        <div className="grid justify-items-start gap-3 rounded-2xl border border-border bg-card p-5">
          <p role="alert">{labels.blocked(blocker.day)}</p>
          <Link
            className="button primary"
            href={courseSectionHref(courseId, 'home', blocker.day)}
            transitionTypes={['nav-back']}
          >
            {ui.day} {blocker.day}
          </Link>
        </div>
      ) : lesson && item ? (
        <article
          className="grid min-w-0 grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-4 sm:p-7 [&_pre]:max-w-full [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-code [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:leading-6 [&_pre]:text-code-foreground"
          id={lesson.id}
          key={lesson.id}
        >
          <header className="grid gap-2">
            <h2 className="text-2xl leading-8 font-semibold tracking-tight">
              {text(lesson.title)}
            </h2>
            {testsPage && (
              <p className="max-w-[80ch] text-[15px] leading-6 text-muted-foreground">
                {text(lesson.summary)}
              </p>
            )}
          </header>

          {testsPage ? (
            <DayExam courseId={courseId} item={item} plan={plan} />
          ) : (
            <>
              {isInterviewDay(day) &&
                dayExamInterview(lesson, day) &&
                !progress.daySubmissions?.[lesson.id] && (
                  <p
                    role="status"
                    className="rounded-xl border border-primary/25 bg-primary-soft p-4 font-medium text-foreground"
                  >
                    {labels.notice}
                  </p>
                )}
              <div
                role="group"
                aria-label={copy.home}
                className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-muted p-1"
              >
                <button
                  type="button"
                  aria-pressed={tab === 'learn'}
                  className={cn('button', tab === 'learn' ? 'primary' : 'subtle')}
                  onClick={() => setTab('learn')}
                >
                  {copy.learn}
                </button>
                <button
                  type="button"
                  aria-pressed={tab === 'practice'}
                  className={cn('button', tab === 'practice' ? 'primary' : 'subtle')}
                  onClick={() => setTab('practice')}
                  title={lockedPractice ? PRACTICE_LOCK_COPY[language].title : undefined}
                >
                  {lockedPractice && <LockKeyhole size={17} aria-hidden="true" />}
                  {copy.practice}
                </button>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {tab === 'learn'
                  ? labels.learn
                  : lockedPractice
                    ? PRACTICE_LOCK_COPY[language].title
                    : labels.practice}
              </p>
              {tab === 'learn' ? (
                <LearnStep courseId={courseId} lesson={lesson} plan={plan} studied={studied} />
              ) : (
                <PracticeStep
                  courseId={courseId}
                  lesson={lesson}
                  practiced={practiced}
                  access={practiceAccess}
                />
              )}
              <Link
                className="button subtle w-fit"
                href={courseSectionHref(courseId, 'answers', day)}
                transitionTypes={['nav-forward']}
              >
                {ui.answersInterview}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
        </article>
      ) : (
        <p role="alert">{ui.missingDay}</p>
      )}
    </>
  );
}
