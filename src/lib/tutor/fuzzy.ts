// Typo-tolerant helpers for the tutor. People type "хтмл", "htlm" or "флексбокс"
// when they mean HTML or flexbox. These helpers turn such spellings into the
// name used in the course materials, and route questions directly to the right
// DevAtlas course across all 43 courses.
import type { CourseId } from '@/lib/courses/ids';

/**
 * Direct spelling variants of top-level technology/course names (Latin, Cyrillic, typos).
 * Sub-topics like "sass", "wireframe", "goroutine" live in PHRASE_COURSES below so
 * asking "Sass чист?" searches the real Sass lesson instead of returning the generic CSS glossary.
 */
const ALIASES: Record<string, string[]> = {
  html: ['html', 'html5', 'хтмл', 'хтмл5', 'хтмль', 'хтмель', 'ҳтмл', 'эйчтиэмэл', 'аштиэмэль'],
  css: ['css', 'css3', 'цсс', 'цсс3', 'сиэсэс'],
  javascript: [
    'javascript',
    'js',
    'жс',
    'джс',
    'джаваскрипт',
    'жаваскрипт',
    'ҷаваскрипт',
    'джава-скрипт',
  ],
  typescript: ['typescript', 'ts', 'тайпскрипт', 'тайп-скрипт', 'типскрипт'],
  react: ['react', 'reactjs', 'реакт', 'риакт', 'реактжс'],
  nextjs: ['nextjs', 'next.js', 'некстжс', 'нексжс'],
  nodejs: ['nodejs', 'node.js', 'node', 'нод', 'нодждс', 'нодэджс'],
  python: ['python', 'питон', 'пайтон', 'пайтан', 'пітон'],
  git: ['git', 'гит', 'github', 'гитхаб'],
  sql: ['sql', 'скл', 'эскюэль', 'сиквел'],
  java: ['java', 'джава', 'жава', 'ҷава'],
  cpp: ['c++', 'cpp', 'си++', 'сипп'],
  csharp: ['c#', 'csharp', 'сишарп', 'шарп'],
  go: ['golang', 'голанг'],
  rust: ['rust', 'раст'],
  php: ['php', 'пхп', 'пҳп'],
  ruby: ['ruby', 'руби'],
  kotlin: ['kotlin', 'котлин'],
  swift: ['swift', 'свифт'],
  bash: ['bash', 'баш', 'shell'],
  mongodb: ['mongodb', 'mongo', 'монго', 'монгодб'],
  algorithms: ['algorithms', 'algorithm', 'алгоритм', 'алгоритмы', 'алгоритмҳо', 'алгоритмхо'],
  backend: ['backend', 'бэкенд', 'бекенд', 'бэкэнд'],
  mobile: ['mobile', 'мобилӣ', 'мобили'],
  architecture: ['architecture', 'архитектура', 'меъморӣ'],
  ux: ['ux', 'ui', 'ux/ui', 'дизайн', 'design'],
  marketing: ['marketing', 'маркетинг'],
  analytics: ['analytics', 'аналитика'],
  business: ['business', 'бизнес', 'тиҷорат', 'тичорат'],
  management: ['management', 'менеджмент', 'идоракунӣ'],
  communication: ['communication', 'коммуникация', 'муошират'],
  english: ['english', 'английский', 'англисӣ', 'англиси'],
  productivity: ['productivity', 'продуктивность', 'самаранокӣ'],
  api: ['api', 'апи', 'эйпиай'],
  flexbox: ['flexbox', 'флексбокс', 'флекс', 'flex', 'флексбокц'],
  grid: ['grid', 'грид', 'гридс'],
};

const CANONICAL = new Map<string, string>();
for (const [name, spellings] of Object.entries(ALIASES))
  for (const spelling of spellings) CANONICAL.set(spelling, name);
/** Spellings long enough to be matched with a typo ("htlm" is not "ht"). */
const LONG_SPELLINGS = [...CANONICAL.keys()].filter((spelling) => spelling.length >= 4);

/** Lowercase words and tech tokens such as "c++", "c#" and "next.js"; no trailing dots. */
export function wordsOf(text: string): string[] {
  return (
    text
      .normalize('NFKC')
      .toLowerCase()
      .replaceAll('ё', 'е')
      .match(/[\p{L}\p{N}+#./]+/gu)
      ?.flatMap((token) =>
        token.includes('/') && token !== 'ux/ui' ? token.split('/').filter(Boolean) : [token],
      )
      .map((word) => word.replace(/^\.+|\.+$/g, ''))
      .filter(Boolean) ?? []
  );
}

/** How many typos a word of this length may contain: none for short words, one, then two. */
export function allowedEdits(word: string): number {
  const length = [...word].length;
  return length <= 3 ? 0 : length <= 7 ? 1 : 2;
}

/** Edit distance counting a swap of two neighbouring letters as one edit. Stops above `limit`. */
export function editDistance(a: string, b: string, limit: number): number {
  const x = [...a];
  const y = [...b];
  if (Math.abs(x.length - y.length) > limit) return limit + 1;
  let before: number[] = [];
  let previous = Array.from({ length: y.length + 1 }, (_, index) => index);
  for (let i = 1; i <= x.length; i++) {
    const row = [i];
    let smallest = i;
    for (let j = 1; j <= y.length; j++) {
      const cost = x[i - 1] === y[j - 1] ? 0 : 1;
      let value = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + cost);
      if (i > 1 && j > 1 && x[i - 1] === y[j - 2] && x[i - 2] === y[j - 1])
        value = Math.min(value, before[j - 2] + 1);
      row.push(value);
      smallest = Math.min(smallest, value);
    }
    if (smallest > limit) return limit + 1;
    before = previous;
    previous = row;
  }
  return previous[y.length];
}

/** The closest known word within the allowed typos. A typo never changes the first letter. */
export function nearest(word: string, vocabulary: Iterable<string>): string | undefined {
  const limit = allowedEdits(word);
  if (!limit) return undefined;
  let best: string | undefined;
  let bestDistance = limit + 1;
  for (const candidate of vocabulary) {
    if (candidate[0] !== word[0] || candidate === word) continue;
    const distance = editDistance(word, candidate, limit);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

/** "хтмл" and "htlm" become "html". Words that are not technology names stay as they are. */
export function canonicalWord(word: string): string {
  const exact = CANONICAL.get(word);
  if (exact) return exact;
  const similar = word.length >= 4 ? nearest(word, LONG_SPELLINGS) : undefined;
  return similar ? (CANONICAL.get(similar) ?? word) : word;
}

/** True when the word is (a spelling of) a technology/course name. */
export function isTopicWord(word: string): boolean {
  return Object.hasOwn(ALIASES, canonicalWord(word));
}

/** The technology/discipline names mentioned in a text, in order, without repeats. */
export function topicsIn(text: string): string[] {
  const found: string[] = [];
  for (const word of wordsOf(text)) {
    const name = canonicalWord(word);
    if (Object.hasOwn(ALIASES, name) && !found.includes(name)) found.push(name);
  }
  return found;
}

/** Primary course for each canonical topic. */
const TOPIC_COURSE: Record<string, CourseId> = {
  html: 'html',
  css: 'css',
  javascript: 'javascript-1',
  typescript: 'typescript',
  react: 'react',
  nextjs: 'nextjs',
  nodejs: 'nodejs',
  python: 'python',
  git: 'git',
  sql: 'sql',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  kotlin: 'kotlin',
  swift: 'swift',
  bash: 'bash',
  mongodb: 'mongodb',
  algorithms: 'algorithms',
  backend: 'backend',
  mobile: 'mobile',
  architecture: 'architecture-expert',
  ux: 'ux-design',
  marketing: 'digital-marketing',
  analytics: 'data-analytics',
  business: 'business-foundations',
  management: 'management-foundations',
  communication: 'communication',
  english: 'english-foundations',
  productivity: 'personal-productivity',
  flexbox: 'html',
  grid: 'html',
};

/** Multi-word and sub-topic routing rules across all 43 DevAtlas courses. */
const PHRASE_COURSES: Array<[RegExp, CourseId]> = [
  [/\b(?:sass|scss)\b/iu, 'css'],
  [/\b(?:javascript|js)\s*2\b|\bjson[\s-]?server\b|\baxios\b/iu, 'javascript-2'],
  [/\b(?:javascript|js)\s*pro\b|\bevent\s*loop\b/iu, 'javascript-pro'],
  [/\bbackend\s*pro\b|\bбэкенд\s*про\b/iu, 'backend-pro'],
  [/\bux\s*(?:design\s*)?pro\b|\bдизайн\s*про\b/iu, 'ux-pro'],
  [
    /\bbusiness\s*pro\b|\bбизнес\s*про\b|\bunit[\s-]economics\b|юнит[\s-]экономик/iu,
    'business-pro',
  ],
  [
    /\b(?:software\s*)?architecture\b|архитектур|системн\w*\s+дизайн|микросервис|\badr\b/iu,
    'architecture-expert',
  ],
  [
    /\b(?:язык|забони|курс|курс[еуа]?)\s+go\b|\bgo\s+(?:language|lang|курс|дарс)\b|\bgoroutine|горутин/iu,
    'go',
  ],
  [/\b(?:borrow\w*|ownership|cargo|rustc)\b/iu, 'rust'],
  [/\b(?:linq|dotnet|\.net)\b/iu, 'csharp'],
  [/\b(?:composer|laravel)\b/iu, 'php'],
  [/\b(?:swiftui)\b/iu, 'swift'],
  [/\b(?:sqlite|postgresql|postgres|mysql)\b/iu, 'sql'],
  [/\b(?:nosql|aggregation)\b/iu, 'mongodb'],
  [/\b(?:linux|линукс|терминал|grep|awk|sed)\b/iu, 'bash'],
  [
    /\bcontext\s+engineering\b|\brag\b|\bраг\b|окно\s+контекст|эмбеддинг|chunking|чанкинг/iu,
    'context-engineering',
  ],
  [/\bagent\s+harness\b|\bharn?ess\b|\bmcp\b|цикл\s+агент|песочниц/iu, 'agent-harness'],
  [
    /\bai\s+fundamentals\b|\bllm\b|\bллм\b|промпт|галлюцинац|нейросет|основы\s+ии|зеҳни\s+сунъ|искусственн\w*\s+интеллект/iu,
    'ai-fundamentals',
  ],
  [/\b(?:figma|фигма|wireframe|вайрфрейм|юзабилити|usability|wcag|типографика)\b/iu, 'ux-design'],
  [
    /\bdigital\s+marketing\b|цифров\w*\s+маркетинг|таргет|воронка|\b(?:seo|сео|smm|смм|ctr|cpc|cac|ltv)\b/iu,
    'digital-marketing',
  ],
  [
    /\bdata\s+analytics\b|анализ\s+данных|таҳлили\s+маълумот|\b(?:kpi|кпи|dashboard|дашборд|cohort|когорт\w*)\b/iu,
    'data-analytics',
  ],
  [/\b(?:маржа|безубыточность|стартап|ценообразование|\bicp\b)\b/iu, 'business-foundations'],
  [/\b(?:делегирование|delegation|\bokr\b|тимлид)\b/iu, 'management-foundations'],
  [/\b(?:переговоры|negotiation|фидбек|активное\s+слушание)\b/iu, 'communication'],
  [
    /\bcontent\s+creation\b|создан\w*\s+контент|эҷоди\s+контент|копирайтинг|copywriting|редактур/iu,
    'content-creation',
  ],
  [
    /\bdigital\s+literacy\b|цифров\w*\s+грамотност|саводнокии\s+рақамӣ|фишинг|phishing|\b2fa\b|кибербезопасност/iu,
    'digital-literacy',
  ],
  [
    /\bpersonal\s+productivity\b|личн\w*\s+продуктивност|тайм[\s-]менеджмент|прокрастинац|помодоро|pomodoro/iu,
    'personal-productivity',
  ],
  [
    /\benglish\s+foundations\b|забони\s+англис|английск\w*\s+язык|грамматик|grammar|vocabulary|present\s+(?:simple|continuous)|past\s+simple/iu,
    'english-foundations',
  ],
  [/\breact\s+native\b|\bexpo\b|экспо|мобильн\w*\s+разработ/iu, 'mobile'],
  [/\bapi\b|\bапи\b|\bhttp\b|\brest\b|\bjwt\b/iu, 'backend'],
  [/\bnext\.?js\b|\bapp\s+router\b/iu, 'nextjs'],
  [/\buse(?:state|effect|memo|callback|ref|context|reducer|optimistic)\b|\bjsx\b/iu, 'react'],
];

/**
 * Ordered candidate DevAtlas courses named by a question (phrase matches first, then topic tokens).
 * Used to search only the relevant 1–2 courses instead of scanning all 43 courses.
 */
export function courseCandidatesFor(text: string): CourseId[] {
  const candidates: CourseId[] = [];
  const add = (id: CourseId | undefined) => {
    if (id && !candidates.includes(id)) candidates.push(id);
  };
  for (const [pattern, courseId] of PHRASE_COURSES) {
    if (pattern.test(text)) add(courseId);
  }
  for (const topic of topicsIn(text)) {
    add(TOPIC_COURSE[topic]);
  }
  return candidates;
}

/**
 * The course a question is about when it names exactly one technology
 * ("хтмл что такое" → html), or null when it names none or several.
 */
export function courseFor(text: string): string | null {
  const courses = [
    ...new Set(
      topicsIn(text)
        .map((name) => TOPIC_COURSE[name])
        .filter(Boolean),
    ),
  ];
  return courses.length === 1 ? courses[0] : null;
}
