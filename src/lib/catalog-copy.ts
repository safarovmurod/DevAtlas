import { COURSE_CATALOG } from '@/content/courses/catalog';
import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';
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
    'JavaScript · Pro',
    'JavaScript · Pro',
  ),
  'backend-pro': text(
    'Бэкенд · Pro',
    'Backend · Pro',
    'Бэкенд · Pro',
    'Бекенд · Pro',
    'バックエンド · Pro',
    '백엔드 · Pro',
  ),
  'architecture-expert': text(
    'Архитектура · Expert',
    'Architecture · Expert',
    'Меъмории система · Expert',
    'Архітектура · Expert',
    'システム設計 · Expert',
    '시스템 설계 · Expert',
  ),
  'ux-pro': text(
    'UX-дизайн · Pro',
    'UX Design · Pro',
    'Тарроҳии UX · Pro',
    'UX-дизайн · Pro',
    'UXデザイン · Pro',
    'UX 디자인 · Pro',
  ),
  'business-pro': text(
    'Бизнес · Pro',
    'Business · Pro',
    'Бизнес · Pro',
    'Бізнес · Pro',
    'ビジネス · Pro',
    '비즈니스 · Pro',
  ),
  backend: text(
    'Серверная разработка',
    'Backend development',
    'Барномасозии серверӣ',
    'Серверна розробка',
    'バックエンド開発',
    '백엔드 개발',
  ),
  mobile: text(
    'Мобильная разработка',
    'Mobile development',
    'Барномасозии мобилӣ',
    'Мобільна розробка',
    'モバイルアプリ開発',
    '모바일 앱 개발',
  ),
  'ux-design': text(
    'UX/UI-дизайн',
    'UX/UI Design',
    'Тарҳрезии UX/UI',
    'UX/UI-дизайн',
    'UX/UIデザイン',
    'UX/UI 디자인',
  ),
  'digital-marketing': text(
    'Цифровой маркетинг',
    'Digital Marketing',
    'Маркетинги рақамӣ',
    'Цифровий маркетинг',
    'デジタルマーケティング',
    '디지털 마케팅',
  ),
  'data-analytics': text(
    'Аналитика данных',
    'Data Analytics',
    'Таҳлили додаҳо',
    'Аналітика даних',
    'データ分析',
    '데이터 분석',
  ),
  'business-foundations': text(
    'Основы бизнеса',
    'Business Foundations',
    'Асосҳои соҳибкорӣ',
    'Основи бізнесу',
    'ビジネスの基礎',
    '비즈니스 기초',
  ),
  communication: text(
    'Коммуникация',
    'Communication',
    'Муошират',
    'Комунікація',
    'コミュニケーション',
    '의사소통',
  ),
  'content-creation': text(
    'Создание контента',
    'Content Creation',
    'Таҳияи муҳтаво',
    'Створення контенту',
    'コンテンツ制作',
    '콘텐츠 제작',
  ),
  'english-foundations': text(
    'Английский с нуля',
    'English Foundations',
    'Англисӣ аз сифр',
    'Англійська з нуля',
    'はじめての英語',
    '영어 기초',
  ),
  'digital-literacy': text(
    'Цифровая грамотность',
    'Digital Literacy',
    'Саводи рақамӣ',
    'Цифрова грамотність',
    'デジタルリテラシー',
    '디지털 활용 기초',
  ),
  'personal-productivity': text(
    'Личная продуктивность',
    'Personal Productivity',
    'Самаранокии шахсӣ',
    'Особиста продуктивність',
    '自己管理と生産性',
    '자기 관리와 생산성',
  ),
  'management-foundations': text(
    'Основы управления',
    'Management Foundations',
    'Асосҳои идоракунӣ',
    'Основи управління',
    'マネジメントの基礎',
    '관리의 기초',
  ),
  'ai-fundamentals': text(
    'Основы ИИ',
    'AI Fundamentals',
    'Асосҳои AI',
    'Основи ШІ',
    'AIの基礎',
    'AI 기초',
  ),
  'context-engineering': text(
    'Инженерия контекста',
    'Context Engineering',
    'Муҳандисии контекст',
    'Інженерія контексту',
    'コンテキストエンジニアリング',
    '컨텍스트 엔지니어링',
  ),
  'agent-harness': text(
    'Каркас агентов',
    'Agent Harness',
    'Каркаси агентҳо',
    'Каркас агентів',
    'エージェントハーネス',
    '에이전트 하네스',
  ),
};

const INTRODUCTION = text(
  'Вводный модуль · 2 дня.',
  'Introductory module · 2 days.',
  'Модули муқаддимавӣ · 2 рӯз.',
  'Вступний модуль · 2 дні.',
  '2日間の入門モジュール。',
  '2일 입문 모듈.',
);

export function courseDisplayName(id: CourseId, locale: InterfaceLocale): string {
  const localized = DISPLAY_NAMES[id];
  if (localized) return localized[locale];
  // All remaining courses are named after their technology, not English UI text.
  return COURSE_CATALOG.find((course) => course.id === id)?.name ?? id;
}

export function courseDescription(id: CourseId, locale: InterfaceLocale): string {
  const description = DESCRIPTIONS[id][locale];
  return COURSE_CATALOG.find((course) => course.id === id)?.introductoryDays === 2
    ? `${INTRODUCTION[locale]} ${description}`
    : description;
}
