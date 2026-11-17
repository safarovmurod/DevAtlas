// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { courseContentSchema } from '@/lib/courses/schema';

const course = courseContentSchema.parse(JSON.parse(readFileSync(path.join(process.cwd(), 'src/content/courses/backend-pro.json'), 'utf8')));
const root = mkdtempSync(path.join(tmpdir(), 'devatlas-backend-facts-'));
afterAll(() => {
  const resolved = path.resolve(root);
  if (!resolved.startsWith(path.resolve(tmpdir()) + path.sep)) throw new Error('Fixture directory escaped temporary root');
  rmSync(resolved, { recursive: true, force: true });
});

function run(source: string) {
  // Only repository-authored local fixtures, never learner submissions.
  writeFileSync(path.join(root, 'lesson.mjs'), source);
  return spawnSync(process.execPath, ['lesson.mjs'], { cwd: root, encoding: 'utf8', timeout: 10000 });
}

function definitions(day: number, before: string) {
  const source = course.lessons[day - 1].sections[1].code!;
  const offset = source.indexOf(before);
  expect(offset, `day ${day} fixture boundary`).toBeGreaterThan(0);
  return source.slice(0, offset);
}

const configCheck = `
const invalid = { PORT: "PRIVATE_PORT", DATABASE_URL: "", NODE_ENV: "PRIVATE_MODE", RATE_LIMIT: "PRIVATE_RATE" };
let rejected;
try { loadConfig(invalid); } catch (error) { rejected = error; }
assert.equal(rejected.problems.length, 4);
for (const key of Object.keys(invalid)) assert.ok(rejected.problems.some(problem => problem.startsWith(key)));
for (const value of ["PRIVATE_PORT", "PRIVATE_MODE", "PRIVATE_RATE"]) {
  assert.ok(!rejected.message.includes(value), "configuration error leaked a received value");
  assert.ok(!JSON.stringify(rejected.problems).includes(value));
}
assert.throws(() => loadConfig({}), error => {
  assert.deepEqual(error.problems, ["PORT is required", "DATABASE_URL is required"]);
  return true;
});
assert.equal(loadConfig({ PORT: "3000", DATABASE_URL: "fixture" }).RATE_LIMIT, 100);
`;

const timeoutCheck = `
const scheduled = [];
globalThis.setTimeout = callback => {
  const entry = { callback, cleared: false };
  scheduled.push(entry);
  return entry;
};
globalThis.clearTimeout = entry => { entry.cleared = true; };

let finishBody;
const body = new Promise(resolve => { finishBody = resolve; });
const success = fetchWithTimeout(async signal => {
  const response = await Promise.resolve({ json: () => body });
  return await response.json();
}, 50);
await Promise.resolve();
assert.equal(scheduled[0].cleared, false, "deadline ended at headers before body completion");
finishBody({ users: 3 });
assert.deepEqual(await success, { users: 3 });
assert.equal(scheduled[0].cleared, true);

let bodyCancelled = false;
const pending = fetchWithTimeout(async signal => {
  const response = await Promise.resolve({ json: () => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => { bodyCancelled = true; reject(signal.reason); }, { once: true });
  }) });
  return await response.json();
}, 50);
await Promise.resolve();
await Promise.resolve();
assert.equal(scheduled[1].cleared, false);
const rejected = assert.rejects(pending, /timeout after 50ms/);
scheduled[1].callback();
await rejected;
assert.equal(bodyCancelled, true);
assert.equal(scheduled[1].cleared, true);
`;

const breakerCheck = `
const breaker = createBreaker({ failureThreshold: 1, resetAfterMs: 100 });
const fail = async () => { throw new Error("fixture outage"); };
await assert.rejects(breaker.call(fail, 0), /fixture outage/);
assert.equal(breaker.state, "open");
let calls = 0;
let finishProbe;
const probe = breaker.call(() => {
  calls += 1;
  return new Promise(resolve => { finishProbe = resolve; });
}, 100);
assert.equal(breaker.state, "half-open");
await assert.rejects(breaker.call(async () => { calls += 1; return "must not run"; }, 100), error => error.fastFail === true);
assert.equal(calls, 1, "a second operation entered while the half-open probe was pending");
finishProbe("recovered");
assert.equal(await probe, "recovered");
assert.equal(breaker.state, "closed");
assert.equal(await breaker.call(async () => "normal", 101), "normal");

await assert.rejects(breaker.call(fail, 200), /fixture outage/);
await assert.rejects(breaker.call(fail, 300), /fixture outage/);
assert.equal(breaker.state, "open");
await assert.rejects(breaker.call(async () => { calls += 1; }, 350), error => error.fastFail === true);
assert.equal(calls, 1);
`;

describe('Backend Pro scoped factual repairs', () => {
  it.each([8, 15, 20, 21, 23])('day %i examples and solutions retain their recorded output', day => {
    const lesson = course.lessons[day - 1];
    const example = lesson.sections[1];
    expect(lesson.practice!.solution).toBe(example.code);
    const result = run(example.code!);
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    for (const locale of ['ru', 'tg', 'en'] as const) expect(result.stdout.trim()).toBe(example.output![locale]);
  });

  it('issues independent opaque tokens for repeated sessions with the same stored password', () => {
    const source = course.lessons[7].sections[1].code!;
    const result = run(source + `
const anotherToken = createSessionToken();
assert.match(anotherToken, /^sess_[a-f0-9]{64}$/);
assert.notEqual(anotherToken, token);
assert.notEqual(anotherToken, "sess_" + stored.slice(-12));
`);
    expect(result.status, result.stderr).toBe(0);
  });

  const checks = [
    { day: 20, before: 'const good =', check: configCheck },
    { day: 21, before: 'const fastJob =', check: timeoutCheck },
    { day: 23, before: 'const breaker =', check: breakerCheck },
  ];
  it.each(checks)('day $day checks the corrected boundary independently of printed output', ({ day, before, check }) => {
    const result = run(definitions(day, before) + check);
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  });

  const defects = [
    { ...checks[0], from: '${key} must be an integer port 1-65535', to: '${key} must be an integer port 1-65535, received ${raw}' },
    { ...checks[1], from: 'return await operation(controller.signal);', to: 'return operation(controller.signal);' },
    { ...checks[2], from: 'if (state === "half-open") {', to: 'if (false) {' },
  ];
  it.each(defects)('day $day regression rejects the original class of defect', ({ day, before, check, from, to }) => {
    const source = definitions(day, before);
    expect(source).toContain(from);
    const result = run(source.replace(from, to) + check);
    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('AssertionError');
  });
});
