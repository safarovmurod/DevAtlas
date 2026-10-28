// @vitest-environment node
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { expect, it } from 'vitest';
import { loadCourseContent } from '@/lib/courses/content';
import { courseMonthPlan } from '@/lib/courses/plan';

import {findPython} from '../scripts/lib/python-runtime.mjs';
const python=findPython();

it('Backend foundations and the mobile introduction have actual sequential days with explicit runtime instructions', async () => {
  for (const id of ['backend', 'mobile'] as const) {
    const content = await loadCourseContent(id);
    const plan = courseMonthPlan(content.lessons);
    expect(plan.map(day => day.day)).toEqual(Array.from({length:id==='backend'?44:37},(_,i)=>i+1));
    expect(plan[0].lesson.prerequisiteDays).toEqual([]);
    expect(plan[1].lesson.prerequisiteDays).toEqual([1]);
    for (const lesson of content.lessons) {
      expect(lesson.sections.some(section => !!section.code?.trim())).toBe(true);
      expect(lesson.questions.length).toBeGreaterThan(0);
      expect(lesson.practice?.solution.trim()).toBeTruthy();
      for (const language of ['ru', 'tg', 'en'] as const) {
        expect(lesson.title[language]?.trim()).toBeTruthy();
        expect(lesson.practice?.task[language]?.trim()).toBeTruthy();
      }
    }
  }
});

it('python publishes a full thirty-day schedule from zero to a final project', async () => {
  const content = await loadCourseContent('python');
  const plan = courseMonthPlan(content.lessons);
  expect(plan.map(day => day.day)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
  expect(content.lessons).toHaveLength(30);
});

it.skipIf(!python)('every published Python example with documented output executes and matches it exactly', async () => {
  const content = await loadCourseContent('python');
  let verified = 0;
  for (const lesson of content.lessons) {
    const section = lesson.sections.find(item => item.output?.en !== undefined);
    if (!section) continue;
    const result = spawnSync(python!.command, [...python!.prefixArgs, '-c', lesson.practice!.solution], { encoding: 'utf8', timeout: 15000 });
    expect(result.error, `${lesson.id}: ${result.error?.message}`).toBeUndefined();
    expect(result.status, `${lesson.id}: ${result.stderr}`).toBe(0);
    // Windows Python text-mode emits CRLF; course JSON stores LF like a Linux CI.
    expect(result.stdout.trim().replace(/\r\n/g, '\n'), lesson.id).toBe(section.output!.en);
    verified++;
  }
  expect(verified).toBeGreaterThanOrEqual(27);
}, 120000);

it('backend validation rejects invalid types and boundaries while allowing equivalent valid inputs', async () => {
  const content = await loadCourseContent('backend');
  const code = content.lessons[1].practice!.solution + `
for (const [price, quantity] of [['12', 3], [NaN, 3], [Infinity, 3], [12, 1.5], [-1, 3]]) {
  let rejected = false;
  try { calculateTotal(price, quantity); } catch (error) { rejected = error instanceof TypeError; }
  if (!rejected) throw new Error('Invalid input accepted');
}
if (calculateTotal(7, 2) !== 14) throw new Error('Wrong result');
console.log('Checks passed');
`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', timeout: 3000 });
  expect(result.error).toBeUndefined();
  expect(result.status).toBe(0);
  expect(result.stderr).toBe('');
  expect(result.stdout.trim()).toBe('Checks passed');
});

it('published HTTP example responds with real JSON and not-found status', async () => {
  const content = await loadCourseContent('backend');
  const code = content.lessons[0].practice!.solution
    .replace("server.listen(3001, '127.0.0.1');", "server.listen(0, '127.0.0.1', () => console.log(server.address().port));");
  const server = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: ['ignore', 'pipe', 'pipe'] });
  const timeout = setTimeout(() => server.kill(), 5000);
  try {
    const [chunk] = await once(server.stdout, 'data');
    const port = Number(String(chunk).trim());
    expect(port).toBeGreaterThan(0);
    const healthy = await fetch(`http://127.0.0.1:${port}/health`);
    expect(healthy.status).toBe(200);
    expect(healthy.headers.get('content-type')).toContain('application/json');
    expect(await healthy.json()).toEqual({ status: 'ok' });
    const missing = await fetch(`http://127.0.0.1:${port}/missing`);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ error: 'Not found' });
    const wrongMethod = await fetch(`http://127.0.0.1:${port}/health`, { method: 'POST' });
    expect(wrongMethod.status).toBe(404);
  } finally {
    clearTimeout(timeout);
    server.kill();
  }
});
