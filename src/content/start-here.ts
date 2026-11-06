/** "Day 0" for people who have never programmed. Kept outside course progression so existing learners are never blocked. */
type Text = { tg: string; ru: string; en: string };
export interface StartSection {
  id: string;
  title: Text;
  body: Text;
  steps?: Text[];
  code?: string;
}
export interface StartQuestion {
  id: string;
  question: Text;
  options: Text[];
  correctIndex: number;
  explanation: Text;
}

export const START_HERE_TITLE: Text = {
  tg: 'Рӯзи 0: аз ин ҷо сар кунед',
  ru: 'День 0: начните отсюда',
  en: 'Day 0: start here',
};
export const START_HERE_INTRO: Text = {
  tg: 'Агар ҳеҷ гоҳ код нанавишта бошед — ин саҳифа барои шумост. Дар 30–40 дақиқа мефаҳмед, ки программирование чист, VS Code-ро насб мекунед ва аввалин фармонро ба браузер медиҳед.',
  ru: 'Если вы никогда не писали код — эта страница для вас. За 30–40 минут вы поймёте, что такое программирование, установите VS Code и дадите браузеру первую команду.',
  en: 'If you have never written code, this page is for you. In 30–40 minutes you will understand what programming is, install VS Code and give the browser its first command.',
};

export const START_SECTIONS: StartSection[] = [
  {
    id: 'what',
    title: {
      tg: '1. Программирование чист?',
      ru: '1. Что такое программирование?',
      en: '1. What is programming?',
    },
    body: {
      tg: 'Компютер худаш ҳеҷ чиз намефаҳмад — фақат дастурро иҷро мекунад. Программирование — ин навиштани дастур бо забоне, ки компютер мефаҳмад. Мисли рецепти ош: «Пиёзро бурида, 5 дақиқа бирён кун». Ошпаз рецептро айнан иҷро мекунад. Агар дар рецепт хато бошад — ош ҳам хато мешавад. Компютер ҳам ҳамин тавр: хатои код = хатои натиҷа. Ин тарснок нест — ҳар разработчик ҳар рӯз хато мекунад ва ислоҳ мекунад.',
      ru: 'Компьютер сам ничего не понимает — он только выполняет инструкции. Программирование — это написание инструкций на языке, понятном компьютеру. Как рецепт плова: «Нарежь лук, обжарь 5 минут». Повар выполняет рецепт буквально. Если в рецепте ошибка — плов тоже выйдет с ошибкой. С компьютером так же: ошибка в коде = ошибка в результате. Это не страшно — каждый разработчик ошибается и исправляет ошибки каждый день.',
      en: 'A computer understands nothing on its own — it only follows instructions. Programming is writing those instructions in a language the computer understands. Like a recipe: “Chop the onion, fry for 5 minutes.” A cook follows it literally. A mistake in the recipe means a mistake in the dish. Code works the same way. That is fine — every developer makes and fixes mistakes every day.',
    },
  },
  {
    id: 'web',
    title: {
      tg: '2. Сайт аз чӣ иборат аст?',
      ru: '2. Из чего состоит сайт?',
      en: '2. What is a website made of?',
    },
    body: {
      tg: 'Сайтро мисли хона тасаввур кунед. HTML — девор ва хонаҳо (сохтор: сарлавҳа, матн, тугма). CSS — ранг, ороиш ва ҷойгиршавӣ. JavaScript — барқ ва автоматика: тугмаро пахш мекунед — чизе рӯй медиҳад. Браузер (Chrome, Edge) ин се файлро мехонад ва ба шумо хонаи тайёрро нишон медиҳад. Мо низ дар ҳамин тартиб меомӯзем: HTML → CSS → JavaScript → React.',
      ru: 'Представьте сайт как дом. HTML — стены и комнаты (структура: заголовок, текст, кнопка). CSS — краска, отделка и расстановка. JavaScript — электричество и автоматика: нажали кнопку — что-то произошло. Браузер (Chrome, Edge) читает эти три вида файлов и показывает вам готовый дом. Учимся в том же порядке: HTML → CSS → JavaScript → React.',
      en: 'Think of a website as a house. HTML is the walls and rooms (structure: heading, text, button). CSS is the paint, finish and layout. JavaScript is the electricity: press a button and something happens. The browser (Chrome, Edge) reads these three kinds of files and shows you the finished house. We learn in the same order: HTML → CSS → JavaScript → React.',
    },
  },
  {
    id: 'vscode',
    title: {
      tg: '3. VS Code-ро насб кунед (Windows)',
      ru: '3. Установите VS Code (Windows)',
      en: '3. Install VS Code (Windows)',
    },
    body: {
      tg: 'VS Code — ин дафтари разработчик: дар он кодро менависем. Ройгон аст ва аз сайти расмӣ гирифта мешавад.',
      ru: 'VS Code — это тетрадь разработчика: в нём мы пишем код. Он бесплатный и скачивается с официального сайта.',
      en: 'VS Code is a developer’s notebook: we write code in it. It is free and downloaded from the official site.',
    },
    steps: [
      {
        tg: 'Ба code.visualstudio.com дароед ва тугмаи Download for Windows-ро пахш кунед.',
        ru: 'Откройте code.visualstudio.com и нажмите Download for Windows.',
        en: 'Open code.visualstudio.com and click Download for Windows.',
      },
      {
        tg: 'Файли боршударо кушоед. Дар қадами «Select Additional Tasks» ҳамаи чор қуттичаро қайд кунед (Add “Open with Code”, Add to PATH).',
        ru: 'Запустите скачанный файл. На шаге «Select Additional Tasks» отметьте все четыре галочки (Add “Open with Code”, Add to PATH).',
        en: 'Run the downloaded file. At “Select Additional Tasks”, tick all four boxes (Add “Open with Code”, Add to PATH).',
      },
      {
        tg: 'Дар мизи корӣ папкаи нав созед: my-first-site.',
        ru: 'На рабочем столе создайте новую папку: my-first-site.',
        en: 'Create a new folder on the desktop: my-first-site.',
      },
      {
        tg: 'Дар VS Code: File → Open Folder → my-first-site. Агар пурсад «Do you trust the authors?» — Yes.',
        ru: 'В VS Code: File → Open Folder → my-first-site. Если спросит «Do you trust the authors?» — Yes.',
        en: 'In VS Code: File → Open Folder → my-first-site. If asked “Do you trust the authors?” — Yes.',
      },
      {
        tg: 'Дар панели чап New File-ро пахш карда, файлро index.html ном гузоред ва Ctrl+S кунед.',
        ru: 'В левой панели нажмите New File, назовите файл index.html и нажмите Ctrl+S.',
        en: 'In the left panel click New File, name it index.html and press Ctrl+S.',
      },
    ],
  },
  {
    id: 'browser',
    title: {
      tg: '4. Аввалин саҳифа дар браузер',
      ru: '4. Первая страница в браузере',
      en: '4. Your first page in the browser',
    },
    body: {
      tg: 'Дар index.html сатри поёнро бо даст нависед (копия накунед — дастҳо бояд ёд гиранд). Ctrl+S кунед. Баъд дар папка ба index.html ду бор клик кунед — он дар браузер кушода мешавад. Матнро иваз кунед, сабт кунед ва дар браузер F5 (навсозӣ) пахш кунед. Ҳамин аст тамоми сикли кор: навиштан → сабт → дидан.',
      ru: 'В index.html наберите строку ниже руками (не копируйте — руки должны запомнить). Нажмите Ctrl+S. Затем в папке дважды щёлкните по index.html — файл откроется в браузере. Поменяйте текст, сохраните и нажмите в браузере F5 (обновить). Это весь рабочий цикл: написать → сохранить → посмотреть.',
      en: 'Type the line below into index.html by hand (do not copy — your hands need to learn it). Press Ctrl+S. Then double-click index.html in the folder — it opens in the browser. Change the text, save and press F5 in the browser to refresh. That is the whole loop: write → save → look.',
    },
    code: '<h1>Салом! Ин саҳифаи аввалини ман аст.</h1>',
  },
  {
    id: 'console',
    title: {
      tg: '5. Консоли браузер — гуфтугӯ бо компютер',
      ru: '5. Консоль браузера — разговор с компьютером',
      en: '5. The browser console — talking to the computer',
    },
    body: {
      tg: 'Дар саҳифаи кушода F12-ро пахш кунед (ё Ctrl+Shift+J) ва ҷадвали Console-ро интихоб кунед. Ин ҷо фармонҳои JavaScript-ро фавран иҷро кардан мумкин аст. Нависед 2 + 2 ва Enter — ҷавоб 4. Баъд фармони поёнро нависед. Агар матни сурх пайдо шавад — ин хато аст ва браузер ба шумо мегӯяд, ки дар куҷо. Хатоҳоро хондан — маҳорати №1-и разработчик.',
      ru: 'На открытой странице нажмите F12 (или Ctrl+Shift+J) и выберите вкладку Console. Здесь можно сразу выполнять команды JavaScript. Напишите 2 + 2 и Enter — ответ 4. Затем напишите команду ниже. Если появится красный текст — это ошибка, и браузер подсказывает, где она. Читать ошибки — навык №1 разработчика.',
      en: 'On the open page press F12 (or Ctrl+Shift+J) and choose the Console tab. Here you can run JavaScript commands instantly. Type 2 + 2 and press Enter — the answer is 4. Then type the command below. If red text appears, that is an error, and the browser tells you where. Reading errors is a developer’s skill number one.',
    },
    code: "console.log('Салом, ман разработчик мешавам!')",
  },
  {
    id: 'method',
    title: {
      tg: '6. Дар DevAtlas чӣ тавр мехонем',
      ru: '6. Как учиться в DevAtlas',
      en: '6. How to learn in DevAtlas',
    },
    body: {
      tg: 'Ҳар рӯз: дарсро мехонед → бозии «кодро ба тартиб гузор» → практикаро бо даст менависед (гузоштани кодҳои калон манъ аст — ин барои шумо) → тест → рӯзи нав. Агар нафаҳмед — ба ёрдамчӣ (тугмаи робот) савол диҳед, метавонед бо овоз ҳам. Имтиҳонро нагузаред — курси навбатӣ кушода намешавад. Ин сахтгирӣ барои он аст, ки шумо воқеан ёд гиред.',
      ru: 'Каждый день: читаете урок → игра «собери код по порядку» → пишете практику руками (большие вставки запрещены — это для вашей же пользы) → тест → новый день. Не поняли — спросите помощника (кнопка с роботом), можно голосом. Не сдали экзамен — следующий курс не откроется. Эта строгость нужна, чтобы вы действительно научились.',
      en: 'Every day: read the lesson → the “put the code in order” game → type the practice by hand (large pastes are blocked — for your own good) → quiz → next day. Stuck? Ask the assistant (the robot button), even by voice. Fail the exam and the next course stays locked. That strictness is how real learning happens.',
    },
  },
];

export const START_QUESTIONS: StartQuestion[] = [
  {
    id: 'start-q1',
    question: {
      tg: 'Кадом файл сохтори саҳифаро муайян мекунад?',
      ru: 'Какой файл задаёт структуру страницы?',
      en: 'Which file defines the page structure?',
    },
    options: [
      { tg: 'HTML', ru: 'HTML', en: 'HTML' },
      { tg: 'CSS', ru: 'CSS', en: 'CSS' },
      { tg: 'Расм', ru: 'Картинка', en: 'An image' },
    ],
    correctIndex: 0,
    explanation: {
      tg: 'HTML — девор ва хонаҳо. CSS танҳо ранг ва ороиш медиҳад.',
      ru: 'HTML — стены и комнаты. CSS отвечает только за краску и отделку.',
      en: 'HTML is the walls and rooms. CSS only handles paint and finish.',
    },
  },
  {
    id: 'start-q2',
    question: {
      tg: 'Код навиштед, вале дар браузер тағйир нест. Аввал чиро месанҷед?',
      ru: 'Вы написали код, но в браузере ничего не изменилось. Что проверить первым?',
      en: 'You wrote code but the browser shows no change. What do you check first?',
    },
    options: [
      { tg: 'Компютерро аз нав мегирам', ru: 'Перезагружу компьютер', en: 'Restart the computer' },
      {
        tg: 'Файл сабт шуд (Ctrl+S) ва саҳифа навсозӣ шуд (F5)?',
        ru: 'Сохранил ли файл (Ctrl+S) и обновил ли страницу (F5)?',
        en: 'Did I save (Ctrl+S) and refresh (F5)?',
      },
      {
        tg: 'VS Code-ро аз нав насб мекунам',
        ru: 'Переустановлю VS Code',
        en: 'Reinstall VS Code',
      },
    ],
    correctIndex: 1,
    explanation: {
      tg: 'Сикли кор: навиштан → сабт → навсозӣ. Аксар вақт яке аз инҳо фаромӯш мешавад.',
      ru: 'Рабочий цикл: написать → сохранить → обновить. Чаще всего забывают один из шагов.',
      en: 'The loop is write → save → refresh. Usually one step was skipped.',
    },
  },
  {
    id: 'start-q3',
    question: {
      tg: 'Дар Console матни сурх пайдо шуд. Ин чӣ маъно дорад?',
      ru: 'В Console появился красный текст. Что это значит?',
      en: 'Red text appeared in the Console. What does it mean?',
    },
    options: [
      { tg: 'Компютер вайрон шуд', ru: 'Компьютер сломался', en: 'The computer is broken' },
      {
        tg: 'Хато ҳаст — бояд хонд, ки дар куҷо ва чаро',
        ru: 'Есть ошибка — нужно прочитать, где и почему',
        en: 'There is an error — read where and why',
      },
      { tg: 'Ҳамааш хуб аст', ru: 'Всё отлично', en: 'Everything is fine' },
    ],
    correctIndex: 1,
    explanation: {
      tg: 'Хато — ёрдамчии шумост: браузер сатр ва сабабро нишон медиҳад.',
      ru: 'Ошибка — ваш помощник: браузер показывает строку и причину.',
      en: 'An error is your helper: the browser shows the line and the reason.',
    },
  },
];
