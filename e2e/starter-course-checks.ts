import { expect, test } from '@playwright/test';
import { courseContentSchema } from '../src/lib/courses/schema';

export function checkStarterModules(rawCourse: unknown) {
  const course = courseContentSchema.parse(rawCourse);
  for (const [endDay, locale] of [[16, 'ru'], [23, 'tg'], [30, 'en']] as const) {
    if (!course.lessons.some(lesson => lesson.day === endDay)) continue;
    test(`${course.courseId} days ${endDay - 6}–${endDay}: ${locale} lessons, feedback and independent work`, async ({ page }, testInfo) => {
      test.setTimeout(120000);
      const previous = course.lessons.filter(lesson => lesson.day! < endDay);
      await page.addInitScript(({ courseId, ids, days, locale }) => {
        if (self !== top) return;
        const key = 'react-mentor-learning-v2';
        if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, state: {
          language: 'ru', contentLanguage: locale, courses: {
            [courseId]: { completedTopics: ids, completedPractice: ids, confirmedDays: days },
          },
        } }));
      }, { courseId: course.courseId, ids: previous.map(lesson => lesson.id), days: previous.map(lesson => String(lesson.day)), locale });

      await page.goto(`/courses/${course.courseId}/plan`);
      await expect(page.locator('.day-card')).toHaveCount(course.lessons.length);
      for (const lesson of course.lessons.filter(lesson => lesson.day! >= endDay - 6 && lesson.day! <= endDay)) {
        await page.goto(`/courses/${course.courseId}/home?day=${lesson.day}`);
        await expect(page.locator(`#${lesson.id} > header > h2`)).toHaveText(lesson.title[locale]!);
        await expect(page.locator('[data-lesson-section]')).toHaveCount(4);
      }

      const lesson = course.lessons.find(lesson => lesson.day === endDay)!;
      await page.goto(`/courses/${course.courseId}/tests?day=${endDay}`);
      const question = page.locator('.course-question').first();
      const wrong = (lesson.questions[0].correctIndex + 1) % 3;
      await question.getByRole('radio', { name: lesson.questions[0].options[wrong][locale]!, exact: true }).check();
      await question.getByRole('button', { name: 'Проверить', exact: true }).click();
      await expect(question.locator('.question-feedback')).toContainText(lesson.questions[0].hint![locale]!);
      await expect(question.locator('.question-feedback a')).toHaveAttribute('href', `/courses/${course.courseId}/home?day=${endDay}#${lesson.id}-section-${lesson.questions[0].relatedSection}`);
      const second = page.locator('.course-question').nth(1);
      await second.getByRole('radio', { name: lesson.questions[1].answer[locale]!, exact: true }).check();
      await second.getByRole('button', { name: 'Проверить', exact: true }).click();
      await expect(second.getByRole('status')).toHaveText('Верно');

      await page.goto(`/practice?course=${course.courseId}&day=${endDay}`);
      const answer = `My independent ${course.courseId} day ${endDay} draft identifies the requested outcome, one unresolved risk, a check and the next action. This is an incomplete written attempt; no real account settings or team outcomes have been verified.`;
      await page.locator('.written-practice textarea').fill(answer);
      await page.reload();
      await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
      const progress = await page.evaluate((id) => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses[id], course.courseId);
      expect(progress.completedPractice).not.toContain(lesson.id);
      expect(progress.confirmedDays).not.toContain(String(endDay));
      if (endDay === 30) {
        const panel = page.locator('.written-rubric-review');
        await expect(panel.locator('fieldset')).toHaveCount(lesson.practice!.criteria.length);
        for (const field of await panel.locator('fieldset').all()) await field.getByRole('radio').nth(1).check();
        await panel.getByRole('textbox').fill('I identified the outcome and an unresolved risk. The draft still needs the checks required by the task. This is self-review only.');
        await panel.getByRole('button', { name: 'Сохранить Self Reviewed и продолжить' }).click();
        await expect(panel.getByRole('status')).toContainText('Self Reviewed');
        await page.reload();
        await expect(panel.getByRole('status')).toContainText('Self Reviewed');
        const key = `written-review-v${lesson.practice!.rubric!.version}:${lesson.id}`;
        const review = await page.evaluate(({ id, key }) => JSON.parse(JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses[id].drafts[key]), { id: course.courseId, key });
        expect(review.method).toBe('Self Reviewed');
        expect(review.verified).toBeUndefined();
        await page.screenshot({ path: testInfo.outputPath(`${course.courseId}-capstone.png`), fullPage: true });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
