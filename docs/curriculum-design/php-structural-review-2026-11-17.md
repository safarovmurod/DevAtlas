# PHP course — structural review and completion, 2026-11-17

Course: `php` (src/content/courses/php.json), 30 published days, starter tier.
Trigger: docs/audits/continuation-quality-2026-11-17.json, entry `courseId: "php"`.
Scope of this change: ONLY src/content/courses/php.json and this review file. Nothing was committed or pushed.

## What the audit observed (before)

- 2 days with fewer than 4 sections: days 1 and 2 (3 sections each).
- 30 days with fewer than 3 questions (all days had exactly 2).
- 30 days with missing linked hints: all 60 existing questions had neither `hint` nor `relatedSection`.
- `daysWithPracticeSolutionInTheoryCandidates`: 27 days flagged.
- Heuristics (noted, not changed): dominant correct position ~58% (index 0 on 35 of 60 existing answers); longest-RU-correct-option ~60%. Existing options and option order were NOT touched, per instructions.

## What was changed

### 1. Sections (days 1–2)

Days 1 and 2 had no «Типичные ошибки» section, so per the agreed rule the one missing section was appended at the end as a «Глубже» section:

- Day 1: «Глубже: регистр имён и вычисление в echo» (RU 635 chars; TG/EN own text, tg≠ru).
- Day 2: «Глубже: что возвращает функция без return» (RU 596 chars; TG/EN own text, tg≠ru).

All other 28 days already had 4 sections and were not modified.

### 2. Third question per day (30 new questions)

Ids follow the existing pattern: `php-day-NN-q3` (days 1–2 previously used `-q` / `-q2`, so `-q3` continues that numbering; days 3+ used `-q1`/`-q2`). Each new question has 3 options, a beginner-realistic distractor set, a hint that does not state the answer, a correct `relatedSection`, and `answer === options[correctIndex]`. Topics are the day's own topic:

| Day | Topic of q3 | correctIndex |
|---|---|---|
| 1 | `$name` vs `$Name` — case-sensitive variable names | 2 |
| 2 | function without `return` returns `null` | 2 |
| 3 | `gettype('42')` → `string` | 1 |
| 4 | string concatenation operator `.` | 2 |
| 5 | `round(2.5)` → 3 (half away from zero) | 2 |
| 6 | `'PHP'` is truthy, `'0'`/`''` falsy | 2 |
| 7 | `foreach ($arr as $key => $value)` syntax | 2 |
| 8 | append with `$nums[] = 5;` | 2 |
| 9 | `$user['name']` array key access | 2 |
| 10 | `rsort` sorts descending | 2 |
| 11 | missing required args → `ArgumentCountError` | 2 |
| 12 | `global $counter;` inside a function | 2 |
| 13 | `require` fatal vs `include` warning | 2 |
| 14 | `printf('%s: %d', 'cart', 3)` substitution | 2 |
| 15 | `$counts` structure: key=language, value=count | 2 |
| 16 | `$item->describe()` arrow call | 2 |
| 17 | private property needs a public getter | 1 |
| 18 | `parent::describe()` | 2 |
| 19 | multiple interfaces via comma after `implements` | 2 |
| 20 | `throw new Exception('...')` | 2 |
| 21 | `$a ?? $b` picks first non-null | 1 |
| 22 | `foreach ($catalog as $book) { $book->describe(); }` | 2 |
| 23 | `3 <=> 5` → -1 | 2 |
| 24 | `file_get_contents` reads whole file | 2 |
| 25 | invalid JSON → `json_decode` returns `null` | 2 |
| 26 | `$_POST` for POST form data | 1 |
| 27 | `addBook` returns a new array | 2 |
| 28 | `usort` second arg is a comparator callable | 2 |
| 29 | `count(array_filter([0,1,2,3]))` → 3 (0 is falsy) | 2 |
| 30 | `composer install` | 1 |

New-question correctIndex spread: 5× index 1, 25× index 2, 0× index 0 — chosen so the new indices differ from the existing pair on every day (from both when they differ, from the shared value when equal) and the overall balance improves. Final course balance 33/32/25 across 90 questions (dominant index 0 drops from ~58% to 36.7%). Existing `correctIndex` values untouched.

### 3. Hints + relatedSection for all 60 existing questions

Each existing question received `hint` (ru/tg/en, guide-not-answer, tg≠ru) and `relatedSection` pointing at the section that actually covers the fact (verified against section prose: e.g. day 25 invalid-JSON hint → section 2 «Типичные ошибки» where `json_last_error` is discussed; day 30 Composer hint → section 2 «Куда дальше»; day 18 protected/private → section 2). Pairing invariant of src/lib/courses/schema.ts (hint XOR relatedSection must not be broken; relatedSection < sections.length) holds for all 90 questions.

### 4. Overlap candidates (27 days) — verdict: trust-example, no rewrite

For each of the 27 flagged days I compared every substantive `practice.solution` line against all section prose. Every verbatim match is also present in a section `code` block (the «Разберите пример» code that the practice solution legitimately reuses/extends). The prose occurrences are:

- «Разберите пример» walkthrough prose quoting the exact line it explains (e.g. day 8 `$nums[] = 16;`, day 12 `static $counter = 0;`, day 16 `$item = new Product();`),
- «Типичные ошибки» naming the buggy line (day 7 `$n = $n - 1;`, day 10 `sort($nums);`),
- «Запустите и проверьте» boundary-case instructions naming the line to change (day 3 `$note = null;`, day 4 `$version = 8;`, day 21 `$maybe = null;`).

No full solution is handed out in prose; the overlap is the intended example-code reuse pattern of this imported course. Recorded as trust-example; no prose rewritten.

## Source verification (opened via WebFetch on 2026-11-17)

All facts used by new questions and new sections were confirmed against the PHP manual and Composer docs:

- https://www.php.net/manual/en/function.round.php — round(2.5) → float(3); default mode HalfAwayFromZero.
- https://www.php.net/manual/en/language.types.boolean.php — falsy list includes `""` and `"0"`; non-empty strings truthy.
- https://www.php.net/manual/en/control-structures.foreach.php — `foreach (...) as $key => $value` syntax.
- https://www.php.net/manual/en/function.gettype.php — `gettype('42')` → `string`; floats report `double`.
- https://www.php.net/manual/en/functions.returning-values.php — "If the return is omitted the value null will be returned."
- https://www.php.net/manual/en/function.rsort.php — sorts in place, values descending, returns true.
- https://www.php.net/manual/en/class.argumentcounterror.php — thrown when too few arguments are passed (since PHP 7.1).
- https://www.php.net/manual/en/language.variables.scope.php — `global $a, $b;` example.
- https://www.php.net/manual/en/function.require.php — require raises fatal Error on failure; include only E_WARNING.
- https://www.php.net/manual/en/function.sprintf.php — `%s`, `%d`, `%%` semantics.
- https://www.php.net/manual/en/language.oop5.visibility.php — "Members declared as private may only be accessed by the class that defines the member."
- https://www.php.net/manual/en/language.oop5.paamayim-nekudotayim.php — `parent::method()` for overridden methods.
- https://www.php.net/manual/en/language.oop5.interfaces.php — comma-separated `implements`, fatal error on missing method.
- https://www.php.net/manual/en/language.operators.comparison.php — `??` returns second operand when first is null; `1 <=> 2` → -1.
- https://www.php.net/manual/en/function.file-get-contents.php — returns false + E_WARNING when file not found.
- https://www.php.net/manual/en/function.json-decode.php — null on invalid JSON.
- https://www.php.net/manual/en/function.array-filter.php — removes falsy entries by default; keys preserved.
- https://www.php.net/manual/en/language.variables.basics.php — "The variable name is case-sensitive."
- https://www.php.net/manual/en/language.operators.string.php — `.` concatenation operator.
- https://www.php.net/manual/en/reserved.variables.post.php — `$_POST` filled from POST form data.
- https://www.php.net/manual/en/language.oop5.basic.php — `->` property/method access, `$this`.
- https://www.php.net/manual/en/control-structures.throw.php — `throw` keyword (searched after two guessed URLs 404'd: `language.exceptions.php` and `language.exceptions.extend.php` both returned 404; the working page is `control-structures.throw.php`).
- https://www.php.net/manual/en/function.usort.php — second parameter is a callable comparator.
- https://getcomposer.org/doc/03-cli.md — `composer install` reads composer.json and installs into vendor.

A local PHP interpreter is not installed on this machine (`php` not found), so the three new code-level outputs (round(2.5), 3 <=> 5, count(array_filter(...))) were verified against the manual pages above, not executed. programming-intros.test.ts already skips PHP runtime execution (`it.skip` for 'php' — "await an available local runtime"); this remains honest.

## Preserved (untouched)

- All lesson ids, day order, `prerequisiteDays`, titles, summaries, existing section titles/bodies/code/output.
- All 60 existing question ids, question/answer texts, options and option order, `correctIndex`.
- All practice blocks (tasks, hints, solutions, criteria), written days 26/30, interview blocks, sources, files.
- Catalog, schema, scripts, tests, other courses, audit/report files — not modified.

## Verification performed

- `npx vitest run tests/course-quality-guard.test.ts` — 9 passed.
- `npx vitest run tests/course-content.test.ts tests/general-course-content.test.ts tests/course-taxonomy.test.ts tests/course-day-plan.test.ts tests/programming-intros.test.ts` — 34 passed, 7 skipped (PHP runtime skip intentional).
- `npx vitest run tests/course-examples.test.ts tests/published-curriculum.test.ts tests/stage-coverage.test.ts tests/track-coverage.test.ts tests/course-audit.test.ts tests/introductory-tracks.test.ts` — 70 passed.
- `npx vitest run tests/hint-gate.test.tsx tests/course-practice-localization.test.tsx tests/locale-coverage.test.ts tests/learning-flow.test.ts` — 31 passed.
- `npx tsc --noEmit` — clean. `npm run lint` — clean.
- Own script checks: zod shape replication of src/lib/courses/schema.ts passes for the edited file; 30×(4 sections, 3 questions); every question has hint+relatedSection with valid index; hint tg≠ru; answer === options[correctIndex]; all section bodies ≥80 chars in all three languages; new-section RU bodies 635 and 596 (within 250–700); no `tg === ru` anywhere new; file keeps CRLF + 1-space-indent format (diff: 1497 insertions, 3 deletions — only the replaced context lines around the day-01/… question-array close).
- Full-suite `npx vitest run` was executed as a final sweep (see handoff report for the result at run time; unrelated working-tree changes to csharp.json/java.json/tests/programming-intros.test.ts from a parallel task exist in this checkout).

## Remaining work (candidates, not observed omissions)

- `copyingTaskCandidates` (many days where the practice task repeats the «Запустите и проверьте» body) were not in the instruction scope and were left as-is.
- Heuristic flags (option-length/position patterns) remain heuristic; existing options were not to be modified.
- The 14-day continuation programs and other priority-queue courses remain per docs/audits/continuation-quality-2026-11-17.md.

## Follow-up repairs for days 2, 4, 13 and 22

- **Day 2, section index 3 and q3.** The function `noResult()` reaches the end without declaring a return type and yields `null`. The example's `total(...): int` raises `TypeError` if its multiplication return is removed. The quiz now specifies the untyped case. [Returning values](https://www.php.net/manual/en/functions.returning-values.php), [type declarations](https://www.php.net/manual/en/language.types.declarations.php).
- **Day 4, q2 hint.** `strlen` measures bytes. Each letter of the ASCII word `code` uses one byte. The hint points to the section explaining this distinction. [PHP strlen](https://www.php.net/manual/en/function.strlen.php).
- **Day 13, q3.** The scenario now moves the successful `require` after the first `greet()` call. The actual helper defines `greet`, so the earlier call fails with an undefined-function error. [PHP include](https://www.php.net/manual/en/function.include.php), [PHP require](https://www.php.net/manual/en/function.require.php).
- **Day 22, q3.** The new scenario changes the `year` property on each existing `Book` before the lesson computes the mean. The new values 2021, 2019 and 2023 give `2021.0`. The example's `Book` has a public `year` property. [PHP objects and references](https://www.php.net/manual/en/language.oop5.references.php).

Readback confirmed that edits are limited to the day 2 section and four quiz entries across RU/TG/EN. Prior quiz IDs and correct indices match the input. `npx vitest run tests/course-quality-guard.test.ts tests/general-course-content.test.ts` passed all 16 tests in 2 files. PHP 8 execution remains pending because the interpreter was unavailable in this shell. Independent editorial review is pending.

Root later obtained the official portable PHP 8.4.27 CLI and verified its release checksum. It ran all 26 code practice references in isolated temporary folders and matched all recorded outputs. The temporary day 13 fixture included `helpers.php`.

Root also ran the four repaired boundary cases. The untyped and typed-return cases produced `NULL` and `TypeError`. `strlen` reported 4 bytes for both the ASCII word `code` and a two-letter Cyrillic string. Calling `greet` before the helper was required failed with an undefined-function error. Updating each book's year shifted the mean to `2021.0`. Root accepted the four repairs after all-locale review and these runtime checks. Full independent-practice and translation review remains tracked separately.
