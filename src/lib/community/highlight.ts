/**
 * A tiny, safe code highlighter for chat code blocks. It only splits text into tokens;
 * the UI renders each token as text inside a <span>, never as HTML.
 */
export type CodeToken = {
  text: string;
  type: 'plain' | 'keyword' | 'string' | 'comment' | 'number';
};

const KEYWORDS = new Set(
  (
    'const let var function return if else for while do switch case break continue new class ' +
    'extends import from export default async await try catch finally throw typeof instanceof ' +
    'in of true false null undefined this super yield def print elif lambda pass None True False ' +
    'public private protected static void int string bool interface type enum select where insert update delete'
  ).split(' '),
);

const PATTERN =
  /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|--[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

export function highlightCode(source: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let last = 0;
  for (const match of source.matchAll(PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ text: source.slice(last, index), type: 'plain' });
    const [text, comment, string, number, word] = match;
    tokens.push({
      text,
      type: comment
        ? 'comment'
        : string
          ? 'string'
          : number
            ? 'number'
            : word && KEYWORDS.has(word)
              ? 'keyword'
              : 'plain',
    });
    last = index + text.length;
  }
  if (last < source.length) tokens.push({ text: source.slice(last), type: 'plain' });
  return tokens;
}
