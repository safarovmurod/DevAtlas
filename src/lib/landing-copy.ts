import type { InterfaceLocale } from '@/lib/locale';

type LandingCopy = {
  directions: string;
  how: string;
  plans: string;
  questions: string;
  signIn: string;
  openMenu: string;
  closeMenu: string;
  startShort: string;
  directionTitle: string;
  directionIntro: string;
  howTitle: string;
  steps: { title: string; description: string }[];
  insideTitle: string;
  inside: string[];
  faqTitle: string;
  faq: { question: string; answer: string }[];
  footerPlatform: string;
  footerDocuments: string;
  guest: string;
  courses: (count: number) => string;
  categories: (count: number) => string;
  languages: (count: number) => string;
};
/** "5 курсов": Russian and Ukrainian plural forms. */
function slavicCount(count: number, locale: 'ru' | 'uk', one: string, few: string, many: string) {
  const form = new Intl.PluralRules(locale).select(count);
  return `${count} ${form === 'one' ? one : form === 'few' ? few : many}`;
}
/** Text of the public landing page. */
export const LANDING_COPY: Record<InterfaceLocale, LandingCopy> = {
  ru: {
    directions: 'Направления',
    how: 'Как это работает',
    plans: 'Тарифы',
    questions: 'Вопросы',
    signIn: 'Войти',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    startShort: 'Начать',
    directionTitle: 'Выберите своё направление',
    directionIntro: 'От первых шагов до углублённых тем — выбирайте то, что важно вам.',
    howTitle: 'Учёба шаг за шагом',
    steps: [
      { title: 'Урок', description: 'Разберитесь с новой темой.' },
      { title: 'Код', description: 'Примените знания в практике.' },
      { title: 'Проверка', description: 'Проверьте результат и исправьте ошибки.' },
      { title: 'Новый день', description: 'Продолжайте после завершения предыдущего дня.' },
    ],
    insideTitle: 'Всё для самостоятельной работы',
    inside: [
      'Редактор кода и проверки',
      'Учебный план по дням',
      'Тесты и интервью',
      'Повторение и сложные темы',
      'Заметки и прогресс',
      'AI Tutor по желанию',
      'Языки интерфейса и тёмная тема',
    ],
    faqTitle: 'Частые вопросы',
    faq: [
      {
        question: 'Можно ли начать как гость?',
        answer: 'Да. Гостевой прогресс и заметки хранятся в этом браузере.',
      },
      {
        question: 'Нужен ли аккаунт?',
        answer:
          'Для гостевого обучения аккаунт не обязателен. Для синхронизации между устройствами нужен аккаунт и настроенный сервер.',
      },
      {
        question: 'Как работает AI Tutor?',
        answer:
          'Сначала Tutor ищет ответ в материалах. Онлайн-AI зависит от настроек сервера и доступного аккаунта.',
      },
      {
        question: 'Есть ли сертификат или гарантия работы?',
        answer: 'Сертификат и трудоустройство не гарантируются.',
      },
    ],
    footerPlatform: 'Платформа',
    footerDocuments: 'Документы',
    guest: 'Можно начать как гость',
    courses: (n) => slavicCount(n, 'ru', 'курс', 'курса', 'курсов'),
    categories: (n) => slavicCount(n, 'ru', 'направление', 'направления', 'направлений'),
    languages: (n) => slavicCount(n, 'ru', 'язык', 'языка', 'языков'),
  },
  en: {
    directions: 'Learning paths',
    how: 'How it works',
    plans: 'Plans',
    questions: 'Questions',
    signIn: 'Sign in',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    startShort: 'Start',
    directionTitle: 'Choose your learning path',
    directionIntro: 'From first steps to advanced topics, choose what matters to you.',
    howTitle: 'Learning, step by step',
    steps: [
      { title: 'Lesson', description: 'Explore a new topic.' },
      { title: 'Code', description: 'Put your knowledge into practice.' },
      { title: 'Check', description: 'Check the result and correct mistakes.' },
      { title: 'Next day', description: 'Continue after completing the previous day.' },
    ],
    insideTitle: 'Everything for independent learning',
    inside: [
      'Code editor and checks',
      'A day-by-day study plan',
      'Tests and interviews',
      'Review and difficult topics',
      'Notes and progress',
      'Optional AI Tutor',
      'Interface languages and a dark theme',
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        question: 'Can I start as a guest?',
        answer: 'Yes. Guest progress and notes are stored in this browser.',
      },
      {
        question: 'Do I need an account?',
        answer:
          'An account is optional for guest learning. Syncing between devices requires an account and a configured server.',
      },
      {
        question: 'How does AI Tutor work?',
        answer:
          'Tutor first looks for answers in the course material. Online AI depends on server configuration and an available account.',
      },
      {
        question: 'Is a certificate or job guaranteed?',
        answer: 'A certificate and employment are not guaranteed.',
      },
    ],
    footerPlatform: 'Platform',
    footerDocuments: 'Documents',
    guest: 'Start as a guest',
    courses: (n) => `${n} ${n === 1 ? 'course' : 'courses'}`,
    categories: (n) => `${n} ${n === 1 ? 'path' : 'paths'}`,
    languages: (n) => `${n} ${n === 1 ? 'language' : 'languages'}`,
  },
  tg: {
    directions: 'Самтҳо',
    how: 'Чӣ тавр кор мекунад',
    plans: 'Тарифҳо',
    questions: 'Саволҳо',
    signIn: 'Ворид шудан',
    openMenu: 'Кушодани меню',
    closeMenu: 'Пӯшидани меню',
    startShort: 'Оғоз',
    directionTitle: 'Самти худро интихоб кунед',
    directionIntro: 'Аз қадамҳои аввал то мавзӯъҳои амиқ — чизи бароятон муҳимро интихоб кунед.',
    howTitle: 'Омӯзиш қадам ба қадам',
    steps: [
      { title: 'Дарс', description: 'Мавзӯи навро омӯзед.' },
      { title: 'Код', description: 'Донишро дар амал истифода баред.' },
      { title: 'Санҷиш', description: 'Натиҷаро санҷед ва хатоҳоро ислоҳ кунед.' },
      { title: 'Рӯзи нав', description: 'Баъд аз анҷоми рӯзи пешина идома диҳед.' },
    ],
    insideTitle: 'Ҳама чиз барои омӯзиши мустақил',
    inside: [
      'Муҳаррири код ва санҷишҳо',
      'Нақшаи омӯзиш аз рӯйи рӯзҳо',
      'Тестҳо ва мусоҳиба',
      'Такрор ва мавзӯъҳои душвор',
      'Ёддоштҳо ва пешрафт',
      'AI Tutor бо хоҳиш',
      'Забонҳои интерфейс ва мавзӯи торик',
    ],
    faqTitle: 'Саволҳои маъмул',
    faq: [
      {
        question: 'Метавонам ҳамчун меҳмон оғоз кунам?',
        answer: 'Бале. Пешрафт ва ёддоштҳои меҳмон дар ҳамин браузер нигоҳ дошта мешаванд.',
      },
      {
        question: 'Аккаунт лозим аст?',
        answer:
          'Барои омӯзиши меҳмон аккаунт ҳатмӣ нест. Барои ҳамоҳангсозӣ байни дастгоҳҳо аккаунт ва сервери танзимшуда лозиманд.',
      },
      {
        question: 'AI Tutor чӣ тавр кор мекунад?',
        answer:
          'Tutor аввал ҷавобро дар маводи курс меҷӯяд. AI-и онлайн аз танзимоти сервер ва аккаунти дастрас вобаста аст.',
      },
      {
        question: 'Сертификат ё кор кафолат дода мешавад?',
        answer: 'Сертификат ва бо кор таъмин шудан кафолат дода намешаванд.',
      },
    ],
    footerPlatform: 'Платформа',
    footerDocuments: 'Ҳуҷҷатҳо',
    guest: 'Оғоз ҳамчун меҳмон',
    courses: (n) => `${n} курс`,
    categories: (n) => `${n} самт`,
    languages: (n) => `${n} забон`,
  },
  uk: {
    directions: 'Напрями',
    how: 'Як це працює',
    plans: 'Тарифи',
    questions: 'Запитання',
    signIn: 'Увійти',
    openMenu: 'Відкрити меню',
    closeMenu: 'Закрити меню',
    startShort: 'Почати',
    directionTitle: 'Оберіть свій напрям',
    directionIntro: 'Від перших кроків до складніших тем — обирайте важливе для вас.',
    howTitle: 'Навчання крок за кроком',
    steps: [
      { title: 'Урок', description: 'Розберіться з новою темою.' },
      { title: 'Код', description: 'Застосуйте знання на практиці.' },
      { title: 'Перевірка', description: 'Перевірте результат і виправте помилки.' },
      { title: 'Новий день', description: 'Продовжуйте після завершення попереднього дня.' },
    ],
    insideTitle: 'Усе для самостійного навчання',
    inside: [
      'Редактор коду та перевірки',
      'Навчальний план за днями',
      'Тести та співбесіди',
      'Повторення та складні теми',
      'Нотатки й прогрес',
      'AI Tutor за бажанням',
      'Мови інтерфейсу і темна тема',
    ],
    faqTitle: 'Поширені запитання',
    faq: [
      {
        question: 'Чи можна почати як гість?',
        answer: 'Так. Прогрес і нотатки гостя зберігаються в цьому браузері.',
      },
      {
        question: 'Чи потрібен акаунт?',
        answer:
          'Для гостьового навчання акаунт необов’язковий. Для синхронізації між пристроями потрібні акаунт і налаштований сервер.',
      },
      {
        question: 'Як працює AI Tutor?',
        answer:
          'Спочатку Tutor шукає відповідь у матеріалах курсу. Онлайн-ШІ залежить від налаштувань сервера та доступного акаунта.',
      },
      {
        question: 'Чи гарантовано сертифікат або роботу?',
        answer: 'Сертифікат і працевлаштування не гарантуються.',
      },
    ],
    footerPlatform: 'Платформа',
    footerDocuments: 'Документи',
    guest: 'Можна почати як гість',
    courses: (n) => slavicCount(n, 'uk', 'курс', 'курси', 'курсів'),
    categories: (n) => slavicCount(n, 'uk', 'напрям', 'напрями', 'напрямів'),
    languages: (n) => slavicCount(n, 'uk', 'мова', 'мови', 'мов'),
  },
  ja: {
    directions: '学習分野',
    how: '学習の流れ',
    plans: 'プラン',
    questions: 'よくある質問',
    signIn: 'ログイン',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
    startShort: '始める',
    directionTitle: '学びたい分野を選ぶ',
    directionIntro: '基礎から応用まで、自分に合った分野を選びましょう。',
    howTitle: '一歩ずつ学ぶ',
    steps: [
      { title: 'レッスン', description: '新しいトピックを学びます。' },
      { title: 'コード', description: '学んだことを演習で試します。' },
      { title: '確認', description: '結果を確認し、間違いを直します。' },
      { title: '次の日', description: '前の日を終えたら次に進みます。' },
    ],
    insideTitle: '自分で学ぶための機能',
    inside: [
      'コードエディターとチェック',
      '日ごとの学習プラン',
      'テストと面接',
      '復習と苦手なトピック',
      'ノートと進捗',
      '任意のAI Tutor',
      '表示言語とダークテーマ',
    ],
    faqTitle: 'よくある質問',
    faq: [
      {
        question: 'ゲストとして始められますか？',
        answer: 'はい。ゲストの進捗とノートはこのブラウザーに保存されます。',
      },
      {
        question: 'アカウントは必要ですか？',
        answer:
          'ゲスト学習には必須ではありません。端末間の同期にはアカウントと設定済みのサーバーが必要です。',
      },
      {
        question: 'AI Tutorはどう動きますか？',
        answer:
          'まず教材から答えを探します。オンラインAIはサーバー設定と利用可能なアカウントに依存します。',
      },
      { question: '修了証や就職は保証されますか？', answer: '修了証や就職は保証されません。' },
    ],
    footerPlatform: 'プラットフォーム',
    footerDocuments: 'ドキュメント',
    guest: 'ゲストで始められます',
    courses: (n) => `${n} コース`,
    categories: (n) => `${n} 分野`,
    languages: (n) => `${n} 言語`,
  },
  ko: {
    directions: '학습 분야',
    how: '학습 방법',
    plans: '요금제',
    questions: '자주 묻는 질문',
    signIn: '로그인',
    openMenu: '메뉴 열기',
    closeMenu: '메뉴 닫기',
    startShort: '시작',
    directionTitle: '학습 분야를 선택하세요',
    directionIntro: '기초부터 심화 주제까지 필요한 분야를 골라 보세요.',
    howTitle: '한 단계씩 배우기',
    steps: [
      { title: '수업', description: '새로운 주제를 이해합니다.' },
      { title: '코드', description: '배운 내용을 실습합니다.' },
      { title: '확인', description: '결과를 확인하고 오류를 수정합니다.' },
      { title: '다음 날', description: '이전 학습일을 마친 뒤 계속합니다.' },
    ],
    insideTitle: '스스로 배우는 데 필요한 기능',
    inside: [
      '코드 편집기와 검사',
      '하루 단위 학습 계획',
      '테스트와 면접',
      '복습과 어려운 주제',
      '노트와 진도',
      '선택 가능한 AI Tutor',
      '인터페이스 언어와 어두운 테마',
    ],
    faqTitle: '자주 묻는 질문',
    faq: [
      {
        question: '게스트로 시작할 수 있나요?',
        answer: '네. 게스트 진도와 노트는 이 브라우저에 저장됩니다.',
      },
      {
        question: '계정이 필요한가요?',
        answer:
          '게스트 학습에는 필수가 아닙니다. 기기 간 동기화에는 계정과 설정된 서버가 필요합니다.',
      },
      {
        question: 'AI Tutor는 어떻게 작동하나요?',
        answer:
          '먼저 강좌 자료에서 답을 찾습니다. 온라인 AI는 서버 설정과 사용 가능한 계정에 따라 달라집니다.',
      },
      { question: '수료증이나 취업이 보장되나요?', answer: '수료증과 취업은 보장되지 않습니다.' },
    ],
    footerPlatform: '플랫폼',
    footerDocuments: '문서',
    guest: '게스트로 시작 가능',
    courses: (n) => `${n}개 강좌`,
    categories: (n) => `${n}개 분야`,
    languages: (n) => `${n}개 언어`,
  },
};
