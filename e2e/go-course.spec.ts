import { expect, test } from '@playwright/test';
import go from '../src/content/courses/go.json';

for (const locale of ['ru', 'tg', 'en'] as const) {
  test(`Go final project: translated theory, independent practice and quiz feedback (${locale})`, async ({ page }) => {
    const lesson = go.lessons[29];
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ locale, ids }) => {
      if (window.self !== window.top) return;
      const key = 'react-mentor-learning-v2';
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, JSON.stringify({ version: 2, state: {
        language: 'ru', contentLanguage: locale, selectedCourse: 'go', courseChosen: true,
        courses: { go: {
          completedTopics: ids, completedPractice: ids,
          confirmedDays: Array.from({ length: 29 }, (_, index) => String(index + 1)),
        } },
      } }));
    }, { locale, ids: go.lessons.slice(0, 29).map(item => item.id) });

    await page.goto('/courses/go/home?day=1');
    await expect(page.locator('.course-lesson h2')).toHaveText(go.lessons[0].title[locale]);
    await expect(page.locator('.day-explanation').first()).toContainText(go.lessons[0].sections[0].body[locale]);
    await page.goto('/courses/go/home?day=30');
    await expect(page.locator('.course-lesson h2')).toHaveText(lesson.title[locale]);
    await expect(page.locator('.day-explanation')).toHaveCount(4);
    await expect(page.locator('.day-explanation').first()).toContainText(lesson.sections[0].body[locale]);
    await expect(page.locator('.course-lesson')).not.toContainText('func (l *List) Complete');

    await page.getByRole('link', { name: 'Практика этого дня', exact: true }).click();
    await expect(page.locator('.practice-instructions')).toContainText(lesson.practice.task[locale]);
    await expect(page.locator('.practice-hint')).toHaveCount(2);
    await expect(page.locator('.course-criterion')).toHaveCount(3);
    for (const criterion of lesson.practice.criteria) {
      await expect(page.locator('.practice-validation')).toContainText(criterion[locale]);
    }
    const solution = page.locator('.solution');
    await expect(solution.locator('pre')).toBeHidden();
    await solution.locator('summary').click();
    await expect(solution.locator('pre')).toContainText('// File: todo_test.go');
    await expect(solution.locator('pre')).toContainText('// Output:');

    await page.goto('/courses/go/tests?day=30');
    const quizzes = page.locator('.course-question').filter({ has: page.locator('.course-options') });
    await expect(quizzes).toHaveCount(3);
    const first = quizzes.first();
    const question = lesson.questions[0];
    await first.getByRole('radio').nth((question.correctIndex + 1) % 3).check();
    await first.getByRole('button', { name: 'Проверить', exact: true }).click();
    await expect(first.locator('.question-feedback')).toContainText(question.hint[locale]);
    await first.locator('.question-feedback a').click();
    await expect(page.locator(`#${lesson.id}-section-${question.relatedSection}`)).toContainText(lesson.sections[question.relatedSection].title[locale]);
    await page.goto('/courses/go/tests?day=30');
    for (let index = 0; index < 3; index++) {
      const quiz = quizzes.nth(index);
      await quiz.getByRole('radio').nth(lesson.questions[index].correctIndex).check();
      await quiz.getByRole('button', { name: 'Проверить', exact: true }).click();
      await expect(quiz.getByRole('status')).toHaveText('Верно');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
