import type { ExtraSeed } from './supplemental';
import { REACT_INTRO } from './react-intro';
import { REACT_CONCEPTS } from './react-concepts';

/** Extra React topics for months 1 and 2: tooling, forms, TypeScript, data and auth. */
export const REACT_SEEDS: ExtraSeed[] = [
  {
    id: 'local-practice',
    month: 1,
    title: 'Local React practice',
    ru: 'Практика с локальным state',
    why: 'Барои Todo аввал store даркор нест. Рӯйхат, матни input ва id-и интихобшуда дар ҳамон компонент меистанд. Барои Add spread, Delete filter ва Edit map истифода кун.',
    trigger:
      'Клик handler-ро ҷеғ мезана. Худи render Delete намекунад. Ягон HTTP запрос фиристода намешавад.',
    flow: [
      'items = [1, 2, 3]',
      'Клик ба Delete-и id=2',
      'handleDelete(2)',
      'filter: 1 ва 3 мемонанд',
      'setItems массиви навро мегира',
      'React UI-ро бо [1, 3] нав мекунад',
    ],
    code: 'import { useState } from "react";\n\nexport default function Todo() {\n  const [items, setItems] = useState([{ id: 1, name: "React" }, { id: 2, name: "Props" }]);\n\n  function handleDelete(id) {\n    setItems(items.filter(item => item.id !== id));\n  }\n\n  return items.map(item => (\n    <button key={item.id} onClick={() => handleDelete(item.id)}>\n      {item.name}\n    </button>\n  ));\n}',
    question: 'Дар Todo-и локалӣ Delete кадом запросро мефиристад?',
    answer: 'Ҳеҷ запрос. filter массиви нав месозад ва setItems state-ро нав мекунад.',
    wrong: ['Ҳатман HTTP DELETE ба сервер меравад.', 'React тамоми сайтро reload мекунад.'],
    source: 'https://react.dev/learn/updating-arrays-in-state',
  },
  {
    id: 'tooling',
    month: 1,
    title: 'Vite, bundlers and MUI',
    ru: 'Vite, сборщики и MUI',
    why: 'Vite сервери development ва build медиҳад. MUI компонентҳои интерфейс медиҳад. React state ва render-ро идора мекунад. Вазифаи ин се чиз як хел нест.',
    trigger:
      'npm run dev серверро оғоз мекунад; edit-и файл HMR-ро фаъол мекунад. Клик ба Button танҳо handler-и додагиатро иҷро мекунад.',
    flow: [
      'package.json: scripts-ро бин',
      'npm install дар папкаи проект',
      'npm run dev',
      'src/App.jsx кушода мешавад',
      'Файлро тағйир деҳ',
      'Барои production: npm run build',
    ],
    code: 'import { Button, Stack } from "@mui/material";\nimport { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  function handleAdd() { setCount(count + 1); }\n  return <Stack sx={{ gap: "16px" }}>\n    <Button onClick={handleAdd} sx={{ textTransform: "none" }}>{count}</Button>\n  </Stack>;\n}',
    question: 'Vite ва React як вазифа доранд?',
    answer: 'Не. Vite dev/build-ро омода мекунад; React компонентҳо ва UI-ро render мекунад.',
    wrong: ['Ҳа, ҳарду database месозанд.', 'MUI ҷойи React state-ро мегирад.'],
    source: 'https://vite.dev/guide/',
  },
  {
    id: 'ui-libraries',
    month: 1,
    title: 'UI libraries and accessibility',
    ru: 'UI-библиотеки и доступность',
    why: 'MUI, Antd, shadcn ва Headless UI роҳҳои гуногуни сохтани UI ҳастанд. Барои як машқи сода ҳамаи онҳоро якҷо насб намекунем. HTML-и маънодор, label ва focus аз ранги зебо муҳимтаранд.',
    trigger:
      'Tab focus-ро ба тугма мебарад. Enter ё клик onClick-ро иҷро мекунад. Label ба input номи фаҳмо медиҳад.',
    flow: [
      'Як UI library интихоб кун',
      'Input бо label соз',
      'Бо Tab гузар',
      'Бо Enter тугмаро санҷ',
      'Focus-ро намоён нигоҳ дор',
    ],
    code: 'import { TextField, Button, Stack } from "@mui/material";\n\nexport default function SearchForm() {\n  return <Stack component="form" sx={{ gap: "16px" }}>\n    <TextField label="Ҷустуҷӯ" name="search" />\n    <Button type="submit" sx={{ textTransform: "none" }}>Ҷустуҷӯ</Button>\n  </Stack>;\n}',
    question: 'Input-и бе label барои чӣ мушкил мешавад?',
    answer: 'Корбар ва screen reader намефаҳманд, ки дар ин майдон чӣ нависанд.',
    wrong: [
      'Label React-ро ба backend табдил медиҳад.',
      'Input ҳатман бояд animation дошта бошад.',
    ],
    source: 'https://mui.com/material-ui/react-text-field/',
  },
  {
    id: 'local-persistence',
    month: 1,
    title: 'Theme, language and localStorage',
    ru: 'Тема, язык и localStorage',
    why: 'State дар хотира аст; баъди F5 аз нав оғоз мешавад. localStorage як нусхаи string-ро дар ҳамин браузер нигоҳ медорад. Ин global state ё синхронизацияи телефон нест.',
    trigger:
      'Ҳангоми mount қимати пешина хонда мешавад. Клик ҳам state ва ҳам нусхаи localStorage-ро иваз мекунад. Барои i18n калид ба луғати забони интихобшуда меравад; slider аз activeId вобаста мешавад.',
    flow: [
      'Mount',
      'localStorage.getItem',
      'Қимати хондашуда ба state',
      'Клик theme-ро иваз мекунад',
      'setTheme',
      'localStorage.setItem',
      'F5 → қимат аз нав хонда мешавад',
    ],
    code: 'import { useEffect, useState } from "react";\n\nexport default function ThemeButton() {\n  const [theme, setTheme] = useState("light");\n  useEffect(() => {\n    setTheme(localStorage.getItem("theme") || "light");\n  }, []);\n  function handleTheme() {\n    const nextTheme = theme === "light" ? "dark" : "light";\n    setTheme(nextTheme);\n    localStorage.setItem("theme", nextTheme);\n  }\n  return <button onClick={handleTheme}>{theme}</button>;\n}',
    question: 'localStorage маълумотро байни компютер ва телефон худаш мефиристад?',
    answer: 'Не. Маълумот ба origin ва браузери ҳамин дастгоҳ вобаста аст.',
    wrong: ['Ҳа, ҳамин маънои global state аст.', 'useState худаш localStorage-ро нав мекунад.'],
    source: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
  },
  {
    id: 'react-hook-form',
    month: 2,
    title: 'React Hook Form',
    ru: 'React Hook Form',
    why: 'register input-ро ба форма мепайвандад. handleSubmit аввал validation-ро мегузаронад. Агар field нодуруст бошад, onSubmit иҷро намешавад; errors-ро назди ҳамон field нишон медиҳем.',
    trigger:
      'submit → validation → onSubmit танҳо барои маълумоти дуруст. Хатои API аз хатои field ҷудо аст.',
    flow: [
      'register("name")',
      'Корбар матн менависад',
      'Submit',
      'required месанҷад',
      'Холӣ → errors.name',
      'Дуруст → onSubmit(values)',
    ],
    code: 'import { useForm } from "react-hook-form";\n\nexport default function NameForm() {\n  const { register, handleSubmit, formState: { errors } } = useForm();\n  function onSubmit(values) { console.log(values); }\n  return <form onSubmit={handleSubmit(onSubmit)}>\n    <input aria-label="Ном" {...register("name", { required: true })} />\n    {errors.name && <p>Номро навис</p>}\n    <button type="submit">Сабт</button>\n  </form>;\n}',
    question: 'Дар RHF handleSubmit кай onSubmit-ро иҷро мекунад?',
    answer: 'Баъди гузаштани validation бо values-и форма.',
    wrong: ['Дар ҳар render, ҳатто бе submit.', 'Фақат баъди reload шудани сайт.'],
    source: 'https://react-hook-form.com/get-started',
  },
  {
    id: 'formik',
    month: 2,
    title: 'Formik and Yup',
    ru: 'Formik и Yup',
    why: 'Formik values, errors ва touched-ро нигоҳ медорад. Yup қоидаи маълумотро месанҷад. touched нишон медиҳад, ки корбар аллакай бо field кор кардааст; аз ҳамин сабаб errors-ро баъди ламс кардан нишон додан мумкин.',
    trigger:
      'onChange values-ро, onBlur touched-ро нав мекунад; submit validation ва баъд onSubmit-ро иҷро мекунад.',
    flow: [
      'initialValues',
      'handleChange',
      'values.name нав мешавад',
      'handleBlur → touched.name',
      'Yup required',
      'handleSubmit → onSubmit',
    ],
    code: 'import { useFormik } from "formik";\nimport * as Yup from "yup";\n\nexport default function NameForm() {\n  const formik = useFormik({\n    initialValues: { name: "" },\n    validationSchema: Yup.object({ name: Yup.string().required("Номро навис") }),\n    onSubmit(values) { console.log(values); },\n  });\n  return <form onSubmit={formik.handleSubmit}>\n    <input name="name" aria-label="Ном" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />\n    {formik.touched.name && <p>{formik.errors.name}</p>}\n    <button type="submit">Сабт</button>\n  </form>;\n}',
    question: 'touched дар Formik чиро нишон медиҳад?',
    answer: 'Корбар бо кадом field аллакай кор кардааст, масалан аз input баромадааст.',
    wrong: ['Дар database чанд user ҳаст.', 'Кадом request ҳатман муваффақ мешавад.'],
    source: 'https://formik.org/docs/tutorial',
  },
  {
    id: 'typescript',
    month: 2,
    title: 'TypeScript for React',
    ru: 'TypeScript для React',
    why: 'TypeScript пеш аз иҷро shape-и props ва state-ро месанҷад. type Todo = { id: number; name: string } мегӯяд, ки объект чӣ дорад. Ин validation-и ҷавоби API дар runtime нест.',
    trigger:
      'Type checker ҳангоми санҷиш/build. Дар браузер type тоза мешавад; click ва render мисли JavaScript кор мекунанд.',
    flow: [
      'type Todo',
      'Props: item ва onDelete',
      'onDelete(id: number)',
      'Клик id-ро мефиристад',
      'Parent массивро нав мекунад',
      'TypeScript пешакӣ string id-ро хато мегӯяд',
    ],
    code: 'type Todo = { id: number; name: string };\ntype Props = { item: Todo; onDelete: (id: number) => void };\n\nexport default function TodoCard({ item, onDelete }: Props) {\n  return <button onClick={() => onDelete(item.id)}>{item.name}</button>;\n}',
    question: 'TypeScript оё ҷавоби API-ро дар runtime худаш месанҷад?',
    answer: 'Не. Type дар runtime нест; маълумоти берунаро алоҳида validate мекунем.',
    wrong: [
      'Ҳа, type ҳама response-ро автоматӣ ислоҳ мекунад.',
      'TypeScript ҳама хатои мантиқиро пешгирӣ мекунад.',
    ],
    source: 'https://www.typescriptlang.org/docs/handbook/react.html',
  },
  {
    id: 'data-fetching',
    month: 2,
    title: 'Requests, loading and errors',
    ru: 'Запросы, загрузка и ошибки',
    why: 'Запрос вақти иҷро дорад ва метавонад хато диҳад. Се чизро алоҳида нигоҳ дор: data, loading, error. Агар search зуд иваз шавад, ҷавоби кӯҳна набояд натиҷаи навро рӯпӯш кунад.',
    trigger:
      'Effect баъди mount ё тағйири dependency запросро оғоз мекунад. Cleanup-и мисол ҷавоби кӯҳнаро нодида мегирад; request-ро ҳатман қатъ намекунад.',
    flow: [
      'search тағйир ёфт',
      'cleanup-и effect-и пешина',
      'loading=true',
      'GET бо search',
      'response.ok санҷида мешавад',
      'Ҷавоби нав → setItems',
      'Хато → setError',
      'finally → loading=false',
    ],
    code: 'import { useEffect, useState } from "react";\n\nexport default function ProductList({ url }: { url: string }) {\n  const [items, setItems] = useState<{ id: number; name: string }[]>([]);\n  const [error, setError] = useState("");\n  useEffect(() => {\n    let ignore = false;\n    async function getData() {\n      try {\n        const response = await fetch(url);\n        if (!response.ok) throw new Error("Request failed");\n        const data = await response.json();\n        if (!ignore) setItems(data);\n      } catch { if (!ignore) setError("Хатои запрос"); }\n    }\n    getData();\n    return () => { ignore = true; };\n  }, [url]);\n  return <div>{error || items.map(item => <p key={item.id}>{item.name}</p>)}</div>;\n}',
    question: 'Ҷавоби search-и кӯҳна дертар биёяд, чӣ хатар дорад?',
    answer:
      'Метавонад натиҷаи search-и навро рӯпӯш кунад; ҷавоби кӯҳнаро ignore ё request-ро abort мекунем.',
    wrong: ['React худаш ҳамеша request-ҳоро бо тартиб мегузорад.', 'Dependency array лозим нест.'],
    source: 'https://react.dev/reference/react/useEffect',
  },
  {
    id: 'auth-flow',
    month: 2,
    title: 'Authentication flow',
    ru: 'Авторизация в приложении',
    why: 'Protected route танҳо UI-ро пинҳон мекунад. Сервер бояд session ва ҳуқуқи ҳар request-ро худаш санҷад. То маълум шудани session loading нишон деҳ; redirect-и бармаҳал накун.',
    trigger:
      'Submit login → сервер session месозад. Баъд ҳар амали ҳифзшуда дар сервер аз нав иҷозат санҷида мешавад.',
    flow: [
      'Формаи login',
      'Submit',
      'Сервер маълумотро месанҷад',
      'Session',
      'Дархости ҳифзшуда',
      '401: login лозим',
      '403: иҷозат нест',
    ],
    code: '// Мантиқи UI; иҷозати воқеӣ дар сервер санҷида мешавад.\nfunction Account({ status, user }) {\n  if (status === "loading") return <p>Loading...</p>;\n  if (!user) return <p>Login лозим</p>;\n  return <h1>{user.name}</h1>;\n}',
    question: 'Protected route-и React backend-ро ҳам муҳофизат мекунад?',
    answer: 'Не. Backend бояд session ва иҷозати request-ро худаш санҷад.',
    wrong: [
      'Ҳа, пинҳон кардани Button кофӣ аст.',
      'userId-и фиристодаи браузер ҳамеша боэътимод аст.',
    ],
    source: 'https://nextjs.org/docs/app/guides/authentication',
  },
];

type LessonText = readonly [tg: string, ru: string, en: string];

interface ReactTopicDetails {
  source?: string;
  sections: { title: LessonText; body: LessonText }[];
  quiz?: {
    id: string;
    question: LessonText;
    options: [LessonText, LessonText, LessonText];
    correctIndex: 0 | 1 | 2;
    explanation: LessonText;
  }[];
}
export const REACT_TOPIC_DETAILS: Record<string, ReactTopicDetails | undefined> = {
  'topic-1': {
    sections: [
      {
        title: [
          'Аз count то рақами нав дар тугма',
          'От count до нового числа на кнопке',
          'From count to the new number on the button',
        ],
        body: [
          'Дар мисол count аввал 0 аст ва тугма 0 нишон медиҳад. Клик handler-ро иҷро мекунад. setCount(count + 1) барои намоиши нав қимати 1-ро дархост мекунад. Дар render-и нав App аз count-и нав JSX месозад. Баъд React дар DOM матни тугмаро аз 0 ба 1 нав мекунад.',
          'В примере count начинается с 0, и кнопка показывает 0. После клика обработчик передаёт setCount(count + 1) значение 1 для нового рендера. При следующем рендере App строит JSX с новым count, затем React обновляет текст кнопки в DOM с 0 до 1.',
          'In the example, count starts at 0 and the button displays 0. A click runs the handler. setCount(count + 1) requests a render with 1. On that render, App returns JSX using the new count, then React updates the button text in the DOM from 0 to 1.',
        ],
      },
      {
        title: [
          'Санҷиши тағйири экран',
          'Проверка обновления экрана',
          'Check the visible update',
        ],
        body: [
          'Дар проекте, ки аллакай React дорад, мисоли тугмаро дар App истифода бар ва useState-ро import кун. Пеш аз клик рақамро бин. Ду клики алоҳида бояд пай дар пай 1 ва 2 бароранд. Агар рақамро мустақим дар DOM иваз кунӣ, state ҳоло қимати пешинаро дорад. Барои ин тугма тағйир аз setter сар мешавад.',
          'В готовом React-проекте поместите пример кнопки в App и импортируйте useState. Посмотрите число до клика. Два отдельных клика должны показать 1 и 2. При прямой замене текста в DOM состояние по-прежнему хранит старое значение. Для этой кнопки изменение начинается с setter.',
          'In an existing React project, use the button example in App and import useState. Check the number before clicking. Two separate clicks should show 1 and then 2. Editing the DOM text directly leaves state at its old value. For this button, the update begins with the setter.',
        ],
      },
    ],
  },
  'topic-2': {
    sections: [
      {
        title: [
          'Parent ва child дар карточкаи мол',
          'Родитель и дочерний компонент в карточке товара',
          'Parent and child in a product card',
        ],
        body: [
          'Дар саҳифаи мағоза parent, масалан Offers, рӯйхати молро медонад. ProductCard фақат намоиши як молро ба уҳда дорад. Агар Offers ба ProductCard объекти { name: "Tea" } диҳад, child дар h3 матни Tea мебарорад. Ба даъвати дигари ҳамон компонент { name: "Bread" } диҳӣ, карточкаи дуюм Bread нишон медиҳад.',
          'Родитель на странице магазина, например Offers, знает список товаров. ProductCard отвечает за отображение одного товара. Передайте из Offers объект { name: "Tea" }, и дочерний компонент покажет Tea в h3. В другом экземпляре той же карточки объект { name: "Bread" } даст заголовок Bread.',
          'A store page component such as Offers knows the product list. ProductCard handles the display of one product. Give it { name: "Tea" } from Offers, and its h3 shows Tea. Pass { name: "Bread" } to another instance of the same component and that card shows Bread.',
        ],
      },
      {
        title: [
          'Кай компонент ҷудо кардан фоида дорад',
          'Когда стоит выделить компонент',
          'When a separate component helps',
        ],
        body: [
          'Агар ду карточка ҳамон markup-ро бо номҳои гуногун нишон диҳанд, як ProductCard ҳар дурӯ месозад. Дар JSX номи компонентро бо ҳарфи калон сар кун. <ProductCard /> ба функсияи худат ишора мекунад. <productcard /> ҳамчун номи теги браузер фаҳмида мешавад. Як бор ду карточкаро бо ду номи мол санҷ.',
          'Если у двух карточек одинаковая разметка и разные названия, один ProductCard справится с обеими. Имя компонента в JSX начинается с заглавной буквы. <ProductCard /> обращается к вашей функции, а <productcard /> трактуется как имя DOM-тега. Проверьте два экземпляра с разными товарами.',
          'If two cards share their markup and display different names, one ProductCard can render both. Start a JSX component name with a capital letter. <ProductCard /> refers to your function, while <productcard /> is treated as a DOM tag name. Try two instances with different products.',
        ],
      },
    ],
  },
  'topic-3': {
    sections: [
      {
        title: [
          'Матн ва ифода дар JSX',
          'Текст и выражения в JSX',
          'Text and expressions in JSX',
        ],
        body: [
          'Дар <h1>name</h1> калимаи name айнан мебарояд. Агар const name = "Али" бошад, <h1>{name}</h1> қимати «Али»-ро нишон медиҳад. Мисли нархнома, як қисм матни доимист ва қисми дигар аз қимати имрӯза меояд. Дар дохили қавси ҷингила ифодаи JavaScript мондан мумкин, масалан {price * 2}.',
          'В <h1>name</h1> выводится буквально name. При const name = "Али" запись <h1>{name}</h1> покажет значение «Али». Как на ценнике, одна часть может быть постоянным текстом, а другая зависит от текущих данных. В фигурных скобках можно использовать выражение JavaScript, например {price * 2}.',
          'In <h1>name</h1>, the text is literally name. If const name = "Ali", then <h1>{name}</h1> displays Ali. Like a price sign, part of the markup can be fixed while another part comes from current data. Curly braces can contain a JavaScript expression such as {price * 2}.',
        ],
      },
      {
        title: [
          'Се қоидаи markup-и JSX',
          'Три правила разметки JSX',
          'Three JSX markup rules',
        ],
        body: [
          'Агар return ду теги ҳамсатҳ дошта бошад, онҳоро бо <section> ё Fragment-и <>...</> якҷо кун. Теги бе мазмунро мисли <img /> пӯш. Барои CSS class className истифода бар. Мисоли дарсро аввал бо матни доимӣ бин, баъд сарлавҳаро аз const name гир ва танҳо қимати name-ро иваз кун.',
          'Если return содержит два соседних тега, объедините их в <section> или фрагмент <>...</>. Тег без содержимого закройте как <img />. Для CSS-класса используйте className. Сначала проверьте пример с постоянным текстом, затем возьмите заголовок из const name и измените только значение name.',
          'If return contains two sibling tags, wrap them in a <section> or a fragment <>...</>. Close an empty tag as <img />. Use className for a CSS class. Check the example with static text, then render a heading from const name and change only the value of name.',
        ],
      },
    ],
  },
  'topic-4': {
    sections: [
      {
        title: [
          'Қимат аз куҷо ба props меояд',
          'Откуда в props берётся значение',
          'Where a prop’s value comes from',
        ],
        body: [
          'Вақте дар parent <UserCard name="Ali" age={22} /> менависӣ, UserCard дар параметраш name-и string ва age-и number мегирад. Дар JSX-и child {name} ва {age} «Ali — 22» нишон медиҳанд. Агар parent age={23} диҳад, render-и нав «Ali — 23» мебарорад. Номи prop дар ҷойи фиристодан ва хондан бояд як бошад.',
          'При записи <UserCard name="Ali" age={22} /> в родителе UserCard получает строку name и число age. В JSX дочернего компонента {name} и {age} показывают «Ali — 22». Когда родитель передаст age={23}, в новом рендере появится «Ali — 23». Имя prop должно совпадать при передаче и чтении.',
          'When the parent writes <UserCard name="Ali" age={22} />, UserCard receives a string name and a numeric age. Its JSX displays “Ali — 22” through {name} and {age}. If the parent passes age={23}, the next render shows “Ali — 23”. Use the same prop name where you pass and read it.',
        ],
      },
      {
        title: [
          'Қимат ва callback',
          'Значение и callback',
          'A value and a callback',
        ],
        body: [
          'Child props-ро мехонад. Барои он ки клик тағйир сар кунад, parent метавонад onSelect={handleSelect} диҳад. Child onSelect-ро баъди клик даъват мекунад. Қарор дар бораи нав кардани state ва қимати нави props дар parent мемонад. Барои санҷиш як UserCard-ро бо ду комбинатсияи name ва age render кун ва бубин, чӣ аз parent меояд.',
          'Дочерний компонент читает props. Чтобы клик инициировал изменение, родитель может передать onSelect={handleSelect}. Дочерний компонент вызывает onSelect по клику. Состояние и новые значения props остаются под управлением родителя. Для проверки отобразите две UserCard с разными name и age и проследите, что передал родитель.',
          'The child reads props. To let a click request a change, a parent can pass onSelect={handleSelect}. The child calls onSelect on click. The parent still owns the state and the next prop values. To check the flow, render two UserCard instances with different name and age values and trace what each receives.',
        ],
      },
    ],
  },
  'topic-5': {
    sections: [
      {
        title: [
          'Шакли якхела ва дохили гуногун',
          'Общая оболочка и разное содержимое',
          'One shared shell with different contents',
        ],
        body: [
          'Дар мағоза ду бастаи якшакл метавонанд моли гуногун дошта бошанд. Card wrapper-и якхела медиҳад, мисли section бо className="card". Дар даъвати аввал <h2>React</h2> ва <p>First lesson</p>, дар дуюм сарлавҳа ва тугма дода мешавад. Card ҳамон {children}-ро дар section мегузорад.',
          'У двух одинаковых упаковок в магазине может быть разное содержимое. Card задаёт общую оболочку, например section с className="card". В первый Card передаются <h2>React</h2> и <p>First lesson</p>, во второй — заголовок и кнопка. Card помещает полученный children внутрь section.',
          'Two packages of the same shape can hold different goods. Card supplies the shared shell, such as a section with className="card". Pass <h2>React</h2> and <p>First lesson</p> to the first Card and a heading plus button to the second. Card inserts each children value into the section.',
        ],
      },
      {
        title: [
          'Ҷойи children дар JSX',
          'Место для children в JSX',
          'Where children appears in JSX',
        ],
        body: [
          'Мазмуни байни тегҳо танҳо дар ҷойе мебарояд, ки Card онро render мекунад. Агар section-ро бе {children} баргардонӣ, рамка мемонаду сарлавҳаҳои ҳар ду Card намебароянд. Барои як санҷиши дигар ба корти дуюм тугмаи дигар деҳ ва бубин, ки корти аввал бетағйир мемонад.',
          'Содержимое между тегами появляется там, где Card выводит его. Если вернуть section без {children}, оболочка останется, но заголовки обеих карточек исчезнут. Для дополнительной проверки передайте во второй Card другую кнопку и убедитесь, что первая карточка не изменилась.',
          'Content between the tags appears where Card renders it. If Card returns a section without {children}, the shells remain and both headings disappear. As another check, give the second Card a different button and confirm that the first card stays as it was.',
        ],
      },
    ],
  },
  'topic-6': {
    sections: [
      {
        title: [
          'Чӣ хел id ба key мерасад',
          'Как id становится ключом',
          'How an ID becomes a key',
        ],
        body: [
          'Массиви users бо id-ҳои 10, 20, 30 дорад. map барои ҳар объект як <User /> месозад ва key={user.id} мегузорад. Агар id=20 аз миёна хориҷ шавад, 10 ва 30 key-и пешинаашонро нигоҳ медоранд. React метавонад ҳамон User-ҳои боқимондаро шиносад. Барои кори дохили User худи user-ро ҳамчун prop диҳ.',
          'В массиве users есть id 10, 20 и 30. map создаёт по <User /> для каждого объекта и задаёт key={user.id}. При удалении id=20 записи 10 и 30 сохраняют прежние ключи, и React может распознать оставшиеся экземпляры User. Чтобы компонент мог читать данные, передайте ему user отдельным prop.',
          'The users array has IDs 10, 20, and 30. map creates a <User /> for each entry and sets key={user.id}. Remove ID 20, and IDs 10 and 30 keep their original keys so React can identify the remaining User instances. Pass user separately for the component to read its data.',
        ],
      },
      {
        title: [
          'Бо reorder санҷидани key',
          'Как проверить ключи перестановкой',
          'Test keys by reordering the rows',
        ],
        body: [
          'Дар ҳар сатр input-и худаш бошад, ба сатри id=30 як калима навис. Баъд тартиби рӯйхатро дигар кун. Бо key-и доимии id, input ва state-и сатр ба ҳамон user вобаста мемонанд. Агар рӯйхати ивазшаванда index-ро ҳамчун key истифода барад, React ҷойи сатрро ҳамон элемент мепиндорад ва state метавонад ба user-и дигар часпад.',
          'Если у каждой строки свой input, введите слово в строке id=30, затем переставьте записи. Со стабильным ключом по id поле и состояние строки остаются у того же пользователя. Если в изменяемом списке ключом был индекс, React связывает экземпляр с позицией, и состояние может оказаться у другого пользователя.',
          'If each row has its own input, type a word in the row for ID 30 and then reorder the list. With a stable ID key, the row’s input and state stay with that user. With index keys in a changing list, React associates the row with its position, so state can end up attached to a different user.',
        ],
      },
    ],
  },
  'local-practice': {
    sections: [
      {
        title: [
          'Нав кардани рӯйхат аз рӯйи id',
          'Обновление списка по id',
          'Updating the list by ID',
        ],
        body: [
          'Тасаввур кун, ки дар анбор ду қуттӣ як ном доранд. Рақами ҳар қуттӣ фарқ мекунад. Дар Todo ҳам ду вазифа метавонанд номи «React» дошта бошанд, вале id-ашон ҷудост. Агар рӯйхат id-ҳои 1, 2 ва 3 дошта бошад, filter бо шарти item.id !== 2 рӯйхати нави 1 ва 3-ро медиҳад. setItems онро ба React медиҳад ва дар render-и нав тугмаи вазифаи 2 дигар намебарояд.',
          'Представьте две коробки с одинаковой надписью и разными номерами. Так и у двух задач «React» могут быть разные id. Если в списке есть id 1, 2 и 3, условие item.id !== 2 в filter оставит 1 и 3. Передайте новый массив в setItems, и при следующем рендере кнопка задачи 2 исчезнет.',
          'Imagine two boxes with the same label and different numbers. Two tasks named “React” can have different IDs too. For IDs 1, 2, and 3, filtering with item.id !== 2 leaves IDs 1 and 3 in a new array. Pass it to setItems, and the next render omits the button for task 2.',
        ],
      },
      {
        title: [
          'Аз Delete ба Edit гузаштан',
          'От удаления к редактированию',
          'Moving from Delete to Edit',
        ],
        body: [
          'Дар Edit ҳамаи вазифаҳо бояд дар рӯйхат монанд. map аз ҳар вазифа мегузарад. Барои id-и интихобшуда объекти нав бо номи нав месозем. Дигар объектҳо бетағйир бармегарданд. Агар ҳисоб аз state-и охирин вобаста бошад, setItems(prev => prev.map(...)) истифода мешавад. Барои санҷиш ду номи якхела мон ва фақат номи вазифаи бо id-и 2-ро иваз кун.',
          'При редактировании все задачи остаются в списке. map обходит каждую задачу. Для выбранного id верните новый объект с новым именем. Остальные объекты верните без изменений. Если обновление зависит от текущего состояния, используйте setItems(prev => prev.map(...)). Проверьте результат на двух одинаковых именах и измените только задачу с id 2.',
          'Edit keeps every task in the list. map visits each task. Return a new object with the new name for the selected ID, and return every other object as it was. When the update uses the current state, use setItems(prev => prev.map(...)). Try two tasks with the same name and edit only the one with ID 2.',
        ],
      },
    ],
    quiz: [
      {
        id: 'delete-id',
        correctIndex: 0,
        question: [
          'Дар рӯйхат вазифаҳои id=5 ва id=7 ҳар ду «React» ном доранд. Барои нест кардани id=7 кадом шарт дуруст аст?',
          'У задач id=5 и id=7 одинаковое имя «React». Какое условие filter удалит только задачу 7?',
          'Tasks 5 and 7 are both named “React.” Which filter condition removes only task 7?',
        ],
        options: [
          [
            'item.id !== 7',
            'item.id !== 7',
            'item.id !== 7',
          ],
          [
            'item.name !== "React"',
            'item.name !== "React"',
            'item.name !== "React"',
          ],
          [
            'item.id === 7',
            'item.id === 7',
            'item.id === 7',
          ],
        ],
        explanation: [
          'filter элементеро мемонад, ки шарт барояш true аст. Аз ҳамин сабаб танҳо вазифаи 7 берун мемонад. Бо name филтр кунӣ, ҳар ду вазифа нест мешаванд.',
          'filter оставляет элементы, для которых условие истинно. Поэтому исчезает только задача 7. Фильтрация по имени убрала бы обе задачи.',
          'filter keeps items for which the condition is true. This excludes only task 7. Filtering by the shared name would remove both tasks.',
        ],
      },
      {
        id: 'edit-item',
        correctIndex: 1,
        question: [
          'Барои иваз кардани номи як вазифа шумораи элементҳо бояд бетағйир монад. Кадом амал мувофиқ аст?',
          'Нужно переименовать одну задачу, сохранив размер списка. Какое действие подходит?',
          'You need to rename one task without changing the list length. Which operation fits?',
        ],
        options: [
          [
            'Бо filter танҳо вазифаи интихобшударо мемонем.',
            'Использовать filter и оставить только выбранную задачу.',
            'Use filter to keep only the selected task.',
          ],
          [
            'Бо map объекти id-и интихобшударо иваз мекунем.',
            'Использовать map и заменить объект выбранной задачи.',
            'Use map to replace the object for the selected ID.',
          ],
          [
            'Номи навро ҳамчун вазифаи иловагӣ дохил мекунем.',
            'Добавить новое имя отдельной задачей в конец списка.',
            'Append the new name as a separate task.',
          ],
        ],
        explanation: [
          'map барои ҳар элементи пешина як элемент бармегардонад. Аз ҳамин сабаб дарозии рӯйхат мемонад ва фақат объекти интихобшуда иваз мешавад.',
          'map возвращает по элементу на каждый старый элемент. Длина списка сохраняется, меняется только выбранный объект.',
          'map returns one item for each old item. The list length stays the same while the selected object changes.',
        ],
      },
    ],
  },
  'tooling': {
    sections: [
      {
        title: [
          'Аз save то экрани нав',
          'От сохранения файла до экрана',
          'From saving a file to the screen',
        ],
        body: [
          'Дар ошхона танӯр хӯрокро тайёр мекунад. Зарф фақат барои пешкаш кардан аст. Дар проект Vite файлҳоро ба браузер мерасонад, React логикаи компонентро иҷро мекунад ва MUI Button-и тайёр медиҳад. Вақте App.jsx-ро save мекунӣ, dev server тағйирро ба браузер мерасонад. Вақте ба Button клик мекунӣ, handleAdd иҷро мешавад ва React рақамро нав мекунад.',
          'На кухне духовка готовит блюдо, а тарелка нужна для подачи. В проекте Vite доставляет модули в браузер, React выполняет логику компонента, а MUI предоставляет готовую кнопку. При сохранении App.jsx сервер разработки передаёт изменение в браузер. Клик по кнопке вызывает handleAdd, и React обновляет число.',
          'In a kitchen the oven cooks the food and the plate is for serving it. In the project, Vite delivers modules to the browser, React runs component logic, and MUI provides a ready-made button. Saving App.jsx sends a code change from the development server to the browser. Clicking the button runs handleAdd and React updates the number.',
        ],
      },
      {
        title: [
          'Мушкили build аз куҷо сар мешавад',
          'Где искать причину сбоя сборки',
          'Where to start when a build fails',
        ],
        body: [
          'Агар скрипти build ба vite build пайваст бошад, он файлҳои production месозад. Сервери dev барои кор бо файлҳои исходник аст. Агар build хатои import диҳад, дар terminal аввал номи файл ва бастаеро бин, ки ёфт нашуд. Баъд package.json ва import-ро муқоиса кун. Барои хатои клик аввал console ва handler-ро месанҷем.',
          'Если скрипт build запускает vite build, он собирает файлы для production. Сервер dev нужен для работы с исходниками. Если сборщик сообщает об ошибке импорта, сначала найдите в терминале файл и имя отсутствующего модуля. Затем сравните package.json и сам импорт. При ошибке по клику сначала проверьте консоль и обработчик.',
          'When the build script runs vite build, it produces production files. The dev server is for working with source files. If the build reports an import error, start with the file and module named in the terminal. Then compare the import with package.json. For a click error, start with the browser console and its event handler.',
        ],
      },
    ],
    quiz: [
      {
        id: 'production-build',
        correctIndex: 0,
        question: [
          'Дар package.json скрипти build ба vite build пайваст аст. Бо npm run build чӣ мешавад?',
          'В package.json команда build запускает vite build. Что произойдёт при npm run build?',
          'In package.json, the build script runs vite build. What happens when you run npm run build?',
        ],
        options: [
          [
            'Vite файлҳои production месозад.',
            'Vite собирает файлы для production.',
            'Vite generates production files.',
          ],
          [
            'Vite сервери dev-ро бо HMR оғоз мекунад.',
            'Vite запускает dev-сервер с HMR.',
            'Vite starts a development server with HMR.',
          ],
          [
            'MUI handler-ҳои Button-ро иҷро мекунад.',
            'MUI запускает обработчики кнопок.',
            'MUI calls the button handlers.',
          ],
        ],
        explanation: [
          'Скрипти build аз package.json фармони ҷамъкуниро иҷро мекунад. Dev server одатан бо скрипти dev оғоз мешавад.',
          'Скрипт build в package.json запускает сборку. Сервер разработки обычно запускается отдельным скриптом dev.',
          'The build script in package.json runs the build command. The development server normally uses a separate dev script.',
        ],
      },
      {
        id: 'button-handler',
        correctIndex: 0,
        question: [
          'Тугмаи MUI се бор клик шуд. handleAdd бо setCount рақамро нав мекунад. Нав шудани рақам аз чӣ меояд?',
          'Кнопку MUI нажали три раза. handleAdd вызывает setCount. За счёт чего обновляется число?',
          'The MUI button is clicked three times. handleAdd calls setCount. What updates the number?',
        ],
        options: [
          [
            'React баъди setCount компонентро аз нав render мекунад.',
            'React перерисовывает компонент после setCount.',
            'React renders the component after setCount.',
          ],
          [
            'Vite пас аз ҳар клик аз нав build мекунад.',
            'Vite заново собирает проект после каждого клика.',
            'Vite rebuilds the project after every click.',
          ],
          [
            'MUI рақамро мустақим ба DOM менависад.',
            'MUI напрямую записывает число в DOM.',
            'MUI writes the number directly into the DOM.',
          ],
        ],
        explanation: [
          'Button рӯйдодро ба onClick медиҳад. Навсозӣ аз setCount сар мешавад ва React рақами навро ба UI мебарорад.',
          'Button передаёт событие в onClick. Обновление начинается с setCount, и новое число попадает в UI при рендере React.',
          'Button passes the event to onClick. The update starts with setCount, and React renders the new number in the UI.',
        ],
      },
    ],
  },
  'ui-libraries': {
    sections: [
      {
        title: [
          'Номи input баъди навиштан ҳам мемонад',
          'Название поля остаётся при вводе',
          'The input label stays available while typing',
        ],
        body: [
          'Дар анбор рӯйи раф номи мол меистад, ҳатто вақте қуттӣ пур аст. Дар форма label ҳам вазифаи майдонро мегӯяд. Бо TextField label="Ҷустуҷӯ" истифода кун. Placeholder намунаи матн буда метавонад, вале вақте менависӣ, дигар дида намешавад. Пеш аз ороиш, номи ҳар майдонро равшан мон.',
          'На складе название на полке остаётся видимым и после того, как её заполнили. В форме label так же объясняет назначение поля. Для TextField укажите label="Поиск". Placeholder подходит для примера ввода и исчезает при наборе. Сначала дайте каждому полю понятное имя.',
          'A warehouse shelf keeps its label after it fills up. A form label similarly identifies the field. Set label="Search" on TextField. A placeholder can give an example and disappears when typing starts. Give each field a clear name before styling it.',
        ],
      },
      {
        title: [
          'Формаро бе муш санҷ',
          'Проверка формы без мыши',
          'Checking the form without a mouse',
        ],
        body: [
          'Бо Tab ба майдон даро, матн навис, бо Tab ба тугма гузар ва Enter пахш кун. Нишонаи focus бояд нишон диҳад, ки клавиатура ҳоло ба кадом элемент таъсир дорад. Агар тугма type="submit" дар дохили form бошад, submit-и формаиро метавон дар onSubmit-и худи form идора кард.',
          'Нажмите Tab до поля, введите текст, перейдите к кнопке и нажмите Enter. Видимый фокус должен показывать, какой элемент сейчас управляется клавиатурой. Если внутри form есть кнопка с type="submit", обработчик onSubmit самой формы может принимать отправку.',
          'Tab to the field and type, then Tab to the button and press Enter. The visible focus indicator should tell you which element the keyboard controls. With a type="submit" button inside a form, the form’s onSubmit handler can handle submission.',
        ],
      },
    ],
    quiz: [
      {
        id: 'keyboard-focus',
        correctIndex: 0,
        question: [
          'Бе муш ба тугма бо Tab мерасӣ, вале намефаҳмӣ ҳозир дар кадом элемент ҳастӣ. Аввал чиро месанҷӣ?',
          'Кнопка доступна через Tab, но непонятно, на каком элементе сейчас клавиатура. Что проверить первым?',
          'Tab reaches the button, but you cannot tell which element has the keyboard focus. What should you check first?',
        ],
        options: [
          [
            'Нишонаи focus дида мешавад ё не.',
            'Видно ли обозначение фокуса.',
            'Whether the focus indicator is visible.',
          ],
          [
            'Майдон placeholder-и дароз дорад ё не.',
            'Есть ли у поля длинный placeholder.',
            'Whether the field has a long placeholder.',
          ],
          [
            'Дар тугма иконка ҳаст ё не.',
            'Есть ли на кнопке иконка.',
            'Whether the button has an icon.',
          ],
        ],
        explanation: [
          'Focus нишон медиҳад, ки Enter ба кадом элемент таъсир мекунад. Нишонаи намоёни focus-ро бо клавиатура санҷ.',
          'Фокус показывает, какой элемент отреагирует на Enter. Проверяйте его видимость с клавиатуры.',
          'Focus tells you which element responds to Enter. Use the keyboard to verify that the indicator is visible.',
        ],
      },
    ],
  },
  'local-persistence': {
    sections: [
      {
        title: [
          'Чӣ дар экран аст ва чӣ дар storage',
          'Что на экране и что в хранилище',
          'What is on screen and what is in storage',
        ],
        body: [
          'Тағйири theme мисли интихоби рӯшноии хона аст. State рӯшноии ҳозираро идора мекунад. localStorage як қайд барои бозкушоии баъдӣ аст. setTheme("dark") UI-ро нав мекунад. localStorage.setItem("theme", "dark") интихобро нигоҳ медорад. Агар яке аз онҳо набошад, UI-и ҳозира ё интихоби баъди reload метавонад фарқ кунад.',
          'Смена темы похожа на переключение света. State управляет текущим отображением, а localStorage хранит записанный выбор для следующего открытия. setTheme("dark") обновляет UI. localStorage.setItem("theme", "dark") сохраняет выбор. Без одного из действий тема сейчас и после перезагрузки может отличаться.',
          'Changing themes is like switching a light. State drives what you see now, and localStorage records the choice for a future visit. setTheme("dark") updates the UI. localStorage.setItem("theme", "dark") stores the choice. Without one of these actions, the theme could differ now and after a reload.',
        ],
      },
      {
        title: [
          'Калиди гумшуда ва қимати нодуруст',
          'Отсутствующий ключ и неверное значение',
          'Missing keys and unexpected values',
        ],
        body: [
          'Агар калиди theme набошад, getItem null медиҳад. Барои UI-и дорои ду theme қимати хондашударо бисанҷ: "dark" қабул мешавад, дар дигар ҳолат "light" гир. Дар санҷиш theme-ро иваз кун, F5 зан ва натиҷаро бин. Баъд калидро аз DevTools хориҷ кун, то санҷӣ, ки fallback дуруст аст.',
          'Если ключа theme нет, getItem вернёт null. Для UI с двумя темами проверьте прочитанное значение: примите "dark", в других случаях используйте "light". При проверке смените тему, обновите страницу и сравните результат. Затем удалите ключ в DevTools и проверьте запасное значение.',
          'When the theme key is absent, getItem returns null. For a UI with two themes, validate the stored value: accept "dark" and use "light" otherwise. To check it, change the theme, reload, and inspect the result. Then remove the key in DevTools to test the fallback.',
        ],
      },
    ],
    quiz: [
      {
        id: 'stored-theme',
        correctIndex: 0,
        question: [
          'Дар storage қимати "dark" монда буд. Компонент mount шуд ва effect ин қиматро ба state дод. Пас аз навсозӣ кадом theme дида мешавад?',
          'В хранилище записано "dark". Компонент открылся, и effect записал прочитанное значение в state. Какую тему увидит пользователь после обновления state?',
          'Storage contains "dark". The component mounts and its effect writes that value to state. Which theme does the user see after the state update?',
        ],
        options: [
          [
            'Dark, аз state-и нав.',
            'Dark, из обновлённого state.',
            'Dark, from the updated state.',
          ],
          [
            'Light, аз қимати аввали useState.',
            'Light, из исходного значения useState.',
            'Light, from the initial useState value.',
          ],
          [
            'Ҳеҷ theme то клики нав намебарояд.',
            'Тема появится только после нового клика.',
            'The theme stays hidden until a new click.',
          ],
        ],
        explanation: [
          'useState қимати аввалиро медиҳад. Баъди он ки effect "dark"-ро хонду setTheme кард, UI аз state-и нав theme-и dark-ро мегирад.',
          'useState задаёт исходное значение. Когда effect прочитает "dark" и вызовет setTheme, UI возьмёт тёмную тему из нового состояния.',
          'useState supplies the initial value. Once the effect reads "dark" and calls setTheme, the UI uses the dark theme from the new state.',
        ],
      },
    ],
  },
  'react-hook-form': {
    sections: [
      {
        title: [
          'Ном барои пайваст кардани майдон',
          'Имя для подключения поля',
          'The field name connects input and data',
        ],
        body: [
          'Ба мисли варақаи фармоиш, ҳар майдон номи худро дорад. register("name") майдони номро ба форма мепайвандад. Вақте «Сабт» пахш мешавад, handleSubmit аввал қоидаҳоро месанҷад. Агар name холӣ ва required бошад, errors.name пайдо мешавад. Агар «Али» нависӣ ва боз submit кунӣ, onSubmit бо values.name = "Али" иҷро мешавад.',
          'Как в бланке заказа, у каждого поля есть своё имя. register("name") подключает поле имени к форме. При отправке handleSubmit проверяет правила. Если обязательное name пусто, появляется errors.name. После ввода «Али» успешная отправка вызывает onSubmit с values.name = "Али".',
          'Like an order form, each field has its own name. register("name") connects the name input to the form. On submission, handleSubmit checks the rules. If the required name is empty, errors.name is set. Enter “Ali” and a valid submission calls onSubmit with values.name = "Ali".',
        ],
      },
      {
        title: [
          'Ду санҷиш барои як форма',
          'Две проверки одной формы',
          'Two checks for one form',
        ],
        body: [
          'Аввал формаро холӣ фирист. Дар назди input паёми хато бин ва санҷ, ки onSubmit ҳоло иҷро нашуд. Баъд номи дуруст навис ва қимати гирифтаи onSubmit-ро бин. Агар onSubmit ба API муроҷиат кунад, хатои серверро ҳам дар handler гир ва дар форма фаҳмо нишон деҳ.',
          'Сначала отправьте пустую форму. Проверьте сообщение у поля и убедитесь, что onSubmit не вызван. Затем введите имя и проверьте, что получил onSubmit. Когда внутри onSubmit есть запрос к API, обработайте исключение и покажите понятное сообщение пользователю.',
          'Submit the form empty first. Check the message next to the field and confirm onSubmit did not run. Then enter a name and inspect the value received by onSubmit. When onSubmit sends an API request, handle failures and show the user a clear message.',
        ],
      },
    ],
    quiz: [
      {
        id: 'empty-required',
        correctIndex: 0,
        question: [
          'Input бо register("name", { required: true }) пайваст аст. Агар холӣ submit шавад, чӣ мешавад?',
          'Поле подключено через register("name", { required: true }). Что произойдёт при пустой отправке?',
          'The field is registered with register("name", { required: true }). What happens on an empty submission?',
        ],
        options: [
          [
            'errors.name пайдо мешавад ва onSubmit иҷро намешавад.',
            'Появится errors.name, и onSubmit не вызовется.',
            'errors.name is set and onSubmit does not run.',
          ],
          [
            'onSubmit values.name = "" мегирад.',
            'onSubmit получит values.name = "".',
            'onSubmit receives values.name = "".',
          ],
          [
            'Қимати name худкор ба "required" иваз мешавад.',
            'name автоматически станет строкой "required".',
            'The name automatically becomes "required".',
          ],
        ],
        explanation: [
          'handleSubmit қоидаи required-ро пеш аз callback месанҷад. Дар ин ҳолат объект барои санҷиши хатоҳо майдони name дорад.',
          'handleSubmit проверяет required до вызова callback. В этом случае объект ошибок содержит поле name.',
          'handleSubmit checks required before the callback. Here the errors object contains an entry for name.',
        ],
      },
      {
        id: 'field-key',
        correctIndex: 1,
        question: [
          'Дар input register("city") истифода шуд. onSubmit номи шаҳрро аз кадом майдон мегирад?',
          'В поле используется register("city"). Из какого поля onSubmit получит город?',
          'The input uses register("city"). Which key gives onSubmit the city?',
        ],
        options: [
          [
            'values.name',
            'values.name',
            'values.name',
          ],
          [
            'values.city',
            'values.city',
            'values.city',
          ],
          [
            'errors.city',
            'errors.city',
            'errors.city',
          ],
        ],
        explanation: [
          'Номе, ки ба register медиҳӣ, калиди маълумоти форма мешавад. errors.city барои мушкили ҳамин майдон аст.',
          'Имя в register становится ключом в данных формы. errors.city описывает ошибку этого поля.',
          'The name passed to register becomes the form data key. errors.city describes a field error.',
        ],
      },
    ],
  },
  'formik': {
    sections: [
      {
        title: [
          'Қимат, хато ва touched',
          'Значение, ошибка и touched',
          'Value, error, and touched',
        ],
        body: [
          'Дар дафтари фармоиш се чизро ҷудо бин: номи навишта, хато дар ном ва нишоне, ки майдонро аллакай дидаанд. Formik ҳаминҳоро дар values, errors ва touched ҷудо мекунад. Вақте field-и холӣ blur мешавад, touched.name true шуда метавонад. Агар Yup барои name қоидаи required дошта бошад, дар UI метавонед errors.name-ро баъди touched нишон диҳед.',
          'В бланке заказа удобно различать записанное имя, ошибку в нём и отметку о посещении поля. Formik хранит эти данные в values, errors и touched. После ухода из пустого поля touched.name может стать true. Если Yup требует имя, интерфейс может показать errors.name после этого действия.',
          'An order form can distinguish the entered name, its error, and whether the field was visited. Formik keeps these in values, errors, and touched. After leaving an empty field, touched.name can become true. If Yup requires a name, the UI can then show errors.name.',
        ],
      },
      {
        title: [
          'Тартиби санҷиши форма',
          'Порядок проверки формы',
          'The form validation sequence',
        ],
        body: [
          'Формаро кушо ва пеш аз навиштан паёми error-ро бин. Барои policy-и «баъди ламс» он ҳоло пинҳон аст. Ба майдон даро, холӣ баро ва бин, ки паём пайдо шуд. Номи дуруст навис, submit кун ва values.name-ро санҷ. Барои ин мисол қоидаи Yup номи холиро мегирад. Агар танҳо фосиларо низ рад кардан хоҳӣ, қоидаи trim-ро алоҳида бисанҷ.',
          'Откройте форму. При правилах показа «после посещения» сообщение ещё скрыто. Войдите в поле и уйдите, оставив его пустым. Сообщение должно появиться. Затем введите имя, отправьте форму и проверьте values.name. В примере Yup проверяет пустое имя. Если требуется отклонять ввод из одних пробелов, отдельно проверьте правило trim.',
          'Open the form. With a visited-field display rule, the error is initially hidden. Focus and leave the empty field and check that the message appears. Then enter a name, submit, and inspect values.name. Yup’s rule in this example catches an empty name. If whitespace-only input should also fail, test a trim rule separately.',
        ],
      },
    ],
    quiz: [
      {
        id: 'error-after-blur',
        correctIndex: 1,
        question: [
          'Дар Formik номи холӣ errors.name дорад. UI танҳо touched.name && errors.name-ро нишон медиҳад. Паём кай дида мешавад?',
          'Пустое имя уже имеет errors.name. UI показывает touched.name && errors.name. Когда сообщение станет видно?',
          'An empty name has errors.name. The UI renders touched.name && errors.name. When does the message become visible?',
        ],
        options: [
          [
            'Ҳамон лаҳзае, ки errors.name ҳаст, ҳатто бо touched.name = false.',
            'Сразу при errors.name, даже если touched.name = false.',
            'As soon as errors.name exists, even with touched.name = false.',
          ],
          [
            'Вақте touched.name true мешавад.',
            'Когда touched.name станет true.',
            'When touched.name becomes true.',
          ],
          [
            'Танҳо пас аз ҷавоби сервер.',
            'Только после ответа сервера.',
            'Only after a server response.',
          ],
        ],
        explanation: [
          'Барои ин ифода ҳар ду шарт лозиманд. Агар touched.name false бошад, errors.name дар экран намебарояд.',
          'В этом выражении нужны обе части. При touched.name = false сообщение errors.name скрыто.',
          'Both parts of the expression must be truthy. While touched.name is false, errors.name stays hidden.',
        ],
      },
      {
        id: 'schema-role',
        correctIndex: 2,
        question: [
          'Кадом қисм қоидаи “name холӣ набошад”-ро месанҷад ва кадом қисм маълумоти формаро нигоҳ медорад?',
          'Что проверяет правило «name не пустое» и что хранит состояние формы?',
          'What checks the “name is not empty” rule, and what tracks form state?',
        ],
        options: [
          [
            'Formik қоидаи Yup-ро иваз мекунад, Yup values-ро дар input менависад.',
            'Formik заменяет правило Yup, а Yup передаёт values в input.',
            'Formik replaces the Yup rule, and Yup sets the input values.',
          ],
          [
            'HTML ин ду корро аз touched иҷро мекунад.',
            'HTML выполняет обе задачи по touched.',
            'HTML handles both jobs using touched.',
          ],
          [
            'Yup schema қоидаро месанҷад, Formik state-и формаро нигоҳ медорад.',
            'Схема Yup проверяет правило, Formik ведёт состояние формы.',
            'The Yup schema checks the rule, and Formik tracks form state.',
          ],
        ],
        explanation: [
          'validationSchema ба Formik қоидаи Yup медиҳад. Маълумоте, ки корбар навишт, дар formik.values дастрас аст.',
          'validationSchema передаёт Formik правила Yup. Введённые данные доступны в formik.values.',
          'validationSchema gives Formik the Yup rules. The entered data is available in formik.values.',
        ],
      },
    ],
  },
  'data-fetching': {
    sections: [
      {
        title: [
          'Loading, error ва натиҷаи холӣ',
          'Загрузка, ошибка и пустой результат',
          'Loading, errors, and empty results',
        ],
        body: [
          'Вақте анбор фармоишро меҷӯяд, аввал ҷавоб ҳоло омода нест. Баъд фармоиш ёфт мешавад, рӯйхат холӣ мебарояд ё ҷустуҷӯ хато медиҳад. UI ҳам бояд ин ҳолатҳоро фарқ кунад. Loading ҳангоми интизорӣ аст. Empty танҳо баъди ҷавоби муваффақ бо [] аст. Error вақте аст, ки гирифтани маълумот иҷро нашуд.',
          'На складе поиск заказа начинается с ожидания ответа. Затем заказ находится, список оказывается пустым либо поиск завершается ошибкой. UI тоже должен различать эти состояния. Loading означает ожидание. Empty показывают после успешного ответа с []. Error означает, что запрос не удался.',
          'When a warehouse looks up an order, the response starts out pending. Then the order is found, the list comes back empty, or the lookup fails. The UI should distinguish these cases. Loading means pending. Empty follows a successful response with []. Error signals an unsuccessful request.',
        ],
      },
      {
        title: [
          'Вақте ҷавобҳо бо тартиби дигар меоянд',
          'Когда ответы приходят не по порядку',
          'When responses arrive out of order',
        ],
        body: [
          'Корбар аввал «но» ва баъд «ноут» менависад. Ҷавоби «ноут» метавонад тезтар биёяд. Дар effect-и вобаста ба url, cleanup-и request-и пешина ignore-ро true мекунад. Агар ҷавоби «но» дертар расад, setItems-и он иҷро намешавад. Барои санҷиш ҷавоби аввали request-ро дар муҳити санҷиш дер кун ва бин, ки натиҷаи ҷустуҷӯи нав мемонад.',
          'Пользователь вводит «но», затем «ноут». Ответ на «ноут» может прийти первым. В effect с зависимостью url очистка старого эффекта устанавливает его ignore в true. Поздний ответ на «но» уже не вызовет setItems. Для проверки искусственно задержите первый ответ в тестовой среде и убедитесь, что остаётся новый результат.',
          'A user types “no” and then “notebook.” The response for “notebook” may arrive first. In an effect that depends on url, cleanup sets the previous effect’s ignore flag to true. A later response for “no” then skips setItems. In a test environment, delay the first response and check that the newer results remain visible.',
        ],
      },
    ],
    quiz: [
      {
        id: 'empty-success',
        correctIndex: 1,
        question: [
          'API бо 200 ва массиви [] ҷавоб дод. Корбар чиро бояд бинад?',
          'API ответил 200 и вернул массив []. Что показать пользователю?',
          'The API returned 200 with an empty array []. What should the user see?',
        ],
        options: [
          [
            'Spinner, ки мунтазири ҳамон request аст.',
            'Индикатор загрузки этого запроса.',
            'A spinner for the same pending request.',
          ],
          [
            'Паёми «Натиҷа ёфт нашуд».',
            'Сообщение «Ничего не найдено».',
            'A “No results found” message.',
          ],
          [
            'Паёми «Хатои API».',
            'Сообщение «Ошибка API».',
            'An “API error” message.',
          ],
        ],
        explanation: [
          'Дархост бомуваффақият тамом шуд, вале элемент надорад. Empty аз loading ва error фарқ мекунад.',
          'Запрос завершился успешно, но элементов нет. Пустой результат отличается от загрузки и ошибки.',
          'The request finished successfully without items. An empty result is different from loading or a failure.',
        ],
      },
      {
        id: 'response-ok',
        correctIndex: 1,
        question: [
          'fetch ҷавоби HTTP 500 гирифт. Дар қадами пеш аз response.json() кадом санҷиш мувофиқ аст?',
          'fetch получил HTTP 500. Какую проверку уместно сделать перед response.json()?',
          'fetch received HTTP 500. Which check should run before response.json()?',
        ],
        options: [
          [
            'Агар Promise resolve шуд, ҷавобро ҳамчун муваффақ қабул кун.',
            'Считать ответ успешным, раз Promise завершился.',
            'Treat the response as successful because the Promise resolved.',
          ],
          [
            'response.ok-ро санҷ ва ҷавобро ҳамчун хатои дархост коркард кун.',
            'Проверить response.ok и обработать неуспешный HTTP-ответ.',
            'Check response.ok and handle the failed HTTP response.',
          ],
          [
            'Фақат response.bodyUsed-ро санҷ.',
            'Проверить только response.bodyUsed.',
            'Check only response.bodyUsed.',
          ],
        ],
        explanation: [
          'fetch барои ҷавоби HTTP 500 метавонад Response диҳад. response.ok барои чунин status false аст. Баъд UI метавонад паёми error нишон диҳад.',
          'Даже при HTTP 500 fetch может вернуть Response. Для такого статуса response.ok равен false. После проверки UI может показать сообщение об ошибке.',
          'fetch can resolve with a Response for HTTP 500. response.ok is false for that status, giving the UI a way to show a request error.',
        ],
      },
    ],
  },
  'auth-flow': {
    sections: [
      {
        title: [
          'Се ҳолати экрани account',
          'Три состояния страницы аккаунта',
          'Three states of the account page',
        ],
        body: [
          'Мисли даромадгоҳи коргоҳ, аввал санҷиш мегузарад, баъд роҳ кушода ё дархости даромадан нишон дода мешавад. Агар status ҳоло "loading" аст, паёми интизорӣ нишон деҳ. Агар session нест, link-и login мон. Агар session ва иҷозати мувофиқ ҳастанд, экрани account-ро нишон деҳ.',
          'У входа в мастерскую сначала проходит проверка, а затем открывается проход или просят оформить вход. Пока status равен "loading", покажите ожидание. Если сессии нет, дайте ссылку на вход. При действующей сессии и подходящих правах покажите экран аккаунта.',
          'At a workshop entrance, a check happens before the door opens or visitors are asked to sign in. While status is "loading", show a waiting state. If there is no session, show a sign-in link. With a valid session and suitable permission, show the account screen.',
        ],
      },
      {
        title: [
          'Ҷойи санҷиши иҷозат',
          'Где проверяют права',
          'Where permission is checked',
        ],
        body: [
          'Тугмаи пинҳон UI-ро фаҳмо мекунад. Сервер пеш аз амали ҳифзшуда бояд session ва ҳуқуқи корбарро барои ҳамон маълумот бисанҷад. Барои санҷиши UI се ҳолати сохта истифода бар: session ҳоло номаълум, session нест, session ҳаст. Паёмҳо бояд ба ҳар ҳолат мувофиқ бошанд.',
          'Скрытая кнопка упрощает интерфейс. Перед защищённым действием сервер проверяет сессию и право пользователя на конкретные данные. Для проверки интерфейса задайте три тестовых состояния: сессия ещё определяется, сессии нет, сессия есть. Проверьте соответствующее сообщение в каждом случае.',
          'Hiding a button simplifies the interface. Before a protected action, the server checks the session and the user’s permission for the specific data. Test the UI with three simulated states: session pending, session absent, and session present. Check that each shows the appropriate message.',
        ],
      },
    ],
    quiz: [
      {
        id: 'pending-session',
        correctIndex: 2,
        question: [
          'Саҳифаи account нав кушода шуд ва санҷиши session ҳоло идома дорад. UI ҳоло чӣ нишон диҳад?',
          'Страница аккаунта открылась, а проверка сессии ещё идёт. Что сейчас показать в UI?',
          'The account page has opened and the session check is still pending. What should the UI show now?',
        ],
        options: [
          [
            'Дарҳол саҳифаи login.',
            'Сразу страницу входа.',
            'The sign-in page immediately.',
          ],
          [
            'Маълумоти account-и тасдиқнашуда.',
            'Непроверенные данные аккаунта.',
            'Unverified account details.',
          ],
          [
            'Ҳолати интизорӣ то омадани ҷавоб.',
            'Состояние ожидания до ответа.',
            'A waiting state until the result is known.',
          ],
        ],
        explanation: [
          'Status-и pending ҳоло намегӯяд, ки session ҳаст ё не. Loading аз redirect-и бармаҳал халос мекунад.',
          'Из pending ещё не следует, есть ли сессия. Состояние ожидания предотвращает преждевременное перенаправление.',
          'Pending does not yet tell you whether a session exists. A loading state avoids redirecting before the check finishes.',
        ],
      },
      {
        id: 'record-permission',
        correctIndex: 2,
        question: [
          'Корбар session-и дуруст дорад. Пеш аз фиристодани маълумоти account сервер боз чиро месанҷад?',
          'У пользователя действующая сессия. Что ещё проверяет сервер перед выдачей данных аккаунта?',
          'The user has a valid session. What else does the server check before returning account details?',
        ],
        options: [
          [
            'Ранги тугмаи account дар React.',
            'Цвет кнопки аккаунта в React.',
            'The color of the account button in React.',
          ],
          [
            'Танҳо дарозии URL-и саҳифа.',
            'Только длину URL страницы.',
            'Only the page URL length.',
          ],
          [
            'Иҷозати корбар барои ҳамин маълумот.',
            'Право пользователя на эти данные.',
            'The user’s permission for these records.',
          ],
        ],
        explanation: [
          'Session шахсияти корбарро муайян мекунад. Санҷиши иҷозат муайян мекунад, ки вай ин маълумотро гирифта метавонад ё не.',
          'Проверка сессии определяет пользователя. Проверка прав определяет, может ли он получить эти данные.',
          'The session identifies the user. Authorization checks whether that user can read these records.',
        ],
      },
    ],
  },
  'ai-workflow': {
    source: 'https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request',
    sections: [
      {
        title: [
          'Супоришро бо натиҷаи санҷишшаванда навис',
          'Формулируйте задачу через проверяемый результат',
          'Describe the task as a result you can check',
        ],
        body: [
          'Дар устохона «мошинро дуруст кун» супориши калон аст. «Пас аз иваз кардани шиша тиреза озод кушода шавад» санҷиш дорад. Барои код ҳам файл, тағйир ва рафтори интизориро навис. Масалан, дар Todo аз [1, 2, 3] баъди Delete-и id=2 рӯйхати [1, 3] мебарояд ва Add кор мекунад.',
          'В мастерской «почините машину» звучит слишком широко. «После замены стекла окно свободно открывается» уже можно проверить. Для кода тоже укажите файл, нужное изменение и ожидаемое поведение. Например, Delete для id=2 превращает [1, 2, 3] в [1, 3], а Add по-прежнему работает.',
          'At a workshop, “fix the car” is broad. “The window opens freely after the glass replacement” gives you a check. For code, name the file, the intended change, and expected behavior. For example, deleting ID 2 changes [1, 2, 3] to [1, 3] and Add still works.',
        ],
      },
      {
        title: [
          'Diff ва санҷиши амали корбар',
          'Diff и проверка действия пользователя',
          'A diff and a user-action check',
        ],
        body: [
          'Дар diff бин, ки handler-и дархостшуда иваз шудааст ё не ва кадом файлҳои дигар ба тағйир даромадаанд. Сипас сценарияро иҷро кун: Delete-и id=2-ро пахш кун, натиҷаро бин ва бо Add вазифаи нав бисоз. Build ва санҷиши амали корбар ду саволи ҷудоро ҷавоб медиҳанд: проект ҷамъ мешавад ва рафтори лозима дар экран кор мекунад.',
          'В diff найдите изменённый обработчик и посмотрите, какие ещё файлы затронуты. Затем выполните сценарий: удалите id=2, проверьте список и добавьте новую задачу. Сборка и проверка действия отвечают на разные вопросы: собирается ли проект и работает ли нужное поведение на экране.',
          'Inspect the diff for the requested handler and any additional files it touches. Then run the scenario: delete ID 2, check the list, and add a new task. A build and an interaction check answer different questions: whether the project compiles and whether its behavior works on screen.',
        ],
      },
    ],
    quiz: [
      {
        id: 'out-of-scope',
        correctIndex: 2,
        question: [
          'Супориш фақат ба Delete дахл дорад. Дар diff файли routing ҳам иваз шудааст. Аввал чӣ кор мекунӣ?',
          'Задача касалась только удаления. В diff также изменился файл маршрутов. Что вы сделаете сначала?',
          'The task was only about Delete, but the diff also changes routing. What should you do first?',
        ],
        options: [
          [
            'Ҳар тағйирро якбора қабул кун.',
            'Сразу принять все изменения.',
            'Accept every change at once.',
          ],
          [
            'Файли routing-ро пурра аз проект гир.',
            'Удалить весь файл маршрутов из проекта.',
            'Remove the whole routing file from the project.',
          ],
          [
            'Сабаби тағйири routing-ро дар diff санҷ.',
            'Проверить по diff, зачем изменились маршруты.',
            'Inspect why routing changed in the diff.',
          ],
        ],
        explanation: [
          'Мумкин тағйир ба вазифа вобаста бошад. Аввал diff ва талаботро муқоиса кун, баъд қарор гир.',
          'Изменение может быть связано с задачей. Сначала сопоставьте diff с требованиями, затем решите, нужно ли оно.',
          'The change could be related to the task. Compare the diff with the requirements before deciding whether it belongs.',
        ],
      },
      {
        id: 'verify-delete',
        correctIndex: 2,
        question: [
          'Build гузашт. Кадом санҷиш исбот мекунад, ки Delete воқеан id=2-ро аз рӯйхат мебарорад?',
          'Сборка прошла. Какая проверка покажет, что Delete действительно убирает из списка id=2?',
          'The build passes. Which check confirms that Delete actually removes ID 2 from the list?',
        ],
        options: [
          [
            'Фақат бубин, ки Button дар саҳифа ҳаст.',
            'Проверить только наличие кнопки на странице.',
            'Only check whether the button exists on the page.',
          ],
          [
            'Танҳо вақти build-ро аз terminal хон.',
            'Прочитать только время сборки в терминале.',
            'Only read the build time in the terminal.',
          ],
          [
            'ID 2-ро пахш кун ва санҷ, ки 1 ва 3 монданд.',
            'Нажать Delete для id=2 и проверить, что остались 1 и 3.',
            'Click Delete for ID 2 and check that IDs 1 and 3 remain.',
          ],
        ],
        explanation: [
          'Барои санҷидани behavior амали корбар ва натиҷаи экран ҳар ду даркоранд. Гузаштани build ин кликро иҷро намекунад.',
          'Проверка поведения включает действие пользователя и результат на экране. Сборка этот клик не выполняет.',
          'A behavioral check includes both the user action and its visible result. The build does not exercise that click.',
        ],
      },
    ],
  },
};

export function reactTopicSections(topicId: string) {
  return REACT_TOPIC_DETAILS[topicId]?.sections.map(({ title, body }) => ({
    title: title[0],
    text: body[0],
  })) ?? [];
}

const authoredTranslations = new Map<string, LessonText>();
for (const concept of Object.values(REACT_CONCEPTS)) {
  authoredTranslations.set(concept.title[0], concept.title);
  authoredTranslations.set(concept.body[0], concept.body);
}
for (const intro of Object.values(REACT_INTRO)) {
  for (const line of [intro.title, intro.body, intro.question, intro.answer]) {
    authoredTranslations.set(line[0], line);
  }
}
for (const detail of Object.values(REACT_TOPIC_DETAILS)) {
  if (!detail) continue;
  for (const section of detail.sections) {
    authoredTranslations.set(section.title[0], section.title);
    authoredTranslations.set(section.body[0], section.body);
  }
  for (const quiz of detail.quiz ?? []) {
    for (const text of [quiz.question, ...quiz.options, quiz.explanation]) {
      authoredTranslations.set(text[0], text);
    }
  }
}

export function translateReactTopicDetail(text: string, locale: 'ru' | 'en') {
  return authoredTranslations.get(text)?.[locale === 'ru' ? 1 : 2];
}
