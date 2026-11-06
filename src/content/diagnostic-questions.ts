import { QuizQuestion } from '@/types';

export const DIAGNOSTIC_QUESTIONS: QuizQuestion[] = [
  {
    id: 'diag_1_let_const',
    topicId: 'let_const',
    type: 'multiple_choice',
    prompt:
      'Дар JavaScript кадом калимаи калидӣ барои эълони тағйирёбандае (variable) истифода мешавад, ки қиматаш дубора иваз намешавад?',
    options: ['var', 'let', 'const', 'static'],
    answer: 'const',
    explanation:
      'const барои тағйирёбандаҳое истифода мешавад, ки таъйини дубораи онҳо (reassignment) манъ аст.',
  },
  {
    id: 'diag_2_arrow_func',
    topicId: 'arrow_functions',
    type: 'code_output',
    prompt: 'Натиҷаи коди зерин чист? const double = (x) => x * 2; console.log(double(4));',
    options: ['2', '4', '8', 'undefined'],
    answer: '8',
    explanation:
      'Arrow function x-ро гирифта ба 2 зарб мезанад, бинобар ин double(4) натиҷаи 8 медиҳад.',
  },
  {
    id: 'diag_3_array_methods',
    topicId: 'array_map',
    type: 'multiple_choice',
    prompt:
      'Кадом методи Array массиви навро бармегардонад ва ҳар як элементи онро мувофиқи функсия тағйир медиҳад?',
    options: ['forEach()', 'map()', 'filter()', 'push()'],
    answer: 'map()',
    explanation:
      'map() ҳар як элементро дигар карда массиви нави ҳамон дарозиро бармегардонад, ки барои JSX муҳим аст.',
  },
  {
    id: 'diag_4_array_filter',
    topicId: 'array_filter',
    type: 'multiple_choice',
    prompt:
      'Агар хоҳем аз массиви [1, 2, 3, 4] танҳо ададҳои ҷуфтро гирем, кадом методро истифода мебарем?',
    options: [
      'arr.filter(n => n % 2 === 0)',
      'arr.map(n => n % 2 === 0)',
      'arr.find(n => n % 2 === 0)',
      'arr.slice(2)',
    ],
    answer: 'arr.filter(n => n % 2 === 0)',
    explanation: 'filter() элементҳоеро интихоб мекунад, ки шартро қаноатманд (true) мекунанд.',
  },
  {
    id: 'diag_5_destructuring',
    topicId: 'destructuring',
    type: 'multiple_choice',
    prompt:
      'Аз объекти const user = { name: "Ali", age: 22 } чи тавр бо деструктуризатсия танҳо name-ро мегирем?',
    options: [
      'const name = user;',
      'const { name } = user;',
      'const [ name ] = user;',
      'const name = user[0];',
    ],
    answer: 'const { name } = user;',
    explanation:
      'Синтаксиси const { name } = user; хосияти name-ро мустақиман ҳамчун тағйирёбанда мегирад.',
  },
  {
    id: 'diag_6_spread',
    topicId: 'spread_operator',
    type: 'code_output',
    prompt: 'Натиҷаи [...[1, 2], ...[3, 4]] чист?',
    options: ['[[1, 2], [3, 4]]', '[1, 2, 3, 4]', '[10]', 'Error'],
    answer: '[1, 2, 3, 4]',
    explanation:
      'Spread operator (...) элементҳои ҳарду массивҳоро ба дохили як массиви нав мерезад.',
  },
  {
    id: 'diag_7_async_await',
    topicId: 'async_await',
    type: 'multiple_choice',
    prompt:
      'Дар JavaScript калимаи калидии `await`-ро танҳо дар даруни кадом функсияҳо истифода кардан мумкин аст?',
    options: [
      'Танҳо дар функсияҳои оддӣ',
      'Дар функсияҳои бо `async` эълоншуда',
      'Дар ҳама ҷо бе маҳдудият',
      'Танҳо дар конструктор',
    ],
    answer: 'Дар функсияҳои бо `async` эълоншуда',
    explanation:
      'await метавонад танҳо дар функсияи async (ё дар сатҳи болоии модули ES) иҷро шавад.',
  },
  {
    id: 'diag_8_spa',
    topicId: 'spa_vs_mpa',
    type: 'multiple_choice',
    prompt: 'Бартарии асосии Single Page Application (SPA) чист?',
    options: [
      'Ҳангоми гузариш ба саҳифаи нав тамоми саҳифаи браузер аз нав боргирӣ (reload) намешавад',
      'HTML-и он ҳамеша калонтар аст',
      'Барои сохтани он JavaScript даркор нест',
      'Браузер cache-ро истифода намебарад',
    ],
    answer:
      'Ҳангоми гузариш ба саҳифаи нав тамоми саҳифаи браузер аз нав боргирӣ (reload) намешавад',
    explanation:
      'Дар SPA масирҳо (routes) аз ҷониби худи JavaScript дар клиент иваз мешаванд бе reload-и пурраи браузер.',
  },
  {
    id: 'diag_9_component',
    topicId: 'component',
    type: 'multiple_choice',
    prompt: 'Компоненти React чист?',
    options: [
      'Як файли CSS',
      'Функсияе, ки JSX (қисми UI)-ро бармегардонад',
      'Объекти махсуси базаи додаҳо',
      'Танҳо теги <div>',
    ],
    answer: 'Функсияе, ки JSX (қисми UI)-ро бармегардонад',
    explanation:
      'Компоненти функсионалии React функсияи JavaScript аст, ки JSX баргардонида интерфейсро тасвир мекунад.',
  },
  {
    id: 'diag_10_props',
    topicId: 'props',
    type: 'multiple_choice',
    prompt:
      'Props чист ва оё фарзанд (child) метавонад props-и додашударо мустақиман тағйир диҳад?',
    options: [
      'Props хотираи дохилӣ аст ва child метавонад онро иваз кунад',
      'Props параметрҳо аз parent мебошанд ва онҳо read-only (танҳо барои хондан) мебошанд',
      'Props танҳо барои рақамҳо аст',
      'Props дар React умуман истифода намешавад',
    ],
    answer: 'Props параметрҳо аз parent мебошанд ва онҳо read-only (танҳо барои хондан) мебошанд',
    explanation:
      'Props якҷониба (one-way data flow) мебошанд ва child ҳуқуқи тағйири мустақими онҳоро надорад.',
  },
  {
    id: 'diag_11_state',
    topicId: 'usestate',
    type: 'multiple_choice',
    prompt:
      'Чаро дар React ба ҷои `let count = 0` аз `const [count, setCount] = useState(0)` истифода мебарем?',
    options: [
      'Чунки let кор намекунад',
      'Чунки ҳангоми даъвати setCount худи React компонентро re-render карда экранро нав месозад',
      'Барои он ки кодро душвортар кунем',
      'Ин танҳо тавсия аст, ҳеҷ фарқе надорад',
    ],
    answer:
      'Чунки ҳангоми даъвати setCount худи React компонентро re-render карда экранро нав месозад',
    explanation:
      'useState ҳолати зиндаи компонентро нигоҳ медорад ва ҳангоми setState ба React фармони навсозии UI-ро медиҳад.',
  },
  {
    id: 'diag_12_useeffect',
    topicId: 'useeffect',
    type: 'multiple_choice',
    prompt: 'Агар дар useEffect массиви вобастагӣ холӣ [] бошад, он кай кор мекунад?',
    options: [
      'Дар ҳар як re-render',
      'Танҳо як бор ҳангоми пайдо шудани компонент дар экран (mount)',
      'Ҳеҷ гоҳ кор намекунад',
      'Танҳо ҳангоми пӯшида шудани браузер',
    ],
    answer: 'Танҳо як бор ҳангоми пайдо шудани компонент дар экран (mount)',
    explanation:
      'Массиви холии [] мегӯяд, ки эффект ба ягон қимат вобаста нест ва танҳо дар оғоз (mount) як маротиба иҷро мешавад.',
  },
];
