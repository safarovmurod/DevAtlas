import { CURRICULUM, getTopic, questionsForTopic, type LearningTopic } from '@/content/course';
import type { CourseContent } from '@/lib/courses/schema';
import { NEXTJS_FOUNDATIONS } from './nextjs-foundations';
import { NEXTJS_FOUNDATION_REVIEW } from './nextjs-foundation-review';


type Lesson = CourseContent['lessons'][number];
type LessonText = Lesson['title'];

const text = (ru: string, tg: string, en: string): LessonText => ({ ru, tg, en });

function quiz(
  id: string,
  correctIndex: number,
  relatedSection: number,
  question: LessonText,
  options: LessonText[],
  hint: LessonText,
): Lesson['questions'][number] {
  return { id, question, answer: options[correctIndex], options, correctIndex, hint, relatedSection };
}

const stockExample = `'use client';

import { useState } from 'react';

export default function StockCard() {
  const [count, setCount] = useState(1);

  return (
    <section>
      <output>{count}</output>
      <p>{count > 0 ? 'In stock' : 'Out of stock'}</p>
      <button onClick={() => setCount((previous) => previous + 1)}>Receive one</button>
    </section>
  );
}`;

const queueSolution = `'use client';

import { useState } from 'react';

export default function Queue() {
  const [tickets, setTickets] = useState(2);

  return (
    <section>
      <output>{tickets}</output>
      <p>{tickets > 0 ? 'Queue active' : 'Queue empty'}</p>
      <button disabled={tickets === 0} onClick={() => setTickets((count) => Math.max(0, count - 1))}>
        Serve next
      </button>
    </section>
  );
}`;

const debounceHook = `'use client';

import { useEffect, useState } from 'react';

function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`;

const searchExample = `${debounceHook}

const books = ['Book of Maps', 'Notebook', 'Gardening'];

export default function BookSearch() {
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query, 300);
  const matches = books.filter((book) => book.toLowerCase().startsWith(search.toLowerCase()));

  return (
    <section>
      <label>
        Search books
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <ul>{matches.map((book) => <li key={book}>{book}</li>)}</ul>
    </section>
  );
}`;

const noteSolution = `${debounceHook}

export default function CourierNote() {
  const [note, setNote] = useState('');
  const preview = useDebouncedValue(note, 400);

  return (
    <section>
      <label>
        Courier note
        <input value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      <p aria-live="polite">{preview}</p>
    </section>
  );
}`;

const booksExample = `'use client';

import { useState } from 'react';

const books = [
  { id: 1, title: 'React' },
  { id: 2, title: 'Next.js' },
  { id: 3, title: 'React Router' },
];

export default function ReadingList() {
  const [query, setQuery] = useState('re');
  const visibleBooks = books.filter((book) =>
    book.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section>
      <label>
        Search titles
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {visibleBooks.length === 0 ? (
        <p>No matching books.</p>
      ) : (
        <ul>{visibleBooks.map((book) => <li key={book.id}>{book.title}</li>)}</ul>
      )}
    </section>
  );
}`;

const mockInterviewAnswer = text(
  'Запрос хранится в URL, чтобы получатель ссылки сразу увидел нужный фильтр. Сервер остаётся источником записей услуг, а открытие отдельной карточки хранится в ней. На ревью я спрошу: «Результат фильтра полностью вычисляется из услуг и запроса или у него есть свои данные?» Проверю ссылку с запросом «масло» в новой вкладке после обновления. Запрос без совпадений должен показать пустое состояние, новая подходящая услуга — появиться после обновления записей.',
  'Query дар URL мемонад, то касе, ки линкро мегирад, ҳамон филтрро бинад. Сабти хизматҳо аз сервер меояд. Ҳолати кушодани ҳар карточка дар худаш мемонад. Дар review мепурсам: «Натиҷаи филтр пурра аз хизматҳо ва query ҳисоб мешавад ё додаи алоҳида дорад?» Линк бо query-и «равған»-ро дар вкладкаи нав ва пас аз refresh месанҷам. Агар мувофиқат набошад, ҳолати холӣ барояд. Агар хизмати нави мувофиқ ояд, баъди нав шудани дода он дар рӯйхат пайдо шавад.',
  'The query lives in the URL so someone opening the link sees the same filter. The server owns the service records. Each card keeps its own open state. In review I would ask, “Is the filtered result fully computed from services and the query, or does it have independent data?” I would open a link for “oil” in a new tab and reload it, check that no matches produce the empty state, and verify that a new matching service appears after the records update.',
);

const readingContract = `type ReadingLogContract = {
  input: { title: string };
  success: { status: 201; entry: { id: number; title: string } };
  rejected: { status: 400; error: string };
};

export const readingLogExample: ReadingLogContract = {
  input: { title: 'The Little Prince' },
  success: { status: 201, entry: { id: 1, title: 'The Little Prince' } },
  rejected: { status: 400, error: 'Title is required' },
};`;

const repairPlanAnswer = text(
  'Сценарий: сотрудник добавляет заголовок «Check tyre». Форма получает title, обработчик проверяет строку и записывает её. Ответ успеха содержит id и сохранённый title. Если после trim() строка пустая, ответ сообщает об ошибке, записи нет. Страница показывает список, форма управляет вводом, запись остаётся в хранилище. После записи проверяю поток через новый GET. Для пробелов проверяю сообщение и прежнее количество записей.',
  'Сенария: корманд номи «Check tyre»-ро илова мекунад. Форма title мегирад, handler сатрашро санҷида, сабт мекунад. Ҷавоби муваффақ id ва title-и сабтшударо медиҳад. Агар пас аз trim() ном холӣ бошад, хато меояд ва сабт намешавад. Саҳифа рӯйхат, форма input ва пойгоҳ сабтро идора мекунад. Баъди сабт бо GET-и нав месанҷам. Барои space хабар ва шумораи пешинаи сабтҳоро месанҷам.',
  'A staff member adds “Check tyre”. The form takes title, and the handler validates and saves it. Success returns the saved title and id. If trimming leaves an empty string, the response reports an error and creates no row. The page displays the list, the form owns input and storage owns the records. I verify success with a fresh GET, then try spaces and check the error and unchanged row count.',
);
const repairRouteExample = `// app/api/repairs/route.ts — local practice only
import { DatabaseSync } from 'node:sqlite';

export const runtime = 'nodejs';

function openRepairs() {
  const db = new DatabaseSync('repairs.sqlite');
  db.exec('CREATE TABLE IF NOT EXISTS repairs (id INTEGER PRIMARY KEY, title TEXT NOT NULL)');
  return db;
}

export function GET() {
  const db = openRepairs();
  try {
    const repairs = db.prepare('SELECT id, title FROM repairs ORDER BY id').all();
    return Response.json(repairs);
  } finally {
    db.close();
  }
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('title' in body) || typeof body.title !== 'string') {
    return Response.json({ error: 'Title is required' }, { status: 400 });
  }

  const title = body.title.trim();
  if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });

  const db = openRepairs();
  try {
    const result = db.prepare('INSERT INTO repairs (title) VALUES (?)').run(title);
    return Response.json({ id: Number(result.lastInsertRowid), title }, { status: 201 });
  } finally {
    db.close();
  }
}`;

const repairFormSolution = `'use client';

import { useEffect, useState, type FormEvent } from 'react';

type Repair = { id: number; title: string };

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepairs() {
      try {
        const response = await fetch('/api/repairs', { signal: controller.signal });
        if (!response.ok) throw new Error('Load failed');
        const saved: Repair[] = await response.json();
        if (!controller.signal.aborted) setRepairs(saved);
      } catch {
        if (!controller.signal.aborted) setError('Could not load repairs. Reload to try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadRepairs();
    return () => controller.abort();
  }, []);

  async function saveRepair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || saving) return;

    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        setError(response.status === 400 ? 'Enter a title.' : 'Could not save. Try again.');
        return;
      }
      const saved: Repair = await response.json();
      setRepairs((records) => [...records, saved]);
      setTitle('');
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>Repair log</h1>
      <form onSubmit={saveRepair}>
        <label>
          Title
          <input value={title} disabled={saving} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <button disabled={loading || saving} type="submit">{saving ? 'Saving…' : 'Save'}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Loading…</p>}
      {!loading && !error && repairs.length === 0 && <p>No repairs yet.</p>}
      <ul>{repairs.map((repair) => <li key={repair.id}>{repair.title}</li>)}</ul>
    </main>
  );
}`;
const positiveIdCheck = `function isPositiveId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}`;

const ownedRenameExample = `// Call on the server after verifying the session with your auth provider.
type VerifiedSession = { userId: string };
type RenameOwned = (id: number, ownerId: string, title: string) => Promise<boolean>;

${positiveIdCheck}

export async function renameRepair(
  session: VerifiedSession | null,
  body: unknown,
  renameOwned: RenameOwned,
): Promise<Response> {
  if (!session) return Response.json({ error: 'Sign in' }, { status: 401 });

  if (
    typeof body !== 'object' || body === null ||
    !('id' in body) || !isPositiveId(body.id) ||
    !('title' in body) || typeof body.title !== 'string' || !body.title.trim()
  ) {
    return Response.json({ error: 'Valid id and title required' }, { status: 400 });
  }

  // renameOwned must update with both id and ownerId in the storage condition.
  const changed = await renameOwned(body.id, session.userId, body.title.trim());
  if (!changed) return Response.json({ error: 'Repair not found' }, { status: 404 });
  return Response.json({ id: body.id, title: body.title.trim() });
}`;

const completeRepairSolution = `type VerifiedSession = { userId: string };
type MarkOwnedDone = (id: number, ownerId: string) => Promise<boolean>;

${positiveIdCheck}

export async function completeRepair(
  session: VerifiedSession | null,
  body: unknown,
  markOwnedDone: MarkOwnedDone,
): Promise<Response> {
  if (!session) return Response.json({ error: 'Sign in' }, { status: 401 });

  if (typeof body !== 'object' || body === null || !('id' in body) || !isPositiveId(body.id)) {
    return Response.json({ error: 'Valid id required' }, { status: 400 });
  }
  // markOwnedDone changes a row only when both id and ownerId match.
  const changed = await markOwnedDone(body.id, session.userId);
  if (!changed) return Response.json({ error: 'Repair not found' }, { status: 404 });
  return Response.json({ id: body.id, done: true });
}`;

const renameButton = `'use client';

type Repair = { id: number; title: string };
type RenameButtonProps = { repair: Repair; onRename: (id: number) => void };

export default function RenameButton({ repair, onRename }: RenameButtonProps) {
  return (
    <button type="button" onClick={() => onRename(repair.id)}>
      Rename {repair.title}
    </button>
  );
}`;

const repairStateExample = `type Repair = { id: number; title: string };
type ReadState =
  | { kind: 'loading' }
  | { kind: 'ready'; repairs: Repair[] }
  | { kind: 'error' };

export default function RepairSummary({ state }: { state: ReadState }) {
  if (state.kind === 'loading') return <p role="status">Reading repairs…</p>;
  if (state.kind === 'error') return <p role="alert">Could not read repairs.</p>;
  if (state.repairs.length === 0) return <p>No repairs yet.</p>;

  return <p>{state.repairs.length} saved repairs</p>;
}`;

const repairRetrySolution = `'use client';

import { useEffect, useState } from 'react';

type Repair = { id: number; title: string };
type ReadState =
  | { kind: 'loading' }
  | { kind: 'ready'; repairs: Repair[] }
  | { kind: 'error' };
async function readRepairs(signal: AbortSignal): Promise<Repair[]> {
  const response = await fetch('/api/repairs', { signal });
  if (!response.ok) throw new Error('Read failed');
  return response.json();
}

export default function RepairsPage() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ReadState>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    async function read() {
      try {
        const repairs = await readRepairs(controller.signal);
        if (!controller.signal.aborted) setState({ kind: 'ready', repairs });
      } catch {
        if (!controller.signal.aborted) setState({ kind: 'error' });
      }
    }

    void read();
    return () => controller.abort();
  }, [attempt]);
  function retry() {
    setState({ kind: 'loading' });
    setAttempt((value) => value + 1);
  }

  return (
    <main>
      <h1>Saved repairs</h1>
      {state.kind === 'loading' && <p role="status">Reading repairs…</p>}
      {state.kind === 'error' && (
        <div>
          <p role="alert">Could not read repairs.</p>
          <button type="button" onClick={retry}>Retry read</button>
        </div>
      )}
      {state.kind === 'ready' && (
        state.repairs.length === 0
          ? <p>No repairs yet.</p>
          : <ul>{state.repairs.map((repair) => <li key={repair.id}>{repair.title}</li>)}</ul>
      )}
    </main>
  );
}`;
const localReleaseCheck = `const origin = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';
const page = await fetch(new URL('/', origin));
if (!page.ok) throw new Error('Home failed: ' + page.status);
if (!(await page.text()).includes('Repair log')) {
  throw new Error('Repair log heading is missing');
}

const response = await fetch(new URL('/api/repairs', origin));
if (!response.ok) throw new Error('Read failed: ' + response.status);

const rows = await response.json();
if (!Array.isArray(rows) || !rows.every(
  (row) => Number.isSafeInteger(row?.id) && typeof row?.title === 'string',
)) {
  throw new Error('Unexpected repair list');
}

console.log('Home and repair list passed. Rows: ' + rows.length);`;

const releaseNotesAnswer = text(
  'Шаблон, заполните своими фактами. Журнал помогает мастерской сохранять названия заявок и просматривать список. Я сделал форму, обработчик чтения и отображение ошибок. Среда: локальная production-сборка. Впишите дату и статусы npm run build, npm run start и scripts/check-release.mjs. Запишите название тестовой заявки, вернулась ли она после обновления и что произошло с пустым полем. Для Preview остаётся проверить постоянное хранилище, настройки среды и доступ на чтение и изменение.',
  'Намуна, бо натиҷаи худ пур кунед. Журнал ба устохона ёрӣ медиҳад, ки номи дархостро сабт кунад ва рӯйхатро бинад. Ман форма, handler-и хондан ва намоиши хаторо сохтам. Муҳит: production build-и маҳаллӣ. Рӯз ва натиҷаи npm run build, npm run start ва scripts/check-release.mjs-ро нависед. Номи сабти санҷишӣ, монданаш пас аз refresh ва натиҷаи input-и холиро нависед. Барои Preview нигоҳдории доимӣ, environment ва иҷозати хондану тағйирро санҷидан даркор.',
  'Template: fill it in with your own evidence. The log helps a workshop save repair titles and review the list. I made the form, the read handler and the error states. Environment: local production build. Record the date and outcomes of npm run build, npm run start and scripts/check-release.mjs. Write down the sample title, whether it returned after reload and what happened with a blank title. Preview still needs persistent storage, environment configuration and verified read and write access.',
);

type LessonDetails = Pick<Lesson, 'title' | 'summary' | 'sections' | 'questions' | 'practice'>;

const authoredLessons: Partial<Record<number, LessonDetails>> = {

  13: {
    title: text('Теория React для интервью', 'Назарияи React барои мусоҳиба', 'React interview fundamentals'),
    summary: text(
      'Разберите render, commit, идентичность компонентов и правила хуков. Подготовьте объяснение на примере небольшого интерфейса.',
      'Render, commit, ҳувияти компонент ва қоидаҳои hook-ро аз рӯйи як UI-и хурд фаҳмед. Баъд онҳоро бо сухани худ шарҳ диҳед.',
      'Trace render, commit, component identity and the Rules of Hooks. Prepare an explanation using a small interface.',
    ),
    sections: [
      {
        title: text('React и изменяемый интерфейс', 'React ва интерфейси тағйирёбанда', 'React and changing interfaces'),
        body: text(
          'На складе один приход товара меняет остаток и надпись «В наличии». Если проверять каждую надпись отдельно, легко забыть одну. React позволяет описать экран через компоненты: из данных и состояния каждый компонент возвращает представление своей части интерфейса. При смене данных React заново вычисляет нужный результат.',
          'Дар анбор омадани мол ҳам шумораи бақияро дигар мекунад, ҳам навиштаи «Дар фурӯш»-ро. Агар ҳар навиштаро дастӣ иваз кунем, якеаш аз ёд меравад. Дар React интерфейсро ба компонентҳо ҷудо мекунем. Ҳар компонент аз props ва state муайян мекунад, ки қисми экрани ӯ чӣ нишон диҳад.',
          'A delivery changes both the stock count and the “In stock” label. Updating each label by hand makes it easy to miss one. React lets you describe the screen as components. Each component uses its data and state to describe its part of the interface. When those inputs change, React can calculate the new view.',
        ),
      },
      {
        title: text('От клика до изменения DOM', 'Аз клик то тағйири DOM', 'From a click to a DOM update'),
        body: text(
          'Нажатие кнопки запрашивает обновление state. На этапе render React вызывает компонент и получает новое описание интерфейса. На этапе commit React применяет необходимые изменения к DOM. При переходе с 1 на 2 меняется число, а надпись «В наличии» остаётся той же. Повторный вызов компонента сам по себе не означает обновление всех элементов.',
          'Пахши тугма нав кардани state-ро ба навбат мегузорад. Дар render React компонентро ҷеғ зада, натиҷаи нави UI-ро ҳисоб мекунад. Дар commit тағйири лозимиро ба DOM мегузорад. Аз 1 ба 2 фақат шумора дигар мешавад. «Дар фурӯш» ҳамон мемонад, гарчанде ки функсияи компонент боз иҷро шуд.',
          'A click queues a state update. In render, React calls the component to calculate the new interface description. In commit, it makes the necessary DOM changes. From 1 to 2, the count changes while the “In stock” label stays the same. A component call does not imply that all its DOM nodes will change.',
        ),
        code: stockExample,
        language: 'tsx',
        output: text('1 → 2, «В наличии» без изменений.', '1 → 2, «Дар фурӯш» бетағйир.', '1 → 2, “In stock” stays the same.'),
      },
      {
        title: text('Как список сохраняет связь со state', 'Рӯйхат state-ро чӣ хел нигоҳ медорад', 'How list items keep their state'),
        body: text(
          'Reconciliation — сопоставление прежнего и нового дерева интерфейса. Если у каждой карточки склада есть постоянный ID, используйте его как key среди соседей. Когда карточка переедет с первого места на третье, информация в её поле останется у того же товара. Ключ из номера позиции после сортировки может привязать черновик к другому товару.',
          'Reconciliation яъне React дарахти пешина ва навро муқоиса мекунад. Агар ҳар карточкаи анбор ID-и доимӣ дошта бошад, дар рӯйхат онро ҳамчун key диҳед. Баъди ҷобаҷокунии карточка матни input бо ҳамон мол мемонад. Агар index-ро key монем, пас аз сортировка матн метавонад бо моли дигар нишон дода шавад.',
          'Reconciliation matches the previous UI tree to the next one. Give each stock card a stable item ID as its key among siblings. When its position changes, its draft still belongs to the same product. With an index key, sorting can associate that draft with a different product.',
        ),
      },
      {
        title: text('Порядок вызова хуков', 'Тартиби даъвати hook', 'Hook call order'),
        body: text(
          'Вызывайте useState и useEffect на верхнем уровне компонента или собственного хука, до возможного раннего return. Если useState находится внутри if, при смене условия порядок вызовов меняется. Состояние для счётчика объявляется всегда, а надписи удобно переключать условием в JSX. В Next.js интерактивный счётчик размещают за границей «use client».',
          'useState ва useEffect-ро дар қисми асосии компонент ё custom hook, пеш аз return-и шартӣ, даъват кунед. Агар useState даруни if бошад, баробари иваз шудани шарт тартиби hook-ҳо дигар мешавад. State-и ҳисобкунакро ҳамеша эълон кунед ва намоиши навиштаро бо шарт дар JSX иваз кунед. Дар App Router ҳисобкунаки интерактивӣ дар Client Component меистад.',
          'Call useState and useEffect at the top level of a component or custom Hook, before an early return. Putting useState inside an if can change call order between renders. Declare the counter state every time, and put the display condition in JSX. In the Next.js App Router, place the interactive counter behind a client boundary.',
        ),
      },
    ],
    questions: [
      quiz('nextjs-day-13-quiz-q305', 0, 0,
        text('Какую роль React играет в карточке остатка?', 'React дар карточкаи бақия чӣ кор мекунад?', 'What job does React do in the stock card?'),
        [
          text('Строит UI из компонентов и данных.', 'UI-ро аз компонентҳо ва додаҳо месозад.', 'Builds the UI from components and data.'),
          text('Сам хранит и выдаёт складские записи.', 'Худаш сабтҳои анборро нигоҳ медорад ва медиҳад.', 'Stores and serves the warehouse records itself.'),
          text('Перезагружает документ после каждого клика.', 'Пас аз ҳар клик тамоми саҳифаро аз нав мекушояд.', 'Reloads the document after every click.'),
        ],
        text('Посмотрите, с чем работает сама карточка: с отображением данных или с их постоянным хранилищем.', 'Бинед, ки карточка додаҳоро нишон медиҳад ё онҳоро доимӣ нигоҳ медорад.', 'Look at whether the card displays data or stores it permanently.'),
      ),
      quiz('nextjs-day-13-quiz-q306', 0, 0,
        text('Какую проблему решает описание интерфейса через state?', 'Бо state тасвир кардани UI кадом мушкилро ҳал мекунад?', 'What problem does describing the UI through state solve?'),
        [
          text('Согласует несколько частей UI при смене данных.', 'Вақти тағйири додаҳо чанд қисми UI-ро ба ҳам мувофиқ мекунад.', 'Keeps several parts of the UI consistent as data changes.'),
          text('Отправляет запрос к складу при смене текста.', 'Вақти иваз шудани матн ба анбор дархост мефиристад.', 'Sends a warehouse request whenever text changes.'),
          text('Загружает новый HTML-документ при смене данных.', 'Вақти тағйири додаҳо HTML-и нав бор мекунад.', 'Loads a fresh HTML document whenever data changes.'),
        ],
        text('При изменении одного остатка нужно согласованно показать число и статус.', 'Бо иваз шудани як бақия ҳам шумора, ҳам ҳолат бояд дуруст бароянд.', 'A change to one stock value affects both the number and the status.'),
      ),
      quiz('nextjs-day-13-quiz-q307', 0, 1,
        text('Что происходит после запроса обновления state?', 'Пас аз дархости нав кардани state чӣ мешавад?', 'What follows a queued state update?'),
        [
          text('React вычисляет UI и применяет изменения DOM.', 'React UI-ро ҳисоб мекунад ва тағйирро ба DOM мегузорад.', 'React calculates the UI and commits DOM changes.'),
          text('Браузер сам изменяет данные в компоненте.', 'Браузер худаш додаи компонентро дигар мекунад.', 'The browser changes the component data by itself.'),
          text('React заново загружает весь документ.', 'React тамоми саҳифаро аз нав бор мекунад.', 'React reloads the entire document.'),
        ],
        text('Разделите вычисление нового JSX и реальное изменение DOM.', 'Ҳисоби JSX-и навро аз тағйир додани DOM ҷудо кунед.', 'Distinguish calculating the next JSX from applying changes to the DOM.'),
      ),
      quiz('nextjs-day-13-stable-key', 2, 2,
        text('При сортировке черновик должен остаться у своего товара. Какой key выбрать?', 'Баъди сортировка черновик бояд бо моли худаш бимонад. Кадом key дуруст аст?', 'After sorting, each draft should stay with its product. Which key should you use?'),
        [
          text('Текущий индекс карточки.', 'Index-и ҳозираи карточка.', 'The card’s current index.'),
          text('Новое случайное число на render.', 'Рақами тасодуфии нав дар ҳар render.', 'A new random number on each render.'),
          text('Постоянный ID товара.', 'ID-и доимии мол.', 'The product’s stable ID.'),
        ],
        text('Нужно значение, которое не изменится при перестановке карточек.', 'Қимате даркор, ки вақти ҷобаҷокунии карточка дигар нашавад.', 'Pick a value that survives a card changing position.'),
      ),
    ],
    practice: {
      kind: 'code',
      task: text(
        '1. Создайте Client Component для очереди, начинающейся с 2 билетов.\n2. Сделайте кнопку «Обслужить», которая уменьшает число до 0.\n3. Покажите «Есть очередь», пока число больше 0, и «Очередь пуста» при 0.\n4. Пройдите 2 → 1 → 0 и объясните вслух, какие видимые изменения делает каждый commit.',
        '1. Client Component-и навбатро бо 2 билет созед.\n2. Тугмаи «Хизмат расондем» шумораро то 0 кам кунад.\n3. То вақте адад аз 0 калон аст, «Навбат ҳаст» ва дар 0 «Навбат холӣ» нишон диҳед.\n4. 2 → 1 → 0-ро санҷед ва гӯед, ки дар ҳар commit чӣ дигар шуд.',
        '1. Create a queue Client Component starting with 2 tickets.\n2. Add a “Serve next” button that decrements the count down to 0.\n3. Display “Queue active” above 0 and “Queue empty” at 0.\n4. Try 2 → 1 → 0 and explain the visible changes made by each commit.',
      ),
      hint: text(
        'Пусть число билетов будет единственным state. Статус вычислите из него в JSX.',
        'Шумораи билет ягона state бошад. Статусро аз ҳамин шумора дар JSX ҳисоб кунед.',
        'Keep only the ticket count in state. Calculate the label from it in JSX.',
      ),
      solution: queueSolution,
      criteria: [
        text('Счётчик показывает 2 → 1 → 0 и не уходит ниже нуля.', 'Ҳисобкунак 2 → 1 → 0 мешавад ва аз сифр намегузарад.', 'The count goes 2 → 1 → 0 and cannot go below zero.'),
        text('Статус меняется только при переходе на 0.', 'Статус фақат дар гузариш ба 0 иваз мешавад.', 'The label changes only on reaching 0.'),
        text('В объяснении разделены render и commit.', 'Дар шарҳ render ва commit алоҳида фаҳмонда шудаанд.', 'The explanation distinguishes render from commit.'),
      ],
    },
  },

  14: {
    title: text('Задачи с написанием кода', 'Машқҳои навиштани код', 'Interview coding exercises'),
    summary: text(
      'Напишите debounce в собственном хуке, разберите сигнал подгрузки списка и объясните, как проверить задержку, очистку и повторные вызовы.',
      'Debounce-ро дар custom hook нависед, сигнали илова кардани қисми нави рӯйхатро фаҳмед ва delay, cleanup ва даъвати такрориро санҷед.',
      'Write a debounce Hook, trace the signal for loading more list items, and explain how to test the delay, cleanup and repeated calls.',
    ),
    sections: [
      {
        title: text('Пауза после ввода', 'Таваққуф баъди навиштан', 'Wait for a pause in typing'),
        body: text(
          'Представьте диспетчера, который записывает адрес сразу, но отправляет заказ только когда клиент закончил говорить. В поиске поле показывает каждую букву сразу, а debounce ждёт паузу перед обновлением поискового значения. Введите «b», «bo», «boo» с интервалами меньше 300 мс. После последней паузы фильтр получит только «boo».',
          'Диспетчер адресро ҳангоми гапи мизоҷ менависад, аммо фармоишро баъди тамом шудани гап мефиристад. Дар ҷустуҷӯ ҳар ҳарф дар input дарҳол мебарояд. Debounce пеш аз иваз кардани қимати ҷустуҷӯ таваққуфро интизор мешавад. Агар «b», «bo», «boo»-ро бо фосилаи аз 300 мс кам нависед, баъд аз таваққуф филтр фақат «boo»-ро мегирад.',
          'A dispatcher writes the address as the customer speaks and sends the order after the customer finishes. A search input likewise shows each keystroke immediately, while debounce waits before updating the search value. Type “b”, “bo”, “boo” less than 300 ms apart. After the last pause, the filter receives only “boo”.',
        ),
      },
      {
        title: text('Хук, таймер и cleanup', 'Hook, таймер ва cleanup', 'A Hook, its timer and cleanup'),
        body: text(
          'Один state хранит сырой ввод, второй — значение после задержки. Эффект создаёт таймер с текущими value и delay. Когда они изменятся или компонент уйдёт со страницы, cleanup отменит прежний таймер. Вынесите эту механику в useDebouncedValue. Компонент оставляет у себя поля и правило фильтрации, поэтому тот же хук можно использовать с другими данными.',
          'Як state матни input-ро нигоҳ медорад, дуюмаш қимати баъд аз таъхирро. Effect бо value ва delay-и ҳозира таймер месозад. Вақте яке дигар шуд ё компонент аз саҳифа гирифта шуд, cleanup таймери пешинаро бекор мекунад. Механикаро ба useDebouncedValue бароред. Input ва қоидаи filter дар компонент мемонанд, барои ҳамин hook бо додаҳои дигар ҳам кор мекунад.',
          'One state value holds raw input and another holds the delayed value. The effect creates a timer using the current value and delay. When either dependency changes or the component unmounts, cleanup cancels the old timer. Put that logic in useDebouncedValue so the component owns the input and filtering rule, and the Hook works with other data.',
        ),
        code: searchExample,
        language: 'tsx',
        output: text('Поле меняется сразу, список — после 300 мс без ввода.', 'Input дарҳол, рӯйхат баъди 300 мс бе навиштан иваз мешавад.', 'The input updates immediately. The list waits for 300 ms without typing.'),
      },
      {
        title: text('Сигнал подгрузки списка', 'Сигнали илова кардани қисми рӯйхат', 'The signal for loading more rows'),
        body: text(
          'После последней строки разместите небольшой элемент-маркер. IntersectionObserver сообщает, когда маркер вошёл в область просмотра. Перед запуском следующей страницы проверьте, что запрос ещё не идёт и что следующая страница существует. Наблюдатель создаётся в клиентском эффекте и отключается в cleanup. Оставьте явную кнопку «Показать ещё» для ручной загрузки.',
          'Пас аз сатри охир як элементи хурд ҳамчун нишона монед. IntersectionObserver хабар медиҳад, ки нишона ба қисми намоёни экран даромад. Пеш аз дархости қисми нав бинед, ки дархости дигар дар роҳ набошад ва қисми нав воқеан бошад. Observer дар effect-и клиент сохта шуда, дар cleanup қатъ мешавад. Тугмаи «Боз нишон деҳ» ҳам барои боркунии дастӣ монед.',
          'Place a small marker after the last row. IntersectionObserver reports when it enters the viewport. Before fetching another page, check that no request is already in flight and that there is a next page. Set up the observer in a client effect and disconnect it in cleanup. Keep a “Load more” button for manual use.',
        ),
      },
      {
        title: text('Как отладить неправильное обновление', 'Чӣ хел update-и нодурустро ёбем', 'Debugging an unexpected update'),
        body: text(
          'Если UI отстаёт, сначала проверьте источник значения. Поле должно читать текущий ввод, а список — задержанный. Если эффект повторяется бесконечно, проверьте, не меняет ли он свою зависимость и не создаётся ли объект зависимости заново. Для лишних render запишите взаимодействие в React Profiler, прежде чем менять код. Для настоящего запроса учитывайте и устаревший ответ, который пришёл последним.',
          'Агар UI дер шавад, аввал бинед, ки қимат аз куҷо меояд. Input матни ҳозираро мехонад, рӯйхат қимати баъди таъхирро. Агар effect беохир такрор шавад, санҷед, ки dependency-и худашро иваз мекунад ё объекти dependency дар ҳар render аз нав сохта мешавад. Барои render-и зиёд аввал аз React Profiler истифода баред. Агар API-и воқеӣ бошад, ҷавоби кӯҳнае, ки дертар омад, ҳам ба назар гиред.',
          'When the UI lags, check the source of each value. The input reads raw text and the list reads delayed text. If an effect loops, see whether it updates its own dependency or has a dependency object that is recreated on render. Record the interaction in React Profiler before trying to reduce extra renders. For real requests, handle an old response that arrives last as well.',
        ),
      },
    ],
    questions: [
      quiz('nextjs-day-14-quiz-q300', 0, 3,
        text('Компонент вызывается чаще, чем ожидалось. С чего начать?', 'Компонент аз интизор зиёд иҷро мешавад. Аввал чиро санҷем?', 'A component renders more often than expected. What should you check first?'),
        [
          text('Обновления state, родителя, context и props. Затем свериться с Profiler.', 'Update-и state, parent, context ва props. Баъд аз Profiler санҷед.', 'Check state, parent, context and props updates, then inspect the Profiler.'),
          text('Искать, какой код перезагружает документ при каждом render.', 'Кодеро ёбед, ки дар ҳар render саҳифаро аз нав мекушояд.', 'Find the code that reloads the document on each render.'),
          text('Проверять только изменения URL и маршрута.', 'Фақат тағйири URL ва route-ро санҷед.', 'Check only URL and route changes.'),
        ],
        text('Render может быть связан с обновлением компонента или его предков.', 'Render метавонад аз update-и компонент ё parent-ҳояш бошад.', 'Rendering may follow an update to the component or an ancestor.'),
      ),
      quiz('nextjs-day-14-quiz-q301', 0, 3,
        text('После изменения state запрос повторяется без остановки. Что проверить?', 'Пас аз иваз шудани state дархост беист меравад. Чиро бинем?', 'A request repeats after a state change. What should you inspect?'),
        [
          text('Меняет ли эффект зависимость и сохраняет ли она свою ссылку.', 'Effect dependency-ро дигар мекунад ё reference-и он ҳар дафъа нав мешавад.', 'Check whether the effect updates a dependency or a dependency gets a new reference.'),
          text('Только код обработчика клика, без зависимостей эффекта.', 'Фақат handler-и клик, бе dependency-ҳои effect.', 'Inspect the click handler alone, ignoring effect dependencies.'),
          text('Только CSS-анимацию и частоту обновления экрана.', 'Фақат CSS animation ва басомади экран.', 'Inspect only CSS animations and display frequency.'),
        ],
        text('Запишите значения зависимостей у первого и следующего запуска.', 'Қимати dependency-ро дар иҷрои якум ва дуюм нависед.', 'Write down the dependency values for the first and second runs.'),
      ),
      quiz('nextjs-day-14-quiz-q302', 0, 3,
        text('После обновления интерфейс показывает старое значение. Какие причины проверить?', 'Пас аз update интерфейс қимати кӯҳна нишон дод. Кадом сабабҳоро бинем?', 'After an update, the UI shows an older value. What should you investigate?'),
        [
          text('Мутацию, замыкание со старым state и дублирование вычисляемого значения.', 'Mutation, closure бо state-и кӯҳна ва такрори қимати ҳисобшаванда.', 'Look for mutation, a stale closure and duplicated derived state.'),
          text('Поддержку CSS-свойств и разрешение дисплея.', 'Дастгирии CSS ва андозаи экран.', 'Check CSS support and screen resolution.'),
          text('Размер проекта и число установленных пакетов.', 'Ҳаҷми проект ва шумораи бастаҳо.', 'Check the project size and package count.'),
        ],
        text('Проследите, какое значение читает JSX и где оно было рассчитано.', 'Пайгирӣ кунед, ки JSX кадом қиматро мегирад ва он дар куҷо ҳисоб шуд.', 'Trace which value the JSX reads and where it was computed.'),
      ),
      quiz('nextjs-day-14-cancel-timer', 1, 1,
        text('Пользователь ввёл «ab», затем «abc» через 100 мс. Что делать с первым таймером при задержке 300 мс?', 'Корбар «ab» навишт, пас аз 100 мс «abc». Агар delay 300 мс бошад, таймери аввал чӣ шавад?', 'The user types “ab” and then “abc” 100 ms later. What happens to the first timer with a 300 ms delay?'),
        [
          text('Оставить его и дождаться обоих обновлений.', 'Монед, ки ҳар ду update иҷро шаванд.', 'Keep it and wait for both updates.'),
          text('Отменить его при смене значения.', 'Ҳангоми иваз шудани қимат бекор кунед.', 'Cancel it when the value changes.'),
          text('Запустить его сразу перед новым таймером.', 'Пеш аз таймери нав дарҳол иҷро кунед.', 'Run it immediately before starting a new timer.'),
        ],
        text('Цель debounce — применить последнее значение после паузы.', 'Debounce қимати охиринро баъди таваққуф истифода мебарад.', 'Debounce applies the latest value after a pause.'),
      ),
    ],
    practice: {
      kind: 'code',
      task: text(
        '1. Создайте клиентское поле «Заметка для курьера» и область предпросмотра.\n2. Показывайте ввод сразу, а предпросмотр обновляйте через 400 мс без ввода.\n3. Вынесите задержку в useDebouncedValue. Отменяйте таймер при смене ввода или уходе со страницы.\n4. Быстро введите «д», «до», «дом» и проверьте, что в предпросмотре появится только «дом». Проверьте и очистку поля.',
        '1. Input-и клиентии «Эзоҳ барои курьер» ва пешнамоиш созед.\n2. Матни input дарҳол барояд. Пешнамоиш баъди 400 мс бе навиштан нав шавад.\n3. Delay-ро ба useDebouncedValue бароред. Ҳангоми иваз шудани input ё баромадан аз саҳифа таймерро бекор кунед.\n4. «д», «до», «дом»-ро тез нависед. Бинед, ки дар пешнамоиш фақат «дом» барояд. Холӣ кардани input-ро ҳам санҷед.',
        '1. Create a client-side courier note input and a preview.\n2. Display typing immediately and update the preview after 400 ms with no input.\n3. Move the delay into useDebouncedValue. Cancel the timer on input changes or unmount.\n4. Quickly type “d”, “do”, “door”. Confirm only “door” appears in the preview, then verify that clearing the input also clears the preview.',
      ),
      hint: text(
        'Возвращайте функцию очистки из useEffect. Передайте в зависимости текущий текст и задержку.',
        'Аз useEffect функсияи cleanup баргардонед. Ба dependency матни ҳозира ва delay-ро диҳед.',
        'Return cleanup from useEffect. Include current text and delay in the dependency list.',
      ),
      solution: noteSolution,
      criteria: [
        text('Поле отвечает сразу, предпросмотр ждёт 400 мс.', 'Input дарҳол, пешнамоиш баъди 400 мс нав мешавад.', 'The input responds immediately and the preview waits 400 ms.'),
        text('Быстрый ввод не показывает промежуточные значения.', 'Ҳангоми зуд навиштан қиматҳои миёна намебароянд.', 'Fast typing does not show the intermediate values.'),
        text('Cleanup отменяет старый таймер, а пустая строка очищает предпросмотр.', 'Cleanup таймери кӯҳнаро бекор мекунад. Сатри холӣ пешнамоишро тоза мекунад.', 'Cleanup cancels the old timer and an empty string clears the preview.'),
      ],
    },
  },

  15: {
    title: text('Пробное интервью', 'Мусоҳибаи санҷишӣ', 'Mock interview'),
    summary: text(
      'Проведите три коротких раунда: объясните интерфейс, разберите дублирование state и защитите решение с проверяемыми условиями.',
      'Се қисми кӯтоҳро гузаред: UI-ро фаҳмонед, state-и такрориро бинед ва қарорро бо шартҳои санҷиданӣ асоснок кунед.',
      'Run three short rounds: explain an interface, review duplicated state and defend a decision using verifiable conditions.',
    ),
    sections: [
      {
        title: text('Ответ начинается с задачи', 'Ҷавоб аз мушкил сар мешавад', 'Start with the problem'),
        body: text(
          'Мастер объясняет ремонт, назвав сначала, что машина перестала делать. Дальше показывает, какой узел проверил, что изменил и при каких условиях это помогает. На интервью используйте то же движение: проблема, наблюдение, решение, проверка. Например: фильтр сбрасывался после перехода по ссылке, поэтому его значение сохранили в URL и проверили переход и обновление страницы.',
          'Усто таъмирро аз он сар мекунад, ки мошин кадом корро намекард. Баъд мегӯяд, ки кадом қисмро санҷид, чиро иваз кард ва кай ин ислоҳ ёрӣ медиҳад. Дар мусоҳиба ҳам мушкил, мушоҳида, қарор ва санҷишро пай дар пай гӯед. Масалан филтр баъди кушодани саҳифа аз линк гум мешуд. Қиматро ба URL гузоштем ва линкро баъди refresh санҷидем.',
          'A mechanic first describes what the car stopped doing, then explains the check, the repair and when it helps. Use the same sequence in an interview: problem, observation, decision and verification. For example, a filter was lost when opening a shared link, so the value moved into the URL and the team checked the link and a page reload.',
        ),
      },
      {
        title: text('Один источник для результата фильтра', 'Як манбаъ барои натиҷаи filter', 'One source for a filtered result'),
        body: text(
          'При ревью спросите, откуда берутся books, запрос query и показанный список. Если visibleBooks целиком получается из books и query, его можно рассчитать внутри компонента. Тогда при смене props фильтр сразу работает с новыми книгами. Второй state и эффект для фильтра создают лишний проход через render и могут усложнить синхронизацию.',
          'Дар code review пурсед, ки books, query ва рӯйхати намоён аз куҷо меоянд. Агар visibleBooks пурра аз books ва query ҳисоб шавад, онро дар дохили компонент ҳисоб кунед. Баробари иваз шудани props филтр бо китобҳои нав кор мекунад. State-и дуюм ва effect барои филтр render-и иловагӣ меоранд ва нав кардани рӯйхатро мушкил мекунанд.',
          'In review, ask where books, query and the displayed list come from. If visibleBooks is fully determined by books and query, compute it in the component. A props update then filters the current books right away. A second state variable and an effect for filtering add another render pass and make synchronization harder to follow.',
        ),
        code: booksExample,
        language: 'tsx',
        output: text('Запрос re показывает только React и React Router.', 'Query-и re фақат React ва React Router-ро нишон медиҳад.', 'The query re shows React and React Router.'),
      },
      {
        title: text('Кто должен читать значение', 'Қимат ба кӣ даркор аст', 'Who needs to read the value'),
        body: text(
          'Открытое меню одной карточки можно хранить в её local state. Если два соседних компонента используют один выбор, сначала рассмотрите общего родителя. Если пользователь должен отправить ссылку с фильтром, URL становится источником для него. Данные, которые приходят с сервера, и форма для их редактирования имеют разные жизненные циклы. Перед выбором инструмента назовите, кто читает значение и когда его надо сохранить.',
          'Менюи кушодаи як карточка метавонад дар local state-и ҳамон карточка бошад. Агар ду компонент ба як интихоб ниёз дошта бошанд, аввал parent-и умумиро бинед. Агар линк бояд филтрро ҳам барад, URL манбаи филтр мешавад. Додаи сервер ва формае, ки онро тағйир медиҳад, вақти истифодаи гуногун доранд. Пеш аз интихоби восита гӯед, ки қимат ба кӣ ва то кай даркор аст.',
          'A card’s open menu can live in its local state. When two sibling components share one choice, consider their common parent first. A filter that must survive a shared link belongs in the URL. Server records and an editing form have different lifecycles. Before choosing a tool, say who reads the value and how long it must last.',
        ),
      },
      {
        title: text('Проверка решения без догадок', 'Санҷиши қарор бе тахмин', 'Verify the decision with a concrete case'),
        body: text(
          'Для интервью запишите ввод и ожидаемый вывод до запуска. Проверьте совпадение, пустой результат и изменение исходных данных. Затем назовите условие, при котором решение надо пересмотреть: например, фильтр теперь должен пережить обновление страницы. Если пока неизвестно, надо ли сохранять его в ссылке, уточните требование и объясните, как ответ повлияет на код.',
          'Пеш аз иҷро input ва натиҷаи интизориро нависед. Ҳолати ёфт шудан, рӯйхати холӣ ва иваз шудани додаҳои аслиро санҷед. Баъд шартро гӯед, ки дар он қарорро аз нав мебинед. Масалан, ҳоло филтр бояд баъди refresh бимонад. Агар маълум набошад, ки линк филтрро бояд нигоҳ дорад, талаботро аниқ кунед ва таъсири ҷавобро ба код гӯед.',
          'Before running the example, write the input and expected output. Check a match, an empty result and a change to the source data. Then name a condition that would make you reconsider the decision, such as a filter that must survive a reload. If shareable-filter requirements are unclear, ask and explain how the answer affects the code.',
        ),
      },
    ],
    questions: [
      quiz('nextjs-day-15-quiz-q315', 0, 2,
        text('Коллега предлагает перенести открытие одного меню в Redux. Как обсудить решение?', 'Ҳамкор мегӯяд state-и кушодани як менюро ба Redux барем. Чӣ ҷавоб медиҳед?', 'A teammate wants to move one menu’s open state to Redux. How do you discuss it?'),
        [
          text('Проверить, кто читает значение. Пока нужен только один компонент, оставить state в нём.', 'Бинед, ки қимат ба кӣ даркор. То вақте як компонент мехонад, state дар ҳамон ҷо монад.', 'Check who reads it. Keep it local while only one component needs it.'),
          text('Отнести состояние меню к серверным данным и хранить его в API.', 'State-и менюро додаи сервер гуфта, дар API нигоҳ доред.', 'Treat menu state as server data and put it in the API.'),
          text('Отправить состояние меню в глобальный store сразу.', 'State-и менюро якбора ба store-и global баред.', 'Move the menu state to a global store immediately.'),
        ],
        text('Сначала определите, есть ли у меню другие потребители.', 'Аввал бинед, ки менюро компоненти дигар ҳам мехонад ё не.', 'Start by identifying any other consumers of the menu state.'),
      ),
      quiz('nextjs-day-15-quiz-q316', 0, 1,
        text('Что спросить у автора перед удалением state для filteredProducts?', 'Пеш аз гирифтани state-и filteredProducts аз муаллиф чӣ мепурсед?', 'What should you ask before removing state for filteredProducts?'),
        [
          text('Полностью ли filteredProducts вычисляется из списка и фильтра?', 'filteredProducts пурра аз рӯйхат ва filter ҳисоб мешавад?', 'Is filteredProducts fully derived from the products and the filter?'),
          text('Какую библиотеку команда чаще видит в вакансиях?', 'Даста кадом library-ро бештар дар эълони кор мебинад?', 'Which library appears most often in job listings?'),
          text('Можно ли принять решение без проверки требований?', 'Бе санҷидани талабот қарор гирифта мешавад?', 'Can we decide before checking the requirements?'),
        ],
        text('Вычисляемое значение можно убрать из state, если известны все его входные данные.', 'Агар ҳама додаи дохилшаванда маълум бошад, қиматро аз state гирифтан мумкин.', 'A derived value can leave state when you know all its inputs.'),
      ),
      quiz('nextjs-day-15-quiz-q361', 0, 2,
        text('Как объяснить архитектуру списка и фильтра новой команде?', 'Сохти рӯйхат ва filter-ро ба дастаи нав чӣ хел мефаҳмонед?', 'How would you explain a list and filter to a new team?'),
        [
          text('Назвать источники: UI в компоненте, общий фильтр в URL, записи на сервере.', 'Манбаъҳоро гӯед: UI дар компонент, филтри муштарак дар URL ва сабтҳо дар сервер.', 'Name the sources: local UI, a shareable URL filter and server records.'),
          text('Собрать данные списка, фильтр и кнопки в одном общем store.', 'Додаи рӯйхат, filter ва тугмаҳоро дар як store гиред.', 'Put records, filters and buttons together in one global store.'),
          text('Перечислить библиотеки без связи с требованиями.', 'Library-ҳоро бе вобаста кардан ба талабот номбар кунед.', 'List the libraries without connecting them to requirements.'),
        ],
        text('Опишите владельца для каждого вида данных и причины выбора.', 'Барои ҳар дода манбаъ ва сабаби интихобро гӯед.', 'Explain who owns each type of data and why.'),
      ),
      quiz('nextjs-day-15-reload-filter', 1, 3,
        text('Фильтр перенесли в URL. Как проверить главное требование?', 'Филтрро ба URL гузоштанд. Талаботи асосиро чӣ хел санҷем?', 'The filter moved into the URL. How do you verify the main requirement?'),
        [
          text('Подсчитать строки в компоненте после изменения.', 'Баъди тағйир сатрҳои компонентро шуморед.', 'Count lines in the component after the change.'),
          text('Открыть ссылку в новой вкладке и проверить результат после обновления.', 'Линкро дар вкладкаи нав кушоед ва баъди refresh натиҷаро бинед.', 'Open a shared link in a new tab and check the result after reloading.'),
          text('Проверить поиск только в уже открытой вкладке.', 'Ҷустуҷӯро фақат дар вкладкаи ҳозира бинед.', 'Try search in the tab that is already open.'),
        ],
        text('Новая вкладка начинает без прежнего local state.', 'Вкладкаи нав бе local state-и пешина сар мекунад.', 'A new tab starts without the prior local state.'),
      ),
    ],
    practice: {
      kind: 'written',
      task: text(
        '1. Представьте список услуг мастерской. Запрос нужно передавать ссылкой, а карточку раскрывает только её кнопка.\n2. Объясните за минуту, где будут храниться запрос, список услуг и открытие карточки.\n3. Сформулируйте один вопрос на ревью, если автор хранит результат фильтра в state.\n4. Запишите три проверки: общий URL, пустой результат и появление новой услуги после обновления данных.',
        '1. Рӯйхати хизмати устохонаро тасаввур кунед. Ҷустуҷӯ бояд бо линк гузарад, карточкаро бошад тугмаи худаш мекушояд.\n2. Дар як дақиқа гӯед, ки query, рӯйхати хизмат ва ҳолати карточка дар куҷо мемонанд.\n3. Агар муаллиф натиҷаи filter-ро дар state монад, як саволи code review нависед.\n4. Се санҷиш нависед: линки муштарак, натиҷаи холӣ ва хизмати нав баъди нав кардани дода.',
        '1. Imagine a workshop service list. Search must survive in a shared link, while each card has its own expand button.\n2. In one minute, explain where the query, service records and open state live.\n3. Write a review question for an author storing the filtered result in state.\n4. Write three checks: a shared URL, no results and a new matching service after the data updates.',
      ),
      hint: text(
        'Для каждого значения назовите источник, потребителей и время жизни.',
        'Барои ҳар қимат манбаъ, истифодабаранда ва вақти нигоҳдориро гӯед.',
        'For each value, name its source, consumers and lifetime.',
      ),
      solution: mockInterviewAnswer.ru,
      referenceAnswer: mockInterviewAnswer,
      criteria: [
        text('Запрос, данные услуг и состояние карточки имеют разных владельцев.', 'Query, додаи хизмат ва state-и карточка манбаъҳои ҷудо доранд.', 'The query, service records and card state have distinct owners.'),
        text('Вопрос на ревью проверяет, выводится ли фильтр из входных данных.', 'Саволи review месанҷад, ки натиҷаи филтр аз додаи аслӣ ҳисоб мешавад ё не.', 'The review question checks whether the filter result is derived.'),
        text('Три сценария называют наблюдаемый результат.', 'Ҳар се санҷиш натиҷаи намоён доранд.', 'All three scenarios state an observable result.'),
      ],
    },
  },
  16: {
    title: text('План проекта и архитектура', 'Нақша ва сохти проект', 'Project planning and architecture'),
    summary: text(
      'Превратите одну задачу пользователя в план проекта. Опишите данные, границы файлов и проверки до начала разработки.',
      'Як кори корбарро ба нақшаи проект табдил диҳед. Пеш аз код додаҳо, вазифаи файлҳо ва санҷишро нависед.',
      'Turn one user task into a project plan. Define the data, file responsibilities and checks before starting implementation.',
    ),
    sections: [
      {
        title: text('Один сценарий до конца', 'Як кори корбар то охир', 'Follow one user journey'),
        body: text(
          'В мастерской заявку сначала принимают, затем записывают и только потом выдают номер. Для проекта важен такой же законченный маршрут. Сформулируйте его от лица пользователя: «Сотрудник вводит название ремонта, нажимает сохранить и видит его в списке после обновления». Начните с этого пути. Поиск и сортировка могут подождать.',
          'Дар устохона аввал дархостро қабул мекунанд, баъд менависанд ва баъд рақам медиҳанд. Дар проект ҳам як кори корбарро пурра бинед. Масалан корманд номи таъмирро менависад, «Сабт»-ро пахш мекунад ва пас аз refresh онро дар рӯйхат мебинад. Аз ҳамин кор сар кунед. Search ва sort метавонад баъд биёяд.',
          'A workshop takes a repair request, records it and then issues a number. A project likewise needs one complete journey. For example, a staff member enters a repair title, saves it and sees it in the list after reloading. Start with that journey. Search and sorting can wait.',
        ),
      },
      {
        title: text('Контракт входа и результата', 'Шарти вуруд ва натиҷа', 'Define the input and result'),
        body: text(
          'Контракт — договорённость о том, что принимает действие и что вернёт. Например, запись в журнал чтения принимает непустое название и возвращает сохранённые id и title. Для пустой строки сервер возвращает ошибку без новой записи. Если работаете с существующим API, найдите метод, поля и ответы в коде или документации перед планированием.',
          'Контракт яъне пешакӣ маълум аст, ки амал чиро мегирад ва чиро медиҳад. Масалан дафтари китоб номи ғайрихолиро қабул карда, id ва title-и сабтшударо бармегардонад. Агар ном холӣ бошад, сервер хато медиҳад ва сабт намекунад. Барои API-и мавҷуда method, майдонҳо ва response-ро аввал аз код ё ҳуҷҷат бинед.',
          'A contract states what an operation accepts and what it returns. A reading log can take a non-empty title and return the saved id and title. An empty title yields an error without creating a row. For an existing API, check the method, fields and responses in the code or documentation before planning.',
        ),
        code: readingContract,
        language: 'ts',
      },
      {
        title: text('Владельцы интерфейса и данных', 'Вазифаи UI ва додаҳо', 'UI and data responsibilities'),
        body: text(
          'В App Router страница показывает список. Интерактивная форма принимает ввод и показывает состояние отправки. Route Handler, если он нужен, проверяет запрос и обращается к слою данных. Хранилище отвечает за сохранённые записи. Укажите эти роли в плане и перечислите файлы, нужные для одного сценария.',
          'Дар App Router саҳифа рӯйхатро нишон медиҳад. Форма input мегирад ва ҳолати фиристоданро нишон медиҳад. Route Handler, агар лозим бошад, request-ро месанҷад ва ба қисми додаҳо муроҷиат мекунад. Ҷои нигоҳдорӣ барои сабтҳо ҷавоб медиҳад. Ин вазифаҳо ва файлҳои даркориро барои як кори корбар нависед.',
          'In the App Router, the page can show the list. An interactive form handles input and submission feedback. A Route Handler, if needed, validates the request and calls the data layer. Storage owns the persisted records. List those responsibilities and the files needed for the one journey.',
        ),
      },
      {
        title: text('Маленькая задача для помощника', 'Вазифаи хурд барои ёрдамчӣ', 'Give an assistant one bounded task'),
        body: text(
          'Если используете Claude Code или другой помощник, дайте точную задачу: какие файлы относятся к сценарию, какой контракт проверен и какие результаты должны наблюдаться. Не передавайте секреты. После работы сравните diff с планом, запустите проверку и сами пройдите успешный и ошибочный сценарии.',
          'Агар Claude Code ё ёрдамчии дигарро истифода баред, як вазифаи аниқ диҳед: кадом файлҳо ба кор вобастаанд, кадом контракт санҷида шудааст ва кадом натиҷаро дидан даркор. Secret нафиристед. Баъди edit diff-ро бо нақша муқоиса карда, ҳолати муваффақ ва хаторо худатон санҷед.',
          'If you use Claude Code or another assistant, give it one specific task, the relevant files, the confirmed contract and observable outcomes. Leave secrets out. Review the diff against the plan, run the checks, and walk through both the success and failure cases yourself.',
        ),
      },
    ],
    questions: [
      quiz('nextjs-day-16-extra-project-planning', 0, 3,
        text('Что передать помощнику перед изменением проекта?', 'Пеш аз тағйири проект ба ёрдамчӣ чӣ медиҳем?', 'What should you give an assistant before a project change?'),
        [
          text('Задачу, проверенный контракт, нужные файлы и критерии.', 'Вазифа, контракти санҷида, файлҳои даркорӣ ва шартҳо.', 'The task, confirmed contract, relevant files and criteria.'),
          text('Общую просьбу улучшить весь проект.', 'Хоҳиши умумии беҳтар кардани тамоми проект.', 'A general request to improve the entire project.'),
          text('Секреты окружения и чужие учётные данные.', 'Secret-и environment ва маълумоти ҳисоби дигарон.', 'Environment secrets and account credentials.'),
        ],
        text('Достаточно контекста, чтобы проверить один результат.', 'Барои санҷидани як натиҷа контексти кофӣ диҳед.', 'Provide enough context to check one outcome.'),
      ),
      quiz('nextjs-day-16-missing-field', 1, 1,
        text('В запросе нужно имя поля, но оно неизвестно. Что дальше?', 'Номи майдони request номаълум аст. Қадами дигар чист?', 'You need a request field name but it is unknown. What next?'),
        [
          text('Взять имя из подписи поля в интерфейсе.', 'Номро аз label-и input гирифтан.', 'Use the label shown in the UI.'),
          text('Найти контракт в коде или документации.', 'Контрактро дар код ё ҳуҷҷат ёфтан.', 'Find the contract in code or documentation.'),
          text('Выбрать короткое имя и начать обработчик.', 'Номи кӯтоҳ монда, handler-ро сар кардан.', 'Choose a short name and write the handler.'),
        ],
        text('Проверьте то место, которое реально принимает запрос.', 'Ҷоеро санҷед, ки request-ро воқеан қабул мекунад.', 'Find what actually accepts the request.'),
      ),
      quiz('nextjs-day-16-finish-one-flow', 2, 0,
        text('Что показать как первый законченный сценарий?', 'Кадомаш аввалин кори пурраи корбар аст?', 'What counts as the first complete journey?'),
        [
          text('Страницу с пустой формой и ещё три макета.', 'Саҳифа бо формаи холӣ ва боз се макет.', 'A page with an empty form and three mockups.'),
          text('Кнопку, которая меняет цвет после нажатия.', 'Тугмае, ки баъди пахш рангаш дигар мешавад.', 'A button that changes color after a click.'),
          text('Запись из формы, доступную после повторного чтения.', 'Сабти форма, ки баъди аз нав хондан ҳам ҳаст.', 'A form submission that can be read back.'),
        ],
        text('Пройдите путь от действия пользователя до сохранённого результата.', 'Аз кори корбар то натиҷаи сабтшуда гузаред.', 'Follow the action through to a stored result.'),
      ),
    ],
    practice: {
      kind: 'written',
      task: text(
        '1. Выберите один сценарий учебного журнала ремонтов: добавить заголовок и увидеть запись в списке.\n2. Опишите вход, ответ и условие ошибки.\n3. Укажите, где будут страница, интерактивная форма, обработчик и хранение.\n4. Назовите конкретные проверки успеха, пустого заголовка и повторного чтения.',
        '1. Як кори журнали омӯзишии таъмирро интихоб кунед: ном илова кардан ва сабтро дар рӯйхат дидан.\n2. Вуруд, ҷавоб ва шарти хаторо нависед.\n3. Ҷои саҳифа, формаи интерактивӣ, handler ва нигоҳдории додаҳоро гӯед.\n4. Санҷиши муваффақият, номи холӣ ва аз нав хонданро нависед.',
        '1. Pick one journey for a practice repair log: add a title and see the entry in a list.\n2. Describe input, response and the error condition.\n3. Locate the page, interactive form, handler and storage.\n4. Define concrete success, empty-title and read-back checks.',
      ),
      hint: text('Начните с двух строк: что вводит пользователь и что он видит после обновления.', 'Аз ду сатр сар кунед: корбар чиро менависад ва пас аз refresh чиро мебинад.', 'Start with what the user enters and what they see after reloading.'),
      solution: repairPlanAnswer.ru,
      referenceAnswer: repairPlanAnswer,
      criteria: [
        text('Вход и ответ используют определённые поля, случай ошибки описан.', 'Вуруд ва ҷавоб майдони аниқ доранд, хато ҳам фаҳмонда шудааст.', 'Input and response have named fields and the error case is defined.'),
        text('Форма, обработчик и хранение имеют разные обязанности.', 'Форма, handler ва нигоҳдорӣ вазифаҳои ҷудо доранд.', 'The form, handler and storage have separate responsibilities.'),
        text('Проверки охватывают пустой ввод и повторное чтение.', 'Санҷиш input-и холӣ ва аз нав хонданро дар бар мегирад.', 'Checks cover empty input and reading the record back.'),
      ],
    },
  },
  17: {
    title: text('Форма и сохранение записи', 'Форма ва нигоҳдории сабт', 'A form that persists a record'),
    summary: text(
      'Проведите заголовок заявки через форму, проверку на сервере и SQLite. Подтвердите запись отдельным GET и обновлением страницы.',
      'Номи дархостро аз форма, санҷиши сервер ва SQLite гузаронед. Сабтро бо GET-и алоҳида ва refresh тасдиқ кунед.',
      'Send a repair title through a form, server validation and SQLite. Confirm the saved record with a separate GET and a page reload.',
    ),
    sections: [
      {
        title: text('Подтверждение после записи', 'Тасдиқ баъди сабт', 'Confirm after writing'),
        body: text(
          'В журнале мастерской заявка появляется после записи мастером. Экран должен вести себя так же: POST получает название, сервер проверяет и сохраняет его, затем возвращает созданную запись. Форму очищают после успешного ответа. Ошибка сохраняет введённый заголовок для исправления.',
          'Дар журнали устохона дархост баъди навиштани усто пайдо мешавад. Экран ҳам ҳамин хел кор кунад: POST номро мегирад, сервер онро месанҷад ва сабтро бармегардонад. Формаро баъди ҷавоби муваффақ холӣ кунед. Агар хато омад, ном барои ислоҳ дар input монад.',
          'A repair entry appears in the workshop ledger once it is written down. The screen should work the same way: POST takes the title, the server validates and saves it, then sends the new record back. Clear the form after success. On failure, preserve the title so the user can make a correction.',
        ),
      },
      {
        title: text('Локальный Route Handler и SQLite', 'Route Handler-и маҳаллӣ ва SQLite', 'Local Route Handler and SQLite'),
        body: text(
          'В отдельном учебном Next.js App Router проекте с Node.js 24 сохраните пример в app/api/repairs/route.ts. Это новый локальный маршрут упражнения. prepare связывает title с параметром SQL. POST возвращает 201, если вставка удалась, и 400 для неверного ввода. GET читает файл базы. Используйте только вымышленные данные и локальный запуск, поскольку вход и доступ будут отдельной задачей.',
          'Дар проекти омӯзишии алоҳидаи Next.js App Router бо Node.js 24 мисолро дар app/api/repairs/route.ts монед. Ин route-и нави маҳаллии машқ аст. prepare номи таъмирро ба параметри SQL медиҳад. POST баъди сабт 201 ва барои input-и нодуруст 400 медиҳад. GET файли пойгоҳро мехонад. Барои ҳозир фақат додаи сохта ва запуск-и маҳаллӣ, чун login ва дастрасӣ вазифаи ҷудо ҳастанд.',
          'In a separate practice Next.js App Router project on Node.js 24, save this example as app/api/repairs/route.ts. This is a new local route for the exercise. A prepared statement binds the title to the SQL parameter. POST returns 201 after a successful insert and 400 for invalid input. GET reads the database file. Use fictional records and keep the app local until access control is added.',
        ),
        code: repairRouteExample,
        language: 'ts',
      },
      {
        title: text('Повторное чтение после обновления', 'Боз хондан баъди refresh', 'Read back after a reload'),
        body: text(
          'Пусть первый запрос создаст запись с id 1. Перезагрузите страницу и снова вызовите GET. Если id 1 и заголовок вернулись из сохранённого файла, проверен полный путь. Для более строгой проверки остановите локальный сервер и запустите его из той же папки. Файловая база подходит для этого локального занятия, а окружение деплоя требует отдельно выбранного постоянного хранилища.',
          'Фарз кунед дархости аввал сабти id 1-ро сохт. Саҳифаро аз нав кушоед ва GET-ро боз иҷро кунед. Агар id 1 ва ном аз файли сабт баргардад, роҳи пурра санҷида шуд. Барои санҷиши сахттар сервери маҳаллиро истонед ва аз ҳамон папка боз сар кунед. Пойгоҳи файлӣ барои ҳамин машқи маҳаллӣ аст. Дар deploy нигоҳдории доимиро алоҳида интихоб мекунанд.',
          'Suppose the first request creates id 1. Reload the page and call GET again. Getting that id and title back from the stored file checks the whole journey. For a stronger local check, restart the server from the same directory. File-backed storage fits this exercise. A deployed environment needs its own persistent storage choice.',
        ),
      },
      {
        title: text('Ошибка и незавершённая отправка', 'Хато ва фиристодани нотамом', 'Failure and pending submission'),
        body: text(
          'fetch возвращает HTTP-ответ и для статусов 400 или 500. Проверяйте response.ok до изменения списка. Пока запрос в работе, блокируйте повторную отправку. При ошибке запроса объясните её пользователю и оставьте его ввод, а при чтении пустой базы покажите пустой список. Проверяйте эти состояния по отдельности.',
          'fetch барои 400 ё 500 ҳам HTTP response медиҳад. Пеш аз нав кардани рӯйхат response.ok-ро бинед. То request дар роҳ аст, фиристодани такрориро бандед. Ҳангоми хато хабар диҳед ва матни корбарро нигоҳ доред. Агар пойгоҳ сабт надошта бошад, рӯйхати холиро нишон диҳед. Ҳар ҳолатро ҷудо санҷед.',
          'fetch returns an HTTP response for statuses such as 400 and 500. Check response.ok before changing the list. Disable repeat submission while the request is pending. If it fails, show an error and keep the input. Show an empty list when storage has no rows. Check each state separately.',
        ),
      },
    ],
    questions: [
      quiz('nextjs-day-17-extra-fullstack', 0, 2,
        text('Форма показала успех. Как проверить сохранение?', 'Форма «сабт шуд» нишон дод. Нигоҳдории сабтро чӣ хел месанҷем?', 'The form shows success. How do you verify persistence?'),
        [
          text('Перезагрузить страницу и получить ту же запись отдельным GET.', 'Саҳифаро refresh карда, ҳамон сабтро бо GET-и нав гирифтан.', 'Reload the page and retrieve the same record with a fresh GET.'),
          text('Проверить, что кнопка осталась зелёной.', 'Дидан, ки тугма сабз монд.', 'Check that the button stayed green.'),
          text('Проверить, что обработчик вывел текст в console.log.', 'Дидан, ки handler матнро ба console.log баровард.', 'Check that the handler printed a console.log message.'),
        ],
        text('Нужен запрос, который читает сохранённые данные независимо от ответа POST.', 'Дархосте даркор, ки сабтро ҷудо аз response-и POST хонад.', 'Use a fresh read that does not depend on the POST result.'),
      ),
      quiz('nextjs-day-17-reject-empty', 2, 1,
        text('Что вернёт сервер для названия из трёх пробелов?', 'Сервер барои номе, ки фақат се space дорад, чӣ медиҳад?', 'What does the server return for a title made of three spaces?'),
        [
          text('201 и новую запись с пробелами.', '201 ва сабти нав бо space.', '201 and a new record with spaces.'),
          text('200 и текущее состояние формы.', '200 ва ҳолати ҳозираи форма.', '200 and the current form state.'),
          text('400 без новой записи.', '400, бе сабти нав.', '400 with no new record.'),
        ],
        text('Проследите, какой результат даёт trim() перед проверкой.', 'Бинед, ки trim() пеш аз санҷиш чӣ натиҷа медиҳад.', 'Trace the result of trim() before the validation check.'),
      ),
      quiz('nextjs-day-17-post-failure', 1, 3,
        text('POST вернул 400. Что должна сделать форма?', 'POST 400 дод. Форма чӣ кор кунад?', 'POST returned 400. What should the form do?'),
        [
          text('Очистить ввод и добавить запись на экран.', 'Input-ро холӣ карда, сабт ба экран илова кунад.', 'Clear the input and add a row to the screen.'),
          text('Показать ошибку, сохранить ввод и не менять список.', 'Хаторо нишон диҳад, input-ро монад ва рӯйхатро дигар накунад.', 'Show an error, keep the input and leave the list as is.'),
          text('Повторять POST автоматически, пока он не сработает.', 'POST-ро то муваффақият худкор такрор кунад.', 'Repeat the POST automatically until it works.'),
        ],
        text('Выберите результат, после которого пользователь сможет исправить ввод.', 'Ҳолатеро интихоб кунед, ки корбар баъдаш input-ро ислоҳ карда тавонад.', 'Pick the outcome that lets the user fix the input.'),
      ),
    ],
    practice: {
      kind: 'code',
      task: text(
        '1. Установите локальный обработчик из урока в отдельный учебный проект.\n2. Создайте app/page.tsx с полем названия, списком и состояниями загрузки и ошибки.\n3. Прочитайте список через GET, а через POST сохраните название. Добавляйте запись и очищайте форму только после успеха.\n4. Отправьте «Check tyre», обновите страницу и найдите запись. Отправьте пробелы и убедитесь, что новая запись не появилась.',
        '1. Handler-и дарсро ба проекти омӯзишии маҳаллӣ монед.\n2. app/page.tsx созед, ки input-и ном, рӯйхат, loading ва ҳолати хато дорад.\n3. Бо GET рӯйхат хонед, бо POST номро сабт кунед. Танҳо баъди муваффақият сабтро илова ва формаро холӣ кунед.\n4. «Check tyre»-ро фиристода, баъди refresh сабтро ёбед. Space фиристода бинед, ки сабти нав наомад.',
        '1. Add the lesson’s local handler to a separate practice project.\n2. Create app/page.tsx with a title input, record list, loading state and error state.\n3. Read through GET and write through POST. Append and reset the form only after a successful response.\n4. Submit “Check tyre”, reload and find it. Submit spaces and verify that no new record appears.',
      ),
      hint: text('Отдельно храните исходный ввод и записи, полученные от сервера. Проверяйте response.ok для обоих запросов.', 'Input ва сабтҳои серверро ҷудо нигоҳ доред. Барои ҳар ду request response.ok-ро санҷед.', 'Keep raw input and server records separate. Check response.ok for both requests.'),
      solution: repairFormSolution,
      criteria: [
        text('Добавленная запись возвращается после обновления страницы.', 'Сабти иловашуда баъди refresh бармегардад.', 'The saved entry returns after a page reload.'),
        text('Пустой ввод показывает ошибку и не создаёт записи.', 'Input-и холӣ хато медиҳад ва сабт намесозад.', 'Blank input shows an error and creates no record.'),
        text('Повторная отправка отключена на время запроса.', 'То тамомшавии request фиристодани такрорӣ баста аст.', 'Repeat submission is disabled while the request is pending.'),
      ],
    },
  },
  18: {
    title: text('Типы и права на запись', 'Type ва иҷозати тағйири сабт', 'Types and record ownership'),
    summary: text(
      'Опишите props кнопки, проверьте входные данные в runtime и ограничьте изменение записи её владельцем.',
      'Props-и тугмаро муайян кунед, input-ро дар runtime санҷед ва иваз кардани сабтро ба соҳиби он маҳдуд кунед.',
      'Type button props, validate incoming data at runtime and limit record changes to the record owner.',
    ),
    sections: [
      {
        title: text('TypeScript и данные из запроса', 'TypeScript ва додаи request', 'TypeScript and request data'),
        body: text(
          'У заявки может быть тип с id, title и ownerId. Это проверка для кода, который вы пишете. Значение из request.json() появляется во время выполнения. Примите его как unknown и проверьте форму объекта, типы и допустимые значения. Если проверка прошла, TypeScript сможет уточнить тип внутри этой ветки.',
          'Дархост type бо id, title ва ownerId дошта метавонад. Ин барои санҷиши коди навиштаи шумост. Қимати request.json() вақти иҷро меояд. Онро аввал unknown гиред. Шакли объект, type ва қимати иҷозатшударо санҷед. Агар санҷиш гузашт, TypeScript дар ҳамон шоха type-ро аниқ мекунад.',
          'A repair record may have id, title and ownerId fields in its type. That checks code you write. A value from request.json() arrives at runtime. Treat it as unknown, then check its shape, field types and allowed values. TypeScript can narrow the value inside the checked branch.',
        ),
      },
      {
        title: text('Сессия и право на изменение', 'Session ва ҳуқуқи тағйир додан', 'Session and permission to modify'),
        body: text(
          'При выдаче ключа от ящика мастер сначала узнаёт сотрудника, потом смотрит, от какого ящика ему положен ключ. На сервере сначала получите проверенную сессию, потом разрешите менять только запись этого пользователя. Идентификатор пользователя приходит из сессии. Условие записи проверяет id и ownerId вместе, поэтому решение действует в момент изменения.',
          'Вақти додани калиди қуттӣ усто аввал кормандро мешиносад, баъд мебинад, ки ба вай калиди кадом қуттӣ мерасад. Дар сервер аввал session-и санҷида гиред. Баъд фақат сабти ҳамин корбар иваз шавад. ID-и корбар аз session меояд. Шарти сабт id ва ownerId-ро якҷоя месанҷад, барои ҳамин ҳангоми худи тағйир ҳам арзёбӣ мешавад.',
          'Before handing out a cabinet key, the workshop identifies the employee and checks which cabinet they may access. On the server, establish a verified session and allow changes only to that user’s record. The session supplies the user ID. The write checks both record ID and owner ID, so the permission condition still applies at the moment of change.',
        ),
        code: ownedRenameExample,
        language: 'ts',
      },
      {
        title: text('Кнопка сообщает, что выбрано', 'Тугма мегӯяд, ки чӣ интихоб шуд', 'The button reports the selection'),
        body: text(
          'Для кнопки можно задать props с заявкой и onRename: (id: number) => void. Клик сообщает родительскому компоненту, какую запись хотят изменить. Скрытие кнопки для чужой записи улучшает интерфейс. Серверу всё равно нужна проверка сессии и владельца при каждой защищённой записи.',
          'Props-и тугма дархост ва onRename: (id: number) => void дошта метавонад. Клик ба parent мегӯяд, ки кадом сабт бояд иваз шавад. Пинҳон кардани тугма барои сабти дигар кас UI-ро фаҳмо мекунад. Сервер барои ҳар тағйири муҳофизатшуда session ва соҳиби сабтро боз месанҷад.',
          'A button can have props for a repair and onRename: (id: number) => void. A click tells the parent which record the user wants to edit. Hiding the button for someone else’s record improves the interface. The server still checks the session and ownership for every protected write.',
        ),
        code: renameButton,
        language: 'tsx',
      },
      {
        title: text('Что должно остаться после ошибки', 'Баъди хато чӣ бояд бимонад', 'What should survive an error'),
        body: text(
          'Без сессии верните 401, для неверного тела верните 400. В этой модели нет различия между чужой и отсутствующей записью в наружном ответе: обе дают 404. Успех означает, что изменилась разрешённая запись. Проверьте её новым чтением, а затем убедитесь, что ошибочные запросы не изменили хранилище.',
          'Агар session нест, 401 диҳед. Агар body нодуруст аст, 400 диҳед. Дар ин мисол барои сабти каси дигар ва сабти набуда як ҷавоби 404 медиҳем. Муваффақият яъне сабти иҷозатдошта иваз шуд. Бо хониши нав санҷед ва бинед, ки request-и хато нигоҳдориро дигар накард.',
          'Return 401 for no session and 400 for invalid input. This example uses 404 for both a missing record and one outside the user’s ownership. Success means the authorized record changed. Confirm it with a fresh read, and check that rejected requests did not modify storage.',
        ),
      },
    ],
    questions: [
      quiz('nextjs-day-18-extra-fullstack', 0, 3,
        text('Как подтвердить, что изменение осталось в хранилище?', 'Чӣ хел бинем, ки тағйир дар нигоҳдорӣ монд?', 'How do you confirm an update persisted?'),
        [
          text('Прочитать ту же запись новым запросом.', 'Ҳамон сабтро бо request-и нав хондан.', 'Read the same record in a fresh request.'),
          text('Посмотреть на цвет кнопки после отправки.', 'Ранги тугмаро баъди фиристодан дидан.', 'Look at the button color after submission.'),
          text('Найти console.log внутри обработчика.', 'console.log-ро дар handler ёфтан.', 'Find a console.log in the handler.'),
        ],
        text('Смена интерфейса не показывает, что хранит сервер.', 'Аз тағйири UI маълум намешавад, ки сервер чӣ нигоҳ медорад.', 'A UI change does not tell you what the server stored.'),
      ),
      quiz('nextjs-day-18-extra-typescript', 0, 0,
        text('Проверит ли тип RecordInput тело HTTP-запроса?', 'Оё type-и RecordInput body-и HTTP request-ро месанҷад?', 'Will a RecordInput type check an HTTP request body?'),
        [
          text('Нет, форму и значения нужно проверить в runtime.', 'Не, шакл ва қиматро дар runtime санҷидан даркор.', 'No, check its shape and values at runtime.'),
          text('Да, тип преобразует пришедшее тело в нужный формат.', 'Ҳа, type body-ро ба формати лозим табдил медиҳад.', 'Yes, the type converts the body to the expected format.'),
          text('Да, если запрос пришёл из Client Component.', 'Ҳа, агар request аз Client Component ояд.', 'Yes, if it came from a Client Component.'),
        ],
        text('TypeScript проверяет ваш код до выполнения. Чужие данные появляются позже.', 'TypeScript кодро пеш аз иҷро месанҷад. Додаи берунӣ баъдтар меояд.', 'TypeScript checks the code before outside values arrive.'),
      ),
      quiz('nextjs-day-18-ts-1', 0, 2,
        text('Как описать props кнопки изменения?', 'Props-и тугмаи тағйирро чӣ хел менависем?', 'How should you type the rename button props?'),
        [
          text('Описать запись и callback с числовым id.', 'Сабт ва callback бо id-и рақамиро нависед.', 'Describe the record and a callback taking a numeric id.'),
          text('Назначить всем полям тип any.', 'Ба ҳар майдон type-и any монед.', 'Mark every prop as any.'),
          text('Записать функцию обработки клика в SQLite.', 'Функсияи click-ро дар SQLite сабт кунед.', 'Store the click handler in SQLite.'),
        ],
        text('Укажите, какие данные получает кнопка и какой аргумент сообщает родителю.', 'Гӯед, ки тугма чӣ мегирад ва ба parent кадом argument медиҳад.', 'State what the button receives and what it passes to the parent.'),
      ),
      quiz('nextjs-day-18-owner-from-session', 1, 1,
        text('Пользователь хочет изменить заявку. Откуда сервер берёт его id для проверки?', 'Корбар сабтро иваз кардан мехоҳад. Сервер id-и ӯро барои санҷиш аз куҷо мегирад?', 'A user wants to update a record. Where should the server get that user’s id?'),
        [
          text('Из ownerId в присланном JSON.', 'Аз ownerId дар JSON-и омада.', 'From ownerId in the submitted JSON.'),
          text('Из серверной проверенной сессии.', 'Аз session-и дар сервер санҷида.', 'From a verified server session.'),
          text('Из текста на кнопке формы.', 'Аз матни тугмаи форма.', 'From the text on the form button.'),
        ],
        text('Клиент управляет полями запроса. Сессия должна быть проверена на сервере.', 'Майдонҳои request аз тарафи client меоянд. Session дар сервер санҷида мешавад.', 'The client controls request fields. The server must verify the session.'),
      ),
    ],
    practice: {
      kind: 'code',
      task: text(
        '1. В отдельном файле напишите completeRepair. Функция получает уже проверенную сервером сессию или null, тело unknown и функцию записи.\n2. Принимайте только положительный целый id. Возвращайте 401 без сессии и 400 при плохом id.\n3. Передайте id и userId из сессии в функцию записи. Она должна обновлять запись при совпадении обоих полей. Верните 200 при изменении и 404 иначе.\n4. Проверьте собственную запись, запись другого владельца и запрос без сессии. Убедитесь, что отказ не меняет данные.',
        '1. Дар файли алоҳида completeRepair нависед. Функсия session-и аллакай дар сервер санҷида ё null, body-и unknown ва функсияи сабтро мегирад.\n2. Фақат id-и мусбати бутун қабул кунед. Бе session 401 ва барои id-и хато 400 диҳед.\n3. id ва userId-и session-ро ба функсияи сабт диҳед. Сабт фақат ҳангоми мувофиқати ҳар ду майдон дигар шавад. Агар иваз шуд 200 ва вагарна 404 диҳед.\n4. Сабти худӣ, сабти каси дигар ва request-и бе session-ро санҷед. Ҳангоми рад шудан дода дигар нашавад.',
        '1. In a separate file, write completeRepair. It receives a server-verified session or null, an unknown body and a write function.\n2. Accept only a positive integer id. Return 401 without a session and 400 for an invalid id.\n3. Pass id and the session userId to the write function. Its update must match both fields. Return 200 after a change and 404 otherwise.\n4. Check an owned record, another owner’s record and a missing session. Confirm rejected attempts leave data unchanged.',
      ),
      hint: text('Проверяйте сессию до изменения. Проверяющая функция хранилища должна принимать id и ownerId одновременно.', 'Пеш аз тағйир session-ро бинед. Функсияи нигоҳдорӣ id ва ownerId-ро якҷоя гирад.', 'Check the session before changing anything. The storage function should take both id and ownerId.'),
      solution: completeRepairSolution,
      criteria: [
        text('Нет записи без сессии или при неверном id.', 'Бе session ё бо id-и хато сабт намешавад.', 'There is no write without a session or with an invalid id.'),
        text('Проверка владельца использует id пользователя из сессии.', 'Соҳиби сабт бо id-и корбар аз session санҷида мешавад.', 'The ownership check uses the user id from the session.'),
        text('Тесты подтверждают коды ответа и состояние данных после отказа.', 'Тестҳо status code ва ҳолати дода баъди радро месанҷанд.', 'Checks verify response statuses and storage after rejection.'),
      ],
    },
  },
  19: {
    title: text('Ошибки, загрузка и интерфейс', 'Хато, loading ва интерфейс', 'Loading, errors and interface states'),
    summary: text(
      'Доработайте журнал ремонтов: покажите ожидание, пустой список и ошибку, затем добавьте повторное чтение.',
      'Журнали таъмирро пур кунед: интизорӣ, рӯйхати холӣ ва хаторо нишон диҳед, баъд аз нав хонданро илова кунед.',
      'Polish the repair log: show loading, an empty list and an error, then add a way to retry the read.',
    ),
    sections: [
      {
        title: text('Четыре состояния списка', 'Чор ҳолати рӯйхат', 'Four states for a list'),
        body: text(
          'В мастерской открывают журнал и ждут, пока найдут нужную страницу. «Ждём», «записей нет» и «не удалось открыть журнал» значат разное. Точно так же в приложении покажите loading до GET, пустое состояние после успешного ответа с [], список при наличии данных и ошибку при отказе запроса.',
          'Дар устохона журналро мекушоянд ва то ёфтани саҳифа интизор мешаванд. «Ҳоло мекобем», «сабт нест» ва «журнал кушода нашуд» маънои ҷудо доранд. Дар app то омадани GET loading, баъди ҷавоби муваффақ бо [] ҳолати холӣ, бо сабтҳо рӯйхат ва ҳангоми радшавии request хаторо нишон диҳед.',
          'A workshop opens its ledger and waits to find a page. Waiting, finding no entries and failing to open the ledger are different outcomes. An app can show loading during GET, an empty state after a successful [], a list when records exist, and an error when the request fails.',
        ),
        code: repairStateExample,
        language: 'tsx',
      },
      {
        title: text('Ошибка формы и ошибка маршрута', 'Хатои форма ва хатои route', 'A form error and a route error'),
        body: text(
          'Ожидаемая ошибка, например 400 для пустого названия, показывается рядом с формой. Оставьте введённый текст, чтобы его можно было исправить. Для неожиданного сбоя при отрисовке сегмента App Router используйте error.tsx. loading.tsx показывает временный интерфейс, пока загружается содержимое сегмента. После нажатия «Сохранить» индикатор отправки остаётся задачей формы.',
          'Хатои интизорӣ, мисли 400 барои номи холӣ, назди форма мебарояд. Матни input монад, то корбар ислоҳ кунад. Барои хатои ногаҳонии render-и қисми App Router аз error.tsx истифода баред. loading.tsx то бор шудани қисми route UI-и муваққатӣ нишон медиҳад. Ҳолати фиристодани «Сабт» бошад дар худи форма мемонад.',
          'Show an expected failure, such as a 400 for a blank title, next to the form and keep the user input. For unexpected rendering failures in an App Router segment, use error.tsx. A loading.tsx file can supply temporary UI while the segment loads. The form still handles pending feedback after a Save click.',
        ),
      },
      {
        title: text('Разделите загрузку и отображение', 'Хондан ва нишон доданро ҷудо кунед', 'Separate reading from rendering'),
        body: text(
          'Страница задаёт композицию, функция чтения отвечает за GET и проверку response.ok, а компонент списка отображает полученное состояние. При ошибке чтения кнопка повтора запускает только чтение. После сбоя записи оставьте пользователю явное решение: повторить отправку или исправить ввод. Повторять POST автоматически опасно, если сервер успел создать запись.',
          'Саҳифа қисмҳоро якҷоя мекунад. Функсияи хондан GET ва response.ok-ро идора мекунад, компоненти рӯйхат ҳолати тайёрро нишон медиҳад. Ҳангоми хатои хондан тугмаи такрор фақат GET-ро боз мекунад. Пас аз хатои сабт корбар метавонад матнро ислоҳ кунад ё худаш боз фиристад. POST-и худкор метавонад сабтро ду бор созад, агар сервер аввалашро қабул карда бошад.',
          'The page composes the feature, a read function owns GET and response.ok, and a list component renders the resulting state. A retry button on a read failure repeats only the read. After a write failure, let the user correct the input or decide whether to resubmit. An automatic POST retry can duplicate a record if the first write already succeeded.',
        ),
      },
      {
        title: text('Проверка задержки и восстановления', 'Санҷиши таъхир ва барқароршавӣ', 'Test waiting and recovery'),
        body: text(
          'Откройте журнал с пустой тестовой базой, затем добавьте запись и обновите страницу. Замедлите сеть, чтобы увидеть ожидание. Локально прервите чтение и попробуйте снова после восстановления. Проверьте, что индикатор исчезает, старое сообщение об ошибке убирается и успешный GET заново читает данные. Системные подробности ошибки можно оставить в логах.',
          'Журналро бо базаи санҷишии холӣ кушоед, баъд сабт илова карда, refresh кунед. Суръати шабакаро паст кунед, то loading намоён шавад. Дар маҳаллӣ хонданро қатъ кунед ва баъди барқароршавӣ боз санҷед. Бинед, ки loading ва хабари кӯҳнаи хато мераванд ва GET-и муваффақ додаҳоро боз мехонад. Детали техникии хаторо дар log мондан мумкин аст.',
          'Open the log with an empty test database, add a record and reload. Slow the network to observe loading. Interrupt a local read, restore it and try again. Verify the loading status disappears, the old error clears and a successful GET reads the records again. Technical error details can stay in logs.',
        ),
      },
    ],
    questions: [
      quiz('nextjs-day-19-extra-fullstack', 0, 3,
        text('Форма показала успех. Как проверить, что запись сохранилась?', 'Форма «сабт шуд» гуфт. Чӣ хел нигоҳдории сабтро санҷем?', 'The form reported success. How do you check the record persisted?'),
        [
          text('Получить ту же запись отдельным GET после обновления.', 'Ҳамон сабтро пас аз refresh бо GET-и алоҳида гирифтан.', 'Find the same record in a separate GET after reload.'),
          text('Посмотреть на цвет кнопки отправки.', 'Ранги тугмаи фиристоданро дидан.', 'Look at the submit button color.'),
          text('Найти запись в консоли до обновления.', 'Сабтро дар console пеш аз refresh дидан.', 'Find the record in the console before reload.'),
        ],
        text('Нужна новая операция чтения из хранилища.', 'Амали нави хондан аз ҷои нигоҳдорӣ даркор.', 'You need a fresh read from storage.'),
      ),
      quiz('nextjs-day-19-quiz-q356', 0, 2,
        text('Как разделить страницу журнала на понятные части?', 'Саҳифаи журналро ба қисмҳои фаҳмо чӣ хел ҷудо кунем?', 'How can you split the repair log into clear parts?'),
        [
          text('Страница собирает форму и список из отдельных компонентов.', 'Саҳифа форма ва рӯйхатро аз компонентҳои ҷудо ҷамъ мекунад.', 'The page composes separate form and list components.'),
          text('Один компонент хранит запросы, правила и всё отображение.', 'Як компонент request, қоида ва тамоми UI-ро нигоҳ медорад.', 'One component owns network calls, rules and all rendering.'),
          text('Каждую строку JSX переносим в новый компонент.', 'Ҳар сатри JSX-ро ба компоненти нав мегузаронем.', 'Move every JSX line into a separate component.'),
        ],
        text('Разделите разные роли, например ввод и чтение списка.', 'Вазифаҳои гуногунро ҷудо кунед, мисли input ва хониши рӯйхат.', 'Separate distinct jobs such as input and reading the list.'),
      ),
      quiz('nextjs-day-19-quiz-q357', 0, 2,
        text('Где держать правила проверки ответа GET?', 'Қоидаи санҷиши ҷавоби GET дар куҷо бошад?', 'Where should the GET response checks live?'),
        [
          text('В функции чтения, которая отдаёт интерфейсу понятный результат.', 'Дар функсияи хондан, ки ба UI натиҷаи фаҳмо медиҳад.', 'In the read function that gives the UI a clear result.'),
          text('В каждой строке таблицы, пока она рисуется.', 'Дар ҳар сатри ҷадвал ҳангоми render.', 'In every row while it renders.'),
          text('В текстовой подписи кнопки повтора.', 'Дар навиштаи тугмаи такрор.', 'In the text of the retry button.'),
        ],
        text('Строка списка получает данные, которые уже прочитаны.', 'Сатри рӯйхат додаи аллакай хондашударо мегирад.', 'A row receives data that has already been read.'),
      ),
      quiz('nextjs-day-19-empty-vs-error', 1, 0,
        text('GET успешно вернул []. Что показать?', 'GET муваффақ шуд ва [] дод. Чӣ нишон диҳем?', 'GET succeeded and returned []. What should appear?'),
        [
          text('Сообщение о сбое сети.', 'Хабари хатои шабака.', 'A network failure message.'),
          text('Сообщение «Записей пока нет».', 'Хабари «Ҳоло сабт нест».', 'A “No records yet” message.'),
          text('Индикатор загрузки, пока появится запись.', 'Loading то пайдо шудани сабт.', 'Keep loading until a record exists.'),
        ],
        text('Пустой массив пришёл в успешном ответе.', 'Массиви холӣ дар response-и муваффақ омад.', 'The empty array came back in a successful response.'),
      ),
    ],
    practice: {
      kind: 'code',
      task: text(
        '1. Создайте отдельную страницу app/repairs/page.tsx для чтения журнала из дня 17. Откройте её после записи на главной.\n2. Различайте loading, пустой массив, записи и ошибку.\n3. После ошибки дайте пользователю кнопку повтора GET. После удачного ответа уберите ошибку.\n4. Проверьте пустую базу, задержку, ошибку чтения и восстановление с сохранённой записью.',
        '1. Барои хондани журнали рӯзи 17 саҳифаи ҷудои app/repairs/page.tsx созед. Баъди сабт дар саҳифаи асосӣ онро кушоед.\n2. Loading, массиви холӣ, сабтҳо ва хаторо фарқ кунед.\n3. Баъди хато тугмаи такрори GET диҳед. Пас аз ҷавоби муваффақ хаторо гиред.\n4. Базаи холӣ, таъхир, хатои хониш ва барқарор шудан бо сабти тайёрро санҷед.',
        '1. Create a separate read-only page at app/repairs/page.tsx for the Day 17 log. Open it after saving from the home page.\n2. Distinguish loading, an empty array, saved rows and an error.\n3. Offer a GET retry after an error. Clear the error after the next successful read.\n4. Check an empty database, a delay, a read failure and recovery with a saved row.',
      ),
      hint: text('Повтор запускает ту же функцию GET. Состояние ошибки заменяется на loading до ответа.', 'Такрор ҳамон функсияи GET-ро иҷро мекунад. То омадани ҷавоб ба ҷойи хато loading меояд.', 'Retry calls the same GET. Replace the error with loading while waiting.'),
      solution: repairRetrySolution,
      criteria: [
        text('Пустой ответ, ожидание и ошибка показывают разные состояния.', 'Ҷавоби холӣ, интизорӣ ва хато як хел намебароянд.', 'An empty success, loading and a failure show distinct states.'),
        text('Повтор делает GET и убирает старую ошибку после успеха.', 'Такрор GET мекунад ва баъди муваффақ хатои кӯҳнаро мегирад.', 'Retry makes a GET and clears stale failure feedback after success.'),
        text('Сохранённые записи можно снова прочитать.', 'Сабтҳои нигоҳдоштаро боз хондан мешавад.', 'Saved records can be read again.'),
      ],
    },
  },
  20: {
    title: text('Деплой и презентация проекта', 'Deploy ва нишон додани проект', 'Deploy and present the project'),
    summary: text(
      'Запустите production-сборку локально, разберите проверку Preview и подготовьте README с фактическими результатами.',
      'Production build-ро маҳаллӣ сар кунед, санҷиши Preview-ро фаҳмед ва README бо натиҷаҳои воқеӣ тайёр кунед.',
      'Run the production build locally, plan a Preview check and prepare a README with evidence from checks you actually ran.',
    ),
    sections: [
      {
        title: text('Сборка и запуск результата', 'Build ва запуск-и натиҷа', 'Build and run the result'),
        body: text(
          'Мастер после ремонта заводит машину, а затем проверяет её под нагрузкой. С Next.js сначала соберите проект командой npm run build. Потом запустите npm run start, если в package.json настроен next start. Откройте главную страницу и проверьте отдельное чтение API. Скрипт ниже запускается с Node.js 24 как node scripts/check-release.mjs, пока сервер доступен по localhost:3000.',
          'Пас аз таъмир усто мошинро ба кор медарорад ва баъд дар роҳ месанҷад. Дар Next.js аввал npm run build кунед. Агар дар package.json next start гузошта шуда бошад, npm run start кунед. Саҳифаи асосӣ ва GET-и алоҳидаи API-ро бинед. Мисоли поёнро бо Node.js 24 ҳамчун node scripts/check-release.mjs иҷро кунед, вақте сервер дар localhost:3000 кор мекунад.',
          'A mechanic starts the repaired car and then tries it on the road. For Next.js, run npm run build first. Run npm run start afterward if package.json maps it to next start. Open the home page and read the API separately. Save the example as scripts/check-release.mjs and run node scripts/check-release.mjs with Node.js 24 while the server runs on localhost:3000.',
        ),
        code: localReleaseCheck,
        language: 'javascript',
      },
      {
        title: text('Preview, Production и хранилище', 'Preview, Production ва нигоҳдорӣ', 'Preview, Production and storage'),
        body: text(
          'На Vercel Preview подходит для проверки до выпуска основной версии. Сверьте проект, framework, команду сборки и настройки именно этого окружения. Учебный файл repairs.sqlite рассчитан на локальный сервер. Перед публикацией приложения, которое записывает данные, настройте постоянное хранилище для выбранного хостинга и проверьте, что данные переживают новую сборку.',
          'Дар Vercel Preview барои санҷиши пеш аз версияи асосӣ аст. Проект, framework, командаи build ва танзимоти ҳамин environment-ро бинед. Файли омӯзишии repairs.sqlite барои сервери маҳаллӣ аст. Пеш аз баровардани app-и сабткунанда, барои хостинги интихобшуда нигоҳдории доимӣ монед ва бинед, ки дода баъди build-и нав мемонад.',
          'A Vercel Preview lets you check an update before a Production release. Verify the project, framework, build command and settings for that environment. The practice repairs.sqlite file is for local use. Before publishing a writable deployment, configure persistent storage for its host and check that records survive a new release.',
        ),
      },
      {
        title: text('Куда идут переменные окружения', 'Environment variable ба куҷо меравад', 'Where environment variables go'),
        body: text(
          'Значения с NEXT_PUBLIC_ при использовании в клиентском коде могут попасть в JavaScript, собранный для браузера. В этом префиксе допустимо, например, публичное имя приложения. Пароль базы остаётся у сервера и задаётся в настройках окружения. Если меняете использованную в клиентском коде публичную переменную, пересоберите проект и проверьте новое значение.',
          'Қимати бо NEXT_PUBLIC_, агар дар коди client истифода шавад, метавонад ба JavaScript-и браузер равад. Масалан номи оммавии app дар ҳамин prefix мешавад. Пароли база дар сервер ва танзимоти environment мемонад. Агар variable-и оммавии дар client истифодашуда дигар шавад, build-и нав кунед ва қиматро бинед.',
          'A NEXT_PUBLIC_ value used in client code can be included in the JavaScript built for the browser. A public app name can use that prefix. A database password stays on the server and belongs in environment settings. If you change a public variable used in client code, rebuild and check the new value.',
        ),
      },
      {
        title: text('Короткая демонстрация с результатами', 'Демои кӯтоҳ бо натиҷаҳо', 'A short demo with evidence'),
        body: text(
          'В README укажите, кому нужен журнал, что сделали вы и как его запустить. На показе создайте одну вымышленную запись, обновите страницу и подтвердите, что она осталась. Затем покажите отказ для пустого ввода. Запишите результат, дату и среду проверки. Если работали только на localhost, так и укажите. Preview и Production проверяют отдельно по их URL, после чего записывают фактический результат.',
          'Дар README гӯед, ки журнал ба кӣ даркор, худатон чӣ сохтед ва чӣ хел запуск мешавад. Дар демо як сабти сохта созед, refresh кунед ва бинед, ки монд. Баъд рад шудани input-и холиро нишон диҳед. Натиҷа, рӯз ва environment-ро нависед. Агар фақат localhost буд, ҳаминро қайд кунед. Preview ва Production-ро аз URL-и худашон ҷудо санҷида, натиҷаро нависед.',
          'In the README, name who needs the log, what you built and how to run it. In the demo, create a fictional row, reload and confirm it stays. Then show a blank input rejection. Record the outcome, date and environment. If you only ran localhost checks, label those results accordingly. Check Preview and Production separately at their own URLs.',
        ),
      },
    ],
    questions: [
      quiz('nextjs-day-20-extra-deployment', 0, 2,
        text('Подходит ли NEXT_PUBLIC_ для пароля базы?', 'NEXT_PUBLIC_ барои пароли база мешавад?', 'Should a database password use NEXT_PUBLIC_?'),
        [
          text('Нет, публичное значение может попасть в JavaScript браузера.', 'Не, қимати оммавӣ ба JavaScript-и браузер рафта метавонад.', 'No. A public value can be included in browser JavaScript.'),
          text('Да, если имя переменной трудно угадать.', 'Ҳа, агар номи variable-ро ёфтан душвор бошад.', 'Yes, if the variable name is hard to guess.'),
          text('Да, если значение прописано внутри Client Component.', 'Ҳа, агар қимат дар Client Component навишта шавад.', 'Yes, if the value is set in a Client Component.'),
        ],
        text('Проверьте, в какой среде используется этот префикс.', 'Бинед, ки ин prefix ба кадом environment меравад.', 'Check which environment this prefix makes the value available to.'),
      ),
      quiz('nextjs-day-20-extra-portfolio', 0, 3,
        text('Что включить в описание проекта?', 'Дар тавсифи проект чӣ нависем?', 'What belongs in the project description?'),
        [
          text('Задачу, личный вклад, технические решения и реальные проверки.', 'Масъала, кори худ, қарорҳои техникӣ ва санҷишҳои воқеӣ.', 'The problem, your contribution, technical choices and checks you ran.'),
          text('Только перечень зависимостей.', 'Фақат рӯйхати dependency.', 'Only a list of dependencies.'),
          text('Результаты, которые пока не проверяли.', 'Натиҷаҳое, ки ҳоло санҷида нашуданд.', 'Outcomes that have not been checked yet.'),
        ],
        text('Читатель должен понять, что вы сделали и как это проверить.', 'Хонанда бояд фаҳмад, ки чӣ сохтед ва чӣ хел санҷад.', 'The reader needs to know what you made and how to verify it.'),
      ),
      quiz('nextjs-day-20-local-vs-hosted', 1, 1,
        text('Локальная сборка прошла. Что ещё нужно проверить перед выпуском?', 'Build-и маҳаллӣ гузашт. Пеш аз баровардан боз чиро месанҷем?', 'The local build passed. What should you check before releasing?'),
        [
          text('Только время, которое заняла сборка.', 'Фақат вақти build-ро.', 'Only how long the build took.'),
          text('Отдельный URL Preview, действие пользователя и повторное чтение.', 'URL-и Preview, кори корбар ва хониши такрориро ҷудо.', 'The Preview URL, a user action and a fresh read back.'),
          text('Только настройки команды сборки в package.json.', 'Фақат командаи build-ро дар package.json.', 'Only the build command in package.json.'),
        ],
        text('У хостинга свои настройки и хранилище.', 'Хостинг танзимот ва нигоҳдории худашро дорад.', 'The hosted environment has its own settings and storage.'),
      ),
    ],
    practice: {
      kind: 'written',
      task: text(
        '1. Соберите локальный журнал и запустите его production-сервер. Запишите команды, дату и итог.\n2. Выполните проверку страницы и отдельного GET. Через интерфейс сохраните вымышленную запись, обновите страницу и попробуйте пустое название.\n3. Добавьте в README описание задачи, ваш вклад и проверенные результаты. Отдельно перечислите, что нужно настроить для Preview.\n4. Подготовьте демонстрацию на одну минуту. Не публикуйте приложение без выбранного постоянного хранилища и проверки доступа.',
        '1. Журнали маҳаллиро build кунед ва production server-ро сар кунед. Команда, рӯз ва натиҷаро нависед.\n2. Саҳифа ва GET-и алоҳидаро санҷед. Аз UI як сабти сохта гузоред, refresh кунед ва номи холиро санҷед.\n3. Ба README масъала, кори худ ва натиҷаи санҷидашударо диҳед. Барои Preview танзимоти даркориро алоҳида нависед.\n4. Демои якдақиқагӣ тайёр кунед. То нигоҳдории доимӣ ва санҷиши иҷозат тайёр нест, app-ро нашр накунед.',
        '1. Build the local log and start its production server. Record the commands, date and outcome.\n2. Check the page and a separate GET. Save a fictional row in the UI, reload and try a blank title.\n3. In the README, explain the problem, your contribution and tested outcomes. List the work needed for Preview separately.\n4. Prepare a one-minute demo. Keep the app local until you have persistent storage and have tested access control.',
      ),
      hint: text('Для каждой проверки укажите среду, действие и наблюдаемый результат.', 'Барои ҳар санҷиш environment, амал ва натиҷаи дидашударо нависед.', 'For each check, record its environment, action and observed outcome.'),
      solution: releaseNotesAnswer.ru,
      referenceAnswer: releaseNotesAnswer,
      criteria: [
        text('Указаны реально выполненные команды и среда проверки.', 'Командаҳои воқеан иҷрошуда ва environment навишта шудаанд.', 'Actual commands and the test environment are recorded.'),
        text('Демо подтверждает повторное чтение и показывает отказ для пустого ввода.', 'Демо аз нав хондан ва рад шудани input-и холиро нишон медиҳад.', 'The demo shows a read-back and rejection of blank input.'),
        text('README отделяет подтверждённые результаты от будущего Preview.', 'README натиҷаи тасдиқшударо аз Preview-и оянда ҷудо мекунад.', 'The README distinguishes confirmed evidence from future Preview checks.'),
      ],
    },
  },
};

// This is the 20-day Next.js/portfolio curriculum already authored for month 3.
// Reuse its actual explanations and exercises; do not invent ten filler days.
const curriculum = CURRICULUM.find((month) => month.month === 3);
if (!curriculum) throw new Error('The Next.js curriculum is missing.');
const days = curriculum.weeks.flatMap((week) => week.days);
const localized = (value: string) => ({ ru: value, tg: value });

const startingLessons: Partial<
  Record<
    number,
    {
      title: LessonText;
      summary: LessonText;
      sections: Pick<Lesson['sections'][number], 'title' | 'body'>[];
      question: Pick<Lesson['questions'][number], 'question' | 'options'>;
      interview?: Lesson['interview'];
      practice: Pick<NonNullable<Lesson['practice']>, 'task' | 'hint' | 'criteria'> &
        Partial<Pick<NonNullable<Lesson['practice']>, 'solution' | 'referenceAnswer' | 'kind'>>;
    }
  >
> = {
  ...NEXTJS_FOUNDATIONS,
  1: {
    title: text('Next.js и способы рендера', 'Next.js ва роҳҳои render', 'Next.js rendering'),
    summary: text(
      'Определите, где и когда готовится страница.',
      'Бифаҳмед, ки саҳифа дар куҷо ва кай тайёр мешавад.',
      'Find out where and when a page is prepared.',
    ),
    sections: [
      {
        title: text('Что такое Next.js', 'Next.js чист?', 'What is Next.js?'),
        body: text(
          'Next.js — фреймворк на React. React описывает интерфейс компонентами, а Next.js организует страницы, маршруты и работу на сервере. Он может подготовить HTML заранее или при запросе. Интерактивные части, например кнопка, работают в браузере.',
          'Next.js фреймворки болои React аст. React интерфейсро аз компонентҳо месозад. Next.js саҳифа, route ва кори серверро тартиб медиҳад. HTML пешакӣ ё вақти request тайёр мешавад. Қисми интерактивӣ, масалан тугма, дар браузер кор мекунад.',
          'Next.js is a framework built on React. React describes the UI with components, while Next.js organizes pages, routes, and server work. It can prepare HTML ahead of time or on a request. Interactive parts such as buttons run in the browser.',
        ),
      },
      {
        title: text('Когда готовится страница', 'Саҳифа кай тайёр мешавад?', 'When the page is prepared'),
        body: text(
          'SSR готовит страницу на сервере при запросе. SSG собирает её заранее, например для стабильной страницы «О нас». ISR позволяет обновить заранее подготовленную страницу. CSR строит нужную часть интерфейса в браузере, например после загрузки данных.',
          'SSR саҳифаро дар сервер вақти request месозад. SSG пешакӣ тайёр мекунад, мисли саҳифаи «Дар бораи мо». ISR имкон медиҳад нусхаи тайёр нав шавад. CSR қисми лозими интерфейсро дар браузер месозад, масалан баъди омадани маълумот.',
          'SSR prepares a page on the server for a request. SSG builds it ahead of time, for example a stable About page. ISR can update a prebuilt page. CSR builds a part of the UI in the browser, such as after loading data.',
        ),
      },
    ],
    question: {
      question: text('Чем SSR отличается от SSG?', 'SSR ва SSG аз чӣ фарқ мекунанд?', 'How does SSR differ from SSG?'),
      options: [
        text('SSR готовит страницу по запросу, SSG — заранее.', 'SSR вақти request месозад, SSG пешакӣ.', 'SSR renders on request, SSG prepares the page ahead of time.'),
        text('Оба выполняются только в браузере.', 'Ҳар ду фақат дар браузер кор мекунанд.', 'Both render only in the browser.'),
        text('SSG записывает каждый клик в базу.', 'SSG ҳар кликро ба база менависад.', 'SSG records each click in the database.'),
      ],
    },
    interview: {
      id: 'nextjs-day-01-written',
      question: text('Как сокращённо называется генерация страницы заранее при сборке?', 'Сохтани саҳифа пешакӣ вақти build кӯтоҳ чӣ ном дорад?', 'Which abbreviation describes generating a page at build time?'),
      answer: text('SSG', 'SSG', 'SSG'),
      acceptedAnswers: ['static site generation', 'статическая генерация'],
    },
    practice: {
      task: text(
        'Откройте простую страницу About из примера и измените её заголовок. Затем выберите способ подготовки для страницы расписания, которую редко меняют, и страницы с остатком товара на каждый запрос. Объясните оба выбора.',
        'Саҳифаи About-и мисолро кушоед ва сарлавҳаашро иваз кунед. Баъд барои саҳифаи ҷадвали камтағйир ва саҳифаи захираи мол барои ҳар request роҳи тайёршавиро интихоб кунед. Ҳар ду интихобро фаҳмонед.',
        'Open the About page from the example and change its heading. Then choose how to render a rarely updated schedule and an inventory page that must reflect stock on each request. Explain both choices.',
      ),
      hint: text(
        'Сначала решите, какие данные известны при сборке, а какие нужно читать для каждого запроса.',
        'Аввал муайян кунед, кадом дода вақти build маълум аст ва кадомашро барои ҳар request хондан даркор.',
        'Decide which data is known at build time and which needs to be read on each request.',
      ),
      solution: `// app/about/page.tsx
export default function AboutPage() {
  return <main><h1>Library hours</h1></main>;
}`,
      referenceAnswer: text(
        'Редко меняющееся расписание можно собрать заранее. Страницу с актуальным остатком готовьте при запросе, если на каждый запрос нужны свежие данные.',
        'Ҷадвали камтағйирро пешакӣ сохтан мумкин. Агар захираи нав барои ҳар request лозим бошад, саҳифаи онро вақти request тайёр кунед.',
        'Build the rarely updated schedule ahead of time. Render the inventory page on request when every request needs current stock.',
      ),
      criteria: [
        text('Страница показывает новый заголовок.', 'Саҳифа сарлавҳаи навро нишон медиҳад.', 'The page shows the new heading.'),
        text('Для каждого примера объяснено время подготовки страницы.', 'Барои ҳар мисол вақти тайёр шудани саҳифа шарҳ дода шудааст.', 'Each choice explains when the page will be prepared.'),
      ],
    },
  },
  2: {
    title: text('App Router и файлы маршрута', 'App Router ва файлҳои route', 'App Router and route files'),
    summary: text(
      'Свяжите адрес с папкой и разделите общий интерфейс и страницу.',
      'Адресро бо папка пайваст кунед ва қисми умумиро аз саҳифа ҷудо кунед.',
      'Map a URL to a folder and separate the shared layout from the page.',
    ),
    sections: [
      {
        title: text('Что такое App Router', 'App Router чист?', 'What is the App Router?'),
        body: text(
          'App Router связывает адреса с файлами в app. Папка products задаёт часть пути, а products/page.tsx делает /products страницей. layout.tsx добавляет общую оболочку, например меню для нескольких страниц.',
          'App Router адресҳоро бо файлҳои app мепайвандад. Папкаи products қисми адрес аст ва products/page.tsx саҳифаи /products-ро мекушояд. layout.tsx қисми умумӣ медиҳад, мисли меню барои чанд саҳифа.',
          'The App Router maps URLs to files in app. The products folder names the path segment, and products/page.tsx makes /products a page. A layout.tsx file can share navigation across several pages.',
        ),
      },
      {
        title: text('Ожидание и ошибка маршрута', 'Интизорӣ ва хатои route', 'Waiting and route errors'),
        body: text(
          'loading.tsx даёт временный экран, пока контент ещё готовится. error.tsx показывает запасной экран при ошибке рендера части маршрута. При навигации через Link общий layout может остаться на месте.',
          'loading.tsx вақти тайёр шудани content намоиши муваққатӣ медиҳад. error.tsx ҳангоми хатои render дар қисми route экрани дигар нишон медиҳад. Бо Link гузарӣ, layout-и умумӣ метавонад дар ҷояш монад.',
          'loading.tsx shows temporary content while the page is being prepared. error.tsx provides a fallback when rendering a route segment fails. Shared layouts can stay mounted when you navigate with Link.',
        ),
      },
    ],
    question: {
      question: text('Какой адрес открывает app/products/page.tsx?', 'app/products/page.tsx кадом URL-ро мекушояд?', 'Which URL does app/products/page.tsx serve?'),
      options: [
        text('/products', '/products', '/products'),
        text('/app/products/page.tsx', '/app/products/page.tsx', '/app/products/page.tsx'),
        text('Адрес появляется после useEffect.', 'Адрес баъди useEffect пайдо мешавад.', 'The URL appears after useEffect.'),
      ],
    },
    interview: {
      id: 'nextjs-day-02-written',
      question: text('Как называется файл общего меню для нескольких страниц App Router?', 'Файли менюи умумӣ барои чанд саҳифаи App Router чӣ ном дорад?', 'Which App Router file can share a menu across pages?'),
      answer: text('layout.tsx', 'layout.tsx', 'layout.tsx'),
      acceptedAnswers: ['layout.js', 'layout.jsx', 'app/layout.tsx', 'layout'],
      caseSensitive: true,
    },
    practice: {
      task: text(
        'По образцу /products создайте страницу /books. Добавьте ссылку на неё в общий layout и ссылку обратно на главную. Проверьте прямой адрес, переход по ссылке и обновление страницы.',
        'Аз рӯйи мисоли /products саҳифаи /books созед. Линкашро дар layout-и умумӣ монед ва аз /books ба асосӣ линк диҳед. Адреси рост, гузаштан аз линк ва reload-ро санҷед.',
        'Use /products as a reference to make a /books page. Link to it from the shared layout and link back to the homepage. Test the direct URL, the link, and a refresh.',
      ),
      hint: text(
        'Имя папки задаёт часть URL, а page.tsx определяет страницу. Общая навигация живёт в layout.tsx.',
        'Номи папка қисми URL-ро медиҳад, page.tsx саҳифаро муайян мекунад. Менюи умумӣ дар layout.tsx мемонад.',
        'The folder name sets the URL segment, and page.tsx defines the page. Shared navigation lives in layout.tsx.',
      ),
      solution: `// app/books/page.tsx
import Link from 'next/link';

export default function BooksPage() {
  return <main><h1>Books</h1><Link href="/">Home</Link></main>;
}

// app/layout.tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><nav><Link href="/books">Books</Link></nav>{children}</body></html>;
}`,
      criteria: [
        text('Книги открываются по /books напрямую и после обновления.', '/books бевосита ва баъди reload мекушояд.', '/books works directly and after refresh.'),
        text('Ссылка доступна из общего меню.', 'Линк дар менюи умумӣ ҳаст.', 'The link is available in the shared menu.'),
      ],
    },
  },
  3: {
    title: text('Server и Client Components', 'Server ва Client Component', 'Server and Client Components'),
    summary: text(
      'Оставьте чтение данных на сервере, а интерактивность в нужном компоненте.',
      'Хондани додаҳоро дар сервер монед, қисми интерактивиро ҷудо кунед.',
      'Keep data reading on the server and isolate the interactive part.',
    ),
    sections: [
      {
        title: text('Серверный и клиентский компонент', 'Компоненти серверӣ ва клиентӣ', 'Server and client components'),
        body: text(
          'В App Router страницы и layout по умолчанию серверные. Серверный компонент может прочитать записи, не отправляя браузеру код базы. Компонент со счётчиком, useState и onClick должен оказаться на клиентской стороне.',
          'Дар App Router саҳифа ва layout одатан дар сервер кор мекунанд. Компоненти серверӣ сабтҳоро мехонад, коди база ба браузер намеравад. Компоненти ҳисобкунак бо useState ва onClick ба қисми клиентӣ дохил мешавад.',
          'App Router pages and layouts are server components by default. A server component can read records without sending database code to the browser. A counter that uses useState and onClick belongs in the client component tree.',
        ),
      },
      {
        title: text('Где поставить use client', 'use client-ро куҷо мемонем?', 'Where to put use client'),
        body: text(
          'Директива "use client" в начале файла обозначает вход в клиентскую часть. Поместите её в небольшой интерактивный компонент, а данные передайте ему через props. После гидратации React подключит обработчик кнопки в браузере.',
          '"use client" дар аввали файл даромад ба қисми клиентиро муайян мекунад. Онро дар компоненти хурди интерактивӣ монед ва додаҳоро бо props диҳед. Пас аз hydration React handler-и тугмаро дар браузер пайваст мекунад.',
          'A "use client" directive at the top of a file marks an entry to the client component tree. Put it in the small interactive component and pass data as props. React attaches the button handler in the browser during hydration.',
        ),
      },
    ],
    question: {
      question: text('Что требуется компоненту с useState и onClick?', 'Ба компоненти useState ва onClick чӣ лозим аст?', 'What does a component with useState and onClick need?'),
      options: [
        text('Вход в клиентскую часть с use client.', 'Даромад ба қисми клиентӣ бо use client.', 'An entry to the client tree marked with use client.'),
        text('Базу данных в браузере.', 'База дар браузер.', 'A database inside the browser.'),
        text('use server в каждом файле.', 'use server дар ҳар файл.', 'use server in every file.'),
      ],
    },
    interview: {
      id: 'nextjs-day-03-written',
      question: text('Какую директиву пишут в начале файла клиентской точки входа?', 'Аввали файли даромади Client Component кадом directive-ро менависӣ?', 'Which directive marks a client component entry file?'),
      answer: text('use client', 'use client', 'use client'),
      acceptedAnswers: ['"use client"', "'use client'", '"use client";', "'use client';"],
      caseSensitive: true,
    },
    practice: {
      task: text(
        'Оставьте заголовок списка чтения в серверной странице. Создайте рядом небольшой клиентский счётчик с начальным числом 2 из props. Нажатие добавляет одну книгу, а заголовок остаётся прежним.',
        'Сарлавҳаи рӯйхати китобҳоро дар саҳифаи серверӣ монед. Компоненти хурди client созед, ки аз props бо 2 сар кунад. Пахш як китоб илова мекунад, сарлавҳа ҳамон мемонад.',
        'Keep the reading list heading in the server page. Add a small client counter that starts at 2 from props. Clicking it adds one book and leaves the heading as it was.',
      ),
      hint: text(
        'Поместите use client в файл счётчика. Серверная страница передаёт начальное значение числом.',
        'use client-ро дар файли ҳисобкунак монед. Саҳифаи серверӣ қимати аввалро ҳамчун адад медиҳад.',
        'Put use client in the counter file. Pass a number from the server page as its initial value.',
      ),
      solution: `// app/reading/page.tsx
import ReadingCounter from './reading-counter';

export default function ReadingPage() {
  return <main><h1>Reading list</h1><ReadingCounter initialCount={2} /></main>;
}

// app/reading/reading-counter.tsx
'use client';

import { useState } from 'react';

export default function ReadingCounter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  return (
    <button type="button" onClick={() => setCount((previous) => previous + 1)}>
      Books: {count}
    </button>
  );
}`,
      criteria: [
        text('После одного клика счётчик показывает 3.', 'Баъди як пахш ҳисобкунак 3 нишон медиҳад.', 'The count shows 3 after one click.'),
        text('Серверная страница передаёт число клиентскому компоненту.', 'Саҳифаи сервер ба компоненти client адад медиҳад.', 'The server page passes a number to the client component.'),
      ],
    },
  },
};

const lessons: CourseContent['lessons'] = days.map((day, index) => {
  const dayNumber = index + 1;
  const details = authoredLessons[dayNumber];
  if (details) {
    return {
      id: `nextjs-day-${String(dayNumber).padStart(2, '0')}`,
      day: dayNumber,
      prerequisiteDays: [index],
      level: 'intermediate',
      sourceIds: dayNumber <= 15 || dayNumber === 19 ? ['nextjs-docs', 'react-docs'] : ['nextjs-docs'],
      ...details,
    };
  }
  const topics = day.topicIds
    .map(getTopic)
    .filter((topic): topic is LearningTopic => Boolean(topic));
  const opening = startingLessons[dayNumber];
  const review = NEXTJS_FOUNDATION_REVIEW[dayNumber];
  const sections: CourseContent['lessons'][number]['sections'] = topics.flatMap((topic) =>
    topic.explanation.map((part, partIndex) => ({
      title: localized(part.title || topic.titleRu),
      body: localized(part.text || topic.title),
      ...(partIndex === 0 && topic.code[0] ? { code: topic.code[0], language: 'tsx' } : {}),
    })),
  );
  if (!sections.length) {
    sections.push({
      title: localized(day.titleRu),
      body: localized(day.tags.join(' · ') || day.title),
    });
  }
  const selectedQuestions = new Map(
    topics
      .flatMap((topic) => questionsForTopic(topic.id))
      .filter((question) => question.options.length >= 2)
      .map((question) => [question.id, question]),
  );
  const questions = [...selectedQuestions.values()].slice(0, 3).map((question, questionIndex) => {
    const copy = questionIndex === 0 ? opening?.question : undefined;
    const correctIndex = Math.max(0, question.options.indexOf(question.answer));
    return {
      id: `nextjs-day-${String(dayNumber).padStart(2, '0')}-${question.id}`,
      question: copy?.question ?? localized(question.question),
      answer: copy?.options[correctIndex] ?? localized(question.answer),
      options: copy?.options ?? question.options.map(localized),
      correctIndex,
      ...(questionIndex === 0 ? review?.firstQuestion : undefined),
    };
  });
  const practiceSteps = topics.flatMap((topic) => topic.flow).slice(0, 8);
  const solution = topics
    .map((topic) => topic.code[0])
    .filter(Boolean)
    .join('\n\n');
  return {
    id: `nextjs-day-${String(dayNumber).padStart(2, '0')}`,
    day: dayNumber,
    prerequisiteDays: index === 0 ? [] : [index],
    title: opening?.title ?? localized(day.titleRu),
    summary: opening?.summary ?? localized(day.tags.join(' · ') || day.title),
    level: index < 10 ? 'beginner' : 'intermediate',
    sourceIds: topics.some((topic) => topic.id.startsWith('topic-'))
      ? ['nextjs-docs', 'react-docs']
      : ['nextjs-docs'],
    sections: [
      ...sections.map((section, sectionIndex) => ({
        ...section,
        ...opening?.sections[sectionIndex],
      })),
      ...(review?.sections ?? []),
    ],
    questions: [...questions, ...(review?.questions ?? [])],
    interview: opening?.interview,
    practice: {
      task: localized(
        `${day.titleRu}\n\n${practiceSteps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join('\n')}`,
      ),
      hint: localized(topics[0]?.explanation[0]?.text || day.title),
      solution: solution || '// Follow the steps and apply them in your Next.js project.',
      criteria: [
        localized('Мисоли ҳамин рӯзро иҷро ва натиҷаро санҷед.'),
        localized('Фарқи коди пешина ва коди имрӯзаро фаҳмонед.'),
        localized('Хато, loading ва ҳолати холиро агар лозим бошад, тафтиш кунед.'),
      ],
      ...opening?.practice,
    },
  };
});

const content: CourseContent = {
  courseId: 'nextjs',
  sources: [
    { id: 'nextjs-docs', title: 'Next.js Documentation', url: 'https://nextjs.org/docs' },
    { id: 'react-docs', title: 'React Documentation', url: 'https://react.dev/learn' },
  ],
  files: [],
  lessons,
};
export default content;
