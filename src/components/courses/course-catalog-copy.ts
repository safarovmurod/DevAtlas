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
  es: {
    eyebrow: 'TU APRENDIZAJE',
    title: '¿Qué te gustaría aprender?',
    intro:
      'Elige una ruta. Puedes cambiar cuando quieras: cada curso guarda su propio progreso y sus notas.',
    route: 'Ruta recomendada de desarrollo web',
    routeNote: 'Estudia Git junto con esta ruta. C++ es una ruta aparte.',
    selected: 'Elegido',
    recommended: 'Empieza por aquí',
    jsDescription: 'Mes 1 — JS1: arreglos, objetos y ejercicios. Mes 2 — JS2: API y solicitudes.',
    after: 'Después de ',
    fromZero: 'Se puede empezar desde cero',
    ready: (count) => `${count} ${count === 1 ? 'tema' : 'temas'} · listo${count === 1 ? '' : 's'}`,
    wait: 'Materiales pendientes',
    unavailable: 'No se puede ver el estado de los materiales',
    checking: 'Comprobando los materiales…',
    choose: 'Elegir curso',
    continue: 'Continuar el curso',
  },
};

/** Text of the category browser, search and empty state. */
export const BROWSE_COPY: Record<InterfaceLocale, Record<string, string>> = {
  ru: {
    back: 'Назад к направлениям',
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
    back: 'Back to directions',
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
    back: 'Бозгашт ба самтҳо',
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
  es: {
    back: 'Volver a las rutas',
    categories: 'Explorar rutas de aprendizaje',
    all: 'Todas las categorías',
    allTracks: 'Todas las especialidades',
    browse: 'Catálogo de cursos',
    programming: 'Especialidades de programación',
    reset: 'Borrar filtros',
    empty:
      'Todavía no hay cursos que coincidan en esta categoría. Elige otra categoría o cambia la búsqueda.',
    intro: 'Módulo introductorio',
    search: 'Nombre del curso o habilidad',
    searchLabel: 'Buscar un curso',
    noResults: 'No se encontró ningún curso. Prueba con otro nombre.',
  },
};

/** "3 courses" with the correct plural form for each language. */
export function courseCountLabel(count: number, locale: InterfaceLocale) {
  const plural = new Intl.PluralRules(locale).select(count);
  if (locale === 'ru')
    return `${count} ${plural === 'one' ? 'курс' : plural === 'few' ? 'курса' : 'курсов'}`;
  if (locale === 'tg') return `${count} курс`;
  if (locale === 'es') return `${count} ${count === 1 ? 'curso' : 'cursos'}`;
  return `${count} ${count === 1 ? 'course' : 'courses'}`;
}
