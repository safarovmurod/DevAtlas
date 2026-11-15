type LocalizedLine = readonly [tg: string, ru: string, en: string];

export const REACT_INTRO: Record<
  string,
  {
    title: LocalizedLine;
    body: LocalizedLine;
    question: LocalizedLine;
    answer: LocalizedLine;
    acceptedAnswers?: string[];
    caseSensitive?: boolean;
  }
> = {
  'topic-1': {
    title: ['React чист?', 'Что такое React', 'What is React?'],
    body: [
      'React китобхонаи JavaScript барои сохтани интерфейс аст. Саҳифаро ба компонентҳо, мисли тугма ва карточка, ҷудо мекунӣ. Вақте маълумот иваз шуд, React намоишро нав мекунад. Қоидаи фармоиш ва захираи база кори сервер аст.',
      'React — библиотека JavaScript для интерфейсов. Разбейте страницу на компоненты, например кнопку и карточку товара. При изменении данных React обновляет отображение. Серверные правила заказа и сохранение записей остаются отдельной задачей.',
      'React is a JavaScript library for user interfaces. Divide a page into components such as buttons and product cards. React updates the display when data changes. Order rules and database persistence belong to separate server code.',
    ],
    question: [
      'Кадом китобхонаи JavaScript интерфейсро аз компонентҳо месозад?',
      'Какая библиотека JavaScript строит интерфейс из компонентов в этом курсе?',
      'Which JavaScript library builds interfaces from components in this course?',
    ],
    answer: ['React', 'React', 'React'],
    acceptedAnswers: ['React.js', 'ReactJS'],
  },
  'topic-2': {
    title: ['Компонент чист?', 'Что такое компонент', 'What is a component?'],
    body: [
      'Компонент қисми интерфейс аст, ки бо ном ҷудо шудааст. Масалан, функсияи ProductCard намуди як молро бармегардонад. Онро барои чанд мол истифода бурда, ном ва нархи ҳар молро аз props медиҳӣ.',
      'Компонент — именованная часть интерфейса. Например, функция ProductCard возвращает разметку одного товара. Используйте её несколько раз, передавая имя и цену каждого товара через props.',
      'A component is a named piece of the interface. For example, ProductCard returns the markup for one product. Use it multiple times and pass each product’s name and price through props.',
    ],
    question: [
      'Маълумоте, ки компоненти болоӣ ба ProductCard медиҳад, чӣ ном дорад?',
      'Как называются данные, которые родитель передаёт в ProductCard?',
      'What do we call the data a parent passes into ProductCard?',
    ],
    answer: ['props', 'props', 'props'],
    acceptedAnswers: ['пропсы', 'properties'],
  },
  'topic-3': {
    title: ['JSX чист?', 'Что такое JSX', 'What is JSX?'],
    body: [
      'JSX синтаксисест, ки дар JavaScript markup-и монанд ба HTML менависӣ. Абзори build онро ба JavaScript табдил медиҳад. Дар <h1>{title}</h1 қавсҳо қимати title-ро ба сарлавҳа мегузоранд.',
      'JSX позволяет писать похожую на HTML разметку внутри JavaScript. Инструмент сборки переводит её в JavaScript. В <h1>{title}</h1> фигурные скобки подставляют значение title.',
      'JSX lets you write HTML-like markup inside JavaScript. A build tool transforms it into JavaScript. In <h1>{title}</h1>, the braces insert the value of title.',
    ],
    question: [
      'Синтаксиси монанд ба HTML дар дохили коди React чӣ ном дорад?',
      'Как называется похожий на HTML синтаксис внутри кода React?',
      'What is the HTML-like syntax used inside React code called?',
    ],
    answer: ['JSX', 'JSX', 'JSX'],
    acceptedAnswers: ['JavaScript XML'],
  },
  'topic-9': {
    title: ['State ва useState чист?', 'Что такое state и useState', 'State and useState'],
    body: [
      'State хотираи компонент байни render-ҳо аст. useState қимат ва функсияи навсозиро медиҳад. Бо setter қимати навро дархост мекунӣ, дар render-и нав экран онро мебинад.',
      'State — память компонента между отрисовками. Хук useState возвращает значение и функцию обновления. Вызов этой функции запрашивает состояние для следующего рендера.',
      'State is a component’s memory between renders. useState returns the current value and a setter. Calling the setter requests new state for a later render.',
    ],
    question: [
      'Кадом hook ҷуфти қимати ҳисобкунак ва setter-и онро медиҳад?',
      'Какой хук возвращает пару из значения счётчика и его setter?',
      'Which hook returns a counter value and its setter as a pair?',
    ],
    answer: ['useState', 'useState', 'useState'],
    acceptedAnswers: ['useState()'],
    caseSensitive: true,
  },
  'topic-14': {
    title: [
      'Hook чист ва куҷо даъват мешавад?',
      'Что такое хук и где его вызывать',
      'What is a Hook?',
    ],
    body: [
      'Hook функсияест, ки ба компоненти React имконият медиҳад, масалан state нигоҳ дорад ё бо системаи берунӣ кор кунад. useState ва useEffect-ро дар сатҳи болоии компонент ё custom hook даъват кун. Дар if, loop ё handler тартиби даъватҳо дигар шуда метавонад.',
      'Хук — функция, которая даёт компоненту доступ к возможностям React, например к состоянию или синхронизации с внешней системой. useState и useEffect вызывают на верхнем уровне компонента или своего хука. В условии, цикле или обработчике порядок вызовов может измениться.',
      'A Hook is a function that gives a component access to React features such as state or synchronization. Call useState and useEffect at the top level of a component or custom Hook. Conditions, loops, and event handlers can change when those calls happen.',
    ],
    question: [
      'Функсияҳои React мисли useState ва useEffect умумӣ чӣ ном доранд?',
      'Как называются функции React вроде useState и useEffect?',
      'What kind of React functions are useState and useEffect?',
    ],
    answer: ['Hook', 'Хук', 'Hooks'],
    acceptedAnswers: ['React Hooks', 'хуки', 'хуки React', 'hook-ҳо'],
  },
  'topic-16': {
    title: ['useEffect барои чӣ лозим?', 'Для чего нужен useEffect', 'What useEffect is for'],
    body: [
      'useEffect компонентро бо чизе берун аз React ҳамоҳанг мекунад, мисли пайвасти чат ё таймер. Агар effect таймер сохта бошад, cleanup онро қатъ мекунад. Барои ҳисобе, ки аз props бармеояд, одатан effect лозим нест.',
      'useEffect синхронизирует компонент с чем-то вне React, например с чатом или таймером. Если эффект создал таймер, очистка его останавливает. Простое вычисление из props обычно делают при рендере.',
      'useEffect synchronizes a component with something outside React, such as a chat connection or timer. Cleanup stops a timer the effect created. A value that can be computed from props usually belongs in render.',
    ],
    question: [
      'Функсияе, ки effect-ро тоза мекунад, чӣ ном дорад?',
      'Как называется функция, освобождающая ресурсы эффекта?',
      'What is the function that releases an effect’s resources called?',
    ],
    answer: ['cleanup', 'Очистка', 'Cleanup function'],
  },
  'topic-36': {
    title: ['Context API чист?', 'Что такое Context API', 'What is Context API?'],
    body: [
      'Context API як қиматро ба компонентҳои дохили provider мерасонад. Масалан, тугма ва меню theme-ро бе додани props аз ҳар қабат мегиранд. useContext қимати provider-и наздиктаринро мехонад.',
      'Context API передаёт значение компонентам внутри провайдера. Например, меню и кнопка получают тему без передачи props через каждый промежуточный компонент. useContext читает значение ближайшего подходящего провайдера.',
      'Context API supplies a value to components inside a provider. A menu and a button can get the theme without props through every intermediate component. useContext reads the nearest matching provider.',
    ],
    question: [
      'Кадом hook қимати Context-ро мехонад?',
      'Какой хук читает значение Context?',
      'Which hook reads the Context value?',
    ],
    answer: ['useContext', 'useContext', 'useContext'],
    acceptedAnswers: ['useContext()'],
    caseSensitive: true,
  },
  'topic-37': {
    title: [
      'Context аз state чӣ фарқ дорад?',
      'Context и хранение состояния',
      'Context and state storage',
    ],
    body: [
      'Context қиматро паҳн мекунад. Худи state метавонад дар provider бо useState ё reducer бошад. Масалан, сабад қиматашро дар provider нигоҳ медорад ва меню аз Context шумораи молро мехонад.',
      'Context доставляет значение. Само состояние может храниться в провайдере с useState или reducer. Например, провайдер хранит корзину, а меню читает из Context число товаров.',
      'Context distributes a value. The provider can own the state with useState or a reducer. For example, a provider keeps the cart and a menu reads the item count through Context.',
    ],
    question: [
      'Компоненте, ки қиматро ба дохили дарахти Context медиҳад, чӣ ном дорад?',
      'Как называется компонент, передающий значение вниз через Context?',
      'What is the component that supplies a Context value to a subtree called?',
    ],
    answer: ['Provider', 'Провайдер', 'Context provider'],
    acceptedAnswers: ['поставщик контекста', 'провайдер контекста'],
  },
  'topic-38': {
    title: ['Zustand чист?', 'Что такое Zustand', 'What is Zustand?'],
    body: [
      'Zustand китобхонаест, ки state-и муштаракро берун аз компонент нигоҳ медорад. Масалан тугмаи сабад бо selector фақат шумораи молро мегирад. Барои майдони як форма state-и локалӣ ҳам бас аст.',
      'Zustand — библиотека для общего состояния вне компонентов. Например, кнопка корзины выбирает селектором только количество товаров. Для поля одной формы часто достаточно локального состояния.',
      'Zustand stores shared state outside components. A cart button can select only the item count. A field used by one form often needs only local state.',
    ],
    question: [
      'Функсияе, ки аз Zustand store фақат қисми лозими state-ро мегирад, чӣ ном дорад?',
      'Как называется функция, выбирающая нужную часть состояния из хранилища Zustand?',
      'What do we call a function that reads a selected part of a Zustand store?',
    ],
    answer: ['Selector', 'Селектор', 'Selector'],
  },
};
