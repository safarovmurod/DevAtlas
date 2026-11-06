// The 15 onboarding questions and their shared types.

/** Onboarding copy is authored in TG/RU/EN; other interface locales fall back to RU or EN. */
export type OnboardingLocale = 'tg' | 'ru' | 'en';
export type Text = Record<OnboardingLocale, string>;
export function onboardingLocale(locale: string): OnboardingLocale {
  if (locale === 'tg' || locale === 'ru' || locale === 'en') return locale;
  return locale === 'uk' ? 'ru' : 'en';
}

export interface OnboardingQuestion {
  id: QuestionId;
  question: Text;
  options: { value: string; label: Text }[];
}
export type QuestionId =
  | 'goal'
  | 'direction'
  | 'computer'
  | 'coded'
  | 'html'
  | 'javascript'
  | 'react'
  | 'device'
  | 'minutes'
  | 'days'
  | 'style'
  | 'english'
  | 'deadline'
  | 'language'
  | 'interview';
export type OnboardingAnswers = Partial<Record<QuestionId, string>>;

/** A question about how well the learner knows a technology. */
const level = (id: QuestionId, tg: string, ru: string, en: string): OnboardingQuestion => ({
  id,
  question: { tg, ru, en },
  options: [
    { value: 'none', label: { tg: 'Тамоман намедонам', ru: 'Совсем не знаю', en: 'Not at all' } },
    { value: 'basic', label: { tg: 'Каме медонам', ru: 'Знаю основы', en: 'I know the basics' } },
    {
      value: 'good',
      label: {
        tg: 'Хуб медонам, проект сохтаам',
        ru: 'Знаю хорошо, делал проект',
        en: 'Well — I built a project',
      },
    },
  ],
});

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'goal',
    question: {
      tg: 'Мақсади асосии шумо чист?',
      ru: 'Какая у вас главная цель?',
      en: 'What is your main goal?',
    },
    options: [
      {
        value: 'job',
        label: {
          tg: 'Кор ёфтан ҳамчун разработчик',
          ru: 'Найти работу разработчиком',
          en: 'Get a developer job',
        },
      },
      {
        value: 'freelance',
        label: { tg: 'Фриланс ва фармоишҳо', ru: 'Фриланс и заказы', en: 'Freelance and clients' },
      },
      {
        value: 'own',
        label: {
          tg: 'Лоиҳа ё бизнеси худам',
          ru: 'Свой проект или бизнес',
          en: 'My own project or business',
        },
      },
      {
        value: 'curious',
        label: { tg: 'Танҳо фаҳмидан мехоҳам', ru: 'Просто хочу разобраться', en: 'Just curious' },
      },
    ],
  },
  {
    id: 'direction',
    question: {
      tg: 'Кадом самт ба шумо бештар маъқул аст?',
      ru: 'Какое направление вам ближе?',
      en: 'Which direction interests you most?',
    },
    options: [
      {
        value: 'frontend',
        label: {
          tg: 'Сайтҳо ва интерфейс (Frontend)',
          ru: 'Сайты и интерфейсы (Frontend)',
          en: 'Websites and interfaces (Frontend)',
        },
      },
      {
        value: 'backend',
        label: {
          tg: 'Сервер ва база (Backend)',
          ru: 'Сервер и базы данных (Backend)',
          en: 'Servers and databases (Backend)',
        },
      },
      {
        value: 'mobile',
        label: { tg: 'Барномаҳои телефон', ru: 'Мобильные приложения', en: 'Mobile apps' },
      },
      { value: 'data', label: { tg: 'Маълумот ва AI', ru: 'Данные и AI', en: 'Data and AI' } },
      {
        value: 'design',
        label: { tg: 'Дизайн (UX/UI)', ru: 'Дизайн (UX/UI)', en: 'Design (UX/UI)' },
      },
      {
        value: 'business',
        label: {
          tg: 'Маркетинг ва бизнес',
          ru: 'Маркетинг и бизнес',
          en: 'Marketing and business',
        },
      },
      { value: 'unknown', label: { tg: 'Ҳоло намедонам', ru: 'Пока не знаю', en: 'Not sure yet' } },
    ],
  },
  {
    id: 'computer',
    question: {
      tg: 'Бо компютер чӣ қадар озод кор мекунед?',
      ru: 'Насколько уверенно вы пользуетесь компьютером?',
      en: 'How comfortable are you with a computer?',
    },
    options: [
      {
        value: 'new',
        label: {
          tg: 'Душвор: файл ва папка ҳам нав аст',
          ru: 'Сложно: файлы и папки — новое',
          en: 'Hard: files and folders are new',
        },
      },
      { value: 'ok', label: { tg: 'Муқаррарӣ', ru: 'Обычно', en: 'Normal' } },
      {
        value: 'good',
        label: {
          tg: 'Хуб, барномаҳо насб мекунам',
          ru: 'Уверенно, сам ставлю программы',
          en: 'Confident, I install software',
        },
      },
    ],
  },
  {
    id: 'coded',
    question: {
      tg: 'Ягон бор код навиштаед?',
      ru: 'Вы когда-нибудь писали код?',
      en: 'Have you ever written code?',
    },
    options: [
      { value: 'never', label: { tg: 'Ҳеҷ гоҳ', ru: 'Никогда', en: 'Never' } },
      {
        value: 'little',
        label: {
          tg: 'Каме, аз видео ё курс',
          ru: 'Немного, по видео или курсу',
          en: 'A little, from videos or a course',
        },
      },
      { value: 'yes', label: { tg: 'Бале, мунтазам', ru: 'Да, регулярно', en: 'Yes, regularly' } },
    ],
  },
  level(
    'html',
    'HTML ва CSS-ро чӣ қадар медонед?',
    'Насколько вы знаете HTML и CSS?',
    'How well do you know HTML and CSS?',
  ),
  level(
    'javascript',
    'JavaScript-ро чӣ қадар медонед?',
    'Насколько вы знаете JavaScript?',
    'How well do you know JavaScript?',
  ),
  level(
    'react',
    'React-ро чӣ қадар медонед?',
    'Насколько вы знаете React?',
    'How well do you know React?',
  ),
  {
    id: 'device',
    question: {
      tg: 'Дар чӣ мехонед?',
      ru: 'На чём вы будете учиться?',
      en: 'What will you study on?',
    },
    options: [
      {
        value: 'computer',
        label: { tg: 'Компютер ё ноутбук', ru: 'Компьютер или ноутбук', en: 'Computer or laptop' },
      },
      { value: 'phone', label: { tg: 'Фақат телефон', ru: 'Только телефон', en: 'Phone only' } },
    ],
  },
  {
    id: 'minutes',
    question: {
      tg: 'Дар як рӯз чанд вақт доред?',
      ru: 'Сколько времени в день у вас есть?',
      en: 'How much time per day do you have?',
    },
    options: [
      { value: '20', label: { tg: '15–20 дақиқа', ru: '15–20 минут', en: '15–20 minutes' } },
      {
        value: '45',
        label: { tg: 'Тақрибан 45 дақиқа', ru: 'Около 45 минут', en: 'About 45 minutes' },
      },
      { value: '90', label: { tg: '1–1,5 соат', ru: '1–1,5 часа', en: '1–1.5 hours' } },
      {
        value: '180',
        label: { tg: '3 соат ва зиёд', ru: '3 часа и больше', en: '3 hours or more' },
      },
    ],
  },
  {
    id: 'days',
    question: {
      tg: 'Дар як ҳафта чанд рӯз мехонед?',
      ru: 'Сколько дней в неделю будете учиться?',
      en: 'How many days a week will you study?',
    },
    options: [
      { value: '3', label: { tg: '3 рӯз', ru: '3 дня', en: '3 days' } },
      { value: '5', label: { tg: '5 рӯз', ru: '5 дней', en: '5 days' } },
      { value: '6', label: { tg: '6 рӯз', ru: '6 дней', en: '6 days' } },
      { value: '7', label: { tg: 'Ҳар рӯз', ru: 'Каждый день', en: 'Every day' } },
    ],
  },
  {
    id: 'style',
    question: {
      tg: 'Чӣ тавр беҳтар мефаҳмед?',
      ru: 'Как вам легче понимать?',
      en: 'How do you learn best?',
    },
    options: [
      {
        value: 'read',
        label: { tg: 'Хондан ва мисол', ru: 'Читать с примерами', en: 'Reading with examples' },
      },
      {
        value: 'practice',
        label: { tg: 'Фавран кор кардан', ru: 'Сразу делать руками', en: 'Hands-on right away' },
      },
      { value: 'game', label: { tg: 'Бозӣ ва тест', ru: 'Игры и тесты', en: 'Games and quizzes' } },
      {
        value: 'talk',
        label: { tg: 'Савол додан ба ментор', ru: 'Спрашивать наставника', en: 'Asking a mentor' },
      },
    ],
  },
  {
    id: 'english',
    question: {
      tg: 'Забони англисиро чӣ қадар медонед?',
      ru: 'Как вы знаете английский?',
      en: 'How is your English?',
    },
    options: [
      { value: 'none', label: { tg: 'Намедонам', ru: 'Не знаю', en: 'None' } },
      { value: 'basic', label: { tg: 'Калимаҳои оддӣ', ru: 'Простые слова', en: 'Simple words' } },
      {
        value: 'good',
        label: { tg: 'Ҳуҷҷатро мехонам', ru: 'Читаю документацию', en: 'I read documentation' },
      },
    ],
  },
  {
    id: 'deadline',
    question: {
      tg: 'Дар кадом муддат натиҷа мехоҳед?',
      ru: 'За какой срок хотите результат?',
      en: 'When do you want results?',
    },
    options: [
      { value: '1', label: { tg: '1 моҳ', ru: '1 месяц', en: '1 month' } },
      { value: '3', label: { tg: '3 моҳ', ru: '3 месяца', en: '3 months' } },
      { value: '6', label: { tg: '6 моҳ', ru: '6 месяцев', en: '6 months' } },
      { value: '0', label: { tg: 'Шитоб надорам', ru: 'Не спешу', en: 'No rush' } },
    ],
  },
  {
    id: 'language',
    question: {
      tg: 'Дарсҳо бо кадом забон бошанд?',
      ru: 'На каком языке уроки?',
      en: 'Which language for lessons?',
    },
    options: [
      { value: 'tg', label: { tg: 'Тоҷикӣ', ru: 'Таджикский', en: 'Tajik' } },
      { value: 'ru', label: { tg: 'Русӣ', ru: 'Русский', en: 'Russian' } },
      { value: 'en', label: { tg: 'Англисӣ', ru: 'Английский', en: 'English' } },
    ],
  },
  {
    id: 'interview',
    question: {
      tg: 'Тайёрӣ ба интервью лозим аст?',
      ru: 'Нужна подготовка к собеседованию?',
      en: 'Do you need interview preparation?',
    },
    options: [
      {
        value: 'yes',
        label: { tg: 'Бале, ҳар ҳафта', ru: 'Да, каждую неделю', en: 'Yes, every week' },
      },
      { value: 'later', label: { tg: 'Баъдтар', ru: 'Позже', en: 'Later' } },
      { value: 'no', label: { tg: 'Не', ru: 'Нет', en: 'No' } },
    ],
  },
];
