import { expect, test } from '@playwright/test';
import course from '../src/content/courses/personal-productivity.json';

for (const endDay of [18, 22]) test(`returning learner can study productivity days ${endDay - 3}–${endDay} and retain a written draft`, async ({ page }) => {
  test.setTimeout(90000);
  const previous = course.lessons.filter(lesson => lesson.day < endDay);
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
  await expect(page.locator('.day-card')).toHaveCount(22);
  for (const lesson of course.lessons.filter(lesson => lesson.day >= endDay - 3 && lesson.day <= endDay)) {
    await page.goto(`/courses/personal-productivity/home?day=${lesson.day}`);
    await expect(page.locator(`#${lesson.id} > header > h2`)).toHaveText(lesson.title.tg);
    await expect(page.locator('[data-lesson-section]')).toHaveCount(4);
  }
  const lesson = course.lessons.find(lesson => lesson.day === endDay)!;
  await page.goto(`/courses/personal-productivity/tests?day=${endDay}`); await page.locator('[data-strict-start]').click();
  const question = page.locator('.course-question').first();
  await question.getByRole('radio', { name: lesson.questions[0].options[lesson.questions[0].correctIndex].tg, exact: true }).check();
  await question.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(question.getByRole('status')).toHaveText('Верно');

  await page.goto(`/practice?course=personal-productivity&day=${endDay}`);
  const answer = endDay === 22 ? 'Ҳадаф ёддошти маҳфил аст. Душанбе 12 дақиқа ҷустуҷӯ, 3 танаффус ва 5 захира. Барои манбаи дастнорас ҳолат черновик мемонад. Ҷумъа ҷамъбаст мекунам. Ин худсанҷӣ аст.' : 'Се истилоҳ тайёр аст. Барои ду истилоҳи нав 8 дақиқа, танаффус 2 ва захира 2: ҷамъ 12. Агар 6 дақиқа монад, як истилоҳро месанҷам ва муҳлати қадами боқимондаро аниқ мекунам.';
  await page.locator('.written-practice textarea').fill(answer);
  await page.reload();
  await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['personal-productivity']);
  expect(progress.confirmedDays).not.toContain(String(endDay));
  expect(progress.completedPractice).not.toContain(lesson.id);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
