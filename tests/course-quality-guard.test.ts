// @vitest-environment node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Generated placeholder lessons ("How would you explain topic X?", identical
 * boilerplate and criteria) teach nothing. Rewritten courses must stay clean.
 * Courses still awaiting a rewrite are listed explicitly; remove an id from
 * this list when its rewrite lands so the guard covers it from then on.
 */
const AWAITING_REWRITE = new Set(['javascript-1', 'javascript-2', 'git', 'cpp']);
const MARKERS = [
  'Как объяснить тему',
  'Достаточно скопировать код, не проверяя результат',
  'Сохраните вчерашний результат и внесите только новое изменение',
  'Задание выполнено и проверен ожидаемый результат',
];

async function courses() {
  const dir = path.join(process.cwd(), 'src/content/courses');
  const files = (await readdir(dir)).filter(name => name.endsWith('.json') && name !== 'telegram-index.json');
  return Promise.all(files.map(async name => ({ id: name.replace(/\.json$/, ''), text: await readFile(path.join(dir, name), 'utf8') })));
}

describe('course quality guard', () => {
  it('has no generated placeholder lessons outside the explicit rewrite queue', async () => {
    const offenders = (await courses())
      .filter(course => !AWAITING_REWRITE.has(course.id))
      .flatMap(course => MARKERS.filter(marker => course.text.includes(marker)).map(marker => `${course.id}: ${marker}`));
    expect(offenders).toEqual([]);
  });

  it('keeps the rewrite queue honest: queued courses still contain placeholders', async () => {
    const queued = (await courses()).filter(course => AWAITING_REWRITE.has(course.id));
    expect(queued.map(course => course.id).sort()).toEqual([...AWAITING_REWRITE].sort());
    for (const course of queued) expect(MARKERS.some(marker => course.text.includes(marker)), course.id + ' is clean — remove it from AWAITING_REWRITE').toBe(true);
  });

  it('HTML + CSS lessons have real questions, specific criteria and three languages', async () => {
    const html = JSON.parse((await courses()).find(course => course.id === 'html')!.text);
    for (const lesson of html.lessons.filter((item: { day?: number }) => (item.day ?? 0) >= 2)) {
      expect(lesson.sections.length, lesson.id).toBeGreaterThanOrEqual(4);
      expect(lesson.questions.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(lesson.practice.criteria.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(lesson.practice.solution.length, lesson.id).toBeGreaterThan(200);
      for (const section of lesson.sections) for (const locale of ['ru', 'tg', 'en']) expect(section.body[locale]?.trim().length, lesson.id + ' ' + locale).toBeGreaterThan(80);
    }
    expect(html.files.some((file: { title: string }) => file.title.startsWith('Превью Telegram'))).toBe(false);
  });
});
