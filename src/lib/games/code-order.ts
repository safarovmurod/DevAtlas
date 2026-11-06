/** "Put the code in order" game built from any lesson's example code, so every course gets a game without new content. */
export interface CodeOrderPuzzle {
  lines: string[];
  shuffled: number[];
}

export const MIN_GAME_LINES = 3;
export const MAX_GAME_LINES = 10;

const distinct = (lines: string[]) =>
  new Set(lines.map((line) => line.trim())).size === lines.length;
/** A line that is only punctuation ("}", ");", "</div>") carries no meaning on its own. */
const meaningful = (line: string) =>
  /[A-Za-z0-9\u0400-\u04FF]/.test(line.replace(/<\/[a-z0-9]+>/gi, ''));

/** Picks the first example with 3–10 distinct lines; long examples contribute a coherent 4–8 line window. */
export function pickGameCode(sections: { code?: string }[]): string[] | null {
  for (const section of sections) {
    if (!section.code) continue;
    const lines = section.code
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .filter((line) => line.trim() !== '');
    if (lines.length < MIN_GAME_LINES) continue;
    // Identical lines (e.g. two "}") would make several orders correct; such windows are skipped.
    if (lines.length <= MAX_GAME_LINES && distinct(lines)) return lines;
    for (let size = 8; size >= 4; size--)
      for (let start = 0; start + size <= lines.length; start++) {
        const window = lines.slice(start, start + size);
        if (distinct(window) && window.filter(meaningful).length >= size - 1) return window;
      }
  }
  return null;
}

/** Lessons without code still get a game: put the lesson's own steps back in order. */
export function pickGameSteps(titles: string[]): string[] | null {
  const steps = titles.map((title) => title.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
  return steps.length >= MIN_GAME_LINES && steps.length <= MAX_GAME_LINES && distinct(steps)
    ? steps
    : null;
}

/** Small deterministic PRNG so the same lesson shows the same shuffle on server and client. */
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleOrder(count: number, seed: string): number[] {
  const random = seeded(seed);
  const order = Array.from({ length: count }, (_, index) => index);
  for (let attempt = 0; attempt < 5; attempt++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (order.some((value, index) => value !== index)) return order;
  }
  return order.reverse();
}

export type PuzzleKind = 'code' | 'steps';
export function buildPuzzle(
  sections: { code?: string; title?: string }[],
  seed: string,
): (CodeOrderPuzzle & { kind: PuzzleKind }) | null {
  const code = pickGameCode(sections);
  if (code) return { kind: 'code', lines: code, shuffled: shuffleOrder(code.length, seed) };
  const steps = pickGameSteps(sections.map((section) => section.title ?? ''));
  return steps ? { kind: 'steps', lines: steps, shuffled: shuffleOrder(steps.length, seed) } : null;
}

/** Index of the first misplaced line in the learner's answer, or -1 when everything chosen so far is right. */
export function firstMistake(answer: number[]): number {
  return answer.findIndex((line, position) => line !== position);
}
