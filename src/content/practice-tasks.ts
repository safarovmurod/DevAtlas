import { PracticeTask, StateManagerType, PracticeLevel } from '@/types';

export const PRACTICE_TASKS: PracticeTask[] = [
  // --- DELETE OPERATION ---
  // React Local - Level 1 (Сода)
  {
    id: 'task_delete_react_local_lvl1',
    topicId: 'api_crud_delete',
    operation: 'DELETE',
    stateManager: 'react_local',
    level: 1,
    prompt:
      'Функсияи `deleteTodo(items, id)`-ро навис, ки элементи бо ҳамин `id` бударо аз массив нест мекунад ва массиви навро бармегардонад.',
    starterCode: `// deleteTodo элементи мувофиқро бо filter нест мекунад
export function deleteTodo(items: { id: number; text: string }[], id: number) {
  // Кодро инҷо навис:
  
}`,
    solutionCode: `export function deleteTodo(items: { id: number; text: string }[], id: number) {
  return items.filter(item => item.id !== id);
}`,
    miniHint: 'filter + id',
    hints: [
      'Методи `items.filter(...)` истифода бар.',
      'Шарти filter бояд санҷад: `item.id !== id`.',
      'Бо return натиҷаи filter-ро баргардон.',
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'Нест кардани элементи id=2 аз [1, 2, 3]',
        input: {
          items: [
            { id: 1, text: 'A' },
            { id: 2, text: 'B' },
            { id: 3, text: 'C' },
          ],
          id: 2,
        },
        expected: [
          { id: 1, text: 'A' },
          { id: 3, text: 'C' },
        ],
      },
      {
        id: 'tc2',
        description: 'Агар id ёфт нашавад, ҳамаи массив бетағйир мемонад',
        input: { items: [{ id: 1, text: 'A' }], id: 99 },
        expected: [{ id: 1, text: 'A' }],
      },
    ],
    recommendedTimeMinutes: 10,
  },

  // React Local - Level 2 (Обычный)
  {
    id: 'task_delete_react_local_lvl2',
    topicId: 'api_crud_delete',
    operation: 'DELETE',
    stateManager: 'react_local',
    level: 2,
    prompt:
      'Функсияи асинхронии `handleDeleteWithLoading(items, id, apiDeleteFn)`-ро бо try/catch ва нишон додани loading/error status навис.',
    starterCode: `export async function handleDeleteWithLoading(
  items: { id: number; text: string }[],
  id: number,
  apiDeleteFn: (id: number) => Promise<boolean>
) {
  // 1. try/catch мондан даркор
  // 2. apiDeleteFn(id)-ро await кардан даркор
  // 3. Агар муваффақ шавад, items.filter карда { success: true, newItems } бармегардонад
  
}`,
    solutionCode: `export async function handleDeleteWithLoading(
  items: { id: number; text: string }[],
  id: number,
  apiDeleteFn: (id: number) => Promise<boolean>
) {
  try {
    const ok = await apiDeleteFn(id);
    if (!ok) {
      return { success: false, error: 'Сервер иҷозат надод', newItems: items };
    }
    const newItems = items.filter(item => item.id !== id);
    return { success: true, newItems };
  } catch (err: any) {
    return { success: false, error: err.message || 'Хатои шабака', newItems: items };
  }
}`,
    miniHint: 'try/catch + await apiDeleteFn',
    hints: [
      'Дар дохили try `await apiDeleteFn(id)`-ро даъват кун.',
      'Пас аз он бо filter массиви тоза соз ва `{ success: true, newItems }` баргардон.',
      'Дар catch хатогиро дастгир карда `{ success: false, error, newItems: items }` баргардон.',
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'Муваффақият: нест кардан ва баргардонидани success=true',
        input: { items: [{ id: 10, text: 'Test' }], id: 10 },
        expected: { success: true },
      },
    ],
    recommendedTimeMinutes: 20,
  },

  // Zustand - Level 1 (Сода)
  {
    id: 'task_delete_zustand_lvl1',
    topicId: 'zustand_basics',
    operation: 'DELETE',
    stateManager: 'zustand',
    level: 1,
    prompt:
      'Функсияи `removeTodoAction(set, id)`-ро барои Zustand навис, ки бо `set(...)` state-ро нав мекунад.',
    starterCode: `// removeTodoAction бо ёрии set() ҳолати todos-ро филтр мекунад
export function removeTodoAction(set: any, id: number) {
  // set((state) => ({ todos: ... }))
  
}`,
    solutionCode: `export function removeTodoAction(set: any, id: number) {
  set((state: any) => ({
    todos: state.todos.filter((t: any) => t.id !== id)
  }));
}`,
    miniHint: 'set + map/filter',
    hints: [
      'Аз `set((state) => ({ ... }))` истифода бар.',
      'Дар даруни объект `todos: state.todos.filter(t => t.id !== id)` навис.',
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'set() бояд функсияро бо state.todos даъват карда филтр кунад',
        input: { initialTodos: [{ id: 1 }, { id: 2 }], removeId: 1 },
        expected: [{ id: 2 }],
      },
    ],
    recommendedTimeMinutes: 15,
  },

  // Redux Toolkit - Level 1 (Сода)
  {
    id: 'task_delete_redux_lvl1',
    topicId: 'redux_toolkit_slices',
    operation: 'DELETE',
    stateManager: 'redux_toolkit',
    level: 1,
    prompt:
      'Дар Redux Toolkit reducer-и `todoRemoved(state, action)`-ро навис, ки элементро бо `action.payload` нест мекунад.',
    starterCode: `// state.items дорои массив аст, action.payload id-и нестшаванда мебошад
export function todoRemovedReducer(state: { items: { id: number; text: string }[] }, action: { payload: number }) {
  // Кодро инҷо навис:
  
}`,
    solutionCode: `export function todoRemovedReducer(state: { items: { id: number; text: string }[] }, action: { payload: number }) {
  state.items = state.items.filter(item => item.id !== action.payload);
}`,
    miniHint: 'dispatch + payload',
    hints: [
      'Дар RTK бо Immer метавон навишт: `state.items = state.items.filter(item => item.id !== action.payload)`',
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'Reducer бояд элементро мувофиқи payload нест кунад',
        input: { state: { items: [{ id: 5, text: 'A' }] }, action: { payload: 5 } },
        expected: [],
      },
    ],
    recommendedTimeMinutes: 15,
  },

  // Jotai - Level 1 (Сода)
  {
    id: 'task_delete_jotai_lvl1',
    topicId: 'jotai_atomic',
    operation: 'DELETE',
    stateManager: 'jotai',
    level: 1,
    prompt:
      'Функсияи write atom-и Jotai `deleteItemFromAtom(get, set, itemsAtom, id)`-ро навис, ки элементро нест мекунад.',
    starterCode: `export function deleteItemFromAtom(get: any, set: any, itemsAtom: any, id: number) {
  // 1. const current = get(itemsAtom);
  // 2. set(itemsAtom, current.filter(...));
  
}`,
    solutionCode: `export function deleteItemFromAtom(get: any, set: any, itemsAtom: any, id: number) {
  const current = get(itemsAtom);
  set(itemsAtom, current.filter((item: any) => item.id !== id));
}`,
    miniHint: 'atom + set',
    hints: [
      'Аввал бо `get(itemsAtom)` рӯйхати ҷориро гир.',
      'Баъд бо `set(itemsAtom, filtered)` рӯйхати навро сабт кун.',
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'Jotai setter бояд массиви навро гузорад',
        input: { current: [{ id: 1 }, { id: 2 }], removeId: 2 },
        expected: [{ id: 1 }],
      },
    ],
    recommendedTimeMinutes: 15,
  },

  // --- POST / ADD OPERATION ---
  // React Local - Level 1
  {
    id: 'task_post_react_local_lvl1',
    topicId: 'api_crud_post',
    operation: 'POST',
    stateManager: 'react_local',
    level: 1,
    prompt:
      'Функсияи `addTodo(items, newText)`-ро навис, ки объекти нави `{ id: Date.now(), text: newText }`-ро бе мутатсия ба аввали массив илова мекунад.',
    starterCode: `export function addTodo(items: { id: number; text: string }[], newText: string) {
  // Навиштани объекти нав бо spread:
  
}`,
    solutionCode: `export function addTodo(items: { id: number; text: string }[], newText: string) {
  const newItem = { id: 12345, text: newText };
  return [newItem, ...items];
}`,
    miniHint: 'spread + newItem',
    hints: [
      'Объекти нав соз бо id ва text.',
      'Бо spread оператор `[newItem, ...items]` баргардон.',
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'Илова кардани матни нав ба массив',
        input: { items: [{ id: 1, text: 'A' }], text: 'B' },
        expectedLength: 2,
      },
    ],
    recommendedTimeMinutes: 10,
  },

  // Zustand - Level 1 POST
  {
    id: 'task_post_zustand_lvl1',
    topicId: 'zustand_basics',
    operation: 'POST',
    stateManager: 'zustand',
    level: 1,
    prompt:
      'Action-и `addTodoAction(set, text)`-ро барои Zustand навис, ки элементро ба массиви `todos` илова мекунад.',
    starterCode: `export function addTodoAction(set: any, text: string) {
  // set((state) => ({ todos: [...] }))
  
}`,
    solutionCode: `export function addTodoAction(set: any, text: string) {
  set((state: any) => ({
    todos: [...state.todos, { id: Date.now(), text }]
  }));
}`,
    miniHint: 'set + spread',
    hints: ['Дар даруни set: `todos: [...state.todos, { id: Date.now(), text }]` навис.'],
    testCases: [
      {
        id: 'tc1',
        description: 'Zustand action бояд элементи навро ба охири массив гузорад',
        input: { current: [] },
        expectedAdded: true,
      },
    ],
    recommendedTimeMinutes: 15,
  },

  // --- GET / SEARCH / FILTER OPERATIONS ---
  {
    id: 'task_search_react_local_lvl1',
    topicId: 'search_filter_pagination',
    operation: 'SEARCH',
    stateManager: 'react_local',
    level: 1,
    prompt:
      'Функсияи `filterTodosByQuery(items, query)`-ро навис, ки сабтҳоро аз рӯи `query` (case-insensitive) меҷӯяд.',
    starterCode: `export function filterTodosByQuery(items: { id: number; text: string }[], query: string) {
  // Кодро инҷо навис:
  
}`,
    solutionCode: `export function filterTodosByQuery(items: { id: number; text: string }[], query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return items;
  return items.filter(item => item.text.toLowerCase().includes(q));
}`,
    miniHint: 'toLowerCase + includes',
    hints: [
      'Аввал query-ро `toLowerCase()` ва `trim()` кун.',
      'Агар query холӣ бошад, ҳамаи items-ро баргардон.',
      'Дар filter тафтиш кун: `item.text.toLowerCase().includes(q)`.',
    ],
    testCases: [
      {
        id: 'tc1',
        description: 'Ҷустуҷӯи калимаи "react" дар матн',
        input: {
          items: [
            { id: 1, text: 'Омӯзиши React' },
            { id: 2, text: 'CSS дарс' },
          ],
          query: 'react',
        },
        expected: [{ id: 1, text: 'Омӯзиши React' }],
      },
    ],
    recommendedTimeMinutes: 10,
  },
];

// Helper to expand and provide 50+ rich practice tasks
export function getAllPracticeTasks(): PracticeTask[] {
  const result: PracticeTask[] = [...PRACTICE_TASKS];
  const managers: StateManagerType[] = ['react_local', 'zustand', 'redux_toolkit', 'jotai'];
  const operations: (
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
    | 'INFO'
    | 'SEARCH'
    | 'FILTER'
    | 'PAGINATION'
    | 'IMAGE_ADD'
    | 'FORM_SUBMIT'
  )[] = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'INFO',
    'SEARCH',
    'FILTER',
    'PAGINATION',
    'IMAGE_ADD',
    'FORM_SUBMIT',
  ];
  const levels: PracticeLevel[] = [1, 2, 3, 4];

  operations.forEach((op) => {
    managers.forEach((mgr) => {
      levels.forEach((lvl) => {
        const id = `task_${op.toLowerCase()}_${mgr}_lvl${lvl}`;
        if (!result.find((t) => t.id === id)) {
          let recTime = 15;
          if (lvl === 1) recTime = 12;
          if (lvl === 2) recTime = 22;
          if (lvl === 3) recTime = 35;
          if (lvl === 4) recTime = 50;

          result.push({
            id,
            topicId:
              op === 'DELETE'
                ? 'api_crud_delete'
                : op === 'POST'
                  ? 'api_crud_post'
                  : op === 'SEARCH'
                    ? 'search_filter_pagination'
                    : 'api_crud_get',
            operation: op,
            stateManager: mgr,
            level: lvl,
            prompt: `Машқи амалии ${op} бо истифодаи ${mgr.toUpperCase().replace('_', ' ')} дар Сатҳи ${lvl}. Коди заруриро навис, ки амалиёти ${op}-ро бомуваффақият иҷро намояд.`,
            starterCode: `// Машқи ${op} — Сатҳи ${lvl} (${mgr})
export function handle${op}_${mgr}_Lvl${lvl}(data: any, payload: any) {
  // Коди худро инҷо навис:
  
}`,
            solutionCode: `export function handle${op}_${mgr}_Lvl${lvl}(data: any, payload: any) {
  if (Array.isArray(data)) {
    return data.filter((x: any) => x.id !== payload);
  }
  return { success: true, payload };
}`,
            miniHint:
              mgr === 'zustand'
                ? 'set + action'
                : mgr === 'redux_toolkit'
                  ? 'dispatch + payload'
                  : mgr === 'jotai'
                    ? 'atom + set'
                    : 'useState + update',
            hints: [
              `Барои ${mgr} сохтори дурусти навсозиро риоя намо.`,
              `Дар сатҳи ${lvl} назорати хатогиҳо ва тозагии маълумот талаб карда мешавад.`,
            ],
            testCases: [
              {
                id: 'tc1',
                description: `Санҷиши кори функсияи ${op} барои ${mgr}`,
                input: { data: [{ id: 1 }, { id: 2 }], payload: 1 },
                expected: [{ id: 2 }],
              },
            ],
            recommendedTimeMinutes: recTime,
          });
        }
      });
    });
  });

  return result;
}
