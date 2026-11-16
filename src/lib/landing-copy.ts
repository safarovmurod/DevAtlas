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
  /** Text of the lesson card on the 3D computer screen. */
  screen: { lesson: string; text: string; progress: string; action: string; label: string };
  categories: (count: number) => string;
  languages: (count: number) => string;
};
/** "5 курсов": Russian plural forms. */
function slavicCount(count: number, locale: 'ru', one: string, few: string, many: string) {
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
    screen: {
      lesson: 'Урок',
      text: 'Короткое объяснение, пример и мини-задача на один день.',
      progress: 'Прогресс дня',
      action: 'Продолжить',
      label: 'На экране: карточка урока и выбор направления',
    },
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
    screen: {
      lesson: 'Lesson',
      text: 'A short explanation, an example and a small task for one day.',
      progress: 'Day progress',
      action: 'Continue',
      label: 'On screen: a lesson card and the choice of a learning path',
    },
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
    screen: {
      lesson: 'Дарс',
      text: 'Шарҳи кӯтоҳ, мисол ва масъалаи хурд барои як рӯз.',
      progress: 'Пешрафти рӯз',
      action: 'Идома додан',
      label: 'Дар экран: корти дарс ва интихоби самт',
    },
    categories: (n) => `${n} самт`,
    languages: (n) => `${n} забон`,
  },
  es: {
    directions: 'Rutas de aprendizaje',
    how: 'Cómo funciona',
    plans: 'Planes',
    questions: 'Preguntas',
    signIn: 'Entrar',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    startShort: 'Empezar',
    directionTitle: 'Elige tu ruta de aprendizaje',
    directionIntro: 'De los primeros pasos a los temas avanzados: elige lo que te importa.',
    howTitle: 'Aprender paso a paso',
    steps: [
      { title: 'Lección', description: 'Entiende un tema nuevo.' },
      { title: 'Código', description: 'Pon en práctica lo aprendido.' },
      { title: 'Revisión', description: 'Comprueba el resultado y corrige los errores.' },
      { title: 'Día nuevo', description: 'Sigue cuando termines el día anterior.' },
    ],
    insideTitle: 'Todo para estudiar por tu cuenta',
    inside: [
      'Editor de código y comprobaciones',
      'Plan de estudio día a día',
      'Pruebas y entrevistas',
      'Repaso y temas difíciles',
      'Notas y progreso',
      'AI Tutor opcional',
      'Idiomas de la interfaz y tema oscuro',
    ],
    faqTitle: 'Preguntas frecuentes',
    faq: [
      {
        question: '¿Puedo empezar como invitado?',
        answer: 'Sí. El progreso y las notas de invitado se guardan en este navegador.',
      },
      {
        question: '¿Necesito una cuenta?',
        answer:
          'Para aprender como invitado no hace falta cuenta. Para sincronizar entre dispositivos se necesita una cuenta y un servidor configurado.',
      },
      {
        question: '¿Cómo funciona AI Tutor?',
        answer:
          'Primero, Tutor busca la respuesta en los materiales del curso. La IA en línea depende de la configuración del servidor y de que haya una cuenta disponible.',
      },
      {
        question: '¿Hay certificado o garantía de empleo?',
        answer: 'No se garantiza ningún certificado ni empleo.',
      },
    ],
    footerPlatform: 'Plataforma',
    footerDocuments: 'Documentos',
    guest: 'Puedes empezar como invitado',
    courses: (n) => `${n} ${n === 1 ? 'curso' : 'cursos'}`,
    screen: {
      lesson: 'Lección',
      text: 'Una explicación breve, un ejemplo y una tarea pequeña para un día.',
      progress: 'Progreso del día',
      action: 'Continuar',
      label: 'En pantalla: una tarjeta de lección y la elección de ruta',
    },
    categories: (n) => `${n} ${n === 1 ? 'ruta' : 'rutas'}`,
    languages: (n) => `${n} ${n === 1 ? 'idioma' : 'idiomas'}`,
  },
};
