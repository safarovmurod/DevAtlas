import type { InterfaceLocale } from '@/lib/locale';

export type LaptopStoryStep = {
  title: string;
  description: string;
  screenTitle: string;
  screenText: string;
};

export type LaptopStoryCopy = {
  intro: string;
  demo: string;
  controls: string;
  tasks: [string, string, string];
  steps: [LaptopStoryStep, LaptopStoryStep, LaptopStoryStep, LaptopStoryStep];
};

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
  story: LaptopStoryCopy;
  insideTitle: string;
  inside: string[];
  faqTitle: string;
  faq: { question: string; answer: string }[];
  footerPlatform: string;
  footerDocuments: string;
  guest: string;
  courses: (count: number) => string;
  /** Text of the lesson card on the 3D computer screen. */
  screen: { lesson: string; title: string; text: string; progress: string; action: string };
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
    story: {
      intro: 'Одна задача от объяснения до результата. Листайте страницу или выберите шаг.',
      demo: 'Пример урока',
      controls: 'Шаги примера',
      tasks: ['Читать', 'Практика', 'Повторить'],
      steps: [
        {
          title: 'Урок',
          description: 'На примере списка задач разберитесь, как работает фильтр.',
          screenTitle: 'Какие задачи ещё не готовы?',
          screenText: 'Оставьте в списке только незавершённые задачи.',
        },
        {
          title: 'Код',
          description: 'Напишите фильтр и запустите его на примере.',
          screenTitle: 'Оставьте незавершённые',
          screenText: 'filter() оставит задачу, если done равно false.',
        },
        {
          title: 'Проверка',
          description: 'Сравните результат с исходным списком: должны остаться две задачи.',
          screenTitle: 'Осталось две задачи',
          screenText: 'Выполненная задача больше не попадает в результат.',
        },
        {
          title: 'Новый день',
          description:
            'Возьмите тот же список и добавьте кнопку, которая отмечает задачу выполненной.',
          screenTitle: 'Добавьте кнопку «Готово»',
          screenText: 'Обновите статус задачи и проверьте, что она исчезла из списка.',
        },
      ],
    },
    insideTitle: 'Всё для самостоятельной работы',
    inside: [
      'Редактор кода и проверки',
      'Учебный план по дням',
      'Тесты и интервью',
      'Повторение и сложные темы',
      'Результаты и прогресс',
      'AI Tutor по желанию',
      'Языки интерфейса и тёмная тема',
    ],
    faqTitle: 'Частые вопросы',
    faq: [
      {
        question: 'Можно ли начать как гость?',
        answer: 'Да. Гостевой прогресс хранится в этом браузере.',
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
      title: 'Разберитесь с новой темой',
      text: 'Короткое объяснение, пример и мини-задача на один день.',
      progress: 'Прогресс дня',
      action: 'Продолжить',
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
    story: {
      intro: 'Follow one task from explanation to result. Scroll or choose a step.',
      demo: 'Sample lesson',
      controls: 'Demo steps',
      tasks: ['Read', 'Practice', 'Review'],
      steps: [
        {
          title: 'Lesson',
          description: 'Use a to-do list to see how filtering works.',
          screenTitle: 'Which tasks are still open?',
          screenText: 'Keep only the unfinished tasks in the list.',
        },
        {
          title: 'Code',
          description: 'Write the filter and run it on the sample list.',
          screenTitle: 'Keep the unfinished tasks',
          screenText: 'filter() keeps a task when done is false.',
        },
        {
          title: 'Check',
          description: 'Compare the result with the original list: two tasks should remain.',
          screenTitle: 'Two tasks remain',
          screenText: 'The completed task is no longer in the result.',
        },
        {
          title: 'Next day',
          description: 'Use the same list and add a button to mark a task complete.',
          screenTitle: 'Add a “Done” button',
          screenText: 'Update a task and check that it disappears from the list.',
        },
      ],
    },
    insideTitle: 'Everything for independent learning',
    inside: [
      'Code editor and checks',
      'A day-by-day study plan',
      'Tests and interviews',
      'Review and difficult topics',
      'Results and progress',
      'Optional AI Tutor',
      'Interface languages and a dark theme',
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        question: 'Can I start as a guest?',
        answer: 'Yes. Guest progress is stored in this browser.',
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
      title: 'Explore a new topic',
      text: 'A short explanation, an example and a small task for one day.',
      progress: 'Day progress',
      action: 'Continue',
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
    story: {
      intro: 'Як машқро аз шарҳ то натиҷа бинед. Ба поён равед ё қадамро интихоб кунед.',
      demo: 'Намунаи дарс',
      controls: 'Қадамҳои намуна',
      tasks: ['Хондан', 'Машқ', 'Такрор'],
      steps: [
        {
          title: 'Дарс',
          description: 'Бо рӯйхати вазифаҳо бинед, ки филтр чӣ хел кор мекунад.',
          screenTitle: 'Кадом вазифаҳо ҳоло тамом нашудаанд?',
          screenText: 'Дар рӯйхат фақат вазифаҳои нотамомро монед.',
        },
        {
          title: 'Код',
          description: 'Филтрро нависед ва дар рӯйхати намуна иҷро кунед.',
          screenTitle: 'Вазифаҳои нотамомро ҷудо кунед',
          screenText: 'filter() вазифаро нигоҳ медорад, агар done баробари false бошад.',
        },
        {
          title: 'Санҷиш',
          description: 'Натиҷаро бо рӯйхати аввал муқоиса кунед: бояд ду вазифа монад.',
          screenTitle: 'Ду вазифа монд',
          screenText: 'Вазифаи тамомшуда дигар дар натиҷа нест.',
        },
        {
          title: 'Рӯзи нав',
          description: 'Бо ҳамон рӯйхат идома диҳед: тугмаи «Тайёр»-ро илова кунед.',
          screenTitle: 'Тугмаи «Тайёр»-ро илова кунед',
          screenText: 'Вазифаро тамомшуда қайд кунед ва бинед, ки аз рӯйхат мебарояд.',
        },
      ],
    },
    insideTitle: 'Ҳама чиз барои омӯзиши мустақил',
    inside: [
      'Муҳаррири код ва санҷишҳо',
      'Нақшаи омӯзиш аз рӯйи рӯзҳо',
      'Тестҳо ва мусоҳиба',
      'Такрор ва мавзӯъҳои душвор',
      'Натиҷаҳо ва пешрафт',
      'AI Tutor бо хоҳиш',
      'Забонҳои интерфейс ва мавзӯи торик',
    ],
    faqTitle: 'Саволҳои маъмул',
    faq: [
      {
        question: 'Метавонам ҳамчун меҳмон оғоз кунам?',
        answer: 'Бале. Пешрафти меҳмон дар ҳамин браузер нигоҳ дошта мешавад.',
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
      title: 'Мавзӯи навро омӯзед',
      text: 'Шарҳи кӯтоҳ, мисол ва масъалаи хурд барои як рӯз.',
      progress: 'Пешрафти рӯз',
      action: 'Идома додан',
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
    story: {
      intro: 'Sigue una tarea desde la explicación hasta el resultado. Desplázate o elige un paso.',
      demo: 'Lección de ejemplo',
      controls: 'Pasos del ejemplo',
      tasks: ['Leer', 'Practicar', 'Repasar'],
      steps: [
        {
          title: 'Lección',
          description: 'Usa una lista de tareas para ver cómo funciona un filtro.',
          screenTitle: '¿Qué tareas quedan pendientes?',
          screenText: 'Conserva en la lista solo las tareas pendientes.',
        },
        {
          title: 'Código',
          description: 'Escribe el filtro y ejecútalo con la lista de ejemplo.',
          screenTitle: 'Filtra las tareas pendientes',
          screenText: 'filter() conserva una tarea si done es false.',
        },
        {
          title: 'Revisión',
          description: 'Compara el resultado con la lista original: deben quedar dos tareas.',
          screenTitle: 'Quedan dos tareas',
          screenText: 'La tarea terminada ya no aparece en el resultado.',
        },
        {
          title: 'Día nuevo',
          description: 'Usa la misma lista y añade un botón para marcar una tarea como terminada.',
          screenTitle: 'Añade un botón «Listo»',
          screenText: 'Actualiza la tarea y comprueba que desaparece de la lista.',
        },
      ],
    },
    insideTitle: 'Todo para estudiar por tu cuenta',
    inside: [
      'Editor de código y comprobaciones',
      'Plan de estudio día a día',
      'Pruebas y entrevistas',
      'Repaso y temas difíciles',
      'Resultados y progreso',
      'AI Tutor opcional',
      'Idiomas de la interfaz y tema oscuro',
    ],
    faqTitle: 'Preguntas frecuentes',
    faq: [
      {
        question: '¿Puedo empezar como invitado?',
        answer: 'Sí. El progreso de invitado se guarda en este navegador.',
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
      title: 'Entiende un tema nuevo',
      text: 'Una explicación breve, un ejemplo y una tarea pequeña para un día.',
      progress: 'Progreso del día',
      action: 'Continuar',
    },
    categories: (n) => `${n} ${n === 1 ? 'ruta' : 'rutas'}`,
    languages: (n) => `${n} ${n === 1 ? 'idioma' : 'idiomas'}`,
  },
};
