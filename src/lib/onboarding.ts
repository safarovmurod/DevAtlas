import { COURSE_CATALOG, coursePublishedDays } from '@/content/courses/catalog';
import type { CourseId } from '@/lib/courses/ids';
import type { PlacementLevel, PlacementResult } from '@/lib/placement';

import type { OnboardingAnswers, Text } from './onboarding-questions';

export {
  ONBOARDING_QUESTIONS,
  onboardingLocale,
  pickText,
  type OnboardingAnswers,
  type OnboardingLocale,
  type OnboardingQuestion,
  type QuestionId,
} from './onboarding-questions';

export interface HardwareRecommendation {
  required: boolean;
  title: Text;
  cpu: string;
  ram: string;
  storage: string;
  reason: Text;
}

export interface RoadmapStep {
  courseId: CourseId;
  stageLabel: Text;
  isCurrent: boolean;
}

export interface OnboardingPlan {
  courseId: CourseId;
  reason: Text;
  minutesPerDay: number;
  daysPerWeek: number;
  /** How many course days to bundle into a single study day based on available daily time. */
  lessonsPerSession: 1 | 2 | 3;
  /** Split of one study day, in minutes. */
  split: { theory: number; practice: number; review: number };
  /** Calendar weeks to finish the recommended course at this pace. */
  weeks: number;
  /** True when the requested deadline is shorter than the realistic pace. */
  tight: boolean;
  phoneOnly: boolean;
  interviewWeekly: boolean;
  /** Never coded or new to computers: send to Day 0 before the course. */
  beginner: boolean;
  /** Knowledge level: measured by the placement test when taken, otherwise estimated from answers. */
  level: PlacementLevel;
  levelSource: 'test' | 'self';
  /** Placement test score (correct of total) when the test was taken. */
  score?: { correct: number; total: number };
  /** The test placed the person lower or higher than their own estimate; null when they agree or there was no test. */
  selfMismatch: 'lower' | 'higher' | null;
  /** Personal learning-style & pace insight. */
  learnerProfile?: Text;
  /** Course-specific PC/laptop hardware recommendation. */
  hardware?: HardwareRecommendation;
  /** Complete ordered multi-course progression roadmap for the learner's track. */
  roadmap?: RoadmapStep[];
}

/** One published course day ≈ 60 minutes of focused study and practice for a beginner. */
export const MINUTES_PER_COURSE_DAY = 60;

const CATALOG_SET = new Set<string>(COURSE_CATALOG.map((c) => c.id));

const TRACK_ROADMAPS: Record<string, CourseId[]> = {
  frontend: [
    'html',
    'css',
    'git',
    'javascript-1',
    'javascript-2',
    'typescript',
    'react',
    'nextjs',
    'nodejs',
  ],
  backend: ['html', 'git', 'backend', 'sql', 'nodejs', 'mongodb', 'backend-pro'],
  mobile: ['html', 'css', 'git', 'javascript-1', 'javascript-2', 'typescript', 'react', 'mobile'],
  data: [
    'digital-literacy',
    'data-analytics',
    'sql',
    'python',
    'ai-fundamentals',
    'context-engineering',
    'agent-harness',
  ],
  design: ['digital-literacy', 'ux-design', 'html', 'css', 'content-creation'],
  business: [
    'digital-literacy',
    'business-foundations',
    'digital-marketing',
    'management-foundations',
    'personal-productivity',
  ],
};

function buildHardwareSpec(direction: string | undefined): HardwareRecommendation {
  switch (direction) {
    case 'mobile':
      return {
        required: true,
        title: {
          tg: 'Ноутбук барои Mobile (Expo / Эмулятор)',
          ru: 'Ноутбук для мобильной разработки (Expo / Эмулятор)',
          en: 'Laptop for Mobile Development (Expo / Emulator)',
          es: 'Portátil para desarrollo móvil (Expo / Emulador)',
        },
        cpu: 'Intel Core i5/i7 (11th+) · AMD Ryzen 5/7 · Apple M1/M2',
        ram: '16 GB RAM',
        storage: '512 GB NVMe SSD',
        reason: {
          tg: 'Барои барномаҳои телефон эмулятори Android/iOS ва VS Code компютер ё ноутбук ҳатмист — дар телефон сохтани барномаи воқеӣ имконнопазир аст.',
          ru: 'Для мобильных приложений обязательно нужен ПК или ноутбук — эмуляторы Android/iOS и VS Code требуют минимум 16 ГБ ОЗУ и SSD.',
          en: 'A PC or laptop is essential for mobile apps — Android/iOS emulators and VS Code need at least 16 GB RAM and an SSD.',
          es: 'Para apps móviles es imprescindible un PC o portátil: los emuladores y VS Code necesitan al menos 16 GB de RAM y SSD.',
        },
      };
    case 'backend':
    case 'data':
      return {
        required: true,
        title: {
          tg: 'Ноутбук ё ПК барои Backend / Python / AI',
          ru: 'Ноутбук или ПК для Backend / Python / AI',
          en: 'Laptop or PC for Backend / Python / AI',
          es: 'Portátil o PC para Backend / Python / IA',
        },
        cpu: 'Intel Core i5 (10th+) · AMD Ryzen 5 · Apple M1',
        ram: '16 GB RAM (ҳадди ақал 8 GB)',
        storage: '512 GB SSD',
        reason: {
          tg: 'Барои сервер, базаҳои маълумот (SQL/PostgreSQL), Python ва Docker компютер ё ноутбук ҳатмист. 16 GB RAM кори ором ва бе таъхирро таъмин мекунад.',
          ru: 'Для локального сервера, баз данных (SQL/PostgreSQL), Python и Docker нужен ПК или ноутбук. 16 ГБ ОЗУ обеспечат плавную работу.',
          en: 'A PC or laptop is required to run local servers, databases, Python, and Docker smoothly. 16 GB RAM keeps builds fast.',
          es: 'Necesitarás un PC o portátil para servidores locales, bases de datos, Python y Docker. 16 GB de RAM garantizan fluidez.',
        },
      };
    case 'design':
      return {
        required: true,
        title: {
          tg: 'Ноутбук барои UX/UI Дизайн (Figma)',
          ru: 'Ноутбук для UX/UI дизайна (Figma)',
          en: 'Laptop for UX/UI Design (Figma)',
          es: 'Portátil para Diseño UX/UI (Figma)',
        },
        cpu: 'Intel Core i5 · AMD Ryzen 5 · Apple M1',
        ram: '16 GB RAM (ҳадди ақал 8 GB)',
        storage: '256–512 GB SSD · экрани IPS Full HD',
        reason: {
          tg: 'Барои кор дар Figma ва сохтани прототипҳо ноутбук бо экрани равшани Full HD IPS лозим аст.',
          ru: 'Для комфортной работы в Figma и прототипирования нужен ноутбук с экраном Full HD IPS.',
          en: 'A laptop with a clear Full HD IPS display is essential for Figma layouts and prototypes.',
          es: 'Para diseñar en Figma y crear prototipos necesitas un portátil con pantalla Full HD IPS.',
        },
      };
    case 'business':
      return {
        required: false,
        title: {
          tg: 'Ноутбуки сабук барои Бизнес ва Маркетинг',
          ru: 'Лёгкий ноутбук для бизнеса и маркетинга',
          en: 'Lightweight Laptop for Business & Marketing',
          es: 'Portátil ligero para Negocios y Marketing',
        },
        cpu: 'Intel Core i3/i5 · AMD Ryzen 3/5',
        ram: '8 GB RAM',
        storage: '256 GB SSD',
        reason: {
          tg: 'Аз телефон сар кардан мумкин аст, аммо барои ҷадвалҳо, таҳлил ва нақшаи маркетинг ноутбуки сабук корро хеле осон мекунад.',
          ru: 'Можно начать с телефона, но для таблиц, аналитики и презентаций лёгкий ноутбук сильно ускорит работу.',
          en: 'You can start on a phone, though a lightweight laptop makes spreadsheets and campaign dashboards much easier.',
          es: 'Puedes empezar en el móvil, aunque un portátil ligero facilita hojas de cálculo y campañas.',
        },
      };
    default:
      return {
        required: true,
        title: {
          tg: 'Ноутбук ё ПК барои Frontend (HTML / JS / React)',
          ru: 'Ноутбук или ПК для Frontend (HTML / JS / React)',
          en: 'Laptop or PC for Frontend (HTML / JS / React)',
          es: 'Portátil o PC para Frontend (HTML / JS / React)',
        },
        cpu: 'Intel Core i5 (10th+) · AMD Ryzen 5 · Apple M1',
        ram: '16 GB RAM (барои оғоз 8 GB ҳам кифоя)',
        storage: '256–512 GB SSD',
        reason: {
          tg: 'Барои барномасозӣ (VS Code, Git, Node.js, React) компютер ё ноутбук ҳатмист. Ҳатто ноутбуки миёна бо SSD ва 8–16 GB RAM барои 2–3 сол пурра кифоя мекунад.',
          ru: 'Для программирования (VS Code, Git, Node.js, React) обязательно нужен ПК или ноутбук. Даже бюджетный ноутбук с SSD и 8–16 ГБ ОЗУ отлично подойдёт на 2–3 года.',
          en: 'A PC or laptop is essential for coding with VS Code, Git, Node.js, and React. An affordable laptop with an SSD and 8–16 GB RAM works great.',
          es: 'Para programar con VS Code, Git, Node.js y React necesitas un PC o portátil. Uno con SSD y 8–16 GB de RAM es más que suficiente.',
        },
      };
  }
}

function buildLearnerProfile(a: OnboardingAnswers, lessonsPerSession: 1 | 2 | 3): Text {
  const paceTg =
    lessonsPerSession === 3
      ? 'суръати тез (3 дарс дар як рӯзи омӯзиш)'
      : lessonsPerSession === 2
        ? 'суръати фаъол (2 дарс дар як рӯзи омӯзиш)'
        : 'суръати ором ва устувор (1 дарс дар рӯз)';
  const paceRu =
    lessonsPerSession === 3
      ? 'интенсивный темп (3 урока за 1 учебный день)'
      : lessonsPerSession === 2
        ? 'ускоренный темп (2 урока за 1 учебный день)'
        : 'спокойный стабильный темп (1 урок в день)';
  const paceEn =
    lessonsPerSession === 3
      ? 'intensive pace (3 course days bundled per study day)'
      : lessonsPerSession === 2
        ? 'accelerated pace (2 course days bundled per study day)'
        : 'steady pace (1 course day per study day)';
  const paceEs =
    lessonsPerSession === 3
      ? 'ritmo intensivo (3 lecciones por día de estudio)'
      : lessonsPerSession === 2
        ? 'ritmo acelerado (2 lecciones por día de estudio)'
        : 'ritmo constante (1 lección por día)';

  const styleHint: Record<string, Text> = {
    practice: {
      tg: 'Шумо тавассути амалия тезтар ёд мегиред — аввал назарияи кӯтоҳ, баъд бештар код нависед.',
      ru: 'Вы быстрее учитесь через практику — минимум воды, сразу пишите код руками.',
      en: 'You learn fastest by doing — skim theory quickly and spend most time coding.',
      es: 'Aprendes más rápido practicando: ve directo al código tras leer lo esencial.',
    },
    game: {
      tg: 'Шумо бо бозӣ ва тестҳо диққататонро хуб нигоҳ медоред — ҳар дарсро бо тест ва бозии код мустаҳкам кунед.',
      ru: 'Вам отлично подходят квизы и игровые задачи — закрепляйте каждый урок тестом и мини-игрой.',
      en: 'Interactive quizzes and code puzzles keep your focus sharp — finish every day with checks.',
      es: 'Los juegos y cuestionarios mantienen tu motivación alta — refuerza cada tema con pruebas.',
    },
    talk: {
      tg: 'Ба шумо муколама кӯмак мекунад — ҳангоми савол аз AI Tutor ва ёрдамчии овозӣ пурсед.',
      ru: 'Вам помогает живой разбор — смело задавайте вопросы AI Tutor и голосовому инструктору.',
      en: 'Discussion helps things click — use AI Tutor and the Voice Instructor whenever stuck.',
      es: 'Aprender conversando te funciona mejor: apoya tus dudas con AI Tutor y el instructor de voz.',
    },
    read: {
      tg: 'Шумо бо мисолҳои равшан амиқ мефаҳмед — ҳар мавзӯъро аввал бо мисол хонед ва баъд такрор кунед.',
      ru: 'Вы хорошо усваиваете структурированные примеры — читайте разбор шаг за шагом и повторяйте.',
      en: 'Structured examples suit you best — read step by step and then reproduce the code.',
      es: 'Los ejemplos claros funcionan mejor para ti: lee paso a paso y luego repite el código.',
    },
  };
  const chosenStyle = styleHint[a.style ?? 'read'] ?? styleHint.read;

  return {
    tg: `Графики шумо: ${paceTg}. ${chosenStyle.tg}`,
    ru: `Ваш формат: ${paceRu}. ${chosenStyle.ru}`,
    en: `Your rhythm: ${paceEn}. ${chosenStyle.en}`,
    es: `Tu ritmo: ${paceEs}. ${chosenStyle.es}`,
  };
}

function buildRoadmap(direction: string | undefined, startCourseId: CourseId): RoadmapStep[] {
  const key = direction && direction in TRACK_ROADMAPS ? direction : 'frontend';
  const base = TRACK_ROADMAPS[key].filter((id) => CATALOG_SET.has(id));
  const ids = base.includes(startCourseId) ? base : [startCourseId, ...base];
  return ids.map((courseId, index) => {
    const days = coursePublishedDays(courseId);
    const monthsApprox = Math.max(1, Math.round(days / 30));
    return {
      courseId,
      isCurrent: courseId === startCourseId,
      stageLabel: {
        tg: `Қадами ${index + 1} · ${days} рӯз (~${monthsApprox} моҳ)`,
        ru: `Этап ${index + 1} · ${days} дн. (~${monthsApprox} мес.)`,
        en: `Step ${index + 1} · ${days} days (~${monthsApprox} mo)`,
        es: `Paso ${index + 1} · ${days} días (~${monthsApprox} mes)`,
      },
    };
  });
}

function frontendCourse(a: OnboardingAnswers): { id: CourseId; reason: Text } {
  if (a.react === 'good')
    return {
      id: 'nextjs',
      reason: {
        tg: 'React-ро медонед — қадами навбатӣ Next.js аст.',
        ru: 'React вы знаете — следующий шаг Next.js.',
        en: 'You know React — Next.js is the next step.',
        es: 'Ya conoces React: el siguiente paso es Next.js.',
      },
    };
  if (a.javascript === 'good')
    return {
      id: 'react',
      reason: {
        tg: 'JavaScript-ро хуб медонед — вақти React аст.',
        ru: 'JavaScript вы знаете хорошо — время React.',
        en: 'Your JavaScript is solid — time for React.',
        es: 'Tu JavaScript es sólido: es hora de React.',
      },
    };
  if (a.javascript === 'basic')
    return {
      id: 'javascript-2',
      reason: {
        tg: 'Асосҳои JS ҳаст — API ва дархостҳоро меомӯзем.',
        ru: 'Основы JS есть — изучаем API и запросы.',
        en: 'You have JS basics — next are APIs and requests.',
        es: 'Ya tienes las bases de JS: ahora toca ver las API y las solicitudes.',
      },
    };
  if (a.html === 'good' || a.html === 'basic')
    return {
      id: 'javascript-1',
      reason: {
        tg: 'HTML/CSS ҳаст — акнун JavaScript саҳифаро зинда мекунад.',
        ru: 'HTML/CSS есть — теперь JavaScript оживит страницу.',
        en: 'You know HTML/CSS — now JavaScript brings pages to life.',
        es: 'Ya conoces HTML/CSS: ahora JavaScript da vida a las páginas.',
      },
    };
  return {
    id: 'html',
    reason: {
      tg: 'Аз сифр: HTML ва CSS — аввалин сайти худро месозед.',
      ru: 'С нуля: HTML и CSS — вы соберёте свой первый сайт.',
      en: 'From zero: HTML and CSS — you will build your first site.',
      es: 'Desde cero: HTML y CSS; construirás tu primer sitio.',
    },
  };
}

export function recommendCourse(a: OnboardingAnswers): { id: CourseId; reason: Text } {
  switch (a.direction) {
    case 'backend':
      return a.javascript === 'good'
        ? {
            id: 'nodejs',
            reason: {
              tg: 'JS-ро медонед — Node.js барои сервер.',
              ru: 'JS вы знаете — Node.js для сервера.',
              en: 'You know JS — Node.js for servers.',
              es: 'Ya conoces JS: Node.js para servidores.',
            },
          }
        : {
            id: 'backend',
            reason: {
              tg: 'Backend аз сифр: HTTP, база ва API.',
              ru: 'Backend с нуля: HTTP, база и API.',
              en: 'Backend from zero: HTTP, databases and APIs.',
              es: 'Backend desde cero: HTTP, bases de datos y API.',
            },
          };
    case 'mobile':
      return a.react === 'good'
        ? {
            id: 'mobile',
            reason: {
              tg: 'React-ро медонед — барномаи телефон бо Expo.',
              ru: 'React вы знаете — мобильное приложение на Expo.',
              en: 'You know React — mobile apps with Expo.',
              es: 'Ya conoces React: aplicaciones móviles con Expo.',
            },
          }
        : frontendCourse(a);
    case 'data':
      return a.coded === 'never'
        ? {
            id: 'data-analytics',
            reason: {
              tg: 'Таҳлили маълумот бе барномасозии мураккаб сар мешавад.',
              ru: 'Аналитика данных начинается без сложного программирования.',
              en: 'Data analytics starts without heavy programming.',
              es: 'El análisis de datos empieza sin programación complicada.',
            },
          }
        : {
            id: 'python',
            reason: {
              tg: 'Python — забони асосии маълумот ва AI.',
              ru: 'Python — главный язык данных и AI.',
              en: 'Python is the main language of data and AI.',
              es: 'Python es el lenguaje principal de los datos y la IA.',
            },
          };
    case 'design':
      return {
        id: 'ux-design',
        reason: {
          tg: 'UX/UI аз сифр: тадқиқот, wireframe ва кейс.',
          ru: 'UX/UI с нуля: исследование, wireframes и кейс.',
          en: 'UX/UI from zero: research, wireframes and a case.',
          es: 'UX/UI desde cero: investigación, wireframes y un caso práctico.',
        },
      };
    case 'business':
      return a.goal === 'own'
        ? {
            id: 'business-foundations',
            reason: {
              tg: 'Барои лоиҳаи худ — асосҳои бизнес.',
              ru: 'Для своего проекта — основы бизнеса.',
              en: 'For your own project — business foundations.',
              es: 'Para tu propio proyecto: fundamentos de negocios.',
            },
          }
        : {
            id: 'digital-marketing',
            reason: {
              tg: 'Маркетинги рақамӣ: аудитория, канал ва метрика.',
              ru: 'Digital-маркетинг: аудитория, каналы и метрики.',
              en: 'Digital marketing: audience, channels and metrics.',
              es: 'Marketing digital: audiencia, canales y métricas.',
            },
          };
    default:
      return frontendCourse(a);
  }
}

/** Level estimated only from self-assessment, used when the placement test is skipped. */
export function selfLevel(a: OnboardingAnswers): PlacementLevel {
  if (a.coded === 'never' || a.computer === 'new') return 'beginner';
  const good = [a.html, a.javascript, a.react].filter((value) => value === 'good').length;
  if (a.coded === 'yes' && good >= 2) return 'advanced';
  return good >= 1 || a.coded === 'yes' ? 'middle' : 'beginner';
}

const LEVEL_ORDER: Record<PlacementLevel, number> = { beginner: 0, middle: 1, advanced: 2 };
function compareLevels(
  tested: PlacementLevel,
  estimated: PlacementLevel,
): 'lower' | 'higher' | null {
  const diff = LEVEL_ORDER[tested] - LEVEL_ORDER[estimated];
  return diff < 0 ? 'lower' : diff > 0 ? 'higher' : null;
}

const PLACED_REASON: Record<PlacementLevel, Text> = {
  beginner: {
    tg: 'Тест нишон дод, ки аз асос сар кардан беҳтар аст — ин курс аз сифр аст.',
    ru: 'Тест показал, что лучше начать с основ — этот курс с нуля.',
    en: 'The test shows it is best to start from the basics — this course starts from zero.',
    es: 'La prueba indica que lo mejor es empezar por lo básico: este curso parte de cero.',
  },
  middle: {
    tg: 'Асосҳоро медонед — ин курс аз ҳамон ҷое ки донишатон тамом мешавад, давом медиҳад.',
    ru: 'Основы вы знаете — этот курс продолжает с того места, где заканчиваются ваши знания.',
    en: 'You know the basics — this course picks up where your knowledge stops.',
    es: 'Ya conoces lo básico: este curso continúa donde terminan tus conocimientos.',
  },
  advanced: {
    tg: 'Сатҳи баланд — ба шумо курси пешрафта мувофиқ аст.',
    ru: 'Высокий уровень — вам подходит продвинутый курс.',
    en: 'Advanced level — an advanced course fits you.',
    es: 'Nivel avanzado: te conviene un curso avanzado.',
  },
};

export function buildPlan(a: OnboardingAnswers, placement?: PlacementResult): OnboardingPlan {
  const self = recommendCourse(a);
  const id = placement ? placement.courseId : self.id;
  const courseId: CourseId = COURSE_CATALOG.some((course) => course.id === id) ? id : 'html';
  const reason = placement ? PLACED_REASON[placement.level] : self.reason;
  const estimated = selfLevel(a);
  const level = placement ? placement.level : estimated;
  const minutesPerDay = Number(a.minutes) || 45;
  const daysPerWeek = Number(a.days) || 5;
  const lessonsPerSession: 1 | 2 | 3 = minutesPerDay >= 180 ? 3 : minutesPerDay >= 90 ? 2 : 1;
  const theory = Math.round(minutesPerDay * 0.35);
  const review = Math.max(5, Math.round(minutesPerDay * 0.15));
  const practice = Math.max(5, minutesPerDay - theory - review);
  const weeklyMinutes = minutesPerDay * daysPerWeek;
  const weeks = Math.max(
    1,
    Math.ceil((coursePublishedDays(courseId) * MINUTES_PER_COURSE_DAY) / weeklyMinutes),
  );
  const deadlineMonths = Number(a.deadline) || 0;
  return {
    courseId,
    reason,
    minutesPerDay,
    daysPerWeek,
    lessonsPerSession,
    split: { theory, practice, review },
    weeks,
    tight: deadlineMonths > 0 && weeks > deadlineMonths * 4.35,
    phoneOnly: a.device === 'phone',
    interviewWeekly: a.interview === 'yes',
    beginner:
      a.coded === 'never' || a.computer === 'new' || (placement ? placement.correct === 0 : false),
    level,
    levelSource: placement ? 'test' : 'self',
    ...(placement ? { score: { correct: placement.correct, total: 6 } } : {}),
    selfMismatch: placement ? compareLevels(placement.level, estimated) : null,
    learnerProfile: buildLearnerProfile(a, lessonsPerSession),
    hardware: buildHardwareSpec(a.direction),
    roadmap: buildRoadmap(a.direction, courseId),
  };
}

export const ONBOARDING_STORAGE_KEY = 'devatlas-onboarding-v1';
export interface StoredOnboarding {
  answers: OnboardingAnswers;
  plan: OnboardingPlan;
  completedAt: string;
}
export function readOnboarding(): StoredOnboarding | null {
  try {
    const raw = typeof window === 'undefined' ? null : localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as StoredOnboarding;
    if (!value || !value.plan || typeof value.plan.courseId !== 'string') return null;
    // Plans saved before newer fields keep backwards compatibility automatically.
    if (!value.plan.level) {
      value.plan = {
        ...value.plan,
        level: selfLevel(value.answers ?? {}),
        levelSource: 'self',
        selfMismatch: null,
      };
    }
    if (!value.plan.lessonsPerSession) {
      const mins = value.plan.minutesPerDay || 45;
      value.plan.lessonsPerSession = mins >= 180 ? 3 : mins >= 90 ? 2 : 1;
    }
    return value;
  } catch {
    return null;
  }
}
export function saveOnboarding(answers: OnboardingAnswers, plan: OnboardingPlan) {
  try {
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ answers, plan, completedAt: new Date().toISOString() }),
    );
  } catch {
    /* storage may be blocked */
  }
}
export function courseRoute(id: CourseId) {
  return id === 'react' ? '/courses/react' : `/courses/${id}/plan`;
}
