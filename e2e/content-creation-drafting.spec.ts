import { expect, test } from '@playwright/test';
import course from '../src/content/courses/content-creation.json';
import { courseContentSchema } from '../src/lib/courses/schema';
import { dayExamQuiz } from '../src/lib/courses/strict-attempt';
import { expectGuestPracticeGate, productionPracticeGate } from './starter-course-checks';

const parsedCourse = courseContentSchema.parse(course);

test('content author can study drafting, learn from a wrong choice and retain an edited paragraph', async ({ page }) => {
  const endDay = 13;
  test.setTimeout(90000);
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
  for (const lesson of course.lessons.filter(lesson => lesson.day >= endDay - 3 && lesson.day <= endDay)) {
    await page.goto(`/courses/content-creation/home?day=${lesson.day}`);
    await expect(page.locator(`#${lesson.id} > header > h2`)).toHaveText(lesson.title.tg);
    await expect(page.locator('[data-lesson-section]')).toHaveCount(4);
  }
  const lesson = parsedCourse.lessons.find(item => item.day === endDay)!;

  await page.goto(`/practice?course=content-creation&day=${endDay}`);
  if (productionPracticeGate) {
    await expectGuestPracticeGate(page, 'content-creation');
  } else {
    const answer = 'Талонро ба китобдор диҳед. Китобдор қайд мегузорад. Баъди қайд китобро гиред. Таърихи китобхона ба ин амал дахл надорад. Агар талон нест, қоидаро аз китобдор мепурсам ва бофтан намегирам.';
    await page.locator('.written-practice textarea').fill(answer);
    await page.reload();
    await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
  }
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['content-creation']);
  expect(progress.confirmedDays).not.toContain(String(endDay));
  expect(progress.completedPractice).not.toContain(lesson.id);

  await page.goto(`/courses/content-creation/home?day=${endDay}`);
  const article = page.locator(`#${lesson.id}`);
  await article.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
  await article.getByRole('link', { name: 'Ответы и интервью', exact: true }).click();
  const exam = page.getByRole('region', { name: 'Проверка дня', exact: true });
  await exam.getByRole('button', { name: 'Начать', exact: true }).click();
  const quiz = dayExamQuiz(lesson, endDay);
  const [first, second] = quiz;
  const wrong = (first.correctIndex + 1) % first.options.length;
  await exam.locator('.course-question').first().getByRole('radio', { name: first.options[wrong].tg!, exact: true }).check();
  await exam.locator('.course-question').nth(1).getByRole('radio', { name: second.options[second.correctIndex].tg!, exact: true }).check();
  await exam.getByRole('button', { name: 'Отправить ответы', exact: true }).click();
  const result = page.getByRole('region', { name: 'Разбор результата', exact: true });
  await expect(result).toContainText(first.hint!.tg!);
  await expect(result.locator(`a[href="/courses/content-creation/home?day=13#${lesson.id}-section-${first.relatedSection}"]`).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
