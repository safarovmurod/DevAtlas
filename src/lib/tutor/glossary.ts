// Short "what is it?" answers for the main technologies and disciplines of DevAtlas courses.
// A beginner who types "хтмл что такое" or "ux чист" gets a clear definition at once,
// with a direct 1-click link to the course that teaches it. Written for DevAtlas; no model call.
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
  csharp: {
    course: 'csharp',
    text: {
      ru: 'C# — современный строго типизированный язык программирования на платформе .NET. На нём пишут веб-сервисы, бизнес-системы, настольные приложения и игры на Unity.',
      tg: 'C# — забони муосири барномасозӣ бо навъҳои қатъӣ дар платформаи .NET аст. Бо он веб-сервисҳо, барномаҳои тиҷоратӣ ва бозиҳои Unity менависанд.',
      en: 'C# is a modern strongly typed language on .NET. It is used to build web APIs, business software, desktop apps and Unity games.',
      es: 'C# es un lenguaje moderno de tipado estricto en .NET. Se usa para crear APIs web, software empresarial, aplicaciones de escritorio y juegos en Unity.',
    },
  },
  go: {
    course: 'go',
    text: {
      ru: 'Go (Golang) — быстрый и простой компилируемый язык от Google для серверов, CLI-утилит и облачных сервисов. Он славится лаконичным синтаксисом и встроенной конкурентностью (горутины).',
      tg: 'Go (Golang) — забони тез ва содаи компилятсияшаванда барои серверҳо, CLI ва сервисҳои абрӣ аст. Бо синтаксиси тоза ва горутинаҳо машҳур аст.',
      en: 'Go (Golang) is a fast, simple compiled language created at Google for servers, CLI tools and cloud services, known for clean syntax and built-in concurrency (goroutines).',
      es: 'Go (Golang) es un lenguaje compilado rápido y sencillo de Google para servidores, herramientas CLI y servicios en la nube, famoso por su sintaxis limpia y goroutines.',
    },
  },
  rust: {
    course: 'rust',
    text: {
      ru: 'Rust — системный язык программирования со скоростью C++ и защитой памяти на этапе компиляции. Система владения (ownership) ловит утечки и гонки данных ещё до запуска программы.',
      tg: 'Rust — забони барномасозии системавӣ бо суръати C++ ва бехатарии хотира дар вақти компилятсия аст. Қоидаи ownership хатогиҳои хотираро пеш аз иҷро мегирад.',
      en: 'Rust is a systems language with C++ speed and compile-time memory safety. Its ownership model prevents memory bugs and data races before the code even runs.',
      es: 'Rust es un lenguaje de sistemas con la velocidad de C++ y seguridad de memoria en tiempo de compilación gracias a su modelo de ownership.',
    },
  },
  php: {
    course: 'php',
    text: {
      ru: 'PHP — популярный серверный язык для веба. Он обрабатывает запросы, формы и базы данных на стороне сервера и используется на миллионах сайтов и API.',
      tg: 'PHP — забони маъруфи серверӣ барои веб аст. Он дархостҳо, формаҳо ва базаи маълумотро дар тарафи сервер коркард мекунад.',
      en: 'PHP is a widely used server-side web language. It handles requests, forms and databases on the server and powers millions of websites and APIs.',
      es: 'PHP es un lenguaje web de servidor muy extendido. Procesa solicitudes, formularios y bases de datos en el servidor.',
    },
  },
  ruby: {
    course: 'ruby',
    text: {
      ru: 'Ruby — выразительный объектно-ориентированный язык, созданный для удобства программиста. На нём пишут веб-приложения, скрипты автоматизации и API.',
      tg: 'Ruby — забони барномасозии фаҳмо ва объектно-ориентирӣ аст, ки барои роҳатии барномасоз сохта шудааст. Бо он веб-барномаҳо ва скриптҳо менависанд.',
      en: 'Ruby is an expressive object-oriented language designed for developer readability, used for web apps, automation scripts and APIs.',
      es: 'Ruby es un lenguaje orientado a objetos muy legible, creado para la productividad en aplicaciones web, scripts y APIs.',
    },
  },
  kotlin: {
    course: 'kotlin',
    text: {
      ru: 'Kotlin — современный язык для JVM и Android. Он лаконичнее Java и встроенно защищает от ошибок с null (null safety).',
      tg: 'Kotlin — забони муосир барои JVM ва Android аст. Аз Java кӯтоҳтар буда, барномаро аз хатои null (null safety) муҳофизат мекунад.',
      en: 'Kotlin is a modern language for the JVM and Android. It is more concise than Java and protects against null errors with built-in null safety.',
      es: 'Kotlin es un lenguaje moderno para JVM y Android, más conciso que Java y con protección integrada contra errores de null.',
    },
  },
  swift: {
    course: 'swift',
    text: {
      ru: 'Swift — быстрый и безопасный язык от Apple для создания приложений под iOS, macOS и другие устройства Apple. Его опционалы (Optionals) защищают от пустых значений.',
      tg: 'Swift — забони тез ва бехатари Apple барои сохтани барномаҳои iOS ва macOS аст. Optionals барномаро аз қиматҳои холӣ муҳофизат мекунанд.',
      en: 'Swift is Apple’s fast, safe programming language for building iOS and macOS apps, using optionals to handle missing values safely.',
      es: 'Swift es el lenguaje rápido y seguro de Apple para crear aplicaciones de iOS y macOS, con opcionales para manejar valores ausentes.',
    },
  },
  bash: {
    course: 'bash',
    text: {
      ru: 'Bash — командная оболочка Linux и macOS (и Git Bash на Windows). Она позволяет управлять файлами, запускать программы и автоматизировать рутину скриптами и конвейерами.',
      tg: 'Bash — муҳити фармонии терминал (дар Linux, macOS ва Git Bash) аст. Бо он файлҳоро идора, барномаҳоро иҷро ва корҳои такрориро бо скрипт автоматӣ мекунанд.',
      en: 'Bash is a command shell for Linux, macOS and Git Bash. It lets you manage files, run tools and automate workflows using scripts and pipelines.',
      es: 'Bash es un intérprete de comandos para Linux, macOS y Git Bash que permite gestionar archivos y automatizar tareas con scripts y tuberías.',
    },
  },
  mongodb: {
    course: 'mongodb',
    text: {
      ru: 'MongoDB — документоориентированная NoSQL база данных. Вместо строгих таблиц она хранит данные в гибких JSON-подобных документах внутри коллекций.',
      tg: 'MongoDB — базаи маълумоти NoSQL аст. Ба ҷои ҷадвалҳои қатъӣ маълумотро дар шакли ҳуҷҷатҳои монанд ба JSON дар дохили коллексияҳо нигоҳ медорад.',
      en: 'MongoDB is a document-oriented NoSQL database. Instead of rigid tables, it stores data as flexible JSON-like documents inside collections.',
      es: 'MongoDB es una base de datos NoSQL orientada a documentos que guarda los datos en documentos flexibles similares a JSON dentro de colecciones.',
    },
  },
  ux: {
    course: 'ux-design',
    text: {
      ru: 'UX/UI-дизайн — проектирование удобных и понятных интерфейсов. UX отвечает за логику, путь пользователя и решение его задачи, а UI — за визуальную форму: сетку, цвета, типографику и кнопки.',
      tg: 'UX/UI-дизайн — тарроҳии интерфейси роҳат ва фаҳмо аст. UX ба мантиқ, роҳи корбар ва осонии истифода ҷавоб медиҳад, UI бошад — ба намуди зоҳирӣ: ранг, ҳарф, тугма ва сохтор.',
      en: 'UX/UI design is crafting useful, clear interfaces. UX focuses on user research, flows and usability, while UI shapes the visual layout, colors, typography and controls.',
      es: 'El diseño UX/UI crea interfaces útiles y claras: UX se centra en el recorrido y la usabilidad, y UI en el aspecto visual, colores y tipografía.',
    },
  },
  marketing: {
    course: 'digital-marketing',
    text: {
      ru: 'Цифровой маркетинг — привлечение и удержание клиентов через онлайн-каналы: поиск, контент, рекламу и аналитику воронки. Главная цель — давать измеримую ценность нужной аудитории.',
      tg: 'Маркетинги рақамӣ (Digital Marketing) — ҷалб ва нигоҳдории мизоҷон тавассути интернет: контент, реклама, SEO ва таҳлили воронка бо рақамҳои воқеӣ.',
      en: 'Digital marketing attracts and retains customers through online channels—search, content, paid campaigns and funnel analytics—focused on measurable value.',
      es: 'El marketing digital atrae y fideliza clientes por canales en línea mediante contenido, anuncios, SEO y análisis de embudos medibles.',
    },
  },
  analytics: {
    course: 'data-analytics',
    text: {
      ru: 'Аналитика данных — сбор, очистка и анализ данных для принятия обоснованных решений. Аналитик ищет закономерности с помощью метрик, SQL, графиков и дашбордов.',
      tg: 'Аналитикаи маълумот (Data Analytics) — ҷамъоварӣ, тозакунӣ ва таҳлили рақамҳо барои қабули қарорҳои дуруст бо ёрии KPI, SQL, график ва дашборд.',
      en: 'Data analytics is collecting, cleaning and analyzing data to make informed decisions using metrics, SQL, charts and dashboards.',
      es: 'La analítica de datos consiste en recopilar, limpiar y analizar datos para tomar mejores decisiones usando métricas, SQL y paneles.',
    },
  },
  business: {
    course: 'business-foundations',
    text: {
      ru: 'Основы бизнеса — понимание того, какую реальную проблему вы решаете, для кого, как формируете ценность и цену, и как считаете выручку, маржу и точку безубыточности.',
      tg: 'Асосҳои бизнес — фаҳмидани он ки кадом мушкилии воқеиро барои кӣ ҳал мекунед, чӣ арзишу нарх мегузоред ва маржаву даромадро чӣ хел ҳисоб мекунед.',
      en: 'Business foundations cover understanding a real customer problem, crafting a clear value offer, pricing, and tracking margin and break-even.',
      es: 'Los fundamentos de negocio abarcan identificar un problema real, crear una propuesta de valor, fijar precios y calcular márgenes y punto de equilibrio.',
    },
  },
  management: {
    course: 'management-foundations',
    text: {
      ru: 'Менеджмент — организация работы команды для достижения общих целей: постановка задач, планирование, делегирование, обратная связь и управление рисками.',
      tg: 'Менеджмент — ташкили кори даста барои расидан ба ҳадафҳои муштарак: гузоштани мақсад, нақшакашӣ, тақсими вазифа (делегирование) ва фидбек.',
      en: 'Management is organizing a team toward shared goals through clear planning, delegation, feedback and risk management.',
      es: 'La gestión consiste en coordinar a un equipo hacia metas claras mediante planificación, delegación, retroalimentación y control de riesgos.',
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
чист чи чӣ аст ай мебошад маъно маънои шарҳ шарх деҳ бигӯ фаҳмон фахмон оддӣ сода ба ман лутфан дар бораи
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

/** A short definition with a direct link to the course, or null when the question is not "what is X". */
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
      courseId: course,
      courseTitle: title,
      href: course === 'react' ? '/answers' : `/courses/${course}/answers`,
      lessonHref: course === 'react' ? '/courses/react' : `/courses/${course}/home?day=1`,
    },
  };
}
