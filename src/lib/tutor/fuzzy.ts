// Typo-tolerant helpers for the tutor. People type "хтмл", "htlm" or "флексбокс"
// when they mean HTML or flexbox. These helpers turn such spellings into the
// name used in the course materials, so a question is still found.

/** Spellings of technology names (Latin, Cyrillic, common typos) by the name used in lessons. */
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
  git: ['git', 'гит'],
  sql: ['sql', 'скл', 'эскюэль', 'сиквел'],
  java: ['java', 'джава', 'жава', 'ҷава'],
  cpp: ['c++', 'cpp', 'си++', 'сипп'],
  api: ['api', 'апи', 'эйпиай'],
  flexbox: ['flexbox', 'флексбокс', 'флекс', 'flex', 'флексбокц'],
  grid: ['grid', 'грид', 'гридс'],
};

const CANONICAL = new Map<string, string>();
for (const [name, spellings] of Object.entries(ALIASES))
  for (const spelling of spellings) CANONICAL.set(spelling, name);
/** Spellings long enough to be matched with a typo ("htlm" is not "ht"). */
const LONG_SPELLINGS = [...CANONICAL.keys()].filter((spelling) => spelling.length >= 4);

/** Lowercase words and tech tokens such as "c++" and "next.js"; no trailing dots. */
export function wordsOf(text: string): string[] {
  return (
    text
      .normalize('NFKC')
      .toLowerCase()
      .replaceAll('ё', 'е')
      .match(/[\p{L}\p{N}+#.]+/gu)
      ?.map((word) => word.replace(/^\.+|\.+$/g, ''))
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

/** True when the word is (a spelling of) a technology name. */
export function isTopicWord(word: string): boolean {
  return Object.hasOwn(ALIASES, canonicalWord(word));
}

/** The technology names mentioned in a text, in order, without repeats. */
export function topicsIn(text: string): string[] {
  const found: string[] = [];
  for (const word of wordsOf(text)) {
    const name = canonicalWord(word);
    if (Object.hasOwn(ALIASES, name) && !found.includes(name)) found.push(name);
  }
  return found;
}

/** The course that teaches each topic. Topics with no single course are left out. */
const TOPIC_COURSE: Record<string, string> = {
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
  flexbox: 'html',
  grid: 'html',
};

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
