import { t, type PlacementDirection, type PlacementQuestion } from './placement-types';

/** Knowledge-check questions for data, design and business: two per tier. */
export const OTHER_PLACEMENT_QUESTIONS: Record<
  Extract<PlacementDirection, 'data' | 'design' | 'business'>,
  PlacementQuestion[]
> = {
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
