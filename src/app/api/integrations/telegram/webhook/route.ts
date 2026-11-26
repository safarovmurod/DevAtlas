import { NextResponse } from 'next/server';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  answerTelegramCallback,
  editTelegramCard,
  escapeTelegramHtml,
  isTelegramBotConfigured,
  resolveSiteOrigin,
  sendTelegramMessage,
  sendTelegramPhoto,
  type TelegramInlineButton,
} from '@/lib/integrations/telegram-notify';

export type BotLang = 'ru' | 'tg' | 'en';
export type BotView = 'lang' | 'home' | 'courses' | 'workshops' | 'career' | 'arena' | 'plans' | 'help';

type TelegramUser = {
  first_name?: string;
  username?: string;
  language_code?: string;
};

type TelegramUpdate = {
  message?: {
    chat?: { id?: number };
    from?: TelegramUser;
    text?: string;
  };
  callback_query?: {
    id?: string;
    from?: TelegramUser;
    data?: string;
    message?: {
      message_id?: number;
      chat?: { id?: number };
      photo?: unknown[];
    };
  };
};

function isHttpsOrigin(origin: string): boolean {
  return /^https:\/\/[^/\s]+/i.test(origin) && !/localhost|127\.0\.0\.1/i.test(origin);
}

export function resolveBotLang(languageCode?: string | null): BotLang {
  const code = languageCode?.toLowerCase() ?? '';
  if (code.startsWith('en')) return 'en';
  if (code.startsWith('tg')) return 'tg';
  return 'ru';
}

export function buildLanguagePicker(params: { firstName?: string; refCode?: string }): {
  text: string;
  buttons: TelegramInlineButton[][];
  withBanner: boolean;
} {
  const safeName = params.firstName ? escapeTelegramHtml(params.firstName.trim()) : '';
  const refSuffix = params.refCode ? `:${params.refCode}` : '';
  const header = safeName ? `<b>DevAtlas</b> · ${safeName}` : '<b>DevAtlas</b> — Code · AI · Career';

  return {
    withBanner: true,
    text:
      `${header}\n\n` +
      `<blockquote>🇷🇺 Выберите язык интерфейса\n` +
      `🇹🇯 Забони интерфейсро интихоб кунед\n` +
      `🇬🇧 Choose your interface language</blockquote>`,
    buttons: [
      [
        { text: '🇷🇺 Русский', callback_data: `lang:ru${refSuffix}` },
        { text: '🇹🇯 Тоҷикӣ', callback_data: `lang:tg${refSuffix}` },
      ],
      [{ text: '🇬🇧 English', callback_data: `lang:en${refSuffix}` }],
    ],
  };
}

export function buildTelegramView(params: {
  view: BotView;
  lang: BotLang;
  origin: string;
  firstName?: string;
  refCode?: string;
  remindersEnabled?: boolean;
}): {
  text: string;
  buttons: TelegramInlineButton[][];
  withBanner: boolean;
} {
  const { view, lang, origin, refCode } = params;
  if (view === 'lang') {
    return buildLanguagePicker({ firstName: params.firstName, refCode });
  }

  const safeName = params.firstName ? escapeTelegramHtml(params.firstName.trim()) : '';
  const hasHttps = isHttpsOrigin(origin);
  const appBtn = (path: string, label: string): TelegramInlineButton =>
    hasHttps
      ? { text: label, web_app: { url: `${origin}${path}` } }
      : { text: label, url: `${origin}${path}` };
  const navBtn = (target: BotView, targetLang: BotLang, label: string): TelegramInlineButton => ({
    text: label,
    callback_data: `view:${target}:${targetLang}`,
  });

  const backLabel: Record<BotLang, string> = {
    ru: '← Главное меню',
    tg: '← Менюи асосӣ',
    en: '← Main Menu',
  };
  const langLabel: Record<BotLang, string> = {
    ru: '🌐 Сменить язык',
    tg: '🌐 Ивази забон',
    en: '🌐 Language',
  };
  const backRow: TelegramInlineButton[] = [
    navBtn('home', lang, backLabel[lang]),
    navBtn('lang', lang, langLabel[lang]),
  ];

  if (view === 'courses') {
    const textByLang: Record<BotLang, string> = {
      ru:
        `<b>DevAtlas · 43 структурированных курса</b>\n\n` +
        `<blockquote>• <b>Frontend и Web</b>: HTML, CSS, JavaScript, TypeScript, React (60 дн.), Next.js\n` +
        `• <b>Backend и данные</b>: Python, Node.js, SQL, MongoDB, Go, Rust, Java, C#, Kotlin, Swift\n` +
        `• <b>AI и карьера</b>: AI-инженерия, UX-дизайн, Аналитика, Маркетинг, Бизнес, Английский</blockquote>\n\n` +
        `В каждом дне — понятная теория, практика в редакторе и фиксация прогресса.`,
      tg:
        `<b>DevAtlas · 43 курси сохторӣ</b>\n\n` +
        `<blockquote>• <b>Frontend ва Web</b>: HTML, CSS, JavaScript, TypeScript, React (60 рӯз), Next.js\n` +
        `• <b>Backend ва маълумот</b>: Python, Node.js, SQL, MongoDB, Go, Rust, Java, C#, Kotlin, Swift\n` +
        `• <b>AI ва карьера</b>: AI-муҳандисӣ, UX-дизайн, Аналитика, Маркетинг, Бизнес, Англисӣ</blockquote>\n\n` +
        `Дар ҳар рӯз назарияи фаҳмо, машқи код ва назорати пешрафт ҳаст.`,
      en:
        `<b>DevAtlas · 43 Structured Courses</b>\n\n` +
        `<blockquote>• <b>Frontend &amp; Web</b>: HTML, CSS, JavaScript, TypeScript, React (60 days), Next.js\n` +
        `• <b>Backend &amp; Data</b>: Python, Node.js, SQL, MongoDB, Go, Rust, Java, C#, Kotlin, Swift\n` +
        `• <b>AI &amp; Career</b>: AI Engineering, UX Design, Analytics, Marketing, Business, English</blockquote>\n\n` +
        `Every day includes clear theory, interactive code checks, and progress tracking.`,
    };
    const openLabel: Record<BotLang, string> = {
      ru: 'Открыть каталог курсов',
      tg: 'Кушодани каталоги курсҳо',
      en: 'Open Course Catalog',
    };
    const sandboxLabel: Record<BotLang, string> = {
      ru: 'Code Sandbox (11 языков)',
      tg: 'Code Sandbox (11 забон)',
      en: 'Code Sandbox (11 langs)',
    };
    const progressLabel: Record<BotLang, string> = {
      ru: 'Мой прогресс',
      tg: 'Пешрафти ман',
      en: 'My Progress',
    };
    return {
      withBanner: false,
      text: textByLang[lang],
      buttons: [
        [appBtn('/courses', openLabel[lang])],
        [appBtn('/sandbox', sandboxLabel[lang]), appBtn('/progress', progressLabel[lang])],
        backRow,
      ],
    };
  }

  if (view === 'workshops') {
    const textByLang: Record<BotLang, string> = {
      ru:
        `<b>DevAtlas · 6 востребованных воркшопов</b>\n\n` +
        `<blockquote>1. Создание Telegram-ботов и Mini Apps\n` +
        `2. Фриланс с нуля: Upwork, Kwork и Fiverr\n` +
        `3. AI для работы и бизнеса без кода (n8n / ChatGPT)\n` +
        `4. Быстрые сайты на No-Code + AI (Framer / Tilda)\n` +
        `5. Excel + Google Sheets + AI для офиса и учёта\n` +
        `6. Программирование для детей и подростков (9–15 лет)</blockquote>\n\n` +
        `24 интерактивных урока с шаблонами, тестами и практикой.`,
      tg:
        `<b>DevAtlas · 6 воркшопи талаботи баланд</b>\n\n` +
        `<blockquote>1. Сохтани Telegram-ботҳо ва Mini Apps\n` +
        `2. Фриланс аз сифр: Upwork, Kwork ва Fiverr\n` +
        `3. AI барои кор ва бизнес бе код (n8n / ChatGPT)\n` +
        `4. Сайтҳои тез бо No-Code + AI (Framer / Tilda)\n` +
        `5. Excel + Google Sheets + AI барои офис ва муҳосибот\n` +
        `6. Барномасозӣ барои кӯдакон ва наврасон (9–15 сол)</blockquote>\n\n` +
        `24 дарси интерактивӣ бо шаблон, тест ва амалия.`,
      en:
        `<b>DevAtlas · 6 High-Demand Workshops</b>\n\n` +
        `<blockquote>1. Telegram Bots &amp; Mini Apps (Python / Node)\n` +
        `2. Freelancing from Zero (Upwork, Fiverr, Kwork)\n` +
        `3. AI Automation for Work &amp; Business (No-Code)\n` +
        `4. Fast No-Code + AI Websites (Framer / Tilda)\n` +
        `5. Excel + Google Sheets + AI for Office &amp; Finance\n` +
        `6. Coding for Kids &amp; Teens (Ages 9–15)</blockquote>\n\n` +
        `24 interactive lessons with ready templates and hands-on tasks.`,
    };
    const openAll: Record<BotLang, string> = {
      ru: 'Открыть все 6 воркшопов',
      tg: 'Кушодани ҳамаи 6 воркшоп',
      en: 'Open All 6 Workshops',
    };
    const bootcamps: Record<BotLang, string> = {
      ru: 'Буткемпы 30 дней и B2B',
      tg: 'Марафонҳои 30-рӯза ва B2B',
      en: '30-Day Bootcamps & B2B',
    };
    return {
      withBanner: false,
      text: textByLang[lang],
      buttons: [[appBtn('/workshops', openAll[lang])], [appBtn('/programs', bootcamps[lang])], backRow],
    };
  }

  if (view === 'career') {
    const textByLang: Record<BotLang, string> = {
      ru:
        `<b>Тест выбора IT-профессии · 2 минуты</b>\n\n` +
        `<blockquote>Ответьте на 4 коротких вопроса — платформа соберёт персональный маршрут обучения: Frontend, Backend, AI-инженерия, Mobile, UX-дизайн или Маркетинг.</blockquote>`,
      tg:
        `<b>Тести интихоби касби IT · 2 дақиқа</b>\n\n` +
        `<blockquote>Ба 4 саволи кӯтоҳ ҷавоб диҳед — DevAtlas нақшаи шахсии омӯзишро бароятон месозад: Frontend, Backend, AI, Mobile, UX ё Маркетинг.</blockquote>`,
      en:
        `<b>Career Finder · 2-Minute Assessment</b>\n\n` +
        `<blockquote>Answer 4 focused questions to receive a personal learning roadmap across Frontend, Backend, AI Engineering, Mobile, UX Design, or Digital Growth.</blockquote>`,
    };
    const startBtn: Record<BotLang, string> = {
      ru: 'Пройти тест профессии',
      tg: 'Оғози тести касб',
      en: 'Start Career Test',
    };
    const certBtn: Record<BotLang, string> = {
      ru: 'QR-сертификаты',
      tg: 'QR-сертификатҳо',
      en: 'QR Certificates',
    };
    const cvBtn: Record<BotLang, string> = {
      ru: 'Портфолио / CV',
      tg: 'Портфолио / CV',
      en: 'CV & Portfolio',
    };
    return {
      withBanner: false,
      text: textByLang[lang],
      buttons: [
        [appBtn('/career-test', startBtn[lang])],
        [appBtn('/certificates', certBtn[lang]), appBtn('/portfolio', cvBtn[lang])],
        backRow,
      ],
    };
  }

  if (view === 'arena') {
    const textByLang: Record<BotLang, string> = {
      ru:
        `<b>Арена DevAtlas · Дуэль 1v1</b>\n\n` +
        `<blockquote>• 6 технических вопросов за 120 секунд\n` +
        `• Бонусы за скорость, серию ответов и бейджи\n` +
        `• Ссылка-вызов 1v1 для соревнования с друзьями</blockquote>`,
      tg:
        `<b>Аренаи DevAtlas · Дуэл 1v1</b>\n\n` +
        `<blockquote>• 6 саволи техникӣ дар 120 сония\n` +
        `• Бонусҳои суръат, силсила ва нишонҳо\n` +
        `• Линки дуэл 1v1 барои мусобиқа бо дӯстон</blockquote>`,
      en:
        `<b>DevAtlas Arena · 1v1 Code Duel</b>\n\n` +
        `<blockquote>• 6 rapid engineering questions in 120 seconds\n` +
        `• Speed &amp; streak multipliers + achievement badges\n` +
        `• Send a 1v1 challenge link to beat your friends</blockquote>`,
    };
    const startDuel: Record<BotLang, string> = {
      ru: 'Начать дуэль (2 минуты)',
      tg: 'Оғози дуэл (2 дақиқа)',
      en: 'Launch 2-Minute Duel',
    };
    return {
      withBanner: false,
      text: textByLang[lang],
      buttons: [[appBtn('/arena', startDuel[lang])], backRow],
    };
  }

  if (view === 'plans') {
    const textByLang: Record<BotLang, string> = {
      ru:
        `<b>Тарифы DevAtlas · Start, Pro и Ultra</b>\n\n` +
        `<blockquote><b>Start — Бесплатно</b>\n` +
        `38 базовых курсов, проверка кода и чат сообщества.\n\n` +
        `<b>Pro — $5 / месяц</b>\n` +
        `Курсы Pro, AI Tutor, QR-сертификаты с проверкой, публичное Портфолио и PDF-резюме.\n\n` +
        `<b>Ultra — $12 / месяц</b>\n` +
        `Всё из Pro + Ultra Студия (мок-интервью, аудит проектов, спринт 30 дней) и голосовой ассистент.</blockquote>\n\n` +
        `Доступна оплата картой и заявка на локальную оплату (Alif Mobi / Корти Миллӣ / DC Next).`,
      tg:
        `<b>Тарифҳои DevAtlas · Start, Pro ва Ultra</b>\n\n` +
        `<blockquote><b>Start — Ройгон</b>\n` +
        `38 курси асосӣ, санҷиши код ва чати ҷомеа.\n\n` +
        `<b>Pro — $5 / моҳ</b>\n` +
        `Курсҳои Pro, AI Tutor, QR-сертификат, Портфолиои оммавӣ ва PDF-резюме.\n\n` +
        `<b>Ultra — $12 / моҳ</b>\n` +
        `Ҳамаи Pro + Студияи Ultra (мок-мусоҳиба, аудити лоиҳа, спринти 30-рӯза) ва ёрдамчии овозӣ.</blockquote>\n\n` +
        `Пардохт бо корт ва дархости пардохти маҳаллӣ (Alif Mobi / Корти Миллӣ / DC Next).`,
      en:
        `<b>DevAtlas Plans · Start, Pro &amp; Ultra</b>\n\n` +
        `<blockquote><b>Start — Free</b>\n` +
        `38 starter courses, code editor checks, community chat.\n\n` +
        `<b>Pro — $5 / month</b>\n` +
        `Pro courses, AI Tutor chat, QR-verified Certificates, Public Portfolio &amp; PDF CV Builder.\n\n` +
        `<b>Ultra — $12 / month</b>\n` +
        `Everything in Pro + Ultra Career Studio (Mock Interviews, Project Audit, 30-Day Job Sprint) &amp; Voice Assistant.</blockquote>`,
    };
    const openPlans: Record<BotLang, string> = {
      ru: 'Открыть тарифы',
      tg: 'Дидани тарифҳо',
      en: 'View Plans & Upgrade',
    };
    const ultraBtn: Record<BotLang, string> = {
      ru: 'Ultra Студия',
      tg: 'Студияи Ultra',
      en: 'Ultra Studio',
    };
    const b2bBtn: Record<BotLang, string> = {
      ru: 'Буткемпы и B2B',
      tg: 'Марафонҳо & B2B',
      en: 'Bootcamps & B2B',
    };
    return {
      withBanner: false,
      text: textByLang[lang],
      buttons: [
        [appBtn('/plans', openPlans[lang])],
        [appBtn('/ultra-studio', ultraBtn[lang]), appBtn('/programs', b2bBtn[lang])],
        backRow,
      ],
    };
  }

  if (view === 'help') {
    const textByLang: Record<BotLang, string> = {
      ru:
        `<b>Команды DevAtlas Bot</b>\n\n` +
        `<code>/start</code> — Выбор языка и запуск Mini App\n` +
        `<code>/courses</code> — 43 курса и Code Sandbox\n` +
        `<code>/workshops</code> — 6 практических воркшопов\n` +
        `<code>/career</code> — Тест выбора IT-профессии\n` +
        `<code>/arena</code> — Дуэль 1v1 и рейтинг\n` +
        `<code>/plans</code> — Тарифы Start, Pro и Ultra\n` +
        `<code>/remind</code> — Напоминания об учёбе\n` +
        `<code>/lang</code> — Сменить язык (RU / TG / EN)`,
      tg:
        `<b>Командаҳои DevAtlas Bot</b>\n\n` +
        `<code>/start</code> — Интихоби забон ва кушодани App\n` +
        `<code>/courses</code> — 43 курс ва Code Sandbox\n` +
        `<code>/workshops</code> — 6 воркшопи амалӣ\n` +
        `<code>/career</code> — Тести интихоби касб\n` +
        `<code>/arena</code> — Дуэл 1v1 ва рейтинг\n` +
        `<code>/plans</code> — Тарифҳои Start, Pro ва Ultra\n` +
        `<code>/remind</code> — Ёдраскунии дарсҳо\n` +
        `<code>/lang</code> — Ивази забон (RU / TG / EN)`,
      en:
        `<b>DevAtlas Bot Commands</b>\n\n` +
        `<code>/start</code> — Language picker &amp; Mini App\n` +
        `<code>/courses</code> — 43 structured courses &amp; Sandbox\n` +
        `<code>/workshops</code> — 6 practical market workshops\n` +
        `<code>/career</code> — 2-minute IT Career Finder\n` +
        `<code>/arena</code> — 1v1 Code Duel &amp; leaderboard\n` +
        `<code>/plans</code> — Start, Pro &amp; Ultra plans\n` +
        `<code>/remind</code> — Toggle study reminders\n` +
        `<code>/lang</code> — Switch language (RU / TG / EN)`,
    };
    const openApp: Record<BotLang, string> = {
      ru: 'Открыть DevAtlas App',
      tg: 'Кушодани DevAtlas App',
      en: 'Open DevAtlas App',
    };
    return {
      withBanner: false,
      text: textByLang[lang],
      buttons: [[appBtn('/courses', openApp[lang])], backRow],
    };
  }

  // HOME DASHBOARD (Shown after user picks RU / TG / EN)
  const startPath = refCode ? `/career-test?ref=${encodeURIComponent(refCode)}` : '/courses';
  const greeting: Record<BotLang, string> = {
    ru: safeName ? `Добро пожаловать, <b>${safeName}</b>` : 'Добро пожаловать в <b>DevAtlas</b>',
    tg: safeName ? `Хуш омадед, <b>${safeName}</b>` : 'Хуш омадед ба <b>DevAtlas</b>',
    en: safeName ? `Welcome, <b>${safeName}</b>` : 'Welcome to <b>DevAtlas</b>',
  };
  const refBadge: Record<BotLang, string> = {
    ru: refCode ? '\n<i>Вы перешли по приглашению друга</i>' : '',
    tg: refCode ? '\n<i>Шумо бо даъвати дӯстатон ворид шудед</i>' : '',
    en: refCode ? '\n<i>Invited via friend referral link</i>' : '',
  };
  const homeBody: Record<BotLang, string> = {
    ru:
      `${greeting.ru}${refBadge.ru}\n\n` +
      `<b>DevAtlas</b> — интерактивная платформа для карьеры в IT и AI.\n\n` +
      `<blockquote>• <b>43 курса</b> — Frontend, Backend, Python, AI, UX, Бизнес\n` +
      `• <b>6 воркшопов</b> — Telegram-боты, Фриланс, AI-автоматизация\n` +
      `• <b>Карьера</b> — QR-сертификаты, CV-портфолио, Арена 1v1</blockquote>\n\n` +
      `Откройте платформу прямо внутри Telegram:`,
    tg:
      `${greeting.tg}${refBadge.tg}\n\n` +
      `<b>DevAtlas</b> — платформаи интерактивии карьера дар IT ва AI.\n\n` +
      `<blockquote>• <b>43 курс</b> — Frontend, Backend, Python, AI, UX, Бизнес\n` +
      `• <b>6 воркшоп</b> — Telegram-ботҳо, Фриланс, AI-автоматизатсия\n` +
      `• <b>Карьера</b> — QR-сертификат, CV-портфолио, Арена 1v1</blockquote>\n\n` +
      `Барномаро рост дар дохили Telegram кушоед:`,
    en:
      `${greeting.en}${refBadge.en}\n\n` +
      `<b>DevAtlas</b> — interactive platform for Coding, AI &amp; Career.\n\n` +
      `<blockquote>• <b>43 Courses</b> — Frontend, Backend, Python, AI, UX, Business\n` +
      `• <b>6 Workshops</b> — Telegram Bots, Freelance, AI Ops, Kids\n` +
      `• <b>Career Tools</b> — QR Certificates, CV Portfolio, 1v1 Arena</blockquote>\n\n` +
      `Launch the platform directly inside Telegram:`,
  };

  const labels = {
    ru: {
      launch: '🚀 Открыть DevAtlas App',
      courses: '📚 43 курса',
      workshops: '🔥 6 воркшопов',
      career: '🧭 Тест профессии',
      arena: '⚡ Арена 1v1',
      plans: '👑 Pro и Ultra',
      cv: '💼 Портфолио / CV',
      lang: '🌐 Язык: RU / TG / EN',
    },
    tg: {
      launch: '🚀 Кушодани DevAtlas App',
      courses: '📚 43 курс',
      workshops: '🔥 6 воркшоп',
      career: '🧭 Тести касб',
      arena: '⚡ Арена 1v1',
      plans: '👑 Pro ва Ultra',
      cv: '💼 Портфолио / CV',
      lang: '🌐 Забон: RU / TG / EN',
    },
    en: {
      launch: '🚀 Launch DevAtlas App',
      courses: '📚 43 Courses',
      workshops: '🔥 6 Workshops',
      career: '🧭 Career Test',
      arena: '⚡ Arena 1v1',
      plans: '👑 Pro & Ultra',
      cv: '💼 Portfolio / CV',
      lang: '🌐 Language: RU / TG / EN',
    },
  }[lang];

  return {
    withBanner: true,
    text: homeBody[lang],
    buttons: [
      [appBtn(startPath, labels.launch)],
      [navBtn('courses', lang, labels.courses), navBtn('workshops', lang, labels.workshops)],
      [appBtn('/career-test', labels.career), appBtn('/arena', labels.arena)],
      [navBtn('plans', lang, labels.plans), appBtn('/portfolio', labels.cv)],
      [navBtn('lang', lang, labels.lang)],
    ],
  };
}

/** Command router (used by webhook & tests). `/start` opens the 3-language chooser first. */
export function buildTelegramReply(
  textInput: string,
  origin: string,
  firstName: string,
  remindersEnabled = true,
  lang: BotLang = 'ru',
) {
  const parts = textInput.trim().split(/\s+/);
  const cmd = (parts[0]?.split('@')[0] ?? '/start').toLowerCase();
  const arg = parts[1]?.trim() ?? '';

  if (cmd === '/remind') {
    const hasHttps = isHttpsOrigin(origin);
    const openLabel: Record<BotLang, string> = {
      ru: 'Открыть DevAtlas',
      tg: 'Кушодани DevAtlas',
      en: 'Open DevAtlas',
    };
    const openBtn: TelegramInlineButton = hasHttps
      ? { text: openLabel[lang], web_app: { url: `${origin}/courses` } }
      : { text: openLabel[lang], url: `${origin}/courses` };
    const textMap: Record<BotLang, string> = {
      ru: remindersEnabled
        ? '<b>Напоминания об учёбе включены.</b>\nВы будете получать уведомления о новых уроках и буткемпах. Повторная команда <code>/remind</code> отключит их.'
        : '<b>Напоминания отключены.</b>\nОтправьте <code>/remind</code> в любой момент, чтобы включить снова.',
      tg: remindersEnabled
        ? '<b>Ёдраскунии дарсҳо фаъол шуд.</b>\nОид ба дарсҳо ва марафонҳои нав хабар мегиред. Барои хомӯш кардан боз <code>/remind</code> фиристед.'
        : '<b>Ёдраскунӣ хомӯш шуд.</b>\nҲар вақт бо <code>/remind</code> дубора фаъол карда метавонед.',
      en: remindersEnabled
        ? '<b>Study reminders enabled.</b>\nWe will notify you about new workshops and bootcamps. Send <code>/remind</code> again to turn off.'
        : '<b>Study reminders paused.</b>\nSend <code>/remind</code> anytime to re-enable.',
    };
    return { withBanner: false, text: textMap[lang], buttons: [[openBtn]] };
  }

  const refMatch = cmd === '/start' ? /^ref_([a-zA-Z0-9_-]{2,32})$/.exec(arg) : null;
  if (cmd === '/start' || cmd === '/lang') {
    return buildLanguagePicker({ firstName, refCode: refMatch?.[1] });
  }

  const viewMap: Record<string, BotView> = {
    '/courses': 'courses',
    '/workshops': 'workshops',
    '/career': 'career',
    '/arena': 'arena',
    '/plans': 'plans',
    '/help': 'help',
  };
  const view: BotView = viewMap[cmd] ?? 'home';
  return buildTelegramView({
    view,
    lang,
    origin,
    firstName,
    refCode: refMatch?.[1],
    remindersEnabled,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isTelegramBotConfigured(),
    botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() || 'devatlas_official_bot',
    languages: ['ru', 'tg', 'en'],
    commands: ['/start', '/courses', '/workshops', '/career', '/arena', '/plans', '/remind', '/lang', '/help'],
  });
}

export async function POST(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (expectedSecret) {
    const provided = request.headers.get('x-telegram-bot-api-secret-token')?.trim() || '';
    if (provided !== expectedSecret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  let body: TelegramUpdate;
  try {
    body = (await readBoundedJson(request, 32_768)) as TelegramUpdate;
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: 'invalid_payload' }, { status });
  }

  const origin = resolveSiteOrigin(request);
  const admin = getSupabaseAdminClient();

  // 1. Interactive Inline Button navigation & 3-language selection (callback_query)
  if (body.callback_query?.id && body.callback_query.message?.chat?.id) {
    const cb = body.callback_query;
    const chatId = cb.message!.chat!.id!;
    const messageId = cb.message!.message_id;
    const isPhotoMessage = Boolean(cb.message?.photo?.length);
    const data = cb.data?.trim() || '';

    const langPick = /^lang:(ru|tg|en)(?::([a-zA-Z0-9_-]{2,32}))?$/.exec(data);
    const viewSwitch = /^view:(lang|home|courses|workshops|career|arena|plans|help):(ru|tg|en)$/.exec(
      data,
    );

    if ((langPick || viewSwitch) && messageId) {
      const targetView: BotView = langPick ? 'home' : (viewSwitch![1] as BotView);
      const targetLang: BotLang = (langPick ? langPick[1] : viewSwitch![2]) as BotLang;
      const refCode = langPick?.[2];

      if (admin) {
        await admin.from('devatlas_telegram_users').upsert(
          {
            chat_id: chatId,
            username: cb.from?.username?.trim() || null,
            first_name: cb.from?.first_name?.trim() || null,
            language_code: targetLang,
            ...(refCode ? { referral_code: refCode } : {}),
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: 'chat_id' },
        );
      }

      const card = buildTelegramView({
        view: targetView,
        lang: targetLang,
        origin,
        firstName: cb.from?.first_name,
        refCode,
      });

      if (isTelegramBotConfigured()) {
        await Promise.all([
          answerTelegramCallback(cb.id!),
          editTelegramCard({
            chatId,
            messageId,
            isPhotoMessage,
            text: card.text,
            parseMode: 'HTML',
            buttons: card.buttons,
          }),
        ]);
      }

      return NextResponse.json({ ok: true, callback: data, lang: targetLang });
    }

    if (isTelegramBotConfigured()) await answerTelegramCallback(cb.id!);
    return NextResponse.json({ ok: true, ignored: true });
  }

  // 2. Standard text / slash command
  const chatId = body.message?.chat?.id;
  const text = body.message?.text?.trim() || '';
  if (!chatId || !text) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const firstName = body.message?.from?.first_name?.trim() || '';
  const username = body.message?.from?.username?.trim() || null;
  let lang: BotLang = resolveBotLang(body.message?.from?.language_code);
  const parts = text.split(/\s+/);
  const cmd = (parts[0]?.split('@')[0] ?? '').toLowerCase();
  const refMatch = cmd === '/start' ? /^ref_([a-zA-Z0-9_-]{2,32})$/.exec(parts[1] ?? '') : null;

  let remindersEnabled = true;
  if (admin) {
    const existing = await admin
      .from('devatlas_telegram_users')
      .select('reminders_enabled, language_code')
      .eq('chat_id', chatId)
      .maybeSingle();

    if (
      existing.data?.language_code === 'en' ||
      existing.data?.language_code === 'ru' ||
      existing.data?.language_code === 'tg'
    ) {
      lang = existing.data.language_code;
    }
    if (cmd === '/remind') {
      remindersEnabled = existing.data ? !existing.data.reminders_enabled : true;
    }

    await admin.from('devatlas_telegram_users').upsert(
      {
        chat_id: chatId,
        username,
        first_name: firstName || null,
        language_code: lang,
        ...(refMatch ? { referral_code: refMatch[1] } : {}),
        ...(cmd === '/remind' ? { reminders_enabled: remindersEnabled } : {}),
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'chat_id' },
    );

    if (refMatch) {
      await admin.from('devatlas_referral_events').insert({
        referral_code: refMatch[1],
        visitor_hash: `tg_${chatId}`,
        landing_path: '/telegram-bot',
      });
    }
  }

  const reply = buildTelegramReply(text, origin, firstName, remindersEnabled, lang);

  let sent = false;
  if (isTelegramBotConfigured()) {
    if (reply.withBanner && isHttpsOrigin(origin)) {
      sent = await sendTelegramPhoto({
        chatId,
        photoUrl: `${origin}/telegram/welcome-banner.jpg`,
        caption: reply.text,
        parseMode: 'HTML',
        buttons: reply.buttons,
      });
    } else {
      sent = await sendTelegramMessage({
        chatId,
        text: reply.text,
        parseMode: 'HTML',
        buttons: reply.buttons,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    configured: isTelegramBotConfigured(),
    sent,
    lang,
    replyPreview: reply.text,
  });
}
