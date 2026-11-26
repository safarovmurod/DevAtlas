import type { InterfaceLocale } from '@/lib/locale';

export type BootcampItem = {
  id: string;
  priceUsd: number;
  durationDays: number;
  title: Record<InterfaceLocale, string>;
  summary: Record<InterfaceLocale, string>;
  outcomes: Record<InterfaceLocale, string[]>;
};

export type StarterOrderBrief = {
  id: string;
  level: 'Junior' | 'Intern' | 'Freelance';
  stack: string[];
  title: Record<InterfaceLocale, string>;
  deliverable: Record<InterfaceLocale, string>;
  relatedWorkshopOrCourse: string;
};

export const BOOTCAMPS: BootcampItem[] = [
  {
    id: 'bootcamp-frontend-freelance',
    priceUsd: 49,
    durationDays: 30,
    title: {
      tg: 'Марафони 30-рӯза: Frontend + Фриланси аввал',
      ru: '30-дневный буткемп: Frontend + первые заказы',
      en: '30-Day Bootcamp: Frontend & First Freelance Clients',
      es: 'Bootcamp 30 días: Frontend y primeros clientes',
    },
    summary: {
      tg: 'Дар 30 рӯз бо ментор 2 сайти воқеӣ месозед, code review мегиред ва профили фрилансро омода мекунед.',
      ru: 'За 30 дней под контролем ментора соберёте 2 боевых сайта, пройдёте code review и упакуете портфолио.',
      en: 'Ship 2 real client-grade web apps in 30 days with weekly mentor code reviews and portfolio polish.',
      es: 'Publica 2 sitios reales en 30 días con mentoría, code review y portafolio listo.',
    },
    outcomes: {
      tg: [
        '2 лоиҳаи зинда дар GitHub ва Vercel',
        '4 санҷиши шахсии code review бо ментор',
        'Профили тайёр дар DevAtlas Portfolio + QR-сертификат',
      ],
      ru: [
        '2 задеплоенных проекта на GitHub и Vercel',
        '4 живых code review с ментором',
        'Готовое портфолио DevAtlas + QR-сертификат',
      ],
      en: [
        '2 deployed apps on GitHub & Vercel',
        '4 mentor code-review checkpoints',
        'Polished DevAtlas Portfolio + QR Certificate',
      ],
      es: [
        '2 proyectos desplegados en GitHub y Vercel',
        '4 revisiones de código con mentor',
        'Portafolio DevAtlas + Certificado QR',
      ],
    },
  },
  {
    id: 'bootcamp-telegram-bots',
    priceUsd: 39,
    durationDays: 30,
    title: {
      tg: 'Марафони 30-рӯза: Telegram-ботҳо ва Mini Apps (Python)',
      ru: '30-дневный буткемп: Telegram-боты и Mini Apps',
      en: '30-Day Bootcamp: Telegram Bots & Mini Apps',
      es: 'Bootcamp 30 días: Bots de Telegram y Mini Apps',
    },
    summary: {
      tg: 'Сохтани ботҳои мағоза, қабули заказ, пардохт ва Mini App — серталабтарин заказ дар бозори ТҶ ва СНГ.',
      ru: 'Создание ботов-магазинов, приёма заявок и Mini Apps — самые востребованные заказы на рынке.',
      en: 'Build commercial Telegram shop bots, booking bots, and WebApp Mini Apps ready for paying clients.',
      es: 'Crea bots de tienda, reservas y Mini Apps de Telegram para clientes reales.',
    },
    outcomes: {
      tg: [
        'Боти воқеӣ бо меню, базаи маълумот ва админ-панел',
        'Пайвасти Webhook ва деплойи 24/7',
        'Шаблони шартнома ва нархгузорӣ барои мизоҷон',
      ],
      ru: [
        'Рабочий бот с базой данных, меню и админ-уведомлениями',
        'Настройка Webhook и стабильный деплой 24/7',
        'Шаблон оценки сроков и стоимости для клиентов',
      ],
      en: [
        'Production bot with database, inline keyboards, and admin alerts',
        'Webhook setup and 24/7 cloud deployment',
        'Client scoping & pricing template',
      ],
      es: [
        'Bot funcional con base de datos y alertas de admin',
        'Despliegue 24/7 con Webhook',
        'Plantilla de presupuestos para clientes',
      ],
    },
  },
  {
    id: 'bootcamp-ai-business',
    priceUsd: 59,
    durationDays: 30,
    title: {
      tg: 'Марафони 30-рӯза: AI-автоматизатсия барои бизнес (бе код)',
      ru: '30-дневный буткемп: AI-автоматизация для бизнеса',
      en: '30-Day Bootcamp: AI Automation & Agents for Business',
      es: 'Bootcamp 30 días: Automatización IA para negocios',
    },
    summary: {
      tg: 'Барои соҳибкорон, маркетологҳо ва фрилансерҳо: ботҳои дастгирӣ, автоматизатсияи CRM ва контент бо AI.',
      ru: 'Для предпринимателей и специалистов: AI-поддержка клиентов, автоматизация CRM и отчётов без сложного кода.',
      en: 'Build AI customer support assistants, CRM automations, and reporting pipelines for real businesses.',
      es: 'Crea asistentes de soporte IA, flujos CRM y automatización para empresas.',
    },
    outcomes: {
      tg: [
        '3 системаи автоматизатсияи омода барои тиҷорат',
        'Пайвасти AI бо Google Sheets ва Telegram',
        'Дастури фурӯши хизматрасонии AI ба ширкатҳо',
      ],
      ru: [
        '3 готовые бизнес-автоматизации (Telegram + Sheets + AI)',
        'Контроль бюджета и качества ответов AI',
        'Пошаговый план продажи внедрений компаниям',
      ],
      en: [
        '3 production business automations (Telegram + Sheets + AI)',
        'Budget & quality guardrails for reliable AI ops',
        'Playbook for pitching automation services',
      ],
      es: [
        '3 automatizaciones listas (Telegram + Sheets + IA)',
        'Control de calidad y presupuesto IA',
        'Guía para vender automatizaciones a pymes',
      ],
    },
  },
];

export const STARTER_BRIEFS: StarterOrderBrief[] = [
  {
    id: 'brief-shop-landing',
    level: 'Freelance',
    stack: ['HTML', 'CSS', 'Next.js', 'Tailwind'],
    title: {
      tg: 'Сайти визитка ва каталоги мағозаи маҳаллӣ бо тугмаи заказ дар Telegram',
      ru: 'Лендинг-каталог для локального магазина с кнопкой заказа в Telegram',
      en: 'Local shop storefront landing page with Telegram checkout inquiry',
      es: 'Catálogo web para tienda local con pedido por Telegram',
    },
    deliverable: {
      tg: 'Саҳифаи адаптивӣ (mobile + desktop), рӯйхати маҳсулот, формаи дархост ва деплой.',
      ru: 'Адаптивный сайт, каталог товаров, форма заявки и деплой на Vercel.',
      en: 'Responsive mobile-first page, product grid, inquiry form, and live deploy.',
      es: 'Sitio responsivo, catálogo, formulario y despliegue.',
    },
    relatedWorkshopOrCourse: '/workshops/nocode-websites',
  },
  {
    id: 'brief-tg-booking-bot',
    level: 'Junior',
    stack: ['Python', 'Telegram Bot', 'SQLite'],
    title: {
      tg: 'Telegram-боти сабти номи мизоҷон барои салон ё клиника',
      ru: 'Telegram-бот онлайн-записи для клиники, барбершопа или курсов',
      en: 'Telegram appointment booking bot for a clinic or training center',
      es: 'Bot de reservas en Telegram para clínica o academia',
    },
    deliverable: {
      tg: 'Интихоби хизмат, вақт, сабт дар SQLite ва огоҳкунӣ ба админ.',
      ru: 'Выбор услуги и времени, сохранение в БД и уведомление администратору.',
      en: 'Service/slot picker, SQLite storage, and instant admin alert.',
      es: 'Selector de horario, guardado en SQLite y alerta al admin.',
    },
    relatedWorkshopOrCourse: '/workshops/telegram-bots',
  },
  {
    id: 'brief-sales-dashboard',
    level: 'Intern',
    stack: ['Excel / Sheets', 'SQL', 'Data Analytics'],
    title: {
      tg: 'Дашборди фурӯши моҳона ва ҳисоботи автоматии хароҷот',
      ru: 'Дашборд ежемесячных продаж и автоматический отчёт расходов',
      en: 'Monthly sales KPI dashboard & automated expense tracker',
      es: 'Panel mensual de ventas y reporte automático de gastos',
    },
    deliverable: {
      tg: 'Ҷадвали тоза бо XLOOKUP, Pivot, графикҳо ва формулаҳои худкор.',
      ru: 'Чистая таблица с XLOOKUP, сводными графиками и автоподсчётом маржи.',
      en: 'Clean workbook with XLOOKUP, pivot charts, and automated margin KPIs.',
      es: 'Hoja limpia con XLOOKUP, tablas dinámicas y KPIs.',
    },
    relatedWorkshopOrCourse: '/workshops/excel-sheets-ai',
  },
];

export function estimateClassroomPriceUsd(seats: number): {
  perSeatUsd: number;
  monthlyTotalUsd: number;
} {
  const safeSeats = Math.max(5, Math.min(2000, Math.round(seats)));
  const perSeatUsd = safeSeats >= 100 ? 2.5 : safeSeats >= 30 ? 3 : 4;
  return {
    perSeatUsd,
    monthlyTotalUsd: Math.round(safeSeats * perSeatUsd),
  };
}
