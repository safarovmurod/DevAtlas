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

/** Text of the answer reading page in all four interface languages. */
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
  es: {
    addition: 'Explicación adicional',
    saveToNotes: 'Guardar en notas',
    whatHappened: 'Qué pasó y por qué',
    context: 'Contexto de la tarea',
    shared: 'Respuestas comunes del tema',
    sharedIntro: 'Todas las explicaciones están reunidas en una sola respuesta.',
    designExample:
      'Este es un ejemplo de diseño de una aplicación. La fuente original no tiene preguntas aparte para él.',
    practiceTitle: 'Afianza el tema',
    practiceIntro: 'Después de leer, intenta responder sin ayuda.',
    allAnswers: 'Todas las respuestas',
  },
};
