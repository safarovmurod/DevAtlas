import { expect, test } from '@playwright/test';
import course from '../src/content/courses/personal-productivity.json';

test('returning learner can read the new productivity module and save a restart plan', async ({ page }) => {
  test.setTimeout(90000);
  const previous = course.lessons.filter(lesson => lesson.day < 18);
  await page.addInitScript(({ ids, days }) => {
    if (window.self !== window.top) return;
    const key = 'react-mentor-learning-v2';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      version: 2,
      state: { language: 'ru', contentLanguage: 'tg', courses: {
        'personal-productivity': { completedTopics: ids, completedPractice: ids, confirmedDays: days },
      } },
    }));
  }, { ids: previous.map(lesson => lesson.id), days: previous.map(lesson => String(lesson.day)) });

  await page.goto('/courses/personal-productivity/plan');
  await expect(page.locator('.day-card')).toHaveCount(18);
  for (const lesson of course.lessons.filter(lesson => lesson.day >= 15)) {
    await page.goto(`/courses/personal-productivity/home?day=${lesson.day}`);
    await expect(page.locator('.course-lesson h2')).toHaveText(lesson.title.tg);
    await expect(page.locator('.day-explanation')).toHaveCount(4);
  }
  const lesson = course.lessons.find(lesson => lesson.day === 18)!;
  await page.goto('/courses/personal-productivity/tests?day=18');
  const question = page.locator('.course-question').first();
  await question.getByRole('radio', { name: lesson.questions[0].options[lesson.questions[0].correctIndex].tg, exact: true }).check();
  await question.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(question.getByRole('status')).toHaveText('Верно');

  await page.goto('/practice?course=personal-productivity&day=18');
  const answer = 'Се истилоҳ тайёр аст. Барои ду истилоҳи нав 8 дақиқа, танаффус 2 ва захира 2: ҷамъ 12. Агар 6 дақиқа монад, як истилоҳро месанҷам ва муҳлати қадами боқимондаро аниқ мекунам.';
  await page.locator('.written-practice textarea').fill(answer);
  await page.reload();
  await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
  await expect(question).toHaveCount(0);
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['personal-productivity']);
  expect(progress.confirmedDays).not.toContain('18');
  expect(progress.completedPractice).not.toContain('personal-productivity-day-18');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
