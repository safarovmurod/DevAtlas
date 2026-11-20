import { expect, test } from '@playwright/test';
import course from '../src/content/courses/content-creation.json';
import { courseContentSchema } from '../src/lib/courses/schema';
import { dayExamInterview, dayExamQuiz } from '../src/lib/courses/strict-attempt';
import { expectGuestPracticeGate, productionPracticeGate } from './starter-course-checks';

const parsedCourse = courseContentSchema.parse(course);

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
    await expect(page.locator(`#${lesson.id} > header > h2`)).toHaveText(lesson.title.tg);
    await expect(page.locator('[data-lesson-section]')).toHaveCount(4);
  }
  const lesson = parsedCourse.lessons.find(item => item.day === endDay)!;

  await page.goto(`/practice?course=content-creation&day=${endDay}`);
  if (productionPracticeGate) {
    await expectGuestPracticeGate(page, 'content-creation');
    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['content-creation']);
    expect(progress.confirmedDays).not.toContain(String(endDay));
    expect(progress.completedPractice).not.toContain(lesson.id);
  } else {
    const answer = 'Бриф: ба навкор шарҳи истилоҳро фаҳмондан. Матн таъриф, мисол ва вазифаи мустақил дорад. Эълон ҳамон ваъдаро нигоҳ медорад. Манбаъ ва ҳуқуқ ҳоло санҷиш мехоҳанд. Ин бастаи маҳаллӣ ва Self Reviewed аст; хонанда ҳоло санҷида нашуд. Нусхаи дигар қадами аввалро аниқ мекунад.';
    await page.locator('.written-practice textarea').fill(answer);
    await page.reload();
    await expect(page.locator('.written-practice textarea')).toHaveValue(answer);
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
  }

  await page.goto(`/courses/content-creation/home?day=${endDay}`);
  const article = page.locator(`#${lesson.id}`);
  await article.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
  await article.getByRole('link', { name: 'Ответы и интервью', exact: true }).click();
  const exam = page.getByRole('region', { name: 'Экзамен: тест и интервью', exact: true });
  await exam.getByRole('button', { name: 'Начать', exact: true }).click();
  const quiz = dayExamQuiz(lesson, endDay);
  const interview = dayExamInterview(lesson, endDay);
  const questions = exam.locator('.course-question');
  const [first, second] = quiz;
  const wrong = (first.correctIndex + 1) % first.options.length;
  await questions.first().getByRole('radio', { name: first.options[wrong].tg!, exact: true }).check();
  await questions.nth(1).getByRole('radio', { name: second.options[second.correctIndex].tg!, exact: true }).check();
  if (interview) await exam.getByRole('textbox').fill(interview.answer.tg ?? interview.answer.ru);
  await exam.getByRole('button', { name: 'Отправить ответы', exact: true }).click();
  const result = page.getByRole('region', { name: 'Разбор результата', exact: true });
  await expect(result).toContainText(first.hint!.tg!);
  await expect(result.locator(`a[href="/courses/content-creation/home?day=30#${lesson.id}-section-${first.relatedSection}"]`).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
