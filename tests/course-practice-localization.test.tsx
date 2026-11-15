import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CoursePractice } from '@/components/courses/course-practice';
import { emptyProgress } from '@/lib/account/progress';
import type { CourseLesson } from '@/lib/courses/schema';
import { useLearningStore } from '@/stores/learning-store';

const auth = vi.hoisted(() => ({ getSession: vi.fn() }));
// This suite covers the existing practice diagnostics; the independently
// mounted assessment has its own account-aware component and browser tests.
vi.mock('@/components/courses/lesson-assessment',()=>({LessonAssessment:()=>null}));
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => ({ auth }) }));
vi.mock('@/components/learning/code-editor', () => ({
  CodeEditor: ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => <textarea aria-label={label} value={value} onChange={event => onChange(event.target.value)} />,
}));

const labels = [
  { locale:'ru', instructions:'Условие задания', verify:'Проверить решение', rubric:'У html указан язык lang', failed:'Исправьте отмеченные требования и проверьте ещё раз.', passed:'Все проверки пройдены. Практика сохранена.', verified:'Решение подтверждено сервером. XP начислен в защищённом журнале.', unavailable:'Серверная проверка недоступна. Учебный результат сохранён только локально; попробуйте позже.' },
  { locale:'tg', instructions:'Шарти супориш', verify:'Санҷидани ҳалли масъала', rubric:'Забони lang дар html навишта шудааст', failed:'Талаботи ишорашударо ислоҳ карда, боз санҷед.', passed:'Ҳамаи санҷишҳо гузаштанд. Практика сабт шуд.', verified:'Ҳалли масъала аз тарафи сервер тасдиқ шуд. XP дар сабти муҳофизатшуда нигоҳ дошта шуд.', unavailable:'Санҷиши серверӣ дастрас нест. Натиҷаи омӯзишӣ танҳо маҳаллӣ сабт шуд; баъдтар санҷед.' },
  { locale:'en', instructions:'Task instructions', verify:'Check solution', rubric:'Set the html lang attribute', failed:'Fix the highlighted requirements and try again.', passed:'All checks passed. Practice saved.', verified:'Server verified. XP recorded in the protected ledger.', unavailable:'Server assessment unavailable. Your learning result is local only; retry later.' },
  { locale:'es', instructions:'Enunciado de la tarea', verify:'Comprobar la solución', rubric:'Indica el idioma con el atributo lang en html', failed:'Corrige los requisitos marcados y vuelve a comprobar.', passed:'Se superaron todas las comprobaciones. Práctica guardada.', verified:'El servidor verificó la solución. El XP se registró en el libro protegido.', unavailable:'La comprobación del servidor no está disponible. El resultado de estudio solo se guardó en local; inténtalo más tarde.' },
] as const;
const text = (ru: string) => ({ ru, tg:'Тоҷикӣ', en:'English' });
const lesson: CourseLesson = {
  id:'html-day-01', day:1, title:text('Первый урок'), summary:text('Описание'), level:'beginner', sourceIds:['html-standard'], sections:[{ title:text('Разбор'), body:text('Объяснение') }], questions:[],
  practice:{ task:text('Авторское задание'), hint:text('Подсказка'), solution:'<h1>Пример</h1>', criteria:[text('Критерий')] },
};
const validCode = '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Мой проект</title></head><body><main><h1>Привет</h1><p>Мой текст</p><a href="https://developer.mozilla.org/">Документация</a></main></body></html>';

beforeEach(() => {
  localStorage.clear();
  useLearningStore.setState({ ...emptyProgress(), ready:true, contentLanguage:'ru' });
  auth.getSession.mockResolvedValue({ data:{ session:{ access_token:'test-session-token' } }, error:null });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

it('shows a localized reference together with a code solution', () => {
  useLearningStore.setState({ language: 'en', contentLanguage: 'en' });
  const example: CourseLesson = {
    ...lesson,
    id: 'nextjs-day-04',
    practice: {
      ...lesson.practice!,
      referenceAnswer: { ru: 'Проверьте статус ответа.', tg: 'Статуси ҷавобро санҷед.', en: 'Check the response status.' },
      solution: 'console.log("Response checked");',
    },
  };
  const { container } = render(<CoursePractice courseId="nextjs" lesson={example} />);
  const reference = container.querySelector('details.solution') as HTMLDetailsElement;
  reference.open = true;
  expect(screen.getByText('Check the response status.')).toBeVisible();
  expect(reference.querySelector('code')).toHaveTextContent('console.log("Response checked");');
});

it.each(labels)('$locale uses interface language for rubric and controls without translating authored content', async copy => {
  useLearningStore.setState({ language:copy.locale });
  useLearningStore.getState().saveCourseDraft('html',lesson.id,'<h1>Incomplete</h1>');
  render(<CoursePractice courseId="html" lesson={lesson} />);
  expect(screen.getByText(copy.instructions)).toBeVisible();
  expect(screen.getByText(copy.rubric)).toBeVisible();
  expect(screen.getByText('Авторское задание')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{ name:copy.verify }));
  expect(await screen.findByRole('status')).toHaveTextContent(copy.failed);
  expect(auth.getSession).not.toHaveBeenCalled();
  expect(useLearningStore.getState().contentLanguage).toBe('ru');
});

it.each(labels)('$locale localizes successful server assessment status', async copy => {
  useLearningStore.setState({ language:copy.locale });
  useLearningStore.getState().saveCourseDraft('html',lesson.id,validCode);
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ ok:true,json:async () => ({ verified:true,passed:true }) }));
  render(<CoursePractice courseId="html" lesson={lesson} />);
  fireEvent.click(screen.getByRole('button',{ name:copy.verify }));
  expect(await screen.findByText(copy.verified)).toBeVisible();
  expect(screen.getByText(copy.passed)).toBeVisible();
});

it.each(labels)('$locale localizes unavailable server status without losing the local result', async copy => {
  useLearningStore.setState({ language:copy.locale });
  useLearningStore.getState().saveCourseDraft('html',lesson.id,validCode);
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('offline')));
  render(<CoursePractice courseId="html" lesson={lesson} />);
  fireEvent.click(screen.getByRole('button',{ name:copy.verify }));
  expect(await screen.findByText(copy.unavailable)).toBeVisible();
  expect(screen.getByText(copy.passed)).toBeVisible();
});

it('updates existing diagnostics on interface-language change and preserves the draft', async () => {
  useLearningStore.setState({ language:'en' });
  useLearningStore.getState().saveCourseDraft('html',lesson.id,'<h1>My draft</h1>');
  render(<CoursePractice courseId="html" lesson={lesson} />);
  fireEvent.click(screen.getByRole('button',{ name:'Check solution' }));
  expect(await screen.findByRole('status')).toHaveTextContent(labels[2].failed);
  act(() => useLearningStore.getState().setPreferences({ language:'es' }));
  expect(screen.getByRole('button',{ name:'Comprobar la solución' })).toBeVisible();
  expect(screen.getByText(labels[3].rubric)).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(labels[3].failed);
  expect(useLearningStore.getState().courses.html?.drafts[lesson.id]).toBe('<h1>My draft</h1>');
  expect(useLearningStore.getState().contentLanguage).toBe('ru');
});
