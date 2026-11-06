import { t, type PlacementDirection, type PlacementQuestion } from './placement-types';

/** Knowledge-check questions for frontend, backend and mobile: two per tier. */
export const TECH_PLACEMENT_QUESTIONS: Record<
  Extract<PlacementDirection, 'frontend' | 'backend' | 'mobile'>,
  PlacementQuestion[]
> = {
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
};
