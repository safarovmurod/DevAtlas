import type { PracticeExercise } from './practice';

// Five small React projects for the «local practice» topic: Todo, Modal,
// Tabs, Counter and Accordion. Each has a reference solution and checks.

/** Reference solutions, in the same order as localSpecs. */
const localCode = [
  `import { useState } from 'react';
type Todo = { id: number; text: string };
export default function TodoPage() {
  const [items, setItems] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  function handleAdd() {
    if (!text.trim()) return;
    setItems([...items, { id: Date.now(), text: text.trim() }]);
    setText('');
  }
  function handleDelete(id: number) {
    setItems(items.filter(item => item.id !== id));
  }
  return <main>
    <input value={text} onChange={event => setText(event.target.value)} />
    <button onClick={handleAdd}>Илова</button>
    {items.map(item => <div key={item.id}>{item.text}
      <button onClick={() => handleDelete(item.id)}>Удалить</button>
    </div>)}
  </main>;
}`,
  `import { useState } from 'react';
export default function ModalPage() {
  const [open, setOpen] = useState(false);
  return <main>
    <button onClick={() => setOpen(true)}>Кушо</button>
    {open && <section role="dialog" aria-modal="true" aria-label="Маълумот">
      <h2>Маълумот</h2>
      <button onClick={() => setOpen(false)}>Пӯш</button>
    </section>}
  </main>;
}`,
  `import { useState } from 'react';
const tabs = [{ id: 1, title: 'React', text: 'Компонент ва state' },
  { id: 2, title: 'TypeScript', text: 'Типи маълумот' }];
export default function TabsPage() {
  const [activeId, setActiveId] = useState(1);
  const active = tabs.find(item => item.id === activeId);
  return <main>{tabs.map(item =>
    <button key={item.id} onClick={() => setActiveId(item.id)}
      aria-pressed={activeId === item.id}>{item.title}</button>)}
    <p>{active?.text}</p>
  </main>;
}`,
  `import { useState } from 'react';
export default function CounterPage() {
  const [count, setCount] = useState(0);
  function handleAdd() { setCount(prev => prev + 1); }
  function handleRemove() { setCount(prev => Math.max(0, prev - 1)); }
  return <main><p>{count}</p><button onClick={handleAdd}>+</button>
    <button onClick={handleRemove}>−</button>
    <button onClick={() => setCount(0)}>Аз нав</button></main>;
}`,
  `import { useState } from 'react';
const items = [{ id: 1, title: 'Props?', text: 'Маълумот аз parent.' },
  { id: 2, title: 'State?', text: 'Памяти компонент.' }];
export default function AccordionPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  function handleToggle(id: number) {
    setOpenId(openId === id ? null : id);
  }
  return <main>{items.map(item => <section key={item.id}>
    <button aria-expanded={openId === item.id}
      onClick={() => handleToggle(item.id)}>{item.title}</button>
    {openId === item.id && <p>{item.text}</p>}
  </section>)}</main>;
}`,
];
const localSpecs = [
  {
    title: 'Todo: add / delete',
    task: 'Рӯйхати вазифаҳо соз. Input controlled бошад. Илова input-ро холӣ кунад. Delete танҳо id-и интихобшударо нест кунад.',
    criteria: [
      'Input холӣ бошад — чизе илова нашавад.',
      '2 вазифа илова кун, аввалашро нест кун: дуюмаш монад.',
      'State дар ҳамин компонент, бо useState нигоҳ дошта шавад.',
    ],
  },
  {
    title: 'Modal: open / close',
    task: 'Бо як boolean модалкаро кушо ва пӯш. Open=true нишон медиҳад; Close=false мебандад.',
    criteria: [
      'Дар render-и аввал модалка набошад.',
      'Click ба Кушо: modal намоён шавад.',
      'Click ба Пӯш: modal аз DOM барояд.',
    ],
  },
  {
    title: 'Tabs: activeId',
    task: '2 вкладка соз. activeId танҳо id-и интихобшударо нигоҳ дорад. Матнро бо find гир.',
    criteria: [
      'Аввал React фаъол бошад.',
      'Click ба TypeScript: танҳо матни TypeScript барояд.',
      'Click state-ро иваз кунад; useEffect лозим нест.',
    ],
  },
  {
    title: 'Counter: prev + 1',
    task: 'Счётчик соз: зиёд кардан, кам кардан ва reset. Қимат аз 0 паст нашавад.',
    criteria: ['0 → click + → 1.', '1 → click − → 0; боз − ҳам 0.', 'Reset аз ҳар қимат 0 кунад.'],
  },
  {
    title: 'Accordion: openId',
    task: 'Аккордеон соз: як вақт танҳо як ҷавоб кушода бошад. Click-и такрорӣ ҳамон ҷавобро пӯшад.',
    criteria: [
      'Аввал ҳама пӯшида.',
      'Click 1 → ҷавоби 1; click 2 → танҳо ҷавоби 2.',
      'Боз click 2 → openId=null.',
    ],
  },
];
export const LOCAL_PROJECTS: PracticeExercise[] = localSpecs.map((spec, index) => ({
  ...spec,
  id: 'local-project-' + (index + 1),
  starter: '// src/pages/PracticePage.tsx\n// Компонент, state ва handler-ҳоро навис.\n',
  solution: localCode[index],
  hint: [
    'useState → input → handleAdd → [...items, item]; delete → filter.',
    'open=false → click → setOpen(true) → render → modal.',
    'activeId → find → active.text.',
    'Қимати пешина лозим: setCount(prev => prev + 1).',
    'openId === id бошад null мон, набошад id-и нав.',
  ][index],
  files: ['src/pages/PracticePage.tsx', 'src/App.tsx'],
}));
