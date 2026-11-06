import { Lesson } from '@/types';

export const LESSONS: Lesson[] = [
  {
    id: 'lesson_usestate',
    topicId: 'usestate',
    title: 'useState — Идоракунии State дар React',
    orderNum: 1,
    content: {
      whyNeeded:
        'Дар JavaScript-и оддӣ вақте переменная-ро иваз мекунӣ, экран (UI) худаш аз нав намекашад. Дар React мо бояд ба система хабар диҳем, ки маълумот тағйир ёфт ва экранро бояд нав кард.',
      meaning:
        'useState — ин hook-ест, ки дар хотираи компонент як қиматро маҳкам нигоҳ медорад ва ба мо функсия медиҳад барои иваз кардани ҳамон қимат бо огоҳ кардани React.',
      whatDoesItDo:
        'Маълумотро ҳифз мекунад, ҳангоми даъвати setState қимати навро мегузорад ва ба React мегӯяд, ки ҳамин компонентро re-render кунад.',
      trigger:
        'Trigger (чизе ки процесс-а сар мекна) — пахш шудани тугма (onClick), ворид кардани матн (onChange), ё таймер.',
      startLocation: 'Аз худи ҳамон компоненте, ки useState дар дарунаш эълон шудааст.',
      callingFunction:
        'Функсияи dispatcher (масалан setCount ё setUser), ки useState ба ту баргардонида буд.',
      whereDataGoes:
        'Ба даруни Fiber tree (хотираи дохилии худи React), ки баъдан дар render-и оянда ҳамчун қимати нав ба компонент бармегардад.',
      whatRerenders:
        'Худи ҳамин компонент ва тамоми child-компонентҳое, ки дар зери он қарор доранд.',
      whatHappensIfDeleted:
        'Агар useState-ро нест кунӣ ва переменнаяи оддӣ (let count = 0) монӣ, count иваз мешавад, лекин экрани user ҳеҷ гоҳ нав намешавад.',
      codeExample: `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  function handleIncrement() {
    setCount((prev) => prev + 1);
  }

  return (
    <button onClick={handleIncrement} className="px-4 py-2 bg-blue-600 text-white rounded">
      Шумора: {count}
    </button>
  );
}`,
      flowSteps: [
        '1. User тугмаро клик кард.',
        '2. onClick trigger шуд ва handleIncrement даъват ёфт.',
        '3. setCount((prev) => prev + 1) кор кард ва хотираи React-ро нав кард.',
        '4. React компонентро re-render кард.',
        '5. Дар экрани браузер рақами нав пайдо шуд.',
      ],
      commonErrors: [
        'Мустақиман иваз кардани state: count = count + 1 (React инро пай намебарад!).',
        'Гузоштани useState дар даруни if ё for loop (қоидаи Hooks-ро вайрон мекунад!).',
        'Интизор шудани қимати фаврӣ: баъди setCount(count + 1) фавран console.log(count) қимати пешинаро нишон медиҳад, чунки state асинхронӣ batch мешавад.',
      ],
      interviewTip:
        'Дар interview бгӯ: "useState ба компонент имкон медиҳад ҳолати худро нигоҳ дорад. Барои навсозии state мо setState-ро истифода мебарем, ки он component-ро re-render мекунад. Барои state-ҳои вобаста ба ҳолати пешина бояд функсия-updater (prev => prev + 1) истифода шавад."',
      microTerms: [
        {
          term: 'Hook',
          explanation:
            'Функсияи махсуси React, ки бо номи use сар мешавад ва ба хусусиятҳои дохилии React пайваст мешавад.',
        },
        {
          term: 'State',
          explanation:
            'Хотираи зиндаи компонент, ки ҳангоми тағйир ёфтан UI-ро аз сари нав мекашад.',
        },
        {
          term: 'Re-render',
          explanation:
            'Аз нав хонда шудани коди функсияи компонент барои ёфтани тағйирот дар Virtual DOM.',
        },
      ],
    },
  },
  {
    id: 'lesson_useeffect',
    topicId: 'useeffect',
    title: 'useEffect — Пайвастшавӣ ба ҷаҳони беруна (Side Effects)',
    orderNum: 2,
    content: {
      whyNeeded:
        'React бояд вазифаи асосиаш — сохтани UI-ро зуд иҷро кунад. Агар дар мобайни render мо API request кунем ё таймер монем, экран мечаспад. useEffect барои иҷрои корҳоест, ки пас аз кашида шудани экран бояд кор кунанд.',
      meaning:
        'useEffect — ин hook барои Side Effects (амалҳои иловагӣ: fetch маълумот, event listeners, timers, localStorage) аст.',
      whatDoesItDo:
        'Коди дарунашро пас аз он ки React экранро дар DOM нақш кард (commit phase) иҷро мекунад.',
      trigger:
        'Trigger — анҷоми аввалин render (mount) ё тағйир ёфтани ягон қимат дар даруни Dependency Array.',
      startLocation: 'Аз функсияе, ки ба даруни useEffect ҳамчун параметри аввал дода шудааст.',
      callingFunction: 'Худи React Runtime баъди ба итмом расидани раванди кашидани DOM.',
      whereDataGoes:
        'Одатан data аз сервер гирифта мешавад ва тавассути setState ба state-и маҳаллӣ ё store меравад.',
      whatRerenders:
        'Агар дар даруни useEffect мо setState кунем, компонент re-render мешавад ва маълумоти омадаро дар экран нишон медиҳад.',
      whatHappensIfDeleted:
        'Агар барои API request истифода нашавад ва мустақиман дар бадани компонент нависӣ, дар ҳар re-render беохир ба сервер запрос меравад (Infinite Loop!).',
      codeExample: `import { useState, useEffect } from 'react';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await res.json();
        if (!isCancelled) {
          setUsers(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadData();

    return () => {
      isCancelled = true; // Cleanup
    };
  }, []); // [] маънои фақат як бор ҳангоми пайдо шудан (mount) кор карданро дорад

  if (loading) return <div>Боршавӣ...</div>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
      flowSteps: [
        '1. Компонент render шуд ва экрани "Боршавӣ..." намоён шуд.',
        '2. Браузер DOM-ро кашид.',
        '3. React useEffect-ро trigger кард.',
        '4. loadData() запрос фиристод ва маълумот омад.',
        '5. setUsers(data) state-ро нав кард.',
        '6. Компонент re-render шуд ва рӯйхати корбарон баромад.',
      ],
      commonErrors: [
        'Фаромӯш кардани Dependency Array: useEffect(() => {...}) дар ҳар як re-render аз нав кор мекунад!',
        'Нусха набардоштани cleanup: агар корбар пеш аз омадани ҷавоб саҳифаро пӯшад, memory leak мешавад.',
        'Объекти навро бе useMemo ба dependency додан, ки loop-и беохир месозад.',
      ],
      interviewTip:
        'Дар interview фаҳмон: "useEffect барои side-effects мебошад. Массиви dependency назорат мекунад, ки effect кай кор кунад: [] — фақат mount ва unmount, [id] — вақте id иваз шуд, бе массив — дар ҳар як render. Cleanup function ҳангоми unmount ё пеш аз иҷрои навбатии effect барои тозакунии захираҳо кор мекунад."',
      microTerms: [
        {
          term: 'Side Effect',
          explanation:
            'Ҳар коре, ки берун аз ҳисобкунии худи UI аст (масалан шабака, DOM-и беруна, таймер).',
        },
        {
          term: 'Dependency Array',
          explanation:
            'Рӯйхати чизҳое, ки useEffect онҳоро назорат мекунад ва ҳангоми тағйирашон аз нав кор мекунад.',
        },
        {
          term: 'Cleanup',
          explanation:
            'Функсияи тозакунанда, ки ҳангоми нест шудани компонент таймерҳо ва обунаҳоро қатъ мекунад.',
        },
      ],
    },
  },
  {
    id: 'lesson_zustand',
    topicId: 'zustand_basics',
    title: 'Zustand — State Management-и Сабук ва Қулай',
    orderNum: 3,
    content: {
      whyNeeded:
        'Вақте ки дар лоиҳа маълумотро бояд байни даҳҳо саҳифаву компонент тақсим кунем, props-ро аз қабатҳои зиёд гузаронидан (Prop Drilling) душвор мешавад. Zustand имкон медиҳад, ки як Store-и умумӣ дошта бошем ва ҳар компонент мустақиман онро хонад.',
      meaning:
        'Zustand — ин китобхонаи хурд ва замонавӣ барои нигоҳдории Global State дар берун аз дарахти React мебошад, ки ба Provider ниёз надорад.',
      whatDoesItDo:
        'Store месозад, ки дар он ҳам худи маълумот (state) ва ҳам функсияҳои тағйирдиҳандаи он (actions) нигоҳ дошта мешаванд.',
      trigger:
        'Trigger — даъват кардани ягон action-и store аз тарафи компонент (масалан addTodo, removeTodo).',
      startLocation: 'Аз ҷое, ки action даъват шуд (масалан тугмаи "Нест кардан").',
      callingFunction:
        'Функсияи action дар дохили store, ки худаш дар охир set()-ро фарёд мекунад.',
      whereDataGoes:
        'Ба даруни store-и Zustand, ва баъд ба ҳамаи компонентҳое, ки ҳамин қисми store-ро бо selector интихоб кардаанд.',
      whatRerenders:
        'ТАНҲО ҳамон компонентҳое, ки маҳз ҳамон қисми интихобкардаашон (selector) иваз шудааст. Компонентҳои дигар беҳуда re-render намешаванд!',
      whatHappensIfDeleted:
        'Агар Zustand-ро партофта React Context ё Prop Drilling истифода барӣ, тамоми компонентҳо ҳангоми як тағйироти майда аз сари нав render мешаванд ё код беҳад печида мешавад.',
      codeExample: `import { create } from 'zustand';

interface TodoStore {
  todos: { id: string; title: string }[];
  addTodo: (title: string) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (title) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now().toString(), title }],
    })),
  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),
}));`,
      flowSteps: [
        '1. User тугмаи "Тоза кардан"-ро зер кард.',
        '2. removeTodo(id) даъват шуд.',
        '3. Zustand set((state) => ...) кард ва todos-ро филтр кард.',
        '4. Store нав шуд.',
        '5. Компоненте, ки const todos = useTodoStore(s => s.todos) дошт re-render шуд.',
      ],
      commonErrors: [
        'Истифода набурдани Selector: const store = useTodoStore() — ин боис мешавад, ки ҳангоми дилхоҳ тағйирот дар store компонент re-render шавад!',
        'Мустақиман мутатсия кардан: state.todos.push(...) ба ҷои сохтани массиви нав бо spread ё filter.',
      ],
      interviewTip:
        'Дар interview гӯй: "Zustand як store-и соддаву тез бе Provider мебошад. Он Selector-ҳоро дастгирӣ мекунад, бинобар ин танҳо компонентҳое re-render мешаванд, ки маълумоти интихобкардаашон тағйир ёфтааст. Амалиётҳои асинхрониро низ мустақиман дар дохили actions бе middlewares метавон навишт."',
      microTerms: [
        {
          term: 'Store',
          explanation: 'Ҷои ягонаи нигоҳдории тамоми маълумот ва функсияҳои идоракунии он.',
        },
        {
          term: 'Selector',
          explanation:
            'Функсияи хурд (state => state.todos), ки танҳо қисми зарурии store-ро ба компонент меорад.',
        },
        { term: 'set()', explanation: 'Функсияи дохилии Zustand барои нав кардани state-и store.' },
      ],
    },
  },
  {
    id: 'lesson_redux_toolkit',
    topicId: 'redux_toolkit_slices',
    title: 'Redux Toolkit — Сохтори createSlice ва Actions',
    orderNum: 4,
    content: {
      whyNeeded:
        'Дар лоиҳаҳои бузурги корхонавӣ (Enterprise) лозим меояд, ки ҳар як амалиёт (Action) пешакӣ маълум бошад, пайгирӣ (Trace/DevTools) шавад ва қонуни ягонаи тағйири додаҳо риоя шавад.',
      meaning:
        'Redux Toolkit (RTK) — ин тарзи расмӣ ва соддакардашудаи навиштани Redux мебошад, ки бойлерплейтро нест мекунад ва Immer-ро дар худ дорад.',
      whatDoesItDo:
        'Слайсҳо (createSlice) месозад, ки action creators ва reducers-ро худкор якҷоя мекунанд.',
      trigger: 'Trigger — dispatch кардани action: dispatch(todoAdded("Матн")).',
      startLocation: 'Аз компоненте, ки useDispatch-ро истифода мебарад.',
      callingFunction: 'Reducer-и мувофиқ дар дохили slice.',
      whereDataGoes: 'Ба маркази Redux Store меравад ва дар он ҷо state нав мешавад.',
      whatRerenders: 'Компонентҳое, ки ҳамон қисматро бо useSelector интихоб кардаанд.',
      whatHappensIfDeleted:
        'Дар лоиҳаҳои азим пайгирии хатогиҳо ва таърихи тағйироти state бе Redux DevTools ниҳоят мушкил мешавад.',
      codeExample: `import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Todo {
  id: string;
  title: string;
}

interface TodosState {
  items: Todo[];
}

const initialState: TodosState = { items: [] };

export const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded(state, action: PayloadAction<string>) {
      // Immer имкон медиҳад чунин нависем
      state.items.push({ id: Date.now().toString(), title: action.payload });
    },
    todoRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { todoAdded, todoRemoved } = todosSlice.actions;
export default todosSlice.reducer;`,
      flowSteps: [
        '1. UI: User тугмаро клик мекунад.',
        '2. dispatch(todoAdded("Хондани дарс")): Action сохта шуда ба Store равона мешавад.',
        '3. Reducer action-ро мегирад ва бо ёрии Immer state-ро нав мекунад.',
        '4. Store нав шуд ва DevTools тағйиротро сабт кард.',
        '5. useSelector қимати навро дида UI-ро re-render кард.',
      ],
      commonErrors: [
        'Мутатсия дар ҷои нодуруст бе RTK (дар Redux-и кӯҳна return {...state} лозим буд).',
        'Фаромӯш кардани ба қайд гирифтани reducer дар configureStore.',
        'Гузоштани маълумоти ғайрисериализатсияшаванда (масалан функсия ё class instance) дар дохили payload.',
      ],
      interviewTip:
        'Дар interview гӯй: "Redux Toolkit навиштани Redux-ро осон кард. Бо createSlice мо reducers ва action creators-ро дар як ҷо месозем. Immer имкон медиҳад, ки коди мутатсиямонанд нависем, вале дар асл immutable update мешавад. Барои асинхронӣ бошад createAsyncThunk истифода мешавад."',
      microTerms: [
        {
          term: 'Dispatch',
          explanation: 'Ирсолкунанда — функсияе, ки Action-ро ба Store мефиристад.',
        },
        {
          term: 'Action',
          explanation: 'Объект бо майдони type ва payload, ки хабар медиҳад чи кор бояд кард.',
        },
        {
          term: 'Payload',
          explanation:
            'Маълумоти иловагие, ки ҳамроҳи action фиристода мешавад (масалан id ё матн).',
        },
        {
          term: 'Reducer',
          explanation:
            'Функсияи холис, ки state-и ҳозира ва action-ро гирифта state-и навро ҳисоб мекунад.',
        },
      ],
    },
  },
  {
    id: 'lesson_jotai',
    topicId: 'jotai_atomic',
    title: 'Jotai — Ҳолати Атомӣ (Atomic State)',
    orderNum: 5,
    content: {
      whyNeeded:
        'Дар баъзе барномаҳо мо намехоҳем як Store-и калони марказӣ дошта бошем, балки мехоҳем ҳар як майдон ё қисм мустақилона мисли useState кор кунад, вале байни компонентҳо тақсим шавад.',
      meaning:
        'Jotai — ин китобхонаи Bottom-Up (аз поён ба боло) мебошад, ки state-ро ба қисмҳои хурди тақсимнашаванда — Атомҳо (Atoms) ҷудо мекунад.',
      whatDoesItDo:
        'Атом месозад. Компонент бо useAtom(myAtom) онро мехонад ва иваз мекунад, айнан мисли useState, вале барои ҳама дастрас.',
      trigger: 'Trigger — setAtom(newValue).',
      startLocation: 'Аз ҷое, ки setAtom даъват шуд.',
      callingFunction: 'Функсияи нависандаи atom (write function).',
      whereDataGoes: 'Ба дохили ҳамон атоми мушаххас.',
      whatRerenders: 'Танҳо компонентҳое, ки маҳз ҳамон атомро обуна шудаанд.',
      whatHappensIfDeleted:
        'State бояд ё ба боло (lifting state) бурда шавад ё ба context партофта шавад, ки боиси re-render-и зиёд мегардад.',
      codeExample: `import { atom, useAtom } from 'jotai';

// Эълони атомҳо дар сатҳи модул
export const countAtom = atom(0);
export const doubleCountAtom = atom((get) => get(countAtom) * 2);

export function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [double] = useAtom(doubleCountAtom);

  return (
    <div>
      <p>Шумора: {count} (Дучанд: {double})</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}`,
      flowSteps: [
        '1. setCount((c) => c + 1) даъват мешавад.',
        '2. countAtom қимати навро мегирад.',
        '3. doubleCountAtom ба таври худкор аз рӯи формулаи (get) => get(countAtom) * 2 нав мешавад.',
        '4. Фақат ҳамин ду элемент нав мешаванд.',
      ],
      commonErrors: [
        'Сохтани atom() дар даруни худи функсияи компонент (дар ҳар render атоми нав сохта шуда state гум мешавад!). Офаридани атом бояд берун аз компонент бошад.',
      ],
      interviewTip:
        'Дар interview гӯй: "Jotai модели атомиро (Atomic State) пешниҳод мекунад. Бар хилофи Redux/Zustand, ки monolithic store доранд, дар Jotai шумо атомҳои хурд месозед ва метавонед derived atom-ҳо дошта бошед. Синтаксиси он ба useState хеле наздик аст."',
      microTerms: [
        { term: 'Atom', explanation: 'Воҳиди хурди тақсимнашавандаи state дар Jotai.' },
        {
          term: 'Derived Atom',
          explanation: 'Атоме, ки қимати худро аз дигар атомҳо ҳисоб мекунад.',
        },
      ],
    },
  },
  {
    id: 'lesson_api_crud_delete',
    topicId: 'api_crud_delete',
    title: 'DELETE Request бо Axios ва Навсозии UI',
    orderNum: 6,
    content: {
      whyNeeded:
        'Вақте корбар сабтеро аз рӯйхат нест кардан мехоҳад, мо бояд ҳам ба сервер хабар диҳем, ки онро аз база нест кунад, ва ҳам фавран UI-ро нав созем, то корбар натиҷаро бинад.',
      meaning:
        'DELETE Request — ин методи HTTP мебошад, ки барои нест кардани маълумот дар сервер истифода мешавад, маъмулан бо нишон додани ID дар охири URL (масалан /api/items/42).',
      whatDoesItDo:
        'Дархости HTTP DELETE мефиристад, ва пас аз муваффақият state-ро бо ёрии filter((item) => item.id !== id) нав мекунад.',
      trigger:
        'Trigger — пахш шудани тугмаи "Нест кардан" (onClick={() => handleDelete(item.id)}).',
      startLocation: 'Аз тугмаи несткунӣ дар сатри элемент.',
      callingFunction: 'Функсияи handleDelete(id).',
      whereDataGoes: 'Ба сервер тавассути шабака (Network request).',
      whatRerenders: 'Компоненти рӯйхат пас аз setItems(prev => prev.filter(...)).',
      whatHappensIfDeleted:
        'Агар сатри несткуниро фаромӯш кунӣ ё UI-ро нав накунӣ, корбар гумон мекунад, ки тугма кор накард ва чанд бор пахш мекунад.',
      codeExample: `import { useState } from 'react';

export function TodoList() {
  const [items, setItems] = useState([
    { id: 1, text: 'Дарси якум' },
    { id: 2, text: 'Дарси дуюм' },
  ]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setLoadingId(id);
    try {
      // Ирсоли DELETE ба сервер
      // await axios.delete('/api/todos/' + id);
      
      // Навсозии state бо filter (нест кардани элементи ҳамин id дошта)
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Хатогӣ ҳангоми несткунӣ!');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} className="flex justify-between p-2 border-b">
          <span>{item.text}</span>
          <button
            onClick={() => handleDelete(item.id)}
            disabled={loadingId === item.id}
            className="text-red-500 hover:text-red-700"
          >
            {loadingId === item.id ? 'Нест мешавад...' : 'Нест кардан'}
          </button>
        </li>
      ))}
    </ul>
  );
}`,
      flowSteps: [
        '1. Корбар тугмаи "Нест кардан"-и элементи id=2-ро пахш кард.',
        '2. handleDelete(2) фаъол шуд ва loadingId=2 муқаррар шуд.',
        '3. DELETE запрос ба endpoint фиристода шуд.',
        '4. Сервер статуси 200 ё 204 баргардонд.',
        '5. setItems((prev) => prev.filter(item => item.id !== 2)) иҷро шуд.',
        '6. Элементи 2 аз экран нест шуд.',
      ],
      commonErrors: [
        'Истифодаи splice мустақиман рӯи state-и пешина (мутатсия!).',
        'Нафиристодани ID ба URL: масалан axios.delete("/api/todos") ба ҷои axios.delete("/api/todos/" + id).',
        'Набудани нишондиҳандаи боршавӣ (loading), ки боиси пахши дубора мешавад.',
      ],
      interviewTip:
        'Дар interview гӯй: "Барои DELETE request мо методи HTTP DELETE-ро бо ID-и сабт равон мекунем. Пас аз гирифтани ҷавоби мусбат, state-и React-ро бо функсияи пок (масалан filter) нав мекунем, то сабт аз рӯйхат хориҷ шавад. Ҳамчунин муҳим аст, ки хатогиҳо бо try/catch қабул карда шаванд ва тугма ҳангоми рафти дархост хомӯш (disabled) бошад."',
      microTerms: [
        {
          term: 'filter()',
          explanation:
            'Методи массив, ки элементи нолозимро партофта, массиви нави тоза бармегардонад.',
        },
        {
          term: 'Optimistic Update',
          explanation:
            'Усуле, ки аввал экранро фавран нав мекунад ва баъд ба сервер мефиристад, то корбар интизор нашавад.',
        },
      ],
    },
  },
];
