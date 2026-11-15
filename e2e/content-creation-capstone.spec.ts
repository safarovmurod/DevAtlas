import { expect, test } from '@playwright/test';
import course from '../src/content/courses/content-creation.json';

test('author can finish publication lessons and save an honest four-criterion capstone self-review', async ({ page }) => {
  const endDay = 30;
  test.setTimeout(120000);
  const previous = course.lessons.filter(lesson => lesson.day < endDay);
  await page.addInitScript(({ ids, days }) => {
    if (window.self !== window.top) return;
    const key = 'react-mentor-learning-v2';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      version: 2,
      state: { language: 'ru', contentLanguage: 'tg', courses: {
        'content-creation': { completedTopics: ids, completedPractice: ids, confirmedDays: days },
      } },
    }));
  }, { ids: previous.map(lesson => lesson.id), days: previous.map(lesson => String(lesson.day)) });

  await page.goto('/courses/content-creation/plan');
  await expect(page.locator('.day-card')).toHaveCount(30);
  for (const lesson of course.lessons.filter(lesson => lesson.day >= endDay - 6 && lesson.day <= endDay)) {
    await page.goto(`/courses/content-creation/home?day=${lesson.day}`);
    await expect(page.locator('.course-lesson h2')).toHaveText(lesson.title.tg);
    await expect(page.locator('.day-explanation')).toHaveCount(4);
  }
  const lesson = course.lessons.find(lesson => lesson.day === endDay)!;
  await page.goto(`/courses/content-creation/tests?day=${endDay}`);
  const question = page.locator('.course-question').first();
  await question.getByRole('radio', { name: lesson.questions[0].options[1].tg, exact: true }).check();
  await question.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(question.locator('.question-feedback')).toContainText(lesson.questions[0].hint.tg);
  await expect(question.locator('.question-feedback a')).toHaveAttribute('href', `/courses/content-creation/home?day=30#${lesson.id}-section-${lesson.questions[0].relatedSection}`);
  const second = page.locator('.course-question').nth(1);
  await second.getByRole('radio', { name: lesson.questions[1].options[lesson.questions[1].correctIndex].tg, exact: true }).check();
  await second.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(second.getByRole('status')).toHaveText('Верно');

  await page.goto(`/practice?course=content-creation&day=${endDay}`);
  const answer = 'Бриф: ба навкор шарҳи истилоҳро фаҳмондан. Матн таъриф, мисол ва вазифаи мустақил дорад. Эълон ҳамон ваъдаро нигоҳ медорад. Манбаъ ва ҳуқуқ ҳоло санҷиш мехоҳанд. Ин бастаи маҳаллӣ ва Self Reviewed аст; хонанда ҳоло санҷида нашуд. Нусхаи дигар қадами аввалро аниқ мекунад.';
  await page.locator('.written-practice textarea').fill(answer);
  await page.reload();
  await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
  await expect(question).toHaveCount(0);
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['content-creation']);
  expect(progress.confirmedDays).not.toContain(String(endDay));
  expect(progress.completedPractice).not.toContain(lesson.id);
  const panel = page.locator('.written-rubric-review');
  await expect(panel.locator('fieldset')).toHaveCount(4);
  for (const field of await panel.locator('fieldset').all()) await field.getByRole('radio').nth(1).check();
  await panel.getByRole('textbox').fill('Задача и пример названы, но источник и путь доступа ещё требуют проверки; высокий балл не заменяет её.');
  await panel.getByRole('button', { name: 'Сохранить Self Reviewed и продолжить' }).click();
  await expect(panel.getByRole('status')).toContainText('Self Reviewed');
  await page.reload();
  await expect(panel.getByRole('status')).toContainText('Self Reviewed');
  const review = await page.evaluate(() => JSON.parse(JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['content-creation'].drafts['written-review-v1:content-creation-day-30']));
  expect(review.method).toBe('Self Reviewed');
  expect(review.verified).toBeUndefined();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
