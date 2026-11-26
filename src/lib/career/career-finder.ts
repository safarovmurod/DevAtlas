import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';

export type CareerTrackId = 'frontend' | 'backend' | 'ai' | 'mobile' | 'design' | 'growth';

export type QuizOption = {
  id: string;
  label: Record<InterfaceLocale, string>;
  weights: Partial<Record<CareerTrackId, number>>;
};

export type QuizQuestion = {
  id: string;
  question: Record<InterfaceLocale, string>;
  options: QuizOption[];
};

export type CareerRecommendation = {
  id: CareerTrackId;
  title: Record<InterfaceLocale, string>;
  summary: Record<InterfaceLocale, string>;
  firstIncomeHint: Record<InterfaceLocale, string>;
  roadmap: CourseId[];
};

export const CAREER_QUESTIONS: QuizQuestion[] = [
  {
    id: 'goal',
    question: {
      tg: 'Мақсади асосии шумо чист?',
      ru: 'Какая у вас главная цель?',
      en: 'What is your main goal?',
      es: '¿Cuál es tu objetivo principal?',
    },
    options: [
      {
        id: 'web-ui',
        label: {
          tg: 'Сохтани сайтҳо ва интерфейсҳои зебо (Фриланс ё IT-ширкат)',
          ru: 'Создавать современные сайты и интерфейсы (фриланс или IT-компания)',
          en: 'Build modern websites & interactive UIs (freelance or tech job)',
          es: 'Crear sitios web e interfaces modernas',
        },
        weights: { frontend: 3, design: 2 },
      },
      {
        id: 'servers',
        label: {
          tg: 'Кор бо серверҳо, базаи маълумот, API ва логикаи мураккаб',
          ru: 'Работать с серверами, базами данных, API и сложной логикой',
          en: 'Build servers, databases, APIs, and scalable backend systems',
          es: 'Trabajar con servidores, bases de datos y APIs',
        },
        weights: { backend: 3, ai: 1 },
      },
      {
        id: 'ai-auto',
        label: {
          tg: 'Сохтани AI-агентҳо, ботҳо ва автоматизатсияи кор',
          ru: 'Создавать AI-агентов, ботов и автоматизацию процессов',
          en: 'Build AI agents, smart tools, and automated workflows',
          es: 'Crear agentes de IA y automatizaciones',
        },
        weights: { ai: 3, backend: 1 },
      },
      {
        id: 'biz-growth',
        label: {
          tg: 'Маркетинг, контент, аналитика ва рушди бизнес онлайн',
          ru: 'Маркетинг, контент, аналитика и рост онлайн-бизнеса',
          en: 'Digital marketing, content, analytics, and online business growth',
          es: 'Marketing digital, contenido y crecimiento de negocios',
        },
        weights: { growth: 3, design: 1 },
      },
    ],
  },
  {
    id: 'enjoy',
    question: {
      tg: 'Кадом намуди кор ба шумо бештар завқ мебахшад?',
      ru: 'Какой формат работы вам ближе всего?',
      en: 'What type of work do you enjoy most?',
      es: '¿Qué tipo de trabajo disfrutas más?',
    },
    options: [
      {
        id: 'visual',
        label: {
          tg: 'Дидани натиҷаи визуалӣ дар экран, рангҳо, UX ва аниматсия',
          ru: 'Видеть визуальный результат на экране: дизайн, UX и интерфейсы',
          en: 'Seeing instant visual results: layout, UX, and polish',
          es: 'Ver resultados visuales inmediatos y UX',
        },
        weights: { design: 3, frontend: 2 },
      },
      {
        id: 'mobile-apps',
        label: {
          tg: 'Сохтани барномаҳои мобилӣ барои Android ва iOS',
          ru: 'Делать мобильные приложения для Android и iOS',
          en: 'Building mobile apps people carry on Android & iOS',
          es: 'Crear apps móviles para Android e iOS',
        },
        weights: { mobile: 3, frontend: 1 },
      },
      {
        id: 'puzzles',
        label: {
          tg: 'Ҳалли масъалаҳои мантиқӣ, алгоритмҳо ва меъмории система',
          ru: 'Решать логические задачи, работать с данными и архитектурой',
          en: 'Solving logic puzzles, data pipelines, and system architecture',
          es: 'Resolver lógica, datos y arquitectura',
        },
        weights: { backend: 3, ai: 2 },
      },
      {
        id: 'people',
        label: {
          tg: 'Муошират бо одамон, фурӯш, реклама ва идоракунӣ',
          ru: 'Общение с людьми, реклама, контент и управление проектами',
          en: 'Communication, campaigns, content, and business strategy',
          es: 'Comunicación, campañas y estrategia',
        },
        weights: { growth: 3 },
      },
    ],
  },
  {
    id: 'experience',
    question: {
      tg: 'Сатҳи ҳозираи шумо чӣ гуна аст?',
      ru: 'Какой у вас сейчас уровень?',
      en: 'What is your current experience level?',
      es: '¿Cuál es tu nivel actual?',
    },
    options: [
      {
        id: 'zero',
        label: {
          tg: 'Аз сифр — мехоҳам қадам ба қадам ва сода ёд гирам',
          ru: 'С нуля — хочу понятный пошаговый план',
          en: 'Complete beginner — I want a clear step-by-step path',
          es: 'Desde cero — quiero un plan paso a paso',
        },
        weights: { frontend: 1, growth: 1, design: 1 },
      },
      {
        id: 'some-code',
        label: {
          tg: 'Асосҳои код ё компютерро медонам, мехоҳам ба сатҳи корӣ бароям',
          ru: 'Знаю основы, хочу выйти на уровень джуниора / заказов',
          en: 'Know the basics — ready to reach job / freelance level',
          es: 'Sé lo básico — quiero nivel laboral',
        },
        weights: { frontend: 1, backend: 2, mobile: 2 },
      },
      {
        id: 'tech-grow',
        label: {
          tg: 'Аллакай таҷриба дорам, мехоҳам AI ё архитектураи сатҳи боло омӯзам',
          ru: 'Уже есть опыт — хочу освоить AI-инженерию или архитектуру',
          en: 'Already technical — want to level up into AI or systems',
          es: 'Ya tengo experiencia — quiero IA o arquitectura',
        },
        weights: { ai: 3, backend: 2 },
      },
    ],
  },
  {
    id: 'product',
    question: {
      tg: 'Агар фардо лоиҳаи аввалатонро созед, он чӣ мешуд?',
      ru: 'Какой первый проект вы бы хотели собрать?',
      en: 'Which first project excites you most?',
      es: '¿Qué primer proyecto te emociona más?',
    },
    options: [
      {
        id: 'store-site',
        label: {
          tg: 'Мағозаи онлайн ё веб-барномаи тез бо React/Next.js',
          ru: 'Интернет-магазин или веб-сервис на React/Next.js',
          en: 'Fast e-commerce site or SaaS web app with React/Next.js',
          es: 'Tienda online o SaaS web con React/Next.js',
        },
        weights: { frontend: 3 },
      },
      {
        id: 'api-bot',
        label: {
          tg: 'API-и пурқувват, пардохтҳо ва базаи маълумот барои ширкат',
          ru: 'Надёжный API, платежи и база данных для сервиса',
          en: 'Reliable API, authentication, and database powering an app',
          es: 'API robusta con pagos y base de datos',
        },
        weights: { backend: 3 },
      },
      {
        id: 'ai-assistant',
        label: {
          tg: 'AI-ёрдамчии шахсӣ барои бизнес ё омӯзиш',
          ru: 'Умный AI-ассистент для бизнеса или учёбы',
          en: 'Custom AI assistant/agent for business or learning',
          es: 'Asistente de IA personalizado para negocios',
        },
        weights: { ai: 3 },
      },
      {
        id: 'phone-app',
        label: {
          tg: 'Барномаи мобилӣ барои хариду фурӯш ё хизматрасонӣ',
          ru: 'Мобильное приложение для доставки или сервиса',
          en: 'Mobile app for delivery, booking, or daily habits',
          es: 'Aplicación móvil de servicios o reservas',
        },
        weights: { mobile: 3 },
      },
    ],
  },
];

export const CAREER_TRACKS: Record<CareerTrackId, CareerRecommendation> = {
  frontend: {
    id: 'frontend',
    title: {
      tg: 'Frontend & Full-Stack Web Developer',
      ru: 'Frontend и Full-Stack веб-разработчик',
      en: 'Frontend & Full-Stack Web Developer',
      es: 'Desarrollador Web Frontend y Full-Stack',
    },
    summary: {
      tg: 'Интихоби беҳтарин барои дидани натиҷаи тез, сохтани сайтҳои замонавӣ ва гирифтани заказҳои аввалини фриланс ё кори дурдаст.',
      ru: 'Лучший выбор для быстрого видимого результата, создания современных веб-приложений и первых заказов на фрилансе или в IT-компании.',
      en: 'Ideal for rapid visual feedback, building modern React/Next.js web products, and landing your first freelance clients or junior role.',
      es: 'Ideal para ver resultados rápidos, construir apps con React/Next.js y conseguir tus primeros clientes o empleo.',
    },
    firstIncomeHint: {
      tg: 'Натиҷаи аввал: пас аз 60–90 рӯз метавонед сайтҳои landing ва React-барнома созед.',
      ru: 'Первый результат: через 60–90 дней сможете верстать и собирать рабочие React-проекты.',
      en: 'Milestone: build and deploy real interactive React web apps within 60–90 days.',
      es: 'Meta: construir y desplegar aplicaciones React reales en 60–90 días.',
    },
    roadmap: ['html', 'css', 'javascript-1', 'react', 'nextjs'],
  },
  backend: {
    id: 'backend',
    title: {
      tg: 'Backend & Systems Engineer',
      ru: 'Backend-разработчик и инженер систем',
      en: 'Backend & Systems Engineer',
      es: 'Ingeniero Backend y Sistemas',
    },
    summary: {
      tg: 'Шумо ба мантиқ, базаҳои маълумот, амният ва меъморӣ майл доред — яке аз баландмаоштарин самтҳо дар IT.',
      ru: 'Вам подходят логика, базы данных, безопасность и архитектура — одно из самых стабильных и высокооплачиваемых направлений.',
      en: 'You thrive on logic, databases, APIs, and reliability — one of the highest-demand engineering tracks.',
      es: 'Destacas en lógica, bases de datos y APIs: una de las áreas mejor pagadas en tecnología.',
    },
    firstIncomeHint: {
      tg: 'Натиҷаи аввал: сохтани REST API бо авторизатсия ва SQL барои стартапҳо.',
      ru: 'Первый результат: собственные REST API с авторизацией и SQL-базой для реальных сервисов.',
      en: 'Milestone: design and ship production REST APIs backed by SQL and authentication.',
      es: 'Meta: diseñar APIs REST reales con SQL y autenticación.',
    },
    roadmap: ['python', 'sql', 'nodejs', 'backend', 'backend-pro'],
  },
  ai: {
    id: 'ai',
    title: {
      tg: 'AI Engineer & Automation Builder',
      ru: 'AI-инженер и разработчик агентов',
      en: 'AI Engineer & Automation Builder',
      es: 'Ingeniero de IA y Automatización',
    },
    summary: {
      tg: 'Самти гармтарини соли 2026: сохтани системаҳои AI, Context Engineering ва агентҳое, ки кори ширкатҳоро автоматӣ мекунанд.',
      ru: 'Самое быстрорастущее направление: создание AI-агентов, Context Engineering и автоматизация реального бизнеса.',
      en: 'The fastest-growing track: build reliable AI agents, context engineering pipelines, and real business automation.',
      es: 'El área de mayor crecimiento: agentes de IA, ingeniería de contexto y automatización.',
    },
    firstIncomeHint: {
      tg: 'Натиҷаи аввал: сохтани AI-ёрдамчӣ ва автоматизатсия барои ширкатҳои маҳаллӣ ва хориҷӣ.',
      ru: 'Первый результат: запуск AI-ассистентов и инструментов автоматизации под заказ.',
      en: 'Milestone: ship grounded AI assistants and automated workflows for teams.',
      es: 'Meta: lanzar asistentes de IA y flujos automatizados reales.',
    },
    roadmap: ['python', 'ai-fundamentals', 'context-engineering', 'agent-harness'],
  },
  mobile: {
    id: 'mobile',
    title: {
      tg: 'Mobile App Developer (Android & iOS)',
      ru: 'Мобильный разработчик (Android и iOS)',
      en: 'Mobile App Developer (Android & iOS)',
      es: 'Desarrollador Móvil (Android e iOS)',
    },
    summary: {
      tg: 'Сохтани барномаҳои мобилӣ барои миллионҳо истифодабарандагони телефон — талаботи доимӣ дар бонкҳо ва стартапҳо.',
      ru: 'Разработка мобильных приложений для Android и iOS — высокий спрос в банках, финтехе и стартапах.',
      en: 'Build mobile apps for Android and iOS — strong demand across fintech, commerce, and startups.',
      es: 'Crea apps para Android e iOS con gran demanda en banca y startups.',
    },
    firstIncomeHint: {
      tg: 'Натиҷаи аввал: сохтани барномаи мобилии корӣ барои портфолио бо Kotlin ё Swift.',
      ru: 'Первый результат: собственное мобильное приложение в портфолио на Kotlin или Swift.',
      en: 'Milestone: build and publish your first portfolio mobile app in Kotlin or Swift.',
      es: 'Meta: publicar tu primera app móvil de portafolio.',
    },
    roadmap: ['mobile', 'kotlin', 'swift', 'git'],
  },
  design: {
    id: 'design',
    title: {
      tg: 'UI/UX & Product Designer',
      ru: 'UI/UX и продуктовый дизайнер',
      en: 'UI/UX & Product Designer',
      es: 'Diseñador UI/UX y de Producto',
    },
    summary: {
      tg: 'Омезиши эҷодкорӣ ва технология: тарроҳии сайтҳо ва барномаҳои қулай бе ниёз ба коди мураккаб дар марҳилаи аввал.',
      ru: 'Сочетание эстетики и логики продукта: проектирование удобных интерфейсов и дизайн-систем.',
      en: 'Blend visual craft and user psychology to design intuitive digital products and design systems.',
      es: 'Combina estética y psicología de usuario para diseñar productos digitales.',
    },
    firstIncomeHint: {
      tg: 'Натиҷаи аввал: 2–3 кейси тайёри UI/UX барои гирифтани заказҳои дизайн.',
      ru: 'Первый результат: 2–3 сильных дизайн-кейса для первых заказов на фрилансе.',
      en: 'Milestone: assemble 2–3 polished UX case studies ready for freelance or agency roles.',
      es: 'Meta: reunir 2–3 casos de estudio UX para clientes.',
    },
    roadmap: ['ux-design', 'ux-pro', 'html', 'css'],
  },
  growth: {
    id: 'growth',
    title: {
      tg: 'Digital Marketing, Analytics & Business',
      ru: 'Цифровой маркетинг, аналитика и бизнес',
      en: 'Digital Marketing, Analytics & Business',
      es: 'Marketing Digital, Analítica y Negocios',
    },
    summary: {
      tg: 'Барои онҳое, ки мехоҳанд муштариёнро ҷалб кунанд, контент созанд, маълумотро таҳлил намоянд ва бизнеси онлайн роҳандозӣ кунанд.',
      ru: 'Для тех, кто хочет привлекать клиентов, создавать контент, анализировать метрики и развивать онлайн-проекты.',
      en: 'Perfect for driving customer growth, content strategy, data-backed decisions, and launching online businesses.',
      es: 'Ideal para atraer clientes, crear contenido, analizar datos y lanzar negocios online.',
    },
    firstIncomeHint: {
      tg: 'Натиҷаи аввал: идоракунии реклама, контент ва аналитика барои тиҷоратҳо.',
      ru: 'Первый результат: запуск кампаний, контента и аналитики для малого и среднего бизнеса.',
      en: 'Milestone: run measurable campaigns, analytics dashboards, and content systems.',
      es: 'Meta: gestionar campañas, analítica y contenido para negocios.',
    },
    roadmap: ['digital-marketing', 'content-creation', 'data-analytics', 'business-foundations'],
  },
};

export function recommendCareerTrack(answers: Record<string, string>): CareerRecommendation {
  const scores: Record<CareerTrackId, number> = {
    frontend: 0,
    backend: 0,
    ai: 0,
    mobile: 0,
    design: 0,
    growth: 0,
  };

  for (const question of CAREER_QUESTIONS) {
    const chosenId = answers[question.id];
    const option = question.options.find((item) => item.id === chosenId);
    if (!option) continue;
    for (const [track, weight] of Object.entries(option.weights) as [CareerTrackId, number][]) {
      scores[track] += weight;
    }
  }

  let best: CareerTrackId = 'frontend';
  for (const track of Object.keys(scores) as CareerTrackId[]) {
    if (scores[track] > scores[best]) best = track;
  }
  return CAREER_TRACKS[best];
}
