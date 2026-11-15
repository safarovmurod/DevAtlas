'use client';
import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { useLearningStore } from '@/stores/learning-store';
import { CourseQuestion } from './course-question';

const PAGE_SIZE = 6;
type AnswerMode = 'test' | 'interview' | 'read';
const HIDE: Record<InterfaceLocale, string> = {
  ru: 'Скрыть ответы',
  tg: 'Пинҳон кардани ҷавобҳо',
  en: 'Hide answers',
  es: 'Ocultar respuestas',
};

/** One question and its answer. In self-test mode the answer waits behind a button. */
function QuestionAnswer({
  question,
  answer,
  hidden,
}: {
  question: string;
  answer: string;
  hidden: boolean;
}) {
  const language = useLearningStore((state) => state.language);
  const copy = COPY[language];
  const [shown, setShown] = useState(false);
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-background p-4">
      <div className="grid gap-1">
        <span className="text-xs font-semibold tracking-wider text-brand uppercase">
          {copy.question}
        </span>
        <p className="text-[15px] leading-6 font-semibold text-foreground">{question}</p>
      </div>
      <div className="grid gap-1.5 rounded-lg bg-muted/60 p-3">
        <span className="text-xs font-semibold tracking-wider text-success uppercase">
          {copy.answer}
        </span>
        {!hidden || shown ? (
          <p className="preserve-lines text-[15px] leading-7">{answer}</p>
        ) : (
          <button
            type="button"
            className="button subtle justify-self-start"
            onClick={() => setShown(true)}
          >
            {copy.showAnswer}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Questions and answers of the whole course, day by day.
 * Pick a day and practise, or open the reference answers.
 */
export function CourseAnswers({
  courseId,
  lessons,
  initialDay,
}: {
  courseId: ImportedCourseId;
  lessons: CourseLesson[];
  initialDay?: number;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const copy = COPY[language];
  const ui = LEARNING_UI_COPY[language];
  const text = (value: CourseLesson['title']) => courseText(value, contentLanguage);

  const [query, setQuery] = useState('');
  const [day, setDay] = useState<number | null>(initialDay ?? null);
  const [mode, setMode] = useState<AnswerMode>('test');
  const [hidden, setHidden] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const search = useDeferredValue(query.trim().toLowerCase());

  // Days in course order first; reference lessons without a day (for example the Sass
  // library after the CSS fundamentals) follow them.
  const scheduled = lessons
    .filter((lesson) => lesson.day !== undefined)
    .sort((a, b) => a.day! - b.day!);
  const reference = lessons.filter((lesson) => lesson.day === undefined);
  const library = [...scheduled, ...reference]
    .filter((lesson) => lesson.questions.length > 0 || (mode === 'interview' && lesson.interview))
    .filter((lesson) => day === null || lesson.day === day)
    .filter(
      (lesson) =>
        !search ||
        [
          text(lesson.title),
          ...(lesson.interview
            ? [text(lesson.interview.question), text(lesson.interview.answer)]
            : []),
          ...lesson.questions.flatMap((question) => [
            text(question.question),
            text(question.answer),
          ]),
        ]
          .join(' ')
          .toLowerCase()
          .includes(search),
    );

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label={ui.answersInterview}>
          {(['test', 'interview', 'read'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={cn('button', mode === value ? 'primary' : 'subtle')}
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                setLimit(PAGE_SIZE);
              }}
            >
              {value === 'test'
                ? copy.tests
                : value === 'interview'
                  ? copy.interview
                  : copy.answers}
            </button>
          ))}
        </div>
        <input
          type="search"
          aria-label={copy.search}
          placeholder={copy.search}
          className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-4 text-[15px] sm:max-w-sm"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(PAGE_SIZE);
          }}
        />
        {mode === 'read' && (
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(event) => setHidden(event.target.checked)}
            />
            {HIDE[language]}
          </label>
        )}
      </div>

      <nav
        aria-label={ui.chooseDay}
        className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[null, ...scheduled.map((lesson) => lesson.day!)].map((value) => (
          <button
            type="button"
            key={value ?? 'all'}
            aria-pressed={day === value}
            onClick={() => {
              setDay(value);
              setLimit(PAGE_SIZE);
            }}
            className={cn(
              'inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors',
              day === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            {value ?? copy.all}
          </button>
        ))}
      </nav>

      {library.slice(0, limit).map((lesson) => (
        <article
          className="grid scroll-mt-24 gap-4 rounded-2xl border border-border bg-card p-5"
          id={lesson.day !== undefined ? `day-${lesson.day}` : lesson.id}
          key={lesson.id}
        >
          <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {lesson.day !== undefined && (
              <span className="badge">
                {ui.day} {lesson.day}
              </span>
            )}
            <h2 className="min-w-0 flex-1 text-lg font-semibold">{text(lesson.title)}</h2>
          </header>
          {mode === 'read' &&
            [...lesson.questions, ...(lesson.interview ? [lesson.interview] : [])].map(
              (question) => (
                <QuestionAnswer
                  key={question.id + String(hidden)}
                  question={text(question.question)}
                  answer={text(question.answer)}
                  hidden={hidden}
                />
              ),
            )}
          {mode === 'test' &&
            lesson.questions.map((question) => (
              <CourseQuestion
                key={question.id + mode}
                courseId={courseId}
                lesson={lesson}
                question={question}
                mode={mode}
              />
            ))}
          {mode === 'interview' &&
            (lesson.interview ? [lesson.interview] : lesson.questions).map((question) => (
              <CourseQuestion
                key={question.id + mode}
                courseId={courseId}
                lesson={lesson}
                question={question}
                mode={mode}
              />
            ))}
          <Link
            className="text-link inline-flex items-center gap-1 justify-self-start"
            href={courseSectionHref(courseId, 'home', lesson.day || 1)}
          >
            {copy.openLesson} <ArrowRight size={15} />
          </Link>
        </article>
      ))}

      {!library.length && <p role="status">{copy.empty}</p>}

      {library.length > limit && (
        <button
          className="button subtle justify-self-start"
          onClick={() => setLimit((count) => count + PAGE_SIZE)}
        >
          {ui.showMore}
        </button>
      )}
    </section>
  );
}
