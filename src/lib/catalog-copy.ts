import { COURSE_CATALOG } from '@/content/courses/catalog';
import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';
import { courseDayCount } from './course-copy';
import { DESCRIPTIONS } from './course-descriptions';
import { text, type LocalizedText } from './localized-text';

// Technology/product names remain the proper names from the catalog. Subject
// names are translated explicitly; they never silently fall back to English.
const DISPLAY_NAMES: Partial<Record<CourseId, LocalizedText>> = {
  'javascript-pro': text(
    'JavaScript · Pro',
    'JavaScript · Pro',
    'JavaScript · Pro',
    'JavaScript · Pro',
  ),
  'backend-pro': text('Бэкенд · Pro', 'Backend · Pro', 'Бэкенд · Pro', 'Backend · Pro'),
  'architecture-expert': text(
    'Архитектура · Expert',
    'Architecture · Expert',
    'Меъмории система · Expert',
    'Arquitectura · Expert',
  ),
  'ux-pro': text('UX-дизайн · Pro', 'UX Design · Pro', 'Тарроҳии UX · Pro', 'Diseño UX · Pro'),
  'business-pro': text('Бизнес · Pro', 'Business · Pro', 'Бизнес · Pro', 'Negocios · Pro'),
  backend: text(
    'Серверная разработка',
    'Backend development',
    'Барномасозии серверӣ',
    'Desarrollo backend',
  ),
  mobile: text(
    'Мобильная разработка',
    'Mobile development',
    'Барномасозии мобилӣ',
    'Desarrollo móvil',
  ),
  'ux-design': text('UX/UI-дизайн', 'UX/UI Design', 'Тарҳрезии UX/UI', 'Diseño UX/UI'),
  'digital-marketing': text(
    'Цифровой маркетинг',
    'Digital Marketing',
    'Маркетинги рақамӣ',
    'Marketing digital',
  ),
  'data-analytics': text(
    'Аналитика данных',
    'Data Analytics',
    'Таҳлили додаҳо',
    'Análisis de datos',
  ),
  'business-foundations': text(
    'Основы бизнеса',
    'Business Foundations',
    'Асосҳои соҳибкорӣ',
    'Fundamentos de negocios',
  ),
  communication: text('Коммуникация', 'Communication', 'Муошират', 'Comunicación'),
  'content-creation': text(
    'Создание контента',
    'Content Creation',
    'Таҳияи муҳтаво',
    'Creación de contenido',
  ),
  'english-foundations': text(
    'Английский с нуля',
    'English Foundations',
    'Англисӣ аз сифр',
    'Inglés desde cero',
  ),
  'digital-literacy': text(
    'Цифровая грамотность',
    'Digital Literacy',
    'Саводи рақамӣ',
    'Alfabetización digital',
  ),
  'personal-productivity': text(
    'Личная продуктивность',
    'Personal Productivity',
    'Самаранокии шахсӣ',
    'Productividad personal',
  ),
  'management-foundations': text(
    'Основы управления',
    'Management Foundations',
    'Асосҳои идоракунӣ',
    'Fundamentos de gestión',
  ),
  'ai-fundamentals': text('Основы ИИ', 'AI Fundamentals', 'Асосҳои AI', 'Fundamentos de IA'),
  'context-engineering': text(
    'Инженерия контекста',
    'Context Engineering',
    'Муҳандисии контекст',
    'Ingeniería de contexto',
  ),
  'agent-harness': text('Каркас агентов', 'Agent Harness', 'Каркаси агентҳо', 'Arnés de agentes'),
};

const INTRODUCTION = text(
  'Вводный модуль',
  'Introductory module',
  'Модули муқаддимавӣ',
  'Módulo introductorio',
);

export function courseDisplayName(id: CourseId, locale: InterfaceLocale): string {
  const localized = DISPLAY_NAMES[id];
  if (localized) return localized[locale];
  // All remaining courses are named after their technology, not English UI text.
  return COURSE_CATALOG.find((course) => course.id === id)?.name ?? id;
}

export function courseDescription(id: CourseId, locale: InterfaceLocale): string {
  const description = DESCRIPTIONS[id][locale];
  const introductoryDays = COURSE_CATALOG.find((course) => course.id === id)?.introductoryDays;
  return introductoryDays
    ? `${INTRODUCTION[locale]} · ${courseDayCount(introductoryDays, locale)}. ${description}`
    : description;
}
