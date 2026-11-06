import type { CourseId } from '@/lib/courses/ids';
import type { OnboardingLocale } from '@/lib/onboarding';

type Text = Record<OnboardingLocale, string>;
const t = (tg: string, ru: string, en: string): Text => ({ tg, ru, en });

export type PlacementDirection = 'frontend' | 'backend' | 'mobile' | 'data' | 'design' | 'business';
export type PlacementLevel = 'beginner' | 'middle' | 'advanced';
/** 1 = basics, 2 = working knowledge, 3 = confident practitioner. */
export type PlacementTier = 1 | 2 | 3;

export interface PlacementQuestion {
  id: string;
  tier: PlacementTier;
  question: Text;
  code?: string;
  /** Three answers; the fourth choice «I don't know» is added by the UI and is never correct. */
  options: [Text, Text, Text];
  correctIndex: 0 | 1 | 2;
}

export const DONT_KNOW = t('Намедонам', 'Не знаю', "I don't know");

/** Six questions per direction: two per tier. Answers are spread across positions on purpose. */
export const PLACEMENT_BANK: Record<PlacementDirection, PlacementQuestion[]> = {
  frontend: [
    {
      id: 'fe-1a',
      tier: 1,
      question: t(
        'Кадом тег ба саҳифаи дигар пайванд месозад?',
        'Какой тег создаёт ссылку на другую страницу?',
        'Which tag links to another page?',
      ),
      options: [
        t('<link>', '<link>', '<link>'),
        t('<a>', '<a>', '<a>'),
        t('<href>', '<href>', '<href>'),
      ],
      correctIndex: 1,
    },
    {
      id: 'fe-1b',
      tier: 1,
      question: t(
        '.card { display: flex; } бо унсурҳои дохили .card чӣ мекунад?',
        'Что .card { display: flex; } сделает с элементами внутри .card?',
        'What does .card { display: flex; } do to the items inside .card?',
      ),
      options: [
        t('Онҳоро дар як қатор ҷойгир мекунад', 'Выстроит их в один ряд', 'Lines them up in a row'),
        t('Онҳоро пинҳон мекунад', 'Спрячет их со страницы', 'Hides them from the page'),
        t('Матни онҳоро ғафс мекунад', 'Сделает их текст жирным', 'Makes their text bold'),
      ],
      correctIndex: 0,
    },
    {
      id: 'fe-2a',
      tier: 2,
      question: t('Ин код чӣ мебарорад?', 'Что выведет этот код?', 'What does this code print?'),
      code: 'const nums = [1, 2, 3];\nconsole.log(nums.map(n => n * 2));',
      options: [
        t('[1, 2, 3, 2, 4, 6]', '[1, 2, 3, 2, 4, 6]', '[1, 2, 3, 2, 4, 6]'),
        t('12', '12', '12'),
        t('[2, 4, 6]', '[2, 4, 6]', '[2, 4, 6]'),
      ],
      correctIndex: 2,
    },
    {
      id: 'fe-2b',
      tier: 2,
      question: t('Ин код чӣ мебарорад?', 'Что выведет этот код?', 'What does this code print?'),
      code: 'let total = 0;\nfor (let i = 1; i <= 3; i++) total += i;\nconsole.log(total);',
      options: [t('3', '3', '3'), t('6', '6', '6'), t('123', '123', '123')],
      correctIndex: 1,
    },
    {
      id: 'fe-3a',
      tier: 3,
      question: t(
        'Чаро console.log(count) баъди setCount(count + 1) дар ҳамон функсия қимати кӯҳнаро нишон медиҳад?',
        'Почему console.log(count) сразу после setCount(count + 1) в том же обработчике показывает старое значение?',
        'Why does console.log(count) right after setCount(count + 1) in the same handler show the old value?',
      ),
      options: [
        t(
          'Қимати нав танҳо дар render-и навбатӣ меояд',
          'Новое значение придёт только в следующем рендере',
          'The new value arrives only on the next render',
        ),
        t(
          'setCount бояд бо await навишта шавад',
          'setCount нужно вызывать через await',
          'setCount must be awaited',
        ),
        t(
          'Дар React хато ҳаст, ки ислоҳ нашудааст',
          'Это известная ошибка React, её не исправили',
          'It is an unfixed React bug',
        ),
      ],
      correctIndex: 0,
    },
    {
      id: 'fe-3b',
      tier: 3,
      question: t(
        'Барои чӣ дар рӯйхат key={item.id} менависанд?',
        'Зачем в списке пишут key={item.id}?',
        'Why do lists use key={item.id}?',
      ),
      options: [
        t(
          'Бе он onClick кор намекунад',
          'Без него не будет работать onClick',
          'onClick will not work without it',
        ),
        t(
          'Барои услубҳои CSS-и ҳар унсур',
          'Чтобы задать CSS-стили каждому элементу',
          'To give each item its own CSS styles',
        ),
        t(
          'React мефаҳмад, ки кадом унсур иваз шуд',
          'React понимает, какой элемент изменился',
          'React can tell which item changed',
        ),
      ],
      correctIndex: 2,
    },
  ],
  backend: [
    {
      id: 'be-1a',
      tier: 1,
      question: t(
        'Барои сохтани сабти нав одатан кадом методи HTTP-ро истифода мебаранд?',
        'Какой HTTP-метод обычно используют, чтобы создать новую запись?',
        'Which HTTP method usually creates a new record?',
      ),
      options: [t('GET', 'GET', 'GET'), t('DELETE', 'DELETE', 'DELETE'), t('POST', 'POST', 'POST')],
      correctIndex: 2,
    },
    {
      id: 'be-1b',
      tier: 1,
      question: t(
        'Статуси 404 чӣ маъно дорад?',
        'Что означает ответ со статусом 404?',
        'What does a 404 response mean?',
      ),
      options: [
        t(
          'Чизи дархостшуда ёфт нашуд',
          'Запрошенное не найдено',
          'The requested thing was not found',
        ),
        t('Сервер пурра вайрон шуд', 'Сервер полностью сломался', 'The server crashed completely'),
        t('Дархост бомуваффақият гузашт', 'Запрос прошёл успешно', 'The request succeeded'),
      ],
      correctIndex: 0,
    },
    {
      id: 'be-2a',
      tier: 2,
      question: t(
        'GET /users/7 чӣ бармегардонад?',
        'Что вернёт запрос GET /users/7?',
        'What does GET /users/7 return?',
      ),
      code: "app.get('/users/:id', (req, res) => {\n  res.json({ id: req.params.id });\n});",
      options: [
        t('{"id": 7}', '{"id": 7}', '{"id": 7}'),
        t('{"id": "7"}', '{"id": "7"}', '{"id": "7"}'),
        t('{"id": ":id"}', '{"id": ":id"}', '{"id": ":id"}'),
      ],
      correctIndex: 1,
    },
    {
      id: 'be-2b',
      tier: 2,
      question: t(
        'Ин дархост чиро ҳисоб мекунад?',
        'Что посчитает этот запрос?',
        'What does this query count?',
      ),
      code: "SELECT COUNT(*) FROM orders\nWHERE status = 'paid';",
      options: [
        t(
          'Маблағи ҳамаи фармоишҳои пардохтшуда',
          'Сумму денег всех оплаченных заказов',
          'The money total of all paid orders',
        ),
        t(
          'Рӯйхати фармоишҳои пардохтнашуда',
          'Список неоплаченных заказов целиком',
          'The full list of unpaid orders',
        ),
        t(
          'Шумораи фармоишҳои пардохтшуда',
          'Количество оплаченных заказов',
          'The number of paid orders',
        ),
      ],
      correctIndex: 2,
    },
    {
      id: 'be-3a',
      tier: 3,
      question: t(
        'Чаро паролро ҳамчун hash (bcrypt) нигоҳ медоранд?',
        'Почему пароль хранят как хеш (bcrypt), а не как текст?',
        'Why are passwords stored as a bcrypt hash instead of text?',
      ),
      options: [
        t(
          'Ҳангоми дуздидани база паролҳоро хондан мумкин нест',
          'При утечке базы пароли нельзя прочитать',
          'A leaked database does not reveal passwords',
        ),
        t(
          'Hash дар база ҷойи камтар мегирад',
          'Хеш занимает в базе меньше места',
          'A hash takes less space in the database',
        ),
        t(
          'Бо hash воридшавӣ тезтар мешавад',
          'С хешем вход в аккаунт работает быстрее',
          'Sign-in becomes faster with a hash',
        ),
      ],
      correctIndex: 0,
    },
    {
      id: 'be-3b',
      tier: 3,
      question: t(
        'Ду дархост якбора охирин молро мехаранд. Чӣ тавр онро ду бор нафурӯшем?',
        'Два запроса одновременно покупают последний товар. Как не продать его дважды?',
        'Two requests buy the last item at once. How do you avoid selling it twice?',
      ),
      options: [
        t(
          'Дар фронтенд тугмаро пинҳон кардан',
          'Спрятать кнопку покупки на фронтенде',
          'Hide the buy button on the frontend',
        ),
        t(
          'Тағйири атомарӣ: UPDATE … WHERE stock > 0',
          'Атомарное изменение: UPDATE … WHERE stock > 0',
          'An atomic change: UPDATE … WHERE stock > 0',
        ),
        t(
          'Пеш аз харид setTimeout илова кардан',
          'Добавить setTimeout перед покупкой',
          'Add a setTimeout before buying',
        ),
      ],
      correctIndex: 1,
    },
  ],
  mobile: [
    {
      id: 'mo-1a',
      tier: 1,
      question: t('Ин код чӣ мебарорад?', 'Что выведет этот код?', 'What does this code print?'),
      code: 'let total = 0;\nfor (let i = 1; i <= 3; i++) total += i;\nconsole.log(total);',
      options: [t('6', '6', '6'), t('123', '123', '123'), t('3', '3', '3')],
      correctIndex: 0,
    },
    {
      id: 'mo-1b',
      tier: 1,
      question: t('Ин код чӣ мебарорад?', 'Что выведет этот код?', 'What does this code print?'),
      code: 'const user = { name: "Сара", age: 20 };\nconsole.log(user.name);',
      options: [
        t('undefined', 'undefined', 'undefined'),
        t('{ name: "Сара" }', '{ name: "Сара" }', '{ name: "Сара" }'),
        t('Сара', 'Сара', 'Sara'),
      ],
      correctIndex: 2,
    },
    {
      id: 'mo-2a',
      tier: 2,
      question: t(
        'Чаро console.log(count) баъди setCount(count + 1) дар ҳамон функсия қимати кӯҳнаро нишон медиҳад?',
        'Почему console.log(count) сразу после setCount(count + 1) в том же обработчике показывает старое значение?',
        'Why does console.log(count) right after setCount(count + 1) in the same handler show the old value?',
      ),
      options: [
        t(
          'setCount бояд бо await навишта шавад',
          'setCount нужно вызывать через await',
          'setCount must be awaited',
        ),
        t(
          'Қимати нав танҳо дар render-и навбатӣ меояд',
          'Новое значение придёт только в следующем рендере',
          'The new value arrives only on the next render',
        ),
        t(
          'Дар React хато ҳаст, ки ислоҳ нашудааст',
          'Это известная ошибка React, её не исправили',
          'It is an unfixed React bug',
        ),
      ],
      correctIndex: 1,
    },
    {
      id: 'mo-2b',
      tier: 2,
      question: t(
        'Барои чӣ дар рӯйхат key={item.id} менависанд?',
        'Зачем в списке пишут key={item.id}?',
        'Why do lists use key={item.id}?',
      ),
      options: [
        t(
          'React мефаҳмад, ки кадом унсур иваз шуд',
          'React понимает, какой элемент изменился',
          'React can tell which item changed',
        ),
        t(
          'Бе он onClick кор намекунад',
          'Без него не будет работать onClick',
          'onClick will not work without it',
        ),
        t(
          'Барои услубҳои CSS-и ҳар унсур',
          'Чтобы задать CSS-стили каждому элементу',
          'To give each item its own CSS styles',
        ),
      ],
      correctIndex: 0,
    },
    {
      id: 'mo-3a',
      tier: 3,
      question: t(
        'Дар React Native ба ҷои <div> чӣ менависанд?',
        'Что в React Native пишут вместо <div>?',
        'What replaces <div> in React Native?',
      ),
      options: [
        t('<Box>', '<Box>', '<Box>'),
        t('<section>', '<section>', '<section>'),
        t('<View>', '<View>', '<View>'),
      ],
      correctIndex: 2,
    },
    {
      id: 'mo-3b',
      tier: 3,
      question: t(
        'Дар React Native матн бевосита дар дохили <View> навишта шуд ва хато баромад. Чаро?',
        'В React Native текст написан прямо внутри <View>, и появилась ошибка. Почему?',
        'In React Native, text written directly inside <View> throws an error. Why?',
      ),
      options: [
        t(
          'Матн бояд дар дохили <Text> бошад',
          'Текст должен быть внутри <Text>',
          'Text must be inside <Text>',
        ),
        t(
          'Дар <View> фақат расм ҷойгир мешавад',
          'В <View> можно класть только картинки',
          '<View> may only contain images',
        ),
        t(
          'Матн бояд бо ҳарфи калон сар шавад',
          'Текст должен начинаться с заглавной буквы',
          'Text must start with a capital letter',
        ),
      ],
      correctIndex: 0,
    },
  ],
  data: [
    {
      id: 'da-1a',
      tier: 1,
      question: t(
        'Қиматҳо: 2, 4, 6, 8. Миёнаи онҳо чанд аст?',
        'Значения: 2, 4, 6, 8. Чему равно среднее?',
        'Values: 2, 4, 6, 8. What is the average?',
      ),
      options: [t('4', '4', '4'), t('5', '5', '5'), t('20', '20', '20')],
      correctIndex: 1,
    },
    {
      id: 'da-1b',
      tier: 1,
      question: t(
        'Барои муқоисаи фурӯш дар 5 шаҳр кадом диаграмма мувофиқ аст?',
        'Какая диаграмма лучше сравнит продажи в 5 городах?',
        'Which chart best compares sales across 5 cities?',
      ),
      options: [
        t('Диаграммаи сутунӣ (bar)', 'Столбчатая диаграмма', 'A bar chart'),
        t(
          'Диаграммаи нуқтагӣ бе тамға',
          'Точечная диаграмма без подписей',
          'An unlabelled scatter plot',
        ),
        t(
          'Ҷадвали 5 рақам бе сарлавҳа',
          'Таблица из 5 чисел без заголовков',
          'A table of 5 numbers with no headers',
        ),
      ],
      correctIndex: 0,
    },
    {
      id: 'da-2a',
      tier: 2,
      question: t(
        'Ин коди Python чӣ мебарорад?',
        'Что выведет этот код на Python?',
        'What does this Python code print?',
      ),
      code: 'nums = [3, 1, 2]\nprint(sorted(nums))',
      options: [
        t('[3, 1, 2]', '[3, 1, 2]', '[3, 1, 2]'),
        t('None', 'None', 'None'),
        t('[1, 2, 3]', '[1, 2, 3]', '[1, 2, 3]'),
      ],
      correctIndex: 2,
    },
    {
      id: 'da-2b',
      tier: 2,
      question: t(
        'Ин дархост чӣ нишон медиҳад?',
        'Что покажет этот запрос?',
        'What does this query show?',
      ),
      code: 'SELECT city, COUNT(*)\nFROM users\nGROUP BY city;',
      options: [
        t('Шумораи умумии корбарон', 'Общее число пользователей', 'The total number of users'),
        t(
          'Шумораи корбарон дар ҳар шаҳр',
          'Сколько пользователей в каждом городе',
          'How many users each city has',
        ),
        t(
          'Рӯйхати шаҳрҳо бе рақам',
          'Список городов без чисел',
          'A list of cities with no numbers',
        ),
      ],
      correctIndex: 1,
    },
    {
      id: 'da-3a',
      tier: 3,
      question: t(
        'Музди корӣ: 3, 3, 4, 4, 100 ҳазор. Кадом рақам музди «муқаррарӣ»-ро беҳтар нишон медиҳад?',
        'Зарплаты: 3, 3, 4, 4, 100 тысяч. Какое число лучше покажет «обычную» зарплату?',
        'Salaries: 3, 3, 4, 4, 100 thousand. Which number best shows a “typical” salary?',
      ),
      options: [
        t('Медиана — 4', 'Медиана — 4', 'The median — 4'),
        t('Миёна — 22,8', 'Среднее — 22,8', 'The mean — 22.8'),
        t('Ҳадди аксар — 100', 'Максимум — 100', 'The maximum — 100'),
      ],
      correctIndex: 0,
    },
    {
      id: 'da-3b',
      tier: 3,
      question: t(
        'Ин коди Python чӣ мебарорад?',
        'Что выведет этот код на Python?',
        'What does this Python code print?',
      ),
      code: 'counts = {}\nfor w in ["a", "b", "a"]:\n    counts[w] = counts.get(w, 0) + 1\nprint(counts)',
      options: [
        t("{'a': 1, 'b': 1}", "{'a': 1, 'b': 1}", "{'a': 1, 'b': 1}"),
        t("{'a': 2, 'b': 1}", "{'a': 2, 'b': 1}", "{'a': 2, 'b': 1}"),
        t('KeyError', 'KeyError', 'KeyError'),
      ],
      correctIndex: 1,
    },
  ],
  design: [
    {
      id: 'de-1a',
      tier: 1,
      question: t(
        'Пеш аз кашидани макети зебо аввал чӣ мекунанд?',
        'Что делают перед тем, как рисовать красивый макет?',
        'What comes before drawing a polished mockup?',
      ),
      options: [
        t(
          'Анимацияҳоро интихоб мекунанд',
          'Подбирают анимации переходов',
          'Choose transition animations',
        ),
        t(
          'Нақшаи содда (wireframe) мекашанд',
          'Рисуют простую схему (wireframe)',
          'Sketch a simple wireframe',
        ),
        t(
          'Логотипро тартиб медиҳанд',
          'Заказывают логотип у дизайнера',
          'Order a logo from a designer',
        ),
      ],
      correctIndex: 1,
    },
    {
      id: 'de-1b',
      tier: 1,
      question: t(
        'Матни хокистарии #AAAAAA дар заминаи сафед. Мушкил чист?',
        'Серый текст #AAAAAA на белом фоне. В чём проблема?',
        'Grey #AAAAAA text on a white background. What is wrong?',
      ),
      options: [
        t(
          'Контраст паст — хондан душвор',
          'Низкий контраст — трудно читать',
          'Low contrast — hard to read',
        ),
        t(
          'Ранги хокистарӣ дар веб манъ аст',
          'Серый цвет в вебе запрещён',
          'Grey is not allowed on the web',
        ),
        t('Ҳама дуруст, мушкил нест', 'Всё в порядке, проблемы нет', 'Nothing, it is fine'),
      ],
      correctIndex: 0,
    },
    {
      id: 'de-2a',
      tier: 2,
      question: t(
        'Аз 5 корбар 4 нафар тугмаи пардохтро наёфтанд. Беҳтараш чӣ кор кунем?',
        '4 из 5 пользователей не нашли кнопку оплаты. Что лучше сделать?',
        '4 of 5 users could not find the pay button. What is best?',
      ),
      options: [
        t(
          'Ҳеҷ чиз — 5 нафар кам аст',
          'Ничего — 5 человек слишком мало',
          'Nothing — 5 people is too few',
        ),
        t(
          'Ба тугма анимацияи дурахшанда илова кунем',
          'Добавить кнопке мигающую анимацию',
          'Add a blinking animation to the button',
        ),
        t(
          'Сабабро ёфта, тағйир дода, боз санҷем',
          'Найти причину, изменить и проверить снова',
          'Find the cause, change it and test again',
        ),
      ],
      correctIndex: 2,
    },
    {
      id: 'de-2b',
      tier: 2,
      question: t(
        'Ҳадди ақали андозаи ҷои пахш дар телефон тақрибан чанд аст?',
        'Какой минимальный размер зоны нажатия на телефоне?',
        'What is the minimum touch target size on phones?',
      ),
      options: [
        t('16 × 16 px', '16 × 16 px', '16 × 16 px'),
        t('44 × 44 px', '44 × 44 px', '44 × 44 px'),
        t('120 × 120 px', '120 × 120 px', '120 × 120 px'),
      ],
      correctIndex: 1,
    },
    {
      id: 'de-3a',
      tier: 3,
      question: t(
        'Корбар мегӯяд: «Тугмаи экспорт лозим». Аввал чӣ мекунед?',
        'Пользователь говорит: «Нужна кнопка экспорта». Что вы сделаете сначала?',
        'A user says “we need an export button”. What do you do first?',
      ),
      options: [
        t(
          'Мепурсам, ки бо экспорт кадом вазифаро ҳал мекунад',
          'Спрошу, какую задачу он решает экспортом',
          'Ask what job the export would do for them',
        ),
        t(
          'Фавран тугмаро ба макет илова мекунам',
          'Сразу добавлю кнопку в макет',
          'Add the button to the mockup right away',
        ),
        t(
          'Рад мекунам — ин кори дизайнер нест',
          'Откажу — это не задача дизайнера',
          'Refuse — it is not a design task',
        ),
      ],
      correctIndex: 0,
    },
    {
      id: 'de-3b',
      tier: 3,
      question: t(
        'Дастаи 5 дизайнер барои чӣ дизайн-система месозад?',
        'Зачем команде из 5 дизайнеров дизайн-система?',
        'Why does a team of 5 designers build a design system?',
      ),
      options: [
        t(
          'Барои зебо будани портфолио',
          'Чтобы портфолио выглядело солиднее',
          'To make the portfolio look better',
        ),
        t(
          'Барои компонентҳо ва қоидаҳои ягона',
          'Для единых компонентов и правил',
          'For shared components and rules',
        ),
        t(
          'Барои он ки барномасозон лозим набошанд',
          'Чтобы больше не нужны были разработчики',
          'So developers are no longer needed',
        ),
      ],
      correctIndex: 1,
    },
  ],
  business: [
    {
      id: 'bu-1a',
      tier: 1,
      question: t(
        'Даромад 10 000, харҷ 7 000 сомонӣ. Фоида чанд аст?',
        'Выручка 10 000, расходы 7 000 сомони. Какая прибыль?',
        'Revenue 10,000, costs 7,000 somoni. What is the profit?',
      ),
      options: [
        t('17 000', '17 000', '17,000'),
        t('7 000', '7 000', '7,000'),
        t('3 000', '3 000', '3,000'),
      ],
      correctIndex: 2,
    },
    {
      id: 'bu-1b',
      tier: 1,
      question: t(
        'Мизоҷи мақсаднок кист?',
        'Кто такой целевой клиент?',
        'Who is a target customer?',
      ),
      options: [
        t(
          'Гурӯҳе ки мушкилашро маҳсулот ҳал мекунад',
          'Группа, чью проблему решает продукт',
          'A group whose problem the product solves',
        ),
        t(
          'Ҳамаи одамони шаҳр бе истисно',
          'Все жители города без исключения',
          'Everyone in the city without exception',
        ),
        t(
          'Дӯстон ва хешовандони соҳиб',
          'Друзья и родственники владельца',
          "The owner's friends and relatives",
        ),
      ],
      correctIndex: 0,
    },
    {
      id: 'bu-2a',
      tier: 2,
      question: t(
        'Реклама: 1000 намоиш ва 50 клик. CTR чанд аст?',
        'Реклама: 1000 показов и 50 кликов. Какой CTR?',
        'An ad: 1,000 impressions and 50 clicks. What is the CTR?',
      ),
      options: [t('50%', '50%', '50%'), t('5%', '5%', '5%'), t('0,5%', '0,5%', '0.5%')],
      correctIndex: 1,
    },
    {
      id: 'bu-2b',
      tier: 2,
      question: t(
        'Аз 200 меҳмони сайт 10 нафар харид карданд. Конверсия чанд аст?',
        'Из 200 посетителей сайта купили 10. Какая конверсия?',
        '10 of 200 site visitors bought. What is the conversion rate?',
      ),
      options: [t('20%', '20%', '20%'), t('10%', '10%', '10%'), t('5%', '5%', '5%')],
      correctIndex: 2,
    },
    {
      id: 'bu-3a',
      tier: 3,
      question: t(
        'Ҷалби як мизоҷ (CAC) 20 сомонӣ, фоида аз ӯ дар тамоми вақт (LTV) 15. Хулоса?',
        'Привлечение клиента (CAC) стоит 20 сомони, прибыль от него за всё время (LTV) — 15. Вывод?',
        'Acquiring a customer (CAC) costs 20 somoni; their lifetime profit (LTV) is 15. Conclusion?',
      ),
      options: [
        t(
          'Модел зиёновар — ҷалб аз арзиш гаронтар',
          'Модель убыточна — привлечение дороже ценности',
          'The model loses money — acquisition costs more than value',
        ),
        t(
          'Модел фоиданок — мизоҷон меоянд',
          'Модель выгодна — клиенты же приходят',
          'The model is profitable — customers keep coming',
        ),
        t(
          'Ин рақамҳо ба ҳамдигар алоқа надоранд',
          'Эти числа никак не связаны между собой',
          'These numbers are unrelated',
        ),
      ],
      correctIndex: 0,
    },
    {
      id: 'bu-3b',
      tier: 3,
      question: t(
        'Пеш аз сохтани маҳсулот талаботро чӣ тавр бояд санҷид?',
        'Как проверить спрос до того, как делать продукт?',
        'How do you test demand before building the product?',
      ),
      options: [
        t(
          'Аз дӯстон пурсидан «мехаридед?»',
          'Спросить друзей «купили бы?»',
          'Ask friends “would you buy it?”',
        ),
        t(
          'Саҳифа ё пешфармоиш сохта, амалро чен кардан',
          'Сделать страницу или предзаказ и измерить действия',
          'Launch a page or pre-order and measure actions',
        ),
        t(
          'Аввал маҳсулотро пурра сохтан',
          'Сначала полностью сделать продукт',
          'Build the whole product first',
        ),
      ],
      correctIndex: 1,
    },
  ],
};

/** Course for each number of fully passed tiers (0–3), per direction. */
const LADDER: Record<PlacementDirection, [CourseId, CourseId, CourseId, CourseId]> = {
  frontend: ['html', 'javascript-1', 'react', 'javascript-pro'],
  backend: ['backend', 'backend', 'nodejs', 'backend-pro'],
  mobile: ['html', 'react', 'mobile', 'mobile'],
  data: ['data-analytics', 'python', 'sql', 'algorithms'],
  design: ['ux-design', 'ux-design', 'ux-pro', 'ux-pro'],
  business: ['business-foundations', 'business-foundations', 'digital-marketing', 'business-pro'],
};

export function placementDirection(direction: string | undefined): PlacementDirection {
  return direction === 'backend' ||
    direction === 'mobile' ||
    direction === 'data' ||
    direction === 'design' ||
    direction === 'business'
    ? direction
    : 'frontend';
}

export interface PlacementResult {
  direction: PlacementDirection;
  /** Correct answers out of the six questions. */
  correct: number;
  /** Tiers passed in a row from the bottom: a tier counts only when both of its questions are right. */
  passedTiers: 0 | 1 | 2 | 3;
  level: PlacementLevel;
  courseId: CourseId;
}

/** answers[questionId] = chosen option index; 3 (or anything else) means «I don't know». */
export function scorePlacement(
  direction: PlacementDirection,
  answers: Record<string, number>,
): PlacementResult {
  const bank = PLACEMENT_BANK[direction];
  const right = (q: PlacementQuestion) => answers[q.id] === q.correctIndex;
  let passedTiers: 0 | 1 | 2 | 3 = 0;
  for (const tier of [1, 2, 3] as const) {
    if (bank.filter((q) => q.tier === tier).every(right)) passedTiers = tier;
    else break;
  }
  const level: PlacementLevel =
    passedTiers === 0 ? 'beginner' : passedTiers === 3 ? 'advanced' : 'middle';
  return {
    direction,
    correct: bank.filter(right).length,
    passedTiers,
    level,
    courseId: LADDER[direction][passedTiers],
  };
}

export const LEVEL_LABEL: Record<PlacementLevel, Text> = {
  beginner: t('Навомӯз', 'Новичок', 'Beginner'),
  middle: t('Миёна', 'Средний', 'Intermediate'),
  advanced: t('Баланд', 'Высокий', 'Advanced'),
};
