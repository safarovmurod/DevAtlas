// @vitest-environment node
import { expect, it } from 'vitest';
import { loadCourseContent } from '@/lib/courses/content';

it('English final projects preserve the new source data and distinguish self-review from oral assessment', async () => {
  const course = await loadCourseContent('english-foundations');
  expect(course.lessons).toHaveLength(42);
  const writing = course.lessons[40].practice!;
  const speaking = course.lessons[41].practice!;
  expect(writing.task.en).toContain('Saturday / English / 18:30–19:30 / Room 7');
  expect(writing.referenceAnswer!.en).toContain('Saturday, English, 18:30–19:30, Room 7');
  expect(writing.referenceAnswer!.en).toContain('What is the price?'); // asks rather than inventing a price
  expect(writing.referenceAnswer!.en).toContain('availability and price unknown');
  expect(speaking.task.en).toContain('mark not performed');
  expect(speaking.referenceAnswer!.en).toContain('oral part not yet performed');
  expect(course.lessons[41].sections.map(s => s.body.en).join(' ')).toContain('no automatic audio');
  for (const practice of [writing, speaking]) {
    expect(practice.kind).toBe('written');
    expect(practice.execution).toBeUndefined();
    expect(practice.rubric?.version).toBe(1);
    expect(practice.rubric?.criteria).toHaveLength(practice.criteria.length);
    for (const item of practice.rubric!.criteria) {
      for (const locale of ['ru', 'tg', 'en'] as const) {
        expect(new Set(item.levels.map(level => level[locale])).size).toBe(3);
      }
    }
  }
});
