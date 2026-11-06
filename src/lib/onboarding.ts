import { COURSE_CATALOG, coursePublishedDays } from '@/content/courses/catalog';
import type { CourseId } from '@/lib/courses/ids';
import type { PlacementLevel, PlacementResult } from '@/lib/placement';

import type { OnboardingAnswers, Text } from './onboarding-questions';

export {
  ONBOARDING_QUESTIONS,
  onboardingLocale,
  type OnboardingAnswers,
  type OnboardingLocale,
  type OnboardingQuestion,
  type QuestionId,
} from './onboarding-questions';

export interface OnboardingPlan {
  courseId: CourseId;
  reason: Text;
  minutesPerDay: number;
  daysPerWeek: number;
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
}

/** One published course day ≈ 60 minutes of focused study and practice for a beginner. */
export const MINUTES_PER_COURSE_DAY = 60;

function frontendCourse(a: OnboardingAnswers): { id: CourseId; reason: Text } {
  if (a.react === 'good')
    return {
      id: 'nextjs',
      reason: {
        tg: 'React-ро медонед — қадами навбатӣ Next.js аст.',
        ru: 'React вы знаете — следующий шаг Next.js.',
        en: 'You know React — Next.js is the next step.',
      },
    };
  if (a.javascript === 'good')
    return {
      id: 'react',
      reason: {
        tg: 'JavaScript-ро хуб медонед — вақти React аст.',
        ru: 'JavaScript вы знаете хорошо — время React.',
        en: 'Your JavaScript is solid — time for React.',
      },
    };
  if (a.javascript === 'basic')
    return {
      id: 'javascript-2',
      reason: {
        tg: 'Асосҳои JS ҳаст — API ва дархостҳоро меомӯзем.',
        ru: 'Основы JS есть — изучаем API и запросы.',
        en: 'You have JS basics — next are APIs and requests.',
      },
    };
  if (a.html === 'good' || a.html === 'basic')
    return {
      id: 'javascript-1',
      reason: {
        tg: 'HTML/CSS ҳаст — акнун JavaScript саҳифаро зинда мекунад.',
        ru: 'HTML/CSS есть — теперь JavaScript оживит страницу.',
        en: 'You know HTML/CSS — now JavaScript brings pages to life.',
      },
    };
  return {
    id: 'html',
    reason: {
      tg: 'Аз сифр: HTML ва CSS — аввалин сайти худро месозед.',
      ru: 'С нуля: HTML и CSS — вы соберёте свой первый сайт.',
      en: 'From zero: HTML and CSS — you will build your first site.',
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
            },
          }
        : {
            id: 'backend',
            reason: {
              tg: 'Backend аз сифр: HTTP, база ва API.',
              ru: 'Backend с нуля: HTTP, база и API.',
              en: 'Backend from zero: HTTP, databases and APIs.',
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
            },
          }
        : {
            id: 'python',
            reason: {
              tg: 'Python — забони асосии маълумот ва AI.',
              ru: 'Python — главный язык данных и AI.',
              en: 'Python is the main language of data and AI.',
            },
          };
    case 'design':
      return {
        id: 'ux-design',
        reason: {
          tg: 'UX/UI аз сифр: тадқиқот, wireframe ва кейс.',
          ru: 'UX/UI с нуля: исследование, wireframes и кейс.',
          en: 'UX/UI from zero: research, wireframes and a case.',
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
            },
          }
        : {
            id: 'digital-marketing',
            reason: {
              tg: 'Маркетинги рақамӣ: аудитория, канал ва метрика.',
              ru: 'Digital-маркетинг: аудитория, каналы и метрики.',
              en: 'Digital marketing: audience, channels and metrics.',
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
  },
  middle: {
    tg: 'Асосҳоро медонед — ин курс аз ҳамон ҷое ки донишатон тамом мешавад, давом медиҳад.',
    ru: 'Основы вы знаете — этот курс продолжает с того места, где заканчиваются ваши знания.',
    en: 'You know the basics — this course picks up where your knowledge stops.',
  },
  advanced: {
    tg: 'Сатҳи баланд — ба шумо курси пешрафта мувофиқ аст.',
    ru: 'Высокий уровень — вам подходит продвинутый курс.',
    en: 'Advanced level — an advanced course fits you.',
  },
};

export function buildPlan(a: OnboardingAnswers, placement?: PlacementResult): OnboardingPlan {
  const self = recommendCourse(a);
  const id = placement ? placement.courseId : self.id;
  const reason = placement ? PLACED_REASON[placement.level] : self.reason;
  const estimated = selfLevel(a);
  const level = placement ? placement.level : estimated;
  const minutesPerDay = Number(a.minutes) || 45;
  const daysPerWeek = Number(a.days) || 5;
  const theory = Math.round(minutesPerDay * 0.35);
  const review = Math.max(5, Math.round(minutesPerDay * 0.15));
  const practice = Math.max(5, minutesPerDay - theory - review);
  const weeklyMinutes = minutesPerDay * daysPerWeek;
  const weeks = Math.max(
    1,
    Math.ceil((coursePublishedDays(id) * MINUTES_PER_COURSE_DAY) / weeklyMinutes),
  );
  const deadlineMonths = Number(a.deadline) || 0;
  return {
    courseId: COURSE_CATALOG.some((course) => course.id === id) ? id : 'html',
    reason,
    minutesPerDay,
    daysPerWeek,
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
    // Plans saved before the placement test have no level: estimate it from the stored answers.
    if (!value.plan.level)
      value.plan = {
        ...value.plan,
        level: selfLevel(value.answers ?? {}),
        levelSource: 'self',
        selfMismatch: null,
      };
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
