import { describe, expect, it } from 'vitest';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { FEATURED_DIRECTIONS, landingDirections } from '@/lib/landing-directions';

const fake = (category: string, count: number) =>
  Array.from({ length: count }, (_, index) => ({ id: `${category}-${index}`, category }));

describe('landing directions on the computer screen', () => {
  it('uses the Russian plural forms курс / курса / курсов', () => {
    const catalog = [
      ...fake('programming', 27),
      ...fake('ai', 3),
      ...fake('design', 2),
      ...fake('marketing', 1),
      ...fake('analytics', 21),
      ...fake('business', 5),
    ];
    expect(landingDirections('ru', catalog).map((item) => item.countLabel)).toEqual([
      '27 курсов',
      '3 курса',
      '2 курса',
      '1 курс',
      '21 курс',
      '5 курсов',
    ]);
    expect(landingDirections('en', catalog)[3].countLabel).toBe('1 course');
    expect(landingDirections('es', catalog)[0].countLabel).toBe('27 cursos');
    expect(landingDirections('tg', catalog)[1].countLabel).toBe('3 курс');
  });

  it('counts the real catalog like the catalog page (javascript-2 is not a second card)', () => {
    const directions = landingDirections('ru');
    expect(directions.map((item) => item.id)).toEqual(FEATURED_DIRECTIONS);
    for (const direction of directions) {
      const expected = COURSE_CATALOG.filter(
        (course) => course.category === direction.id && course.id !== 'javascript-2',
      ).length;
      expect(direction.count).toBe(expected);
      expect(direction.count).toBeGreaterThan(0);
    }
    expect(directions[0].label).toBe('Программирование');
  });
});
