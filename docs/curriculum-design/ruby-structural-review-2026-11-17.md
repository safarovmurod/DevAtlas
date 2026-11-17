# Ruby — structural review 2026-11-17

Course: `ruby` (starter, 30 days, loader-based, RU/TG/EN).
Scope of this pass: `src/content/courses/ruby.json` only. No commit, no push.
Input: `docs/audits/continuation-quality-2026-11-17.json` entry `courseId: "ruby"`.

## What the audit observed (before this pass)

- 30 published days; all 30 days had 3 sections (< 4) and 2 questions (< 3).
- All 60 scheduled questions lacked linked hints (`hint` + `relatedSection`).
- 19 overlap candidates (`practiceSolutionInTheoryCandidate`): days 2, 5, 8, 9, 11, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 29.
- Heuristics (notes only, no edit basis): `correctPositionCounts` [42, 18, 0] → dominant position 70 %; longest-RU-option-is-correct 73 %. Existing options were not touched, so these historical patterns remain in the 60 original questions.

## What changed (ruby.json only)

1. **One new section per day (30 sections added).** All days had exactly 3 sections, so one was added each:
   - Days 3–25 and 27–29 (last section was «Частые ошибки»): the new deep-dive section is inserted at index 2, before the mistakes block; mistakes moves to index 3.
   - Days 1, 2 («Среда выполнения»), 26 («Почему это важно»), 30 («Куда дальше»): the new section is appended at index 3.
   - Each new section: `{title, body}` ru/tg/en; RU body 250–700 chars (verified 300–500); tg ≠ ru; specific content titles («Одинарные кавычки: где интерполяция не работает», «fetch против квадратных скобок…» etc.). Every new section contains an edge case (empty array, missing key, missing file, single quotes, branch order, infinite loop, empty catalog, …) and an explicit connection to earlier days.
   - Observed, not modified: existing section bodies run ~850–1100 RU chars, above the 250–700 band used for new sections. Existing text is untouched per the freeze.
2. **One third question per day (30 questions added).** IDs follow the existing pattern (`ruby-day-01-q3` … `ruby-day-30-q3`; days 1–2 use `-q`, `-q2`, so `-q3` continues them). Each has 3 options, a real beginner distractor, a localized hint that does not reveal the answer, and a correct `relatedSection`. Every new question is on that day's own topic. New `correctIndex` always differs from the day's existing indices; new-question distribution 0/1/2 = 5/8/17. Course-wide distribution after the pass: [45, 26, 19] — no day has all-same indices anymore.
3. **`hint` + `relatedSection` added to all 60 existing questions** (both fields together, as schema `courseContentSchema` requires — a question has either both or neither). `relatedSection` points at the section that actually covers the question (usually the worked example in section 0; day 26 questions point at the dependencies section 1). Hints reference the relevant section without giving away the option text.
4. **Nothing else changed.** Lesson IDs, day order, prerequisites, interview (written) questions, quiz IDs, option order, option texts, correct indices of the 60 original questions, practice tasks/criteria/solutions — all preserved. The only diff lines removed are whitespace normalization from re-serialization (a few hand-edited spots had inconsistent indentation); no content line was deleted.

## Overlap candidates (19) — verdict: trust-example, no edits

For each flagged day the matching "solution lines" were located. In every case they sit in section `code` blocks (the worked example that `practice.solution` legitimately equals — the course's established worked-example pattern) or are inline mentions of the construct inside explanation sentences (e.g. `attr_accessor :title, :pages` named while explaining it; `sort_by { |b| book.pages }` named with its result). Trivial tokens (`end`, `else`, `begin`) matching prose are coincidental. No practice solution is disclosed as prose instead of a worked example; the practice tasks require local assembly and execution. Verdict for all 19: **trust-example — recorded, not edited**.

## Source verification (opened 2026-11-17 via WebFetch)

- https://www.ruby-lang.org/en/documentation/quickstart/ (+ /2/, /3/) — confirms `puts` as the basic print command, arithmetic, `nil?`, `each do |name|` blocks, class/instance structure. Does **not** cover `ArgumentError`/implicit return explicitly — verified against the reference instead.
- https://www.ruby-lang.org/en/documentation/ — confirms the documentation index (quickstart, official references at docs.ruby-lang.org, ruby-doc.org).
- https://ruby-doc.org/core/ — confirmed as the Ruby core API index (Integer, Hash, File, JSON visible; the listed course source).
- https://docs.ruby-lang.org/en/3.3/ArgumentError.html — "Raised when the arguments are wrong and there isn't a more specific Exception class"; inherits StandardError.
- https://docs.ruby-lang.org/en/3.3/Hash.html — `#fetch` "Raises KeyError if neither default_value nor a block was given"; default-value warning: "It is not advised to set the default value to a mutable object."
- https://docs.ruby-lang.org/en/3.3/Range.html — ".. includes the given end value", "... excludes the given end value".
- https://docs.ruby-lang.org/en/3.3/Kernel.html#method-i-raise — "With a single String argument, raises a RuntimeError with the string as a message."
- https://docs.ruby-lang.org/en/3.3/syntax/exceptions_rdoc.html — "By default, StandardError and its subclasses are rescued."
- https://docs.ruby-lang.org/en/3.3/File.html — File page confirms read mode `'r'` on a non-existent file raises an exception. `File.read`/`IO.read` pages do not spell out `Errno::ENOENT` explicitly; the missing-file exception behavior in day 24's new section matches standard system-call error behavior (`Errno::ENOENT`), consistent with the File page's confirmed exception on missing files. Recorded here for honesty.

Facts used in new sections/questions that were directly verified by the fetches above: ArgumentError semantics, `Hash#fetch` KeyError, mutable `Hash.new` default hazard, `..` vs `...`, `raise "string"` → RuntimeError, bare `rescue` → StandardError. Remaining facts (integer division `7/2.0 → 3.5`, single-quote non-interpolation, `map/select/reduce` semantics, `p` vs `puts`, `JSON.parse` string keys without `symbolize_names`, `Gemfile.lock` version pinning) are standard Ruby/Bundler behavior covered by the three listed course sources.

## Runtime check

`ruby -v` → **not available in this environment** (`ruby: command not found`). No new code was executed. This is recorded as an explicit limitation: the new code lines (edge-case snippets referenced in prose, e.g. `(1...5).to_a`, `[].reduce(0)`, `Hash.new([])`) were not machine-executed here. `tests/programming-intros.test.ts` already carries a skipped placeholder for exactly this (`ruby compiler/interpreter examples await an available local runtime`), and no runtime-execution test exists for ruby (grep over `tests/` found only the taxonomy track list and that skip).

## Verification performed

1. `npx vitest run tests/course-quality-guard.test.ts tests/course-taxonomy.test.ts` — 17 passed.
2. `npx vitest run tests/course-audit.test.ts` — 8 passed (loads every catalog course through `loadCourseContent`, i.e. the zod `courseContentSchema` parse of the edited ruby.json passes; `staleHits` empty).
3. `npx tsc --noEmit` — clean.
4. `npm run lint` — clean.
5. Custom structural check over the written file: 30 days × 4 sections × 3 questions; every question has `hint` + `relatedSection` (hint > 15 chars per locale, hint ≠ answer, hint does not contain the correct option text); `relatedSection` in range; `tg ≠ ru` and RU 250–700 for all 30 new sections; 3 options per question; correctIndex distribution [45, 26, 19]. One deliberate exception noted: `ruby-day-02-q3` points at `relatedSection: 0` (the worked example) rather than the appended section — by design.

## Remaining work / notes for the next reviewer

- The 70 % same-position and 73 % longest-RU heuristics are recorded, not fixed: existing option order is frozen by the task. After this pass no day has three same-position answers; a future pass may rebalance the 60 original `correctIndex` values (would require re-verifying linked feedback).
- Day 26 and day 30 written practices still have no rubric (`writtenDays: 2`, `writtenDaysWithRubric: 0` in the audit) — out of scope here, flagged for a later pass.
- When a Ruby runtime becomes available, execute the new edge-case snippets and record outputs (see skipped `programming-intros` test).
- Catalog day totals (30) unchanged — no catalog-other.ts / scope-copy / coverage-matrix regeneration needed.

## Follow-up factual repairs

- Day 1 now compares integer multiplication with string repetition. `12 * 3` produces `36` and `"12" * 3` produces `"121212"`. [Ruby 3.4 String documentation](https://docs.ruby-lang.org/en/3.4/String.html#method-i-2A).
- Day 8 supplies the full block for a seeded `reduce`. The empty array returns `0` with the seed and `nil` with the same block and no seed. The q3 answer matches its existing correct option. [Ruby 3.4 Enumerable documentation](https://docs.ruby-lang.org/en/3.4/Enumerable.html#method-i-inject).
- Day 11 now explains that a required parameter can follow grouped defaulted parameters or a splat. Two surrounding sections were corrected to match. The guided `greet` and `sum` examples still use their original signatures. [Ruby 3.4 method syntax](https://docs.ruby-lang.org/en/3.4/syntax/methods_rdoc.html).
- Day 30 points to the actual fixtures in days 27–29 for output formatting, search, sorting and grouping. It separately identifies the earlier examples for argument validation, symbol keys, `yield` and exceptions.

Readback matched all 30 lesson IDs and the original example code, practice objects and quiz option order. Ruby execution remains pending. Independent editorial review is pending.

## Ruby 3.4.12 runtime follow-up

Root obtained a portable Ruby 3.4.12 release and verified its ZIP digest. Its 28-code-practice run found incorrect recorded outputs on days 19 and 23. Day 19 uses string `inspect`, which includes quotation marks around `red`. Day 23's `avocado` length is 7, giving `{5 => 1, 7 => 1, 6 => 2, 9 => 1}`. The recorded output, walkthrough and practice task agree in RU/TG/EN after repair. Both reference programs were rerun by the integration owner and matched every output field. The new day 23 prose identifies the Ruby version for its hash spacing.

The earlier independent review's `[].reduce(0)` → `nil` explanation was wrong. The actual Ruby 3.4.12 call raises `TypeError` with `0 is not a symbol nor a string`. The current day 8 uses the full seeded block and returns `0`. Root's independent full rerun matched all 28 code practice outputs in RU/TG/EN on Ruby 3.4.12. Root also executed the repaired seed/no-seed, multiplication, default-argument and splat cases and accepted these six scoped repairs with limits. This does not establish complete independent practice, written rubric or language acceptance for the course.
