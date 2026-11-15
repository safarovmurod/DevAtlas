// Short "what is it?" answers for the main technologies of the courses.
// A beginner who types "хтмл что такое" gets a clear definition at once, with a
// link to the course that teaches it. Written for DevAtlas; no model call.
import { courseName } from '@/content/courses/catalog';
import type { CourseId } from '@/lib/courses/ids';
import { canonicalWord, isTopicWord, wordsOf } from './fuzzy';
import type { TutorSource } from './shared';

export type GlossaryLanguage = 'tg' | 'ru' | 'en' | 'es';

interface Entry {
  course: CourseId;
  text: Record<GlossaryLanguage, string>;
}

const GLOSSARY: Record<string, Entry> = {
  html: {
    course: 'html',
    text: {
      ru: 'HTML — язык разметки, из которого состоит любая веб-страница. Тегами он говорит браузеру, что на странице заголовок, абзац, ссылка, картинка или форма. Внешний вид задаёт CSS, а поведение — JavaScript.',
      tg: 'HTML — забони аломатгузорӣ аст, ки ҳар саҳифаи веб аз он сохта мешавад. Бо тегҳо ба браузер мегӯяд, ки дар саҳифа сарлавҳа, абзац, пайванд, расм ё форма ҳаст. Намуди зоҳириро CSS ва рафторро JavaScript муайян мекунад.',
      en: 'HTML is the markup language every web page is built from. With tags it tells the browser what is on the page: a heading, a paragraph, a link, an image or a form. CSS controls how it looks, and JavaScript controls how it behaves.',
      es: 'HTML es el lenguaje de marcado con el que se construye cualquier página web. Con etiquetas le dice al navegador qué hay en la página: un título, un párrafo, un enlace, una imagen o un formulario. CSS controla el aspecto y JavaScript controla el comportamiento.',
    },
  },
  css: {
    course: 'css',
    text: {
      ru: 'CSS — язык стилей. Он отвечает за внешний вид HTML-страницы: цвета, шрифты, отступы, размеры и расположение блоков, а также за то, как страница выглядит на телефоне.',
      tg: 'CSS — забони услубҳо аст. Он намуди зоҳирии саҳифаи HTML-ро муайян мекунад: рангҳо, ҳарфҳо, фосилаҳо, андозаҳо, ҷойгиршавии блокҳо ва намуди саҳифа дар телефон.',
      en: 'CSS is the styling language. It controls how an HTML page looks: colors, fonts, spacing, sizes, the layout of blocks and how the page looks on a phone.',
      es: 'CSS es el lenguaje de estilos. Controla el aspecto de una página HTML: colores, fuentes, espacios, tamaños, la distribución de los bloques y cómo se ve la página en el móvil.',
    },
  },
  javascript: {
    course: 'javascript-1',
    text: {
      ru: 'JavaScript — язык программирования, который оживляет страницу: реагирует на клики, проверяет формы, меняет содержимое без перезагрузки. Он работает в браузере, а через Node.js — и на сервере.',
      tg: 'JavaScript — забони барномасозӣ аст, ки саҳифаро зинда мекунад: ба клик ҷавоб медиҳад, формаҳоро месанҷад, мундариҷаро бе аз нав бор кардан иваз мекунад. Он дар браузер ва тавассути Node.js дар сервер кор мекунад.',
      en: 'JavaScript is a programming language that makes a page interactive: it reacts to clicks, checks forms and changes content without reloading. It runs in the browser, and with Node.js on the server too.',
      es: 'JavaScript es un lenguaje de programación que hace interactiva una página: reacciona a los clics, comprueba formularios y cambia el contenido sin recargar. Se ejecuta en el navegador y, con Node.js, también en el servidor.',
    },
  },
  typescript: {
    course: 'typescript',
    text: {
      ru: 'TypeScript — это JavaScript с типами. Вы заранее описываете, какие данные ждёт код, и ошибки вроде числа вместо строки находятся ещё до запуска. В конце TypeScript превращается в обычный JavaScript.',
      tg: 'TypeScript — JavaScript бо навъҳо аст. Шумо пешакӣ менависед, ки код кадом маълумотро интизор аст, ва хатогиҳо, мисли адад ба ҷои сатр, пеш аз иҷро ёфт мешаванд. Дар охир TypeScript ба JavaScript-и оддӣ табдил мешавад.',
      en: 'TypeScript is JavaScript with types. You describe the data your code expects, so mistakes such as a number instead of a string are found before the program runs. In the end it turns into plain JavaScript.',
      es: 'TypeScript es JavaScript con tipos. Describes los datos que espera tu código y así los errores, como un número en lugar de un texto, se encuentran antes de ejecutar el programa. Al final se convierte en JavaScript normal.',
    },
  },
  react: {
    course: 'react',
    text: {
      ru: 'React — библиотека JavaScript для создания интерфейсов из компонентов. Компонент — небольшой кусок страницы со своей разметкой и логикой, а React сам обновляет экран, когда меняются данные (state).',
      tg: 'React — китобхонаи JavaScript барои сохтани интерфейс аз компонентҳо аст. Компонент — қисми хурди саҳифа бо разметка ва мантиқи худ, ва вақте маълумот (state) тағйир ёбад, React экранро худаш нав мекунад.',
      en: 'React is a JavaScript library for building interfaces from components. A component is a small piece of the page with its own markup and logic, and React updates the screen by itself when the data (state) changes.',
      es: 'React es una biblioteca de JavaScript para construir interfaces con componentes. Un componente es una pequeña parte de la página con su propio marcado y su propia lógica, y React actualiza la pantalla por sí solo cuando cambian los datos (el estado).',
    },
  },
  nextjs: {
    course: 'nextjs',
    text: {
      ru: 'Next.js — фреймворк на основе React для полноценных сайтов. Он добавляет маршрутизацию по папкам, рендеринг на сервере, загрузку данных и всё нужное для публикации.',
      tg: 'Next.js — фреймворк дар асоси React барои сайтҳои пурра аст. Он масирбандӣ аз рӯи папкаҳо, рендер дар сервер, боркунии маълумот ва ҳар чизи барои нашр лозимро илова мекунад.',
      en: 'Next.js is a framework built on React for complete websites. It adds folder-based routing, server rendering, data loading and everything needed to publish the site.',
      es: 'Next.js es un framework basado en React para sitios web completos. Añade enrutamiento por carpetas, renderizado en el servidor, carga de datos y todo lo necesario para publicar el sitio.',
    },
  },
  git: {
    course: 'git',
    text: {
      ru: 'Git — система контроля версий. Она хранит историю изменений проекта, позволяет вернуться к любой версии и работать над одним кодом нескольким людям. Сохранённый снимок называется коммитом.',
      tg: 'Git — низоми назорати версияҳо аст. Он таърихи тағйироти лоиҳаро нигоҳ медорад, имкон медиҳад ба ҳар версия баргардед ва якчанд нафар дар як код кор кунанд. Нусхаи захирашуда commit номида мешавад.',
      en: 'Git is a version control system. It keeps the history of a project, lets you go back to any version and lets several people work on the same code. A saved snapshot is called a commit.',
      es: 'Git es un sistema de control de versiones. Guarda el historial de un proyecto, permite volver a cualquier versión y deja que varias personas trabajen sobre el mismo código. Cada copia guardada se llama commit.',
    },
  },
  python: {
    course: 'python',
    text: {
      ru: 'Python — простой и читаемый язык программирования. На нём пишут сайты, автоматизацию, анализ данных и искусственный интеллект, поэтому его часто выбирают первым.',
      tg: 'Python — забони барномасозии сода ва хониши осон аст. Бо он сайт, автоматикунонӣ, таҳлили маълумот ва зеҳни сунъӣ менависанд, барои ҳамин аксар вақт онро аввал интихоб мекунанд.',
      en: 'Python is a simple, readable programming language. It is used for websites, automation, data analysis and artificial intelligence, so it is often a first language.',
      es: 'Python es un lenguaje de programación sencillo y legible. Se usa para sitios web, automatización, análisis de datos e inteligencia artificial, por eso suele ser un primer lenguaje.',
    },
  },
  sql: {
    course: 'sql',
    text: {
      ru: 'SQL — язык запросов к базам данных. Им выбирают, добавляют, меняют и удаляют данные в таблицах, например «покажи всех клиентов из Душанбе».',
      tg: 'SQL — забони дархост ба пойгоҳи маълумот аст. Бо он маълумотро дар ҷадвалҳо интихоб, илова, тағйир ва нест мекунанд, масалан «ҳамаи мизоҷони Душанберо нишон деҳ».',
      en: 'SQL is the language for talking to databases. You use it to select, add, change and delete data in tables, for example “show every customer from Dushanbe”.',
      es: 'SQL es el lenguaje para hablar con las bases de datos. Sirve para seleccionar, añadir, modificar y eliminar datos de las tablas, por ejemplo «muéstrame todos los clientes de Dusambé».',
    },
  },
  nodejs: {
    course: 'nodejs',
    text: {
      ru: 'Node.js — среда, которая запускает JavaScript вне браузера, на компьютере или сервере. С ней пишут серверы, API и инструменты разработчика.',
      tg: 'Node.js — муҳите аст, ки JavaScript-ро берун аз браузер, дар компютер ё сервер иҷро мекунад. Бо он сервер, API ва абзорҳои барномасоз менависанд.',
      en: 'Node.js is a runtime that runs JavaScript outside the browser, on a computer or a server. It is used to write servers, APIs and developer tools.',
      es: 'Node.js es un entorno que ejecuta JavaScript fuera del navegador, en un ordenador o en un servidor. Se usa para escribir servidores, API y herramientas para desarrolladores.',
    },
  },
  java: {
    course: 'java',
    text: {
      ru: 'Java — строгий и популярный язык программирования. На нём пишут серверные системы, корпоративные программы и приложения, а типы данных помогают находить ошибки заранее.',
      tg: 'Java — забони барномасозии қатъӣ ва маъруф аст. Бо он системаҳои серверӣ, барномаҳои корпоративӣ ва иловаҳо менависанд, ва навъҳои маълумот хатогиҳоро пешакӣ меёбанд.',
      en: 'Java is a strict, popular programming language. It is used for server systems, business software and apps, and its data types help catch mistakes early.',
      es: 'Java es un lenguaje de programación estricto y muy popular. Se usa en sistemas de servidor, software empresarial y aplicaciones, y sus tipos de datos ayudan a detectar errores pronto.',
    },
  },
  cpp: {
    course: 'cpp',
    text: {
      ru: 'C++ — быстрый язык программирования, близкий к «железу». На нём пишут игры, браузеры, операционные системы и программы, где важна скорость.',
      tg: 'C++ — забони барномасозии тез аст, ки ба «сахтафзор» наздик аст. Бо он бозиҳо, браузерҳо, системаҳои амалиётӣ ва барномаҳое, ки суръат муҳим аст, менависанд.',
      en: 'C++ is a fast programming language that works close to the hardware. It is used for games, browsers, operating systems and programs where speed matters.',
      es: 'C++ es un lenguaje de programación rápido que trabaja cerca del hardware. Se usa en videojuegos, navegadores, sistemas operativos y programas donde la velocidad importa.',
    },
  },
  api: {
    course: 'backend',
    text: {
      ru: 'API — это способ, которым одна программа просит у другой данные или действие. Например, сайт отправляет запрос на сервер и получает ответ, чаще всего в формате JSON.',
      tg: 'API — роҳест, ки бо он як барнома аз барномаи дигар маълумот ё амал талаб мекунад. Масалан, сайт ба сервер дархост мефиристад ва ҷавобро, аксар вақт бо формати JSON, мегирад.',
      en: 'An API is a way for one program to ask another for data or an action. For example, a website sends a request to a server and gets a reply, most often in JSON format.',
      es: 'Una API es una forma de que un programa pida datos o una acción a otro. Por ejemplo, un sitio web envía una solicitud a un servidor y recibe una respuesta, casi siempre en formato JSON.',
    },
  },
};

/** Words that only say "what is this?". What is left of a question must be the technology itself. */
export const QUESTION_FILLER = new Set(
  `что такое такой такая это значит означает за кто вообще объясни объясните расскажи расскажите
про о об простыми словами просто скажи пожалуйста мне зачем нужен нужна для чего
чист чи чӣ аст ай мебошад маъно маънои шарҳ деҳ бигӯ фаҳмон фахмон оддӣ сода ба ман лутфан дар бораи
чиба даркорай барои
what is are a an the does mean define explain tell me about please simply simple in plain words
why do i need
qué que es son significa significado un una el la los las lo explícame explícalo explica dime cuéntame sobre acerca del para sirve por favor palabras sencillas simplemente`.split(
    /\s+/,
  ),
);

/** The technology a question asks the meaning of ("хтмл что такое" → html), or null. */
export function definitionTopic(query: string): string | null {
  const rest = wordsOf(query).filter((word) => !QUESTION_FILLER.has(word));
  if (!rest.length || !rest.every(isTopicWord)) return null;
  const names = new Set(rest.map(canonicalWord));
  if (names.size !== 1) return null;
  const [name] = names;
  return Object.hasOwn(GLOSSARY, name) ? name : null;
}

const NEXT_STEP: Record<GlossaryLanguage, (course: string) => string> = {
  ru: (course) => `Подробнее — в курсе «${course}», раздел «Ответы».`,
  tg: (course) => `Муфассалтар — дар курси «${course}», бахши «Ҷавобҳо».`,
  en: (course) => `More in the “${course}” course, in the Answers section.`,
  es: (course) => `Más detalles en el curso «${course}», en la sección «Respuestas».`,
};

/** A short definition with a link to the course, or null when the question is not "what is X". */
export function glossaryAnswer(
  query: string,
  language: GlossaryLanguage,
  options: { deep?: boolean } = {},
): { reply: string; source: TutorSource } | null {
  const topic = definitionTopic(query);
  if (!topic) return null;
  const { course, text } = GLOSSARY[topic];
  const title = courseName(course);
  return {
    reply: options.deep ? text[language] + '\n\n' + NEXT_STEP[language](title) : text[language],
    source: {
      questionId: 'glossary:' + topic,
      topicId: topic,
      title,
      file: 'devatlas-glossary',
      sourceId: 'glossary-' + topic,
      href: course === 'react' ? '/answers' : `/courses/${course}/answers`,
    },
  };
}
