'use client';
import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { FileText, Layers } from 'lucide-react';
import { LoadingState } from '@/components/learning/loading-state';
import { coursePublishedDays } from '@/content/courses/catalog';
import { emptyCourseProgress } from '@/lib/account/progress';
import { courseDisplayName } from '@/lib/catalog-copy';
import { COURSE_MATERIAL_LABEL, courseDayCount } from '@/lib/course-copy';
import { courseAccessTier } from '@/lib/courses/access';
import { fetchCourseContent } from '@/lib/courses/fetch-course';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseDayProgress, courseMonthPlan } from '@/lib/courses/plan';
import type { CourseContent } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY, lessonTranslationNotice } from '@/lib/learning-ui-copy';
import { PREMIUM_COPY } from '@/lib/premium-copy';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { CourseAnswers } from './course-answers';
import { CourseDay } from './course-day';
import { JavaScriptMonths, TrackStages } from './course-navigation';
import { CoursePlan } from './course-plan';
import { CourseReview } from './course-review';
import { MATERIALS_TITLE } from './course-workspace-copy';

const EMPTY_PROGRESS = emptyCourseProgress();
const SELECTED_DAY_KEY = 'selected-day-v3';
const ACCESS_STATUSES = [401, 403, 503];

// Old links point to a lesson with "#lesson-id". Read that id from the URL hash.
const subscribeHash = (notify: () => void) => {
  window.addEventListener('hashchange', notify);
  return () => window.removeEventListener('hashchange', notify);
};
const readHash = () => {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return '';
  }
};

/** True when some English text of the course is missing and falls back to another language. */
function hasEnglishFallback(content: CourseContent) {
  return content.lessons.some((lesson) =>
    [
      lesson.title,
      lesson.summary,
      ...lesson.sections.flatMap((part) => [part.title, part.body]),
      ...lesson.questions.flatMap((question) => [
        question.question,
        question.answer,
        ...question.options,
      ]),
      ...(lesson.practice
        ? [lesson.practice.task, lesson.practice.hint, ...lesson.practice.criteria]
        : []),
    ].some((value) => !value.en),
  );
}

/** Downloadable files attached to the course. */
function CourseMaterials({ content }: { content: CourseContent }) {
  const language = useLearningStore((state) => state.language);
  if (!content.files.length) return null;
  return (
    <section className="panel course-materials">
      <h2>{MATERIALS_TITLE[language]}</h2>
      <ul>
        {content.files.map((file, index) => {
          const extension = file.title.match(/\.([a-z0-9]{1,8})$/i)?.[1];
          return (
            <li key={file.id}>
              <a className="text-link" href={file.url} download title={file.title}>
                <FileText size={16} aria-hidden="true" />
                {COURSE_MATERIAL_LABEL[language]} {index + 1}
                {extension && ` · ${extension.toUpperCase()}`}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Shown when the course could not be loaded, for example a paid course without access. */
function CourseAccessGate({
  courseId,
  accessStatus,
  onRetry,
}: {
  courseId: ImportedCourseId;
  accessStatus: number | null;
  onRetry: () => void;
}) {
  const language = useLearningStore((state) => state.language);
  const ui = LEARNING_UI_COPY[language];
  const premium = PREMIUM_COPY[language];
  const requiredTier = courseAccessTier(courseId);

  const message =
    accessStatus === 401
      ? premium.login
      : accessStatus === 403
        ? premium.required + ' ' + (requiredTier === 'expert' ? 'Expert' : 'Pro')
        : accessStatus === 503
          ? premium.unavailable
          : ui.courseUnavailable;

  return (
    <div className="panel course-access-gate">
      <p role="alert">{message}</p>
      {requiredTier !== 'starter' && <p>{premium.protected}</p>}
      <div className="button-row">
        {accessStatus === 401 && (
          <Link className="button primary" href="/login">
            {premium.signIn}
          </Link>
        )}
        {accessStatus && (
          <Link className="button subtle" href="/plans">
            {premium.plans}
          </Link>
        )}
        <button className="button subtle" onClick={onRetry}>
          {ui.retry}
        </button>
      </div>
    </div>
  );
}

/** One course page: plan, day lesson, practice, tests, answers or review. */
export function CourseWorkspace({
  courseId,
  section,
  initialContent,
  day: requestedDay,
}: {
  courseId: ImportedCourseId;
  section: string;
  initialContent?: CourseContent;
  day?: number;
}) {
  const state = useLearningStore();
  const copy = COPY[state.language];
  const ui = LEARNING_UI_COPY[state.language];
  const progress = state.courses[courseId] || EMPTY_PROGRESS;
  const legacyLessonId = useSyncExternalStore(subscribeHash, readHash, () => '');
  const requiredTier = courseAccessTier(courseId);

  const [content, setContent] = useState<CourseContent | null>(initialContent || null);
  const [error, setError] = useState(false);
  const [accessStatus, setAccessStatus] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);

  // Opening a course page makes it the selected course and closes side panels.
  const { selectedCourse, courseChosen, chooseCourse } = state;
  useEffect(() => {
    if (selectedCourse === courseId && courseChosen) return;
    chooseCourse(courseId);
    useAppStore.setState({ sidebarOpen: false, tutorDrawerOpen: false, tutorQuestion: null });
  }, [courseId, selectedCourse, courseChosen, chooseCourse]);

  // Free courses arrive from the server render. Paid courses load here with the access token.
  useEffect(() => {
    if (initialContent) return;
    const controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]);
    fetchCourseContent(courseId, requiredTier, signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if ('content' in result) {
          setContent(result.content);
          setError(false);
          setAccessStatus(null);
          return;
        }
        if (requiredTier !== 'starter' && ACCESS_STATUSES.includes(result.status))
          setAccessStatus(result.status);
        setError(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [courseId, retry, initialContent, requiredTier]);

  const plan = courseMonthPlan(content?.lessons || []);
  const statuses = courseDayProgress(
    plan,
    progress.completedTopics,
    progress.completedPractice,
    progress.confirmedDays,
  );

  // Which day to show: the day in the URL, else the last day the learner opened,
  // else the current day. Older versions saved the selected day under other keys.
  const oldSelection = progress.drafts['selected-day-v2'];
  const rememberedDay = Number(
    progress.drafts[SELECTED_DAY_KEY] ??
      (courseId === 'html' && oldSelection !== undefined
        ? Number(oldSelection) + 1
        : progress.drafts['selected-day']),
  );
  const remembered = statuses.days.find(
    (entry) => entry.day === rememberedDay && entry.status !== 'upcoming',
  );
  const day = requestedDay ?? remembered?.day ?? statuses.current?.day ?? plan.at(-1)?.day ?? 1;

  const legacyLesson = legacyLessonId
    ? content?.lessons.find((lesson) => lesson.id === legacyLessonId)
    : null;
  const lesson = legacyLesson || plan.find((item) => item.day === day)?.lesson;
  const entry = statuses.days.find(
    (item) => item.lesson.id === lesson?.id && item.day === (legacyLesson?.day ?? day),
  );

  const saveCourseDraft = state.saveCourseDraft;
  useEffect(() => {
    const isValidDay = day >= 0 && day <= coursePublishedDays(courseId);
    if (isValidDay && progress.drafts[SELECTED_DAY_KEY] !== String(day))
      saveCourseDraft(courseId, SELECTED_DAY_KEY, String(day));
  }, [courseId, day, progress.drafts, saveCourseDraft]);

  const translationNotice =
    state.contentLanguage === 'en' && content && hasEnglishFallback(content)
      ? ui.contentFallback
      : lessonTranslationNotice(state.language);

  const titles: Record<string, string> = {
    home: copy.home,
    plan: copy.plan,
    practice: copy.practice,
    tests: ui.testsInterview,
    interview: ui.testsInterview,
    answers: ui.answersInterview,
    revision: copy.revision,
    'weak-topics': copy.weak,
  };

  function renderSection(content: CourseContent) {
    if (section === 'revision' || section === 'weak-topics') {
      return (
        <CourseReview
          courseId={courseId}
          content={content}
          progress={progress}
          mode={section === 'revision' ? 'revision' : 'weak'}
        />
      );
    }
    if (section === 'plan') {
      return (
        <CoursePlan
          courseId={courseId}
          days={statuses.days}
          selectedDay={day}
          progress={progress}
        />
      );
    }
    if (section === 'answers') {
      const openedLessonIds = new Set(
        statuses.days.filter((item) => item.status !== 'upcoming').map((item) => item.lesson.id),
      );
      return (
        <CourseAnswers
          courseId={courseId}
          lessons={content.lessons}
          openedLessonIds={openedLessonIds}
        />
      );
    }
    return (
      <CourseDay
        courseId={courseId}
        section={section}
        content={content}
        plan={plan}
        days={statuses.days}
        currentDay={statuses.current?.day ?? 1}
        day={day}
        lesson={lesson}
        entry={entry}
        progress={progress}
      />
    );
  }

  return (
    <section className="course-workspace">
      <Link href="/courses" className="back-link" transitionTypes={['nav-back']}>
        <Layers size={16} />
        {ui.allCourses}
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {courseDisplayName(courseId, state.language)} ·{' '}
            {courseDayCount(plan.length, state.language)}
          </span>
          <h1>{titles[section]}</h1>
          <p>{section === 'plan' ? ui.planIntro : ui.dayIntro}</p>
        </div>
      </div>
      <TrackStages courseId={courseId} language={state.language} />
      {translationNotice && <p role="note">{translationNotice}</p>}
      <JavaScriptMonths courseId={courseId} language={state.language} />

      {error ? (
        <CourseAccessGate
          courseId={courseId}
          accessStatus={accessStatus}
          onRetry={() => {
            setError(false);
            setAccessStatus(null);
            setRetry((count) => count + 1);
          }}
        />
      ) : !content ? (
        <LoadingState label={copy.loading} />
      ) : (
        <>
          {(section === 'plan' || section === 'home') && <CourseMaterials content={content} />}
          {renderSection(content)}
        </>
      )}
    </section>
  );
}
