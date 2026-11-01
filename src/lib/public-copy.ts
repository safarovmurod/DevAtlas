import type { InterfaceLocale } from '@/lib/locale';
import { JAPANESE_PUBLIC_COPY } from './locales/ja';
import { KOREAN_PUBLIC_COPY } from './locales/ko';

type PublicLocaleCopy = {
  privacyLabel: string; termsLabel: string; start: string;
  eyebrow: string; heroLead: string; heroEmphasis: string; heroEnd: string;
  heroDescription: string; seePlatform: string; heroNote: string;
  featuresTitle: string; features: { title:string; description:string }[];
  ctaTitle: string; ctaDescription: string; ctaLink: string;
  title: string; description: string;
  privacy: { title:string; introduction:string; sections:{title:string;text:string}[]; notice:string };
  terms: { title:string; introduction:string; sections:{title:string;text:string}[]; notice:string };
};

export const PUBLIC_COPY: Record<InterfaceLocale, PublicLocaleCopy> = {
  ja:JAPANESE_PUBLIC_COPY,
  ko:KOREAN_PUBLIC_COPY,
  tg: {
    privacyLabel:'Махфият',termsLabel:'Қоидаҳо',start:'Оғоз кардан',
    eyebrow:'ПЛАТФОРМАИ ОМӮЗИШ ВА МАЛАКАҲО',heroLead:'Аз шавқи нав',heroEmphasis:'то малакаи амалӣ',heroEnd:'қадам ба қадам.',
    heroDescription:'Барномасозӣ, муҳандисии AI, дизайн, соҳибкорӣ ва маркетинг: самти худро интихоб кунед. DevAtlas дарсҳо, супоришҳои амалӣ ва пайгирии пешрафтро дар як ҷо ҷамъ мекунад.',
    seePlatform:'Дидани платформа',heroNote:'Омӯзиш ҳамчун меҳмон ҳам имконпазир аст. Ҳамоҳангсозии абрӣ ва AI-и онлайн ба танзимоти сервер вобастаанд.',
    featuresTitle:'Аз назария то амалия',
    features:[
      {title:'Дарсҳои қадам ба қадам',description:'Самти омӯзишро интихоб карда, мавзӯъҳоро қадам ба қадам аз худ кунед.'},
      {title:'Супориш ва лоиҳа',description:'Донишро дар амал истифода баред, натиҷаро санҷед ва пешрафтро бинед.'},
      {title:'AI Tutor — ихтиёрӣ',description:'Маводи маҳаллӣ бе API кор мекунад; AI-и онлайн танзими алоҳида мехоҳад.'},
    ],
    ctaTitle:'Барои машқи аввал омодаед?',ctaDescription:'Аз дарсҳо ва машқҳои мавҷуда оғоз кунед.',ctaLink:'Ба дарсҳо',
    title:'DevAtlas — омӯзиш бо амалия',description:'Платформаи омӯзиши малакаҳо: барномасозӣ, дизайн, соҳибкорӣ ва маркетинг бо дарсҳо ва супоришҳои амалӣ.',
    privacy:{
      title:'Махфият',introduction:'DevAtlas платформаи омӯзишӣ аст. Пешрафти меҳмон дар браузер ва маълумоти аккаунт ҳангоми пайваст будани Supabase дар абр нигоҳ дошта мешаванд.',
      sections:[
        {title:'Маълумоти аккаунт',text:'Почтаи электронӣ, профил, ёддоштҳо, ҷавобҳо ва пешрафти омӯзишӣ метавонанд коркард шаванд. Ҳамоҳангсозии абрӣ аккаунти фаъол мехоҳад.'},
        {title:'AI Tutor',text:'Ҷавобҳои маводи платформа бе провайдери беруна дастрасанд. Ҳангоми фаъол будани AI-и онлайн савол ва контексти зарурӣ метавонад ба провайдер фиристода шавад.'},
        {title:'Назорати маълумот',text:'Маълумоти меҳмонро дар браузер идора кунед. Барои маълумоти аккаунт аз танзимоти аккаунт истифода баред.'},
      ],
      notice:'Ин шарҳи ибтидоӣ аст. Пеш аз оғози истифодаи оммавӣ оператор бояд маълумоти тамос, муҳлати нигоҳдорӣ ва ҳуҷҷатҳои ҳуқуқиро тасдиқ кунад.',
    },
    terms:{
      title:'Қоидаҳои истифода',introduction:'DevAtlas платформаи омӯзишӣ аст. Машқ, тест ва ёрии AI кафолати сертификат ё корёбӣ нестанд.',
      sections:[
        {title:'Аккаунт',text:'Маълумоти воридшавиро махфӣ нигоҳ доред ва ба маълумоти дигарон беиҷозат дастрасӣ нагиред.'},
        {title:'Имкониятҳои ихтиёрӣ',text:'AI-и онлайн ва ҳамоҳангсозии абрӣ аз конфигуратсияи сервер ва провайдерҳо вобастаанд.'},
      ],
      notice:'Пеш аз истифодаи тиҷоратӣ шартҳои ниҳоӣ ва маълумоти оператор бояд аз нигоҳи ҳуқуқӣ тасдиқ шаванд.',
    },
  },
  ru: {
    privacyLabel:'Конфиденциальность',termsLabel:'Правила',start:'Начать обучение',
    eyebrow:'ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА',heroLead:'От нового интереса',heroEmphasis:'к полезному навыку',heroEnd:'шаг за шагом.',
    heroDescription:'Программирование, ИИ-инженерия, дизайн, бизнес и маркетинг — выберите своё направление. DevAtlas объединяет понятные уроки, практические задания и отслеживание прогресса.',
    seePlatform:'Посмотреть платформу',heroNote:'Можно учиться как гость. Облачная синхронизация и онлайн-AI зависят от настроек сервера.',
    featuresTitle:'От теории к практике',
    features:[
      {title:'Пошаговые уроки',description:'Выберите направление и осваивайте новые темы по понятному учебному плану.'},
      {title:'Задания и проекты',description:'Применяйте знания на практике, проверяйте результат и следите за прогрессом.'},
      {title:'AI Tutor — дополнительно',description:'Локальные материалы работают без API; онлайн-AI требует настройки.'},
    ],
    ctaTitle:'Готовы к первому упражнению?',ctaDescription:'Начните с уже доступных уроков и задач.',ctaLink:'К урокам',
    title:'DevAtlas — обучение на практике',description:'Платформа для развития навыков: программирование, ИИ-инженерия, дизайн, бизнес и маркетинг с уроками и практическими заданиями.',
    privacy:{
      title:'Конфиденциальность',introduction:'DevAtlas — образовательная платформа. Гостевой прогресс сохраняется в браузере, а данные аккаунта — в Supabase, если сервис настроен.',
      sections:[
        {title:'Данные аккаунта',text:'Могут обрабатываться email, профиль, заметки, ответы и учебный прогресс. Облачная синхронизация требует активного аккаунта.'},
        {title:'AI Tutor',text:'Ответы из встроенных материалов доступны без внешнего провайдера. При использовании настроенного онлайн-AI вопросы и необходимый контекст могут отправляться провайдеру.'},
        {title:'Контроль данных',text:'Локальные данные можно удалить в браузере. Данные аккаунта управляются через настройки аккаунта.'},
      ],
      notice:'Это предварительное описание. До публичного запуска оператор должен уточнить контакт, сроки хранения и юридические документы.',
    },
    terms:{
      title:'Правила использования',introduction:'DevAtlas — учебная платформа. Упражнения, тесты и ответы AI не гарантируют сертификат или трудоустройство.',
      sections:[
        {title:'Аккаунт',text:'Не сообщайте другим данные входа и не пытайтесь получить чужие данные.'},
        {title:'Дополнительные возможности',text:'Онлайн-AI и облачная синхронизация зависят от настроек сервера и внешних провайдеров.'},
      ],
      notice:'Перед коммерческим использованием нужны утверждённые условия и данные оператора.',
    },
  },
  en: {
    privacyLabel:'Privacy',termsLabel:'Terms',start:'Start learning',
    eyebrow:'A PLATFORM FOR LEARNING AND SKILLS',heroLead:'Turn your curiosity',heroEmphasis:'into useful skills',heroEnd:'one step at a time.',
    heroDescription:'Programming, AI engineering, design, business and marketing: choose your direction. DevAtlas brings together clear lessons, practical assignments and progress tracking.',
    seePlatform:'Explore the platform',heroNote:'Guest learning is available. Cloud sync and online AI depend on server configuration.',
    featuresTitle:'From theory to practice',
    features:[
      {title:'Step-by-step lessons',description:'Choose a direction and explore new topics with a clear study plan.'},
      {title:'Assignments and projects',description:'Put knowledge into practice, check your work and track your progress.'},
      {title:'Optional AI Tutor',description:'Local learning materials work without an API; online AI requires setup.'},
    ],
    ctaTitle:'Ready for your first exercise?',ctaDescription:'Start with the available lessons and practical assignments.',ctaLink:'Go to lessons',
    title:'DevAtlas — learn by doing',description:'Build skills in programming, AI engineering, design, business and marketing with lessons and practical assignments.',
    privacy:{
      title:'Privacy',introduction:'DevAtlas is an educational platform. Guest progress is stored in your browser; account data is stored in Supabase when configured.',
      sections:[
        {title:'Account data',text:'Email address, profile, notes, answers and learning progress may be processed. Cloud synchronization requires an active account.'},
        {title:'AI Tutor',text:'Built-in learning answers work without a third-party provider. When configured online AI is used, your question and necessary context may be sent to the provider.'},
        {title:'Data controls',text:'You can manage guest data in your browser. Use account settings for account data.'},
      ],
      notice:'This is a preliminary overview. Before public release, the operator must confirm contact details, retention periods and final legal policies.',
    },
    terms:{
      title:'Terms of use',introduction:'DevAtlas is a learning platform. Exercises, quizzes and AI support do not guarantee a certificate or employment.',
      sections:[
        {title:'Account',text:'Keep your credentials private and do not attempt to access another person’s data.'},
        {title:'Optional features',text:'Online AI and cloud synchronization depend on server configuration and external providers.'},
      ],
      notice:'Final terms and operator details require legal review before commercial use.',
    },
  },
  uk: {
    privacyLabel:'Конфіденційність',termsLabel:'Правила',start:'Почати навчання',
    eyebrow:'ОСВІТНЯ ПЛАТФОРМА',heroLead:'Від нового інтересу',heroEmphasis:'до корисної навички',heroEnd:'крок за кроком.',
    heroDescription:'Програмування, Інженерія ШІ, дизайн, бізнес і маркетинг — оберіть свій напрям. DevAtlas поєднує зрозумілі уроки, практичні завдання й відстеження прогресу.',
    seePlatform:'Переглянути платформу',heroNote:'Можна навчатися як гість. Хмарна синхронізація й онлайн-AI потребують налаштування сервера.',
    featuresTitle:'Від теорії до практики',
    features:[
      {title:'Покрокові уроки',description:'Оберіть напрям і опановуйте нові теми за зрозумілим навчальним планом.'},
      {title:'Завдання й проєкти',description:'Застосовуйте знання на практиці, перевіряйте результат і стежте за прогресом.'},
      {title:'AI Tutor — додатково',description:'Локальні матеріали працюють без API; онлайн-AI потребує налаштування.'},
    ],
    ctaTitle:'Готові до першої вправи?',ctaDescription:'Почніть із наявних уроків і завдань.',ctaLink:'До уроків',
    title:'DevAtlas — навчання на практиці',description:'Платформа для розвитку навичок: програмування, інженерія ШІ, дизайн, бізнес і маркетинг з уроками та практичними завданнями.',
    privacy:{
      title:'Конфіденційність',introduction:'DevAtlas — освітня платформа. Гостьовий прогрес зберігається в браузері, дані акаунта — в Supabase, якщо сервіс налаштовано.',
      sections:[
        {title:'Дані акаунта',text:'Можуть оброблятися електронна адреса, профіль, нотатки, відповіді й навчальний прогрес. Для хмарної синхронізації потрібен акаунт.'},
        {title:'AI Tutor',text:'Відповіді з вбудованих матеріалів працюють без стороннього провайдера. Під час використання онлайн-AI запитання й потрібний контекст можуть передаватися провайдеру.'},
        {title:'Керування даними',text:'Гостьові дані можна видалити в браузері. Дані акаунта керуються через його налаштування.'},
      ],
      notice:'Це попередній опис. До публічного запуску оператор має підтвердити контакти, строки зберігання та остаточні юридичні документи.',
    },
    terms:{
      title:'Правила користування',introduction:'DevAtlas — навчальна платформа. Вправи, тести та відповіді AI не гарантують сертифікат або працевлаштування.',
      sections:[
        {title:'Акаунт',text:'Зберігайте дані входу в таємниці й не намагайтеся отримати доступ до чужих даних.'},
        {title:'Додаткові можливості',text:'Онлайн-AI та хмарна синхронізація залежать від налаштувань сервера й зовнішніх провайдерів.'},
      ],
      notice:'Перед комерційним використанням потрібні затверджені умови й дані оператора.',
    },
  },
};

type LandingCopy = {
  directions:string; how:string; plans:string; questions:string; signIn:string; openMenu:string; closeMenu:string;
  directionTitle:string; directionIntro:string; howTitle:string; steps:{title:string;description:string}[];
  insideTitle:string; inside:string[]; faqTitle:string; faq:{question:string;answer:string}[];
  footerPlatform:string; footerDocuments:string; guest:string;
  courses:(count:number)=>string; categories:(count:number)=>string; languages:(count:number)=>string;
};
function slavicCount(count:number,locale:'ru'|'uk',one:string,few:string,many:string) {
  const form=new Intl.PluralRules(locale).select(count);
  return `${count} ${form==='one'?one:form==='few'?few:many}`;
}
export const LANDING_COPY:Record<InterfaceLocale,LandingCopy>={
  ru:{
    directions:'Направления',how:'Как это работает',plans:'Тарифы',questions:'Вопросы',signIn:'Войти',openMenu:'Открыть меню',closeMenu:'Закрыть меню',
    directionTitle:'Выберите своё направление',directionIntro:'От первых шагов до углублённых тем — выбирайте то, что важно вам.',howTitle:'Учёба шаг за шагом',
    steps:[{title:'Урок',description:'Разберитесь с новой темой.'},{title:'Код',description:'Примените знания в практике.'},{title:'Проверка',description:'Проверьте результат и исправьте ошибки.'},{title:'Новый день',description:'Продолжайте после завершения предыдущего дня.'}],
    insideTitle:'Всё для самостоятельной работы',inside:['Редактор кода и проверки','Учебный план по дням','Тесты и интервью','Повторение и сложные темы','Заметки и прогресс','AI Tutor по желанию','Языки интерфейса и тёмная тема'],faqTitle:'Частые вопросы',
    faq:[{question:'Можно ли начать как гость?',answer:'Да. Гостевой прогресс и заметки хранятся в этом браузере.'},{question:'Нужен ли аккаунт?',answer:'Для гостевого обучения аккаунт не обязателен. Для синхронизации между устройствами нужен аккаунт и настроенный сервер.'},{question:'Как работает AI Tutor?',answer:'Сначала Tutor ищет ответ в материалах. Онлайн-AI зависит от настроек сервера и доступного аккаунта.'},{question:'Есть ли сертификат или гарантия работы?',answer:'Сертификат и трудоустройство не гарантируются.'}],
    footerPlatform:'Платформа',footerDocuments:'Документы',guest:'Можно начать как гость',
    courses:n=>slavicCount(n,'ru','курс','курса','курсов'),categories:n=>slavicCount(n,'ru','направление','направления','направлений'),languages:n=>slavicCount(n,'ru','язык','языка','языков'),
  },
  en:{
    directions:'Learning paths',how:'How it works',plans:'Plans',questions:'Questions',signIn:'Sign in',openMenu:'Open menu',closeMenu:'Close menu',
    directionTitle:'Choose your learning path',directionIntro:'From first steps to advanced topics, choose what matters to you.',howTitle:'Learning, step by step',
    steps:[{title:'Lesson',description:'Explore a new topic.'},{title:'Code',description:'Put your knowledge into practice.'},{title:'Check',description:'Check the result and correct mistakes.'},{title:'Next day',description:'Continue after completing the previous day.'}],
    insideTitle:'Everything for independent learning',inside:['Code editor and checks','A day-by-day study plan','Tests and interviews','Review and difficult topics','Notes and progress','Optional AI Tutor','Interface languages and a dark theme'],faqTitle:'Frequently asked questions',
    faq:[{question:'Can I start as a guest?',answer:'Yes. Guest progress and notes are stored in this browser.'},{question:'Do I need an account?',answer:'An account is optional for guest learning. Syncing between devices requires an account and a configured server.'},{question:'How does AI Tutor work?',answer:'Tutor first looks for answers in the course material. Online AI depends on server configuration and an available account.'},{question:'Is a certificate or job guaranteed?',answer:'A certificate and employment are not guaranteed.'}],
    footerPlatform:'Platform',footerDocuments:'Documents',guest:'Start as a guest',courses:n=>`${n} ${n===1?'course':'courses'}`,categories:n=>`${n} ${n===1?'path':'paths'}`,languages:n=>`${n} ${n===1?'language':'languages'}`,
  },
  tg:{
    directions:'Самтҳо',how:'Чӣ тавр кор мекунад',plans:'Тарифҳо',questions:'Саволҳо',signIn:'Ворид шудан',openMenu:'Кушодани меню',closeMenu:'Пӯшидани меню',
    directionTitle:'Самти худро интихоб кунед',directionIntro:'Аз қадамҳои аввал то мавзӯъҳои амиқ — чизи бароятон муҳимро интихоб кунед.',howTitle:'Омӯзиш қадам ба қадам',
    steps:[{title:'Дарс',description:'Мавзӯи навро омӯзед.'},{title:'Код',description:'Донишро дар амал истифода баред.'},{title:'Санҷиш',description:'Натиҷаро санҷед ва хатоҳоро ислоҳ кунед.'},{title:'Рӯзи нав',description:'Баъд аз анҷоми рӯзи пешина идома диҳед.'}],
    insideTitle:'Ҳама чиз барои омӯзиши мустақил',inside:['Муҳаррири код ва санҷишҳо','Нақшаи омӯзиш аз рӯйи рӯзҳо','Тестҳо ва мусоҳиба','Такрор ва мавзӯъҳои душвор','Ёддоштҳо ва пешрафт','AI Tutor бо хоҳиш','Забонҳои интерфейс ва мавзӯи торик'],faqTitle:'Саволҳои маъмул',
    faq:[{question:'Метавонам ҳамчун меҳмон оғоз кунам?',answer:'Бале. Пешрафт ва ёддоштҳои меҳмон дар ҳамин браузер нигоҳ дошта мешаванд.'},{question:'Аккаунт лозим аст?',answer:'Барои омӯзиши меҳмон аккаунт ҳатмӣ нест. Барои ҳамоҳангсозӣ байни дастгоҳҳо аккаунт ва сервери танзимшуда лозиманд.'},{question:'AI Tutor чӣ тавр кор мекунад?',answer:'Tutor аввал ҷавобро дар маводи курс меҷӯяд. AI-и онлайн аз танзимоти сервер ва аккаунти дастрас вобаста аст.'},{question:'Сертификат ё кор кафолат дода мешавад?',answer:'Сертификат ва бо кор таъмин шудан кафолат дода намешаванд.'}],
    footerPlatform:'Платформа',footerDocuments:'Ҳуҷҷатҳо',guest:'Оғоз ҳамчун меҳмон',courses:n=>`${n} курс`,categories:n=>`${n} самт`,languages:n=>`${n} забон`,
  },
  uk:{
    directions:'Напрями',how:'Як це працює',plans:'Тарифи',questions:'Запитання',signIn:'Увійти',openMenu:'Відкрити меню',closeMenu:'Закрити меню',
    directionTitle:'Оберіть свій напрям',directionIntro:'Від перших кроків до складніших тем — обирайте важливе для вас.',howTitle:'Навчання крок за кроком',
    steps:[{title:'Урок',description:'Розберіться з новою темою.'},{title:'Код',description:'Застосуйте знання на практиці.'},{title:'Перевірка',description:'Перевірте результат і виправте помилки.'},{title:'Новий день',description:'Продовжуйте після завершення попереднього дня.'}],
    insideTitle:'Усе для самостійного навчання',inside:['Редактор коду та перевірки','Навчальний план за днями','Тести та співбесіди','Повторення та складні теми','Нотатки й прогрес','AI Tutor за бажанням','Мови інтерфейсу і темна тема'],faqTitle:'Поширені запитання',
    faq:[{question:'Чи можна почати як гість?',answer:'Так. Прогрес і нотатки гостя зберігаються в цьому браузері.'},{question:'Чи потрібен акаунт?',answer:'Для гостьового навчання акаунт необов’язковий. Для синхронізації між пристроями потрібні акаунт і налаштований сервер.'},{question:'Як працює AI Tutor?',answer:'Спочатку Tutor шукає відповідь у матеріалах курсу. Онлайн-ШІ залежить від налаштувань сервера та доступного акаунта.'},{question:'Чи гарантовано сертифікат або роботу?',answer:'Сертифікат і працевлаштування не гарантуються.'}],
    footerPlatform:'Платформа',footerDocuments:'Документи',guest:'Можна почати як гість',courses:n=>slavicCount(n,'uk','курс','курси','курсів'),categories:n=>slavicCount(n,'uk','напрям','напрями','напрямів'),languages:n=>slavicCount(n,'uk','мова','мови','мов'),
  },
  ja:{
    directions:'学習分野',how:'学習の流れ',plans:'プラン',questions:'よくある質問',signIn:'ログイン',openMenu:'メニューを開く',closeMenu:'メニューを閉じる',
    directionTitle:'学びたい分野を選ぶ',directionIntro:'基礎から応用まで、自分に合った分野を選びましょう。',howTitle:'一歩ずつ学ぶ',
    steps:[{title:'レッスン',description:'新しいトピックを学びます。'},{title:'コード',description:'学んだことを演習で試します。'},{title:'確認',description:'結果を確認し、間違いを直します。'},{title:'次の日',description:'前の日を終えたら次に進みます。'}],
    insideTitle:'自分で学ぶための機能',inside:['コードエディターとチェック','日ごとの学習プラン','テストと面接','復習と苦手なトピック','ノートと進捗','任意のAI Tutor','表示言語とダークテーマ'],faqTitle:'よくある質問',
    faq:[{question:'ゲストとして始められますか？',answer:'はい。ゲストの進捗とノートはこのブラウザーに保存されます。'},{question:'アカウントは必要ですか？',answer:'ゲスト学習には必須ではありません。端末間の同期にはアカウントと設定済みのサーバーが必要です。'},{question:'AI Tutorはどう動きますか？',answer:'まず教材から答えを探します。オンラインAIはサーバー設定と利用可能なアカウントに依存します。'},{question:'修了証や就職は保証されますか？',answer:'修了証や就職は保証されません。'}],
    footerPlatform:'プラットフォーム',footerDocuments:'ドキュメント',guest:'ゲストで始められます',courses:n=>`${n} コース`,categories:n=>`${n} 分野`,languages:n=>`${n} 言語`,
  },
  ko:{
    directions:'학습 분야',how:'학습 방법',plans:'요금제',questions:'자주 묻는 질문',signIn:'로그인',openMenu:'메뉴 열기',closeMenu:'메뉴 닫기',
    directionTitle:'학습 분야를 선택하세요',directionIntro:'기초부터 심화 주제까지 필요한 분야를 골라 보세요.',howTitle:'한 단계씩 배우기',
    steps:[{title:'수업',description:'새로운 주제를 이해합니다.'},{title:'코드',description:'배운 내용을 실습합니다.'},{title:'확인',description:'결과를 확인하고 오류를 수정합니다.'},{title:'다음 날',description:'이전 학습일을 마친 뒤 계속합니다.'}],
    insideTitle:'스스로 배우는 데 필요한 기능',inside:['코드 편집기와 검사','하루 단위 학습 계획','테스트와 면접','복습과 어려운 주제','노트와 진도','선택 가능한 AI Tutor','인터페이스 언어와 어두운 테마'],faqTitle:'자주 묻는 질문',
    faq:[{question:'게스트로 시작할 수 있나요?',answer:'네. 게스트 진도와 노트는 이 브라우저에 저장됩니다.'},{question:'계정이 필요한가요?',answer:'게스트 학습에는 필수가 아닙니다. 기기 간 동기화에는 계정과 설정된 서버가 필요합니다.'},{question:'AI Tutor는 어떻게 작동하나요?',answer:'먼저 강좌 자료에서 답을 찾습니다. 온라인 AI는 서버 설정과 사용 가능한 계정에 따라 달라집니다.'},{question:'수료증이나 취업이 보장되나요?',answer:'수료증과 취업은 보장되지 않습니다.'}],
    footerPlatform:'플랫폼',footerDocuments:'문서',guest:'게스트로 시작 가능',courses:n=>`${n}개 강좌`,categories:n=>`${n}개 분야`,languages:n=>`${n}개 언어`,
  },
};
