import type { InterfaceLocale } from '@/lib/locale';

/** Navigation taxonomy only: categories do not imply a published course or a paid entitlement. */
export const COURSE_CATEGORY_IDS = [
  'programming',
  'ai',
  'design',
  'marketing',
  'analytics',
  'business',
  'soft-skills',
  'content',
  'languages',
  'kids',
  'lifestyle',
] as const;
export type CourseCategoryId = (typeof COURSE_CATEGORY_IDS)[number];
export const PROGRAMMING_SUBTRACK_IDS = [
  'frontend',
  'backend',
  'mobile',
  'languages',
  'databases',
  'tools',
  'algorithms',
] as const;
export type ProgrammingSubtrackId = (typeof PROGRAMMING_SUBTRACK_IDS)[number];
type Labels = Record<InterfaceLocale, string>;

export const COURSE_CATEGORIES: { id: CourseCategoryId; symbol: string; labels: Labels }[] = [
  {
    id: 'programming',
    symbol: '</>',
    labels: {
      ru: 'Программирование',
      tg: 'Барномасозӣ',
      en: 'Programming',
      es: 'Programación',
    },
  },
  {
    id: 'ai',
    symbol: '✳',
    labels: {
      ru: 'ИИ-инженерия',
      tg: 'Муҳандисии AI',
      en: 'AI Engineering',
      es: 'Ingeniería de IA',
    },
  },
  {
    id: 'design',
    symbol: '✦',
    labels: {
      ru: 'Дизайн',
      tg: 'Тарроҳӣ',
      en: 'Design',
      es: 'Diseño',
    },
  },
  {
    id: 'marketing',
    symbol: '↗',
    labels: {
      ru: 'Маркетинг',
      tg: 'Маркетинг',
      en: 'Marketing',
      es: 'Marketing',
    },
  },
  {
    id: 'analytics',
    symbol: '▥',
    labels: {
      ru: 'Аналитика',
      tg: 'Таҳлили маълумот',
      en: 'Analytics',
      es: 'Analítica',
    },
  },
  {
    id: 'business',
    symbol: '◇',
    labels: {
      ru: 'Бизнес и управление',
      tg: 'Бизнес ва идоракунӣ',
      en: 'Business and management',
      es: 'Negocios y gestión',
    },
  },
  {
    id: 'soft-skills',
    symbol: '◎',
    labels: {
      ru: 'Гибкие навыки',
      tg: 'Малакаҳои муошират ва ҳамкорӣ',
      en: 'Soft skills',
      es: 'Habilidades blandas',
    },
  },
  {
    id: 'content',
    symbol: 'Aa',
    labels: {
      ru: 'Создание контента',
      tg: 'Эҷоди муҳтаво',
      en: 'Content creation',
      es: 'Creación de contenido',
    },
  },
  {
    id: 'languages',
    symbol: '文',
    labels: {
      ru: 'Иностранные языки',
      tg: 'Забонҳои хориҷӣ',
      en: 'Foreign languages',
      es: 'Idiomas extranjeros',
    },
  },
  {
    id: 'kids',
    symbol: '☆',
    labels: {
      ru: 'Для детей',
      tg: 'Барои кӯдакон',
      en: 'For children',
      es: 'Para niños',
    },
  },
  {
    id: 'lifestyle',
    symbol: '☀',
    labels: {
      ru: 'Образ жизни',
      tg: 'Тарзи зиндагӣ',
      en: 'Lifestyle',
      es: 'Estilo de vida',
    },
  },
];

export const PROGRAMMING_SUBTRACKS: {
  id: ProgrammingSubtrackId;
  symbol: string;
  labels: Labels;
}[] = [
  {
    id: 'frontend',
    symbol: '</>',
    labels: {
      ru: 'Фронтенд',
      tg: 'Фронтенд',
      en: 'Frontend',
      es: 'Frontend',
    },
  },
  {
    id: 'backend',
    symbol: 'API',
    labels: {
      ru: 'Бэкенд',
      tg: 'Бэкенд',
      en: 'Backend',
      es: 'Backend',
    },
  },
  {
    id: 'mobile',
    symbol: 'App',
    labels: {
      ru: 'Мобильная разработка',
      tg: 'Сохтани барномаҳои мобилӣ',
      en: 'Mobile development',
      es: 'Desarrollo móvil',
    },
  },
  {
    id: 'languages',
    symbol: '{ }',
    labels: {
      ru: 'Языки программирования',
      tg: 'Забонҳои барномасозӣ',
      en: 'Programming languages',
      es: 'Lenguajes de programación',
    },
  },
  {
    id: 'databases',
    symbol: 'DB',
    labels: {
      ru: 'Базы данных',
      tg: 'Пойгоҳҳои додаҳо',
      en: 'Databases',
      es: 'Bases de datos',
    },
  },
  {
    id: 'tools',
    symbol: '>_',
    labels: {
      ru: 'Инструменты',
      tg: 'Абзорҳо',
      en: 'Tools',
      es: 'Herramientas',
    },
  },
  {
    id: 'algorithms',
    symbol: 'Σ',
    labels: {
      ru: 'Алгоритмы',
      tg: 'Алгоритмҳо',
      en: 'Algorithms',
      es: 'Algoritmos',
    },
  },
];

export function categoryLabel(id: CourseCategoryId, locale: InterfaceLocale): string {
  return COURSE_CATEGORIES.find((category) => category.id === id)!.labels[locale];
}
export function subtrackLabel(id: ProgrammingSubtrackId, locale: InterfaceLocale): string {
  return PROGRAMMING_SUBTRACKS.find((subtrack) => subtrack.id === id)!.labels[locale];
}
