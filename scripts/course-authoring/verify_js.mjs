// Runs every lesson's reference solution against its own auto-graded tests, like the browser runner.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
// Same pipeline as src/lib/grading/function-runner.ts: TypeScript → CommonJS, then module.exports lookup.
const ts = createRequire(import.meta.url)('typescript');
const transpile = code => ts.transpileModule(code, { fileName: 'solution.ts', compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const timers = { setTimeout, clearTimeout, Promise, URLSearchParams, URL, TextEncoder, TextDecoder, structuredClone };
const course = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const equal = (a, b) => {
  if (Object.is(a, b)) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const k = Object.keys(a).sort(), o = Object.keys(b).sort();
  return k.length === o.length && k.every((key, i) => key === o[i] && equal(a[key], b[key]));
};
let failures = 0, checked = 0;
for (const lesson of course.lessons) {
  const ex = lesson.practice?.execution;
  if (!ex) continue;
  if (ex.tests.length < 3 || ex.tests.length > 20) { failures++; console.log('TEST COUNT', lesson.id, ex.tests.length); }
  for (const [label, code] of [['solution', lesson.practice.solution], ['starter', ex.starter]]) {
    let fn;
    try { const module = { exports: {} };
      fn = vm.runInNewContext(`${transpile(code)}\n;typeof ${ex.functionName}==='function'?${ex.functionName}:module.exports[${JSON.stringify(ex.functionName)}]`, { console: { log() {} }, module, exports: module.exports, ...timers }, { timeout: 500 }); }
    catch (error) { if (label === 'solution') { failures++; console.log('COMPILE', lesson.id, error.message); } continue; }
    if (typeof fn !== 'function') { if (label === 'solution') { failures++; console.log('NOFN', lesson.id); } continue; }
    let passed = 0;
    for (const test of ex.tests) {
      const args = structuredClone(test.args), before = JSON.stringify(args);
      let actual, ok = false;
      try { actual = await fn(...args); ok = JSON.stringify(args) === before && equal(actual, test.expected); } catch { ok = false; }
      if (ok) passed++;
      else if (label === 'solution') { failures++; console.log('FAIL', lesson.id, JSON.stringify(test.args), 'expected', JSON.stringify(test.expected), 'got', JSON.stringify(actual)); }
    }
    if (label === 'solution') checked++;
    if (label === 'starter' && passed === ex.tests.length) { failures++; console.log('STARTER PASSES ALL', lesson.id); }
  }
}
console.log(`checked ${checked} executable lessons, ${failures} problems`);
process.exit(failures ? 1 : 0);
