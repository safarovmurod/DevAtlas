import { COURSE_CATALOG, coursePublishedDays } from '@/content/courses/catalog';
import type { CourseId } from '@/lib/courses/ids';
import type { PlacementLevel, PlacementResult } from '@/lib/placement';

/** Onboarding copy is authored in TG/RU/EN; other interface locales fall back to RU or EN. */
export type OnboardingLocale = 'tg' | 'ru' | 'en';
type Text = Record<OnboardingLocale, string>;
export function onboardingLocale(locale: string): OnboardingLocale {
  if (locale === 'tg' || locale === 'ru' || locale === 'en') return locale;
  return locale === 'uk' ? 'ru' : 'en';
}

export interface OnboardingQuestion { id: QuestionId; question: Text; options: { value: string; label: Text }[]; }
export type QuestionId = 'goal' | 'direction' | 'computer' | 'coded' | 'html' | 'javascript' | 'react' | 'device' | 'minutes' | 'days' | 'style' | 'english' | 'deadline' | 'language' | 'interview';
export type OnboardingAnswers = Partial<Record<QuestionId, string>>;

const level = (id: QuestionId, tg: string, ru: string, en: string): OnboardingQuestion => ({ id, question: { tg, ru, en }, options: [
  { value: 'none', label: { tg: 'Тамоман намедонам', ru: 'Совсем не знаю', en: 'Not at all' } },
  { value: 'basic', label: { tg: 'Каме медонам', ru: 'Знаю основы', en: 'I know the basics' } },
  { value: 'good', label: { tg: 'Хуб медонам, проект сохтаам', ru: 'Знаю хорошо, делал проект', en: 'Well — I built a project' } },
] });

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  { id: 'goal', question: { tg: 'Мақсади асосии шумо чист?', ru: 'Какая у вас главная цель?', en: 'What is your main goal?' }, options: [
    { value: 'job', label: { tg: 'Кор ёфтан ҳамчун разработчик', ru: 'Найти работу разработчиком', en: 'Get a developer job' } },
    { value: 'freelance', label: { tg: 'Фриланс ва фармоишҳо', ru: 'Фриланс и заказы', en: 'Freelance and clients' } },
    { value: 'own', label: { tg: 'Лоиҳа ё бизнеси худам', ru: 'Свой проект или бизнес', en: 'My own project or business' } },
    { value: 'curious', label: { tg: 'Танҳо фаҳмидан мехоҳам', ru: 'Просто хочу разобраться', en: 'Just curious' } },
  ] },
  { id: 'direction', question: { tg: 'Кадом самт ба шумо бештар маъқул аст?', ru: 'Какое направление вам ближе?', en: 'Which direction interests you most?' }, options: [
    { value: 'frontend', label: { tg: 'Сайтҳо ва интерфейс (Frontend)', ru: 'Сайты и интерфейсы (Frontend)', en: 'Websites and interfaces (Frontend)' } },
    { value: 'backend', label: { tg: 'Сервер ва база (Backend)', ru: 'Сервер и базы данных (Backend)', en: 'Servers and databases (Backend)' } },
    { value: 'mobile', label: { tg: 'Барномаҳои телефон', ru: 'Мобильные приложения', en: 'Mobile apps' } },
    { value: 'data', label: { tg: 'Маълумот ва AI', ru: 'Данные и AI', en: 'Data and AI' } },
    { value: 'design', label: { tg: 'Дизайн (UX/UI)', ru: 'Дизайн (UX/UI)', en: 'Design (UX/UI)' } },
    { value: 'business', label: { tg: 'Маркетинг ва бизнес', ru: 'Маркетинг и бизнес', en: 'Marketing and business' } },
    { value: 'unknown', label: { tg: 'Ҳоло намедонам', ru: 'Пока не знаю', en: 'Not sure yet' } },
  ] },
  { id: 'computer', question: { tg: 'Бо компютер чӣ қадар озод кор мекунед?', ru: 'Насколько уверенно вы пользуетесь компьютером?', en: 'How comfortable are you with a computer?' }, options: [
    { value: 'new', label: { tg: 'Душвор: файл ва папка ҳам нав аст', ru: 'Сложно: файлы и папки — новое', en: 'Hard: files and folders are new' } },
    { value: 'ok', label: { tg: 'Муқаррарӣ', ru: 'Обычно', en: 'Normal' } },
    { value: 'good', label: { tg: 'Хуб, барномаҳо насб мекунам', ru: 'Уверенно, сам ставлю программы', en: 'Confident, I install software' } },
  ] },
  { id: 'coded', question: { tg: 'Ягон бор код навиштаед?', ru: 'Вы когда-нибудь писали код?', en: 'Have you ever written code?' }, options: [
    { value: 'never', label: { tg: 'Ҳеҷ гоҳ', ru: 'Никогда', en: 'Never' } },
    { value: 'little', label: { tg: 'Каме, аз видео ё курс', ru: 'Немного, по видео или курсу', en: 'A little, from videos or a course' } },
    { value: 'yes', label: { tg: 'Бале, мунтазам', ru: 'Да, регулярно', en: 'Yes, regularly' } },
  ] },
  level('html', 'HTML ва CSS-ро чӣ қадар медонед?', 'Насколько вы знаете HTML и CSS?', 'How well do you know HTML and CSS?'),
  level('javascript', 'JavaScript-ро чӣ қадар медонед?', 'Насколько вы знаете JavaScript?', 'How well do you know JavaScript?'),
  level('react', 'React-ро чӣ қадар медонед?', 'Насколько вы знаете React?', 'How well do you know React?'),
  { id: 'device', question: { tg: 'Дар чӣ мехонед?', ru: 'На чём вы будете учиться?', en: 'What will you study on?' }, options: [
    { value: 'computer', label: { tg: 'Компютер ё ноутбук', ru: 'Компьютер или ноутбук', en: 'Computer or laptop' } },
    { value: 'phone', label: { tg: 'Фақат телефон', ru: 'Только телефон', en: 'Phone only' } },
  ] },
  { id: 'minutes', question: { tg: 'Дар як рӯз чанд вақт доред?', ru: 'Сколько времени в день у вас есть?', en: 'How much time per day do you have?' }, options: [
    { value: '20', label: { tg: '15–20 дақиқа', ru: '15–20 минут', en: '15–20 minutes' } },
    { value: '45', label: { tg: 'Тақрибан 45 дақиқа', ru: 'Около 45 минут', en: 'About 45 minutes' } },
    { value: '90', label: { tg: '1–1,5 соат', ru: '1–1,5 часа', en: '1–1.5 hours' } },
    { value: '180', label: { tg: '3 соат ва зиёд', ru: '3 часа и больше', en: '3 hours or more' } },
  ] },
  { id: 'days', question: { tg: 'Дар як ҳафта чанд рӯз мехонед?', ru: 'Сколько дней в неделю будете учиться?', en: 'How many days a week will you study?' }, options: [
    { value: '3', label: { tg: '3 рӯз', ru: '3 дня', en: '3 days' } },
    { value: '5', label: { tg: '5 рӯз', ru: '5 дней', en: '5 days' } },
    { value: '6', label: { tg: '6 рӯз', ru: '6 дней', en: '6 days' } },
    { value: '7', label: { tg: 'Ҳар рӯз', ru: 'Каждый день', en: 'Every day' } },
  ] },
  { id: 'style', question: { tg: 'Чӣ тавр беҳтар мефаҳмед?', ru: 'Как вам легче понимать?', en: 'How do you learn best?' }, options: [
    { value: 'read', label: { tg: 'Хондан ва мисол', ru: 'Читать с примерами', en: 'Reading with examples' } },
    { value: 'practice', label: { tg: 'Фавран кор кардан', ru: 'Сразу делать руками', en: 'Hands-on right away' } },
    { value: 'game', label: { tg: 'Бозӣ ва тест', ru: 'Игры и тесты', en: 'Games and quizzes' } },
    { value: 'talk', label: { tg: 'Савол додан ба ментор', ru: 'Спрашивать наставника', en: 'Asking a mentor' } },
  ] },
  { id: 'english', question: { tg: 'Забони англисиро чӣ қадар медонед?', ru: 'Как вы знаете английский?', en: 'How is your English?' }, options: [
    { value: 'none', label: { tg: 'Намедонам', ru: 'Не знаю', en: 'None' } },
    { value: 'basic', label: { tg: 'Калимаҳои оддӣ', ru: 'Простые слова', en: 'Simple words' } },
    { value: 'good', label: { tg: 'Ҳуҷҷатро мехонам', ru: 'Читаю документацию', en: 'I read documentation' } },
  ] },
  { id: 'deadline', question: { tg: 'Дар кадом муддат натиҷа мехоҳед?', ru: 'За какой срок хотите результат?', en: 'When do you want results?' }, options: [
    { value: '1', label: { tg: '1 моҳ', ru: '1 месяц', en: '1 month' } },
    { value: '3', label: { tg: '3 моҳ', ru: '3 месяца', en: '3 months' } },
    { value: '6', label: { tg: '6 моҳ', ru: '6 месяцев', en: '6 months' } },
    { value: '0', label: { tg: 'Шитоб надорам', ru: 'Не спешу', en: 'No rush' } },
  ] },
  { id: 'language', question: { tg: 'Дарсҳо бо кадом забон бошанд?', ru: 'На каком языке уроки?', en: 'Which language for lessons?' }, options: [
    { value: 'tg', label: { tg: 'Тоҷикӣ', ru: 'Таджикский', en: 'Tajik' } },
    { value: 'ru', label: { tg: 'Русӣ', ru: 'Русский', en: 'Russian' } },
    { value: 'en', label: { tg: 'Англисӣ', ru: 'Английский', en: 'English' } },
  ] },
  { id: 'interview', question: { tg: 'Тайёрӣ ба интервью лозим аст?', ru: 'Нужна подготовка к собеседованию?', en: 'Do you need interview preparation?' }, options: [
    { value: 'yes', label: { tg: 'Бале, ҳар ҳафта', ru: 'Да, каждую неделю', en: 'Yes, every week' } },
    { value: 'later', label: { tg: 'Баъдтар', ru: 'Позже', en: 'Later' } },
    { value: 'no', label: { tg: 'Не', ru: 'Нет', en: 'No' } },
  ] },
];

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
  if (a.react === 'good') return { id: 'nextjs', reason: { tg: 'React-ро медонед — қадами навбатӣ Next.js аст.', ru: 'React вы знаете — следующий шаг Next.js.', en: 'You know React — Next.js is the next step.' } };
  if (a.javascript === 'good') return { id: 'react', reason: { tg: 'JavaScript-ро хуб медонед — вақти React аст.', ru: 'JavaScript вы знаете хорошо — время React.', en: 'Your JavaScript is solid — time for React.' } };
  if (a.javascript === 'basic') return { id: 'javascript-2', reason: { tg: 'Асосҳои JS ҳаст — API ва дархостҳоро меомӯзем.', ru: 'Основы JS есть — изучаем API и запросы.', en: 'You have JS basics — next are APIs and requests.' } };
  if (a.html === 'good' || a.html === 'basic') return { id: 'javascript-1', reason: { tg: 'HTML/CSS ҳаст — акнун JavaScript саҳифаро зинда мекунад.', ru: 'HTML/CSS есть — теперь JavaScript оживит страницу.', en: 'You know HTML/CSS — now JavaScript brings pages to life.' } };
  return { id: 'html', reason: { tg: 'Аз сифр: HTML ва CSS — аввалин сайти худро месозед.', ru: 'С нуля: HTML и CSS — вы соберёте свой первый сайт.', en: 'From zero: HTML and CSS — you will build your first site.' } };
}

export function recommendCourse(a: OnboardingAnswers): { id: CourseId; reason: Text } {
  switch (a.direction) {
    case 'backend': return a.javascript === 'good' ? { id: 'nodejs', reason: { tg: 'JS-ро медонед — Node.js барои сервер.', ru: 'JS вы знаете — Node.js для сервера.', en: 'You know JS — Node.js for servers.' } } : { id: 'backend', reason: { tg: 'Backend аз сифр: HTTP, база ва API.', ru: 'Backend с нуля: HTTP, база и API.', en: 'Backend from zero: HTTP, databases and APIs.' } };
    case 'mobile': return a.react === 'good' ? { id: 'mobile', reason: { tg: 'React-ро медонед — барномаи телефон бо Expo.', ru: 'React вы знаете — мобильное приложение на Expo.', en: 'You know React — mobile apps with Expo.' } } : frontendCourse(a);
    case 'data': return a.coded === 'never' ? { id: 'data-analytics', reason: { tg: 'Таҳлили маълумот бе барномасозии мураккаб сар мешавад.', ru: 'Аналитика данных начинается без сложного программирования.', en: 'Data analytics starts without heavy programming.' } } : { id: 'python', reason: { tg: 'Python — забони асосии маълумот ва AI.', ru: 'Python — главный язык данных и AI.', en: 'Python is the main language of data and AI.' } };
    case 'design': return { id: 'ux-design', reason: { tg: 'UX/UI аз сифр: тадқиқот, wireframe ва кейс.', ru: 'UX/UI с нуля: исследование, wireframes и кейс.', en: 'UX/UI from zero: research, wireframes and a case.' } };
    case 'business': return a.goal === 'own' ? { id: 'business-foundations', reason: { tg: 'Барои лоиҳаи худ — асосҳои бизнес.', ru: 'Для своего проекта — основы бизнеса.', en: 'For your own project — business foundations.' } } : { id: 'digital-marketing', reason: { tg: 'Маркетинги рақамӣ: аудитория, канал ва метрика.', ru: 'Digital-маркетинг: аудитория, каналы и метрики.', en: 'Digital marketing: audience, channels and metrics.' } };
    default: return frontendCourse(a);
  }
}

/** Level estimated only from self-assessment, used when the placement test is skipped. */
export function selfLevel(a: OnboardingAnswers): PlacementLevel {
  if (a.coded === 'never' || a.computer === 'new') return 'beginner';
  const good = [a.html, a.javascript, a.react].filter(value => value === 'good').length;
  if (a.coded === 'yes' && good >= 2) return 'advanced';
  return good >= 1 || a.coded === 'yes' ? 'middle' : 'beginner';
}

const LEVEL_ORDER: Record<PlacementLevel, number> = { beginner: 0, middle: 1, advanced: 2 };
function compareLevels(tested: PlacementLevel, estimated: PlacementLevel): 'lower' | 'higher' | null {
  const diff = LEVEL_ORDER[tested] - LEVEL_ORDER[estimated];
  return diff < 0 ? 'lower' : diff > 0 ? 'higher' : null;
}

const PLACED_REASON: Record<PlacementLevel, Text> = {
  beginner: { tg: 'Тест нишон дод, ки аз асос сар кардан беҳтар аст — ин курс аз сифр аст.', ru: 'Тест показал, что лучше начать с основ — этот курс с нуля.', en: 'The test shows it is best to start from the basics — this course starts from zero.' },
  middle: { tg: 'Асосҳоро медонед — ин курс аз ҳамон ҷое ки донишатон тамом мешавад, давом медиҳад.', ru: 'Основы вы знаете — этот курс продолжает с того места, где заканчиваются ваши знания.', en: 'You know the basics — this course picks up where your knowledge stops.' },
  advanced: { tg: 'Сатҳи баланд — ба шумо курси пешрафта мувофиқ аст.', ru: 'Высокий уровень — вам подходит продвинутый курс.', en: 'Advanced level — an advanced course fits you.' },
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
  const weeks = Math.max(1, Math.ceil(coursePublishedDays(id) * MINUTES_PER_COURSE_DAY / weeklyMinutes));
  const deadlineMonths = Number(a.deadline) || 0;
  return {
    courseId: COURSE_CATALOG.some(course => course.id === id) ? id : 'html',
    reason, minutesPerDay, daysPerWeek, split: { theory, practice, review }, weeks,
    tight: deadlineMonths > 0 && weeks > deadlineMonths * 4.35,
    phoneOnly: a.device === 'phone',
    interviewWeekly: a.interview === 'yes',
    beginner: a.coded === 'never' || a.computer === 'new' || (placement ? placement.correct === 0 : false),
    level,
    levelSource: placement ? 'test' : 'self',
    ...(placement ? { score: { correct: placement.correct, total: 6 } } : {}),
    selfMismatch: placement ? compareLevels(placement.level, estimated) : null,
  };
}

export const ONBOARDING_STORAGE_KEY = 'devatlas-onboarding-v1';
export interface StoredOnboarding { answers: OnboardingAnswers; plan: OnboardingPlan; completedAt: string; }
export function readOnboarding(): StoredOnboarding | null {
  try {
    const raw = typeof window === 'undefined' ? null : localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as StoredOnboarding;
    if (!value || !value.plan || typeof value.plan.courseId !== 'string') return null;
    // Plans saved before the placement test have no level: estimate it from the stored answers.
    if (!value.plan.level) value.plan = { ...value.plan, level: selfLevel(value.answers ?? {}), levelSource: 'self', selfMismatch: null };
    return value;
  } catch { return null; }
}
export function saveOnboarding(answers: OnboardingAnswers, plan: OnboardingPlan) {
  try { localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ answers, plan, completedAt: new Date().toISOString() })); } catch { /* storage may be blocked */ }
}
export function courseRoute(id: CourseId) { return id === 'react' ? '/courses/react' : `/courses/${id}/plan`; }
