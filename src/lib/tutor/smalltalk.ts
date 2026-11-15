// Everyday messages ("салом", "привет, как дела?", "спасибо") get a natural
// answer right away: no course lookup and no paid model call.
import { wordsOf } from './fuzzy';

export type SmalltalkKind =
  'greeting' | 'howAreYou' | 'thanks' | 'bye' | 'identity' | 'capabilities';
export type SmalltalkLanguage = 'tg' | 'ru' | 'en' | 'es';

/** Words that open a message politely. Several in a row are fine ("салом алейкум"). */
const GREETING = new Set(
  `привет приветик приветствую здравствуй здравствуйте здорово хай хэй
салам салом ассалом ассалому алайкум алейкум аллайкум ҳалло халло ҳой
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
бародар дугона ёрдамчӣ ёрдамчи ҷон amigo asistente profe profesor`.split(/\s+/),
);

const PHRASES: Record<Exclude<SmalltalkKind, 'greeting'>, RegExp> = {
  howAreYou:
    /^(c[oó]mo (est[aá]s?|va|te va|andas|va todo)( t[uú]| usted)?|qu[eé] tal( est[aá]s)?|qu[eé] hay de nuevo|как (дела|ты|жизнь|поживаешь|у тебя дела|твои дела|сам|вы)|что нового|чи хел(ӣ|и)?|чӣ хел(ӣ|и)?|ҳолат чӣ хел|ахвол чи хел|аҳвол чӣ хел|чи кор мекунӣ|how are you( doing)?|how is it going|how s it going|what s up|sup)$/u,
  thanks:
    /^(gracias|muchas gracias|mil gracias|much[ií]simas gracias|спасибо|спс|благодарю|мерси|благодарствую|раҳмат|рахмат|ташаккур|сипос|thanks|thank you|thx|ty)( большое| тебе| вам| калон| ба шумо| ба ту| a lot| so much| very much| por todo| por tu ayuda| de verdad)?$/u,
  bye: /^(adi[oó]s|hasta luego|hasta pronto|hasta ma[nñ]ana|nos vemos|chao|chau|hasta la vista|пока|до свидания|до встречи|увидимся|всего доброго|спокойной ночи|хайр|хуш|худо ҳофиз|то дидор|шаб ба хайр|bye|goodbye|see you|see you later|good night)$/u,
  identity:
    /^(qui[eé]n eres( t[uú])?|c[oó]mo te llamas|qu[eé] eres|кто ты|ты кто|кто вы|как тебя зовут|что ты такое|ту кӣ(ӣ)?|ту кистӣ|шумо кистед|ном(и)? ту чист|who are you|what are you|what is your name|who r u)$/u,
  capabilities:
    /^(qu[eé] puedes hacer|qu[eé] sabes hacer|en qu[eé] puedes ayudarme|c[oó]mo puedes ayudarme|ayuda|ay[uú]dame|necesito ayuda|что ты умеешь|что умеешь|что ты можешь|чем поможешь|чем ты можешь помочь|помоги мне|помощь|ту чӣ карда метавонӣ|чӣ кор карда метавонӣ|чи кор карда метавони|кӯмак|ёрдам|what can you do|how can you help( me)?|help|help me)$/u,
};

/** Collapses stretched letters ("приветтт") and removes punctuation. */
function plain(text: string): string[] {
  return wordsOf(text.replace(/(\p{L})\1{2,}/gu, '$1')).map((word) => word.replace(/[+#.]/g, ''));
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
      '¡Hola! Soy AI Tutor. Pregunta sobre cualquier tema del curso (HTML, CSS, JavaScript, React y más) o cuéntame qué no entiendes.',
      '¡Buenas! Me alegra verte. ¿De qué hablamos: un tema del curso o código que no funciona?',
    ],
    ru: [
      'Привет! Я AI Tutor. Спрашивайте про любую тему курса — HTML, CSS, JavaScript, React и другие — или просто напишите, что непонятно.',
      'Здравствуйте! Рад вас видеть. О чём поговорим: тема из курса или код, который не получается?',
    ],
    tg: [
      'Салом! Ман AI Tutor ҳастам. Дар бораи ҳар мавзӯи курс — HTML, CSS, JavaScript, React ва дигарон — пурсед ё нависед, ки чӣ фаҳмо нест.',
      'Салом алейкум! Хушҳолам, ки омадед. Дар бораи чӣ суҳбат кунем: мавзӯи курс ё коде, ки намебарояд?',
    ],
    en: [
      'Hi! I am AI Tutor. Ask about any course topic — HTML, CSS, JavaScript, React and more — or just tell me what is unclear.',
      'Hello! Good to see you. What shall we look at: a course topic or code that is not working?',
    ],
  },
  howAreYou: {
    es: ['¡Todo bien, gracias! ¿Cómo va el estudio? ¿Qué vemos hoy?'],
    ru: ['Всё хорошо, спасибо! А как у вас с учёбой? Что сегодня разбираем?'],
    tg: ['Ташаккур, хубам! Омӯзиш чӣ хел меравад? Имрӯз чиро таҳлил мекунем?'],
    en: ['I am doing well, thanks! How is the studying going? What shall we work on today?'],
  },
  thanks: {
    es: ['¡De nada! Escríbeme cuando te surja otra duda.'],
    ru: ['Пожалуйста! Если появятся ещё вопросы — пишите.'],
    tg: ['Марҳамат! Агар боз савол пайдо шавад — нависед.'],
    en: ['You are welcome! Write again whenever a question comes up.'],
  },
  bye: {
    es: ['¡Hasta pronto! Que estudies muy bien.'],
    ru: ['До встречи! Удачной учёбы.'],
    tg: ['То дидор! Омӯзиши хуш.'],
    en: ['See you! Happy learning.'],
  },
  identity: {
    es: [
      'Soy AI Tutor de DevAtlas, un asistente de estudio. Primero busco la respuesta en los materiales del curso y, si no está ahí y la IA en línea está activada, respondo yo.',
    ],
    ru: [
      'Я AI Tutor из DevAtlas — учебный помощник. Сначала ищу ответ в материалах курса, а если его там нет и онлайн-AI включён, отвечаю сам.',
    ],
    tg: [
      'Ман AI Tutor-и DevAtlas — ёрдамчии омӯзишӣ ҳастам. Аввал дар маводи курс ҷавоб меҷӯям, ва агар он ҷо набошад ва AI-и онлайн фаъол бошад, худам ҷавоб медиҳам.',
    ],
    en: [
      'I am AI Tutor from DevAtlas, a study helper. I look in the course materials first, and if the answer is not there and online AI is on, I answer myself.',
    ],
  },
  capabilities: {
    es: [
      'Explico los temas de los cursos con palabras sencillas, reviso código y errores, y respondo a saludos y preguntas cotidianas. Por ejemplo, pregunta «qué es HTML» o pega el código que no funciona.',
    ],
    ru: [
      'Объясняю темы курсов простыми словами, разбираю код и ошибки, отвечаю на приветствия и обычные вопросы. Например, спросите «что такое HTML» или вставьте код, который не работает.',
    ],
    tg: [
      'Мавзӯъҳои курсро бо суханони оддӣ мефаҳмонам, код ва хатогиро таҳлил мекунам, ба салому саволҳои оддӣ ҷавоб медиҳам. Масалан, пурсед «HTML чист» ё коди кор накардаро гузоред.',
    ],
    en: [
      'I explain course topics in plain words, look through code and errors, and answer greetings and everyday questions. For example, ask “what is HTML” or paste code that does not work.',
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
  /\bhola\b|\bbuen[oa]s\b|\bbuen d[ií]a\b|\bsaludos\b|\bgracias\b|\badi[oó]s\b|\bhasta (luego|pronto|ma[nñ]ana)\b|\bnos vemos\b|\bchao\b|\bc[oó]mo (est[aá]s?|va|te)\b|\bqu[eé] (tal|hay|puedes|sabes|eres)\b|\bqui[eé]n eres\b|\bayuda\b|\bay[uú]dame\b|\bprofe(sor)?\b/iu;
const TAJIK_MARKERS =
  /салом|ассалом|алейкум|алайкум|ҳалло|ҳой|чи хел|чӣ хел|раҳмат|рахмат|ташаккур|сипос|хайр|ҳофиз|ту кӣ|ту кист|шумо кистед|кӯмак|ёрдам|ҳолат|аҳвол|\bsalom\b/iu;

/**
 * The language to answer an everyday message in: the language it was written in, so
 * "салом" gets a Tajik answer even when the lesson language is Russian.
 * Other text keeps `fallback`.
 */
export function smalltalkLanguage(text: string, fallback: SmalltalkLanguage): SmalltalkLanguage {
  if (TAJIK_MARKERS.test(text)) return 'tg';
  if (SPANISH_MARKERS.test(text)) return 'es';
  if (/\p{Script=Latin}/u.test(text) && !/\p{Script=Cyrillic}/u.test(text)) return 'en';
  if (/\p{Script=Cyrillic}/u.test(text)) return 'ru';
  return fallback;
}
