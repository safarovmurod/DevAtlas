export const NEXTJS_FOUNDATIONS = {
  '4': {
    title: {
      ru: 'Данные на сервере и кеш',
      tg: 'Дода дар сервер ва cache',
      en: 'Server data and caching',
    },
    summary: {
      ru: 'Прочитайте данные в серверном компоненте и выберите время их обновления.',
      tg: 'Дар компоненти серверӣ дода гир ва вақти нав кардани онро муайян кун.',
      en: 'Read data in a Server Component and decide how fresh it must be.',
    },
    sections: [
      {
        title: {
          ru: 'Как серверный компонент получает данные',
          tg: 'Компоненти серверӣ додаҳоро чӣ хел мегирад?',
          en: 'How a Server Component reads data',
        },
        body: {
          ru: 'Серверный компонент может выполнить await fetch или запрос к базе до того, как передаст готовый интерфейс. Например, каталог читает товары на сервере. В браузере этот вызов обычно не виден как отдельный запрос к API.',
          tg: 'Компоненти серверӣ пеш аз фиристодани UI метавонад бо await fetch ё query дода гирад. Масалан, catalog рӯйхати молро аз сервер мехонад. Дар Network-и браузер request-и дохилии сервер ҷудо намоён намешавад.',
          en: 'A Server Component can await fetch or a database query before it returns UI. A catalog can read products on the server. The browser does not normally show that server-side call as a separate request to the API.',
        },
      },
      {
        title: {
          ru: 'Когда нужен свежий ответ',
          tg: 'Кай ҷавоби нав даркор мешавад?',
          en: 'When you need fresh data',
        },
        body: {
          ru: 'Кеш позволяет повторно использовать ответ. Для актуального остатка пример выбирает cache: "no-store". Сначала проверьте response.ok, затем разберите тело. Непустой ответ HTTP 500 всё равно ошибка.',
          tg: 'Cache ҷавоби пешинаро истифода бурда метавонад. Барои захираи нав мисол cache: "no-store" мегузорад. Аввал response.ok-ро санҷ, баъд body-ро хон. HTTP 500 ҳатто бо body хато мемонад.',
          en: 'A cache reuses a response. The example uses cache: "no-store" for fresh inventory. Check response.ok before reading the body. An HTTP 500 is still a failure even when it has a body.',
        },
      },
    ],
    question: {
      question: {
        ru: 'Нужен ли Server Component хук useEffect для загрузки данных?',
        tg: 'Барои гирифтани дода Server Component ба useEffect эҳтиёҷ дорад?',
        en: 'Does a Server Component need useEffect to read data?',
      },
      options: [
        {
          ru: 'Нет, он может получить данные на сервере через async/await.',
          tg: 'Не, бо async/await дар сервер дода мегирад.',
          en: 'No. It can read data on the server with async/await.',
        },
        {
          ru: 'Да, без useEffect сервер не работает.',
          tg: 'Ҳа, бе useEffect сервер кор намекунад.',
          en: 'Yes, the server needs useEffect to work.',
        },
        {
          ru: 'Нужно читать данные из localStorage.',
          tg: 'Додаро аз localStorage хондан даркор.',
          en: 'It must read data from localStorage.',
        },
      ],
    },
    practice: {
      solution:
        "// app/products/page.tsx\nasync function getData(url: string): Promise<unknown> {\n  const response = await fetch(url, { cache: 'no-store' });\n  if (!response.ok) throw new Error('Request failed');\n  return response.json();\n}\n\nexport default async function ProductsPage() {\n  const url = process.env.PRACTICE_API_URL;\n  if (!url) return <main><p>Set PRACTICE_API_URL to your practice API URL.</p></main>;\n  const data = await getData(url);\n  return <main><h1>Products</h1><pre>{JSON.stringify(data, null, 2)}</pre></main>;\n}\n\n// app/products/error.tsx\n'use client';\n\nexport default function ProductsError() {\n  return <p role=\"alert\">Could not load products. Check the practice API.</p>;\n}",
      referenceAnswer: {
        ru: 'Вызовите await getData(url) внутри async-функции страницы. При ответе 200 выведите поле полученного объекта, например name. Ответ 404 отклонит Promise функции getData. Покажите сообщение об ошибке, например через error.tsx, вместо вывода неполученных данных.',
        tg: 'Дар функсияи async-и саҳифа await getData(url) зан. Барои 200 майдони object, мисли name, нишон деҳ. Ҷавоби 404 Promise-и getData-ро рад мекунад. error.tsx метавонад паёми хаторо нишон диҳад.',
        en: 'Call await getData(url) inside the async page function. With 200, render a received field such as name. A 404 rejects getData, so show the error state, for example with error.tsx, rather than rendering missing data.',
      },
      task: {
        ru: 'Возьмите getData из примера и вызовите её в серверной странице со своим учебным URL. Проверьте успешный ответ и URL с неподходящим статусом.',
        tg: 'getData-и мисолро дар саҳифаи серверии худ бо URL-и озмоишӣ даъват кун. Ҷавоби дуруст ва URL-и статусаш хаторо санҷ.',
        en: 'Call getData from a server page using a test URL you control. Check one successful response and one error status.',
      },
      hint: {
        ru: 'Начните со статуса: fetch сам по себе не выбрасывает ошибку на HTTP 404 или 500.',
        tg: 'Аз статус сар кун: fetch танҳо барои HTTP 404 ё 500 exception намедиҳад.',
        en: 'Start with the status: fetch does not throw just because a response is 404 or 500.',
      },
      criteria: [
        {
          ru: 'Страница отображает полученные данные и отдельно обрабатывает HTTP-ошибку.',
          tg: 'Саҳифа додаи гирифташударо нишон медиҳад ва хатои HTTP-ро ҷудо коркард мекунад.',
          en: 'The page renders received data and handles a failed HTTP response separately.',
        },
      ],
    },
  },
  '5': {
    title: {
      ru: 'Блог и динамический адрес',
      tg: 'Блог ва URL-и динамикӣ',
      en: 'Blogs and dynamic URLs',
    },
    summary: {
      ru: 'Свяжите адрес статьи с её записью, включая прямое открытие и 404.',
      tg: 'Адреси мақоларо бо сабт пайваст кун. Кушодани мустақим ва 404-ро санҷ.',
      en: 'Resolve an article from its URL and handle direct visits and 404s.',
    },
    sections: [
      {
        title: {
          ru: 'Что такое slug',
          tg: 'Slug чист?',
          en: 'What is a slug?',
        },
        body: {
          ru: 'Slug — читаемая часть URL, которая определяет запись. В /blog/react значение react ищется в списке статей. Папка [slug] принимает разные адреса без отдельного файла на статью.',
          tg: 'Slug қисми хондашавандаи URL аст, ки сабтро муайян мекунад. Дар /blog/react калимаи react аз рӯйхати мақола ҷустуҷӯ мешавад. Папкаи [slug] чанд адресро бо як page қабул мекунад.',
          en: 'A slug is a readable URL segment that identifies a record. In /blog/react, the page looks up react in its articles. A [slug] folder can handle many articles with one page file.',
        },
      },
      {
        title: {
          ru: 'Прямой адрес и статья, которой нет',
          tg: 'Адреси мустақим ва мақолаи набуда',
          en: 'Direct links and missing articles',
        },
        body: {
          ru: 'При F5 страница снова читает slug из params и ищет запись в источнике. Если записи нет, notFound() завершает обработку этого маршрута экраном 404. Известные slug можно подготовить во время сборки через generateStaticParams.',
          tg: 'Ҳангоми F5 саҳифа slug-ро аз params хонда, сабтро дар манбаъ меёбад. Агар сабт набошад, notFound() экрани 404 медиҳад. Slug-ҳои маълумро бо generateStaticParams вақти build тайёр кардан мумкин.',
          en: 'After refresh, the page reads the slug from params and looks up the record again. If it is missing, notFound() selects the not-found screen. Known slugs can be prepared at build time with generateStaticParams.',
        },
      },
    ],
    question: {
      question: {
        ru: 'Где страница узнаёт, какую статью показать после обновления?',
        tg: 'Пас аз reload саҳифа аз куҷо мефаҳмад, ки кадом мақола лозим аст?',
        en: 'How does the page identify the article after a refresh?',
      },
      options: [
        {
          ru: 'Из параметра URL и источника статей.',
          tg: 'Аз params-и URL ва манбаи мақолаҳо.',
          en: 'From the URL parameter and the article source.',
        },
        {
          ru: 'Только из состояния предыдущей страницы.',
          tg: 'Фақат аз state-и саҳифаи пешина.',
          en: 'Only from the previous page’s state.',
        },
        {
          ru: 'Из текста последней нажатой кнопки.',
          tg: 'Аз матни тугмаи охирини пахшшуда.',
          en: 'From the text of the last clicked button.',
        },
      ],
    },
    practice: {
      solution:
        "// app/blog/[slug]/page.tsx\nimport { notFound } from 'next/navigation';\n\nconst posts = [\n  { slug: 'react', title: 'React', body: 'Components' },\n  { slug: 'css', title: 'CSS', body: 'Selectors' },\n];\n\nexport default async function PostPage({\n  params,\n}: {\n  params: Promise<{ slug: string }>;\n}) {\n  const { slug } = await params;\n  const post = posts.find((item) => item.slug === slug);\n  if (!post) notFound();\n  return <article><h1>{post.title}</h1><p>{post.body}</p></article>;\n}",
      referenceAnswer: {
        ru: 'Добавьте в posts отдельную запись { slug: "css", title: "CSS", body: "Селекторы" }. /blog/css показывает CSS после обновления, а /blog/unknown открывает экран отсутствующей статьи.',
        tg: 'Ба posts сабти { slug: "css", title: "CSS", body: "Селекторҳо" } зам кун. /blog/css баъди reload CSS нишон медиҳад, /blog/unknown экрани мақолаи набударо.',
        en: 'Add { slug: "css", title: "CSS", body: "Selectors" } to posts. /blog/css still shows CSS after refresh, and /blog/unknown shows the not-found screen.',
      },
      task: {
        ru: 'Добавьте в учебный список статью с slug css. Откройте /blog/css напрямую, обновите страницу и проверьте /blog/unknown.',
        tg: 'Ба рӯйхати дарсӣ мақолаи бо slug-и css зам кун. /blog/css-ро мустақим кушо, reload кун ва /blog/unknown-ро санҷ.',
        en: 'Add an article with slug css to the example list. Open /blog/css directly, refresh it, and try /blog/unknown.',
      },
      hint: {
        ru: 'Список статей в примере служит источником. Заголовок берётся из найденной записи.',
        tg: 'Дар мисол рӯйхат манбаи мақолаҳост. Сарлавҳа аз сабти ёфташуда меояд.',
        en: 'The example uses the article list as its source. Read the heading from the matched record.',
      },
      criteria: [
        {
          ru: 'Известный slug показывает свою статью. Неизвестный slug показывает экран 404.',
          tg: 'Slug-и маълум мақолаи худро ва slug-и ношинос 404 нишон медиҳад.',
          en: 'A known slug shows its article. An unknown slug shows a not-found screen.',
        },
      ],
    },
  },
  '6': {
    title: {
      ru: 'Route Handler и HTTP API',
      tg: 'Route Handler ва HTTP API',
      en: 'Route Handlers and HTTP APIs',
    },
    summary: {
      ru: 'Примите JSON, проверьте его и верните честный HTTP-ответ.',
      tg: 'JSON-ро гир, санҷ ва HTTP response-и мувофиқро баргардон.',
      en: 'Accept a JSON request, validate it, and return an HTTP response.',
    },
    sections: [
      {
        title: {
          ru: 'Что такое Route Handler',
          tg: 'Route Handler чист?',
          en: 'What is a Route Handler?',
        },
        body: {
          ru: 'Route Handler — серверная функция для HTTP-адреса. Файл app/api/echo/route.ts задаёт /api/echo, а экспорт POST принимает POST-запросы. Ответ содержит статус, заголовки и, когда нужно, тело.',
          tg: 'Route Handler функсияи серверӣ барои адреси HTTP аст. app/api/echo/route.ts адреси /api/echo-ро месозад ва export-и POST дархости POST мегирад. Response статус, header ва ҳангоми лозим body дорад.',
          en: 'A Route Handler is a server function behind an HTTP URL. app/api/echo/route.ts defines /api/echo, and an exported POST handles POST requests. The response carries a status, headers, and an optional body.',
        },
      },
      {
        title: {
          ru: 'Где ставить проверку',
          tg: 'Санҷишро дар куҷо мемонем?',
          en: 'Where validation belongs',
        },
        body: {
          ru: 'Запрос — данные извне. Сначала проверьте, что JSON разобрался, затем что тело имеет поле name со строкой. После trim пустое имя получает 400. Пример возвращает очищенное имя, не записывая его в базу.',
          tg: 'Request додаи берунӣ аст. Аввал хонда шудани JSON ва баъд сатри name-ро санҷ. Агар пас аз trim ном холӣ шавад, 400 деҳ. Мисол номи тозашударо медиҳад, онро ба база сабт намекунад.',
          en: 'A request comes from outside the app. Check that JSON parsed and that name is a string. A name that is empty after trimming gets 400. This example returns the cleaned name and does not store it.',
        },
      },
    ],
    question: {
      question: {
        ru: 'Что возвращает Route Handler?',
        tg: 'Route Handler чӣ бармегардонад?',
        en: 'What does a Route Handler return?',
      },
      options: [
        {
          ru: 'HTTP Response со статусом, заголовками и подходящим телом.',
          tg: 'HTTP Response бо статус, header ва body-и мувофиқ.',
          en: 'An HTTP Response with a status, headers, and an appropriate body.',
        },
        {
          ru: 'Всегда JSX для экрана.',
          tg: 'Ҳамеша JSX барои экран.',
          en: 'Always JSX for the screen.',
        },
        {
          ru: 'Хук useState.',
          tg: 'Hook-и useState.',
          en: 'A useState Hook.',
        },
      ],
    },
    practice: {
      referenceAnswer: {
        ru: 'Для {"name":"  Ali  "} ожидайте 200 и {"name":"Ali"}. Для {"name":" "} ожидайте 400 и сообщение Name required. При неподходящем JSON обработчик тоже вернёт 400.',
        tg: 'Барои {"name":"  Ali  "} натиҷаи 200 ва {"name":"Ali"} аст. Барои {"name":" "} натиҷаи 400 ва Name required. Барои JSON-и хонданашаванда ҳам 400 мебарояд.',
        en: 'Expect 200 and {"name":"Ali"} for {"name":"  Ali  "}. Expect 400 and Name required for {"name":" "}. Unreadable JSON also receives 400.',
      },
      task: {
        ru: 'В локальном проекте отправьте POST на /api/echo с именем и с пустой строкой. Сравните JSON и статус ответов.',
        tg: 'Дар проекти локалӣ ба /api/echo бо ном ва бо сатри холӣ POST фирист. JSON ва статусҳои ҷавобро муқоиса кун.',
        en: 'In a local project, POST a name and then an empty string to /api/echo. Compare each response status and body.',
      },
      hint: {
        ru: 'Обработчик принимает POST. Открытие URL в браузере обычно отправляет GET.',
        tg: 'Handler request-и POST мегирад. Кушодани адрес дар браузер одатан GET мефиристад.',
        en: 'The handler accepts POST. Opening its URL in the browser usually sends GET.',
      },
      criteria: [
        {
          ru: 'Корректное имя возвращается очищенным, пустое получает 400.',
          tg: 'Номи дуруст тоза бармегардад, номи холӣ 400 мегирад.',
          en: 'A valid name is trimmed and returned. An empty name receives 400.',
        },
      ],
    },
  },
  '7': {
    title: {
      ru: 'Вход, сессия и права',
      tg: 'Воридшавӣ, session ва иҷоза',
      en: 'Sign-in, sessions, and permissions',
    },
    summary: {
      ru: 'Разделите подтверждение личности и проверку права на запись.',
      tg: 'Тасдиқи шахсиятро аз санҷиши ҳуқуқи сабт ҷудо кун.',
      en: 'Separate establishing identity from checking access to a record.',
    },
    sections: [
      {
        title: {
          ru: 'Что такое сессия',
          tg: 'Session чист?',
          en: 'What is a session?',
        },
        body: {
          ru: 'Сессия даёт серверу возможность узнать вошедшего пользователя при следующем запросе. Auth.js может помочь создать и проверить сессию. Сама сессия ещё не определяет права на отдельный заказ.',
          tg: 'Бо session сервер дар request-и дигар корбари даромадаро мешиносад. Auth.js барои сохтан ва санҷидани session ёрӣ медиҳад. Аз session танҳо иҷозаи тағйири ҳар фармоиш намебарояд.',
          en: 'A session lets the server recognize a signed-in user on another request. Auth.js can help create and verify it. Access to a specific order still needs its own decision.',
        },
      },
      {
        title: {
          ru: 'Как проверяют владельца',
          tg: 'Соҳиби сабтро чӣ хел месанҷанд?',
          en: 'How the server checks ownership',
        },
        body: {
          ru: 'Сервер берёт userId из проверенной сессии, а ownerId — из своей записи. Если они совпадают в примере с правом владельца, редактирование разрешено. Скрытая кнопка на странице помогает интерфейсу, а решение остаётся на сервере.',
          tg: 'Сервер userId-ро аз session-и тасдиқшуда ва ownerId-ро аз сабти худаш мегирад. Дар мисоли ҳуқуқи соҳиб агар ҳар ду як бошанд, таҳрир иҷозат аст. Пинҳон кардани тугма барои UI мебошад, қарор дар сервер мемонад.',
          en: 'The server takes userId from a verified session and ownerId from its record. In this owner-only example, matching IDs allow the edit. Hiding a button is a UI choice, while the server makes the access decision.',
        },
      },
    ],
    question: {
      question: {
        ru: 'Достаточно ли сессии, чтобы изменить любую запись?',
        tg: 'Оё session барои иваз кардани ҳар сабт бас аст?',
        en: 'Does having a session let you edit any record?',
      },
      options: [
        {
          ru: 'Нет. Сервер проверяет и сессию, и право на конкретную запись.',
          tg: 'Не. Сервер ҳам session ва ҳам ҳуқуқи ҳамин сабтро месанҷад.',
          en: 'No. Check the session and permission for the specific record.',
        },
        {
          ru: 'Да, у всех вошедших одинаковые права.',
          tg: 'Ҳа, ҳама воридшудаҳо як ҳуқуқ доранд.',
          en: 'Yes, all signed-in users have the same rights.',
        },
        {
          ru: 'Достаточно userId из тела запроса.',
          tg: 'userId аз body-и request бас аст.',
          en: 'A userId from the request body is enough.',
        },
      ],
    },
    practice: {
      solution:
        "type Session = { userId: string } | null;\n\nfunction canEdit(session: Session, ownerId: string) {\n  if (!session) return false;\n  return session.userId === ownerId;\n}\n\n// Local checks use fixtures. Production obtains its verified session on the server.\nconsole.assert(canEdit(null, 'u1') === false);\nconsole.assert(canEdit({ userId: 'u2' }, 'u1') === false);\nconsole.assert(canEdit({ userId: 'u1' }, 'u1') === true);",
      referenceAnswer: {
        ru: 'Для ownerId = "u1": canEdit(null, "u1") → false, canEdit({ userId: "u2" }, "u1") → false, canEdit({ userId: "u1" }, "u1") → true. В реальном обработчике сессию получает сервер.',
        tg: 'Барои ownerId = "u1": canEdit(null, "u1") → false, canEdit({ userId: "u2" }, "u1") → false, canEdit({ userId: "u1" }, "u1") → true. Дар handler-и воқеӣ session аз сервер меояд.',
        en: 'For ownerId = "u1": canEdit(null, "u1") → false, canEdit({ userId: "u2" }, "u1") → false, and canEdit({ userId: "u1" }, "u1") → true. A real handler obtains the verified session on the server.',
      },
      task: {
        ru: 'Проверьте canEdit с тремя учебными значениями: без сессии, с чужим ID и с ID владельца. Запишите три результата.',
        tg: 'canEdit-ро бе session, бо ID-и дигар кас ва бо ID-и соҳиб санҷ. Се натиҷаро навис.',
        en: 'Check canEdit with no session, a different user ID, and the owner’s ID. Record the three results.',
      },
      hint: {
        ru: 'Вход и владение записью — разные условия.',
        tg: 'Ворид будан ва соҳиби сабт будан ду шарти ҷудоянд.',
        en: 'Being signed in and owning the record are separate checks.',
      },
      criteria: [
        {
          ru: 'Разрешено только совпадение с ID владельца при проверенной сессии.',
          tg: 'Танҳо session-и тасдиқшуда бо ID-и соҳиб иҷозат мегирад.',
          en: 'Only the verified session for the matching owner is allowed.',
        },
      ],
    },
  },
  '8': {
    title: {
      ru: 'Prisma, схема и хранение',
      tg: 'Prisma, schema ва нигоҳдорӣ',
      en: 'Prisma, schemas, and storage',
    },
    summary: {
      ru: 'Проследите связь модели Todo, миграции и записи в базе.',
      tg: 'Робитаи модели Todo, migration ва сабти базаро бин.',
      en: 'Connect a Todo model, a migration, and a stored record.',
    },
    sections: [
      {
        title: {
          ru: 'Что такое Prisma и модель',
          tg: 'Prisma ва model чист?',
          en: 'What Prisma and a model do',
        },
        body: {
          ru: 'Prisma ORM помогает обращаться к базе из TypeScript. Модель описывает поля и правила записи. В примере id отличает задачи, name хранит название, а новым задачам по умолчанию задаётся completed: false.',
          tg: 'Prisma ORM барои кор бо база аз TypeScript ёрӣ медиҳад. Model майдон ва қоидаи сабтро мегӯяд. Дар мисол id вазифаро ҷудо мекунад, name номро мегирад ва completed-и вазифаи нав false аст.',
          en: 'Prisma ORM helps TypeScript code access a database. A model describes a record’s fields and rules. Here id identifies the task, name holds the title, and new tasks default to completed: false.',
        },
      },
      {
        title: {
          ru: 'Зачем миграция',
          tg: 'Migration барои чӣ даркор?',
          en: 'Why a migration matters',
        },
        body: {
          ru: 'Схема описывает желаемую структуру. Миграция применяется к базе и меняет её структуру. Переменная внутри процесса исчезнет при перезапуске, а запись в базе останется при сохранном хранилище.',
          tg: 'Schema сохтори хостаро тасвир мекунад. Migration ба база татбиқ шуда, сохторашро иваз мекунад. Variable-и process баъди restart гум мешавад, сабти база дар захираи устувор мемонад.',
          en: 'A schema describes the desired structure. A migration changes the database structure. A variable in memory disappears on restart, while a committed record remains in durable storage.',
        },
      },
    ],
    question: {
      question: {
        ru: 'Чем массив в памяти отличается от записи в базе?',
        tg: 'Массиви хотира аз сабти база чӣ фарқ дорад?',
        en: 'How does an in-memory array differ from a database record?',
      },
      options: [
        {
          ru: 'Массив процесса теряется при перезапуске. Запись базы хранится отдельно.',
          tg: 'Массиви process баъди restart гум мешавад. Сабти база ҷудо нигоҳ дошта мешавад.',
          en: 'The process loses its array on restart. A database stores the record separately.',
        },
        {
          ru: 'У массива нет map.',
          tg: 'Массив map надорад.',
          en: 'An array has no map method.',
        },
        {
          ru: 'Память процесса сохраняется после любого перезапуска.',
          tg: 'Хотираи process баъди ҳар restart мемонад.',
          en: 'Process memory survives every restart.',
        },
      ],
    },
    practice: {
      referenceAnswer: {
        ru: 'Для новой записи входом служит name, например "Read docs". В настроенной базе id генерируется автоматически, completed получает false по умолчанию. Перечитайте запись по возвращённому id.',
        tg: 'Барои сабти нав name даркор, масалан "Read docs". Дар базаи танзимшуда id автоматӣ дода мешавад, completed бо false сар мешавад. Сабтро бо id-и баргашта бихон.',
        en: 'Supply name, for example "Read docs". In the configured database, id is generated and completed defaults to false. Read the saved task back using its returned id.',
      },
      task: {
        ru: 'По модели ниже запишите, какие поля сервер должен получить при добавлении задачи и какие может заполнить база. Если учебная база уже настроена, создайте задачу и прочитайте её заново.',
        tg: 'Аз рӯйи model навис, ки барои вазифаи нав сервер кадом майдонро мегирад ва база кадомашро медиҳад. Агар базаи дарсӣ тайёр бошад, вазифа соз ва онро боз бихон.',
        en: 'From the model, identify which field the server must provide and which fields have defaults. If your practice database is set up, create a task and read it back.',
      },
      hint: {
        ru: 'Посмотрите на @default у id и completed.',
        tg: 'Ба @default-и id ва completed нигоҳ кун.',
        en: 'Look at @default on id and completed.',
      },
      criteria: [
        {
          ru: 'Для новой задачи требуется name. id и completed заполняются по правилам модели.',
          tg: 'Барои вазифаи нав name лозим аст. id ва completed аз рӯйи қоидаи model пур мешаванд.',
          en: 'A new task needs name. The model supplies rules for id and completed.',
        },
      ],
    },
  },
  '9': {
    title: {
      ru: 'Сборка, CI и деплой',
      tg: 'Build, CI ва deploy',
      en: 'Builds, CI, and deployments',
    },
    summary: {
      ru: 'Узнайте, что проверяет сборка и как разделить публичные настройки и секреты.',
      tg: 'Бин, build чиро месанҷад ва config-и умумиро аз secret ҷудо кун.',
      en: 'Understand what builds check and separate public config from secrets.',
    },
    sections: [
      {
        title: {
          ru: 'Чем сборка отличается от деплоя',
          tg: 'Build аз deploy чӣ фарқ дорад?',
          en: 'Build versus deployment',
        },
        body: {
          ru: 'Build готовит файлы для запуска. CI автоматически запускает выбранные проверки при изменении кода. Деплой запускает собранную версию на хостинге. Успешный build ещё не говорит, что API подключено к рабочей базе.',
          tg: 'Build файлҳои иҷроро тайёр мекунад. CI санҷишҳои интихобшударо бо иваз шудани код автоматӣ мегузаронад. Deploy версияи тайёрро дар hosting иҷро мекунад. Build-и дуруст пайвасти API ба базаро исбот намекунад.',
          en: 'A build prepares the files that run. CI runs configured checks when code changes. Deployment runs the built version on a host. A successful build does not confirm that the deployed API can reach its database.',
        },
      },
      {
        title: {
          ru: 'Публичные и серверные значения',
          tg: 'Қиматҳои public ва серверӣ',
          en: 'Public and server-only values',
        },
        body: {
          ru: 'Переменная окружения передаёт настройки без их записи в исходник. NEXT_PUBLIC_ предназначен для значений, доступных клиентскому коду. Пароль базы нужен только серверу, понадобится и отдельная проверка подключения после запуска.',
          tg: 'Environment variable config-ро берун аз source медиҳад. NEXT_PUBLIC_ барои қиматҳои дастрас ба browser аст. Пароли база танҳо дар сервер мемонад ва пас аз иҷро пайвастшавиро ҷудо месанҷӣ.',
          en: 'An environment variable supplies setup outside the source code. NEXT_PUBLIC_ is for values available to client code. The database password stays server-side, and you verify the connection after launch.',
        },
      },
    ],
    question: {
      question: {
        ru: 'Подходит ли NEXT_PUBLIC_ для пароля базы?',
        tg: 'Оё NEXT_PUBLIC_ барои пароли база мувофиқ аст?',
        en: 'Should a database password use NEXT_PUBLIC_?',
      },
      options: [
        {
          ru: 'Нет, значения с этим префиксом предназначены для доступа из браузера.',
          tg: 'Не, қиматҳои ин prefix барои дастрасӣ аз browser ҳастанд.',
          en: 'No. The prefix marks values available to browser code.',
        },
        {
          ru: 'Да, префикс скрывает значение.',
          tg: 'Ҳа, prefix қиматро пинҳон мекунад.',
          en: 'Yes. The prefix hides the value.',
        },
        {
          ru: 'Лучше записать пароль в компонент.',
          tg: 'Паролро дар component навиштан беҳтар аст.',
          en: 'Put the password directly in the component instead.',
        },
      ],
    },
    practice: {
      referenceAnswer: {
        ru: 'До публикации запустите lint, typecheck, тесты и build. После публикации откройте страницу списка по прямому URL. Убедитесь, что запрос чтения возвращает ожидаемые данные. Имя серверной переменной можно документировать, её значение храните в настройках окружения.',
        tg: 'Пеш аз нашр lint, typecheck, test ва build-ро иҷро кун. Баъди нашр саҳифаи рӯйхатро аз URL-и рост кушо. Бин, request-и хондан додаи чашмдошт медиҳад. Номи variable-и серверро навиштан мумкин, қиматаш дар config мемонад.',
        en: 'Before publishing, run lint, type checking, tests, and build. After publishing, open the list by direct URL and check that its read request returns the expected data. Document server environment keys and keep their values in the environment settings.',
      },
      kind: 'written' as const,
      solution:
        'Before release, run lint, type checking, tests and build. After release, open the page directly and check one API read against expected data.',
      task: {
        ru: 'Составьте локальный чек-лист: lint, typecheck, тесты и build. Запишите, какой адрес и какое чтение API будете проверять после будущего деплоя.',
        tg: 'Барои локалӣ рӯйхат навис: lint, typecheck, test ва build. Навис, ки баъди deploy-и оянда кадом URL ва кадом request-и хонданро месанҷӣ.',
        en: 'Write a local checklist for lint, type checking, tests, and build. Name one URL and one API read to test after a future deployment.',
      },
      hint: {
        ru: 'Отделите проверку файлов сборки от проверки, что серверная функция отвечает по опубликованному URL.',
        tg: 'Санҷиши файли build-ро аз санҷиши ҷавоби функсияи сервер дар URL-и нашршуда ҷудо кун.',
        en: 'Separate checking build output from checking that a server handler answers at the deployed URL.',
      },
      criteria: [
        {
          ru: 'В списке есть отдельные проверки до публикации и после запуска.',
          tg: 'Дар рӯйхат санҷиши пеш аз нашр ва пас аз иҷро ҷудо аст.',
          en: 'The checklist has distinct checks before publishing and after the app runs.',
        },
      ],
    },
  },
  '10': {
    title: {
      ru: 'Full Stack: от формы до базы',
      tg: 'Full Stack: аз форма то база',
      en: 'Full stack: from form to database',
    },
    summary: {
      ru: 'Проследите один сценарий от клика до сохранённой записи.',
      tg: 'Як сенарияро аз клик то сабти дар база пайгирӣ кун.',
      en: 'Trace one action from a click to a stored record.',
    },
    sections: [
      {
        title: {
          ru: 'Что связывает Full Stack',
          tg: 'Full Stack чиро мепайвандад?',
          en: 'What full stack connects',
        },
        body: {
          ru: 'При добавлении товара фронтенд берёт поля формы и отправляет POST. Backend проверяет вход и сохраняет запись в базе. API возвращает сохранённый объект, а интерфейс показывает его. Если что-то пошло не так, проверяйте, на каком шаге возникла ошибка.',
          tg: 'Барои зам кардани мол frontend майдонҳои формаро бо POST мефиристад. Backend додаҳоро месанҷад ва ба база менависад. API сабти нигоҳдоштаро медиҳад ва UI онро нишон медиҳад. Дар ҳар қадам хатои худашро санҷ.',
          en: 'To add a product, the frontend sends form values in a POST request. The backend validates them and writes a database record. The API returns the stored record and the UI shows it. Handle failures at the step where they occur.',
        },
      },
      {
        title: {
          ru: 'Как доказать сохранение',
          tg: 'Сабтро чӣ хел тасдиқ мекунем?',
          en: 'How to verify persistence',
        },
        body: {
          ru: 'После записи перечитайте список через GET и найдите тот же ID. Это проверяет чтение после записи. Чтобы отличить базу от массива в памяти, перезапустите учебный сервер и повторите чтение. При ошибке POST оставьте ввод для исправления.',
          tg: 'Баъди сабт рӯйхатро бо GET хонда, ҳамон ID-ро ёб. Ин хондани баъди сабтро месанҷад. Барои фарқ кардани база аз массиви хотира сервери дарсиро restart карда, боз хон. Ҳангоми хатои POST воридотро нигоҳ дор.',
          en: 'After writing, fetch the list with GET and find the same ID. This checks reading after a write. To distinguish database storage from an in-memory array, restart your practice server and read again. Keep form input when POST fails.',
        },
      },
    ],
    question: {
      question: {
        ru: 'Как проверить, что сохранённую запись можно прочитать после обновления страницы?',
        tg: 'Чӣ хел месанҷӣ, ки сабтро пас аз reload хонда мешавад?',
        en: 'How do you check that a saved record can be read after page refresh?',
      },
      options: [
        {
          ru: 'Обновить страницу или выполнить новый GET и найти тот же ID.',
          tg: 'Reload ё GET-и нав карда, ҳамон ID-ро ёфтан.',
          en: 'Reload or make a fresh GET and find the same ID.',
        },
        {
          ru: 'Посмотреть только на зелёный цвет кнопки.',
          tg: 'Фақат ранги сабзи тугмаро дидан.',
          en: 'Check only that the button turned green.',
        },
        {
          ru: 'Убедиться, что появился console.log.',
          tg: 'Фақат баромадани console.log-ро дидан.',
          en: 'Check that a console.log was printed.',
        },
      ],
    },
    practice: {
      referenceAnswer: {
        ru: 'Например, форма отправила {"name":"Tea"}. POST вернул сохранённую запись с id. Новый GET после перезапуска учебного сервера возвращает тот же id. Пустое имя должно дать понятную ошибку, сохранить ввод и не добавить запись.',
        tg: 'Масалан форма {"name":"Tea"} фиристод. POST сабти нигоҳдоштаро бо id дод. GET-и нав пас аз restart-и сервери озмоишӣ ҳамон id-ро медиҳад. Номи холӣ хато медиҳад, воридот мемонад ва сабти нав намешавад.',
        en: 'For example, the form sends {"name":"Tea"}. POST returns the stored record with an id. A new GET after restarting your practice server returns that same id. An empty name should show an error, preserve the input, and create no record.',
      },
      task: {
        ru: 'Выберите учебный сценарий Add с настроенной базой. Запишите поля запроса и ответа. Проверьте сохранение, новый GET после перезапуска учебного сервера и один неверный ввод.',
        tg: 'Сенарияи Add-ро бо базаи тайёр гир. Майдонҳои request ва response-ро навис. Сабт, GET-и нав баъди restart-и сервери дарсӣ ва як додаи нодурустро санҷ.',
        en: 'Choose a practice Add flow with a configured database. Name request and response fields. Check the write, a fresh GET after restarting the practice server, and one invalid input.',
      },
      hint: {
        ru: 'Для успешного сценария запишите возвращённый ID. Для ошибки проверьте поля и список отдельно.',
        tg: 'Барои муваффақият ID-и баргаштаро навис. Барои хато майдонҳо ва рӯйхатро ҷудо санҷ.',
        en: 'Record the returned ID on success. For a failure, inspect both the form and the stored list.',
      },
      criteria: [
        {
          ru: 'Запись читается после перезапуска учебного сервера. Отказ оставляет ввод и не создаёт запись.',
          tg: 'Сабт пас аз restart-и сервери дарсӣ хонда мешавад. Дар вақти радшавӣ воридот мемонад ва сабти нав намешавад.',
          en: 'The record can be read after the practice server restarts. A rejected submission keeps input and creates no record.',
        },
      ],
    },
  },
  '11': {
    title: {
      ru: 'Портфолио и кейс проекта',
      tg: 'Портфолио ва case-и проект',
      en: 'Portfolio case studies',
    },
    summary: {
      ru: 'Объясните одну реальную задачу проекта и покажите проверяемый результат.',
      tg: 'Як вазифаи воқеии проект ва натиҷаи санҷиданиро нишон деҳ.',
      en: 'Explain one real project task and show a result someone can verify.',
    },
    sections: [
      {
        title: {
          ru: 'Что показывает кейс',
          tg: 'Case-и проект чиро нишон медиҳад?',
          en: 'What a case study shows',
        },
        body: {
          ru: 'Кейс рассказывает, кому нужен проект, что вы сделали и как проверили результат. Для каталога покажите один сценарий поиска товара. Список технологий поддерживает объяснение, когда ясно, какую задачу решает каждая.',
          tg: 'Case мегӯяд проект ба кӣ лозим, чӣ кор кардӣ ва натиҷаро чӣ хел санҷидӣ. Барои catalog як роҳи ёфтани молро нишон деҳ. Стекро бо вазифаи ҳар қисм фаҳмон.',
          en: 'A case study says who needs the project, what you built, and how you checked it. For a catalog, show one product search. Name technologies alongside the jobs they do.',
        },
      },
      {
        title: {
          ru: 'Что показать в карточке',
          tg: 'Дар карточка чиро нишон медиҳем?',
          en: 'What a project card should show',
        },
        body: {
          ru: 'Карточка включает название, краткий сценарий, вашу роль и рабочую ссылку, когда она доступна. Если публичного demo пока нет, опишите, как запустить проект локально, и покажите реальный экран.',
          tg: 'Карточка ном, сенарияи кӯтоҳ, саҳми ту ва линк дорад, агар линк дастрас бошад. Агар demo-и умумӣ набошад, тартиби иҷрои локалӣ ва скриншоти воқеиро нишон деҳ.',
          en: 'A card includes a title, one short scenario, your role, and a working link when available. Without a public demo, include local run steps and a screenshot of the actual app.',
        },
      },
    ],
    question: {
      question: {
        ru: 'Что написать в описании проекта?',
        tg: 'Дар тавсифи проект чӣ менависӣ?',
        en: 'What should a project description include?',
      },
      options: [
        {
          ru: 'Задачу, свою работу, решение, проверку и реальные ограничения.',
          tg: 'Вазифа, кори худ, қарор, санҷиш ва маҳдудияти воқеӣ.',
          en: 'The problem, your work, the decision, verification, and real limits.',
        },
        {
          ru: 'Только список библиотек.',
          tg: 'Фақат рӯйхати китобхонаҳо.',
          en: 'Only a list of libraries.',
        },
        {
          ru: 'Результаты, которые никто не проверял.',
          tg: 'Натиҷаҳои санҷиданашуда.',
          en: 'Results that were never checked.',
        },
      ],
    },
    practice: {
      referenceAnswer: {
        ru: 'Пример карточки для проверенного каталога: «Покупатель находит товар по названию. Я сделал фильтр поиска. Проверка: запрос “Tea” показывает нужный товар, неизвестное слово показывает пустой результат». Добавьте ссылку на свой работающий пример или шаги локального запуска.',
        tg: 'Мисоли карточкаи catalog-и санҷидашуда: «Харидор молро бо ном меёбад. Ман filter сохтам. Санҷиш: “Tea” моли лозимро нишон медиҳад, калимаи ношинос натиҷаи холӣ медиҳад». Линки мисоли корӣ ё қадамҳои иҷрои локалиро деҳ.',
        en: 'Example for a verified catalog: “A customer can find a product by name. I built the search filter. Testing ‘Tea’ returns the product, and an unknown word shows the empty state.” Include a working link or local run steps.',
      },
      kind: 'written' as const,
      solution:
        'A customer can search the catalog by name. I built the filter. A search for Tea finds the product, and an unknown name shows the empty state.',
      task: {
        ru: 'Заполните карточку одного учебного проекта. Добавьте одно действие пользователя, его наблюдаемый результат и одну проверку.',
        tg: 'Карточкаи як проекти дарсиро пур кун. Як амали корбар, натиҷаи дидашуда ва як санҷишро илова кун.',
        en: 'Fill out a card for one practice project. Include an action, its visible result, and one check.',
      },
      hint: {
        ru: 'Формулировку «сделал приложение» уточните действием: например, после сохранения товара новая карточка видна после обновления.',
        tg: '«Барнома сохтам»-ро бо амал аниқ кун: масалан пас аз сабт карточкаи нав баъди reload намоён аст.',
        en: 'Replace “built an app” with a behavior, such as a newly saved card still being visible after refresh.',
      },
      criteria: [
        {
          ru: 'Описание связывает задачу с проверенным поведением.',
          tg: 'Тавсиф вазифаро бо натиҷаи санҷидашуда мепайвандад.',
          en: 'The description connects a problem with verified behavior.',
        },
      ],
    },
  },
  '12': {
    title: {
      ru: 'Резюме и проверка проекта',
      tg: 'Резюме ва санҷиши проект',
      en: 'Résumé and project review',
    },
    summary: {
      ru: 'Проверьте, может ли другой человек открыть проект и повторить основной сценарий.',
      tg: 'Санҷ, ки каси дигар project-ро кушода, амали асосиро такрор мекунад.',
      en: 'Check that someone else can open the project and repeat its main flow.',
    },
    sections: [
      {
        title: {
          ru: 'Зачем проверять проект перед отправкой',
          tg: 'Пеш аз фиристодан чаро project-ро месанҷем?',
          en: 'Why to review a project before sharing',
        },
        body: {
          ru: 'Описание в резюме удобно проверять на живом сценарии. Например, «сохранил заметку через API»: откройте проект, добавьте запись и обновите страницу. Если тестировали локально, прямо укажите это в описании.',
          tg: 'Гапи резюмеро бо амали воқеӣ санҷ. Масалан «note-ро бо API сабт кардам»: проектро кушо, сабт зам кун ва reload деҳ. Агар локалӣ санҷидӣ, ҳаминро навис.',
          en: 'A résumé claim should connect to a real flow. For “saved a note through an API,” open the app, add a note, and refresh. Say when the result was verified locally.',
        },
      },
      {
        title: {
          ru: 'Проверка из чистого запуска',
          tg: 'Санҷиш аз оғози тоза',
          en: 'Checking a fresh run',
        },
        body: {
          ru: 'Инструкция запуска перечисляет версии и нужные переменные по именам, без секретных значений. Посмотрите прямую ссылку, основной сценарий и сообщение при ошибке. Это три разных проверки.',
          tg: 'Дастури оғоз версия ва номҳои environment variable-ро медиҳад, бе қимати махфӣ. Линки мустақим, амали асосӣ ва паёми хаторо ҷудо санҷ.',
          en: 'Run instructions list versions and configuration keys without secret values. Check the direct link, the main flow, and the error state separately.',
        },
      },
    ],
    question: {
      question: {
        ru: 'Что помогает проверить описание проекта?',
        tg: 'Тавсифи проектро бо чӣ санҷидан мешавад?',
        en: 'What makes a project description verifiable?',
      },
      options: [
        {
          ru: 'Понятная задача, ваше решение и воспроизводимая проверка.',
          tg: 'Вазифаи фаҳмо, қарори худат ва санҷиши такроршаванда.',
          en: 'A clear problem, your decision, and a repeatable check.',
        },
        {
          ru: 'Список всех библиотек без примера.',
          tg: 'Рӯйхати китобхонаҳо бе мисол.',
          en: 'A library list with no example.',
        },
        {
          ru: 'Заявление о результате без проверки.',
          tg: 'Гап дар бораи натиҷаи санҷиданашуда.',
          en: 'A claim with no verification.',
        },
      ],
    },
    practice: {
      referenceAnswer: {
        ru: 'Например, «Проверил локально сохранение заметок: открыл список по прямому адресу, добавил запись и увидел её после обновления». Укажите версию Node.js и команды запуска, проверьте, что другой человек может пройти тот же сценарий.',
        tg: 'Масалан «Сабти note-ро локалӣ санҷидам: рӯйхатро аз адреси рост кушодам, сабт зам кардам ва пас аз reload дидам». Версияи Node.js ва командаҳои оғозро навис, то каси дигар ҳамин амалро такрор кунад.',
        en: 'For example, “Verified note persistence locally: opened the list by direct URL, added a note, and found it after refresh.” Include the Node.js version and run commands so another person can repeat the check.',
      },
      kind: 'written' as const,
      solution:
        'Verified locally: opened the notes list by its direct URL, added a note and found it after refresh. Include the Node.js version and run commands.',
      task: {
        ru: 'Откройте выбранный проект в новой вкладке. Проверьте путь по прямой ссылке, повторите основной сценарий и исправьте одну неточную фразу в описании.',
        tg: 'Проекти интихобиро дар tab-и нав кушо. Линки рост ва сенарияи асосиро санҷ, як ҷумлаи ноаниқро дар тавсиф ислоҳ кун.',
        en: 'Open a project in a fresh tab. Try the direct link and the main flow, then correct one inaccurate claim in the description.',
      },
      hint: {
        ru: 'Подкрепите утверждение конкретным действием и видимым результатом.',
        tg: 'Гапро бо амали аниқ ва натиҷаи дидашуда асоснок кун.',
        en: 'Support a claim with a concrete action and visible result.',
      },
      criteria: [
        {
          ru: 'Описание можно проверить по ссылке или по инструкции локального запуска.',
          tg: 'Тавсиф аз линк ё дастури иҷрои локалӣ санҷида мешавад.',
          en: 'A reader can verify the claim through a link or local run instructions.',
        },
      ],
    },
  },
};
