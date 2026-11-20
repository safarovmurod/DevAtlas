'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Code2, Layers } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { LEARNING_TOPICS } from '@/content/course';
import { useAccount } from '@/components/account/account-provider';
import { PracticeLock } from '@/components/courses/practice-lock';
import { usePracticeAccess } from '@/components/courses/use-practice-access';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';

const labels = {
  ru: {
    back: 'Все курсы',
    duration: 'Два месяца',
    title: 'React · отдельный курс',
    intro:
      'Два месяца React. Сначала выберите месяц, затем день в учебном плане. Только после этого откроется «Мой день».',
    choose: 'Выберите месяц',
    plan: 'Перейти к учебному плану',
    month: 'Месяц',
    first: 'Основы React',
    firstDetail: 'Компоненты, JSX, props, hooks, маршрутизация',
    second: 'Состояние и приложения',
    secondDetail: 'Context, Redux, Zustand, Jotai, формы и запросы',
    own: 'Практика из вашего HTML',
    ownDetail:
      'Ваша исходная страница Practice-Local-Global: Redux, Zustand и Jotai. Для каждой библиотеки есть Local/Global, операции и код файлов.',
    all: 'Открыть практику целиком',
    libraryError: 'Не удалось открыть практику.',
    retry: 'Попробовать снова',
    learn: 'Практика уроков',
    note: 'Next.js — отдельный курс. Его темы больше не входят в план React.',
  },
  en: {
    back: 'All courses',
    duration: 'Two months',
    title: 'React · independent course',
    intro:
      'Two months of React. Pick a month, then choose a day in the study plan. My Day opens only for the selected day.',
    choose: 'Choose a month',
    plan: 'Open study plan',
    month: 'Month',
    first: 'React fundamentals',
    firstDetail: 'Components, JSX, props, hooks, routing',
    second: 'State and applications',
    secondDetail: 'Context, Redux, Zustand, Jotai, forms and requests',
    own: 'Practice from your HTML',
    ownDetail:
      'Your original Practice-Local-Global page: Redux, Zustand, Jotai, Local/Global workflows and source code.',
    all: 'Open full practice',
    libraryError: 'Could not open the practice library.',
    retry: 'Try again',
    learn: 'Lesson exercises',
    note: 'Next.js has its own separate course, not React month 3.',
  },
  tg: {
    back: 'Ҳамаи курсҳо',
    duration: 'Ду моҳ',
    title: 'React · курси алоҳида',
    intro:
      'Ду моҳи React. Аввал моҳро интихоб кунед, баъд аз нақшаи таълим рӯзро гиред. Танҳо рӯзи интихобшуда дар «Рӯзи ман» кушода мешавад.',
    choose: 'Моҳро интихоб кунед',
    plan: 'Кушодани нақшаи таълим',
    month: 'Моҳ',
    first: 'Асосҳои React',
    firstDetail: 'Компонентҳо, JSX, props, hooks ва routing',
    second: 'State ва барномаҳо',
    secondDetail: 'Context, Redux, Zustand, Jotai, форма ва дархостҳо',
    own: 'Амалия аз HTML-и шумо',
    ownDetail:
      'Файли аслии Practice-Local-Global: Redux, Zustand, Jotai, Local/Global ва кодҳои худатон.',
    all: 'Кушодани тамоми амалия',
    libraryError: 'Практикаро кушода натавонистем.',
    retry: 'Аз нав санҷидан',
    learn: 'Машқҳои дарсҳо',
    note: 'Next.js курси алоҳида аст ва дар моҳи 3-и React нест.',
  },
  es: {
    back: 'Todos los cursos',
    duration: 'Dos meses',
    title: 'React · curso independiente',
    intro:
      'Dos meses de React. Elige un mes y luego un día en el plan de estudio. «Mi día» solo abre el día elegido.',
    choose: 'Elige un mes',
    plan: 'Abrir el plan de estudio',
    month: 'Mes',
    first: 'Fundamentos de React',
    firstDetail: 'Componentes, JSX, props, hooks, enrutamiento',
    second: 'Estado y aplicaciones',
    secondDetail: 'Context, Redux, Zustand, Jotai, formularios y solicitudes',
    own: 'Práctica de tu HTML',
    ownDetail:
      'Tu página original Practice-Local-Global: Redux, Zustand, Jotai, flujos locales y globales y código fuente.',
    all: 'Abrir toda la práctica',
    libraryError: 'No se pudo abrir la biblioteca de práctica.',
    retry: 'Volver a intentar',
    learn: 'Ejercicios de las lecciones',
    note: 'Next.js es un curso aparte, no el tercer mes de React.',
  },
} as const;

const practiceStorageKey = 'react-mentor-state-practice-v1';
function restorePracticeFrame(frame: HTMLIFrameElement | null) {
  let saved: unknown = null;
  try {
    const value = localStorage.getItem(practiceStorageKey);
    if (value) saved = JSON.parse(value);
  } catch {
    /* Browsers can disable local storage. */
  }
  frame?.contentWindow?.postMessage({ type: 'reactmentor-practice-restore', state: saved }, '*');
}

export function ReactPracticeLibrary({ full = false }: { full?: boolean }) {
  const { user } = useAccount();
  const access = usePracticeAccess();
  if (access !== 'open') return <PracticeLock access={access} />;
  return <ReactPracticeFrame key={user?.id ?? 'local'} owner={user?.id} full={full} />;
}

function ReactPracticeFrame({ owner, full }: { owner?: string; full: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const language = useLearningStore((state) => state.language);
  const month = useLearningStore((state) => state.activeMonth) === 2 ? 2 : 1;
  const course = useLearningStore((state) => state.selectedCourse);
  const chooseCourse = useLearningStore((state) => state.chooseCourse);
  const [practiceHtml, setPracticeHtml] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (course !== 'react') chooseCourse('react');
  }, [course, chooseCourse]);
  useEffect(() => {
    const controller = new AbortController();
    async function loadPractice() {
      const client = getSupabaseBrowserClient();
      const session = client ? (await getSessionWithTimeout(client)).data.session : null;
      if (owner && session?.user.id !== owner) return 'denied';
      const response = await fetch('/api/practice/react-library', {
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        cache: 'no-store',
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]),
      });
      if (response.status === 401 || response.status === 403) return 'denied';
      if (!response.ok) return 'unavailable';
      const { html } = await response.json();
      return typeof html === 'string' && html.startsWith('<!doctype html>') ? html : 'unavailable';
    }
    loadPractice()
      .then((html) => {
        if (!controller.signal.aborted) setPracticeHtml(html);
      })
      .catch(() => {
        if (!controller.signal.aborted) setPracticeHtml('unavailable');
      });
    return () => controller.abort();
  }, [owner, attempt]);
  useEffect(() => {
    function onPracticeMessage(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'reactmentor-practice-ready') {
        restorePracticeFrame(frame.current);
        return;
      }
      if (event.data?.type !== 'reactmentor-practice-save') return;
      const saved = event.data.state;
      if (
        !saved ||
        !['local', 'global'].includes(saved.mode) ||
        !['redux', 'zustand', 'jotai'].includes(saved.manager) ||
        ![
          'setup',
          'post',
          'put',
          'delete',
          'info',
          'search',
          'pagination',
          'checkbox',
          'add-img',
          'delete-img',
        ].includes(saved.op)
      )
        return;
      try {
        const json = JSON.stringify(saved);
        if (json.length < 4000) localStorage.setItem(practiceStorageKey, json);
      } catch {
        /* Saving preferences must not prevent practice. */
      }
    }
    window.addEventListener('message', onPracticeMessage);
    return () => window.removeEventListener('message', onPracticeMessage);
  }, []);
  const ui = labels[language];
  if (!practiceHtml) return <PracticeLock access="loading" />;
  if (practiceHtml === 'denied') return <PracticeLock access="locked" />;
  if (practiceHtml === 'unavailable')
    return (
      <div className="panel">
        <p role="alert">{ui.libraryError}</p>
        <button
          type="button"
          className="button subtle"
          onClick={() => {
            setPracticeHtml(null);
            setAttempt((value) => value + 1);
          }}
        >
          {ui.retry}
        </button>
      </div>
    );
  return (
    <section className="react-library">
      <div className="section-heading">
        <div>
          <h2>{ui.own}</h2>
          <p>{ui.ownDetail}</p>
        </div>
      </div>
      <div className="button-row">
        <Link className="button subtle" href={`/practice?month=${month}`}>
          <Code2 size={17} />
          {ui.learn}
        </Link>
        {!full && (
          <Link
            className="button subtle"
            href="/courses/react/practice-library?view=full"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowRight size={17} />
            {ui.all}
          </Link>
        )}
      </div>
      <iframe
        className="state-practice-frame"
        style={full ? { minHeight: '100dvh' } : undefined}
        ref={frame}
        onLoad={() => restorePracticeFrame(frame.current)}
        title="Practice Local / Global · Redux, Zustand, Jotai"
        srcDoc={practiceHtml}
        loading="eager"
        sandbox="allow-scripts"
        allow="clipboard-write"
      />
    </section>
  );
}

export function ReactCourseEntry() {
  const language = useLearningStore((state) => state.language),
    ui = labels[language];
  const completed = useLearningStore((state) => state.completedTopics);
  const setPreferences = useLearningStore((state) => state.setPreferences);
  const months = [
    { number: 1, title: ui.first, detail: ui.firstDetail },
    { number: 2, title: ui.second, detail: ui.secondDetail },
  ];
  return (
    <section className="react-entry">
      <Link className="back-link" href="/courses">
        <ArrowLeft size={16} />
        {ui.back}
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">React · {ui.duration}</span>
          <h1>{ui.title}</h1>
          <p>{ui.intro}</p>
        </div>
      </div>
      <h2 className="react-entry-title">
        <BookOpen size={21} />
        {ui.choose}
      </h2>
      <div className="react-month-grid">
        {months.map((item) => {
          const topics = LEARNING_TOPICS.filter((topic) => topic.month === item.number);
          const done = topics.filter((topic) => completed.includes(topic.id)).length;
          return (
            <Link
              href={`/plan/${item.number}`}
              key={item.number}
              className="panel react-month-option"
              onClick={() => setPreferences({ activeMonth: item.number })}
            >
              <span className="eyebrow">
                {ui.month} {item.number}
              </span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <div className="react-month-stat">
                {done} / {topics.length}
              </div>
              <div className="progress-track">
                <span style={{ width: `${topics.length ? (done / topics.length) * 100 : 0}%` }} />
              </div>
              <strong>
                {ui.plan}
                <ArrowRight size={17} />
              </strong>
            </Link>
          );
        })}
      </div>
      <p className="react-next-note">
        <Layers size={17} />
        {ui.note}
      </p>
      <Link className="button primary" href="/practice?course=react">
        <Code2 size={17} />
        {ui.learn}
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
