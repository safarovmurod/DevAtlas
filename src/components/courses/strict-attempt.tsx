'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Maximize2, ShieldAlert } from 'lucide-react';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import type { CourseLesson } from '@/lib/courses/schema';
import { openQuestions, type AttemptEnd } from '@/lib/courses/strict-attempt';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

const COPY: Record<
  InterfaceLocale,
  {
    title: string;
    rules: string[];
    start: string;
    exit: string;
    finish: string;
    confirmExit: string;
    failed: Record<AttemptEnd, string>;
    toRevision: string;
    revision: string;
    retry: string;
    done: string;
    back: string;
  }
> = {
  ru: {
    title: 'Тест и интервью',
    rules: [
      'Откроется полный экран.',
      'Копирование и вставка отключены.',
      'Ответ отправляется кнопкой «Проверить».',
      'Выход из полного экрана, переход на другую вкладку или «Выход» — попытка не засчитывается.',
    ],
    start: 'Продолжить',
    exit: 'Выход',
    finish: 'Завершить',
    confirmExit: 'Выйти? Попытка не будет засчитана.',
    failed: {
      fullscreen: 'Попытка не засчитана: вы вышли из полного экрана.',
      hidden: 'Попытка не засчитана: вы ушли со вкладки.',
      exit: 'Попытка не засчитана: вы нажали «Выход».',
    },
    toRevision: 'Вопросы без верного ответа добавлены в «Повторение».',
    revision: 'Открыть повторение',
    retry: 'Начать заново',
    done: 'Попытка завершена',
    back: 'К уроку',
  },
  tg: {
    title: 'Тест ва интервю',
    rules: [
      'Экрани пурра кушода мешавад.',
      'Нусхабардорӣ ва гузоштан хомӯш аст.',
      'Ҷавоб бо тугмаи «Санҷидан» фиристода мешавад.',
      'Баромадан аз экрани пурра, рафтан ба вкладкаи дигар ё «Баромад» — кӯшиш ҳисоб намешавад.',
    ],
    start: 'Идома додан',
    exit: 'Баромад',
    finish: 'Анҷом',
    confirmExit: 'Мебароед? Кӯшиш ҳисоб намешавад.',
    failed: {
      fullscreen: 'Кӯшиш ҳисоб нашуд: шумо аз экрани пурра баромадед.',
      hidden: 'Кӯшиш ҳисоб нашуд: шумо аз вкладка рафтед.',
      exit: 'Кӯшиш ҳисоб нашуд: шумо «Баромад»-ро зер кардед.',
    },
    toRevision: 'Саволҳои бе ҷавоби дуруст ба «Такрор» илова шуданд.',
    revision: 'Кушодани такрор',
    retry: 'Аз нав',
    done: 'Кӯшиш анҷом ёфт',
    back: 'Ба дарс',
  },
  en: {
    title: 'Test and interview',
    rules: [
      'The screen switches to full screen.',
      'Copy and paste are turned off.',
      'Send each answer with “Check”.',
      'Leaving full screen, switching tabs or pressing “Exit” fails the attempt.',
    ],
    start: 'Continue',
    exit: 'Exit',
    finish: 'Finish',
    confirmExit: 'Exit? The attempt will fail.',
    failed: {
      fullscreen: 'Attempt failed: you left full screen.',
      hidden: 'Attempt failed: you left the tab.',
      exit: 'Attempt failed: you pressed “Exit”.',
    },
    toRevision: 'Questions without a correct answer were added to Review.',
    revision: 'Open review',
    retry: 'Start again',
    done: 'Attempt finished',
    back: 'Back to the lesson',
  },
  es: {
    title: 'Prueba y entrevista',
    rules: [
      'Se abrirá la pantalla completa.',
      'Copiar y pegar están desactivados.',
      'Envía cada respuesta con «Comprobar».',
      'Salir de la pantalla completa, cambiar de pestaña o pulsar «Salir» anula el intento.',
    ],
    start: 'Continuar',
    exit: 'Salir',
    finish: 'Terminar',
    confirmExit: '¿Salir? El intento no contará.',
    failed: {
      fullscreen: 'Intento no válido: saliste de la pantalla completa.',
      hidden: 'Intento no válido: cambiaste de pestaña.',
      exit: 'Intento no válido: pulsaste «Salir».',
    },
    toRevision: 'Las preguntas sin respuesta correcta se añadieron al Repaso.',
    revision: 'Abrir repaso',
    retry: 'Empezar de nuevo',
    done: 'Intento terminado',
    back: 'Volver a la lección',
  },
};

const block = (event: React.SyntheticEvent) => event.preventDefault();

/**
 * Strict test + interview of one day: full screen, no copy/paste, answers sent with a button.
 * Leaving full screen, hiding the tab or pressing Exit fails the attempt; every question
 * without a correct answer today is recorded as wrong, so it goes to revision.
 */
export function StrictAttempt({
  courseId,
  lesson,
  day,
  children,
}: {
  courseId: ImportedCourseId;
  lesson: CourseLesson;
  day: number;
  children: ReactNode;
}) {
  const language = useLearningStore((state) => state.language);
  const copy = COPY[language];
  const [phase, setPhase] = useState<'intro' | 'running' | 'finished'>('intro');
  const [failed, setFailed] = useState<AttemptEnd | null>(null);
  const [missed, setMissed] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const running = useRef(false);

  /** Records every open question as wrong (it moves to revision) and ends the attempt. */
  function end(reason: AttemptEnd | null) {
    if (!running.current) return;
    running.current = false;
    const store = useLearningStore.getState();
    const open = openQuestions(lesson, store.courses[courseId]);
    for (const question of open)
      store.recordCourseAnswer(
        courseId,
        { id: question.id, topicId: lesson.id },
        question.mode,
        false,
        '',
      );
    setMissed(open.length);
    setFailed(reason);
    setPhase('finished');
    if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined);
  }
  const endRef = useRef(end);
  useEffect(() => {
    endRef.current = end;
  });

  useEffect(() => {
    if (phase !== 'running') return;
    const onFullscreen = () => {
      if (!document.fullscreenElement) endRef.current('fullscreen');
    };
    const onVisibility = () => {
      if (document.hidden) endRef.current('hidden');
    };
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [phase]);

  // Leaving the page in the middle of an attempt also fails it.
  useEffect(
    () => () => {
      if (running.current) endRef.current('exit');
    },
    [],
  );

  async function start() {
    setFailed(null);
    setMissed(0);
    try {
      await box.current?.requestFullscreen?.();
    } catch {
      // Some browsers (e.g. iPhone Safari) have no Fullscreen API: the tab rule still applies.
    }
    running.current = true;
    setPhase('running');
  }

  return (
    <div
      ref={box}
      className={
        phase === 'running'
          ? 'strict-attempt grid content-start gap-5 overflow-y-auto bg-card p-4 sm:p-8'
          : 'grid gap-4'
      }
      onCopy={phase === 'running' ? block : undefined}
      onCut={phase === 'running' ? block : undefined}
      onPaste={phase === 'running' ? block : undefined}
      onContextMenu={phase === 'running' ? block : undefined}
      onDrop={phase === 'running' ? block : undefined}
    >
      {phase === 'intro' && (
        <section className="grid gap-4 rounded-2xl border border-border bg-muted/40 p-5">
          <h3 className="m-0 flex items-center gap-2 text-lg font-semibold">
            <ShieldAlert size={20} className="text-warning" aria-hidden="true" />
            {copy.title}
          </h3>
          <ul className="m-0 grid list-disc gap-1.5 pl-5 text-[15px]" role="note">
            {copy.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <button
            type="button"
            className="button primary justify-self-start"
            data-strict-start=""
            onClick={start}
          >
            <Maximize2 size={16} aria-hidden="true" />
            {copy.start}
          </button>
        </section>
      )}

      {phase === 'running' && (
        <>
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-card pb-2">
            <strong>{copy.title}</strong>
            <div className="flex gap-2">
              <button type="button" className="button primary" onClick={() => end(null)}>
                {copy.finish}
              </button>
              <button
                type="button"
                className="button subtle"
                onClick={() => {
                  if (window.confirm(copy.confirmExit)) end('exit');
                }}
              >
                {copy.exit}
              </button>
            </div>
          </div>
          <div className="select-none">{children}</div>
        </>
      )}

      {phase === 'finished' && (
        <section
          role="alert"
          className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-5"
        >
          <strong className={failed ? 'warning-text' : 'success-text'}>
            {failed ? copy.failed[failed] : copy.done}
          </strong>
          {missed > 0 && <p className="m-0">{copy.toRevision}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="button primary" onClick={start}>
              {copy.retry}
            </button>
            {missed > 0 && (
              <Link className="button subtle" href={courseSectionHref(courseId, 'revision', day)}>
                {copy.revision}
              </Link>
            )}
            <Link className="button subtle" href={courseSectionHref(courseId, 'home', day)}>
              {copy.back}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
