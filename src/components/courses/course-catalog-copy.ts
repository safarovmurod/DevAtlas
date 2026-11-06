import { courseTopicCount } from '@/lib/course-copy';
import type { InterfaceLocale } from '@/lib/locale';

/** Text of the course cards and the catalog heading. */
type CatalogCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  route: string;
  routeNote: string;
  selected: string;
  recommended: string;
  jsDescription: string;
  after: string;
  fromZero: string;
  ready: (count: number) => string;
  wait: string;
  unavailable: string;
  checking: string;
  choose: string;
  continue: string;
};

export const CATALOG_UI: Record<InterfaceLocale, CatalogCopy> = {
  ru: {
    eyebrow: 'ОБРАЗОВАНИЕ ДЛЯ ВАШИХ ЦЕЛЕЙ',
    title: 'Навыки начинаются с практики.',
    intro:
      'От первого интереса до нового навыка. Выберите направление и учитесь через понятные уроки и практику.',
    route: 'Рекомендуемый путь для веб-разработки',
    routeNote: 'Начните с HTML. Каждый следующий день открывается после завершения предыдущего.',
    selected: 'Выбрано',
    recommended: 'Рекомендуем начать',
    jsDescription: 'Месяц 1 — JS1: массивы, объекты и задачи. Месяц 2 — JS2: API и запросы.',
    after: 'После ',
    fromZero: 'Можно начать с нуля',
    ready: (count) => `${courseTopicCount(count, 'ru')} · можно учиться`,
    wait: 'Материалы ожидаются',
    unavailable: 'Статус материалов недоступен',
    checking: 'Проверяем материалы…',
    choose: 'Выбрать',
    continue: 'Продолжить курс',
  },
  en: {
    eyebrow: 'YOUR LEARNING',
    title: 'What would you like to learn?',
    intro: 'Choose a path. Switch anytime; each course keeps its own progress and notes.',
    route: 'Recommended web development path',
    routeNote: 'Study Git alongside this path. C++ is a separate path.',
    selected: 'Selected',
    recommended: 'Recommended start',
    jsDescription:
      'Month 1 — JS1: arrays, objects and exercises. Month 2 — JS2: APIs and requests.',
    after: 'After ',
    fromZero: 'Start from scratch',
    ready: (count) => `${count} topics · ready`,
    wait: 'Waiting for materials',
    unavailable: 'Material status unavailable',
    checking: 'Checking materials…',
    choose: 'Choose course',
    continue: 'Continue course',
  },
  tg: {
    eyebrow: 'ОМӮЗИШИ ШУМО',
    title: 'Чиро меомӯзем?',
    intro:
      'Самтро интихоб кунед. Ҳар вақт курсро иваз кунед — пешрафт ва ёддоштҳои ҳар курс алоҳида мемонанд.',
    route: 'Роҳи тавсияшавандаи веб-барномасозӣ',
    routeNote: 'Git-ро ҳамзамон омӯзед. C++ самти алоҳида аст.',
    selected: 'Интихоб шудааст',
    recommended: 'Аз ин ҷо оғоз кунед',
    jsDescription: 'Моҳи 1 — JS1: массивҳо, объектҳо ва машқҳо. Моҳи 2 — JS2: API ва дархостҳо.',
    after: 'Баъд аз ',
    fromZero: 'Аз сифр оғоз кардан мумкин',
    ready: (count) => `${count} мавзӯъ · омода`,
    wait: 'Мавод ҳоло омода нест',
    unavailable: 'Ҳолати мавод дастрас нест',
    checking: 'Мавод санҷида мешавад…',
    choose: 'Интихоби курс',
    continue: 'Идома додани курс',
  },
  ja: {
    eyebrow: 'あなたの目標に合わせた学び',
    title: '実践からスキルを身につける。',
    intro: '学習分野を選びましょう。短いレッスンと実践的な課題で、毎日一歩ずつ進めます。',
    route: 'ウェブ開発の学習ルート',
    routeNote: 'HTMLから始めましょう。前の日を完了すると次の日に進めます。',
    selected: '選択中',
    recommended: '初めての方におすすめ',
    jsDescription: '1か月目：配列、オブジェクト、演習。2か月目：APIとリクエスト。',
    after: '前提：',
    fromZero: '初心者向け',
    ready: (count) => `${count} トピック · 学習可能`,
    wait: '教材を準備中',
    unavailable: '教材の状態を取得できません',
    checking: '教材を確認中…',
    choose: 'コースを選ぶ',
    continue: '学習を続ける',
  },
  ko: {
    eyebrow: '목표에 맞는 배움',
    title: '실습으로 실력을 쌓으세요.',
    intro: '학습 분야를 선택하세요. 짧은 수업과 실습 과제로 매일 한 단계씩 나아갑니다.',
    route: '웹 개발 추천 학습 경로',
    routeNote: 'HTML부터 시작하세요. 이전 학습일을 완료하면 다음 날이 열립니다.',
    selected: '선택됨',
    recommended: '처음 시작하기 좋아요',
    jsDescription: '1개월 차: 배열, 객체, 연습 문제. 2개월 차: API와 요청.',
    after: '선수 과정: ',
    fromZero: '기초부터 시작',
    ready: (count) => `${count}개 주제 · 학습 가능`,
    wait: '학습 자료 준비 중',
    unavailable: '학습 자료 상태를 불러올 수 없습니다',
    checking: '학습 자료 확인 중…',
    choose: '강좌 선택',
    continue: '학습 계속하기',
  },
  uk: {
    eyebrow: 'ВАШЕ НАВЧАННЯ',
    title: 'Що вивчатимемо?',
    intro:
      'Оберіть напрям. Можна перемикатися будь-коли — прогрес і нотатки кожного курсу зберігаються окремо.',
    route: 'Рекомендований шлях веброзробки',
    routeNote: 'Вивчайте Git паралельно. C++ — окремий напрям.',
    selected: 'Обрано',
    recommended: 'Радимо почати тут',
    jsDescription: 'Місяць 1 — JS1: масиви, об’єкти й завдання. Місяць 2 — JS2: API й запити.',
    after: 'Після ',
    fromZero: 'Можна почати з нуля',
    ready: (count) => `${courseTopicCount(count, 'uk')} · готово`,
    wait: 'Матеріали очікуються',
    unavailable: 'Стан матеріалів недоступний',
    checking: 'Перевіряємо матеріали…',
    choose: 'Обрати курс',
    continue: 'Продовжити курс',
  },
};

/** Text of the category browser, search and empty state. */
export const BROWSE_COPY: Record<InterfaceLocale, Record<string, string>> = {
  ru: {
    categories: 'Направления обучения',
    all: 'Все направления',
    allTracks: 'Все специализации',
    browse: 'Каталог курсов',
    programming: 'Специализации в программировании',
    reset: 'Сбросить фильтры',
    empty: 'В этом направлении пока нет подходящих курсов. Выберите другое или измените поиск.',
    intro: 'Вводный модуль',
    search: 'Название курса или навык',
    searchLabel: 'Найти курс',
    noResults: 'Курс не найден. Попробуйте другое название.',
  },
  en: {
    categories: 'Explore learning paths',
    all: 'All categories',
    allTracks: 'All specializations',
    browse: 'Course catalog',
    programming: 'Programming specializations',
    reset: 'Reset filters',
    empty:
      'No matching courses in this category yet. Choose another category or change your search.',
    intro: 'Introductory module',
    search: 'Course name or skill',
    searchLabel: 'Find a course',
    noResults: 'No courses found. Try another name.',
  },
  tg: {
    categories: 'Самтҳои омӯзиш',
    all: 'Ҳамаи самтҳо',
    allTracks: 'Ҳамаи ихтисосҳо',
    browse: 'Феҳристи курсҳо',
    programming: 'Ихтисосҳои барномасозӣ',
    reset: 'Тоза кардани филтрҳо',
    empty: 'Дар ин самт курси мувофиқ ҳоло нест. Самти дигар ё ҷустуҷӯи дигарро интихоб кунед.',
    intro: 'Модули муқаддимавӣ',
    search: 'Номи курс ё малака',
    searchLabel: 'Ҷустуҷӯи курс',
    noResults: 'Курс ёфт нашуд. Номи дигарро санҷед.',
  },
  uk: {
    categories: 'Напрями навчання',
    all: 'Усі напрями',
    allTracks: 'Усі спеціалізації',
    browse: 'Каталог курсів',
    programming: 'Спеціалізації у програмуванні',
    reset: 'Скинути фільтри',
    empty: 'У цьому напрямі поки немає відповідних курсів. Оберіть інший напрям або змініть пошук.',
    intro: 'Вступний модуль',
    search: 'Назва курсу або навичка',
    searchLabel: 'Знайти курс',
    noResults: 'Курс не знайдено. Спробуйте іншу назву.',
  },
  ja: {
    categories: '学習分野を探す',
    all: 'すべての分野',
    allTracks: 'すべての専門分野',
    browse: 'コース一覧',
    programming: 'プログラミングの専門分野',
    reset: '絞り込みを解除',
    empty: '該当するコースはまだありません。別の分野や検索語をお試しください。',
    intro: '入門モジュール',
    search: 'コース名またはスキル',
    searchLabel: 'コースを検索',
    noResults: 'コースが見つかりません。別の名前で検索してください。',
  },
  ko: {
    categories: '학습 분야 둘러보기',
    all: '모든 분야',
    allTracks: '모든 세부 분야',
    browse: '강좌 목록',
    programming: '프로그래밍 세부 분야',
    reset: '필터 초기화',
    empty: '조건에 맞는 강좌가 아직 없습니다. 다른 분야나 검색어를 선택하세요.',
    intro: '입문 모듈',
    search: '강좌 이름 또는 기술',
    searchLabel: '강좌 검색',
    noResults: '강좌를 찾을 수 없습니다. 다른 이름으로 검색해 보세요.',
  },
};

/** Labels of the "start" and "length" filters. */
export const EXTRA_FILTER_COPY: Record<
  InterfaceLocale,
  {
    start: string;
    length: string;
    starts: Record<'all' | 'zero' | 'next', string>;
    lengths: Record<'all' | 'short' | 'month' | 'long', string>;
  }
> = {
  tg: {
    start: 'Оғоз',
    length: 'Давомнокӣ',
    starts: { all: 'Ҳама', zero: 'Аз сифр', next: 'Баъд аз курси дигар' },
    lengths: { all: 'Ҳама', short: 'То 14 рӯз', month: '30 рӯз', long: '44+ рӯз' },
  },
  ru: {
    start: 'Старт',
    length: 'Длительность',
    starts: { all: 'Все', zero: 'С нуля', next: 'После другого курса' },
    lengths: { all: 'Все', short: 'До 14 дней', month: '30 дней', long: '44+ дней' },
  },
  en: {
    start: 'Start',
    length: 'Length',
    starts: { all: 'All', zero: 'From zero', next: 'After another course' },
    lengths: { all: 'All', short: 'Up to 14 days', month: '30 days', long: '44+ days' },
  },
  uk: {
    start: 'Старт',
    length: 'Тривалість',
    starts: { all: 'Усі', zero: 'З нуля', next: 'Після іншого курсу' },
    lengths: { all: 'Усі', short: 'До 14 днів', month: '30 днів', long: '44+ днів' },
  },
  ja: {
    start: '開始',
    length: '期間',
    starts: { all: 'すべて', zero: '初心者から', next: '他のコースの後' },
    lengths: { all: 'すべて', short: '14日まで', month: '30日', long: '44日以上' },
  },
  ko: {
    start: '시작',
    length: '기간',
    starts: { all: '전체', zero: '처음부터', next: '다른 강좌 이후' },
    lengths: { all: '전체', short: '14일 이하', month: '30일', long: '44일 이상' },
  },
};

/** "3 courses" with the correct plural form for each language. */
export function courseCountLabel(count: number, locale: InterfaceLocale) {
  const plural = new Intl.PluralRules(locale).select(count);
  if (locale === 'ru')
    return `${count} ${plural === 'one' ? 'курс' : plural === 'few' ? 'курса' : 'курсов'}`;
  if (locale === 'uk')
    return `${count} ${plural === 'one' ? 'курс' : plural === 'few' ? 'курси' : 'курсів'}`;
  if (locale === 'tg') return `${count} курс`;
  if (locale === 'ja') return `${count} コース`;
  if (locale === 'ko') return `${count}개 강좌`;
  return `${count} ${count === 1 ? 'course' : 'courses'}`;
}
