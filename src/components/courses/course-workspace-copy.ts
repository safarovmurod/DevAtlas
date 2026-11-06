import type { LearningStage } from '@/content/courses/catalog';
import type { InterfaceLocale } from '@/lib/locale';

/** Text for one phrase in every interface language. */
type Localized = Record<InterfaceLocale, string>;

export const STAGE_LABELS: Record<LearningStage, Localized> = {
  beginner: {
    ru: 'Начальный · бесплатно',
    tg: 'Асосӣ · бепул',
    en: 'Beginner · free',
    uk: 'Початковий · безкоштовно',
    ja: '初級 · 無料',
    ko: '입문 · 무료',
  },
  pro: {
    ru: 'Pro · по подписке',
    tg: 'Pro · бо обуна',
    en: 'Pro · subscription',
    uk: 'Pro · за підпискою',
    ja: 'Pro · 有料',
    ko: 'Pro · 유료',
  },
  expert: {
    ru: 'Expert · по подписке',
    tg: 'Expert · бо обуна',
    en: 'Expert · subscription',
    uk: 'Expert · за підпискою',
    ja: 'Expert · 有料',
    ko: 'Expert · 유료',
  },
};

export const UNPUBLISHED_STAGE: Localized = {
  ru: 'уровень ещё не опубликован',
  tg: 'ин сатҳ ҳоло нашр нашудааст',
  en: 'stage not published yet',
  uk: 'рівень ще не опубліковано',
  ja: 'このレベルは未公開',
  ko: '아직 공개되지 않은 단계',
};

export const TRACK_LABEL: Localized = {
  ru: 'Направление',
  tg: 'Самти омӯзиш',
  en: 'Learning track',
  uk: 'Напрям',
  ja: '学習トラック',
  ko: '학습 트랙',
};

export const MASTERY_LABELS: Record<'done' | 'quiz' | 'retry', Localized> = {
  done: {
    ru: 'Результат теста: все вопросы дня пройдены',
    tg: 'Натиҷаи тест: ҳамаи саволҳои рӯз гузаштанд',
    en: 'Quiz result: all day questions passed',
    uk: 'Результат тесту: усі питання дня пройдено',
    ja: 'テスト結果：その日の全問題に正解',
    ko: '퀴즈 결과: 오늘의 모든 문제 통과',
  },
  quiz: {
    ru: 'Результат теста:',
    tg: 'Натиҷаи тест:',
    en: 'Quiz result:',
    uk: 'Результат тесту:',
    ja: 'テスト結果:',
    ko: '퀴즈 결과:',
  },
  retry: {
    ru: 'пройти тест дня',
    tg: 'гузарондани тест',
    en: 'take the day quiz',
    uk: 'пройти тест дня',
    ja: 'クイズを受ける',
    ko: '퀴즈 응시하기',
  },
};

export const MATERIALS_TITLE: Localized = {
  ru: 'Материалы курса',
  tg: 'Маводи курс',
  en: 'Course materials',
  uk: 'Матеріали курсу',
  ja: 'コース教材',
  ko: '강좌 자료',
};

export const WRONG_ANSWER: Localized = {
  ru: 'Неверно — попробуйте ещё раз',
  tg: 'Нодуруст — бори дигар кӯшиш кунед',
  en: 'Incorrect — try again',
  uk: 'Неправильно — спробуйте ще раз',
  ja: '不正解 — もう一度試しましょう',
  ko: '오답입니다 — 다시 시도하세요',
};

export const SERVER_CONFIRMATION_FAILED: Localized = {
  ru: 'Серверная запись не подтверждена. Продолжение доступно как самостоятельное обучение; подтверждённое освоение не начислено.',
  tg: 'Сабти сервер тасдиқ нашуд. Идомаи омӯзиши мустақил дастрас аст; азхудкунии тасдиқшуда дода нашуд.',
  en: 'Server recording was not confirmed. You can continue self-study; verified mastery was not granted.',
  uk: 'Серверний запис не підтверджено. Можна продовжити самостійне навчання; підтверджене опанування не надано.',
  ja: 'サーバー記録は確認できません。自主学習は続けられますが、習得の認証は付与されていません。',
  ko: '서버 기록이 확인되지 않았습니다. 자체 학습은 계속할 수 있지만 숙달 인증은 부여되지 않았습니다.',
};
