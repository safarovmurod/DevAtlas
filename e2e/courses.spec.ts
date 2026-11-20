import { expect, test } from '@playwright/test';
// Legacy regressions exercise accounts that already saved Tajik lesson text with
// Russian UI. Geo detection must not rewrite an existing learner's choice.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // addInitScript runs in sandboxed learner-preview iframes as well.
    // Never access their blocked storage or weaken iframe sandboxing.
    if (window.self !== window.top) return;
    if (!localStorage.getItem('react-mentor-learning-v2')) {
      localStorage.setItem('react-mentor-learning-v2', JSON.stringify({
        version: 2, state: { language: 'ru', contentLanguage: 'tg' },
      }));
    }
  });
});

import html from '../src/content/courses/html.json';
import css from '../src/content/courses/css.json';
import { COURSE_CATALOG } from '../src/content/courses/catalog';

test('course choice persists and retired Notes preserve existing isolated course data', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const note = { id: 'saved-html-note', title: 'Моя HTML заметка', content: 'Структура страницы' };
  await page.addInitScript(note => {
    if (self !== top) return;
    const key = 'react-mentor-learning-v2';
    const saved = JSON.parse(localStorage.getItem(key) || '{"version":2,"state":{}}');
    Object.assign(saved.state, { language: 'ru', contentLanguage: 'tg' });
    saved.state.courses ??= {};
    saved.state.courses.html ??= { notes: [note] };
    localStorage.setItem(key, JSON.stringify(saved));
  }, note);
  await page.goto('/home');
  await expect(page.getByRole('heading', { name: 'Навыки начинаются с практики.' })).toBeVisible();
  await expect(page.locator('.course-card')).toHaveCount(COURSE_CATALOG.length - 1);
  await page.locator('.category-card[data-category=programming]').click();
  await expect(page).toHaveURL('/courses/category/programming');
  await expect(page.locator('.course-card')).toHaveCount(COURSE_CATALOG.filter(course => course.id !== 'javascript-2' && course.category === 'programming').length);
  await page.locator('[data-course=html]').getByRole('button').click();
  await expect(page).toHaveURL('/courses/html/plan');
  await page.locator('.day-card-grid a.day-card').first().click();
  await expect(page).toHaveURL('/courses/html/home?day=1');
  await expect(page.locator('#html-day-01 > header > h2')).toContainText('саҳифаи аввал');
  await page.goto('/courses/category/programming');
  await expect(page.locator('.course-selected')).toHaveCount(1);
  await expect(page.locator('[data-course=html] button')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('[data-course=html]')).toHaveClass(/course-selected/);
  await page.screenshot({ path: testInfo.outputPath('courses.png') });
  await page.goto('/notes');
  await expect(page).toHaveURL('/progress');
  await expect(page.getByRole('button', { name: 'Новая заметка', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.html.notes)).toEqual([note]);
  await page.goto('/courses/category/programming');
  await page.locator('[data-course=javascript-1]').getByRole('button').click();
  await expect(page).toHaveURL('/courses/javascript-1/plan');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses['javascript-1']?.notes ?? [])).toEqual([]);
  await page.goto('/courses/category/programming');
  await page.locator('[data-course=html]').getByRole('button').click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.html.notes)).toEqual([note]);
  await page.goto('/courses/category/programming');
  await page.locator('[data-course=react]').getByRole('button').click();
  await expect(page).toHaveURL('/courses/react');
  await expect(page.getByRole('heading', { name: 'React · отдельный курс' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('HTML day 1 replaces old day 0 URLs and keeps guest practice protected on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/courses/html/plan?day=0');
  await expect(page).toHaveURL('/courses/html/plan?day=1');
  await expect(page.locator('.day-card')).toHaveCount(30);
  await expect(page.locator('a.day-card')).toHaveCount(1);
  await page.locator('a.day-card').first().click();
  await expect(page).toHaveURL('/courses/html/home?day=1');
  await expect(page.locator('#html-day-01 > header > h2')).toContainText('саҳифаи аввал');
  await expect(page.locator('[data-lesson-section]')).toHaveCount(html.lessons[0].sections.length);
  const tabs = page.getByRole('group', { name: 'Мой день', exact: true });
  await expect(tabs.getByRole('button', { name: 'Изучить', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await tabs.getByRole('button', { name: 'Практика', exact: true }).click();
  await expect(page.locator('[data-practice-locked]')).toBeVisible();
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#html-day-01 > header > h2')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.html.drafts['html-day-01'])).toBeUndefined();
  for (const width of [320, 360, 375, 430]) {
    await page.setViewportSize({ width, height: 740 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('returning learner preserves historical practice and the immutable daily result', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const lesson = html.lessons.find(item => item.id === 'html-day-15')!;
  const prior = html.lessons.filter(item => item.day !== undefined && item.day < 15).map(item => item.id);
  const draft = '<h1>Мой результат</h1><style>h1{color:purple}</style>';
  await page.addInitScript(({ ids, draft }) => {
    if (self !== top) return;
    const key = 'react-mentor-learning-v2';
    const saved = JSON.parse(localStorage.getItem(key) || '{"version":2,"state":{}}');
    Object.assign(saved.state, { language: 'ru', contentLanguage: 'tg' });
    saved.state.courses ??= {};
    saved.state.courses.html ??= { completedTopics: ids, completedPractice: ids, confirmedDays: Array.from({ length: 14 }, (_, index) => String(index + 1)), drafts: { 'html-day-15': draft } };
    localStorage.setItem(key, JSON.stringify(saved));
  }, { ids: prior, draft });
  await page.goto('/courses/html/plan');
  await expect(page.locator('.day-card')).toHaveCount(30);
  await page.getByRole('link', { name: /День 15.*Flexbox/ }).click();
  await expect(page).toHaveURL('/courses/html/home?day=15');
  await expect(page.locator('#html-day-15 > header > h2')).toHaveText('Flexbox: меню аз дарсҳои гузашта');
  await expect(page.locator('#html-day-15')).toContainText('День 3');
  await page.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
  await page.locator('#html-day-15').getByRole('link', { name: 'Ответы и интервью', exact: true }).click();
  await expect(page).toHaveURL('/courses/html/answers?day=15');
  const exam = page.getByRole('region', { name: 'Проверка дня', exact: true });
  await exam.getByRole('button', { name: 'Начать', exact: true }).click();
  await expect(exam.locator('.course-question')).toHaveCount(lesson.questions.length);
  await exam.locator('.course-question').first().getByRole('radio', { name: lesson.questions[0].options[lesson.questions[0].correctIndex].tg, exact: true }).check();
  await exam.getByRole('button', { name: 'Отправить ответы', exact: true }).click();
  const result = page.getByRole('region', { name: 'Разбор результата', exact: true });
  await expect(result).toContainText(String(Math.round(100 / lesson.questions.length)) + '%');
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.html);
  expect(before.daySubmissions[lesson.id].answers[0]).toMatchObject({ id: lesson.questions[0].id, correct: true });
  expect(before.completedPractice).toEqual(prior);
  expect(before.drafts[lesson.id]).toBe(draft);
  expect(before.awards['lesson:' + lesson.id]).toBe(5);
  expect(before.awards['practice:' + lesson.id]).toBeUndefined();
  await page.reload();
  await expect(result).toContainText(String(before.daySubmissions[lesson.id].score) + '%');
  await expect(page.locator('[data-strict-start]')).toHaveCount(0);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.html);
  expect(after.daySubmissions[lesson.id]).toEqual(before.daySubmissions[lesson.id]);
  expect(after.awards).toEqual(before.awards);
  expect(after.drafts[lesson.id]).toBe(draft);
  await page.goto('/courses/html/plan?day=15');
  await expect(page.locator('.day-card.is-done')).toHaveCount(15);
  await expect(page.locator('.day-card.is-next')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('plan.png') });
  expect(errors).toEqual([]);
});

test('CSS and legacy Sass references stay readable while Tutor access is protected', async ({ page }) => {
  await page.goto('/courses/category/programming');
  await expect(page.locator('[data-course=css]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Материалы Telegram-канала/ })).toHaveCount(0);
  expect((await page.request.get('/courses/materials')).status()).toBe(404);
  expect((await page.request.get('/state-api-lab')).status()).toBe(404);
  await page.goto('/courses/css/home#sass-variables-nesting');
  await expect(page.locator('#sass-variables-nesting > header > h2')).toHaveText('Sass: variable ва nesting');
  const tutor = await page.request.post('/api/tutor', { data: { action: 'ask', courseId: 'css', userText: 'Sass чист?', language: 'tg' } });
  expect(tutor.status()).toBe(503);
  expect(await tutor.json()).not.toHaveProperty('reply');
  await page.goto('/courses/css/home?day=1');
  await page.getByRole('button', { name: 'Прочитал и понял', exact: true }).click();
  await page.locator('#css-day-01').getByRole('link', { name: 'Ответы и интервью', exact: true }).click();
  const exam = page.getByRole('region', { name: 'Проверка дня', exact: true });
  await exam.getByRole('button', { name: 'Начать', exact: true }).click();
  const question = css.lessons[0].questions[0];
  await expect(exam.locator('.course-question').first().locator('legend')).toHaveText(question.question.tg);
  await exam.locator('.course-question').first().getByRole('radio', { name: question.options[question.correctIndex].tg, exact: true }).check();
  await exam.getByRole('button', { name: 'Отправить ответы', exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('react-mentor-learning-v2')!).state.courses.css.daySubmissions['css-day-01']);
  expect(saved.answers[0]).toMatchObject({ id: question.id, correct: true });
});

test('JavaScript stages retain 30 days and legacy practice links expose the real access lock', async ({ page }) => {
  await page.goto('/courses/category/programming');
  await expect(page.getByRole('heading', { name: 'JavaScript', exact: true })).toHaveCount(1);
  await page.locator('[data-course=javascript-1]').getByRole('button').click();
  await expect(page).toHaveURL('/courses/javascript-1/plan');
  await expect(page.locator('.day-card')).toHaveCount(30);
  await page.getByRole('link', { name: 'Месяц 2 · JS2 API и приложения', exact: true }).click();
  await expect(page).toHaveURL('/courses/javascript-2/plan');
  await expect(page.locator('.day-card')).toHaveCount(30);
  await page.locator('.day-card-grid a.day-card').first().click();
  await expect(page).toHaveURL('/courses/javascript-2/home?day=1');
  await expect(page.locator('main article h2').first()).toHaveText('Мизоҷ, сервер ва HTTP');
  await page.goto('/courses/javascript-1/practice?day=1');
  await expect(page).toHaveURL('/courses/javascript-1/home?day=1#day-practice');
  await expect(page.locator('[data-practice-locked]')).toBeVisible();
  await expect(page.locator('.function-practice, .solution')).toHaveCount(0);
  const response = await page.request.post('/api/tutor', { data: { action: 'ask', courseId: 'javascript-1', questionId: 'js-average-score-q1', userText: 'Миёнаи [80,90,100] чанд аст?', language: 'tg', isDeep: true } });
  expect(response.status()).toBe(503);
  expect(await response.json()).not.toHaveProperty('reply');
});

test('React day keeps optional practice locked and review aliases expose one working panel', async ({ page }) => {
  await page.addInitScript(() => {
    if (self !== top) return;
    const key = 'react-mentor-learning-v2';
    const saved = JSON.parse(localStorage.getItem(key) || '{"version":2,"state":{}}');
    Object.assign(saved.state, { selectedCourse: 'react', courseChosen: true, language: 'ru', contentLanguage: 'tg' });
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.goto('/plan/1');
  await page.getByRole('link', { name: /День 1 / }).click();
  await expect(page).toHaveURL('/home?month=1&day=1');
  await expect(page.locator('.react-day-content .course-lesson')).toHaveCount(1);
  await page.getByRole('group', { name: 'Мой день', exact: true }).getByRole('button', { name: 'Практика', exact: true }).click();
  await expect(page.locator('[data-practice-locked]')).toBeVisible();
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  await page.goto('/revision');
  await expect(page.getByRole('heading', { name: 'Повторение', exact: true, level: 1 })).toBeVisible();
  await expect(page.locator('.learning-review')).toContainText('Пока нет тем');
  await page.goto('/weak-topics');
  await expect(page).toHaveURL('/revision');
  await expect(page.locator('.learning-review')).toContainText('Пока нет тем');
  await expect(page.locator('.sidebar')).not.toContainText('Сложные темы');
  await expect(page.locator('.sidebar')).not.toContainText('Практика');
  await expect(page.locator('.sidebar').getByRole('link', { name: 'Прогресс', exact: true })).toHaveAttribute('href', '/progress');
  const labels = await page.locator('.sidebar nav .nav-item span').allTextContents();
  expect(labels.indexOf('Учебный план')).toBeLessThan(labels.indexOf('Мой день'));
});

test('React has two month plans and protects later lessons and the private library', async ({ page }) => {
  await page.goto('/courses/category/programming');
  await page.locator('[data-course=react]').getByRole('button').click();
  await expect(page).toHaveURL('/courses/react');
  await expect(page.locator('.react-month-option')).toHaveCount(2);
  await expect(page.getByText('Next.js — отдельный курс. Его темы больше не входят в план React.')).toBeVisible();
  await expect(page.locator('.state-practice-frame')).toHaveCount(0);
  await page.goto('/plan/2');
  await expect(page.locator('.day-card')).toHaveCount(30);
  await expect(page.locator('a.day-card')).toHaveCount(30);
  await page.goto('/home?month=2&day=1');
  await expect(page.getByRole('alert').filter({ hasText: 'Сначала изучите урок и отправьте тест за день 1.' })).toBeVisible();
  await expect(page.locator('.react-day-content .section-heading')).toHaveCount(0);
  await expect(page.locator('.react-day-content').getByRole('link', { name: 'День 1', exact: true })).toHaveAttribute('href', '/home?month=1&day=1');
  await page.goto('/practice?course=react');
  await expect(page.locator('[data-practice-locked]')).toBeVisible();
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  await page.goto('/practice-local-global.html');
  await expect(page).toHaveURL('/courses/react/practice-library?view=full');
  await expect(page.locator('[data-practice-locked]')).toBeVisible();
  await expect(page.locator('.state-practice-frame')).toHaveCount(0);
});

test('Next.js has its own course, 20 real published days, and old React month 3 links redirect',async({page})=>{
 await page.goto('/courses/category/programming');
 await page.locator('[data-course=nextjs]').getByRole('button').click();
 await expect(page).toHaveURL('/courses/nextjs/plan');
 await expect(page.getByRole('heading',{name:'Учебный план'})).toBeVisible();
 await expect(page.locator('.day-card-grid .day-card')).toHaveCount(20);
 await page.locator('.day-card-grid a.day-card').first().click();
 await expect(page).toHaveURL('/courses/nextjs/home?day=1');
 await expect(page.locator('main article h2').first()).toContainText('Next.js');
 await page.goto('/plan/3'); await expect(page).toHaveURL('/courses/nextjs/plan');
 await page.goto('/home?month=3&day=1'); await expect(page).toHaveURL('/courses/nextjs/home?day=1');
 await page.goto('/practice?month=3&day=1'); await expect(page).toHaveURL(/\/courses\/nextjs\/home\?day=1/);
});

test('React starts with day 1 and later day URLs require its original submission', async ({ page }) => {
  await page.addInitScript(() => {
    if (self !== top) return;
    const key = 'react-mentor-learning-v2';
    const saved = JSON.parse(localStorage.getItem(key) || '{"version":2,"state":{}}');
    Object.assign(saved.state, { selectedCourse: 'react', courseChosen: true, language: 'ru', contentLanguage: 'tg', activeMonth: 1 });
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.goto('/home');
  await expect(page.locator('.react-day-content .section-heading h2')).toContainText('День 1');
  await expect(page.locator('.react-day-content .course-lesson')).toHaveCount(1);
  await page.goto('/home?month=1&day=7');
  await expect(page.getByRole('alert').filter({ hasText: 'Сначала изучите урок и отправьте тест за день 1.' })).toBeVisible();
  await expect(page.locator('.react-day-content .section-heading')).toHaveCount(0);
  await page.goto('/plan/1');
  await expect(page.locator('a.day-card')).toHaveCount(30);
  await page.locator('a.day-card').first().click();
  await expect(page).toHaveURL('/home?month=1&day=1');
  await expect(page.locator('.react-day-content .section-heading h2')).toContainText('День 1');
});
