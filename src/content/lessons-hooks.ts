import type { Lesson } from '@/types';

/** Lessons on the useState and useEffect hooks. */
export const HOOK_LESSONS: Lesson[] = [
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
];
