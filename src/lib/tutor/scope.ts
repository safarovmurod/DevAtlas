import { courseCandidatesFor } from './fuzzy';
import { isDeepFollowUp } from './shared';
import { smalltalkKind } from './smalltalk';

// Strict DevAtlas course-only scope. Everyday greetings/smalltalk are handled
// instantly with zero tokens and zero strikes. Only questions tied to DevAtlas's
// 43 courses, code/debugging, or platform learning stay 'allowed'; off-topic
// questions, unrelated file/essay generation, and instruction overrides return
// 'outside' and count toward the 3-strike / 3-day block policy.
export type TutorScope = 'allowed' | 'greeting' | 'outside';
export type TutorLanguage = 'tg' | 'ru' | 'en' | 'es';

const OVERRIDE_INSTRUCTIONS =
  /(?:ignore|forget|override|bypass|disregard).{0,55}(?:system|instruction|rules|policy|prompt)|(?:игнорируй|забудь|обойди|отмени).{0,55}(?:правил|инструкц|промпт|ограничен)|(?:қоидаро|коидаро|қоидаҳоро|коидахоро).{0,35}(?:нодида|парто|фаромӯш|фаромуш)|(?:ignora|olvida|omite|salta).{0,55}(?:instrucci|reglas|sistema|prompt)|\bjailbreak\b|\bact\s+as\s+(?:dan|a\s+hacker|unrestricted)/iu;

// Explicit off-topic / non-course creative or document generation requests.
const PROHIBITED_GENERATION =
  /(?:напиши|сочини|сделай|создай|сгенерируй|навис|бинавис|соз|бисоз|тайёр\s*кн|тайёр\s*кун|write|generate|create|make).{0,30}(?:реферат|сочинени|курсов\w*|диплом\w*|иншо|эссе|essay|презентац|слайд|pdf|docx|word|документ|стих|стихотвор|шеър|сказк|афсона|анекдот|латифа|шутк|песн|суруд|bedtime\s+story|poem|joke|story)|(?:расскажи|бигӯ|бгу|tell\s+me).{0,20}(?:анекдот|латифа|сказк|шутк|joke|story|bedtime)|(?:мада|барои\s+ман|мне|сделай|создай|соз|бисоз)\s+(?:як\s+)?(?:файл\s+(?:соз|бисоз|тайёр)|word|pdf|excel|презентац)|^(?:файл\s*(?:соз|бисоз|тайёр\s*кн)|як\s+файл\s*(?:соз|бисоз)|создай\s+(?:мне\s+)?файл|сделай\s+(?:мне\s+)?файл|create\s+(?:a\s+)?file(?:\s+for\s+me)?)[.!?\s]*$/iu;

// Clearly off-topic non-DevAtlas domains (weather, sports, cooking, politics, medicine, astrology, entertainment).
const OFF_TOPIC_DOMAINS =
  /(?:\b(?:weather|forecast|football|soccer|basketball|ufc|election|president|politics|recipe|chicken|horoscope|zodiac|astrology|casino|betting|celebrity|movie\s+recommendation)\b|(?:погод[ауые]|прогноз\s+погод|боду\s+ҳаво|ҳаво\s+чӣ\s+хел|хаво\s+чи\s+хел|футбол\w*|матч\w*|чемпионат|сч[её]т\s+(?:матч|игр)|рецепт\w*|плов|ош\s+паз|хӯрок|хурок|кулинар|готовить\s+(?:ед|ужин|обед|завтрак|куриц|плов)|выборы|президент|политик[ауи]|гороскоп|зодиак|болит\s+(?:голов|живот|горл|зуб)|таблетк|лекарств|диагноз|казино|ставк[иа]\s+на\s+спорт))/iu;

// Unrelated file-creation check: allow real programming questions like "как создать файл в Python / Node / Bash / HTML"
const CODING_FILE_CONTEXT =
  /\b(?:html|css|js|ts|jsx|tsx|json|sql|py|python|node|nodejs|fs|writefile|readfile|bash|linux|touch|mkdir|cat|echo|git|java|cpp|c\+\+|c#|csharp|go|golang|rust|php|ruby|kotlin|swift|react|next|nextjs|docker|env|config|component|компонент|код|скрипт|терминал)\b/iu;

// Code syntax or error traces strongly indicate a legitimate coding question.
const CODE_OR_ERROR_SIGNAL =
  /(?:=>|===|!==|<\/?[a-z][\w-]*[\s>]|function\s+\w*\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|import\s+.+\s+from\s+|export\s+(?:default|const|function)|def\s+\w+\s*\(|class\s+\w+|SELECT\s+.+\s+FROM|INSERT\s+INTO|CREATE\s+TABLE|console\.log|print\(|useState|useEffect|useMemo|useRef|useCallback|useContext|useOptimistic|async\s+function|await\s+|try\s*\{|catch\s*\(|TypeError|ReferenceError|SyntaxError|RangeError|NullPointer|Segmentation|404|500|npm\s+|npx\s+|git\s+|pip\s+|cargo\s+|curl\s+)/i;

// Curriculum keywords spanning ALL 43 DevAtlas courses + DevAtlas learning platform.
const CURRICULUM_KEYWORDS =
  /(?:\b(?:html|css|flexbox|grid|sass|scss|tailwind|dom|responsive|semantic|tag|tags|div|span|form|input|button|selector|cascade|specificity|media\s+query|animation|transition|javascript|typescript|react|next|nextjs|node|nodejs|express|npm|yarn|pnpm|vite|webpack|component|props|state|hook|hooks|render|rerender|jsx|tsx|virtual\s+dom|hydration|ssr|csr|rsc|app\s+router|middleware|route|routing|router|fetch|axios|promise|async|await|callback|closure|hoisting|scope|tdz|prototype|event\s+loop|array|object|map|filter|reduce|sort|class|interface|generic|generics|enum|tuple|union|strict|python|django|flask|pandas|numpy|list|dict|dictionary|comprehension|decorator|generator|java|jvm|spring|oop|inheritance|polymorphism|encapsulation|c\+\+|cpp|pointer|reference|vector|template|c#|csharp|dotnet|linq|golang|goroutine|channel|struct|rust|ownership|borrowing|lifetime|trait|cargo|php|laravel|composer|ruby|rails|kotlin|swift|swiftui|optional|optionals|coroutine|mobile|expo|android|ios|sql|sqlite|postgres|postgresql|mysql|select|join|where|group\s+by|index|transaction|acid|normali[zs]ation|mongodb|mongo|nosql|collection|aggregation|database|schema|migration|git|github|commit|branch|merge|rebase|pull\s+request|clone|push|pull|stash|diff|bash|shell|terminal|cli|linux|grep|sed|awk|pipe|chmod|cron|algorithm|algorithms|big\s*o|complexity|binary\s+search|sorting|recursion|tree|graph|hash\s*map|stack|queue|linked\s+list|dynamic\s+programming|backend|frontend|fullstack|http|https|rest|graphql|api|endpoint|status\s+code|header|cookie|session|jwt|oauth|auth|authentication|authorization|cors|csrf|xss|sql\s+injection|cache|caching|redis|rate\s+limit|testing|unit\s+test|e2e|vitest|jest|playwright|deploy|deployment|vercel|supabase|docker|architecture|adr|monolith|microservice|microservices|scalability|resilience|load\s+balancer|ai|llm|token|tokens|prompt|prompting|hallucination|embedding|embeddings|context\s+window|rag|chunking|agent|harness|mcp|sandbox|tool\s+call|ux|ui|wireframe|prototype|figma|usability|accessibility|wcag|contrast|typography|design\s+system|information\s+architecture|journey\s+map|user\s+research|persona|marketing|funnel|seo|smm|ctr|cpc|cpm|cac|ltv|roas|a\/b\s*test|conversion|targeting|campaign|analytics|kpi|dashboard|cohort|median|outlier|metric|metrics|statistics|chart|business|icp|value\s+proposition|pricing|unit\s+economics|margin|break[- ]?even|mvp|offer|startup|revenue|management|okr|delegation|feedback|risk|roadmap|sprint|agile|scrum|communication|negotiation|active\s+listening|conflict|copywriting|brief|editing|readability|copyright|content|english|grammar|tense|tenses|present\s+simple|present\s+continuous|past\s+simple|future\s+simple|modal\s+verb|irregular\s+verb|vocabulary|pronunciation|phrasal\s+verb|digital\s+literacy|phishing|password|2fa|mfa|backup|privacy|cybersecurity|browser|productivity|pomodoro|time\s+management|procrastination|priorit(?:y|ies)|focus|habit|devatlas|course|lesson|quiz|test|interview|practice|xp|plan|pro|ultra)\b|(?:курс\w*|дарс\w*|урок\w*|мавзӯ\w*|мавзу\w*|тема|темы|тест\w*|квиз\w*|санҷиш|мусоҳиба|интервью|практик\w*|машқ\w*|барномасоз\w*|программир\w*|код\w*|функци\w*|переменн\w*|тағйирёбанда|массив\w*|объект\w*|цикл\w*|услови\w*|класс\w*|метод\w*|модул\w*|компонент\w*|состояни\w*|пропс\w*|хук\w*|рендер\w*|верстк\w*|вёрстк\w*|тег\w*|селектор\w*|стил\w*|флекс\w*|грид\w*|адаптив\w*|доступност\w*|сервер\w*|клиент\w*|запрос\w*|дархост\w*|ответ\w*|авторизац\w*|аутентификац\w*|баз[ауые]\s+данных|пойгоҳи\s+маълумот|таблиц\w*|ҷадвал\w*|алгоритм\w*|сложност\w*|сортировк\w*|рекурси\w*|структур\w*\s+данных|ошибк\w*|хатог\w*|баг\w*|отладк\w*|дебаг\w*|коммит\w*|ветк\w*|репозитор\w*|терминал\w*|скрипт\w*|дизайн\w*|интерфейс\w*|прототип\w*|типографик\w*|контраст\w*|маркетинг\w*|воронк\w*|аудитори\w*|реклам\w*|аналитик\w*|метрик\w*|дашборд\w*|когорт\w*|бизнес\w*|тиҷорат\w*|марж\w*|ценообразован\w*|менеджмент\w*|идоракун\w*|делегирован\w*|переговор\w*|коммуникац\w*|муошират\w*|контент\w*|копирайтинг\w*|редактур\w*|англис\w*|английск\w*|грамматик\w*|замонҳо|времен[аи]\s+в\s+английск|фишинг\w*|парол\w*|безопасност\w*|амният\w*|продуктивност\w*|самаранок\w*|приоритет\w*|прокрастинац\w*|тайм[\s-]?менеджмент|нейросет\w*|промпт\w*|токен\w*|зеҳни\s+сунъ\w*|искусственн\w*\s+интеллект|архитектур\w*|меъмор\w*|микросервис\w*|монолит\w*|кэш\w*|кеш\w*))/iu;

// Short valid follow-ups ONLY when there is already a verified on-topic previous question.
const FOLLOW_UP_CLARIFICATION =
  /^(?:а\s+|ва\s+|и\s+)?(?:почему|зачем|как\s+это|как\s+работает|как\s+исправить|что\s+значит|в\s+ч[её]м\s+разница|приведи\s+пример|дай\s+пример|покажи\s+пример|покажи\s+код|пример|с\s+примером|проще|не\s+понял\w*|ещ[её]\s+раз|объясни\s+(?:проще|ещ[её]|на\s+примере)|чаро|чиба|чӣ\s+хел|чи\s+хел|фарқаш\s+чист|фаркаш\s+чист|мисол\s+(?:биор|деҳ|бте|нишон\s+деҳ)|бо\s+мисол|нафаҳмидам|нафахмидам|боз\s+содатар|содатар\s+фаҳмон|кодашро\s+нишон\s+деҳ|why|how\s+does\s+(?:it|that)\s+work|give\s+(?:me\s+)?an?\s+example|show\s+(?:an?\s+)?example|show\s+code|simpler|i\s+don'?t\s+understand|what'?s\s+the\s+difference|por\s+qu[eé]|dame\s+un\s+ejemplo|m[aá]s\s+sencillo|no\s+entend[ií])[\s?!.,]*$/iu;

export function tutorScope(
  query: string,
  previousUserQuestion?: string,
  codeContext?: string,
): TutorScope {
  const text = query.normalize('NFKC').trim();
  if (!text) return 'outside';

  // Everyday greetings, thanks, "чокади", "савол дорам" are answered immediately with 0 strikes.
  if (smalltalkKind(text)) return 'greeting';

  // Prompt overrides are ALWAYS rejected (even if mixed with course names or code).
  if (OVERRIDE_INSTRUCTIONS.test(text)) return 'outside';

  // Explicitly off-topic domains (weather, sports, cooking, politics, medicine, etc.) are rejected.
  if (OFF_TOPIC_DOMAINS.test(text)) return 'outside';

  // File/essay/poem/joke creation is rejected unless clearly asking about programming file APIs.
  if (PROHIBITED_GENERATION.test(text) && !CODING_FILE_CONTEXT.test(text)) {
    return 'outside';
  }

  // Deep follow-up ("Чуқур фаҳмон", "подробнее") stays inside scope if backed by an allowed prior question.
  if (isDeepFollowUp(text)) {
    return previousUserQuestion ? 'allowed' : 'outside';
  }

  // Code pasted in codeContext is allowed (overrides/off-topic already rejected above).
  if (codeContext?.trim()) return 'allowed';

  // Direct DevAtlas course match, curriculum keyword, or code/error snippet.
  if (
    courseCandidatesFor(text).length > 0 ||
    CURRICULUM_KEYWORDS.test(text) ||
    CODE_OR_ERROR_SIGNAL.test(text)
  ) {
    return 'allowed';
  }

  // Short clarification follow-up to an already-allowed course question.
  if (previousUserQuestion && FOLLOW_UP_CLARIFICATION.test(text)) {
    return 'allowed';
  }

  return 'outside';
}

export const tutorScopeReply: Record<TutorLanguage, { greeting: string; outside: string }> = {
  tg: {
    greeting: 'Салом! Ман AI Tutor-и DevAtlas ҳастам. Дар бораи курсҳо, дарсҳо ва код савол диҳед.',
    outside:
      'Ин савол берун аз мавзӯи курсҳои DevAtlas аст. Лутфан танҳо дар бораи курсҳои сайт ва код савол диҳед.',
  },
  ru: {
    greeting: 'Привет! Я AI Tutor DevAtlas. Задавайте вопросы по курсам, урокам и коду.',
    outside:
      'Этот вопрос выходит за рамки курсов DevAtlas. Задавайте вопросы только по курсам платформы и коду.',
  },
  en: {
    greeting: 'Hello! I am DevAtlas AI Tutor. Ask anything about our courses, lessons or code.',
    outside:
      'This request is outside DevAtlas course topics. Please ask only about DevAtlas courses and code.',
  },
  es: {
    greeting:
      '¡Hola! Soy AI Tutor de DevAtlas. Pregunta sobre nuestros cursos, lecciones o código.',
    outside:
      'Esta solicitud está fuera de los cursos de DevAtlas. Pregunta solo sobre los cursos y el código.',
  },
};
