// Turns a written answer into something that sounds natural when read aloud:
// no code, no links, no labels like "Answer:" and a sensible length.

/** Labels of blocks that sound odd or useless when spoken. The whole block is skipped. */
const SKIPPED_BLOCK =
  /^(тема|мавзӯъ|topic|вопрос|савол|question|код|code|как это работает|ҷараёни кор|how it works|связанные вопросы|саволҳои вобаста|related questions|tema|pregunta|c[oó]digo|c[oó]mo funciona|preguntas relacionadas)\s*:/iu;
/** Labels that start the real answer. Only the label is removed. */
const ANSWER_LABEL =
  /^(ответ|ҷавоб|answer|подробнее|чуқуртар|deeper explanation|respuesta|explicaci[oó]n m[aá]s detallada)\s*:\s*/iu;

/** Cuts at the end of a sentence close to `max` characters, never in the middle of a word. */
function cutAtSentence(text: string, max: number): string {
  if (text.length <= max) return text;
  const head = text.slice(0, max);
  const end = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
  if (end > max * 0.5) return head.slice(0, end + 1);
  const space = head.lastIndexOf(' ');
  return (space > 0 ? head.slice(0, space) : head).trimEnd() + '…';
}

/** The text to speak and to show as the caption. */
export function spokenText(reply: string, max = 480): string {
  const withoutCode = reply.replace(/```[\s\S]*?```/g, ' ');
  const blocks = withoutCode
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block && !SKIPPED_BLOCK.test(block))
    .map((block) => block.replace(ANSWER_LABEL, ''));
  const text = (blocks.length ? blocks : [withoutCode])
    .join(' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[*_`#>]+/g, '')
    .replace(/\s*\n\s*/g, '. ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
  return cutAtSentence(text, max);
}
