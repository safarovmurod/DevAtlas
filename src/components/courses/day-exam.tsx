'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardCheck, Clock3, Maximize2 } from 'lucide-react';
import type { CourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { dayExamInterview, dayExamQuiz, isInterviewDay } from '@/lib/courses/strict-attempt';
import type { CoursePlanDay } from '@/lib/courses/plan';
import { courseText } from '@/lib/courses/schema';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';

const LABELS = {
  ru: [
    'Проверка дня',
    'Экзамен: тест и интервью',
    'Начать',
    'Отправить ответы',
    'Можно оставить вопрос без ответа. После отправки ответы менять нельзя.',
    'Без ответа',
    'Неверно',
    'Автопроверка письменного ответа сверяет его с эталоном.',
    'Разбор результата',
    'К повторению',
    'Сначала изучите урок и отметьте его как пройденный.',
  ],
  en: [
    'Daily check',
    'Exam: test and interview',
    'Start',
    'Submit answers',
    'You can skip a question. Submitted answers cannot be changed.',
    'Unanswered',
    'Incorrect',
    'Written answers are checked against the reference wording.',
    'Results',
    'Open review',
    'Study the lesson and mark it complete first.',
  ],
  tg: [
    'Санҷиши рӯз',
    'Имтиҳон: тест ва мусоҳиба',
    'Оғоз',
    'Фиристодани ҷавобҳо',
    'Саволро холӣ мондан мумкин. Баъди фиристодан ҷавоб иваз намешавад.',
    'Бе ҷавоб',
    'Хато',
    'Ҷавоби хаттӣ бо ҷавоби намунавӣ муқоиса мешавад.',
    'Натиҷа',
    'Ба такрор',
    'Аввал дарсро омӯзед ва анҷомашро қайд кунед.',
  ],
  es: [
    'Prueba del día',
    'Examen: prueba y entrevista',
    'Empezar',
    'Enviar respuestas',
    'Puedes saltar una pregunta. No puedes cambiar las respuestas enviadas.',
    'Sin respuesta',
    'Incorrecta',
    'Las respuestas escritas se comparan con la respuesta de referencia.',
    'Resultados',
    'Abrir repaso',
    'Primero estudia la lección y márcala como completada.',
  ],
} as const;

type Draft = { deadline: number; choices: Record<string, number>; written: string };
const EMPTY: Draft = { deadline: 0, choices: {}, written: '' };

function readDraft(value?: string): Draft {
  if (!value) return EMPTY;
  try {
    const draft = JSON.parse(value) as Draft;
    if (Number.isFinite(draft.deadline) && draft.choices && typeof draft.written === 'string')
      return draft;
  } catch {
    return EMPTY;
  }
  return EMPTY;
}

type DayExamProps = {
  courseId: CourseId;
  plan: CoursePlanDay[];
  item: CoursePlanDay;
  react?: { month: number; studied: readonly string[]; topicIds: Record<string, string> };
};

export function DayExam(props: DayExamProps) {
  const accountScope = useLearningStore(() => useLearningStore.persist.getOptions().name ?? '');
  // Changing accounts discards the open form, timer and focus trap, not saved account drafts.
  return (
    <DayExamSession
      key={`${accountScope}:${props.courseId}:${props.item.lesson.id}`}
      {...props}
      accountScope={accountScope}
    />
  );
}

function DayExamSession({
  courseId,
  plan,
  item,
  react,
  accountScope,
}: DayExamProps & { accountScope: string }) {
  const { day, lesson } = item;
  const state = useLearningStore();
  const progress = courseId === 'react' ? state : state.courses[courseId];
  const copy = COPY[state.language];
  const [
    daily,
    exam,
    start,
    submit,
    policy,
    skipped,
    wrong,
    grading,
    resultTitle,
    review,
    studyFirst,
  ] = LABELS[state.language];
  const checkpoint = isInterviewDay(day);
  const interview = dayExamInterview(lesson, day);
  const quiz = dayExamQuiz(lesson, day);
  const title = checkpoint ? exam : daily;
  const saved = progress?.daySubmissions?.[lesson.id];
  const studied = react
    ? react.studied.every((id) => progress?.completedTopics.includes(id))
    : progress?.completedTopics.includes(lesson.id);
  const href = (section: string, targetDay: number) =>
    courseId === 'react'
      ? section === 'revision'
        ? '/revision'
        : `/home?month=${react?.month ?? 1}&day=${targetDay}`
      : courseSectionHref(courseId, section, targetDay);
  const next = plan.find((entry) => entry.day > day);
  const draftId = `exam:${lesson.id}`;
  const draft = readDraft(progress?.drafts[draftId]);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const box = useRef<HTMLElement>(null);
  const finish = useRef<() => void>(() => {});
  const minutes = Math.max(3, Math.ceil(quiz.length * 0.9 + (interview ? 3 : 0)));
  const text = (value: typeof lesson.title) => courseText(value, state.contentLanguage);

  function store(next: Draft) {
    if (accountScope !== (useLearningStore.persist.getOptions().name ?? '')) return;
    if (courseId === 'react') state.saveDraft(draftId, JSON.stringify(next));
    else state.saveCourseDraft(courseId, draftId, JSON.stringify(next));
  }
  function complete() {
    if (accountScope !== (useLearningStore.persist.getOptions().name ?? '')) return;
    const result = state.submitCourseDay(courseId, day, plan, draft.choices, draft.written, react);
    if (!result) return;
    setRunning(false);
    if (document.fullscreenElement === box.current) void document.exitFullscreen().catch(() => {});
  }
  useEffect(() => {
    finish.current = complete;
  });
  useEffect(() => {
    if (!checkpoint || saved || !draft.deadline) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((draft.deadline - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0 && running) finish.current();
    };
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [checkpoint, saved, draft.deadline, running]);
  useEffect(() => {
    if (!checkpoint || !running || saved) return;
    const section = box.current;
    if (!section) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    section.focus({ preventScroll: true });
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(
        section.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), textarea:not(:disabled)',
        ),
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) return;
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === section)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', trap);
    };
  }, [checkpoint, running, saved]);

  function begin() {
    if (accountScope !== (useLearningStore.persist.getOptions().name ?? '')) return;
    if (checkpoint) {
      const deadline = draft.deadline || Date.now() + minutes * 60_000;
      if (!draft.deadline) store({ ...draft, deadline });
      setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
      void box.current?.requestFullscreen?.().catch(() => {});
    }
    setRunning(true);
  }

  if (saved)
    return (
      <section
        className="grid gap-4 rounded-2xl border border-border bg-muted/30 p-5"
        aria-label={resultTitle}
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 size={20} className="text-success" />
            {resultTitle}
          </h3>
          <strong className="rounded-full bg-primary-soft px-4 py-2 text-xl text-brand">
            {saved.score}%
          </strong>
        </header>
        {saved.answers
          .filter((answer) => !answer.correct)
          .map((answer) => {
            const question =
              answer.mode === 'interview'
                ? interview
                : lesson.questions.find((item) => item.id === answer.id);
            if (!question) return null;
            const picked =
              'options' in question && answer.answer
                ? question.options[Number(answer.answer)]
                : null;
            return (
              <div
                key={answer.id}
                className="grid gap-2 rounded-xl border border-border bg-card p-4"
              >
                <strong className="text-foreground">{text(question.question)}</strong>
                <p className="text-sm text-destructive">
                  {answer.answer ? wrong : skipped}
                  {answer.answer && ` · ${picked ? text(picked) : answer.answer}`}
                </p>
                <p className="text-sm text-muted-foreground">{text(question.answer)}</p>
                {'hint' in question && question.hint && (
                  <p className="text-sm text-foreground">{text(question.hint)}</p>
                )}
                {'relatedSection' in question &&
                  question.relatedSection !== undefined &&
                  lesson.sections[question.relatedSection] && (
                    <Link
                      className="text-link w-fit text-sm"
                      href={`${href('home', day)}#${lesson.id}-section-${question.relatedSection}`}
                    >
                      {text(lesson.sections[question.relatedSection].title)}
                    </Link>
                  )}
              </div>
            );
          })}
        <div className="flex flex-wrap gap-2">
          <Link className="button subtle" href={href('revision', day)}>
            {review}
          </Link>
          {next && (
            <Link
              className="button primary"
              href={href('home', next.day)}
              transitionTypes={['nav-forward']}
            >
              {copy.next}
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </section>
    );

  return (
    <section
      ref={box}
      tabIndex={-1}
      className={`grid content-start gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 ${running && checkpoint ? 'fixed inset-0 z-[100] overflow-y-auto rounded-none bg-background px-[max(16px,calc((100vw-960px)/2))]' : ''}`}
      aria-label={title}
    >
      <header
        className={`flex flex-wrap items-center justify-between gap-3 ${running && checkpoint ? 'sticky top-0 z-10 rounded-xl border border-border bg-card px-4 py-3 shadow-sm' : ''}`}
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <ClipboardCheck size={20} className="text-brand" />
          {title}
        </h3>
        {checkpoint && (
          <span className="badge inline-flex items-center gap-1.5">
            <Clock3 size={15} />
            {running
              ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
              : `${minutes}:00`}
          </span>
        )}
      </header>
      <p className="text-sm text-muted-foreground">{studied ? policy : studyFirst}</p>
      {!running ? (
        <button
          className="button primary justify-self-start"
          data-strict-start=""
          disabled={!studied || !state.ready}
          onClick={begin}
        >
          {checkpoint && <Maximize2 size={16} aria-hidden="true" />}
          {start}
        </button>
      ) : (
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            complete();
          }}
        >
          {quiz.map((question) => (
            <fieldset key={question.id} className="course-question min-w-0">
              <legend className="font-semibold">{text(question.question)}</legend>
              <div className="course-options">
                {question.options.map((option, index) => (
                  <label key={index}>
                    <input
                      type="radio"
                      name={question.id}
                      checked={draft.choices[question.id] === index}
                      onChange={() =>
                        store({ ...draft, choices: { ...draft.choices, [question.id]: index } })
                      }
                    />
                    <span>{text(option)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {interview && (
            <label className="grid gap-2">
              <strong>{text(interview.question)}</strong>
              <p className="text-xs text-muted-foreground">{grading}</p>
              <textarea
                className="rounded-xl border border-border bg-background p-3"
                rows={4}
                maxLength={1500}
                value={draft.written}
                onChange={(event) => store({ ...draft, written: event.target.value })}
              />
            </label>
          )}
          <button type="submit" className="button primary justify-self-start">
            {submit}
          </button>
        </form>
      )}
    </section>
  );
}
