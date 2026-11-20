import { expect, test, type Page } from '@playwright/test';
import { courseContentSchema } from '../src/lib/courses/schema';
import { dayExamInterview, dayExamQuiz, isInterviewDay } from '../src/lib/courses/strict-attempt';

// The base config runs an unconfigured production server in CI and an explicitly
// offline development server locally. Only the latter opens practice without accounts.
export const productionPracticeGate = process.env.PLAYWRIGHT_PROD_SERVER === 'true';

export async function expectGuestPracticeGate(page: Page, courseId: string) {
  const lock = page.locator('[data-practice-locked]');
  await expect(lock).toBeVisible();
  await expect(lock.locator('a[href="/plans"]')).toBeVisible();
  await expect(page.locator('.monaco-editor, .written-practice, .function-practice')).toHaveCount(0);
  const response = await page.request.get(`/api/courses/${courseId}?practice=1`);
  expect([401, 503]).toContain(response.status());
  const body = await response.json();
  expect(['authentication_required', 'service_unavailable']).toContain(body.error);
  expect(body).not.toHaveProperty('lessons');
}

export function checkStarterModules(rawCourse: unknown) {
  const course = courseContentSchema.parse(rawCourse);
  for (const [endDay, locale] of [[16, 'ru'], [23, 'tg'], [30, 'en']] as const) {
    if (!course.lessons.some(lesson => lesson.day === endDay)) continue;
    test(`${course.courseId} days ${endDay - 6}–${endDay}: ${locale} lessons, feedback and ${productionPracticeGate ? 'guest practice gate' : 'offline independent work'}`, async ({ page }, testInfo) => {
      test.setTimeout(120000);
      const previous = course.lessons.filter(lesson => lesson.day! < endDay);
      await page.addInitScript(({ courseId, ids, days, locale }) => {
        if (self !== top) return;
        sessionStorage.setItem('react-mentor-guest', 'true');
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
      await page.goto(`/practice?course=${course.courseId}&day=${endDay}`);
      if (productionPracticeGate) {
        await expectGuestPracticeGate(page, course.courseId);
        await page.reload();
        await expectGuestPracticeGate(page, course.courseId);
        const progress = await page.evaluate((id) => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses[id], course.courseId);
        expect(progress.completedPractice).not.toContain(lesson.id);
        expect(progress.confirmedDays).not.toContain(String(endDay));
        expect(progress.drafts?.[lesson.id]).toBeUndefined();
      } else {
        // This branch exercises the documented offline editor, not a paid entitlement.
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
      }

      await page.goto(`/courses/${course.courseId}/home?day=${endDay}`);
      const article = page.locator(`#${lesson.id}`);
      await article.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
      await expect(article.getByRole('button', { name: 'Изучено', exact: true })).toBeDisabled();
      await article.getByRole('link', { name: 'Ответы и интервью', exact: true }).click();
      await expect(page).toHaveURL(`/courses/${course.courseId}/answers?day=${endDay}`);
      const checkpoint = isInterviewDay(endDay);
      const exam = page.getByRole('region', {
        name: checkpoint ? 'Экзамен: тест и интервью' : 'Проверка дня',
        exact: true,
      });
      await exam.getByRole('button', { name: 'Начать', exact: true }).click();
      const quiz = dayExamQuiz(lesson, endDay);
      const interview = dayExamInterview(lesson, endDay);
      const questions = exam.locator('.course-question');
      await expect(questions).toHaveCount(quiz.length);
      const [first, second] = quiz;
      const wrong = (first.correctIndex + 1) % first.options.length;
      await questions.first().getByRole('radio', { name: first.options[wrong][locale]!, exact: true }).check();
      await questions.nth(1).getByRole('radio', { name: second.options[second.correctIndex][locale]!, exact: true }).check();
      if (checkpoint) {
        await expect(exam.locator('header .badge')).toHaveText(/^\d+:\d{2}$/);
        expect(interview).toBeDefined();
      }
      if (interview) {
        await exam.getByRole('textbox').fill(interview.answer[locale] ?? interview.answer.ru);
      }
      const review = page.getByRole('region', { name: 'Разбор результата', exact: true });
      await expect(review).toHaveCount(0);
      await expect(exam.getByText(first.hint![locale]!, { exact: true })).toHaveCount(0);
      await exam.getByRole('button', { name: 'Отправить ответы', exact: true }).click();
      const totalAnswers = quiz.length + Number(Boolean(interview));
      const score = Math.round((100 * (1 + Number(Boolean(interview)))) / totalAnswers);
      await expect(review).toContainText(`${score}%`);
      await expect(review.getByText(first.hint![locale]!, { exact: true })).toBeVisible();
      const hintLink = `/courses/${course.courseId}/home?day=${endDay}#${lesson.id}-section-${first.relatedSection}`;
      await expect(review.locator(`a[href="${hintLink}"]`).first()).toBeVisible();
      const submitted = await page.evaluate(
        ({ courseId, lessonId }) => {
          const state = JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses[courseId];
          return { day: state.confirmedDays, answers: state.daySubmissions[lessonId].answers };
        },
        { courseId: course.courseId, lessonId: lesson.id },
      );
      expect(submitted.day).toContain(String(endDay));
      expect(submitted.answers).toContainEqual(expect.objectContaining({ id: first.id, correct: false }));
      expect(submitted.answers).toContainEqual(expect.objectContaining({ id: second.id, correct: true }));
      if (interview) {
        expect(submitted.answers).toContainEqual(expect.objectContaining({ id: interview.id, mode: 'interview', correct: true }));
      }
      await page.reload();
      await expect(review).toContainText(`${score}%`);
      await expect(page.locator('[data-strict-start]')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
