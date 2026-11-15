import type { InterfaceLocale } from '@/lib/locale';

/** Text for one phrase in every interface language. */
type Localized = Record<InterfaceLocale, string>;

export const TRACK_LABEL: Localized = {
  ru: 'Направление',
  tg: 'Самти омӯзиш',
  en: 'Learning track',
  es: 'Ruta de aprendizaje',
};

export const MASTERY_LABELS: Record<'done' | 'quiz' | 'retry', Localized> = {
  done: {
    ru: 'Результат теста: все вопросы дня пройдены',
    tg: 'Натиҷаи тест: ҳамаи саволҳои рӯз гузаштанд',
    en: 'Quiz result: all day questions passed',
    es: 'Resultado de la prueba: todas las preguntas del día superadas',
  },
  quiz: {
    ru: 'Результат теста:',
    tg: 'Натиҷаи тест:',
    en: 'Quiz result:',
    es: 'Resultado de la prueba:',
  },
  retry: {
    ru: 'пройти тест дня',
    tg: 'гузарондани тест',
    en: 'take the day quiz',
    es: 'hacer la prueba del día',
  },
};

export const MATERIALS_TITLE: Localized = {
  ru: 'Материалы курса',
  tg: 'Маводи курс',
  en: 'Course materials',
  es: 'Materiales del curso',
};

export const WRONG_ANSWER: Localized = {
  ru: 'Неверно — попробуйте ещё раз',
  tg: 'Нодуруст — бори дигар кӯшиш кунед',
  en: 'Incorrect — try again',
  es: 'Incorrecto: inténtalo de nuevo',
};

export const SERVER_CONFIRMATION_FAILED: Localized = {
  ru: 'Серверная запись не подтверждена. Продолжение доступно как самостоятельное обучение; подтверждённое освоение не начислено.',
  tg: 'Сабти сервер тасдиқ нашуд. Идомаи омӯзиши мустақил дастрас аст; азхудкунии тасдиқшуда дода нашуд.',
  en: 'Server recording was not confirmed. You can continue self-study; verified mastery was not granted.',
  es: 'No se confirmó el registro en el servidor. Puedes seguir estudiando por tu cuenta, pero no se concedió el dominio verificado.',
};
