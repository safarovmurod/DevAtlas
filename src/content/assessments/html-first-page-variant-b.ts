// Authored assessment keys are loaded by the server registry only, never by UI components.
import type { AssessmentQuestion } from '@/lib/practice/assessment';
import { option, t } from './html-first-page-helpers';
import { a } from './html-first-page-variant-a';

// A genuinely different retry form, covering the same first-day learning goals.
export const b: AssessmentQuestion[] = [
  {
    ...a[0],
    relatedSection: 2,
    prompt: t(
      'Что меняет текст на вкладке, а не заголовок внутри страницы?',
      'Матни варақаро чӣ дигар мекунад, на сарлавҳаи дохили саҳифаро?',
      'What changes the browser tab text rather than the heading inside the page?',
    ),
    kind: 'single-choice',
    options: [
      option('body', 'h1 внутри body', 'h1 дар body', 'h1 inside body'),
      option('title', 'title внутри head', 'title дар head', 'title inside head'),
      option('css', 'CSS padding', 'CSS padding', 'CSS padding'),
    ],
    correctOptionId: 'title',
    explanation: t(
      'title в head задаёт название вкладки; h1 отвечает за видимый заголовок.',
      'title дар head номи варақа ва h1 сарлавҳаи намоёнро муайян мекунад.',
      'title inside head names the tab; h1 controls the visible heading.',
    ),
  },
  {
    ...a[1],
    hints: [
      t(
        'Разделите язык документа, адрес ссылки, кодировку и оформление.',
        'Забони ҳуҷҷат, суроғаи пайванд, рамзгузорӣ ва ороишро ҷудо кунед.',
        'Separate document language, link destination, encoding and styling.',
      ),
    ],
    kind: 'multiple-choice',
    prompt: t(
      'Выберите две верные роли атрибутов.',
      'Ду вазифаи дурусти атрибутҳоро интихоб кунед.',
      'Select the two correct attribute roles.',
    ),
    options: [
      option(
        'language',
        'lang задаёт язык документа',
        'lang забони ҳуҷҷатро медиҳад',
        'lang declares document language',
      ),
      option(
        'destination',
        'href задаёт адрес ссылки',
        'href суроғаи пайвандро медиҳад',
        'href declares a link destination',
      ),
      option(
        'color',
        'charset задаёт цвет текста',
        'charset ранги матнро медиҳад',
        'charset sets text color',
      ),
      option(
        'viewport',
        'viewport задаёт пароль',
        'viewport рамзро медиҳад',
        'viewport sets a password',
      ),
    ],
    correctOptionIds: ['language', 'destination'],
    explanation: t(
      'lang описывает язык, href — адрес; charset относится к кодировке, viewport — к отображению на экране.',
      'lang забон ва href суроғаро медиҳад; charset рамзгузорӣ ва viewport намоишро танзим мекунад.',
      'lang describes language and href a destination; charset configures encoding and viewport controls display sizing.',
    ),
  },
  {
    ...a[2],
    kind: 'code-output',
    prompt: t(
      'В документе <title>Tab</title> и <h1>Page</h1>. Где появятся эти тексты?',
      'Дар ҳуҷҷат <title>Tab</title> ва <h1>Page</h1> ҳастанд. Матнҳо дар куҷо пайдо мешаванд?',
      'A document has <title>Tab</title> and <h1>Page</h1>. Where do these texts appear?',
    ),
    options: [
      option('same', 'Оба только во вкладке', 'Ҳар ду танҳо дар варақа', 'Both only in the tab'),
      option(
        'split',
        'Tab во вкладке, Page на странице',
        'Tab дар номи варақа, Page дар саҳифа',
        'Tab in the tab, Page on the page',
      ),
      option('hidden', 'Оба скрыты', 'Ҳар ду пинҳонанд', 'Both are hidden'),
    ],
    correctOptionId: 'split',
    explanation: t(
      'title относится к метаданным вкладки, h1 — к видимому содержимому body.',
      'title ба номи варақа ва h1 ба мазмуни намоёни body тааллуқ доранд.',
      'title is tab metadata; h1 is visible body content.',
    ),
  },
  {
    ...a[3],
    relatedSection: 1,
    hints: [
      t(
        'У ссылки и изображения разные атрибуты адреса; найдите пример ссылки в уроке.',
        'Атрибутҳои суроғаи пайванд ва тасвир гуногунанд; мисоли пайванди дарсро ёбед.',
        'Links and images use different address attributes; find the lesson’s link example.',
      ),
    ],
    kind: 'find-bug',
    prompt: t(
      'У ссылки написано <a src="https://example.com">Сайт</a>. Как исправить адрес перехода?',
      'Дар пайванд <a src="https://example.com">Сайт</a> навишта шудааст. Суроғаи гузаришро чӣ тавр ислоҳ мекунед?',
      'A link uses <a src="https://example.com">Site</a>. How should its destination be fixed?',
    ),
    options: [
      option('href', 'Заменить src на href', 'src-ро ба href иваз кардан', 'Replace src with href'),
      option('style', 'Добавить красный цвет', 'Ранги сурх илова кардан', 'Add red styling'),
      option('p', 'Заменить a на p', 'a-ро ба p иваз кардан', 'Replace a with p'),
    ],
    correctOptionId: 'href',
    explanation: t(
      'У a адрес назначения задаёт href. Цвет текста не исправляет неверный атрибут.',
      'Дар a суроға бо href дода мешавад. Ранг атрибути нодурустро ислоҳ намекунад.',
      'An a link uses href for its destination. Color cannot fix an incorrect attribute.',
    ),
  },
  {
    ...a[4],
    relatedSection: 2,
    hints: [
      t(
        'Ищите настройку ширины устройства, а не название вкладки.',
        'Танзимоти паҳнои дастгоҳро ёбед, на номи варақаро.',
        'Look for device-width settings rather than the tab title.',
      ),
    ],
    kind: 'scenario',
    prompt: t(
      'На телефоне страница уменьшена как большой desktop-макет. Какую настройку из урока проверить?',
      'Дар телефон саҳифа мисли макети калони desktop хурд шудааст. Кадом танзимоти дарсро месанҷед?',
      'On a phone the page is shrunk like a desktop layout. Which lesson setting should you check?',
    ),
    options: [
      option(
        'viewport',
        'meta viewport с width=device-width',
        'meta viewport бо width=device-width',
        'meta viewport with width=device-width',
      ),
      option('title', 'Длину title', 'Дарозии title', 'The title length'),
      option('folder', 'Название папки', 'Номи папка', 'The folder name'),
    ],
    correctOptionId: 'viewport',
    explanation: t(
      'viewport с width=device-width задаёт ширину layout по устройству; это не заменяет дальнейшую адаптивную вёрстку.',
      'viewport бо width=device-width паҳноро ба дастгоҳ мувофиқ мекунад; он тарҳи мутобиқшавандаро пурра иваз намекунад.',
      'viewport with width=device-width aligns layout width with the device; it does not replace responsive CSS.',
    ),
  },
  {
    ...a[5],
    relatedSection: 2,
    hints: [
      t(
        'Найдите в полном документе строку с UTF-8.',
        'Дар ҳуҷҷати пурра сатри UTF-8-ро ёбед.',
        'Find the UTF-8 line in the complete document.',
      ),
    ],
    kind: 'fill-blank',
    prompt: t(
      'Заполните атрибут кодировки: <meta ___="utf-8">.',
      'Атрибути рамзгузориро пур кунед: <meta ___="utf-8">.',
      'Fill the encoding attribute: <meta ___="utf-8">.',
    ),
    acceptedAnswers: ['charset'],
    explanation: t(
      'charset объявляет кодировку текста, например UTF-8 для кириллицы.',
      'charset рамзгузории матнро, масалан UTF-8 барои кириллицаро, эълон мекунад.',
      'charset declares text encoding, such as UTF-8 for Cyrillic.',
    ),
  },
  {
    ...a[6],
    hints: [
      t(
        'Разделите настройки, видимую страницу и элемент перехода по адресу.',
        'Танзимот, саҳифаи намоён ва унсури гузаришро ҷудо кунед.',
        'Separate settings, visible content and the element used for navigation.',
      ),
    ],
    kind: 'matching',
    prompt: t(
      'Сопоставьте другие элементы с ролью.',
      'Унсурҳои дигарро бо вазифаашон мувофиқ кунед.',
      'Match these other elements to their roles.',
    ),
    left: [
      option('head', 'head', 'head', 'head'),
      option('body', 'body', 'body', 'body'),
      option('a', 'a', 'a', 'a'),
    ],
    right: [
      option('visible', 'Видимое содержимое', 'Мазмуни намоён', 'Visible content'),
      option('link', 'Ссылка', 'Пайванд', 'Link'),
      option('metadata', 'Настройки документа', 'Танзимоти ҳуҷҷат', 'Document settings'),
    ],
    correctPairs: { head: 'metadata', body: 'visible', a: 'link' },
    explanation: t(
      'head хранит настройки, body — видимое содержимое, a задаёт ссылку.',
      'head танзимот, body мазмуни намоён ва a пайвандро медиҳад.',
      'head holds settings, body visible content, and a defines a link.',
    ),
  },
  {
    ...a[7],
    relatedSection: 0,
    hints: [
      t(
        'Посмотрите на окончание имени index.html.',
        'Ба охири номи index.html нигоҳ кунед.',
        'Look at the ending of index.html.',
      ),
    ],
    kind: 'short-answer',
    prompt: t(
      'Какое расширение имеет файл разметки HTML? Можно указать с точкой или без неё.',
      'Файли HTML кадом пасвандро дорад? Бо нуқта ё бе он навиштан мумкин.',
      'What extension identifies an HTML markup file? A leading dot is optional.',
    ),
    acceptedAnswers: ['html', '.html', 'htm', '.htm'],
    explanation: t(
      'Обычно используется .html; .htm также является расширением HTML-файла.',
      'Одатан .html истифода мешавад; .htm низ пасванди файли HTML аст.',
      'The usual extension is .html; .htm also identifies an HTML file.',
    ),
  },
];
