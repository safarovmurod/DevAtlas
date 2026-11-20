import { expect, test } from '@playwright/test';
import course from '../src/content/courses/personal-productivity.json';
import { courseContentSchema } from '../src/lib/courses/schema';
import { dayExamInterview, dayExamQuiz, isInterviewDay } from '../src/lib/courses/strict-attempt';
import { expectGuestPracticeGate, productionPracticeGate } from './starter-course-checks';

const parsedCourse = courseContentSchema.parse(course);

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
  const lesson = parsedCourse.lessons.find(item => item.day === endDay)!;

  await page.goto(`/practice?course=personal-productivity&day=${endDay}`);
  if (productionPracticeGate) {
    await expectGuestPracticeGate(page, 'personal-productivity');
  } else {
    const answer = endDay === 22 ? 'Ҳадаф ёддошти маҳфил аст. Душанбе 12 дақиқа ҷустуҷӯ, 3 танаффус ва 5 захира. Барои манбаи дастнорас ҳолат черновик мемонад. Ҷумъа ҷамъбаст мекунам. Ин худсанҷӣ аст.' : 'Се истилоҳ тайёр аст. Барои ду истилоҳи нав 8 дақиқа, танаффус 2 ва захира 2: ҷамъ 12. Агар 6 дақиқа монад, як истилоҳро месанҷам ва муҳлати қадами боқимондаро аниқ мекунам.';
    await page.locator('.written-practice textarea').fill(answer);
    await page.reload();
    await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
  }
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['personal-productivity']);
  expect(progress.confirmedDays).not.toContain(String(endDay));
  expect(progress.completedPractice).not.toContain(lesson.id);

  await page.goto(`/courses/personal-productivity/home?day=${endDay}`);
  const article = page.locator(`#${lesson.id}`);
  await article.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
  await article.getByRole('link', { name: 'Ответы и интервью', exact: true }).click();
  const checkpoint = isInterviewDay(endDay);
  const exam = page.getByRole('region', { name: checkpoint ? 'Экзамен: тест и интервью' : 'Проверка дня', exact: true });
  await exam.getByRole('button', { name: 'Начать', exact: true }).click();
  const quiz = dayExamQuiz(lesson, endDay);
  const interview = dayExamInterview(lesson, endDay);
  for (const [index, question] of quiz.entries()) {
    await exam.locator('.course-question').nth(index).getByRole('radio', { name: question.options[question.correctIndex].tg!, exact: true }).check();
  }
  if (interview) await exam.getByRole('textbox').fill(interview.answer.tg ?? interview.answer.ru);
  await exam.getByRole('button', { name: 'Отправить ответы', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Разбор результата', exact: true })).toContainText('100%');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
