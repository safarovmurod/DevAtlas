import { expect, test } from '@playwright/test';
import course from '../src/content/courses/english-foundations.json';

for (const [start, end] of [[15, 18], [19, 26], [27, 34], [35, 42]]) {
  test(`English learner reads days ${start}–${end}, receives feedback and retains independent work`, async ({ page }) => {
    test.setTimeout(120000);
    const previous = course.lessons.filter(lesson => lesson.day < end);
    await page.addInitScript(({ ids, days }) => {
      if (self !== top) return;
      const key = 'react-mentor-learning-v2';
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, state: {
        language: 'ru', contentLanguage: 'tg', courses: {
          'english-foundations': { completedTopics: ids, completedPractice: ids, confirmedDays: days },
        },
      } }));
    }, { ids: previous.map(l => l.id), days: previous.map(l => String(l.day)) });
    await page.goto('/courses/english-foundations/plan');
    await expect(page.locator('.day-card')).toHaveCount(42);
    for (const lesson of course.lessons.filter(l => l.day >= start && l.day <= end)) {
      await page.goto(`/courses/english-foundations/home?day=${lesson.day}`);
      await expect(page.locator(`#${lesson.id} > header > h2`)).toHaveText(lesson.title.tg);
      await expect(page.locator('[data-lesson-section]')).toHaveCount(4);
    }
    const lesson = course.lessons[end - 1];
    await page.goto(`/courses/english-foundations/tests?day=${end}`); await page.locator('[data-strict-start]').click();
    const question = page.locator('.course-question').first();
    const wrong = (lesson.questions[0].correctIndex + 1) % 3;
    await question.getByRole('radio', { name: lesson.questions[0].options[wrong].tg, exact: true }).check();
    await question.getByRole('button', { name: 'Проверить', exact: true }).click();
    await expect(question.locator('.question-feedback')).toContainText(lesson.questions[0].hint.tg);
    await expect(question.locator('.question-feedback a')).toHaveAttribute('href', `/courses/english-foundations/home?day=${end}#${lesson.id}-section-${lesson.questions[0].relatedSection}`);
    const second = page.locator('.course-question').nth(1);
    await second.getByRole('radio', { name: lesson.questions[1].answer.tg, exact: true }).check();
    await second.getByRole('button', { name: 'Проверить', exact: true }).click();
    await expect(second.getByRole('status')).toHaveText('Верно');
    await page.goto(`/practice?course=english-foundations&day=${end}`);
    const answer = 'My independent written attempt: I selected the facts from the task, checked each question and revised one mistake. This is a draft and self-review. Oral practice has not been performed; no listener feedback is claimed.';
    await page.locator('.written-practice textarea').fill(answer);
    await page.reload();
    await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['english-foundations']);
    expect(progress.completedPractice).not.toContain(lesson.id);
    expect(progress.confirmedDays).not.toContain(String(end));
    if (end === 42) {
      const panel = page.locator('.written-rubric-review');
      await expect(panel.locator('fieldset')).toHaveCount(3);
      for (const field of await panel.locator('fieldset').all()) await field.getByRole('radio').nth(1).check();
      await panel.getByRole('textbox').fill('The draft has accurate facts, but I still need to perform the oral role-play. This is my self-review only.');
      await panel.getByRole('button', { name: 'Сохранить Self Reviewed и продолжить' }).click();
      await expect(panel.getByRole('status')).toContainText('Self Reviewed');
      await page.reload();
      await expect(panel.getByRole('status')).toContainText('Self Reviewed');
      const review = await page.evaluate(() => JSON.parse(JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['english-foundations'].drafts['written-review-v1:english-foundations-day-42']));
      expect(review.method).toBe('Self Reviewed');
      expect(review.verified).toBeUndefined();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
