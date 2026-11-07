

// Any question is allowed. Only empty input, and attempts to override the
// assistant's instructions, are refused before a provider call. Budget and
// sign-in gates in /api/tutor still apply to online answers.
export type TutorScope = 'allowed' | 'greeting' | 'outside';
export type TutorLanguage = 'tg' | 'ru' | 'en';

const greeting =
  /^(?:салом|салом алейкум|ассалому алайкум|привет|здравствуй(?:те)?|hello|hi|hey)[!?.\s]*$/iu;
const overrideInstructions =
  /(?:ignore|forget|override|bypass).{0,55}(?:system|instruction|rules|policy|prompt)|(?:игнорируй|забудь|обойди).{0,55}(?:правил|инструкц|промпт)|(?:қоидаро|коидаро).{0,30}(?:нодида|парто)/iu;

export function tutorScope(
  query: string,
  _previousUserQuestion?: string,
  _codeContext?: string,
): TutorScope {
  const text = query.normalize('NFKC').trim();
  if (!text) return 'outside';
  if (greeting.test(text)) return 'greeting';
  if (overrideInstructions.test(text)) return 'outside';
  return 'allowed';
}

export const tutorScopeReply: Record<TutorLanguage, { greeting: string; outside: string }> = {
  tg: {
    greeting:
      'Салом! Ман ёрдамчии DevAtlas ҳастам. Ҳар саволатонро пурсед: дар бораи курсҳо, код, сайт ё мавзӯи дигар.',
    outside:
      'Саволро нависед. Ман ҳар мавзӯъро ҷавоб медиҳам: курсҳои DevAtlas, код ё чизи дигар.',
  },
  ru: {
    greeting:
      'Привет! Я помощник DevAtlas. Спрашивайте что угодно: про курсы, код, сайт или другую тему.',
    outside:
      'Напишите вопрос. Я отвечу на любую тему: курсы DevAtlas, код или что-то другое.',
  },
  en: {
    greeting:
      'Hello! I am the DevAtlas assistant. Ask anything: about courses, code, the site or another topic.',
    outside: 'Please write a question. I can answer on any topic, including DevAtlas courses.',
  },
};


