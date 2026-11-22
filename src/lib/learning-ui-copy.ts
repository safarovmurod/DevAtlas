import type { ContentLocale, InterfaceLocale } from './locale';
import {
  LEARNING_UI_COPY_EN,
  LEARNING_UI_COPY_ES,
  LEARNING_UI_COPY_TG,
} from './learning-ui-copy-translations';

export const COPY_CODE_ERROR: Record<InterfaceLocale, string> = {
  ru: 'Не удалось скопировать. Выделите код вручную.',
  en: 'Could not copy. Select the code manually.',
  tg: 'Нусхабардорӣ нашуд. Кодро дастӣ интихоб кунед.',
  es: 'No se pudo copiar. Selecciona el código a mano.',
};

// Interface text is independent of the language selected for authored lessons
// and Tutor replies. This dictionary does not imply course translation coverage.
const ru = {
  testsInterview: 'Тесты и интервью',
  answersInterview: 'Ответы и интервью',
  assessmentIntro: 'Сначала проверьте знания, затем объясните решение своими словами.',
  tests: 'Тесты',
  interview: 'Интервью',
  allCourses: 'Все курсы',
  oneMonth: '1 месяц',
  planIntro: 'Выберите день. Изучите тему, выполните практику и проверьте себя.',
  dayIntro: 'Один день — один понятный шаг. Продолжаем предыдущую работу.',
  jsMonths: 'Месяцы JavaScript',
  month: 'Месяц',
  jsBasics: 'Основы и браузер',
  jsApps: 'API и приложения',
  courseUnavailable: 'Не удалось загрузить курс.',
  retry: 'Повторить',
  firstFile: 'От первого файла до проекта',
  completedDays: 'дней завершено · теория + практика каждый день',
  day: 'День',
  startZero: 'Начать с нуля',
  current: 'Сейчас',
  basics: 'База',
  harder: 'Сложнее',
  openDay: 'Открыть мой день',
  answersFlow: 'Вопрос → понятный ответ → пример',
  answersIntro:
    'Единая библиотека подготовки к интервью. Откройте вопрос, разберите ответ и проверьте себя на практике.',
  checkYourself: 'Проверить себя',
  showMore: 'Показать ещё',
  chooseDay: 'Выбор дня',
  preparation: 'Подготовка',
  studyPlan: 'Учебный план',
  goDayOne: 'Перейти к дню 1',
  connections: 'Как связано с прошлыми днями',
  connectionsIntro:
    'Добавьте новый шаг к результату этих уроков. Старые функции должны продолжать работать.',
  dayPractice: 'Практика этого дня',
  backExplanation: 'Вернуться к объяснению',
  testIntro: 'Выберите ответ и посмотрите объяснение.',
  interviewIntro: 'Объясните своими словами, затем сравните с ответом.',
  nextDay: 'Следующий день:',
  missingDay: 'Этот день отсутствует в плане. Выберите доступный день.',
  yourCode: 'Ваш код',
  showHtml: 'Показать HTML + CSS',
  htmlResult: 'Результат вашего HTML + CSS',
  preparationFallback: 'Материал подготовки пока доступен только на русском языке.',
  contentFallback:
    'Некоторые материалы не переведены на выбранный язык обучения и показаны на {language}.',
  tutorClose: 'Закрыть Tutor',
  tutorMaterial: 'Материалы проекта',
  source: 'Источник:',
  tutorLoading: 'Ментор готовит ответ…',
  tutorSignIn:
    'Материалы уроков — бесплатно. Для использования AI сначала войдите через Google или email.',
  tutorLogin: 'Вход / регистрация',
  tutorTopic: 'Тема курса',
  tutorDeep: 'Объясни подробнее',
  tutorQuestion: 'Вопрос к Tutor',
  tutorPlaceholder: 'Напишите вопрос или код…',
  tutorSend: 'Отправить',
  tutorUnavailable: 'AI сейчас недоступен. Попробуйте позже.',
  tutorEmpty: 'Ответ пуст. Попробуйте позже.',
  tutorConnection: 'Соединение прервалось или AI не ответил вовремя. Попробуйте позже.',
  tutorInvalid: 'Вопрос или история чата некорректны либо слишком длинные.',
  tutorSignInRequired: 'Для вопроса к AI войдите через Google или email.',
  tutorAuthUnavailable: 'Вход в аккаунт пока не подключён. AI станет доступен после его настройки.',
  tutorUnconfigured: 'Ключ AI не настроен на сервере. Используйте материалы уроков.',
  tutorBusy: 'Подождите: запрос к AI уже отправлен.',
  tutorRejected: 'Ключ AI или доступ к модели не принят. Проверьте настройки сервера.',
  tutorBudgetConfig:
    'Расходы на онлайн-AI не включены. Ответы из материалов курса доступны бесплатно.',
  tutorBudgetUnavailable:
    'Не удалось проверить лимит AI. Попробуйте позже; материалы курса доступны.',
  tutorBudgetLimit:
    'Достигнут лимит AI или частоты запросов. Повторите позже; материалы курса доступны.',
  tutorQuota: 'Лимит или токены AI-провайдера закончились. Проверьте аккаунт провайдера.',
  tutorBlocked:
    'Доступ к AI Tutor временно заблокирован на 3 дня из-за 3 предупреждений вне тем курсов. Уроки и тесты остаются открыты.',
  tutorUnreadable: 'AI не прислал читаемый ответ. Попробуйте позже.',
  promptReact: 'Для чего нужен useState?',
  promptTopic: 'Подробно объясни первую тему курса.',
  promptDeep: 'Объясни предыдущий вопрос глубже, шаг за шагом.',
};

export type LearningUiCopy = typeof ru;

export const LEARNING_UI_COPY: Record<InterfaceLocale, LearningUiCopy> = {
  ru,
  en: LEARNING_UI_COPY_EN,
  tg: LEARNING_UI_COPY_TG,
  es: LEARNING_UI_COPY_ES,
};

/** Language names for the "shown in …" note, in the grammatical form each interface language needs. */
const FALLBACK_LANGUAGE_NAMES: Record<InterfaceLocale, Record<ContentLocale, string>> = {
  ru: { ru: 'русском', en: 'английском', tg: 'таджикском' },
  en: { ru: 'Russian', en: 'English', tg: 'Tajik' },
  tg: { ru: 'русӣ', en: 'англисӣ', tg: 'тоҷикӣ' },
  es: { ru: 'ruso', en: 'inglés', tg: 'tayiko' },
};

/** Note shown when some lesson text is missing and another language is displayed instead. */
export function contentFallbackNotice(locale: InterfaceLocale, fallback: ContentLocale): string {
  return LEARNING_UI_COPY[locale].contentFallback.replace(
    '{language}',
    FALLBACK_LANGUAGE_NAMES[locale][fallback],
  );
}

export type TutorErrorKey =
  | 'tutorUnavailable'
  | 'tutorEmpty'
  | 'tutorConnection'
  | 'tutorInvalid'
  | 'tutorSignInRequired'
  | 'tutorAuthUnavailable'
  | 'tutorUnconfigured'
  | 'tutorBusy'
  | 'tutorRejected'
  | 'tutorQuota'
  | 'tutorBlocked'
  | 'tutorUnreadable'
  | 'tutorBudgetConfig'
  | 'tutorBudgetUnavailable'
  | 'tutorBudgetLimit';

/** A translated interface does not imply translated authored lessons. */
export function lessonTranslationNotice(locale: InterfaceLocale): string | null {
  if (locale === 'es')
    return 'Las lecciones están disponibles en tayiko, ruso e inglés. Aún no hay traducción al español. Puedes cambiar el idioma de los materiales en Ajustes.';
  return null;
}

// The current API supplies messages rather than stable codes. Recognize known
// application failures; never show untrusted provider or browser errors as UI.
export function tutorErrorKey(status: number, message: unknown): TutorErrorKey {
  if (message === 'tutor_blocked') return 'tutorBlocked';
  if (message === 'ai_budget_not_configured') return 'tutorBudgetConfig';
  if (message === 'ai_budget_unavailable') return 'tutorBudgetUnavailable';
  if (message === 'ai_budget_exhausted') return 'tutorBudgetLimit';
  if (typeof message === 'string') {
    for (const key of [
      'tutorSignInRequired',
      'tutorAuthUnavailable',
      'tutorUnconfigured',
      'tutorBusy',
      'tutorRejected',
      'tutorQuota',
      'tutorUnreadable',
      'tutorInvalid',
    ] as const) {
      if (message === LEARNING_UI_COPY.tg[key]) return key;
    }
  }
  if (status === 401) return 'tutorSignInRequired';
  if (status === 400) return 'tutorInvalid';
  if (status === 429) return 'tutorQuota';
  return 'tutorUnavailable';
}
