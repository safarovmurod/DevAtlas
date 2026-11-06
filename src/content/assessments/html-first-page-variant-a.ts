// Authored assessment keys are loaded by the server registry only, never by UI components.
import type { AssessmentQuestion } from '@/lib/practice/assessment';
import { info, option, t } from './html-first-page-helpers';

/** First form of the HTML day 1 assessment. */
export const a: AssessmentQuestion[] = [
  {
    ...info(
      'heading',
      1,
      true,
      t(
        'Где находится главный видимый заголовок страницы?',
        'Сарлавҳаи асосии намоёни саҳифа дар куҷост?',
        'Where does the main visible page heading belong?',
      ),
      t(
        'Сравните настройки вкладки в head и видимое содержимое body.',
        'Танзимоти варақа дар head ва мазмуни намоёни body-ро муқоиса кунед.',
        'Compare tab settings in head with visible content in body.',
      ),
      t(
        'h1 задаёт главный заголовок видимого содержимого; title задаёт имя вкладки.',
        'h1 сарлавҳаи асосии мазмуни намоён ва title номи варақаро муайян мекунад.',
        'h1 is the main content heading; title names the browser tab.',
      ),
    ),
    kind: 'single-choice',
    options: [
      option('tab', 'В title внутри head', 'Дар title-и head', 'In title inside head'),
      option('body', 'В h1 внутри body', 'Дар h1-и body', 'In h1 inside body'),
      option('css', 'В CSS-правиле color', 'Дар қоидаи color-и CSS', 'In a CSS color rule'),
    ],
    correctOptionId: 'body',
  },
  {
    ...info(
      'settings',
      2,
      true,
      t(
        'Какие три элемента относятся к настройкам head?',
        'Кадом се унсур ба танзимоти head тааллуқ доранд?',
        'Which three elements belong to the head settings?',
      ),
      t(
        'Отделите кодировку, ширину viewport и имя вкладки от видимого абзаца.',
        'Рамзгузорӣ, паҳнои viewport ва номи варақаро аз абзаци намоён ҷудо кунед.',
        'Separate encoding, viewport and tab metadata from visible paragraphs.',
      ),
      t(
        'charset, viewport и title задают настройки документа; p содержит видимый абзац.',
        'charset, viewport ва title танзимоти ҳуҷҷатанд; p абзаци намоён аст.',
        'charset, viewport and title configure the document; p is visible paragraph content.',
      ),
    ),
    kind: 'multiple-choice',
    options: [
      option('encoding', 'meta charset', 'meta charset', 'meta charset'),
      option('viewport', 'meta viewport', 'meta viewport', 'meta viewport'),
      option('title', 'title', 'title', 'title'),
      option('paragraph', 'p', 'p', 'p'),
    ],
    correctOptionIds: ['encoding', 'viewport', 'title'],
  },
  {
    ...info(
      'output',
      1,
      false,
      t(
        'Без CSS: что покажет <h1>A</h1><p>B</p>?',
        'Бе CSS: <h1>A</h1><p>B</p> чӣ нишон медиҳад?',
        'Without CSS, what does <h1>A</h1><p>B</p> display?',
      ),
      t(
        'Теги описывают смысл; браузер отображает их содержимое, а не угловые скобки.',
        'Тегҳо маъноро медиҳанд; браузер мазмуни онҳоро нишон медиҳад, на қавсҳоро.',
        'Tags describe meaning; the browser displays their contents, not the angle brackets.',
      ),
      t(
        'A отображается как заголовок, B как отдельный абзац при обычных стилях браузера.',
        'A ҳамчун сарлавҳа ва B ҳамчун абзаци алоҳида бо сабкҳои одии браузер намоён мешаванд.',
        'With default browser styles, A is a heading and B is a separate paragraph.',
      ),
    ),
    kind: 'code-output',
    options: [
      option('literal', 'Текст тегов целиком', 'Матни пурраи тегҳо', 'The literal tag text'),
      option(
        'heading',
        'Заголовок A и абзац B',
        'Сарлавҳаи A ва абзаци B',
        'Heading A and paragraph B',
      ),
      option('error', 'Ошибка компиляции', 'Хатои компилятсия', 'A compilation error'),
    ],
    correctOptionId: 'heading',
  },
  {
    ...info(
      'bug',
      2,
      false,
      t(
        'h1 ошибочно записан внутри head. Как правильно исправить структуру?',
        'h1 иштибоҳан дар head навишта шуд. Сохторро чӣ тавр дуруст ислоҳ мекунед?',
        'An h1 was incorrectly placed inside head. How should the structure be corrected?',
      ),
      t(
        'Разделите метаданные документа и его видимую основную часть.',
        'Маълумоти танзимотӣ ва қисми асосии намоёнро ҷудо кунед.',
        'Separate document metadata from its visible main content.',
      ),
      t(
        'Перенесите h1 в body/main. Браузер может исправлять некорректную разметку, но полагаться на это не следует.',
        'h1-ро ба body/main гузаронед. Браузер метавонад сохтори нодурустро ислоҳ кунад, вале ба ин такя накунед.',
        'Move h1 into body/main. Browsers may repair invalid markup, but do not rely on that repair.',
      ),
    ),
    kind: 'find-bug',
    options: [
      option(
        'move',
        'Перенести h1 в body/main',
        'h1-ро ба body/main гузарондан',
        'Move h1 into body/main',
      ),
      option('remove', 'Удалить весь body', 'Тамоми body-ро нест кардан', 'Delete body entirely'),
      option('color', 'Изменить цвет h1', 'Ранги h1-ро дигар кардан', 'Change the h1 color'),
    ],
    correctOptionId: 'move',
  },
  {
    ...info(
      'scenario',
      3,
      false,
      t(
        'Вы изменили файл, но браузер показывает старый текст. Что проверить сначала?',
        'Файлро дигар кардед, вале браузер матни кӯҳнаро нишон медиҳад. Аввал чиро месанҷед?',
        'You edited a file but the browser shows old text. What should you check first?',
      ),
      t(
        'Вспомните цепочку: файл в нужной папке → сохранение → обновление вкладки.',
        'Занҷирро ба ёд оред: файли папкаи дуруст → сабт → навсозии варақа.',
        'Recall the sequence: correct file and folder → save → refresh the tab.',
      ),
      t(
        'Сохраните нужный index.html и обновите именно открытую страницу; установка React для этого не нужна.',
        'index.html-и дурустро сабт карда ҳамон саҳифаро нав кунед; насби React лозим нест.',
        'Save the correct index.html and refresh that page; installing React is unnecessary.',
      ),
    ),
    kind: 'scenario',
    options: [
      option('react', 'Установить React', 'React насб кардан', 'Install React'),
      option(
        'save',
        'Папку, имя файла, сохранение и refresh',
        'Папка, номи файл, сабт ва refresh',
        'Folder, filename, save and refresh',
      ),
      option(
        'rename',
        'Переименовать файл в .jpg',
        'Пасвандро .jpg кардан',
        'Rename the file to .jpg',
      ),
    ],
    correctOptionId: 'save',
  },
  {
    ...info(
      'blank',
      1,
      false,
      t(
        'Заполните имя атрибута: <a ___="https://developer.mozilla.org/">Документация</a>.',
        'Номи атрибутро пур кунед: <a ___="https://developer.mozilla.org/">Ҳуҷҷатҳо</a>.',
        'Fill the attribute name: <a ___="https://developer.mozilla.org/">Docs</a>.',
      ),
      t(
        'Нужен атрибут адреса назначения ссылки, не оформление текста.',
        'Атрибути суроғаи пайванд лозим аст, на ороиши матн.',
        'You need the link destination attribute, not a text style.',
      ),
      t(
        'href задаёт адрес перехода ссылки a.',
        'href суроғаи гузариши пайванди a-ро муайян мекунад.',
        'href supplies the destination of an a link.',
      ),
    ),
    kind: 'fill-blank',
    acceptedAnswers: ['href'],
  },
  {
    ...info(
      'matching',
      2,
      false,
      t(
        'Сопоставьте элемент с его назначением.',
        'Унсурро бо вазифааш мувофиқ кунед.',
        'Match each element to its purpose.',
      ),
      t(
        'Имя вкладки, видимый заголовок и абзац — разные роли.',
        'Номи варақа, сарлавҳаи намоён ва абзац вазифаҳои гуногунанд.',
        'Tab title, visible heading and paragraph are different roles.',
      ),
      t(
        'title — вкладка, h1 — главный заголовок, p — абзац.',
        'title — варақа, h1 — сарлавҳаи асосӣ, p — абзац.',
        'title names the tab, h1 is the main heading, and p is a paragraph.',
      ),
    ),
    kind: 'matching',
    left: [
      option('title', 'title', 'title', 'title'),
      option('h1', 'h1', 'h1', 'h1'),
      option('p', 'p', 'p', 'p'),
    ],
    right: [
      option('paragraph', 'Абзац', 'Абзац', 'Paragraph'),
      option('tab', 'Имя вкладки', 'Номи варақа', 'Tab title'),
      option('heading', 'Главный заголовок', 'Сарлавҳаи асосӣ', 'Main heading'),
    ],
    correctPairs: { title: 'tab', h1: 'heading', p: 'paragraph' },
  },
  {
    ...info(
      'short',
      1,
      false,
      t(
        'Назовите HTML-тег обычного абзаца (можно без скобок).',
        'Теги HTML-и абзаци одиро ном баред (бе қавс ҳам мумкин).',
        'Name the HTML paragraph tag (angle brackets are optional).',
      ),
      t(
        'Вернитесь к примеру с отдельным текстовым абзацем под h1.',
        'Ба мисоли абзаци матнӣ дар зери h1 баргардед.',
        'Revisit the example containing a paragraph below h1.',
      ),
      t(
        'Для абзаца используется p. Регистр HTML-тегов не меняет их смысл.',
        'Барои абзац p истифода мешавад. Ҳарфи калон ё хурд маънои тегро дигар намекунад.',
        'A paragraph uses p. HTML tag case does not change its meaning.',
      ),
    ),
    kind: 'short-answer',
    acceptedAnswers: ['p', '<p>'],
  },
];
