// Everyday messages ("салом", "чокади", "привет, как дела?", "савол дорам", "спасибо")
// get a natural, instant answer right away: no course lookup, no strikes, no paid model call.
import { wordsOf } from './fuzzy';

export type SmalltalkKind =
  'greeting' | 'howAreYou' | 'questionOpener' | 'thanks' | 'bye' | 'identity' | 'capabilities';
export type SmalltalkLanguage = 'tg' | 'ru' | 'en' | 'es';

/** Words that open a message politely. Several in a row are fine ("салом алейкум"). */
const GREETING = new Set(
  `привет приветик приветствую здравствуй здравствуйте здорово здарова прив хай хэй ку
салам салом ассалом ассалому алайкум алейкум аллайкум ҳалло халло ҳой salom assalom assalomu alaykum
hello hi hey howdy yo greetings hola buenas saludos`.split(/\s+/),
);
/** Greetings of two words. Their single words ("день", "good") are not greetings alone. */
const GREETING_PAIRS = new Set([
  'добрый день',
  'добрый вечер',
  'доброе утро',
  'good morning',
  'good afternoon',
  'good evening',
  'buenos días',
  'buenos dias',
  'buenas tardes',
  'buenas noches',
  'buen día',
]);
/** Words that only address the assistant. They change nothing. */
const ADDRESS = new Set(
  `друг дорогой дорогая всем ассистент помощник тьютор tutor ai devatlas assistant there
бародар дугона ёрдамчӣ ёрдамчи ҷон устод муаллим шеф брат бро amigo asistente profe profesor`.split(
    /\s+/,
  ),
);

const PHRASES: Record<Exclude<SmalltalkKind, 'greeting'>, RegExp> = {
  howAreYou:
    /^(c[oó]mo (est[aá]s?|va|te va|andas|va todo)( t[uú]| usted)?|qu[eé] tal( est[aá]s)?|qu[eé] hay de nuevo|как (дела|ты|жизнь|поживаешь|у тебя дела|твои дела|сам|вы|оно)|что нового|что делаешь|че делаешь|чем занят|чи хел(ӣ|и)?|чӣ хел(ӣ|и)?|чихел(ӣ|и)?|чӣхел(ӣ|и)?|чокади|чо кади|чо кадӣ|чи кор кади|чикор кади|чи кор карди|чӣ кор кардӣ|чи кор мекунӣ|чӣ кор мекунӣ|чи кор карда истодаи|хуби|хубӣ|сози|созӣ|тенчи|тенҷӣ|нағзи|нагзи|ҳолат чӣ хел|ахвол чи хел|аҳвол чӣ хел|chokadi|chi khel|how are you( doing)?|how is it going|how s it going|what s up|whats up|sup)$/u,
  questionOpener:
    /^(савол|як савол|савол дорам|савол дорм|як савол дорам|як савол дорм|савол бд|савол буд|як савол бд|савол диҳам|савол дихам|савол метм|саволи ман|savol|yak savol|savol doram|вопрос|есть вопрос|у меня вопрос|можно вопрос|есть один вопрос|хочу спросить|можно спросить|i have a question|have a question|can i ask( a question)?|quick question|tengo una pregunta|puedo preguntar)$/u,
  thanks:
    /^(gracias|muchas gracias|mil gracias|much[ií]simas gracias|спасибо|спс|благодарю|мерси|благодарствую|раҳмат|рахмат|ташаккур|сипос|rahmat|thanks|thank you|thx|ty)( большое| тебе| вам| калон| ба шумо| ба ту| a lot| so much| very much| por todo| por tu ayuda| de verdad)?$/u,
  bye: /^(adi[oó]s|hasta luego|hasta pronto|hasta ma[nñ]ana|nos vemos|chao|chau|hasta la vista|пока|до свидания|до встречи|увидимся|всего доброго|спокойной ночи|хайр|хуш|худо ҳофиз|худо хофиз|то дидор|шаб ба хайр|bye|goodbye|see you|see you later|good night)$/u,
  identity:
    /^(qui[eé]n eres( t[uú])?|c[oó]mo te llamas|qu[eé] eres|кто ты|ты кто|кто вы|как тебя зовут|что ты такое|ту кӣ(ӣ)?|ту кии|ту кистӣ|шумо кистед|ном(и)? ту чист|who are you|what are you|what is your name|who r u)$/u,
  capabilities:
    /^(qu[eé] puedes hacer|qu[eé] sabes hacer|en qu[eé] puedes ayudarme|c[oó]mo puedes ayudarme|ayuda|ay[uú]dame|necesito ayuda|что ты умеешь|что умеешь|что ты можешь|чем поможешь|чем ты можешь помочь|помоги мне|помощь|ту чӣ карда метавонӣ|чӣ кор карда метавонӣ|чи кор карда метавони|кӯмак|кумак|ёрдам|what can you do|how can you help( me)?|help|help me)$/u,
};

/** Collapses stretched letters ("приветтт") and removes punctuation. */
function plain(text: string): string[] {
  return wordsOf(text.replace(/(\p{L})\1{2,}/gu, '$1')).map((word) => word.replace(/[+#./]/g, ''));
}

/** What kind of everyday message this is, or null for a real question. */
export function smalltalkKind(text: string): SmalltalkKind | null {
  const words = plain(text.slice(0, 120));
  if (!words.length || words.length > 7) return null;
  let start = 0;
  let greeted = false;
  while (start < words.length) {
    if (GREETING_PAIRS.has(words.slice(start, start + 2).join(' '))) {
      greeted = true;
      start += 2;
    } else if (GREETING.has(words[start])) {
      greeted = true;
      start++;
    } else if (ADDRESS.has(words[start])) start++;
    else break;
  }
  const rest = words
    .slice(start)
    .filter((word) => !ADDRESS.has(word))
    .join(' ');
  if (!rest) return greeted ? 'greeting' : null;
  for (const kind of Object.keys(PHRASES) as (keyof typeof PHRASES)[])
    if (PHRASES[kind].test(rest)) return kind;
  return null;
}

const REPLIES: Record<SmalltalkKind, Record<SmalltalkLanguage, string[]>> = {
  greeting: {
    es: [
      '¡Hola! Soy AI Tutor de DevAtlas. Pregunta sobre cualquier curso de la plataforma (HTML, CSS, JavaScript, React, Python, UX, Marketing y más) o pega el código que no entiendes.',
      '¡Buenas! Me alegra verte. ¿Qué tema de los cursos de DevAtlas vemos hoy?',
    ],
    ru: [
      'Привет! Я AI Tutor DevAtlas. Спрашивайте по любому курсу платформы — HTML, CSS, JavaScript, React, Python, дизайн, маркетинг и другим — или присылайте код.',
      'Здравствуйте! Рад вас видеть. Какую тему из курсов DevAtlas разберём сегодня?',
    ],
    tg: [
      'Салом! Ман AI Tutor-и DevAtlas ҳастам. Дар бораи ҳар курси платформа — HTML, CSS, JavaScript, React, Python, дизайн, маркетинг ва дигарон — савол диҳед, зуд ҷавоб медиҳам.',
      'Салом алейкум! Хушҳолам, ки омадед. Имрӯз кадом мавзӯи курсҳои DevAtlas-ро дида мебароем?',
    ],
    en: [
      'Hi! I am DevAtlas AI Tutor. Ask about any course on the platform — HTML, CSS, JavaScript, React, Python, UX, marketing and more — or paste your code.',
      'Hello! Good to see you. Which DevAtlas course topic shall we work on today?',
    ],
  },
  howAreYou: {
    es: ['¡Todo muy bien, listo para ayudarte! ¿Qué tema de los cursos de DevAtlas vemos hoy?'],
    ru: ['Всё отлично, готов помогать! Как учёба — какую тему из курсов DevAtlas разберём?'],
    tg: [
      'Раҳмат, ҳамааш нағз — тайёрам кӯмак кунам! Кадом мавзӯи курсҳои DevAtlas-ро имрӯз мефаҳмем?',
    ],
    en: [
      'Doing great and ready to help! How is your studying going — what DevAtlas topic shall we look at?',
    ],
  },
  questionOpener: {
    es: [
      '¡Claro! Escribe tu pregunta sobre cualquiera de los cursos de DevAtlas y te ayudo enseguida.',
    ],
    ru: [
      'Конечно! Напишите ваш вопрос по любому курсу DevAtlas — сразу найду урок или объясню с примером.',
    ],
    tg: [
      'Албатта! Саволатро дар бораи курсҳои DevAtlas навис — зуд аз дарс меёбам ё бо мисол мефаҳмонам.',
    ],
    en: [
      'Sure! Write your question about any DevAtlas course and I will answer right away with a lesson link or example.',
    ],
  },
  thanks: {
    es: ['¡De nada! Escríbeme cuando te surja otra duda sobre los cursos.'],
    ru: ['Пожалуйста! Если появятся ещё вопросы по курсам — пишите.'],
    tg: ['Марҳамат! Агар боз савол дар бораи курсҳо пайдо шавад — нависед.'],
    en: ['You are welcome! Write again whenever another course question comes up.'],
  },
  bye: {
    es: ['¡Hasta pronto! Que estudies muy bien.'],
    ru: ['До встречи! Удачной учёбы.'],
    tg: ['То дидор! Омӯзиши бобарор.'],
    en: ['See you! Happy learning.'],
  },
  identity: {
    es: [
      'Soy AI Tutor de DevAtlas. Busco primero en los 43 cursos de la plataforma con enlace directo a la lección y, si falta detalle, explico con ejemplos claros dentro de los temas de DevAtlas.',
    ],
    ru: [
      'Я AI Tutor из DevAtlas. Сначала ищу ответ прямо в 43 курсах платформы и даю ссылку на нужную тему, а если материала мало — объясняю сам с примерами строго в рамках курсов.',
    ],
    tg: [
      'Ман AI Tutor-и DevAtlas ҳастам. Аввал ҷавобро аз 43 курси платформа меёбам ва ссылкаи мустақим ба дарс медиҳам; агар маълумот кам бошад, бо мисол мефаҳмонам — танҳо дар доираи курсҳои DevAtlas.',
    ],
    en: [
      'I am DevAtlas AI Tutor. I search across our 43 courses first with a direct link to the lesson, and when more detail is needed I explain with clear examples strictly within DevAtlas courses.',
    ],
  },
  capabilities: {
    es: [
      'Respondo dudas de todos los cursos de DevAtlas (programación, diseño UX/UI, marketing, datos, negocio, inglés y más), reviso código y doy enlaces directos a las lecciones. Solo respondo temas de los cursos.',
    ],
    ru: [
      'Помогаю по всем курсам DevAtlas (программирование, UX/UI дизайн, маркетинг, аналитика, бизнес, английский и др.), разбираю код и даю прямую ссылку на нужный урок. Отвечаю только в рамках курсов.',
    ],
    tg: [
      'Дар бораи ҳамаи курсҳои DevAtlas (барномасозӣ, дизайн UX/UI, маркетинг, аналитика, бизнес, англисӣ ва дигарон) мефаҳмонам, кодро таҳлил мекунам ва ссылкаи мустақим ба дарс медиҳам. Танҳо дар доираи курсҳо кор мекунам.',
    ],
    en: [
      'I help with all DevAtlas courses (programming, UX/UI design, marketing, data analytics, business, English and more), explain code and link directly to the matching lesson. I stay strictly inside DevAtlas course topics.',
    ],
  },
};

/** The answer for an everyday message. The same text always gets the same variant. */
export function smalltalkReply(
  kind: SmalltalkKind,
  language: SmalltalkLanguage,
  seed: string,
): string {
  const variants = REPLIES[kind][language];
  return variants[[...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % variants.length];
}

const SPANISH_MARKERS =
  /\bhola\b|\bbuen[oa]s\b|\bbuen d[ií]a\b|\bsaludos\b|\bgracias\b|\badi[oó]s\b|\bhasta (luego|pronto|ma[nñ]ana)\b|\bnos vemos\b|\bchao\b|\bc[oó]mo (est[aá]s?|va|te)\b|\bqu[eé] (tal|hay|puedes|sabes|eres)\b|\bqui[eé]n eres\b|\bayuda\b|\bay[uú]dame\b|\bprofe(sor)?\b|\bpregunta\b/iu;
const TAJIK_MARKERS =
  /салом|ассалом|алейкум|алайкум|ҳалло|ҳой|чи хел|чӣ хел|чихел|чокади|чо кади|чи кор|чикор|хуби|хубӣ|сози|созӣ|тенҷ|тенч|нағз|нагз|савол|дорам|дорм|раҳмат|рахмат|ташаккур|сипос|хайр|ҳофиз|хофиз|ту кӣ|ту кии|ту кист|шумо кистед|кӯмак|кумак|ёрдам|ҳолат|аҳвол|муаллим|устод|\bsalom\b|\bchokadi\b|\bsavol\b|\brahmat\b/iu;

/**
 * The language to answer an everyday message in: the language it was written in, so
 * "салом" or "чокади" gets a Tajik answer even when the lesson language is Russian.
 * Other text keeps `fallback`.
 */
export function smalltalkLanguage(text: string, fallback: SmalltalkLanguage): SmalltalkLanguage {
  if (TAJIK_MARKERS.test(text)) return 'tg';
  if (SPANISH_MARKERS.test(text)) return 'es';
  if (/\p{Script=Latin}/u.test(text) && !/\p{Script=Cyrillic}/u.test(text)) return 'en';
  if (/\p{Script=Cyrillic}/u.test(text)) return 'ru';
  return fallback;
}
