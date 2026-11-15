const productPractice = `// app/api/products/route.ts
import { DatabaseSync } from 'node:sqlite';

export const runtime = 'nodejs';

function openProducts() {
  const db = new DatabaseSync('products.sqlite');
  db.exec('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL)');
  return db;
}

export function GET() {
  const db = openProducts();
  try {
    const products = db.prepare('SELECT id, name FROM products ORDER BY id').all();
    return Response.json(products);
  } finally {
    db.close();
  }
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('name' in body) || typeof body.name !== 'string') {
    return Response.json({ error: 'Enter a product name.' }, { status: 400 });
  }
  const name = body.name.trim();
  if (!name || name.length > 60) {
    return Response.json({ error: 'Use 1–60 characters.' }, { status: 400 });
  }

  const db = openProducts();
  try {
    const result = db.prepare('INSERT INTO products (name) VALUES (?)').run(name);
    return Response.json({ id: Number(result.lastInsertRowid), name }, { status: 201 });
  } finally {
    db.close();
  }
}

// app/products/page.tsx
'use client';

import { useEffect, useState, type FormEvent } from 'react';

type Product = { id: number; name: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        const response = await fetch('/api/products', { signal: controller.signal });
        if (!response.ok) throw new Error('Load failed');
        const rows: Product[] = await response.json();
        if (!controller.signal.aborted) setProducts(rows);
      } catch {
        if (!controller.signal.aborted) setError('Could not load products.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadProducts();
    return () => controller.abort();
  }, []);

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        setError(response.status === 400 ? 'Use 1–60 characters.' : 'Could not save.');
        return;
      }
      const product: Product = await response.json();
      setProducts((current) => [...current, product]);
      setName('');
    } catch {
      setError('Could not save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>Products</h1>
      <form onSubmit={saveProduct}>
        <label>
          Product name
          <input value={name} onChange={(event) => setName(event.target.value)} disabled={saving} />
        </label>
        <button type="submit" disabled={loading || saving}>Save</button>
      </form>
      {loading && <p role="status">Loading…</p>}
      {error && <p role="alert">{error}</p>}
      <ul>{products.map((product) => <li key={product.id}>{product.name}</li>)}</ul>
    </main>
  );
}`;

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
      solution: `// scripts/inventory-fixture.mjs — local fixture
import { createServer } from 'node:http';

createServer((request, response) => {
  const found = request.url === '/stock';
  response.writeHead(found ? 200 : 404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(found ? { name: 'Tea', count: 2 } : { error: 'Not found' }));
}).listen(3001, '127.0.0.1', () => console.log('Fixture running at http://127.0.0.1:3001/stock'));

// app/inventory/page.tsx
async function getData(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

export default async function InventoryPage() {
  const url = process.env.PRACTICE_API_URL;
  if (!url) return <main><p>Set PRACTICE_API_URL to your practice API URL.</p></main>;
  const stock = await getData(url);
  return <main><h1>Inventory</h1><pre>{JSON.stringify(stock, null, 2)}</pre></main>;
}

// app/inventory/error.tsx
'use client';

export default function InventoryError() {
  return <p role="alert">Could not load stock. Check the practice API.</p>;
}`,
      referenceAnswer: {
        ru: 'Разложите решение по трём файлам по комментариям. Запустите node scripts/inventory-fixture.mjs в отдельном терминале. В .env.local учебного Next.js проекта укажите PRACTICE_API_URL=http://127.0.0.1:3001/stock. После запуска npm run dev откройте /inventory. Для проверки 404 поменяйте в переменной /stock на /missing, перезапустите Next.js и откройте страницу снова.',
        tg: 'Аз рӯйи comment коди ҷавобро ба се файл ҷудо кунед. Дар терминали алоҳида node scripts/inventory-fixture.mjs занед. Дар .env.local-и проекти омӯзишии Next.js PRACTICE_API_URL=http://127.0.0.1:3001/stock гузоред. Баъди npm run dev саҳифаи /inventory-ро кушоед. Барои 404 дар variable /stock-ро ба /missing иваз кунед. Next.js-ро restart карда, саҳифаро аз нав кушоед.',
        en: 'Split the reference into the three files named in the comments. Run node scripts/inventory-fixture.mjs in a separate terminal. In the practice Next.js project’s .env.local, set PRACTICE_API_URL=http://127.0.0.1:3001/stock. Run npm run dev and open /inventory. To check 404, change /stock to /missing in the variable, restart Next.js, and reopen the page.',
      },
      task: {
        ru: '1. Добавьте /inventory в учебный проект. Используйте свой тестовый API или локальный fixture из подсказки к решению.\n2. Вызовите getData только на серверной странице. Для 200 покажите название и остаток.\n3. Подставьте адрес, который ваш API обслуживает статусом 404. Проверьте сообщение из error.tsx.\n4. Верните правильный URL и убедитесь, что снова видите данные.',
        tg: '1. Ба проекти омӯзишӣ /inventory илова кунед. API-и дарсии худ ё fixture-и маҳаллиро аз роҳнамо истифода баред.\n2. getData-ро дар саҳифаи сервер даъват кунед. Барои 200 ном ва захираро нишон диҳед.\n3. Адреси API-ро ба адресе, ки 404 медиҳад, иваз кунед. Паёми error.tsx-ро бинед.\n4. URL-и дурустро баргардонед ва санҷед, ки дода боз мебарояд.',
        en: '1. Add /inventory to the practice project. Use a test API you already control or the local fixture described in the reference.\n2. Call getData on the server page. For 200, show the name and stock count.\n3. Use a URL that returns 404. Check the error.tsx message.\n4. Restore the working URL and confirm the data is visible again.',
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
      solution: `// app/api/title/route.ts
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('title' in body) || typeof body.title !== 'string') {
    return Response.json({ error: 'Enter a title.' }, { status: 400 });
  }
  const title = body.title.trim();
  if (!title || title.length > 40) {
    return Response.json({ error: 'Use 1–40 characters.' }, { status: 400 });
  }
  return Response.json({ title });
}`,
      referenceAnswer: {
        ru: 'Для {"title":"  Fix a chair  "} ожидайте 200 и {"title":"Fix a chair"}. Заголовок после trim длиной 41 символ, строка из пробелов и число вместо строки получают 400. Посмотрите status и body в Network.',
        tg: 'Барои {"title":"  Fix a chair  "} натиҷа 200 ва {"title":"Fix a chair"} мешавад. Номе, ки пас аз trim 41 аломат дорад, сатри фақат пробел ва адад 400 мегиранд. Status ва body-ро дар Network бинед.',
        en: 'Expect 200 and {"title":"Fix a chair"} for {"title":"  Fix a chair  "}. A 41-character trimmed title, a string of spaces, and a number each receive 400. Check the status and body in Network.',
      },
      task: {
        ru: '1. В учебном проекте создайте app/api/title/route.ts. Используйте echo как пример устройства обработчика.\n2. Примите поле title и обрежьте пробелы. Разрешите от 1 до 40 символов.\n3. Отправьте POST с заголовком, пробелами, числом и строкой из 41 символа.\n4. Сравните статус и JSON всех ответов. При 200 заголовок приходит без лишних пробелов.',
        tg: '1. Дар проекти омӯзишӣ app/api/title/route.ts созед. Сохти echo-ро ҳамчун намуна гиред.\n2. Field-и title-ро қабул карда, пробелҳои атрофашро тоза кунед. Аз 1 то 40 аломат иҷозат диҳед.\n3. Бо ном, пробел, адад ва сатри 41-аломатӣ POST фиристед.\n4. Status ва JSON-и ҳар ҷавобро муқоиса кунед. Бо 200 ном бе пробели зиёдатӣ меояд.',
        en: '1. Create app/api/title/route.ts in the practice project. Use echo to see how a handler is structured.\n2. Accept a title field, trim the spaces, and allow 1 to 40 characters.\n3. POST a title, spaces, a number, and a 41-character string.\n4. Compare the status and JSON. A 200 response returns the trimmed title.',
      },
      hint: {
        ru: 'Откройте любую страницу своего локального проекта и отправьте запрос из консоли: fetch("/api/title", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({title:"  Fix a chair  "})}). Статус и тело ответа видны в Network.',
        tg: 'Саҳифаи проекти маҳаллиро кушода аз console request фиристед: fetch("/api/title", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({title:"  Fix a chair  "})}). Status ва body дар Network намоёнанд.',
        en: 'Open a page in your local practice project and send a request from its console: fetch("/api/title", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({title:"  Fix a chair  "})}). Inspect the status and body in Network.',
      },
      criteria: [
        {
          ru: 'Правильный title очищается и приходит со статусом 200. Все три неподходящих ввода получают 400.',
          tg: 'Title-и дуруст тоза шуда бо 200 меояд. Ҳар се input-и нодуруст 400 мегирад.',
          en: 'A valid title is trimmed and receives 200. All three invalid inputs receive 400.',
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
          ru: 'Full stack означает работу с интерфейсом и сервером приложения, включая данные, которые они используют. Frontend — то, с чем человек работает в браузере. Backend принимает запросы и решает, какие операции выполнить. API задаёт, куда и в каком формате отправлять запрос и что ждать в ответ. База хранит записи, чтобы их можно было прочитать снова.',
          tg: 'Full Stack кори қисми браузер ва сервери барномаро бо додаҳояшон якҷо меомӯзад. Frontend ҳамон қисмест, ки одам дар браузер мебинад ва истифода мебарад. Backend request-ро мегирад ва қарор мекунад, ки кадом амал иҷро шавад. API адрес, формати request ва ҷавоби интизориро муайян мекунад. База сабтҳоро нигоҳ медорад, то боз хонда шаванд.',
          en: 'Full stack work spans the browser interface and the application server, including the data they use. The frontend is what the person uses in the browser. The backend receives requests and decides which work to do. The API specifies where a request goes, its format, and what the caller gets back. The database stores records for later reads.',
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
      kind: 'code' as const,
      solution: productPractice,
      referenceAnswer: {
        ru: 'Разложите код решения по двум файлам из комментариев. В учебной папке сервер сам создаст products.sqlite. Сначала GET возвращает список. После добавления Coffee POST возвращает 201 и строку с ID. Новый GET после перезапуска из той же папки находит этот ID. Пробелы дают 400, поле остаётся заполненным, список не увеличивается.',
        tg: 'Коди ҷавобро ба ду файле, ки дар comment нишон дода шудаанд, ҷудо кунед. Сервер дар папкаи омӯзишӣ products.sqlite месозад. Аввал GET рӯйхат медиҳад. Баъди иловаи Coffee, POST бо 201 ва сатри ID-дор ҷавоб медиҳад. GET-и нав пас аз restart аз ҳамон папка ҳамин ID-ро меёбад. Пробелҳо 400 медиҳанд, input мемонад ва рӯйхат калон намешавад.',
        en: 'Split the reference into the two files named in the comments. The local server creates products.sqlite in the practice directory. GET first returns a list. Adding Coffee gives a POST response of 201 and a row with its ID. After restarting from the same directory, a new GET returns that ID. Spaces receive 400, the input stays filled, and the list does not grow.',
      },
      task: {
        ru: '1. В отдельном учебном проекте Next.js на Node.js 24 создайте app/api/products/route.ts и app/products/page.tsx. Используйте src/app, если так устроен проект.\n2. Сделайте GET и POST для локального products.sqlite. Примите name, обрежьте пробелы и разрешите от 1 до 60 символов.\n3. На /products добавьте Coffee через форму. В Network запишите статус и возвращённый ID. Затем отправьте только пробелы и сравните.\n4. Перезапустите учебный сервер из той же папки. Откройте /products и /api/products. Найдите Coffee с прежним ID.',
        tg: '1. Дар проекти алоҳидаи Next.js бо Node.js 24 app/api/products/route.ts ва app/products/page.tsx созед. Агар проект src дошта бошад, аз src/app истифода баред.\n2. Барои products.sqlite-и маҳаллӣ GET ва POST созед. name-ро гиред, пробелҳои атрофро тоза кунед ва аз 1 то 60 аломат қабул кунед.\n3. Дар /products аз форма Coffee илова кунед. Дар Network status ва ID-ро нависед. Баъд фақат пробел фиристед ва муқоиса кунед.\n4. Серверро аз ҳамон папка restart кунед. /products ва /api/products-ро кушода, Coffee-ро бо ID-и пешина ёбед.',
        en: '1. In a separate Next.js practice project on Node.js 24, create app/api/products/route.ts and app/products/page.tsx. Use src/app if the project has that layout.\n2. Add GET and POST for a local products.sqlite file. Accept name, trim the spaces, and allow 1 to 60 characters.\n3. Add Coffee through the form on /products. Record the status and ID in Network. Then submit only spaces and compare.\n4. Restart the practice server from the same folder. Open /products and /api/products and find Coffee with its original ID.',
      },
      hint: {
        ru: 'Для успешного сценария запишите возвращённый ID. Для ошибки проверьте поля и список отдельно.',
        tg: 'Барои муваффақият ID-и баргаштаро навис. Барои хато майдонҳо ва рӯйхатро ҷудо санҷ.',
        en: 'Record the returned ID on success. For a failure, inspect both the form and the stored list.',
      },
      criteria: [
        {
          ru: 'Успешный POST возвращает 201, имя и ID, а форма показывает сохранённую строку.',
          tg: 'POST-и дуруст 201, ном ва ID медиҳад ва форма сатри сабтшударо нишон медиҳад.',
          en: 'A successful POST returns 201, the name, and the ID, and the form displays the stored row.',
        },
        {
          ru: 'Пробелы дают 400, сохраняют ввод и не добавляют строку.',
          tg: 'Пробелҳо 400 медиҳанд, input мемонад ва сатри нав илова намешавад.',
          en: 'Spaces receive 400, keep the current input, and create no record.',
        },
        {
          ru: 'После перезапуска GET возвращает тот же ID, а страница показывает Coffee.',
          tg: 'Баъди restart, GET ҳамон ID-ро медиҳад ва саҳифа Coffee-ро нишон медиҳад.',
          en: 'After restarting, GET returns the same ID and the page displays Coffee.',
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
