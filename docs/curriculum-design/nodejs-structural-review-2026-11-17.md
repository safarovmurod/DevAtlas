# nodejs course structural review — 2026-11-17

Owner-authoring session for `src/content/courses/nodejs.json` (branch `main`), driven by
`docs/audits/continuation-quality-2026-11-17.json` (courseId `nodejs`). Only the course JSON and
this review file were touched. No commit, no push. `tests/programming-intros.test.ts` was not modified.

## Audit findings addressed

| Audit field | Before | After |
|---|---|---|
| daysWithFewerThan4Sections | [2, 7, 8, 10, 18, 20, 23, 25, 26] | [] (30 × 4 sections) |
| daysWithFewerThan3Questions | [1..30] | [] (30 × 3 questions) |
| daysWithMissingLinkedHints | 30 days, 53 question IDs | [] (90/90 questions have hint + relatedSection) |
| dominantCorrectPositionPercent | 58% (index 1: 35/60) | 41% (index 1: 37/90) — below the 45% heuristic flag |
| daysWithPracticeSolutionInTheoryCandidates | 28 | 0 edited — classified as trust-example, see below |
| copyingTaskCandidates / duplicatePracticeSolutionCandidates / equalBodyCandidates / missingTranslations | [] | [] (unchanged) |

## What was added

### 1. Fourth section on the nine 3-section days (no code, no output — only title/body)

- Days 7, 8, 10, 18, 20, 23, 25, 26: a "Глубже" section inserted **before** the existing
  "Частые ошибки и самостоятельная работа" section (new index 2), per instruction.
- Day 2 has no errors section (its third section is "Среда выполнения"), so its "Глубже"
  section is **appended** at the end (index 3).

Each new section carries an edge/boundary case and explicit links to neighbouring days:
day 2 → assert precision + days 5/10/24; day 7 → file size, empty file, UTF-8/binary + days 9/22;
day 8 → write modes, `\n` in appends + days 7/9; day 10 → async stack frames, timer callback
exceptions + days 2/19; day 18 → '/' → index.html branch, unknown content-type + days 15/22/25/26;
day 20 → env values are strings, `??` vs `||` with empty strings + days 6/28;
day 23 → exit codes in automation chains, quoted arguments + days 5/6/10/24;
day 25 → facade boundary (inner files never import past the facade) + days 3/4/23/26;
day 26 → combined trust-boundary filters, title validation, full-config logging + days 15/18/20/29/30.
RU body lengths are 250–700 (validated programmatically); tg and en are independent translations (tg ≠ ru).

### 2. Third question on all 30 days

- IDs follow the existing pattern: `nodejs-day-NN-q3` (day 1: `nodejs-day-01-q3`).
- Exactly 3 options; one realistic beginner distractor; `answer` equals `options[correctIndex]`.
- Each new question's `correctIndex` differs from the two existing indexes of the same day
  (this also lowered the dominant position 58% → 41%).
- Topics are the same day's material: argv indices (d6), assert failure behaviour (d2),
  require cache (d3), export-name mismatch (d4), npm install without package.json (d5),
  extname with double extension (d9), binary read as utf8 (d7), unlinkSync ENOENT (d8),
  unhandled timer exception (d10), forgotten return after callback(err) (d11),
  unhandled rejection (d12), promise-callback ordering (d13), emit return value (d14),
  request.url with query string (d15), JSON.parse('undefined') (d16), empty-but-present form field (d17),
  blocked path traversal (d18), server-side error logging (d19), env value type (d20),
  live timer keeps the event loop alive (d21), write() backpressure (d22),
  missing CLI argument (d23), node --test failure exit code (d24), facade rename safety (d25),
  error text disclosure (d26), single-thread blocking (d27), hosting-provided PORT (d28),
  GET /todos/99 → 404 (d29), PATCH missing id → 404 (d30). Days 29/30 answers match the actual
  example code (`404 { error: 'not found' }`), day 23 matches the example branch (`add 2` → error, exit 1).

### 3. Hints

All 53 previously hintless questions (plus the 30 new questions = 83 authored this session;
7 questions already had hints) now have `hint` in RU/TG/EN and a `relatedSection` index that is
valid after the section insertions (errors sections on insert days are index 3). Hints guide
without stating the answer; existing hints and relatedSections were left untouched.

## Overlap candidates: 28 days checked — all trust-example

The audit heuristic joins `section.code + section.body.ru` and flags days where >60% of
substantive solution lines appear there. Recomputed per day, separating code from prose:

- **0 solution lines appear in any section prose** (checked ru/tg/en bodies, threshold 12 chars).
- All matches come solely from `section.code` — practice solutions extend the day's worked
  example (days 1 and 2 have solution === example code exactly).
- Classification: **trust-example** for all 28 days. Recorded, not edited — no prose was changed.

## Source verification (Node.js docs, fetched 2026-11-17)

| URL | Confirmed for authoring |
|---|---|
| https://nodejs.org/api/events.html | emit returns `false` when the event had no listeners; `'error'` events throw without listeners; `once` removes the listener after one call; >10 listeners warning |
| https://nodejs.org/api/fs.html | readFile without encoding returns a Buffer; synchronous APIs block the event loop; `writeFile` "replacing the file if it already exists"; `appendFile` appends; ENOENT used as missing-file code (definition by usage) |
| https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick | `setImmediate` runs once the current poll phase completes; `setTimeout` runs "after a minimum threshold in ms"; timer threshold is "may be executed", not exact time |
| https://nodejs.org/api/stream.html | `write()` returns `false` when the buffer reaches `highWaterMark`; "do not write more chunks until the 'drain' event is emitted"; `pipeline` returns a Promise that "Fulfills when the pipeline is complete" |
| https://nodejs.org/api/process.html | `process.exit()` "terminate the process synchronously … even if there are still asynchronous operations pending"; `process.exitCode` for graceful exit; `process.argv` element layout (execPath, script path, then user arguments) |
| https://nodejs.org/api/buffer.html | Buffer = "fixed-length sequence of bytes"; subclass of Uint8Array; `Buffer.alloc/from` variants |
| https://nodejs.org/api/http.html | `server.keepAliveTimeout` definition (ms of inactivity after the last response before socket destruction); `message.method` / `message.url` ("Request URL string … only the URL present in the actual HTTP request"); `response.writeHead`/`statusCode` |
| https://nodejs.org/api/path.html | `path.resolve` "processed from right to left … current working directory" fallback; `path.join` concatenates and normalizes without making absolute; `path.extname` from the last `.` of the last portion |

Facts not on these pages (unhandled-rejection default behaviour, npm install walking up to a
parent package.json / creating an empty one) were worded conservatively and/or mirror the
course's own prose and example code.

## Verification performed

1. `npx vitest run tests/programming-intros.test.ts` — **5 passed / 7 skipped / 0 failed**;
   "Node course: every executable day runs and matches its recorded output" stayed green
   (30/30 executable days still run; new sections carry no code/output so the first
   output-bearing section is unchanged).
2. `npx tsc --noEmit` — exit 0. `npm run lint` — clean.
3. Structural script: 30 days × 4 sections × 3 questions; every question has 3 options,
   hint (3 locales), relatedSection in range, answer === options[correctIndex];
   per-day correctIndexes distinct; new sections have no code/output; RU bodies 250–700;
   tg ≠ ru everywhere in new content; 0 hintless questions remain.
4. Diff audit against `HEAD`: all pre-existing lesson scalars (id, day, prerequisites, title,
   summary, level, sourceIds, interview, practice), all existing section text, all existing
   question cores (id, question, answer, options, correctIndex) and existing hints/relatedSections
   are byte-identical; only authorized additions present.
5. Day 29/30/23 question answers were cross-checked against the actual example code before writing.

## Remaining work / notes

- `longestCorrectOptionRuPercentIncludingTies` is 69% (was 67%) — heuristic only; the
  instruction forbids touching existing options, and new questions follow natural phrasing.
  Recorded for the next manual review pass.
- Execution facts beyond the recorded outputs (device/account operations, real deployments,
  independently assessed mastery) are not claimed by this review; Self Reviewed limits stand.
- The working tree also contains other courses' in-progress edits (csharp, java, php, ruby, rust,
  sql, backend-pro) — not mine, untouched.
