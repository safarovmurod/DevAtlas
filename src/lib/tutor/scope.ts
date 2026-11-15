import { smalltalkKind } from './smalltalk';

// Any question is allowed. Only empty input, and attempts to override the
// assistant's instructions, are refused before a provider call. Budget and
// sign-in gates in /api/tutor still apply to online answers.
export type TutorScope = 'allowed' | 'greeting' | 'outside';
export type TutorLanguage = 'tg' | 'ru' | 'en' | 'es';

const overrideInstructions =
  /(?:ignore|forget|override|bypass).{0,55}(?:system|instruction|rules|policy|prompt)|(?:игнорируй|забудь|обойди).{0,55}(?:правил|инструкц|промпт)|(?:қоидаро|коидаро).{0,30}(?:нодида|парто)|(?:ignora|olvida|omite|salta).{0,55}(?:instrucci|reglas|sistema|prompt)/iu;

export function tutorScope(
  query: string,
  _previousUserQuestion?: string,
  _codeContext?: string,
): TutorScope {
  const text = query.normalize('NFKC').trim();
  if (!text) return 'outside';
  // Greetings, thanks and similar everyday messages are answered without a model call.
  if (smalltalkKind(text)) return 'greeting';
  if (overrideInstructions.test(text)) return 'outside';
  return 'allowed';
}

export const tutorScopeReply: Record<TutorLanguage, { greeting: string; outside: string }> = {
  tg: {
    greeting:
      'Салом! Ман ёрдамчии DevAtlas ҳастам. Ҳар саволатонро пурсед: дар бораи курсҳо, код, сайт ё мавзӯи дигар.',
    outside: 'Саволро нависед. Ман ҳар мавзӯъро ҷавоб медиҳам: курсҳои DevAtlas, код ё чизи дигар.',
  },
  ru: {
    greeting:
      'Привет! Я помощник DevAtlas. Спрашивайте что угодно: про курсы, код, сайт или другую тему.',
    outside: 'Напишите вопрос. Я отвечу на любую тему: курсы DevAtlas, код или что-то другое.',
  },
  en: {
    greeting:
      'Hello! I am the DevAtlas assistant. Ask anything: about courses, code, the site or another topic.',
    outside: 'Please write a question. I can answer on any topic, including DevAtlas courses.',
  },
  es: {
    greeting:
      '¡Hola! Soy el asistente de DevAtlas. Pregunta lo que quieras: sobre los cursos, el código, el sitio u otro tema.',
    outside:
      'Escribe una pregunta. Puedo responder sobre cualquier tema, incluidos los cursos de DevAtlas.',
  },
};
