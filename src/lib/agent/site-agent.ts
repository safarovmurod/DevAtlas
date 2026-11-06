// Site-agent brain: answers questions about DevAtlas itself — where things
// live, how mastery/progress work, what to study next — from the real catalog,
// tracks and learner progress. It never invents course content: questions about
// lesson material return null so the caller can forward them to the reviewed
// course answer library (/api/tutor), which answers from actual lessons.
// The knowledge base is authored from DevAtlas's own routes and rules.
import { COURSE_CATEGORIES, categoryLabel } from '@/content/course-categories';
import {
  COURSE_CATALOG,
  LEARNING_TRACKS,
  coursePublishedDays,
  type LearningStage,
} from '@/content/courses/catalog';
import { courseDisplayName } from '@/lib/catalog-copy';
import { courseDayCount } from '@/lib/course-copy';
import { isCourseId } from '@/lib/courses/ids';
import { courseDayProgress, courseMonthPlan } from '@/lib/courses/plan';
import type { CourseLesson } from '@/lib/courses/schema';
import type { InterfaceLocale } from '@/lib/locale';
import {
  GUIDE_TEXT,
  INTENT_PATTERNS,
  guideLanguage,
  type GuideContext,
  type GuideLanguage,
  type IntentKey,
} from './guide-text';

export type { GuideContext } from './guide-text';

export interface SiteGuideLink {
  href: string;
  label: string;
}
export interface SiteGuideReply {
  reply: string;
  links: SiteGuideLink[];
  kind: 'guide';
}

type Lang = InterfaceLocale;

/** Link names match the real menu labels. */
const LINK_LABELS: Record<
  GuideLanguage,
  Record<'catalog' | 'practice' | 'notes' | 'plans' | 'community' | 'tests' | 'plan', string>
> = {
  ru: {
    catalog: 'Каталог курсов',
    practice: 'Общая практика',
    notes: 'Заметки',
    plans: 'Тарифы',
    community: 'Сообщество',
    tests: 'тесты',
    plan: 'План курса',
  },
  tg: {
    catalog: 'Каталоги курсҳо',
    practice: 'Машқҳои умумӣ',
    notes: 'Ёддоштҳо',
    plans: 'Тарифҳо',
    community: 'Ҷомеа',
    tests: 'санҷишҳо',
    plan: 'Нақшаи курс',
  },
  en: {
    catalog: 'Course catalog',
    practice: 'Shared practice',
    notes: 'Notes',
    plans: 'Plans',
    community: 'Community',
    tests: 'tests',
    plan: 'Course plan',
  },
};

/** Answers a question about the platform, or returns null for lesson-content questions. */
export function siteGuideAnswer(query: string, context: GuideContext): SiteGuideReply | null {
  const text = query.trim();
  if (!text) return null;
  const language = guideLanguage(context.language);
  const matched = (Object.keys(INTENT_PATTERNS) as IntentKey[]).find((key) =>
    INTENT_PATTERNS[key][language].test(text),
  );
  if (!matched) return null;

  const label = LINK_LABELS[language];
  const course = context.selectedCourse;
  const hasCoursePage = isCourseId(course) && course !== 'react';
  const links: SiteGuideLink[] = [{ href: '/courses', label: label.catalog }];

  if (matched === 'wherePractice') links.push({ href: '/practice', label: label.practice });
  if (matched === 'whereNotes') links.push({ href: '/notes', label: label.notes });
  if (matched === 'wherePlans') links.push({ href: '/plans', label: label.plans });
  if (matched === 'whereCommunity') links.push({ href: '/community', label: label.community });
  if (matched === 'whereTests' && hasCoursePage)
    links.push({
      href: `/courses/${course}/tests`,
      label: courseDisplayName(course, context.language) + ' · ' + label.tests,
    });
  if (matched === 'nextStep' && hasCoursePage)
    links.push({ href: `/courses/${course}/plan`, label: label.plan });

  return { reply: GUIDE_TEXT[matched][language](context), links, kind: 'guide' };
}

/** "Programming, AI, Design, Marketing and more — 11 categories, 44 courses." */
function trackSummary(language: Lang) {
  const first = COURSE_CATEGORIES.slice(0, 4)
    .map((category) => categoryLabel(category.id, language))
    .join(', ');
  const categories = COURSE_CATEGORIES.length;
  const courses = COURSE_CATALOG.length;
  if (language === 'ru')
    return `${first} и другие — всего ${categories} категорий, ${courses} курсов.`;
  if (language === 'tg')
    return `${first} ва дигар — ҳамагӣ ${categories} категория, ${courses} курс.`;
  return `${first} and more — ${categories} categories, ${courses} courses in total.`;
}

/**
 * The recommended next step, based on the selected course and saved progress.
 * courseTitle is empty when no regular course is selected (React has its own entry page).
 */
function nextStepText(
  language: Lang,
  courseTitle: string,
  hasProgress: boolean,
  currentDay?: number,
) {
  const lang = guideLanguage(language);
  if (!courseTitle) {
    return {
      ru: 'Откройте каталог курсов и выберите направление — рекомендую начать с HTML + CSS, если вы с нуля.',
      tg: 'Каталогро кушоед ва як самт интихоб кунед — агар аз сифр бошед, аз HTML + CSS оғоз кунед.',
      en: 'Open the course catalog and pick a direction — start with HTML + CSS if you are new.',
    }[lang];
  }
  if (hasProgress) {
    const day = {
      ru: currentDay ? ' — сейчас идёт день ' + currentDay : '',
      tg: currentDay ? ' — ҳоло рӯзи ' + currentDay : '',
      en: currentDay ? ' — currently on day ' + currentDay : '',
    }[lang];
    return {
      ru: `Продолжайте курс «${courseTitle}»${day}. Проверьте мастерство дня в разделе тестов и подтвердите день, когда урок и практика готовы.`,
      tg: `Курси «${courseTitle}»-ро идома диҳед${day}. Азхудкунии рӯзро дар санҷишҳо тафтиш кунед ва рӯзро тасдиқ кунед.`,
      en: `Continue “${courseTitle}”${day}. Check the day’s mastery in tests and confirm the day once reading and practice are done.`,
    }[lang];
  }
  return {
    ru: `Курс «${courseTitle}» выбран, но пока не начат: откройте план и начните с дня 1 — каждый день это урок, пример, практика и тест.`,
    tg: `Курси «${courseTitle}» интихоб шудааст, вале ҳанӯз оғоз нашудааст: нақшаро кушоед ва аз рӯзи 1 оғоз кунед.`,
    en: `“${courseTitle}” is selected but not started: open the plan and begin with day 1 — every day is a lesson, example, practice and a quiz.`,
  }[lang];
}

/** Collects what the guide needs to know about the learner. */
export function guideContext(input: {
  language: Lang;
  selectedCourse: string;
  progress: {
    completedTopics: readonly string[];
    completedPractice: readonly string[];
    confirmedDays: readonly string[];
    masteredQuestions: readonly string[];
    drafts?: Record<string, string>;
  };
  lessons?: { id: string; day?: number; questions: { id: string }[] }[];
}): GuideContext {
  const { language, selectedCourse, progress } = input;
  const courseId = isCourseId(selectedCourse) ? selectedCourse : null;

  let currentDay: number | undefined;
  let masteredRatio: number | undefined;
  if (courseId && courseId !== 'react' && input.lessons) {
    // The guide only reads ids, days and question ids from the lessons.
    const plan = courseMonthPlan(input.lessons as CourseLesson[]);
    const statuses = courseDayProgress(
      plan,
      progress.completedTopics,
      progress.completedPractice,
      progress.confirmedDays,
    );
    currentDay = statuses.current?.day;
    const questions = plan.flatMap((day) => day.lesson.questions);
    const mastered = questions.filter((question) =>
      progress.masteredQuestions.includes(question.id),
    );
    masteredRatio = questions.length ? mastered.length / questions.length : undefined;
  }
  // The day saved by the course page works even without loaded lessons.
  currentDay ??= Number(progress.drafts?.['selected-day-v3']) || undefined;

  const hasProgress = progress.confirmedDays.length > 0 || progress.completedTopics.length > 0;
  const courseTitle =
    selectedCourse === 'react' ? 'React' : courseId ? courseDisplayName(courseId, language) : '';

  let selectedCourseHint = '';
  if (courseTitle && courseId) {
    const days = coursePublishedDays(courseId);
    selectedCourseHint = {
      ru: `Сейчас выбран курс «${courseTitle}»${days ? ' — ' + courseDayCount(days, 'ru') : ''}.`,
      tg: `Ҳоло курси «${courseTitle}» интихоб аст.`,
      en: `Current course: “${courseTitle}”.`,
    }[guideLanguage(language)];
  }

  return {
    language,
    selectedCourse,
    currentCourseTitle: courseTitle || undefined,
    currentDay,
    masteredRatio,
    hasProgress,
    trackSummary: trackSummary(language),
    nextStep: nextStepText(
      language,
      courseId && courseId !== 'react' ? courseTitle : '',
      hasProgress,
      currentDay,
    ),
    selectedCourseHint,
  };
}

/** Human-readable capability overview used as the widget's greeting. */
export function agentGreeting(language: Lang): string {
  if (language === 'ru')
    return 'Привет! Я ассистент DevAtlas. Подскажу, где что находится, что делать дальше, как считается прогресс и мастерство. Вопросы по материалам урока передам в библиотеку ответов курса. Спрашивайте!';
  if (language === 'tg')
    return 'Салом! Ман ёрдамчии DevAtlas ҳастам. Мегӯям, ки чӣ дар куҷост, минбаъд чӣ кардан лозим ва пешрафт чӣ тавр ҳисоб мешавад. Саволҳои дарсиро ба китобхонаи ҷавобҳои курс мефиристам. Пурсед!';
  return 'Hi! I am the DevAtlas assistant. I can point you around the platform, suggest what to do next, and explain how progress and mastery work. Lesson-content questions go to the reviewed course answer library. Ask away!';
}

/** Ready-made questions shown as buttons. Each one matches a guide topic. */
export function agentQuickPrompts(language: Lang): string[] {
  if (language === 'ru')
    return [
      'Что мне делать дальше?',
      'Где найти курсы?',
      'Как считается мастерство?',
      'Как готовиться к интервью?',
    ];
  if (language === 'tg')
    return [
      'Минбаъд чӣ кунам?',
      'Курсҳо дар куҷоанд?',
      'Пешрафт чӣ тавр ҳисоб мешавад?',
      'Барои мусоҳиба чӣ тавр тайёр шавам?',
    ];
  return [
    'What should I do next?',
    'Where are the courses?',
    'How does mastery work?',
    'How do I prep for interviews?',
  ];
}

function agentStages(language: Lang): Record<LearningStage, string> {
  if (language === 'tg')
    return { beginner: 'Асосӣ · ройгон', pro: 'Pro · бо обуна', expert: 'Expert · бо обуна' };
  if (language === 'ru')
    return {
      beginner: 'Начальный · бесплатно',
      pro: 'Pro · по подписке',
      expert: 'Expert · по подписке',
    };
  return { beginner: 'Beginner · free', pro: 'Pro · paid', expert: 'Expert · paid' };
}

/** One learning track as text: "Python: Python (Beginner · free, 30) → …". */
export function agentTrackLine(trackId: string, language: Lang): string {
  const track = LEARNING_TRACKS.find((item) => item.id === trackId);
  if (!track) return '';
  const stages = agentStages(language);
  const steps = track.courses.map(
    (entry) =>
      `${courseDisplayName(entry.course, language)} (${stages[entry.stage]}, ${coursePublishedDays(entry.course)})`,
  );
  return track.name + ': ' + steps.join(' → ');
}
