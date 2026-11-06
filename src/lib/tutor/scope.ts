import { isDeepFollowUp } from './shared';

// Local, fail-closed topic gate. This is a conservative first boundary, not a
// guarantee of semantic classification or a replacement for the system prompt.
export type TutorScope = 'allowed' | 'greeting' | 'outside';
export type TutorLanguage = 'tg' | 'ru' | 'en';

const greeting =
  /^(?:салом|салом алейкум|ассалому алайкум|привет|здравствуй(?:те)?|hello|hi|hey)[!?.\s]*$/iu;
const followUp =
  /^(?:why|how|and why|show an example|another example|explain more|more|почему|а почему|как|ещё пример|пример|фаҳмон|фахмон|чаро|чӣ хел|чи хел|мисол деҳ|мисол дех)[!?.\s]*$/iu;
const overrideInstructions =
  /(?:ignore|forget|override|bypass).{0,55}(?:system|instruction|rules|policy|prompt)|(?:игнорируй|забудь|обойди).{0,55}(?:правил|инструкц|промпт)|(?:қоидаро|коидаро).{0,30}(?:нодида|парто)/iu;

// Include *all* DevAtlas learning families, not only frontend development.
// Unknown subjects are declined before a paid provider call.
const courseTopics =
  /(?:react|next\.?js|javascript|typescript|html|css|sass|scss|tailwind|bootstrap|svelte|vue|node\.?js|express|api|rest|graphql|http|git(?:hub)?|docker|linux|bash|shell|sql|postgres|sqlite|mongodb|database|supabase|python|django|flask|java|kotlin|swift|rust|golang|\bgo\b|\bc\+\+\b|csharp|c#|php|ruby|algorithm|complexity|array|object|variable|function|scope|hoist|tdz|closure|promise|async|await|loop|state|props|component|hook|use(?:state|effect|memo|callback|ref|context)|redux|zustand|jotai|formik|zod|yup|typescript|typescript|code|coding|compile|bug|debug|programming|frontend|backend|framework|browser|dom|responsive|fetch|axios|oauth|authentication|authorization|jwt|regex|terminal|command|commit|pull request|deployment|vercel|testing|vitest|jest|playwright|interface|ui\/ux|ux|wireframe|figma|design system|accessibility|ai agent|agent harness|llm|prompt|rag|embedding|neural|machine learning|data analy|dashboard|kpi|metric|spreadsheet|statistics|marketing|campaign|conversion|audience|seo|branding|business|startup|revenue|profit|margin|customer|product|negotiat|communication|feedback|interview|interview prep|presentation|writing|content creat|copywriting|grammar|english language|digital literacy|productivity|time management|мастерство|курс|дарс|машқ|омӯз|барномасоз|код|хато|компонент|функси|массив|объект|стейт|пропс|реакт|ҷаваскрипт|программи|урок|задач|тест|собеседован|практик|обучен|кодинг|ошибк|разработк|дизайн|маркетинг|бизнес|данных|аналитик|коммуникац|навык|английск|контент|продуктивн|вақт|вазифа|пешрафт|прогресс|обуна|подписк|оплат|навигац|сайт|devatlas)/iu;

// A short follow-up may rely on the previous *independently validated* user
// question. Arbitrary assistant text is never sufficient to grant scope.
export function tutorScope(
  query: string,
  previousUserQuestion?: string,
  codeContext?: string,
): TutorScope {
  const text = query.normalize('NFKC').trim();
  if (!text) return 'outside';
  if (greeting.test(text)) return 'greeting';
  if (overrideInstructions.test(text)) return 'outside';
  if (courseTopics.test(text)) return 'allowed';
  if (
    codeContext &&
    /(?:\b(?:const|let|var|function|class|def|import|return|if|for|while|SELECT|CREATE)\b|=>|<\/?[a-z][^>]*>|\{[^{}]{1,120}\})/i.test(
      codeContext,
    )
  )
    return 'allowed';
  if (
    (followUp.test(text) || isDeepFollowUp(text)) &&
    previousUserQuestion &&
    tutorScope(previousUserQuestion) === 'allowed'
  )
    return 'allowed';
  return 'outside';
}

export const tutorScopeReply: Record<TutorLanguage, { greeting: string; outside: string }> = {
  tg: {
    greeting:
      'Салом! Ман AI Mentor-и DevAtlas ҳастам. Дар бораи курсҳо, дарсҳо, код, машқҳо ё омодагӣ ба интервью пурсед.',
    outside:
      'Ман танҳо ба мавзӯъҳои курсҳо ва имкониятҳои DevAtlas ҷавоб медиҳам. Саволро ба дарс, машқ ё мавзӯи омӯзиш пайваст кунед.',
  },
  ru: {
    greeting:
      'Привет! Я AI Mentor DevAtlas. Могу помочь с курсами, уроками, кодом, практикой и подготовкой к интервью.',
    outside:
      'Я отвечаю только по темам курсов и возможностям DevAtlas. Спросите об уроке, упражнении или теме обучения.',
  },
  en: {
    greeting:
      'Hello! I am DevAtlas AI Mentor. Ask about courses, lessons, code, exercises, or interview preparation.',
    outside:
      'I help with DevAtlas courses and platform features only. Please ask about a lesson, exercise, or learning topic.',
  },
};
