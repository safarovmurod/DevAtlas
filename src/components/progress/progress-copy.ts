/** Short labels for the progress report in the four interface languages. Others fall back to English. */

export interface ProgressCopy {
  dateLocale: string;
  title: string;
  subtitle: string;
  startedOn: (day: string) => string;
  nowInWeek: (week: number) => string;
  summaryActiveDays: string;
  summaryTime: string;
  summaryStreak: string;
  weekTitle: (week: number) => string;
  weekCurrent: string;
  weekEnded: string;
  metricScore: string;
  metricAnswers: string;
  metricInterview: string;
  metricPractice: string;
  metricActiveDays: string;
  metricTime: string;
  metricMistakes: string;
  answersOfCorrect: (correct: number, total: number) => string;
  studied: string;
  nothingStudied: string;
  left: string;
  leftOf: (daysLeft: number, total: number) => string;
  mistakesTitle: string;
  noMistakes: string;
  courses: string;
  courseDays: (done: number, total: number) => string;
  lastActivity: (day: string) => string;
  noActivityDate: string;
  nextDay: (day: number, title: string | null) => string;
  practiceLabel: (title: string) => string;
  lessonFallback: string;
  answersCount: (count: number) => string;
  mistakesCount: (count: number) => string;
  days: (count: number) => string;
  duration: (hours: number, minutes: number) => string;
  emptyTitle: string;
  emptyText: string;
  emptyAction: string;
  loading: string;
  notes: string[];
}

/** Russian plural: 1 ошибка, 2 ошибки, 5 ошибок. */
function pluralRu(count: number, one: string, few: string, many: string) {
  const tens = count % 100;
  const units = count % 10;
  if (tens >= 11 && tens <= 14) return many;
  if (units === 1) return one;
  if (units >= 2 && units <= 4) return few;
  return many;
}

const COPY: Record<'en' | 'ru' | 'tg' | 'es', ProgressCopy> = {
  es: {
    dateLocale: 'es-ES',
    title: 'Progreso',
    subtitle: 'Tus números reales, semana a semana, desde el día en que empezaste.',
    startedOn: (day) => `Inicio: ${day}`,
    nowInWeek: (week) => `Ahora: semana ${week}`,
    summaryActiveDays: 'Días activos',
    summaryTime: 'Tiempo total',
    summaryStreak: 'Racha actual',
    weekTitle: (week) => `Semana ${week}`,
    weekCurrent: 'En curso',
    weekEnded: 'Terminada',
    metricScore: 'Puntuación general',
    metricAnswers: 'Respuestas',
    metricInterview: 'Respuestas de entrevista',
    metricPractice: 'Práctica entregada',
    metricActiveDays: 'Días activos',
    metricTime: 'Tiempo de estudio',
    metricMistakes: 'Errores',
    answersOfCorrect: (correct, total) => `${correct} de ${total} correctas`,
    studied: 'Lo que estudiaste',
    nothingStudied: 'Esta semana no hay lecciones con fecha.',
    left: 'Lo que falta',
    leftOf: (daysLeft, total) => `faltan ${daysLeft} de ${total} días`,
    mistakesTitle: 'Errores',
    noMistakes: 'Esta semana no hay errores.',
    courses: 'Tus cursos',
    courseDays: (done, total) => `${done} de ${total} días`,
    lastActivity: (day) => `Última actividad: ${day}`,
    noActivityDate: 'Aún no hay actividad con fecha',
    nextDay: (day, title) => (title ? `Siguiente: día ${day} · ${title}` : `Siguiente: día ${day}`),
    practiceLabel: (title) => `Práctica: ${title}`,
    lessonFallback: 'Lección',
    answersCount: (count) => (count === 1 ? '1 respuesta' : `${count} respuestas`),
    mistakesCount: (count) => (count === 1 ? '1 error' : `${count} errores`),
    days: (count) => (count === 1 ? '1 día' : `${count} días`),
    duration: (hours, minutes) => (hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`),
    emptyTitle: 'Aún no hay actividad',
    emptyText:
      'Responde una pregunta o estudia una lección. Tu informe se llena desde el primer día.',
    emptyAction: 'Abrir cursos',
    loading: 'Cargando tu progreso…',
    notes: [
      'Las semanas se cuentan con las fechas de tus respuestas y de tu tiempo de estudio. Una práctica se fecha con su último borrador guardado.',
      'Las lecciones completadas y los días confirmados se guardan sin fecha, así que cuentan en los totales y en el progreso de los cursos, pero no en las semanas. Lo que falta se cuenta a día de hoy.',
      'Puntuación general = respuestas correctas sobre todas las respuestas de la semana (pruebas, repaso y autoevaluaciones de entrevista).',
    ],
  },
  en: {
    dateLocale: 'en-US',
    title: 'Progress',
    subtitle: 'Your real numbers, week by week, from the day you started.',
    startedOn: (day) => `Started ${day}`,
    nowInWeek: (week) => `Now: week ${week}`,
    summaryActiveDays: 'Active days',
    summaryTime: 'Total time',
    summaryStreak: 'Current streak',
    weekTitle: (week) => `Week ${week}`,
    weekCurrent: 'In progress',
    weekEnded: 'Finished',
    metricScore: 'Overall score',
    metricAnswers: 'Answers',
    metricInterview: 'Interview answers',
    metricPractice: 'Practice done',
    metricActiveDays: 'Active days',
    metricTime: 'Time studied',
    metricMistakes: 'Mistakes',
    answersOfCorrect: (correct, total) => `${correct} of ${total} correct`,
    studied: 'What you studied',
    nothingStudied: 'No dated lessons this week.',
    left: 'What is left',
    leftOf: (daysLeft, total) => `${daysLeft} of ${total} days left`,
    mistakesTitle: 'Mistakes',
    noMistakes: 'No mistakes this week.',
    courses: 'Your courses',
    courseDays: (done, total) => `${done} of ${total} days`,
    lastActivity: (day) => `Last activity: ${day}`,
    noActivityDate: 'No dated activity yet',
    nextDay: (day, title) => (title ? `Next: day ${day} · ${title}` : `Next: day ${day}`),
    practiceLabel: (title) => `Practice: ${title}`,
    lessonFallback: 'Lesson',
    answersCount: (count) => (count === 1 ? '1 answer' : `${count} answers`),
    mistakesCount: (count) => (count === 1 ? '1 mistake' : `${count} mistakes`),
    days: (count) => (count === 1 ? '1 day' : `${count} days`),
    duration: (hours, minutes) => (hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`),
    emptyTitle: 'No activity yet',
    emptyText: 'Answer a question or study a lesson. Your report fills in from your first day.',
    emptyAction: 'Open courses',
    loading: 'Loading your progress…',
    notes: [
      'Weeks use the dates of your answers and study time. A practice is dated by its last saved draft.',
      'Completed lessons and confirmed days are saved without a date, so they count in totals and course progress, not in weeks. What is left is counted as of today.',
      'Overall score = correct answers out of all answers in the week (quiz, revision and interview self-checks).',
    ],
  },
  ru: {
    dateLocale: 'ru-RU',
    title: 'Прогресс',
    subtitle: 'Реальные цифры по неделям, с первого дня занятий.',
    startedOn: (day) => `Начало: ${day}`,
    nowInWeek: (week) => `Сейчас: неделя ${week}`,
    summaryActiveDays: 'Активных дней',
    summaryTime: 'Всего времени',
    summaryStreak: 'Серия подряд',
    weekTitle: (week) => `Неделя ${week}`,
    weekCurrent: 'Идёт',
    weekEnded: 'Завершена',
    metricScore: 'Общий балл',
    metricAnswers: 'Ответы',
    metricInterview: 'Ответы на собеседование',
    metricPractice: 'Практика сдана',
    metricActiveDays: 'Активных дней',
    metricTime: 'Время занятий',
    metricMistakes: 'Ошибки',
    answersOfCorrect: (correct, total) => `${correct} из ${total} верно`,
    studied: 'Что изучали',
    nothingStudied: 'На этой неделе нет уроков с датой.',
    left: 'Что осталось',
    leftOf: (daysLeft, total) => `осталось ${daysLeft} из ${total}`,
    mistakesTitle: 'Ошибки',
    noMistakes: 'На этой неделе ошибок нет.',
    courses: 'Ваши курсы',
    courseDays: (done, total) => `${done} из ${total} дней`,
    lastActivity: (day) => `Последняя активность: ${day}`,
    noActivityDate: 'Пока нет активности с датой',
    nextDay: (day, title) => (title ? `Дальше: день ${day} · ${title}` : `Дальше: день ${day}`),
    practiceLabel: (title) => `Практика: ${title}`,
    lessonFallback: 'Урок',
    answersCount: (count) => `${count} ${pluralRu(count, 'ответ', 'ответа', 'ответов')}`,
    mistakesCount: (count) => `${count} ${pluralRu(count, 'ошибка', 'ошибки', 'ошибок')}`,
    days: (count) => `${count} ${pluralRu(count, 'день', 'дня', 'дней')}`,
    duration: (hours, minutes) => (hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`),
    emptyTitle: 'Пока нет активности',
    emptyText: 'Ответьте на вопрос или изучите урок. Отчёт заполнится с первого дня.',
    emptyAction: 'Открыть курсы',
    loading: 'Загружаем прогресс…',
    notes: [
      'Недели считаются по датам ответов и времени занятий. Практика датируется последним сохранённым черновиком.',
      'Пройденные уроки и подтверждённые дни сохраняются без даты, поэтому они учитываются в итогах и в прогрессе курсов, но не в неделях. «Осталось» считается на сегодня.',
      'Общий балл = верные ответы из всех ответов за неделю (тесты, повторение и самопроверка собеседования).',
    ],
  },
  tg: {
    dateLocale: 'ru-RU',
    title: 'Пешрафт',
    subtitle: 'Рақамҳои воқеӣ ҳафта ба ҳафта, аз рӯзи оғози омӯзиш.',
    startedOn: (day) => `Оғоз: ${day}`,
    nowInWeek: (week) => `Ҳоло: ҳафтаи ${week}`,
    summaryActiveDays: 'Рӯзҳои фаъол',
    summaryTime: 'Вақти умумӣ',
    summaryStreak: 'Силсилаи рӯзҳо',
    weekTitle: (week) => `Ҳафтаи ${week}`,
    weekCurrent: 'Идома дорад',
    weekEnded: 'Анҷом ёфт',
    metricScore: 'Балли умумӣ',
    metricAnswers: 'Ҷавобҳо',
    metricInterview: 'Ҷавобҳои мусоҳиба',
    metricPractice: 'Амалияи иҷрошуда',
    metricActiveDays: 'Рӯзҳои фаъол',
    metricTime: 'Вақти омӯзиш',
    metricMistakes: 'Хатоҳо',
    answersOfCorrect: (correct, total) => `${correct} аз ${total} дуруст`,
    studied: 'Чиро омӯхтед',
    nothingStudied: 'Дар ин ҳафта дарси бо сана нест.',
    left: 'Чӣ монд',
    leftOf: (daysLeft, total) => `монд ${daysLeft} аз ${total}`,
    mistakesTitle: 'Хатоҳо',
    noMistakes: 'Дар ин ҳафта хато нест.',
    courses: 'Курсҳои шумо',
    courseDays: (done, total) => `${done} аз ${total} рӯз`,
    lastActivity: (day) => `Фаъолияти охирин: ${day}`,
    noActivityDate: 'Ҳанӯз фаъолияти бо сана нест',
    nextDay: (day, title) => (title ? `Баъдӣ: рӯзи ${day} · ${title}` : `Баъдӣ: рӯзи ${day}`),
    practiceLabel: (title) => `Амалия: ${title}`,
    lessonFallback: 'Дарс',
    answersCount: (count) => `${count} ҷавоб`,
    mistakesCount: (count) => `${count} хато`,
    days: (count) => `${count} рӯз`,
    duration: (hours, minutes) => (hours > 0 ? `${hours} соат ${minutes} дақ` : `${minutes} дақ`),
    emptyTitle: 'Ҳанӯз фаъолият нест',
    emptyText: 'Ба савол ҷавоб диҳед ё дарсро омӯзед. Ҳисобот аз рӯзи аввал пур мешавад.',
    emptyAction: 'Курсҳоро кушоед',
    loading: 'Пешрафт бор карда мешавад…',
    notes: [
      'Ҳафтаҳо бо санаҳои ҷавобҳо ва вақти омӯзиш ҳисоб мешаванд. Амалия бо санаи охирин захиракардаи драфт сабт мешавад.',
      'Дарсҳои гузаронидашуда ва рӯзҳои тасдиқшуда бе сана захира мешаванд, пас онҳо дар ҷамъбаст ва пешрафти курсҳо мебошанд, на дар ҳафтаҳо. «Монд» ба имрӯз ҳисоб мешавад.',
      'Балли умумӣ = ҷавобҳои дуруст аз ҳамаи ҷавобҳои ҳафта (санҷиш, такрор ва худтафтишии мусоҳиба).',
    ],
  },
};

export function progressCopy(locale: string): ProgressCopy {
  if (locale === 'ru' || locale === 'tg' || locale === 'es') return COPY[locale];
  return COPY.en;
}

/** Day key (YYYY-MM-DD) as a short date, read in UTC so it never shifts. */
export function formatDay(day: string, dateLocale: string): string {
  return new Intl.DateTimeFormat(dateLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(day + 'T00:00:00Z'));
}

/** Seconds as hours and minutes, e.g. 5400 -> 1 h 30 min. Under one minute counts as 0 min. */
export function durationParts(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
}
