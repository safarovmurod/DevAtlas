import { expect, test } from '@playwright/test';
import go from '../src/content/courses/go.json';
import { courseContentSchema, courseText } from '../src/lib/courses/schema';
import { dayExamInterview, dayExamQuiz } from '../src/lib/courses/strict-attempt';

const finalLesson = courseContentSchema.parse(go).lessons[29];

for (const locale of ['ru', 'tg', 'en'] as const) {
  test(`Go final project: translated theory, practice access and one final exam (${locale})`, async ({ page }) => {
    const lesson = go.lessons[29];
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ locale, ids }) => {
      if (window.self !== window.top) return;
      sessionStorage.setItem('react-mentor-guest', 'true');
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
    await expect(page.locator('main article h2').first()).toHaveText(go.lessons[0].title[locale]);
    const dayOneTheory = page.locator('[data-lesson-section]').first();
    for (const paragraph of go.lessons[0].sections[0].body[locale].split(/\r?\n+/).filter(Boolean)) {
      await expect(dayOneTheory).toContainText(paragraph);
    }
    await page.goto('/courses/go/home?day=30');
    await expect(page.locator('main article h2').first()).toHaveText(lesson.title[locale]);
    await expect(page.locator('[data-lesson-section]')).toHaveCount(4);
    const theory = page.locator('[data-lesson-section]').first();
    for (const paragraph of lesson.sections[0].body[locale].split(/\r?\n+/).filter(Boolean)) {
      await expect(theory).toContainText(paragraph);
    }
    await expect(page.locator('#day-learn')).not.toContainText('func (l *List) Complete');
    await page.locator('#day-learn').getByRole('button', { name: 'Прочитал и понял', exact: true }).click();

    await page.getByRole('button', { name: 'Практика', exact: true }).click();
    if (process.env.PLAYWRIGHT_PROD_SERVER === 'true') {
      await expect(page.locator('[data-practice-locked]')).toBeVisible();
      await expect(page.locator('.practice-instructions')).toHaveCount(0);
    } else {
      await expect(page.locator('.practice-instructions')).toContainText(lesson.practice.task[locale]);
      await expect(page.getByRole('timer')).toBeVisible();
      await expect(page.locator('.course-criterion')).toHaveCount(3);
      for (const criterion of lesson.practice.criteria) {
        await expect(page.locator('.practice-validation')).toContainText(criterion[locale]);
      }
      const solution = page.locator('.solution');
      await expect(solution.locator('pre')).toBeHidden();
      await solution.locator('summary').click();
      await expect(solution.locator('pre')).toContainText('// File: todo_test.go');
      await expect(solution.locator('pre')).toContainText('// Output:');
    }

    await page.goto('/courses/go/tests?day=30'); await page.locator('[data-strict-start]').click();
    const questions = dayExamQuiz(finalLesson, 30);
    const interview = dayExamInterview(finalLesson, 30)!;
    const quizzes = page.locator('.course-question').filter({ has: page.locator('.course-options') });
    await expect(quizzes).toHaveCount(questions.length);
    const question = questions[0];
    await quizzes.first().getByRole('radio').nth((question.correctIndex + 1) % question.options.length).check();
    for (let index = 1; index < questions.length; index++) {
      await quizzes.nth(index).getByRole('radio').nth(questions[index].correctIndex).check();
    }
    await page.getByRole('region', { name: 'Экзамен: тест и интервью' }).getByRole('textbox').fill(courseText(interview.answer, locale));
    await page.getByRole('button', { name: 'Отправить ответы', exact: true }).click();
    const result = page.getByRole('region', { name: 'Разбор результата' });
    await expect(result).toContainText(`${Math.round(questions.length / (questions.length + 1) * 100)}%`);
    await expect(result).toContainText(courseText(question.hint!, locale));
    const section = lesson.sections[question.relatedSection!];
    await result.getByRole('link', { name: section.title[locale], exact: true }).click();
    await expect(page.locator(`#${lesson.id}-section-${question.relatedSection}`)).toContainText(section.title[locale]);
    await page.goto('/courses/go/tests?day=30');
    await expect(result).toBeVisible();
    await expect(page.locator('[data-strict-start]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
