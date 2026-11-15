import type { InterfaceLocale } from '@/lib/locale';

type PublicLocaleCopy = {
  privacyLabel: string;
  termsLabel: string;
  start: string;
  eyebrow: string;
  heroLead: string;
  heroEmphasis: string;
  heroEnd: string;
  heroDescription: string;
  seePlatform: string;
  heroNote: string;
  featuresTitle: string;
  features: { title: string; description: string }[];
  ctaTitle: string;
  ctaDescription: string;
  ctaLink: string;
  title: string;
  description: string;
  privacy: {
    title: string;
    introduction: string;
    sections: { title: string; text: string }[];
    notice: string;
  };
  terms: {
    title: string;
    introduction: string;
    sections: { title: string; text: string }[];
    notice: string;
  };
};

export const PUBLIC_COPY: Record<InterfaceLocale, PublicLocaleCopy> = {
  tg: {
    privacyLabel: 'Махфият',
    termsLabel: 'Қоидаҳо',
    start: 'Оғоз кардан',
    eyebrow: 'Платформаи касбии омӯзиш',
    heroLead: 'Аз шавқи нав',
    heroEmphasis: 'то малакаи амалӣ',
    heroEnd: 'қадам ба қадам.',
    heroDescription:
      'Барномасозӣ, муҳандисии AI, дизайн, соҳибкорӣ ва маркетинг: самти худро интихоб кунед. DevAtlas дарсҳо, супоришҳои амалӣ ва пайгирии пешрафтро дар як ҷо ҷамъ мекунад.',
    seePlatform: 'Дидани платформа',
    heroNote:
      'Омӯзиш ҳамчун меҳмон ҳам имконпазир аст. Ҳамоҳангсозии абрӣ ва AI-и онлайн ба танзимоти сервер вобастаанд.',
    featuresTitle: 'Аз назария то амалия',
    features: [
      {
        title: 'Дарсҳои қадам ба қадам',
        description: 'Самти омӯзишро интихоб карда, мавзӯъҳоро қадам ба қадам аз худ кунед.',
      },
      {
        title: 'Супориш ва лоиҳа',
        description: 'Донишро дар амал истифода баред, натиҷаро санҷед ва пешрафтро бинед.',
      },
      {
        title: 'AI Tutor — ихтиёрӣ',
        description: 'Маводи маҳаллӣ бе API кор мекунад; AI-и онлайн танзими алоҳида мехоҳад.',
      },
    ],
    ctaTitle: 'Барои машқи аввал омодаед?',
    ctaDescription: 'Аз дарсҳо ва машқҳои мавҷуда оғоз кунед.',
    ctaLink: 'Ба дарсҳо',
    title: 'DevAtlas — омӯзиш бо амалия',
    description:
      'Платформаи омӯзиши малакаҳо: барномасозӣ, дизайн, соҳибкорӣ ва маркетинг бо дарсҳо ва супоришҳои амалӣ.',
    privacy: {
      title: 'Махфият',
      introduction:
        'DevAtlas платформаи омӯзишӣ аст. Пешрафти меҳмон дар браузер ва маълумоти аккаунт ҳангоми пайваст будани Supabase дар абр нигоҳ дошта мешаванд.',
      sections: [
        {
          title: 'Маълумоти аккаунт',
          text: 'Почтаи электронӣ, профил, ёддоштҳо, ҷавобҳо ва пешрафти омӯзишӣ метавонанд коркард шаванд. Ҳамоҳангсозии абрӣ аккаунти фаъол мехоҳад.',
        },
        {
          title: 'AI Tutor',
          text: 'Ҷавобҳои маводи платформа бе провайдери беруна дастрасанд. Ҳангоми фаъол будани AI-и онлайн савол ва контексти зарурӣ метавонад ба провайдер фиристода шавад.',
        },
        {
          title: 'Назорати маълумот',
          text: 'Маълумоти меҳмонро дар браузер идора кунед. Барои маълумоти аккаунт аз танзимоти аккаунт истифода баред.',
        },
      ],
      notice:
        'Ин шарҳи ибтидоӣ аст. Пеш аз оғози истифодаи оммавӣ оператор бояд маълумоти тамос, муҳлати нигоҳдорӣ ва ҳуҷҷатҳои ҳуқуқиро тасдиқ кунад.',
    },
    terms: {
      title: 'Қоидаҳои истифода',
      introduction:
        'DevAtlas платформаи омӯзишӣ аст. Машқ, тест ва ёрии AI кафолати сертификат ё корёбӣ нестанд.',
      sections: [
        {
          title: 'Аккаунт',
          text: 'Маълумоти воридшавиро махфӣ нигоҳ доред ва ба маълумоти дигарон беиҷозат дастрасӣ нагиред.',
        },
        {
          title: 'Имкониятҳои ихтиёрӣ',
          text: 'AI-и онлайн ва ҳамоҳангсозии абрӣ аз конфигуратсияи сервер ва провайдерҳо вобастаанд.',
        },
      ],
      notice:
        'Пеш аз истифодаи тиҷоратӣ шартҳои ниҳоӣ ва маълумоти оператор бояд аз нигоҳи ҳуқуқӣ тасдиқ шаванд.',
    },
  },
  ru: {
    privacyLabel: 'Конфиденциальность',
    termsLabel: 'Правила',
    start: 'Начать обучение',
    eyebrow: 'Платформа профессионального обучения',
    heroLead: 'От нового интереса',
    heroEmphasis: 'к полезному навыку',
    heroEnd: 'шаг за шагом.',
    heroDescription:
      'Программирование, ИИ-инженерия, дизайн, бизнес и маркетинг — выберите своё направление. DevAtlas объединяет понятные уроки, практические задания и отслеживание прогресса.',
    seePlatform: 'Посмотреть платформу',
    heroNote:
      'Можно учиться как гость. Облачная синхронизация и онлайн-AI зависят от настроек сервера.',
    featuresTitle: 'От теории к практике',
    features: [
      {
        title: 'Пошаговые уроки',
        description: 'Выберите направление и осваивайте новые темы по понятному учебному плану.',
      },
      {
        title: 'Задания и проекты',
        description: 'Применяйте знания на практике, проверяйте результат и следите за прогрессом.',
      },
      {
        title: 'AI Tutor — дополнительно',
        description: 'Локальные материалы работают без API; онлайн-AI требует настройки.',
      },
    ],
    ctaTitle: 'Готовы к первому упражнению?',
    ctaDescription: 'Начните с уже доступных уроков и задач.',
    ctaLink: 'К урокам',
    title: 'DevAtlas — обучение на практике',
    description:
      'Платформа для развития навыков: программирование, ИИ-инженерия, дизайн, бизнес и маркетинг с уроками и практическими заданиями.',
    privacy: {
      title: 'Конфиденциальность',
      introduction:
        'DevAtlas — образовательная платформа. Гостевой прогресс сохраняется в браузере, а данные аккаунта — в Supabase, если сервис настроен.',
      sections: [
        {
          title: 'Данные аккаунта',
          text: 'Могут обрабатываться email, профиль, заметки, ответы и учебный прогресс. Облачная синхронизация требует активного аккаунта.',
        },
        {
          title: 'AI Tutor',
          text: 'Ответы из встроенных материалов доступны без внешнего провайдера. При использовании настроенного онлайн-AI вопросы и необходимый контекст могут отправляться провайдеру.',
        },
        {
          title: 'Контроль данных',
          text: 'Локальные данные можно удалить в браузере. Данные аккаунта управляются через настройки аккаунта.',
        },
      ],
      notice:
        'Это предварительное описание. До публичного запуска оператор должен уточнить контакт, сроки хранения и юридические документы.',
    },
    terms: {
      title: 'Правила использования',
      introduction:
        'DevAtlas — учебная платформа. Упражнения, тесты и ответы AI не гарантируют сертификат или трудоустройство.',
      sections: [
        {
          title: 'Аккаунт',
          text: 'Не сообщайте другим данные входа и не пытайтесь получить чужие данные.',
        },
        {
          title: 'Дополнительные возможности',
          text: 'Онлайн-AI и облачная синхронизация зависят от настроек сервера и внешних провайдеров.',
        },
      ],
      notice: 'Перед коммерческим использованием нужны утверждённые условия и данные оператора.',
    },
  },
  en: {
    privacyLabel: 'Privacy',
    termsLabel: 'Terms',
    start: 'Start learning',
    eyebrow: 'Professional learning platform',
    heroLead: 'Turn your curiosity',
    heroEmphasis: 'into useful skills',
    heroEnd: 'one step at a time.',
    heroDescription:
      'Programming, AI engineering, design, business and marketing: choose your direction. DevAtlas brings together clear lessons, practical assignments and progress tracking.',
    seePlatform: 'Explore the platform',
    heroNote:
      'Guest learning is available. Cloud sync and online AI depend on server configuration.',
    featuresTitle: 'From theory to practice',
    features: [
      {
        title: 'Step-by-step lessons',
        description: 'Choose a direction and explore new topics with a clear study plan.',
      },
      {
        title: 'Assignments and projects',
        description: 'Put knowledge into practice, check your work and track your progress.',
      },
      {
        title: 'Optional AI Tutor',
        description: 'Local learning materials work without an API; online AI requires setup.',
      },
    ],
    ctaTitle: 'Ready for your first exercise?',
    ctaDescription: 'Start with the available lessons and practical assignments.',
    ctaLink: 'Go to lessons',
    title: 'DevAtlas — learn by doing',
    description:
      'Build skills in programming, AI engineering, design, business and marketing with lessons and practical assignments.',
    privacy: {
      title: 'Privacy',
      introduction:
        'DevAtlas is an educational platform. Guest progress is stored in your browser; account data is stored in Supabase when configured.',
      sections: [
        {
          title: 'Account data',
          text: 'Email address, profile, notes, answers and learning progress may be processed. Cloud synchronization requires an active account.',
        },
        {
          title: 'AI Tutor',
          text: 'Built-in learning answers work without a third-party provider. When configured online AI is used, your question and necessary context may be sent to the provider.',
        },
        {
          title: 'Data controls',
          text: 'You can manage guest data in your browser. Use account settings for account data.',
        },
      ],
      notice:
        'This is a preliminary overview. Before public release, the operator must confirm contact details, retention periods and final legal policies.',
    },
    terms: {
      title: 'Terms of use',
      introduction:
        'DevAtlas is a learning platform. Exercises, quizzes and AI support do not guarantee a certificate or employment.',
      sections: [
        {
          title: 'Account',
          text: 'Keep your credentials private and do not attempt to access another person’s data.',
        },
        {
          title: 'Optional features',
          text: 'Online AI and cloud synchronization depend on server configuration and external providers.',
        },
      ],
      notice: 'Final terms and operator details require legal review before commercial use.',
    },
  },
  es: {
    privacyLabel: 'Privacidad',
    termsLabel: 'Condiciones',
    start: 'Empezar a aprender',
    eyebrow: 'Plataforma de formación profesional',
    heroLead: 'De la curiosidad',
    heroEmphasis: 'a una habilidad útil',
    heroEnd: 'paso a paso.',
    heroDescription:
      'Programación, ingeniería de IA, diseño, negocios y marketing: elige tu camino. DevAtlas reúne lecciones claras, ejercicios prácticos y seguimiento del progreso.',
    seePlatform: 'Explorar la plataforma',
    heroNote:
      'Puedes aprender como invitado. La sincronización en la nube y la IA en línea dependen de la configuración del servidor.',
    featuresTitle: 'De la teoría a la práctica',
    features: [
      {
        title: 'Lecciones paso a paso',
        description: 'Elige un camino y aprende temas nuevos con un plan de estudio claro.',
      },
      {
        title: 'Tareas y proyectos',
        description: 'Aplica lo aprendido, comprueba tu trabajo y sigue tu progreso.',
      },
      {
        title: 'AI Tutor opcional',
        description:
          'Los materiales locales funcionan sin API; la IA en línea requiere configuración.',
      },
    ],
    ctaTitle: '¿Listo para tu primer ejercicio?',
    ctaDescription: 'Empieza con las lecciones y las tareas prácticas disponibles.',
    ctaLink: 'Ir a las lecciones',
    title: 'DevAtlas: aprende practicando',
    description:
      'Desarrolla habilidades en programación, ingeniería de IA, diseño, negocios y marketing con lecciones y tareas prácticas.',
    privacy: {
      title: 'Privacidad',
      introduction:
        'DevAtlas es una plataforma educativa. El progreso de invitado se guarda en tu navegador; los datos de la cuenta se guardan en Supabase cuando el servicio está configurado.',
      sections: [
        {
          title: 'Datos de la cuenta',
          text: 'Se pueden tratar tu correo, perfil, notas, respuestas y progreso de estudio. La sincronización en la nube requiere una cuenta activa.',
        },
        {
          title: 'AI Tutor',
          text: 'Las respuestas de los materiales integrados funcionan sin un proveedor externo. Si se usa la IA en línea configurada, tu pregunta y el contexto necesario pueden enviarse al proveedor.',
        },
        {
          title: 'Control de los datos',
          text: 'Puedes borrar los datos locales en tu navegador. Los datos de la cuenta se gestionan en los ajustes de la cuenta.',
        },
      ],
      notice:
        'Esta es una descripción preliminar. Antes del lanzamiento público, el operador debe confirmar el contacto, los plazos de conservación y los documentos legales.',
    },
    terms: {
      title: 'Condiciones de uso',
      introduction:
        'DevAtlas es una plataforma de aprendizaje. Los ejercicios, las pruebas y las respuestas de la IA no garantizan un certificado ni un empleo.',
      sections: [
        {
          title: 'Cuenta',
          text: 'No compartas tus datos de acceso ni intentes acceder a los datos de otras personas.',
        },
        {
          title: 'Funciones opcionales',
          text: 'La IA en línea y la sincronización en la nube dependen de la configuración del servidor y de proveedores externos.',
        },
      ],
      notice:
        'Antes de un uso comercial se necesitan condiciones aprobadas y los datos del operador.',
    },
  },
};

// The landing page text lives in landing-copy.ts.
export { LANDING_COPY } from './landing-copy';
