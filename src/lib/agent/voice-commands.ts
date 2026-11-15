// Spoken commands of the voice assistant: "open courses", "go to my day", "stop".
// People may speak Russian, Tajik, English or Spanish whatever the interface language is,
// so every language is matched at once. Nothing here calls a server.
import { isCourseId } from '@/lib/courses/ids';

export type NavTarget =
  | 'courses'
  | 'myDay'
  | 'plan'
  | 'practice'
  | 'tests'
  | 'answers'
  | 'notes'
  | 'plans'
  | 'community'
  | 'settings'
  | 'progress';

export type VoiceCommand =
  | { type: 'navigate'; target: NavTarget; href: string }
  | { type: 'tutor' }
  | { type: 'stop' }
  | { type: 'help' };

/** Words that ask to go somewhere. Without one, only a very short phrase counts as a command. */
const OPEN_WORDS = [
  'открой',
  'открыть',
  'перейди',
  'перейти',
  'покаж',
  'зайди',
  'заходи',
  'иди',
  'веди',
  'включи',
  'вернись',
  'хочу в',
  'хочу на',
  'давай',
  'кушо',
  'бирав',
  'бурав',
  'нишон',
  'open',
  'go to',
  'show',
  'take me',
  'navigate',
  'switch to',
  'abre',
  'abrir',
  'vamos a',
  've a',
  'llévame',
  'llevame',
  'muéstrame',
  'muestrame',
  'enséñame',
  'quiero ir',
  'cambia a',
];

/** Phrases that ask a question about the site. The guide answers them instead. */
const QUESTION_START =
  /^(где|как|сколько|что|зачем|почему|какой|какие|чем|куда|where|how|what|why|which|when|who|чӣ|чи|куҷо|чаро|чанд|кай|кадом|d[oó]nde|c[oó]mo|cu[aá]nt[oa]s?|qu[eé]|por qu[eé]|cu[aá]les?|cu[aá]ndo|qui[eé]n|para qu[eé])(?![\p{L}])/u;

/** Checked in this order: a specific page wins over the general course catalog. */
const DESTINATIONS: [NavTarget, RegExp][] = [
  ['community', /сообществ|ҷомеа|ҷамъият|community|comunidad/],
  [
    'plan',
    /план курс|план обуч|(^|\s)план($|\s)|нақша|(^|\s)plan($|\s)|course plan|plan de estudio|plan del curso/,
  ],
  ['answers', /ответы|справочник|ҷавобҳо|answers|answer library|respuestas/],
  [
    'tests',
    /(^|\s)тест|интервью|собеседован|санҷиш|мусоҳиба|(^|\s)tests?($|\s)|quiz|interview|(^|\s)pruebas?($|\s)|entrevista|examen/,
  ],
  ['practice', /практик|упражнен|задани|машқ|practice|exercises?|pr[aá]ctica|ejercicios?|tareas?/],
  ['notes', /заметк|конспект|ёддошт|қайд|(^|\s)notes?($|\s)|(^|\s)notas?($|\s)|apuntes/],
  [
    'plans',
    /тариф|подписк|цены|обуна|нарх|pricing|(^|\s)plans($|\s)|subscription|(^|\s)planes($|\s)|suscripci[oó]n|precios?|tarifas?/,
  ],
  ['settings', /настройк|танзимот|settings?|ajustes|configuraci[oó]n/],
  [
    'progress',
    /прогресс|отчет|статистик|пешрафт|progress|report|stats|progreso|informe|estad[ií]sticas/,
  ],
  [
    'myDay',
    /мой день|мои день|урок дня|сегодняшн|мой урок|продолж|рӯзи ман|дарси имрӯз|имрӯз|my day|today|continue|resume|mi d[ií]a|lecci[oó]n de hoy|(^|\s)hoy($|\s)|continuar|reanudar/,
  ],
  ['courses', /курс|каталог|catalog|courses?|cursos?|cat[aá]logo/],
];

const TUTOR =
  /ai\s*tutor|тьютор|тютор|тутор|репетитор|чат с (ии|ай|ai)|открой чат|(^|\s)tutor($|\s)|abre el chat|chat con (la )?(ia|ai)|profesor virtual/;
const STOP =
  /^(стоп|хватит|замолчи|тихо|помолчи|остановись|достаточно|stop|quiet|enough|бас|хомӯш|ист|para|detente|basta|silencio|c[aá]llate|alto|suficiente)$/;
const HELP =
  /^(что ты умеешь|что ты можешь|что умеешь|помощь|помоги мне|what can you do|help|help me|кӯмак|чӣ кор карда метавонӣ|чи кор карда метавони|qu[eé] puedes hacer|ayuda|ay[uú]dame)$/;

/** Lowercase, no punctuation, one space between words. */
export function normalizeSpeech(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replaceAll('ё', 'е')
    .replace(/[^\p{L}\p{N}\s+#.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The page address of a target. Course pages follow the sidebar: React has its own routes. */
export function voiceHref(target: NavTarget, selectedCourse: string): string {
  const course = isCourseId(selectedCourse) ? selectedCourse : null;
  const inCourse = (section: 'home' | 'plan' | 'tests' | 'answers') => {
    if (!course) return '/courses';
    return course === 'react' ? '/' + section : `/courses/${course}/${section}`;
  };
  switch (target) {
    case 'courses':
      return '/courses';
    case 'plans':
      return '/plans';
    case 'community':
      return '/community';
    case 'settings':
      return '/settings';
    case 'notes':
      return '/notes';
    case 'practice':
      return '/practice';
    case 'progress':
      return '/progress';
    case 'myDay':
      return inCourse('home');
    case 'plan':
      return inCourse('plan');
    case 'tests':
      return inCourse('tests');
    case 'answers':
      return inCourse('answers');
  }
}

/** Understands "open courses", "my day", "stop", "what can you do". Anything else returns null. */
export function matchVoiceCommand(rawText: string, selectedCourse: string): VoiceCommand | null {
  const text = normalizeSpeech(rawText);
  if (!text) return null;
  if (STOP.test(text)) return { type: 'stop' };
  if (HELP.test(text)) return { type: 'help' };

  const words = text.split(' ').length;
  const asksToOpen = OPEN_WORDS.some((word) => text.includes(word));
  // A question about the site is answered, not opened; a bare short phrase is a command.
  if (!asksToOpen && (QUESTION_START.test(text) || words > 3)) return null;

  const destination = DESTINATIONS.find(([, pattern]) => pattern.test(text));
  const target = destination?.[0];
  // "open community chat" is the community; a bare "open chat" is the AI Tutor.
  if (target && (target === 'community' || !TUTOR.test(text)))
    return { type: 'navigate', target, href: voiceHref(target, selectedCourse) };
  if (TUTOR.test(text)) return { type: 'tutor' };
  return null;
}
