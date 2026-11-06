import type { InterfaceLocale } from './locale';
import { JAPANESE_LEARNING_COPY } from './locales/ja';
import { KOREAN_LEARNING_COPY } from './locales/ko';
import {
  LEARNING_UI_COPY_EN,
  LEARNING_UI_COPY_TG,
  LEARNING_UI_COPY_UK,
} from './learning-ui-copy-translations';

export const COPY_CODE_ERROR: Record<InterfaceLocale, string> = {
  ru: 'Не удалось скопировать. Выделите код вручную.',
  en: 'Could not copy. Select the code manually.',
  tg: 'Нусхабардорӣ нашуд. Кодро дастӣ интихоб кунед.',
  uk: 'Не вдалося скопіювати. Виділіть код вручну.',
  ja: 'コピーできませんでした。コードを手動で選択してください。',
  ko: '복사하지 못했습니다. 코드를 직접 선택해 주세요.',
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
    'Некоторые материалы не переведены на выбранный язык обучения и показаны на русском.',
  tutorWelcome:
    'Здравствуйте! Сначала найдём ответ в материалах проекта: бесплатно, без токенов. Для новых вопросов используется AI — войдите через Google или email.',
  tutorIntro: 'Сначала материалы проекта · AI для новых вопросов',
  tutorClose: 'Закрыть Tutor',
  tutorMaterial: 'Материалы проекта',
  tutorLocal: 'Локально',
  tokens: 'токенов',
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
  tutorSpent: 'В этом разговоре использовано:',
  tutorCaution: 'AI может ошибаться; проверяйте код.',
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
  tutorQuota: 'Лимит или токены AnyModel закончились. Проверьте аккаунт провайдера.',
  tutorUnreadable: 'AI не прислал читаемый ответ. Попробуйте позже.',
  promptReact: 'Для чего нужен useState?',
  promptTopic: 'Подробно объясни первую тему курса.',
  promptDeep: 'Объясни предыдущий вопрос глубже, шаг за шагом.',
};

export type LearningUiCopy = typeof ru;

export const LEARNING_UI_COPY: Record<InterfaceLocale, LearningUiCopy> = {
  ja: JAPANESE_LEARNING_COPY,
  ko: KOREAN_LEARNING_COPY,
  ru,
  en: LEARNING_UI_COPY_EN,
  tg: LEARNING_UI_COPY_TG,
  uk: LEARNING_UI_COPY_UK,
};

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
  | 'tutorUnreadable'
  | 'tutorBudgetConfig'
  | 'tutorBudgetUnavailable'
  | 'tutorBudgetLimit';

/** A translated interface does not imply translated authored lessons. */
export function lessonTranslationNotice(locale: InterfaceLocale): string | null {
  if (locale === 'ja')
    return '教材はタジク語・ロシア語・英語に対応しています。日本語の教材翻訳はまだありません。設定で教材の言語を変更できます。';
  if (locale === 'ko')
    return '학습 자료는 타지크어, 러시아어, 영어로 제공됩니다. 한국어로 번역된 학습 자료는 아직 없습니다. 설정에서 학습 자료 언어를 변경할 수 있습니다.';
  if (locale === 'uk')
    return 'Навчальні матеріали доступні таджицькою, російською та англійською. Мову матеріалів можна змінити в налаштуваннях.';
  return null;
}

// The current API supplies messages rather than stable codes. Recognize known
// application failures; never show untrusted provider or browser errors as UI.
export function tutorErrorKey(status: number, message: unknown): TutorErrorKey {
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
