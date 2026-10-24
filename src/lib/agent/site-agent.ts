// Site-agent brain: answers questions about DevAtlas itself — where things
// live, how mastery/progress work, what to study next — from the real catalog,
// tracks and learner progress. It never invents course content: questions about
// lesson material return null so the caller can forward them to the reviewed
// course answer library (/api/tutor), which answers from actual lessons.
// The knowledge base below is authored from DevAtlas's own routes and rules;
// it is original text, not copied from any leaked prompt collection.
import { COURSE_CATALOG, LEARNING_TRACKS, coursePublishedDays, type LearningStage } from '@/content/courses/catalog';
import { COURSE_CATEGORIES, PROGRAMMING_SUBTRACKS, categoryLabel, subtrackLabel } from '@/content/course-categories';
import { courseDisplayName } from '@/lib/catalog-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { courseDayProgress, courseMonthPlan, type CoursePlanDay } from '@/lib/courses/plan';

export interface SiteGuideLink { href: string; label: string; }
export interface SiteGuideReply { reply: string; links: SiteGuideLink[]; kind: 'guide'; }

type Lang = InterfaceLocale;

const T: Record<IntentKey, { ru?: RegExp; tg?: RegExp; en?: RegExp }> = {
  whereCourses: { ru: /где.*(курс|направлен)|какой курс|с чего начать|что изучать|список курсов|какие курсы/i, tg: /курсҳо дар куҷо|аз куҷо оғоз|қадамҳои аввал|курсҳои мо|фиҳрист/i, en: /where.*(course|track)|which course|how (do i )?start|what (should i )?(learn|study)|course list/i },
  nextStep: { ru: /что.*(дальше|делать)|продолжить|рекоменд|мой прогресс|где я остановил|следующий шаг/i, tg: /чи дароз|чи кунам|идома|тавсия|пешрафти ман|қадами навбатӣ/i, en: /what.*(next|now)|continue|recommend|my progress|where was i|next step/i },
  howMastery: { ru: /мастерство|как.*(прогресс|подтвержд|заверш)|считается|xp|очки/i, tg: /мастерство|чӣ тавр.*(пешрафт|тасдиқ)|ҳисоб мешавад/i, en: /mastery|how.*(progress|confirm|complete)|counts as|xps?/i },
  wherePractice: { ru: /где.*(практ|упражн)|как.*(практ|решать задач)/i, tg: /где.*(практ|машқ)|машқҳо дар куҷо/i, en: /where.*(practice|exercises)|how.*(practice|solve)/i },
  whereTests: { ru: /где.*(тест|экзамен|интервью)|(подготов|готов|репетиц).*(интервью|собеседов)|собеседован|интервью/i, tg: /где.*(тест|интервью)|тайёрӣ барои интервью/i, en: /where.*(test|exam|interview)|interview prep/i },
  whereNotes: { ru: /заметк|конспект/i, tg: /қайд|ёддошт/i, en: /\bnotes?\b/i },
  wherePlans: { ru: /подписк|тариф|сколько стоит|цена|оплат|premium|pro доступ/i, tg: /обуна|нарх|чанд аст|пардохт|pro дастрас/i, en: /subscri|pricing|how much|price|payment|premium|pro access/i },
  whereCommunity: { ru: /сообществ|чат|другие ученики|форум/i, tg: /ҷамоат|чат|дигарон/i, en: /community|chat with|forum|other learners/i },
};
type IntentKey = 'whereCourses' | 'nextStep' | 'howMastery' | 'wherePractice' | 'whereTests' | 'whereNotes' | 'wherePlans' | 'whereCommunity';

const GUIDE_TEXT: Record<IntentKey, Partial<Record<Lang, (context: GuideContext) => string>>> = {
  whereCourses: {
    ru: c => ['Все направления собраны в каталоге «Курсы»: ' + c.trackSummary + '.',
      'Каждое направление — это learning track: начальный уровень всегда бесплатный, а Pro и Expert публикуются по мере готовности (на карточках видно честно).',
      'Совет: выберите направление в каталоге — платформа сама откроет план по дням и будет вести от урока к практике.'].join('\n'),
    tg: c => ['Ҳамаи самтҳо дар каталоги «Курсҳо» ҷамъ шудаанд: ' + c.trackSummary + '.',
      'Ҳар самт як learning track аст: сатҳи асосӣ ҳамеша ройгон аст, Pro ва Expert ҳамагӣ баъди омода шудан нашр мешаванд.',
      'Маслиҳат: дар каталог як самт интихоб кунед — платформа планро аз рӯи рӯзҳо мекушояд ва аз дарс ба машқ мебарад.'].join('\n'),
    en: c => ['All directions live in the Courses catalog: ' + c.trackSummary + '.',
      'Every direction is a learning track: the beginner stage is always free, while Pro and Expert stages are published honestly as they become ready.',
      'Tip: pick a direction in the catalog — the platform opens the day-by-day plan and walks you from reading to practice.'].join('\n'),
  },
  nextStep: {
    ru: c => c.nextStep,
    tg: c => c.nextStep,
    en: c => c.nextStep,
  },
  howMastery: {
    ru: () => ['Прогресс дня считается честно: урок нужно отметить изучённым и сдать практику, после чего день можно подтвердить.',
      'Отдельно считается мастерство — вопросы дня из раздела «Тесты»: каждый правильный ответ сохраняется, и когда отвечены все вопросы дня, появляется статус «Мастерство пройдено». Ошибиться не страшно: неправильный ответ можно переответить в тот же день.',
      'XP начисляется за разные действия (урок, практика, верный ответ), и одно и то же действие не приносит очки повторно. Гостевой прогресс живёт в браузере, а с аккаунтом синхронизируется между устройствами.'].join('\n'),
    tg: () => ['Пешрафти рӯз ростгӯйона ҳисоб мешавад: дарсро азхудкарда, машқро супоридан лозим ва баъд рӯзро тасдиқ кардан мумкин.',
      'Алоҳида «мастерство» ҳисоб мешавад — саволҳои рӯз аз бахши «Тестҳо»: ҳар ҷавоби дуруст нигоҳ дошта мешавад ва агар ҳамаи саволҳои рӯз дуруст бошанд, нишони «гузаашта» пайдо мешавад. Хато ҳеҷ гуна бад нест — ҷавоби нодурустро рӯзи ҳамон рӯз метавонад аз нав ҷавоб диҳед.',
      'XP барои ҳар кори гуногун дода мешавад ва як амал дубора очко намедиҳад. Пешрафти меҳмон дар браузер нигоҳ дошта мешавад, бо аккаунт байни дастгоҳҳо ҳамоҳанг мешавад.'].join('\n'),
    en: () => ['Day progress is measured honestly: mark the lesson as studied, complete its practice, then confirm the day.',
      'Mastery is tracked separately through the day quiz in the Tests section: every correct answer is stored, and once all of the day’s questions are answered correctly the day shows as mastered. Wrong answers are never punishing — you can retry within the day.',
      'XP is granted per distinct action (lesson, practice, correct answer) and the same action never pays out twice. Guest progress lives in the browser; with an account it syncs across devices.'].join('\n'),
  },
  wherePractice: {
    ru: () => ['Практика живёт в двух местах: внутри курса (кнопка «Практика дня» на каждом дне) и в общем разделе «Практика» в сайдбаре, где собраны задания всех курсов.',
      'Задания бывают двух типов: код (пишется в редакторе с проверкой или самопроверкой) и письменные (эссе, разбор кейса) — они честно помечены как self-reviewed.'].join('\n'),
    tg: () => ['Машқ дар ду ҷо аст: дар дохили курс (тугмаи «Машқи рӯз») ва дар бахши умумии «Практика» дар сайдбар.',
      'Супоришҳо ду навъанд: код (дар муҳаррир) ва хаттӣ (эссе, таҳлил) — дуюмҳо ростгӯйона ҳамчун self-reviewed нишон дода мешаванд.'].join('\n'),
    en: () => ['Practice lives in two places: inside the course (the day’s practice button) and the shared Practice section in the sidebar listing assignments from every course.',
      'Assignments come in two kinds: code (typed in the editor with checks or self-review) and written (essays, case analysis) — the latter are honestly labeled self-reviewed.'].join('\n'),
  },
  whereTests: {
    ru: c => ['К каждому дню курса прилагаются тесты и учебное интервью: откройте курс → «Тесты и интервью» (или добавьте ?day=N в адрес).',
      'Интервью-режим спрашивает «помните ли вы» и честно помечает самопроверку — это репетиция собеседования, а не экзамен с оценкой.',
      c.selectedCourseHint].join('\n'),
    tg: c => ['Ба ҳар рӯзи курс тест ва интервью-и таълимӣ часпидааст: курсро кушода, бахши «Тестҳо ва интервью»-ро кушоед.',
      'Режими интервью мепурсад «дар ёд доред?» ва ростгӯйона ҳамчун self-review нишон медиҳад — ин машқи интервью аст, на имтиҳон бо балл.',
      c.selectedCourseHint].join('\n'),
    en: c => ['Every course day carries a quiz and a study interview: open the course → Tests & interview (or add ?day=N to the URL).',
      'Interview mode asks “do you remember?” and honestly labels the result as self-review — it is rehearsal, not a graded exam.',
      c.selectedCourseHint].join('\n'),
  },
  whereNotes: {
    ru: () => ['Заметки — отдельный раздел «Заметки» в сайдбаре. У каждого курса свои заметки: переключите курс, и вы увидите его конспекты. Из карточки курса свои заметки тоже доступны.'].join('\n'),
    tg: () => ['Қайдҳо — бахши алоҳидаи «Қайдҳо» дар сайдбар. Ҳар курс қайдҳои худро дорад: курсро иваз кунед, қайдҳояшро мебинед.'].join('\n'),
    en: () => ['Notes have their own sidebar section. Notes are per course: switch the course to see its notes.'].join('\n'),
  },
  wherePlans: {
    ru: () => ['Начальный уровень всех направлений полностью бесплатный и остаётся бесплатным.',
      'Платные уровни Pro и Expert существуют как курсы, но оплата пока намеренно не подключена: checkout честно сообщает «сервис недоступен», пока не будет настроен реальный провайдер платежей. Никаких «фейковых оплат» на сайте нет — список планов можно посмотреть в разделе «Планы».'].join('\n'),
    tg: () => ['Сатҳи асосии ҳамаи самтҳо пурра ройгон аст ва ройгон мемонад.',
      'Сатҳҳои Pro ва Expert ҳамчун курс мавҷуданд, вале пардохт қасдан пайваст нашудааст: checkout ростгӯйона мегӯяд «хидмат дастрас нест». Рӯйхати нархҳоро дар бахши «Планы» мебинед.'].join('\n'),
    en: () => ['The beginner stage of every direction is fully free and stays free.',
      'Paid Pro and Expert stages exist as courses, but payment is intentionally not connected: checkout honestly reports the service is unavailable until a real payment provider is configured. Plans are listed in the Plans section.'].join('\n'),
  },
  whereCommunity: {
    ru: () => ['Раздел «Community» в сайдбаре открывает сообщество платформы: обсуждения и подписной чат. Чат требует реальной активной подписки на сервере — без неё интерфейс честно объясняет, что сервис недоступен.'].join('\n'),
    tg: () => ['Бахши «Community» ҷамоати платформаро мекушояд. Чат ба обунаи воқеӣ ниёз дорад — бе он интерфейс ростгӯйона мефаҳмонад, ки хидмат дастрас нест.'].join('\n'),
    en: () => ['The Community sidebar section opens platform discussions and the subscriber chat. The chat requires a real active server-side membership — without one the UI explains honestly that the service is unavailable.'].join('\n'),
  },
};

export interface GuideContext {
  language: Lang;
  selectedCourse: string;
  currentCourseTitle?: string;
  currentDay?: number;
  masteredRatio?: number;
  hasProgress?: boolean;
  trackSummary: string;
  nextStep: string;
  selectedCourseHint: string;
}

export function siteGuideAnswer(query: string, context: GuideContext): SiteGuideReply | null {
  const text = query.trim();
  if (!text) return null;
  const language = context.language;
  // Lesson-content questions are not guide questions — hand them to the
  // reviewed course answer library instead of answering from thin air.
  const matched = (Object.keys(T) as IntentKey[]).find(key => {
    const locale = (['ru','tg','en'] as const).includes(language as 'ru'|'tg'|'en') ? language as 'ru'|'tg'|'en' : 'en';
    const pattern = T[key][locale] ?? T[key].en ?? T[key].ru;
    return pattern?.test(text);
  });
  if (!matched) return null;
  const links: SiteGuideLink[] = [{ href: '/courses', label: language === 'tg' ? 'Каталоги курсҳо' : language === 'ru' ? 'Каталог курсов' : 'Course catalog' }];
  if (matched === 'wherePractice') links.push({ href: '/practice', label: language === 'ru' ? 'Общая практика' : language === 'tg' ? 'Практикаи умумӣ' : 'Shared practice' });
  if (matched === 'whereNotes') links.push({ href: '/notes', label: language === 'ru' ? 'Заметки' : language === 'tg' ? 'Қайдҳо' : 'Notes' });
  if (matched === 'wherePlans') links.push({ href: '/plans', label: language === 'ru' ? 'Планы' : language === 'tg' ? 'Планс' : 'Plans' });
  if (matched === 'whereCommunity') links.push({ href: '/community', label: language === 'ru' ? 'Сообщество' : language === 'tg' ? 'Ҷамоат' : 'Community' });
  if (matched === 'whereTests' && context.selectedCourse && context.selectedCourse !== 'react') links.push({ href: `/courses/${context.selectedCourse}/tests`, label: courseDisplayName(context.selectedCourse as never, language) + ' · ' + (language === 'ru' ? 'тесты' : language === 'tg' ? 'тестҳо' : 'tests') });
  if (matched === 'nextStep' && context.selectedCourse && context.selectedCourse !== 'react') links.push({ href: `/courses/${context.selectedCourse}/plan`, label: language === 'ru' ? 'План курса' : language === 'tg' ? 'Нақшаи курс' : 'Course plan' });
  const tell = GUIDE_TEXT[matched][language] ?? GUIDE_TEXT[matched].en ?? GUIDE_TEXT[matched].ru!;
  return { reply: tell(context), links, kind: 'guide' };
}

export function guideContext(input: {
  language: Lang;
  selectedCourse: string;
  progress: { completedTopics: readonly string[]; completedPractice: readonly string[]; confirmedDays: readonly string[]; masteredQuestions: readonly string[]; drafts?: Record<string,string> };
  lessons?: { id: string; day?: number; questions: { id: string }[] }[];
}): GuideContext {
  const { language, selectedCourse, progress } = input;
  const inCatalog = COURSE_CATALOG.find(course => course.id === selectedCourse);
  const trackSummaryParts = COURSE_CATEGORIES.slice(0, 4).map(category => categoryLabel(category.id, language));
  const trackSummary = trackSummaryParts.join(', ') + ' ' + (language === 'ru' ? 'и другие — всего ' + COURSE_CATEGORIES.length + ' категорий, ' + COURSE_CATALOG.length + ' курсов.' : language === 'tg' ? 'ва дигар — ҳамагӣ ' + COURSE_CATEGORIES.length + ' категория, ' + COURSE_CATALOG.length + ' курс.' : 'and more — ' + COURSE_CATEGORIES.length + ' categories, ' + COURSE_CATALOG.length + ' courses in total.');
  let currentDay: number | undefined;
  let masteredRatio: number | undefined;
  const lessons = input.lessons;
  if (selectedCourse !== 'react' && inCatalog && lessons) {
    const plan = courseMonthPlan(lessons as never);
    const statuses = courseDayProgress(plan, progress.completedTopics, progress.completedPractice, progress.confirmedDays);
    currentDay = statuses.current?.day;
    const total = plan.reduce((sum, day: CoursePlanDay) => sum + day.lesson.questions.length, 0);
    const done = plan.reduce((sum, day: CoursePlanDay) => sum + day.lesson.questions.filter(question => progress.masteredQuestions.includes(question.id)).length, 0);
    masteredRatio = total ? done / total : undefined;
  }
  // The learner's saved day (draft key used by the workspace) works even
  // without loaded lesson content.
  currentDay = currentDay ?? (progress.drafts?.['selected-day-v3'] ? Number(progress.drafts['selected-day-v3']) || undefined : undefined);
  const hasProgress = progress.confirmedDays.length > 0 || progress.completedTopics.length > 0;
  const courseTitle = selectedCourse === 'react' ? 'React' : inCatalog ? courseDisplayName(selectedCourse as never, language) : '';
  const nextStep = !inCatalog || selectedCourse === 'react'
    ? (language === 'ru' ? 'Откройте каталог курсов и выберите направление — рекомендую начать с HTML + CSS, если вы с нуля.' : language === 'tg' ? 'Каталогро кушода, як самт интихоб кунед — агар аз сифр бошед, аз HTML + CSS оғоз кунед.' : 'Open the course catalog and pick a direction — start with HTML + CSS if you are new.')
    : hasProgress
      ? (language === 'ru' ? `Продолжайте курс «${courseTitle}»${currentDay ? ' — сейчас идёт день ' + currentDay : ''}. Проверьте мастерство дня в разделе тестов и подтвердите день, когда урок и практика готовы.` : language === 'tg' ? `Курси «${courseTitle}»-ро идома диҳед${currentDay ? ' — ҳоло рӯзи ' + currentDay : ''}. Мастерствои рӯзро дар тестҳо санҷед ва рӯзро тасдиқ кунед.` : `Continue “${courseTitle}”${currentDay ? ' — currently on day ' + currentDay : ''}. Check the day’s mastery in tests and confirm the day once reading and practice are done.`)
      : (language === 'ru' ? `Курс «${courseTitle}» выбран, но пока не начат: откройте план и начните с дня 1 — каждый день это урок, пример, практика и тест.` : language === 'tg' ? `Курси «${courseTitle}» интихоб шудааст, вале ҳанӯз оғоз нашудааст: нақшаро кушода, аз рӯзи 1 оғоз кунед.` : `“${courseTitle}” is selected but not started: open the plan and begin with day 1 — every day is a lesson, example, practice and a quiz.`);
  const selectedCourseHint = courseTitle
    ? (language === 'ru' ? `Сейчас выбран курс «${courseTitle}»${coursePublishedDays(selectedCourse as never) ? ' — ' + coursePublishedDays(selectedCourse as never) + ' дней' : ''}.` : language === 'tg' ? `Ҳоло курси «${courseTitle}» интихоб аст.` : `Current course: “${courseTitle}”.`)
    : '';
  return { language, selectedCourse, currentCourseTitle: courseTitle || undefined, currentDay, masteredRatio, hasProgress, trackSummary, nextStep, selectedCourseHint };
}

/** Human-readable capability overview used as the widget's greeting. */
export function agentGreeting(language: Lang): string {
  if (language === 'ru') return 'Привет! Я ассистент DevAtlas. Подскажу, где что находится, что делать дальше, как считается прогресс и мастерство. Вопросы по материалам урока передам в библиотеку ответов курса. Спрашивайте!';
  if (language === 'tg') return 'Салом! Ман ёрдамчии DevAtlas ҳастам. Мегӯям чӣ дар куҷост, чи кунем дарозтар, чӣ тавр пешрафт ҳисоб мешавад. Саволҳои дарсиро ба китобхонаи ҷавобҳо медиҳам. Пурсед!';
  return 'Hi! I am the DevAtlas assistant. I can point you around the platform, suggest what to do next, and explain how progress and mastery work. Lesson-content questions go to the reviewed course answer library. Ask away!';
}

export function agentQuickPrompts(language: Lang): string[] {
  if (language === 'ru') return ['Что мне делать дальше?', 'Где найти курсы?', 'Как считается мастерство?', 'Как готовиться к интервью?'];
  if (language === 'tg') return ['Чи кунам дарозтар?', 'Курсҳо дар куҷоанд?', 'Мастерство чӣ тавр ҳисоб мешавад?', 'Барои интервью чӣ тавр тайёр шавам?'];
  return ['What should I do next?', 'Where are the courses?', 'How does mastery work?', 'How do I prep for interviews?'];
}

export function agentStages(language: Lang): Record<LearningStage, string> {
  if (language === 'tg') return { beginner: 'Асосӣ · ройгон', pro: 'Pro · бо обуна', expert: 'Expert · бо обуна' };
  if (language !== 'ru') return { beginner: 'Beginner · free', pro: 'Pro · paid', expert: 'Expert · paid' };
  return { beginner: 'Начальный · бесплатно', pro: 'Pro · по подписке', expert: 'Expert · по подписке' };
}

export function agentTrackLine(trackId: string, language: Lang): string {
  const track = LEARNING_TRACKS.find(item => item.id === trackId);
  if (!track) return '';
  const stageText = (stage: LearningStage) => agentStages(language)[stage];
  return track.name + ': ' + track.courses.map(entry => `${courseDisplayName(entry.course, language)} (${stageText(entry.stage)}, ${coursePublishedDays(entry.course)})`).join(' → ');
}

export const agentSubtracks = (language: Lang) => PROGRAMMING_SUBTRACKS.map(subtrack => subtrackLabel(subtrack.id, language));
