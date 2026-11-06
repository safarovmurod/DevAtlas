import type { InterfaceLocale } from '@/lib/locale';

type AnswerReaderCopy = {
  addition: string;
  saveToNotes: string;
  whatHappened: string;
  context: string;
  shared: string;
  sharedIntro: string;
  designExample: string;
  practiceTitle: string;
  practiceIntro: string;
  allAnswers: string;
};

/** Text of the answer reading page in all six interface languages. */
export const ANSWER_READER_COPY: Record<InterfaceLocale, AnswerReaderCopy> = {
  ru: {
    addition: 'Дополнение',
    saveToNotes: 'В заметки',
    whatHappened: 'Что произошло и почему',
    context: 'Контекст задачи',
    shared: 'Общие ответы по теме',
    sharedIntro: 'Все объяснения собраны в одном ответе.',
    designExample:
      'Это пример проектирования приложения. В исходном файле у него нет отдельных вопросов.',
    practiceTitle: 'Закрепить тему',
    practiceIntro: 'После чтения попробуйте ответить без подсказки.',
    allAnswers: 'Все ответы',
  },
  en: {
    addition: 'Additional explanation',
    saveToNotes: 'Save to notes',
    whatHappened: 'What happened and why',
    context: 'Task context',
    shared: 'Shared answers for this topic',
    sharedIntro: 'All explanations are collected in one answer.',
    designExample:
      'This is an application design example. The source has no separate questions for it.',
    practiceTitle: 'Practice this topic',
    practiceIntro: 'After reading, try answering without a hint.',
    allAnswers: 'All answers',
  },
  tg: {
    addition: 'Иловаи шарҳ',
    saveToNotes: 'Ба ёддоштҳо',
    whatHappened: 'Чӣ шуд ва чаро',
    context: 'Шарти масъала',
    shared: 'Ҷавобҳои умумии мавзӯъ',
    sharedIntro: 'Ҳамаи шарҳҳо дар як ҷавоб ҷамъ шудаанд.',
    designExample:
      'Ин намунаи тарҳрезии барнома аст. Дар файли аслӣ барои он саволҳои алоҳида нест.',
    practiceTitle: 'Мавзӯъро мустаҳкам кунед',
    practiceIntro: 'Баъди хондан кӯшиш кунед, ки бе маслиҳат ҷавоб диҳед.',
    allAnswers: 'Ҳамаи ҷавобҳо',
  },
  uk: {
    addition: 'Доповнення',
    saveToNotes: 'До нотаток',
    whatHappened: 'Що сталося і чому',
    context: 'Контекст завдання',
    shared: 'Спільні відповіді за темою',
    sharedIntro: 'Усі пояснення зібрано в одній відповіді.',
    designExample:
      'Це приклад проєктування застосунку. У вихідному файлі для нього немає окремих запитань.',
    practiceTitle: 'Закріпити тему',
    practiceIntro: 'Після читання спробуйте відповісти без підказки.',
    allAnswers: 'Усі відповіді',
  },
  ja: {
    addition: '補足説明',
    saveToNotes: 'ノートに保存',
    whatHappened: '何が起きたのか、なぜか',
    context: '課題の前提',
    shared: 'このテーマの共通の回答',
    sharedIntro: 'すべての説明を1つの回答にまとめています。',
    designExample: 'これはアプリ設計の例です。元の資料には個別の質問がありません。',
    practiceTitle: 'このテーマを練習',
    practiceIntro: '読んだあと、ヒントなしで答えてみましょう。',
    allAnswers: 'すべての回答',
  },
  ko: {
    addition: '추가 설명',
    saveToNotes: '노트에 저장',
    whatHappened: '무슨 일이 일어났고 왜 그런가',
    context: '과제 배경',
    shared: '이 주제의 공통 답변',
    sharedIntro: '모든 설명을 하나의 답변에 모았습니다.',
    designExample: '애플리케이션 설계 예시입니다. 원본 자료에는 별도의 질문이 없습니다.',
    practiceTitle: '이 주제 연습하기',
    practiceIntro: '읽은 후 힌트 없이 답해 보세요.',
    allAnswers: '모든 답변',
  },
};
