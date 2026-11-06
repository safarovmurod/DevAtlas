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
  tokens: string;
  deepRecommended: string;
  searchPlaceholder: string;
  searchButton: string;
  resetFilters: string;
  sharedAnswer: string;
  architectureExample: string;
  pages: string;
};

/** Text of the answers library page in all six interface languages. */
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
    tokens: 'токенов',
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
    tokens: 'tokens',
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
    tokens: 'токен',
    deepRecommended: 'Deep · тавсия мешавад',
    searchPlaceholder: 'Ҷустуҷӯ аз рӯи савол, ҷавоб ё код…',
    searchButton: 'Ёфтан',
    resetFilters: 'Тоза кардани филтрҳо',
    sharedAnswer: 'Ҷавоби умумӣ',
    architectureExample: 'Намунаи архитектура',
    pages: 'Саҳифаҳои ҷавобҳо',
  },
  uk: {
    title: 'Відповіді та співбесіда',
    subtitle:
      'Питання співбесіди, зрозумілі відповіді й приклади коду. Вчіться пояснювати рішення своїми словами.',
    download: 'Завантажити спільний HTML',
    prepareTitle: 'Як готуватися до співбесіди',
    prepareText:
      'Спочатку зрозумійте тему, потім прочитайте відповідь, поясніть її своїми словами й перевірте себе.',
    topics: 'тем',
    startReading: 'Почати читати',
    uniqueQuestions: 'запитань без повторів',
    sources: 'джерела',
    tokens: 'токенів',
    deepRecommended: 'Deep · рекомендовано',
    searchPlaceholder: 'Пошук за запитанням, відповіддю або кодом…',
    searchButton: 'Знайти',
    resetFilters: 'Скинути фільтри',
    sharedAnswer: 'Спільна відповідь',
    architectureExample: 'Приклад архітектури',
    pages: 'Сторінки відповідей',
  },
  ja: {
    title: '解答と面接',
    subtitle:
      '面接の質問、わかりやすい解答、コード例。自分の言葉で解き方を説明できるようにしましょう。',
    download: 'まとめたHTMLをダウンロード',
    prepareTitle: '面接の準備方法',
    prepareText: 'まずテーマを理解し、解答を読み、自分の言葉で説明してから確認しましょう。',
    topics: 'トピック',
    startReading: '読み始める',
    uniqueQuestions: '件の質問（重複なし）',
    sources: 'つの資料',
    tokens: 'トークン',
    deepRecommended: 'Deep · おすすめ',
    searchPlaceholder: '質問・解答・コードを検索…',
    searchButton: '検索',
    resetFilters: '絞り込みを解除',
    sharedAnswer: '共通の解答',
    architectureExample: 'アーキテクチャの例',
    pages: '解答のページ',
  },
  ko: {
    title: '해답 및 면접',
    subtitle:
      '면접 질문, 이해하기 쉬운 답변과 코드 예시. 풀이를 자신의 말로 설명하는 법을 익히세요.',
    download: '통합 HTML 다운로드',
    prepareTitle: '면접 준비 방법',
    prepareText: '먼저 주제를 이해하고, 답변을 읽고, 자신의 말로 설명한 뒤 스스로 확인하세요.',
    topics: '주제',
    startReading: '읽기 시작',
    uniqueQuestions: '개 질문(중복 없음)',
    sources: '개 자료',
    tokens: '토큰',
    deepRecommended: 'Deep · 추천',
    searchPlaceholder: '질문, 답변 또는 코드 검색…',
    searchButton: '검색',
    resetFilters: '필터 초기화',
    sharedAnswer: '공통 답변',
    architectureExample: '아키텍처 예시',
    pages: '답변 페이지',
  },
};
