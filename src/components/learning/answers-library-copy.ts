import type { InterfaceLocale } from '@/lib/locale';

type AnswersLibraryCopy = {
  title: string;
  subtitle: string;
  download: string;
  prepareTitle: string;
  prepareText: string;
  topics: string;
  startReading: string;
  uniqueQuestions: string;
  sources: string;
  deepRecommended: string;
  searchPlaceholder: string;
  searchButton: string;
  resetFilters: string;
  sharedAnswer: string;
  architectureExample: string;
  pages: string;
};

/** Text of the answers library page in all four interface languages. */
export const ANSWERS_LIBRARY_COPY: Record<InterfaceLocale, AnswersLibraryCopy> = {
  ru: {
    title: 'Ответы и интервью',
    subtitle:
      'Вопросы интервью, понятные ответы и примеры кода. Учитесь объяснять решение своими словами.',
    download: 'Скачать общий HTML',
    prepareTitle: 'Как готовиться к интервью',
    prepareText:
      'Сначала поймите тему, затем прочитайте ответ, объясните его своими словами и проверьте себя.',
    topics: 'тем',
    startReading: 'Начать читать',
    uniqueQuestions: 'вопроса без повторов',
    sources: 'источника',
    deepRecommended: 'Deep · рекомендуется',
    searchPlaceholder: 'Поиск по вопросу, ответу или коду…',
    searchButton: 'Найти',
    resetFilters: 'Сбросить фильтры',
    sharedAnswer: 'Общий ответ',
    architectureExample: 'Пример архитектуры',
    pages: 'Страницы ответов',
  },
  en: {
    title: 'Answers & interview',
    subtitle:
      'Interview questions, clear answers and code examples. Learn to explain a solution in your own words.',
    download: 'Download combined HTML',
    prepareTitle: 'How to prepare for interviews',
    prepareText:
      'First understand the topic, then read the answer, explain it in your own words and check yourself.',
    topics: 'topics',
    startReading: 'Start reading',
    uniqueQuestions: 'questions without duplicates',
    sources: 'sources',
    deepRecommended: 'Deep · recommended',
    searchPlaceholder: 'Search questions, answers or code…',
    searchButton: 'Search',
    resetFilters: 'Reset filters',
    sharedAnswer: 'Shared answer',
    architectureExample: 'Architecture example',
    pages: 'Answer pages',
  },
  tg: {
    title: 'Ҷавобҳо ва мусоҳиба',
    subtitle:
      'Саволҳои мусоҳиба, ҷавобҳои фаҳмо ва мисолҳои код. Ҳалро бо суханони худ фаҳмонданро ёд гиред.',
    download: 'Боргирии HTML-и умумӣ',
    prepareTitle: 'Чӣ тавр ба мусоҳиба тайёр шудан',
    prepareText:
      'Аввал мавзӯъро фаҳмед, баъд ҷавобро хонед, онро бо суханони худ фаҳмонед ва худро санҷед.',
    topics: 'мавзӯъ',
    startReading: 'Хонданро оғоз кунед',
    uniqueQuestions: 'саволи бе такрор',
    sources: 'манбаъ',
    deepRecommended: 'Deep · тавсия мешавад',
    searchPlaceholder: 'Ҷустуҷӯ аз рӯи савол, ҷавоб ё код…',
    searchButton: 'Ёфтан',
    resetFilters: 'Тоза кардани филтрҳо',
    sharedAnswer: 'Ҷавоби умумӣ',
    architectureExample: 'Намунаи архитектура',
    pages: 'Саҳифаҳои ҷавобҳо',
  },
  es: {
    title: 'Respuestas y entrevista',
    subtitle:
      'Preguntas de entrevista, respuestas claras y ejemplos de código. Aprende a explicar una solución con tus propias palabras.',
    download: 'Descargar el HTML combinado',
    prepareTitle: 'Cómo prepararte para las entrevistas',
    prepareText:
      'Primero entiende el tema, luego lee la respuesta, explícala con tus palabras y comprueba lo que sabes.',
    topics: 'temas',
    startReading: 'Empezar a leer',
    uniqueQuestions: 'preguntas sin repetir',
    sources: 'fuentes',
    deepRecommended: 'Deep · recomendado',
    searchPlaceholder: 'Buscar en preguntas, respuestas o código…',
    searchButton: 'Buscar',
    resetFilters: 'Borrar filtros',
    sharedAnswer: 'Respuesta común',
    architectureExample: 'Ejemplo de arquitectura',
    pages: 'Páginas de respuestas',
  },
};
