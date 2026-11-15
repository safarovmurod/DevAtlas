import type { CourseContent } from '@/lib/courses/schema';

type Lesson = CourseContent['lessons'][number];
type LessonText = Lesson['title'];
type Section = Lesson['sections'][number];
type Question = Lesson['questions'][number];

const text = (ru: string, tg: string, en: string): LessonText => ({ ru, tg, en });

function check(
  day: number,
  suffix: string,
  relatedSection: number,
  correctIndex: number,
  question: LessonText,
  options: Question['options'],
  hint: LessonText,
): Question {
  return {
    id: 'nextjs-day-' + String(day).padStart(2, '0') + '-' + suffix,
    question,
    options,
    correctIndex,
    answer: options[correctIndex],
    relatedSection,
    hint,
  };
}

type FoundationReview = {
  sections: Section[];
  firstQuestion: Pick<Question, 'relatedSection' | 'hint'>;
  questions: Question[];
};

export const NEXTJS_FOUNDATION_REVIEW: Partial<Record<number, FoundationReview>> = {
  1: {
    sections: [
      {
        title: text(
          'С чего начать проект',
          'Проектро аз куҷо сар кунем?',
          'Start a practice project',
        ),
        body: text(
          'Как мастерская готовит рабочее место, так вы готовите проект для опытов. С Node.js 24 выполните npx create-next-app@16.4.2 nextjs-practice --ts --app --use-npm. Зайдите в папку nextjs-practice и запустите npm run dev. Добавьте пример в app/about/page.tsx, либо в src/app/about/page.tsx, если проект использует src. К адресу из терминала добавьте /about. Измените заголовок и проверьте, что экран обновился.',
          'Усто пеш аз кор ҷойи корашро тайёр мекунад. Бо Node.js 24 фармони npx create-next-app@16.4.2 nextjs-practice --ts --app --use-npm-ро иҷро кунед. Ба папкаи nextjs-practice дароед ва npm run dev занед. Мисолро дар app/about/page.tsx гузоред. Агар проект src дошта бошад, роҳ src/app/about/page.tsx мешавад. Ба адреси терминал /about илова карда кушоед. Сарлавҳаро иваз кунед ва бинед, ки экран нав шуд.',
          'A workshop prepares a bench before working. With Node.js 24, run npx create-next-app@16.4.2 nextjs-practice --ts --app --use-npm. Open the nextjs-practice directory and run npm run dev. Put the example in app/about/page.tsx, or src/app/about/page.tsx if the project uses src. Append /about to the URL printed in the terminal. Change the heading and check that the screen updates.',
        ),
      },
      {
        title: text(
          'HTML и клики на одной странице',
          'HTML ва тугма дар як саҳифа',
          'HTML and clicks on the same page',
        ),
        body: text(
          'Представьте страницу мастерской: часы работы известны заранее, а счётчик деталей меняется после клика. Начальный HTML страницы можно подготовить заранее, затем браузер подключит обработчик счётчика. Поэтому интерактивная кнопка не делает весь маршрут CSR. И наоборот, render по запросу не означает обновление каждую секунду: новые данные нужны при новом запросе или при отдельном обновлении интерфейса.',
          'Дар саҳифаи устохона соати кор пешакӣ маълум аст, лекин ҳисобкунаки қисмҳо баъди клик дигар мешавад. HTML-и аввалро пешакӣ тайёр кардан мумкин, баъд браузер handler-и ҳисобкунакро пайваст мекунад. Аз будани тугма тамоми route ба CSR намегузарад. Render вақти request ҳам саҳифаро ҳар сония нав намекунад. Барои додаи нав request ё навсозии UI лозим аст.',
          'A workshop knows its opening hours ahead of time, while a parts counter changes on click. The initial HTML can be prepared ahead of time and the browser can attach the counter handler later. An interactive button does not force the entire route to use CSR. Rendering on request also does not update an already open page every second. New data requires another request or a separate interface update.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 1,
      hint: text(
        'Сравните момент подготовки HTML.',
        'Вақти тайёр шудани HTML-ро муқоиса кунед.',
        'Compare when the initial HTML is prepared.',
      ),
    },
    questions: [
      check(
        1,
        'about-file',
        2,
        1,
        text(
          'Где разместить пример, чтобы открыть /about в проекте без src?',
          'Дар проекте, ки src надорад, мисолро куҷо монем, то /about кушода шавад?',
          'Where does the example go to serve /about in a project without src?',
        ),
        [
          text('В app/page.tsx', 'Дар app/page.tsx', 'In app/page.tsx'),
          text('В app/about/page.tsx', 'Дар app/about/page.tsx', 'In app/about/page.tsx'),
          text('В app/about/layout.tsx', 'Дар app/about/layout.tsx', 'In app/about/layout.tsx'),
        ],
        text(
          'Найдите папку для сегмента about и файл страницы.',
          'Папкаи қисми about ва файли саҳифаро ёбед.',
          'Find the folder for the about segment and the page file.',
        ),
      ),
      check(
        1,
        'static-with-clicks',
        3,
        2,
        text(
          'Расписание собрано заранее. Можно ли добавить счётчик с кликом?',
          'Ҷадвал пешакӣ сохта шудааст. Тугмаи ҳисобкунак илова карда мешавад?',
          'A schedule is built ahead of time. Can it also have a clickable counter?',
        ),
        [
          text(
            'Да, если заново собирать HTML при каждом клике.',
            'Ҳа, агар баъди ҳар клик HTML-ро аз нав созем.',
            'Yes, if each click rebuilds the HTML.',
          ),
          text(
            'Да, если перенести всё расписание в обработчик.',
            'Ҳа, агар тамоми ҷадвалро ба handler гузаронем.',
            'Yes, if the schedule moves into the handler.',
          ),
          text(
            'Да, браузер может подключить обработчик после загрузки.',
            'Ҳа, браузер баъди боркунӣ handler-ро пайваст карда метавонад.',
            'Yes, the browser can attach the handler after loading.',
          ),
        ],
        text(
          'Начальный HTML и обработка клика происходят в разные моменты.',
          'HTML-и аввал ва коркарди клик дар вақтҳои гуногун мешаванд.',
          'The initial HTML and the click handler are prepared at different times.',
        ),
      ),
    ],
  },
  2: {
    sections: [
      {
        title: text(
          'Что находится в каждом файле',
          'Дар ҳар файл чӣ меистад?',
          'One job per route file',
        ),
        body: text(
          'Представьте торговый центр: вывески ведут в разные магазины, а коридор общий. В Next.js общий navigation находится в app/layout.tsx, а содержимое /products — в app/products/page.tsx. Layout принимает children и выводит их в нужном месте. Когда Link открывает /books, в children появляется страница книг. Если забыть вывести children, меню останется, а содержимое не появится.',
          'Дар маркази савдо роҳрав умумӣ аст, ҳар мағоза дари худро дорад. Дар Next.js менюи умумӣ дар app/layout.tsx меистад, мундариҷаи /products бошад дар app/products/page.tsx. Layout children-ро мегирад ва дар ҷои даркорӣ нишон медиҳад. Вақте Link /books-ро мекушояд, дар children саҳифаи китоб меояд. Агар children-ро нагузоред, меню мемонад, мундариҷа намебарояд.',
          'A shopping centre has a shared hallway and separate shop doors. In Next.js, app/layout.tsx can hold shared navigation and app/products/page.tsx holds the /products screen. The layout renders its children where the page belongs. When a Link opens /books, the books page fills that slot. If the layout omits children, navigation can appear with no page content.',
        ),
      },
      {
        title: text('Как проверить маршрут', 'Route-ро чӣ хел санҷем?', 'Debugging a route'),
        body: text(
          'Если /books не открывается по прямому адресу, проверьте имя папки и наличие page.tsx внутри неё. Папка сама по себе страницу не создаёт. Если прямой адрес работает, а ссылка нет, проверьте href. Если страница долго готовится, loading.tsx даёт временный экран. Для сбоя при отрисовке сегмента предусмотрен error.tsx, который используется как Client Component.',
          'Агар /books аз адреси рост кушода нашавад, номи папка ва будани page.tsx-ро дар дохилаш санҷед. Худи папка саҳифа намесозад. Агар адрес кор кунад, link не, href-ро бинед. Агар саҳифа дер тайёр шавад, loading.tsx экрани муваққатӣ медиҳад. Барои хатои render-и сегмент error.tsx ҳаст, ки Client Component мебошад.',
          'If the direct /books URL fails, check the folder name and its page.tsx file. The folder alone does not create a page. If the URL works but the link fails, check href. A loading.tsx file can display temporary content while the page is prepared. An error.tsx file acts as a Client Component and provides a fallback for a segment rendering failure.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 0,
      hint: text(
        'Сегмент URL берётся из имени папки перед page.tsx.',
        'Қисми URL аз номи папкаи пеш аз page.tsx меояд.',
        'The URL segment comes from the folder containing page.tsx.',
      ),
    },
    questions: [
      check(
        2,
        'layout-children',
        2,
        1,
        text(
          'Меню видно на /books, но содержимое страницы отсутствует. Что проверить в layout?',
          'Дар /books меню ҳаст, лекин саҳифа холист. Дар layout чиро бинем?',
          'The menu appears on /books but the page is blank. What should you check in the layout?',
        ),
        [
          text(
            'Сохраняет ли layout children в переменной.',
            'Layout children-ро дар variable нигоҳ медорад ё не.',
            'Whether the layout stores children in a variable.',
          ),
          text(
            'Выводит ли layout значение children.',
            'Layout қимати children-ро нишон медиҳад ё не.',
            'Whether the layout renders children.',
          ),
          text(
            'Загружает ли layout файл page.tsx напрямую.',
            'Layout page.tsx-ро рост import мекунад ё не.',
            'Whether the layout imports page.tsx directly.',
          ),
        ],
        text(
          'У общего интерфейса должно быть место для страницы.',
          'Интерфейси умумӣ барои саҳифа ҷой дорад.',
          'The shared interface needs a slot for the page.',
        ),
      ),
      check(
        2,
        'bad-link',
        3,
        2,
        text(
          'Вручную /books открывается, но меню ведёт на /book. Что исправить?',
          'Адреси /books кор мекунад, меню ба /book мебарад. Чиро дуруст кунем?',
          'Direct /books works, but the menu goes to /book. What should change?',
        ),
        [
          text(
            'Путь к app/books/page.tsx.',
            'Роҳи app/books/page.tsx.',
            'The path to app/books/page.tsx.',
          ),
          text(
            'Название компонента BooksPage.',
            'Номи компоненти BooksPage.',
            'The BooksPage component name.',
          ),
          text('Значение href у ссылки.', 'Қимати href-и link.', 'The link’s href value.'),
        ],
        text(
          'Работающий прямой адрес уже подтверждает расположение файла.',
          'Адреси рост кор мекунад, пас ҷойи файл дуруст аст.',
          'The working direct URL already confirms the file location.',
        ),
      ),
    ],
  },
  3: {
    sections: [
      {
        title: text(
          'Число из сервера и клик в браузере',
          'Адад аз сервер ва клик дар браузер',
          'From a server value to a browser click',
        ),
        body: text(
          'На табло очереди сервер может передать начальное число 2. Client Component получает его через prop initialCount и создаёт локальный state. Первый клик вызывает setCount, и на кнопке видно 3. Эта операция меняет состояние в браузере. Обновление вкладки заново создаёт компонент с числом, которое передала страница. Чтобы сохранить 3 при перезапуске, нужна отдельная запись в хранилище.',
          'Барои таблои навбат сервер метавонад адади аввалини 2-ро диҳад. Client Component онро бо prop-и initialCount мегирад ва state-и маҳаллӣ месозад. Клики аввал setCount-ро даъват мекунад ва тугма 3 нишон медиҳад. Ин тағйир дар браузер аст. Баъди reload компонент боз аз ададе сар мекунад, ки саҳифа медиҳад. Барои нигоҳ доштани 3 баъди restart сабт ба storage лозим мешавад.',
          'A queue display can receive an initial value of 2 from the server. The Client Component takes it as the initialCount prop and creates local state. A click calls setCount and the button shows 3. This update lives in the browser. A refresh creates the component from the page’s initial value again. Saving 3 across a restart requires a separate write to storage.',
        ),
      },
      {
        title: text(
          'Что можно передать через props',
          'Бо props чиро додан мумкин?',
          'What can cross the client boundary',
        ),
        body: text(
          'Передавайте клиенту данные, которые нужны экрану, например число книг и список названий. Обычный обработчик onClick создайте в клиентском компоненте. Секреты и запросы к закрытой базе оставляйте на сервере. Значения props пересекают границу, поэтому пароль, переданный в props, уже доступен браузеру. Директива use client относится к дереву импортов этого файла, так что интерактивный счётчик удобно держать отдельно.',
          'Ба client додае фиристед, ки ба экран даркор аст, масалан шумора ва рӯйхати китобҳо. Handler-и одии onClick-ро дар компоненти client созед. Secret ва query-и базаи пӯшида дар сервер монад. Props ба браузер меравад, барои ҳамин паролро дар props гузоштан хато аст. use client ба import-ҳои ҳамин файл ҳам таъсир мекунад. Ҳисобкунаки интерактивиро дар файли алоҳида нигоҳ доштан осонтар аст.',
          'Pass the data the browser needs, such as a book count or a list of titles. Define the ordinary onClick handler inside the Client Component. Keep credentials and private database queries on the server. Props cross the boundary, so a password passed as a prop becomes available to the browser. The use client directive applies to the file’s import tree, which is why the counter belongs in a small separate file.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 1,
      hint: text(
        'Кто обрабатывает клик после загрузки страницы?',
        'Баъди бор шудани саҳифа кликро кӣ коркард мекунад?',
        'Which environment handles a click after the page loads?',
      ),
    },
    questions: [
      check(
        3,
        'counter-refresh',
        2,
        1,
        text(
          'Сервер всегда передаёт 2. Вы кликнули один раз, затем обновили вкладку. Какую цифру увидите?',
          'Сервер ҳамеша 2 медиҳад. Як бор клик кардед ва reload задед. Кадом адад мебарояд?',
          'The server always passes 2. You click once and then refresh. Which number appears?',
        ),
        [
          text(
            '3, клик записал новое число.',
            '3, клик адади навро сабт кард.',
            '3, the click stored the new number.',
          ),
          text(
            '2, компонент снова получит начальное число.',
            '2, компонент боз адади аввалро мегирад.',
            '2, the component receives its initial value again.',
          ),
          text(
            '0, любой state всегда начинается с нуля.',
            '0, ҳар state аз сифр сар мешавад.',
            '0, every state always starts at zero.',
          ),
        ],
        text(
          'Проследите, откуда новый экземпляр берёт initialCount.',
          'Бинед, компоненти нав initialCount-ро аз куҷо мегирад.',
          'Trace where a newly created component gets initialCount.',
        ),
      ),
      check(
        3,
        'client-props',
        3,
        2,
        text(
          'Компоненту нужно показать число книг. Что передать ему из серверной страницы?',
          'Компонент шумораи китобро нишон медиҳад. Аз саҳифаи сервер ба он чӣ диҳем?',
          'The component displays a book count. What should the server page pass?',
        ),
        [
          text(
            'Активное соединение с базой.',
            'Пайвасти фаъоли база.',
            'An active database connection.',
          ),
          text(
            'Ключ сервиса, который отдаёт книги.',
            'Калиди сервисе, ки китоб медиҳад.',
            'The service key for reading books.',
          ),
          text(
            'Готовое число, полученное после запроса.',
            'Адади тайёре, ки баъди query гирифтем.',
            'The number produced by the server query.',
          ),
        ],
        text(
          'Для первой отрисовки достаточно уже вычисленного значения.',
          'Барои render-и аввал қимати ҳисобшуда бас аст.',
          'The first render only needs the computed value.',
        ),
      ),
    ],
  },
  4: {
    sections: [
      {
        title: text(
          'Запрос, статус и тело ответа',
          'Request, status ва body',
          'Trace the request and response',
        ),
        body: text(
          'Как в магазине сначала узнают, есть ли заказ, так и код сначала проверяет статус. Серверная страница вызывает await getData(url). Если API вернул 200 и JSON с name: "Tea", проверка response.ok проходит и response.json() читает данные. При 404 проверка даёт false, и функция останавливается на throw. Отдельно проверьте ошибку сети и неверный JSON: обе могут произойти даже там, где обрабатывается статус.',
          'Дар мағоза аввал мебинанд, ки заказ ҳаст ё не. Код ҳам аввал status-ро месанҷад. Саҳифаи сервер await getData(url)-ро даъват мекунад. Агар API 200 ва JSON бо name: "Tea" диҳад, response.ok дуруст аст ва response.json() додаро мехонад. Бо 404 санҷиш false мешавад ва функсия ба throw мерасад. Хатои шабака ва JSON-и нодуруст ҳам алоҳида санҷида мешаванд.',
          'A shop first checks whether an order exists. Code first checks the response status. The server page calls await getData(url). With 200 and JSON containing name: "Tea", response.ok is true and response.json() reads the data. With 404, the check fails and the helper throws. Network failures and invalid JSON remain separate cases even when the status is checked.',
        ),
      },
      {
        title: text(
          'Какие данные можно переиспользовать',
          'Кадом додаро дубора истифода бурдан мумкин?',
          'Which data can be reused',
        ),
        body: text(
          'Остаток 2 может стать 0 после покупки. Для проверки перед заказом запросите свежий остаток. Описание товара меняется редко и может дольше использоваться повторно. Параметр no-store в примере управляет кешированием этого запроса Next.js. Он не превращает уже открытую вкладку в подписку на обновления. Для проверки измените данные у своего API и снова откройте страницу.',
          'Захираи 2 баъди харид метавонад 0 шавад. Пеш аз заказ захираи навро хонед. Шарҳи мол кам тағйир меёбад ва нусхаи пештараашро истифода бурдан мумкин. no-store дар мисол cache-и ҳамин request-и Next.js-ро идора мекунад. Саҳифаи кушода худ аз худ ҳар тағйирро намегирад. Барои санҷиш додаи API-и озмоиширо дигар кунед ва саҳифаро аз нав кушоед.',
          'A stock count of 2 can become 0 after a purchase. Ask for current stock before taking a new order. A product description changes less often and may be reused. The example’s no-store option controls how Next.js caches that request. An already open page does not subscribe to updates. Test by changing your practice API data and opening the page again.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 0,
      hint: text(
        'Уточните, где вызывается async-функция страницы.',
        'Бинед, функсияи async-и саҳифа дар куҷо кор мекунад.',
        'Check where the async page function runs.',
      ),
    },
    questions: [
      check(
        4,
        'status-before-json',
        2,
        1,
        text(
          'API вернул 404 и корректный JSON. Что сделает getData из урока?',
          'API 404 ва JSON-и дуруст дод. getData-и дарс чӣ мекунад?',
          'The API returns 404 with valid JSON. What does the lesson’s getData do?',
        ),
        [
          text(
            'Покажет JSON как успешные данные.',
            'JSON-ро ҳамчун натиҷаи дуруст медиҳад.',
            'Treats the JSON as successful data.',
          ),
          text(
            'Выбросит ошибку после проверки response.ok.',
            'Баъди санҷиши response.ok хато медиҳад.',
            'Throws after checking response.ok.',
          ),
          text(
            'Автоматически выполнит другой запрос.',
            'Худаш request-и дигар мефиристад.',
            'Automatically makes a second request.',
          ),
        ],
        text(
          'До чтения JSON функция оценивает статус.',
          'Функсия пеш аз JSON status-ро месанҷад.',
          'The helper checks the status before reading JSON.',
        ),
      ),
      check(
        4,
        'fresh-stock',
        3,
        2,
        text(
          'Остаток нужно проверять перед каждой покупкой. Что выбрать в запросе примера?',
          'Пеш аз ҳар харид захираи нав даркор аст. Дар request-и мисол чиро интихоб кунем?',
          'Stock must be checked before every purchase. What should the example request do?',
        ),
        [
          text(
            'Использовать значение из прошлой вкладки.',
            'Қимати вкладкаи пешинаро истифода барад.',
            'Reuse the value from an earlier tab.',
          ),
          text(
            'Подготовить остаток только на сборке.',
            'Захираро фақат вақти build тайёр кунад.',
            'Compute stock only at build time.',
          ),
          text(
            'Запросить текущий ответ с cache: "no-store".',
            'Бо cache: "no-store" ҷавоби нав гирад.',
            'Request the current response with cache: "no-store".',
          ),
        ],
        text(
          'Решите, годится ли старый ответ после покупки другого человека.',
          'Бинед, баъди хариди каси дигар ҷавоби пешина мувофиқ аст ё не.',
          'Decide whether the previous response is trustworthy after someone else buys.',
        ),
      ),
    ],
  },
  5: {
    sections: [
      {
        title: text('От адреса до заголовка', 'Аз адрес то сарлавҳа', 'From the URL to a heading'),
        body: text(
          'Как номер на ящике указывает на одну полку, slug указывает на статью. Для /blog/react Next.js выбирает app/blog/[slug]/page.tsx. В примере await params даёт slug "react". Затем find перебирает записи и возвращает ту, у которой slug совпал. Из записи берутся title и body. Если прийти по адресу /blog/css, сработает тот же файл, только значение slug будет "css".',
          'Чӣ тавре ки рақами ҷевон ҷойи чизро нишон медиҳад, slug мақоларо муайян мекунад. Барои /blog/react файли app/blog/[slug]/page.tsx кор мекунад. Дар мисол await params slug-и "react" медиҳад. find сабтҳоро дида, ҳамон сабти мувофиқро мегирад. Аз он title ва body ба экран мебароянд. Барои /blog/css ҳамин файл кор мекунад, фақат slug "css" мешавад.',
          'A number on a locker points to one item, and a slug points to one article. For /blog/react, Next.js finds app/blog/[slug]/page.tsx. The example awaits params to obtain "react". Then find returns the matching record, whose title and body are rendered. A visit to /blog/css uses the same file with "css" as the slug.',
        ),
      },
      {
        title: text(
          'Адрес есть, записи нет',
          'Адрес ҳаст, сабт нест',
          'A URL with no matching record',
        ),
        body: text(
          'Динамическая папка означает, что код может разобрать адрес. Она не добавляет статью в список. Если find вернул undefined, вызовите notFound() до чтения post.title. Заголовок статьи для людей может быть «Основы React», а slug для ссылки — react. Используйте разные slug для разных статей, иначе find возьмёт первое совпадение.',
          'Папкаи динамикӣ ба код имкон медиҳад адресро хонад. Он ба рӯйхат мақолаи нав илова намекунад. Агар find undefined диҳад, пеш аз хондани post.title ба notFound() гузаред. Сарлавҳа метавонад «Асосҳои React» бошад, slug барои link react мемонад. Барои ду мақола як slug надиҳед, вагарна find якумашро мегирад.',
          'A dynamic folder tells Next.js how to read the URL. It does not create an article. If find returns undefined, call notFound() before reading post.title. The visible title may be “React basics” while the link uses react. Give each article a distinct slug, otherwise find picks the first match.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 1,
      hint: text(
        'Прямой адрес доступен и без перехода из списка.',
        'Адреси мустақим бе гузаштан аз рӯйхат ҳам дастрас аст.',
        'A direct address is available even without navigating from a list.',
      ),
    },
    questions: [
      check(
        5,
        'slug-value',
        2,
        1,
        text(
          'Что получит страница из params при открытии /blog/react?',
          'Вақти кушодани /blog/react дар params чӣ меояд?',
          'What value does the page read from params for /blog/react?',
        ),
        [
          text(
            'Полный путь /blog/react.',
            'Роҳи пурраи /blog/react.',
            'The whole path /blog/react.',
          ),
          text('Значение slug "react".', 'Қимати slug-и "react".', 'The slug value "react".'),
          text('Заголовок из post.title.', 'Сарлавҳаи post.title.', 'The heading from post.title.'),
        ],
        text(
          'Сопоставьте [slug] с одним сегментом адреса.',
          '[slug]-ро бо як қисми адрес муқоиса кунед.',
          'Match [slug] with one segment of the URL.',
        ),
      ),
      check(
        5,
        'unknown-record',
        3,
        2,
        text(
          'Маршрут подходит, но find вернул undefined. Что сделать дальше?',
          'Route мувофиқ аст, лекин find undefined дод. Қадами дигар чист?',
          'The route matches but find returns undefined. What should happen next?',
        ),
        [
          text(
            'Прочитать post.title, затем проверить его.',
            'Аввал post.title-ро хонда, баъд санҷед.',
            'Read post.title and check the value.',
          ),
          text(
            'Показать первую статью в списке.',
            'Мақолаи якуми рӯйхатро нишон диҳед.',
            'Render the first article in the list.',
          ),
          text(
            'Вызвать notFound() перед чтением post.title.',
            'Пеш аз post.title ба notFound() гузаред.',
            'Call notFound() before reading post.title.',
          ),
        ],
        text(
          'У отсутствующей записи нельзя прочитать поле.',
          'Аз сабти набуда field хонда намешавад.',
          'A missing record has no fields to read.',
        ),
      ),
    ],
  },
  6: {
    sections: [
      {
        title: text('Метод, адрес и JSON', 'Method, адрес ва JSON', 'Method, URL and JSON'),
        body: text(
          'В мастерской один бланк сообщает, что ищут заказ, другой — что хотят его оформить. В HTTP метод указывает на действие. GET обычно читает данные, POST отправляет данные на обработку. В нашем примере POST /api/echo принимает тело {"name":" Ali "}, trim() убирает пробелы, затем Response.json отправляет {"name":"Ali"} со статусом 200. В адресной строке браузер делает GET, поэтому так POST не проверить.',
          'Дар устохона аз рӯйи бланк мефаҳманд, ки заказро мекобанд ё нав месозанд. Дар HTTP method амалро нишон медиҳад. GET одатан мехонад, POST барои коркард дода мефиристад. Дар мисол POST /api/echo body-и {"name":" Ali "}-ро мегирад. trim() пробелҳоро тоза мекунад ва Response.json бо status-и 200 {"name":"Ali"} медиҳад. Адреси браузер GET мекунад, барои ҳамин аз он ҷо POST санҷида намешавад.',
          'A workshop uses different forms to find an order and to submit a new one. The HTTP method communicates the action. GET usually reads data and POST sends data to process. Here POST /api/echo receives {"name":" Ali "}. After trim removes the extra spaces, Response.json returns {"name":"Ali"} with status 200. Typing a URL into the address bar sends a GET, so it cannot test this POST.',
        ),
      },
      {
        title: text('Четыре входа для проверки', 'Чор input барои санҷиш', 'Four inputs to test'),
        body: text(
          'Проверьте в локальном проекте нормальное имя, имя из пробелов, число вместо имени и повреждённый JSON. Первый запрос возвращает очищенную строку. Остальные получают 400 с понятным сообщением. Валидация — это проверка реальных значений, полученных при запросе. Тип TypeScript показывает, что ваш код ожидает, но не заменяет проверку JSON извне.',
          'Дар проекти маҳаллӣ номи дуруст, номи фақат пробел, адад ба ҷои ном ва JSON-и вайронро санҷед. Request-и аввал сатри тозаро медиҳад. Дигарҳо 400 бо паёми фаҳмо мегиранд. Validation қиматҳои воқеии омадаи request-ро месанҷад. TypeScript нишон медиҳад, ки код чиро интизор аст, аммо санҷиши JSON-и берунро ба ҷойи сервер намекунад.',
          'In a local project, try a valid name, spaces only, a number in place of a name, and malformed JSON. The first request returns the trimmed string. The others receive 400 with an explanation. Validation checks the actual values arriving with a request. A TypeScript type describes what your code expects and does not check JSON from outside the app.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 0,
      hint: text(
        'Что видит клиент после обработки запроса?',
        'Баъди коркарди request client чӣ мегирад?',
        'What does the client receive after the request is handled?',
      ),
    },
    questions: [
      check(
        6,
        'use-post',
        2,
        1,
        text(
          'В app/api/echo/route.ts экспортирован только POST. Как его проверить?',
          'Дар app/api/echo/route.ts танҳо POST export шудааст. Чӣ хел санҷем?',
          'app/api/echo/route.ts only exports POST. How should you test it?',
        ),
        [
          text(
            'Открыть /api/echo в адресной строке.',
            'Дар адреси браузер /api/echo-ро кушоед.',
            'Open /api/echo in the address bar.',
          ),
          text(
            'Отправить POST с JSON на /api/echo.',
            'Ба /api/echo POST бо JSON фиристед.',
            'Send a POST with JSON to /api/echo.',
          ),
          text(
            'Отправить GET с параметром name.',
            'GET бо параметри name фиристед.',
            'Send a GET with a name parameter.',
          ),
        ],
        text(
          'Функция выбирается по HTTP-методу, а не только по адресу.',
          'Барои интихоб кардани функсия ҳам адрес ва ҳам method муҳим аст.',
          'The HTTP method helps select the handler.',
        ),
      ),
      check(
        6,
        'spaces-only',
        3,
        2,
        text(
          'Какой результат вернёт пример для {"name":"   "}?',
          'Барои {"name":"   "} мисол чӣ натиҷа медиҳад?',
          'What does the example return for {"name":"   "}?',
        ),
        [
          text(
            '200 с исходными пробелами.',
            '200 бо ҳамон пробелҳо.',
            '200 with the original whitespace.',
          ),
          text('200 с именем "".', '200 бо номи "".', '200 with an empty name.'),
          text('400 с сообщением об ошибке.', '400 бо паёми хато.', '400 with an error message.'),
        ],
        text(
          'Проверьте значение name после trim().',
          'Қимати name-ро баъди trim() санҷед.',
          'Check the value of name after trim().',
        ),
      ),
    ],
  },
  7: {
    sections: [
      {
        title: text(
          'Кто вошёл и что ему разрешено',
          'Кӣ ворид шуд ва чӣ иҷозат дорад?',
          'Identity and permission',
        ),
        body: text(
          'Пропуск в мастерскую показывает, кто вошёл. Разрешение на ящик определяет, к какому ящику этот сотрудник имеет доступ. Аутентификация подтверждает личность, авторизация проверяет конкретное действие. В примере сессия пользователя u2 действительна, но заказ принадлежит u1, поэтому canEdit возвращает false. Для u1 тот же заказ разрешён.',
          'Пропуски устохона нишон медиҳад, ки кӣ даромад. Иҷозати ҷевон бошад нишон медиҳад, ки кадом ҷевонро кушода метавонад. Authentication шахсро тасдиқ мекунад, authorization иҷозати амалро месанҷад. Дар мисол session-и u2 дуруст аст, лекин заказ аз u1 аст, барои ҳамин canEdit false медиҳад. Барои u1 ҳамон заказ иҷозат аст.',
          'A workshop badge identifies who entered. A locker permission determines which locker that worker can open. Authentication verifies identity and authorization checks a specific action. A session for u2 can be valid even though the order belongs to u1. In that case canEdit returns false. For u1 and the same order, it returns true.',
        ),
      },
      {
        title: text(
          'Откуда берутся оба ID',
          'Ҳар ду ID аз куҷо меоянд?',
          'Where the two IDs come from',
        ),
        body: text(
          'В примере объекты с u1 и u2 — учебные значения для проверки функции. В реальном приложении сервер получает userId из проверенной сессии библиотеки, а ownerId — из сохранённой записи. Входящий ID заказа подсказывает, какую запись проверить. Допуск к ней подтверждает сервер до записи. Проверку нужно повторять у каждой операции, для которой требуется доступ.',
          'Объектҳои u1 ва u2 дар мисол барои санҷиши функсия сохта шудаанд. Дар app-и воқеӣ сервер userId-ро аз session-и тасдиқшуда мегирад, ownerId-ро аз сабти база. ID-и заказ нишон медиҳад, ки кадом сабт даркор аст. Пеш аз тағйир сервер иҷозатро тасдиқ мекунад. Барои ҳар амали ҳифзшуда ҳамин санҷиш лозим аст.',
          'The u1 and u2 objects are fixtures for checking the function. In a real app, the server takes userId from the library’s verified session and ownerId from the stored record. The incoming order ID identifies which record needs checking. The server confirms permission before writing. Run that check for every operation that requires access.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 1,
      hint: text(
        'Есть ли разница между входом и проверкой владельца?',
        'Ворид шудан ва соҳиби сабт будан як чизанд?',
        'Think about the difference between signing in and owning the record.',
      ),
    },
    questions: [
      check(
        7,
        'session-owner',
        2,
        1,
        text(
          'Сессия u2 проверена, заказ принадлежит u1. Что вернёт canEdit?',
          'Session-и u2 тасдиқ шуд, заказ аз u1 аст. canEdit чӣ медиҳад?',
          'The u2 session has been verified and the order belongs to u1. What does canEdit return?',
        ),
        [
          text(
            'true, потому что пользователь вошёл.',
            'true, чун user ворид шуд.',
            'true, because the user signed in.',
          ),
          text(
            'false, потому что владельцы не совпали.',
            'false, чун ID-ҳо мувофиқ нашуданд.',
            'false, because the IDs do not match.',
          ),
          text(
            'null, потому что сессия существует.',
            'null, чун session ҳаст.',
            'null, because the session exists.',
          ),
        ],
        text(
          'Проследите сравнение двух идентификаторов.',
          'Муқоисаи ду ID-ро пайгирӣ кунед.',
          'Trace the comparison between the two IDs.',
        ),
      ),
      check(
        7,
        'verified-identity',
        3,
        2,
        text(
          'Откуда сервер берёт ID действующего пользователя перед изменением заказа?',
          'Пеш аз тағйири заказ сервер ID-и user-ро аз куҷо мегирад?',
          'Where does the server get the acting user’s ID before updating an order?',
        ),
        [
          text(
            'Из переданного поля ownerId формы.',
            'Аз field-и ownerId-и форма.',
            'From the form’s ownerId field.',
          ),
          text(
            'Из адреса открытой страницы.',
            'Аз адреси саҳифаи кушода.',
            'From the URL of the current page.',
          ),
          text(
            'Из проверенной сервером сессии.',
            'Аз session-е, ки сервер тасдиқ кардааст.',
            'From the server-verified session.',
          ),
        ],
        text(
          'Различите сведения о записи и подтверждённую личность.',
          'Додаи сабт ва шахси тасдиқшударо ҷудо кунед.',
          'Distinguish record data from verified identity.',
        ),
      ),
    ],
  },
  8: {
    sections: [
      {
        title: text('Модель и одна запись', 'Model ва як сабт', 'A model and a record'),
        body: text(
          'Представьте журнал мастерской: бланк задаёт графы, а заполненная строка — отдельный заказ. Модель Todo определяет поля, но сама по себе не создаёт задачу. Для первого Todo с name "Check tyre" база назначает id при вставке и сохраняет completed: false по умолчанию. В новой пустой базе это может быть id 1, но в интерфейсе берите реальный ID из ответа.',
          'Журнали устохонаро тасаввур кунед. Бланк сутунҳоро муайян мекунад, сатри пуршуда як заказ аст. Model-и Todo field-ҳоро муайян мекунад, худи task-ро намесозад. Барои Todo бо name-и "Check tyre" база вақти insert id медиҳад ва completed-ро false мемонад. Дар базаи нави холӣ id метавонад 1 бошад. Дар UI id-и воқеиро аз response гиред.',
          'A workshop ledger defines its columns, and one filled line represents an order. The Todo model defines fields and does not create a task itself. When the database inserts a Todo named "Check tyre", it assigns id and defaults completed to false. In a new empty database the id might be 1. Use the actual id returned to the interface.',
        ),
      },
      {
        title: text(
          'Три шага от схемы до чтения',
          'Се қадам аз schema то хониш',
          'From schema to read-back',
        ),
        body: text(
          'Сначала измените модель в учебной схеме. Затем примените миграцию к учебной базе, чтобы её структура совпала с моделью. После этого сервер может записать новую строку и прочитать её по ID. Если код ожидает новое поле, а миграция не применена, база ещё работает со старой структурой. В упражнении можно разобрать модель и ответ письменно. Рабочую запись в локальный SQLite вы сделаете на дне 17.',
          'Аввал model-ро дар schema-и омӯзишӣ иваз кунед. Баъд migration-ро ба базаи омӯзишӣ гузаронед, то сохти база ба model мувофиқ шавад. Пас сервер сатри нав сабт карда аз рӯйи ID мехонад. Агар код field-и навро интизор бошаду migration нагузашта бошад, база ҳоло сохти пешинаро дорад. Дар ин машқ model-ро хаттӣ фаҳмондан мумкин. Дар рӯзи 17 ба SQLite-и маҳаллӣ сабти воқеӣ мекунед.',
          'First change the model in the practice schema. Apply its migration to the practice database so its structure matches. Then server code can insert a row and read it by ID. If code expects a new field before the migration is applied, the database still has its old structure. For this exercise you can trace the model in writing. Day 17 provides a working local SQLite write.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 1,
      hint: text(
        'Представьте, что процесс приложения завершился и запустился снова.',
        'Тасаввур кунед, ки process-и app-ро қатъ карда боз фаъол кардед.',
        'Imagine stopping and restarting the application process.',
      ),
    },
    questions: [
      check(
        8,
        'todo-defaults',
        2,
        1,
        text(
          'Вы создаёте Todo и передаёте только name. Какое поле получит false?',
          'Todo месозед ва фақат name медиҳед. Кадом field false мешавад?',
          'You create a Todo with only name. Which field gets false?',
        ),
        [
          text(
            'name, потому что задача новая.',
            'name, чун task нав аст.',
            'name, because the task is new.',
          ),
          text(
            'completed, согласно модели.',
            'completed, мувофиқи model.',
            'completed, as defined by the model.',
          ),
          text('id, до первого чтения.', 'id, то хониши аввал.', 'id, until the first read.'),
        ],
        text(
          'Посмотрите выражение @default у каждого поля.',
          'Ба @default-и ҳар field нигаред.',
          'Check each field’s @default expression.',
        ),
      ),
      check(
        8,
        'model-vs-migration',
        3,
        2,
        text(
          'В schema добавили поле. Как сделать его доступным в существующей учебной базе?',
          'Ба schema field илова шуд. Чӣ хел онро дар базаи омӯзишӣ дастрас кунем?',
          'A field was added to the schema. How does it become available in the existing practice database?',
        ),
        [
          text(
            'Поменять название компонента формы.',
            'Номи компоненти формаро иваз кунед.',
            'Rename the form component.',
          ),
          text(
            'Сделать новый GET без изменений базы.',
            'GET-и нав фиристед, база ҳамон хел монад.',
            'Send a new GET without changing the database.',
          ),
          text(
            'Применить миграцию к базе.',
            'Ба база migration гузаронед.',
            'Apply a migration to the database.',
          ),
        ],
        text(
          'База хранит собственную структуру таблиц.',
          'База сохти ҷадвалҳои худро дорад.',
          'The database stores its own table structure.',
        ),
      ),
    ],
  },
  9: {
    sections: [
      {
        title: text(
          'Как код доходит до пользователя',
          'Код чӣ хел ба user мерасад?',
          'How code reaches a user',
        ),
        body: text(
          'Мастерская сначала проверяет детали, затем собирает механизм и испытывает его на месте. В проекте CI (автоматические проверки) запускает только настроенные команды. Build собирает приложение. Deploy запускает собранную версию в нужной среде, например Preview для проверки. После запуска откройте URL и проверьте чтение учебных данных: так вы увидите, работает ли конфигурация хоста.',
          'Усто аввал қисмҳоро месанҷад, баъд механизмро ҷамъ карда дар ҷояш тафтиш мекунад. Дар проект CI санҷишҳои автоматиро иҷро мекунад, фақат командаҳоеро, ки танзим шудаанд. Build app-ро месозад. Deploy версияи ҷамъшударо дар environment-и лозим, масалан Preview, фаъол мекунад. Баъди оғоз URL-ро кушоед ва хониши додаи омӯзиширо санҷед, то конфиги host-ро тафтиш кунед.',
          'A workshop checks parts, assembles the machine and tests it where it will run. Continuous integration (CI) runs only the checks you configure. Build assembles the app. Deployment runs that build in an environment such as Preview for a review. Once it runs, open the URL and check a practice data read to verify the host configuration.',
        ),
      },
      {
        title: text(
          'Где искать сбой после сборки',
          'Хатои баъди build-ро аз куҷо ёбем?',
          'Finding a failure after build',
        ),
        body: text(
          'Представьте: npm run build завершился, но список на Preview пуст. Сначала выясните, пришёл ли 200 с пустым списком или запрос завершился ошибкой. При ошибке проверьте лог сервера и наличие переменной базы именно в Preview. Имена ключей можно перечислить в README. Значения секретов храните в настройках серверной среды и проверяйте доступ без их вывода.',
          'Масалан, npm run build гузашт, лекин рӯйхати Preview холӣ аст. Аввал бинед, ки 200 бо рӯйхати холӣ омад ё request хато дод. Агар хато бошад, log-и сервер ва мавҷуд будани variable-и база дар худи Preview-ро санҷед. Номи key-ҳоро дар README навиштан мумкин. Қимати secret дар танзими сервер мемонад. Дастрасиро бе чоп кардани secret санҷед.',
          'Suppose npm run build succeeds but the Preview list is blank. First check whether you received 200 with an empty list or the request failed. On failure, inspect server logs and check whether Preview has its database variable. The README can list key names. Store secret values in server-side environment settings and verify access without printing them.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 1,
      hint: text(
        'Часть окружения доступна коду браузера, часть остаётся на сервере.',
        'Қисми environment ба браузер дастрас аст, қисми дигар дар сервер мемонад.',
        'Some environment values can reach browser code, while others stay on the server.',
      ),
    },
    questions: [
      check(
        9,
        'build-vs-deploy',
        2,
        1,
        text(
          'Локальный build завершился. Что теперь точно известно?',
          'Build-и маҳаллӣ гузашт. Ҳозир чиро аниқ медонем?',
          'A local build finishes. What has been verified?',
        ),
        [
          text(
            'На хосте работает тот же API.',
            'Ҳамон API дар host кор мекунад.',
            'The same API works on the host.',
          ),
          text(
            'В этой среде собралась текущая версия.',
            'Версияи ҷорӣ дар ҳамин environment сохта шуд.',
            'The current version builds in this environment.',
          ),
          text(
            'Каждая запись переживёт повторный deploy.',
            'Ҳар сабт баъди deploy-и нав мемонад.',
            'Every record survives another deployment.',
          ),
        ],
        text(
          'Опирайтесь на то, что команда действительно запускала.',
          'Бинед, ки команда дар асл чиро иҷро кард.',
          'Only claim what the command actually ran.',
        ),
      ),
      check(
        9,
        'preview-failure',
        3,
        2,
        text(
          'После сборки API на Preview вернул 500. Какой следующий шаг даст доказательство?',
          'Баъди build API дар Preview 500 дод. Кадом қадам далел медиҳад?',
          'After building, the Preview API returns 500. Which next step gives you useful evidence?',
        ),
        [
          text(
            'Повторить локальную сборку без изменений.',
            'Build-и маҳаллиро бе тағйир такрор кунед.',
            'Repeat the same local build.',
          ),
          text(
            'Сразу перенести эту версию в Production.',
            'Дарҳол ҳамин версияро ба Production диҳед.',
            'Promote this build straight to Production.',
          ),
          text(
            'Открыть логи Preview и проверить его конфигурацию.',
            'Log ва конфиги худи Preview-ро санҷед.',
            'Inspect Preview logs and its configuration.',
          ),
        ],
        text(
          'Сбой наблюдается в конкретной среде.',
          'Хато дар як environment-и муайян дида шуд.',
          'The failure occurred in a particular environment.',
        ),
      ),
    ],
  },
  10: {
    sections: [
      {
        title: text(
          'Одна запись от формы до таблицы',
          'Як сабт аз форма то ҷадвал',
          'Trace one record from the form to the table',
        ),
        body: text(
          'В мастерской клиент называет работу, сотрудник проверяет заявку, а журнал хранит принятый заказ. В приложении форма собирает name: "  Tea  ". JSON — текст, которым клиент передаёт это значение в POST. Route Handler читает JSON и убирает пробелы. База сохраняет "Tea" и даёт записи ID. Ответ с 201 и объектом {"id":1,"name":"Tea"} позволяет UI показать строку, которую сервер уже записал.',
          'Дар устохона муштарӣ корашро мегӯяд, корманд заказро месанҷад ва журнал онро нигоҳ медорад. Дар app форма name-и "  Tea  "-ро мегирад. JSON матнест, ки client ҳамин қиматро дар POST мефиристад. Route Handler JSON-ро хонда пробелҳоро тоза мекунад. База "Tea"-ро сабт карда ID медиҳад. Баъд 201 бо {"id":1,"name":"Tea"} меояд ва UI сатри сабтшударо нишон медиҳад.',
          'In a workshop, the customer names the job, a worker checks the request, and the ledger holds the accepted order. In the app, the form collects name: "  Tea  ". JSON is the text sent with the POST. The Route Handler reads it and trims the spaces. The database stores "Tea" and assigns an ID. A 201 response with {"id":1,"name":"Tea"} lets the UI display the stored row.',
        ),
      },
      {
        title: text(
          'Три проверки одного сохранения',
          'Се санҷиш барои як сабт',
          'Three checks for one save',
        ),
        body: text(
          'Проверьте три случая. Обычное имя создаёт строку, и GET возвращает её с тем же ID после перезапуска. Строка из пробелов даёт 400 и не добавляет запись. Если запись не удалась, форма сохраняет введённый текст и показывает ошибку. Строка, добавленная в локальный state, сама по себе проверяет только экран. Источник для повторного чтения должен быть хранилищем.',
          'Се ҳолатро санҷед. Номи одӣ сатр месозад ва GET баъди restart онро бо ҳамон ID меёбад. Матни фақат пробел 400 медиҳад ва сабт намесозад. Агар сабт нашуд, форма матнро нигоҳ дошта хаторо нишон медиҳад. Сатре, ки ба state илова шуд, фақат экрани ҷориро нишон медиҳад. Барои хониши дубора ба storage муроҷиат кунед.',
          'Check three cases. A valid name creates a row, and GET returns the same ID after a restart. A name made of spaces receives 400 and creates no row. If a write fails, the form keeps the input and shows an error. Appending a row to local state tells you what the screen displays. Read from storage to verify persistence.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 3,
      hint: text(
        'Проверьте запись при новом чтении, когда состояние вкладки больше не помогает.',
        'Сабтро бо хониши нав санҷед, ки state-и вкладка таъсир накунад.',
        'Check the record with a fresh read independent of the current tab state.',
      ),
    },
    questions: [
      check(
        10,
        'saved-record',
        2,
        1,
        text(
          'Что должен получить интерфейс после успешной вставки?',
          'Баъди insert-и дуруст UI чӣ бояд гирад?',
          'What should the interface receive after a successful insert?',
        ),
        [
          text(
            'Исходный текст формы без ID.',
            'Матни аввалини форма бе ID.',
            'The original form string without an ID.',
          ),
          text(
            'Сохранённую строку с присвоенным ID.',
            'Сатри сабтшуда бо ID-и гирифтааш.',
            'The stored row with its assigned ID.',
          ),
          text(
            'Новый ID, выбранный самой формой.',
            'ID-и наве, ки форма худаш интихоб мекунад.',
            'A new ID selected by the form.',
          ),
        ],
        text(
          'Различите отправленные поля и результат записи.',
          'Field-ҳои фиристода ва натиҷаи сабтро ҷудо кунед.',
          'Distinguish the submitted fields from the result of the write.',
        ),
      ),
      check(
        10,
        'invalid-no-write',
        3,
        2,
        text(
          'Сервер ответил 400 для пробелов. Как проверить, что всё обработано правильно?',
          'Барои пробел сервер 400 дод. Аз куҷо фаҳмем, ки дуруст кор кард?',
          'The server returns 400 for spaces. How do you confirm correct handling?',
        ),
        [
          text(
            'Форма очищена и список показывает новую строку.',
            'Форма тоза шуд ва рӯйхат сатри нав дорад.',
            'The form clears and the list gains a row.',
          ),
          text(
            'В браузере перерисовалась кнопка.',
            'Тугма дар браузер аз нав render шуд.',
            'The browser rendered the button again.',
          ),
          text(
            'Форма показывает ошибку, новый GET не находит новой строки.',
            'Форма хато нишон медиҳад, GET-и нав сатри нав намеёбад.',
            'The form shows an error and a fresh GET finds no new row.',
          ),
        ],
        text(
          'Проверьте одновременно видимый результат и данные.',
          'Ҳам экран ва ҳам додаро санҷед.',
          'Check both the visible result and the stored data.',
        ),
      ),
    ],
  },
  11: {
    sections: [
      {
        title: text(
          'Одна работа, которую можно показать',
          'Як коре, ки нишон додан мумкин',
          'One project you can demonstrate',
        ),
        body: text(
          'В портфолио мастера полезно увидеть, что он починил и как проверил результат. В карточке приложения сделайте так же. Например, «покупатель вводит Tea и видит два товара. Я сделал поиск по названию. Проверил запрос Tea и пустой результат для незнакомого слова». Эта история позволяет читателю повторить проверку, даже если он не знает весь ваш стек.',
          'Дар портфолиои усто дидан хуб аст, ки чиро таъмир кард ва чӣ хел санҷид. Дар карточкаи app ҳам ҳамин тавр нависед. Масалан, «харидор Tea менависад ва ду мол мебинад. Ман ҷустуҷӯ аз рӯйи ном сохтам. Tea ва натиҷаи холӣ барои калимаи дигарро санҷидам». Хонанда ҳатто бе донистани тамоми stack санҷишро такрор карда метавонад.',
          'A repair portfolio shows what the mechanic fixed and how it was checked. An app card can do the same. For example, “A shopper types Tea and sees two products. I built the name search. I tried Tea and checked the empty state for an unknown term.” A reader can repeat that check without knowing your entire stack.',
        ),
      },
      {
        title: text(
          'Проверьте то, что откроет читатель',
          'Ҳамон чизро санҷед, ки хонанда мекушояд',
          'Check what the reader can open',
        ),
        body: text(
          'Откройте ссылку в новой вкладке и проверьте, что она ведёт к нужному проекту. Если проект запускается только локально, перечислите команды из его README и покажите реальный скриншот. В командном проекте опишите свой вклад: «реализовал фильтр» точнее, чем «сделал весь магазин». Стек объясняйте через роли: например, Next.js обслуживает маршруты, а SQLite хранит записи.',
          'Линкро дар вкладкаи нав кушоед ва бинед, ки ба проекти дуруст меравад. Агар проект фақат маҳаллӣ кор кунад, командаҳои README ва скрини воқеиро диҳед. Дар проекти гурӯҳӣ саҳми худро гӯед. «Ман filter сохтам» аз «тамоми мағозаро сохтам» дақиқтар аст. Stack-ро бо вазифа фаҳмонед: Next.js route медиҳад, SQLite сабтҳоро нигоҳ медорад.',
          'Open the link in a new tab to check that it leads to the intended project. For a local project, list the README commands and show an actual screenshot. For team work, name your contribution. “Built the filter” is more precise than “built the entire shop.” Explain each tool by its job, such as Next.js routes and SQLite storage.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 0,
      hint: text(
        'Читателю нужно понять, что можно увидеть и что вы сделали.',
        'Хонанда бояд фаҳмад, чиро мебинад ва шумо чӣ кардед.',
        'The reader needs to see an action and understand what you built.',
      ),
    },
    questions: [
      check(
        11,
        'repeatable-demo',
        2,
        1,
        text(
          'Какая формулировка показывает проверяемый результат поиска?',
          'Кадом ҷумла натиҷаи санҷидашавандаи ҷустуҷӯро нишон медиҳад?',
          'Which description gives a search result someone can verify?',
        ),
        [
          text(
            'Я подключил современную библиотеку.',
            'Ман library-и замонавӣ васл кардам.',
            'I added a modern library.',
          ),
          text(
            'Введите Tea: список покажет два товара.',
            'Tea нависед: рӯйхат ду мол нишон медиҳад.',
            'Type Tea: the list shows two products.',
          ),
          text(
            'Проект поддерживает удобный поиск.',
            'Проект ҷустуҷӯи қулай дорад.',
            'The project has a convenient search.',
          ),
        ],
        text(
          'Найдите конкретное действие и видимый результат.',
          'Амали муайян ва натиҷаи намоёнро ёбед.',
          'Look for a specific action and an observable result.',
        ),
      ),
      check(
        11,
        'local-demo',
        3,
        2,
        text(
          'Проект проверен только локально. Что приложить к карточке?',
          'Проект фақат дар локал санҷида шуд. Ба карточка чӣ зам кунем?',
          'A project was checked locally only. What belongs on the card?',
        ),
        [
          text(
            'Ссылку на localhost без инструкций.',
            'Линки localhost бе роҳнамо.',
            'A localhost URL with no instructions.',
          ),
          text(
            'Список библиотек и обещание готового демо.',
            'Рӯйхати library ва ваъдаи demo-и тайёр.',
            'A list of libraries and a promised demo.',
          ),
          text(
            'Инструкцию локального запуска и реальный скриншот.',
            'Қадамҳои запуск дар локал ва скрини воқеӣ.',
            'Local run instructions and a real screenshot.',
          ),
        ],
        text(
          'Другому человеку нужен способ повторить ваш запуск.',
          'Ба каси дигар роҳи такрор кардани запуск даркор аст.',
          'Another person needs a way to repeat your run.',
        ),
      ),
    ],
  },
  12: {
    sections: [
      {
        title: text(
          'Фраза из резюме и её проверка',
          'Ҷумлаи резюме ва санҷишаш',
          'Verify a résumé statement',
        ),
        body: text(
          'В мастерской «тормоза проверены» должно означать конкретную проверку. Для фразы «заметки сохраняются через API» заранее укажите результат: создать одну заметку, обновить страницу и получить ту же запись с сервера. Если запись пропала, запишите сбой и уточните описание. Если после F5 запись появляется, укажите среду, где вы это проверили.',
          'Дар устохона «тормоз санҷида шуд» бояд санҷиши муайян дошта бошад. Барои ҷумлаи «ёддоштҳо бо API сабт мешаванд» пешакӣ натиҷаро муайян кунед. Як ёддошт созед, reload кунед ва ҳамон сабтро аз сервер гиред. Агар гум шуд, хаторо сабт карда тавсифро дақиқ кунед. Агар баъди F5 барояд, нависед дар кадом environment санҷидед.',
          'A workshop claim that brakes were tested should point to a specific check. For “notes are saved through the API,” decide what you expect: create one note, refresh and read the same record from the server. If it disappears, record the failure and revise the statement. If it appears after refresh, record the environment used for the check.',
        ),
      },
      {
        title: text(
          'Новый запуск без ваших настроек',
          'Запуск аз нав бе танзимоти шахсӣ',
          'A fresh run without your personal setup',
        ),
        body: text(
          'Чистая вкладка помогает проверить прямую ссылку и первые действия без прежнего состояния браузера. Для проверки инструкции запуска полезна отдельная копия проекта. Проверьте версию Node.js, команды установки и запуска, имена переменных и один сценарий с ошибкой. Для README достаточно показать публичные или пустые значения в .env.example. Секреты для реальной среды получайте через её настройки.',
          'Вкладкаи тоза ба санҷиши линки рост ва амали аввал бе state-и пешина ёрӣ медиҳад. Барои санҷиши README нусхаи алоҳидаи проектро истифода баред. Версияи Node.js, командаҳои install ва запуск, номи variable ва як ҳолати хаторо тафтиш кунед. Дар .env.example қиматҳои public ё холӣ монанд. Secret-и воқеӣ аз танзимоти environment гирифта мешавад.',
          'A fresh tab helps check a direct link and the first actions without prior browser state. A separate project copy helps verify the run instructions. Check the Node.js version, installation and startup commands, variable names, and one failure case. Use public or blank example values in .env.example. Get live secrets from the environment settings.',
        ),
      },
    ],
    firstQuestion: {
      relatedSection: 0,
      hint: text(
        'Свяжите утверждение с действием, которое можно повторить.',
        'Ҷумларо бо амале пайваст кунед, ки такрор карданаш мумкин аст.',
        'Connect the statement to an action another person can repeat.',
      ),
    },
    questions: [
      check(
        12,
        'verify-persistence',
        2,
        1,
        text(
          'В резюме сказано «заметки сохраняются». Как подтвердить это?',
          'Дар резюме «ёддоштҳо сабт мешаванд» гуфта шудааст. Чӣ хел тасдиқ кунем?',
          'Your résumé says notes are saved. How do you verify the claim?',
        ),
        [
          text(
            'Кликнуть Save и проверить цвет кнопки.',
            'Save-ро пахш карда ранги тугмаро бинед.',
            'Click Save and check the button colour.',
          ),
          text(
            'Создать заметку и после F5 прочитать её с сервера.',
            'Ёддошт созед ва баъди F5 аз сервер хонед.',
            'Create a note and read it from the server after refresh.',
          ),
          text(
            'Показать в репозитории файл формы.',
            'Файли формаро дар repository нишон диҳед.',
            'Show the form file in the repository.',
          ),
        ],
        text(
          'Утверждение говорит о сохранении данных.',
          'Ҷумла дар бораи сабти дода аст.',
          'The claim refers to stored data.',
        ),
      ),
      check(
        12,
        'reproducible-setup',
        3,
        2,
        text(
          'Как описать настройку базы в публичном README?',
          'Танзими базаро дар README-и public чӣ хел нависем?',
          'How should a public README describe the database setup?',
        ),
        [
          text(
            'Скопировать рабочие значения из .env.local.',
            'Қиматҳои кориро аз .env.local копия кунед.',
            'Copy live values from .env.local.',
          ),
          text(
            'Пропустить настройку и оставить только ссылку.',
            'Танзимро гузаред ва фақат link монед.',
            'Omit the setup and include a link only.',
          ),
          text(
            'Указать имена переменных и где взять свои значения.',
            'Номи variable ва ҷойи гирифтани қиматҳои худро нависед.',
            'List the variable names and where to get personal values.',
          ),
        ],
        text(
          'Инструкция должна помочь новому разработчику настроить свою среду.',
          'Роҳнамо бояд ба developer барои танзими environment-и худаш ёрӣ диҳад.',
          'The instructions should let another developer configure their own environment.',
        ),
      ),
    ],
  },
};
