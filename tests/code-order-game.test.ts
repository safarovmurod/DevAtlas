import { describe, expect, it } from 'vitest';
import { buildPuzzle, firstMistake, pickGameCode, pickGameSteps, shuffleOrder } from '@/lib/games/code-order';

describe('code order game', () => {
  it('uses short examples as they are', () => {
    expect(pickGameCode([{ code: '<h1>Hi</h1>\n<p>Text</p>\n<a href="#">Go</a>' }])).toEqual(['<h1>Hi</h1>', '<p>Text</p>', '<a href="#">Go</a>']);
  });

  it('skips examples where identical lines make several orders correct', () => {
    const lines = pickGameCode([{ code: 'if (a) {\n  x();\n}\nif (b) {\n  y();\n}' }])!;
    expect(new Set(lines.map(line => line.trim())).size).toBe(lines.length);
    expect(pickGameCode([{ code: '}\n}\n}' }])).toBeNull();
  });

  it('takes a meaningful window from long examples', () => {
    const code = Array.from({ length: 14 }, (_, index) => `const v${index} = ${index};`).join('\n');
    const lines = pickGameCode([{ code }])!;
    expect(lines.length).toBeGreaterThanOrEqual(4);
    expect(lines.length).toBeLessThanOrEqual(8);
    expect(new Set(lines).size).toBe(lines.length);
  });

  it('falls back to ordering lesson steps without leading numbers', () => {
    expect(pickGameSteps(['1. Open the folder', '2. Write a tag', '3. Check the browser'])).toEqual(['Open the folder', 'Write a tag', 'Check the browser']);
    const puzzle = buildPuzzle([{ title: '1. A' }, { title: '2. B' }, { title: '3. C' }], 'lesson');
    expect(puzzle?.kind).toBe('steps');
  });

  it('shuffles deterministically and never returns the solved order', () => {
    for (const count of [3, 5, 8]) {
      const order = shuffleOrder(count, 'html-day-01');
      expect(order).toEqual(shuffleOrder(count, 'html-day-01'));
      expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: count }, (_, index) => index));
      expect(order.some((value, index) => value !== index)).toBe(true);
    }
  });

  it('reports the first misplaced line', () => {
    expect(firstMistake([0, 1, 2])).toBe(-1);
    expect(firstMistake([0, 2])).toBe(1);
  });
});

describe('start here content', async () => {
  const { START_SECTIONS, START_QUESTIONS } = await import('@/content/start-here');
  it('is complete in TG/RU/EN and covers VS Code and the console', () => {
    const texts = [...START_SECTIONS.flatMap(section => [section.title, section.body, ...(section.steps ?? [])]), ...START_QUESTIONS.flatMap(question => [question.question, question.explanation, ...question.options])];
    for (const text of texts) expect(Boolean(text.tg.trim() && text.ru.trim() && text.en.trim())).toBe(true);
    expect(START_SECTIONS.map(section => section.id)).toEqual(expect.arrayContaining(['what', 'vscode', 'console']));
    for (const question of START_QUESTIONS) expect(question.correctIndex).toBeLessThan(question.options.length);
  });
});
