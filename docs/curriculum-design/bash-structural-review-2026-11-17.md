# Bash course structural review — 2026-11-17

Course owner session for `src/content/courses/bash.json`, branch `codex/complete-starter-curricula`.
Scope: bash course only (`bash.json`, the bash block of `tests/programming-intros.test.ts`, this file).
Catalog, schema, scripts, other courses and reports were not modified.

## Baseline findings (audit 2026-11-17 + own loader check)

`docs/audits/continuation-quality-2026-11-17.json` (courseId `bash`) and a direct
read of the course loader agreed:

- 28 days with fewer than 4 sections (all except day 23 and day 30, which already had 4).
- 30 days with fewer than 3 questions (every day had exactly 2).
- 60 existing questions without linked hints (all `bash-day-NN-q*`).
- 25 `practiceSolutionInTheoryCandidates` (days 1, 2, 3, 6–26, 29) — see the overlap verdict below.
- correctPositionCounts [38, 14, 8], dominant position 0 at 63 %.
- Failing test: `tests/programming-intros.test.ts` "Bash course: every executable day runs…" —
  day 30 exited with status 1 (`Usage: bash report.sh <readable log file>` on stderr, empty stdout)
  because the verifier runs `bash main.sh` without arguments.

A run-verification harness over all `kind: code` days confirmed: days 3–26 and 29 all PASS
without arguments (including the `$1` days 05, 13, 14, 22, 26 — day 05 uses `set --`, days
13/14/22 pass arguments to functions/awk inside the script, day 26 builds its own sandbox).
Day 30 was the only failure. Days 1–2 (`kind` unset) and days 27–28 (`written`) are skipped by design.

## Day 30 fix (coordinator decision implemented)

Found: `bash-day-30` practice solution required `"$#" -ne 1` with a readable file and exited 1
without arguments; the first section carrying `output.en` (section[1]) recorded the output of the
braced-block teaching example (`=== Log report === total_requests=10 …`), which cannot match the
practice script's counts (`valid=4 ok=1 redirects=1 errors=2 skipped=1`).

Fix (only the sanctioned fields):

- `practice.solution` rewritten so that **without arguments** the script builds its own sample
  fixture (`requests.txt` with the five task lines `/store 200`, `/store 503`, `/help 302`,
  `/cart 404`, `invalid line`) inside a sandbox `.bash30-lesson`, counts it, prints the counts and
  removes the sandbox; **with one argument** it counts that file (read-only, `< "$1"`, input file
  untouched); **with a missing/unreadable file or more than one argument** the original usage
  error with `exit 1` on stderr is preserved, so the positional-argument lesson stays intact.
- `sections[1].output` ru/tg/en replaced with the real script output
  `valid=4\nok=1\nredirects=1\nerrors=2\nskipped=1` (identical in all three locales — the text is
  pure numbers/keys). The task text, criteria, hint, code and all other day-30 text are unchanged.

Execution evidence (real bash, temp dir):

- no args → status 0, stdout `valid=4\nok=1\nredirects=1\nerrors=2\nskipped=1`, sandbox cleaned;
- `bash main.sh requests.txt` → same counts, input file unchanged after run;
- `bash main.sh missing.log` → status 1, stderr `Usage: bash report.sh <readable log file>`;
- two arguments → status 1, same usage error;
- repeated no-arg runs are deterministic.

`tests/programming-intros.test.ts` (bash block only) gained an assertion locking the educational
guarantee: `report.sh missing.log` must exit non-zero with the usage hint on stderr. No other
test in the file was touched; kotlin/java/node/sql/go behavior is unchanged (all green).

## Structural completion

New content, all ru/tg/en, RU bodies 250–700 characters (verified programmatically), TG is a
meaningful translation (never a copy of RU), titles describe content:

- **Days 3–22, 24–26, 29** (24 days): one appended section after the existing «Ошибки и практика»,
  following the day-23/30 house style (extra edge-case/deeper section last). Titles include
  «Как printf расходует аргументы», «Подстановка со значением по умолчанию», «Имя скрипта и
  сообщение об использовании», «Порядок веток и вложенные условия», «Что ещё умеет проверять test»,
  «Диапазоны, переменные и пустые списки», «Когда чтение заканчивается», «Шаблоны case и аргументы
  скрипта», «Инкремент и статус арифметических команд», «Массив и строки с пробелами», «Вывод
  функции и подстановка команд», «exit и статус в конце скрипта», «read -p, -n и массив»,
  «Смещение tail и ввод без файла», «Коды возврата grep и тихий -q», «Классы символов и точечные
  совпадения», «Числовая сортировка и отбор повторов», «Символьные диапазоны cut и действия tr»,
  «Адреса строк в sed и другой разделитель», «NR, NF и свой разделитель в awk», «Слияние потоков
  и порядок перенаправлений», «Папки в cp и ступени осторожности rm», «Равные счётчики и
  устойчивость цепочки», «Обратные операции с именем файла». Each connects to earlier days
  (e.g. day 12 ties `"${arr[@]}"` to day 3 printf repetition and day 5 `"$@"`; day 22 ties
  `awk -F:` to day 15 `IFS=':'`).
- **Days 1, 2** (intro days): two appended sections each — a deeper section (empty/unset variables
  and space-containing values; how many arguments to expect and how to refuse) and a
  «Частые ошибки» section with four beginner mistakes each, with reasons.
- **Days 27, 28** (written days): two appended sections each — «Где set -e не останавливает
  скрипт» / «Трассировка функций и конвейеров» and «Частые ошибки безопасности» /
  «Частые ошибки отладки», each with four mistakes and reasons.
- **Third question `bash-day-NN-q3` on all 30 days**: understanding questions («Что напечатает…»,
  «Почему…»), three options with real distractors, hint that nudges without revealing the answer,
  `relatedSection` pointing at the section that teaches the content, `answer` equal to
  `options[correctIndex]`. correctIndex placement: in all 30 days the new q3 differs from both
  existing correctIndexes (deterministic requirement where the two existing differ: [1,0]→2,
  [1,2]→0, [2,0]→1, [0,2]→1, [0,1]→2; flexible [0,0] days chose 1 or 2).
  New distribution: [41, 26, 23] over 90 questions, dominant position 45.6 % (was 63 %).
- **Hints + relatedSection added to all 60 existing questions.** Question id, question text,
  answer, options and correctIndex of existing questions are byte-identical to HEAD (verified by
  a semantic diff against `git show HEAD`); only `hint` and `relatedSection` were inserted
  (key order id/question/answer/hint/relatedSection/options/correctIndex, matching the accepted
  python course pattern). Every new section body also passed the tg≠ru check; the schema-level
  pairing rule (hint present iff relatedSection present, relatedSection < sections.length) holds.

Totals after the change: 30 days × ≥4 sections (124 sections), 30 days × 3 questions (90), 90/90
questions with hint+relatedSection. Audit-metric simulation for bash: `<4 sections` 28→0,
`<3 questions` 30→0, missing linked hints 60→0.

## Overlap review verdict (25 candidates — no text changed)

The audit flags days where >60 % of solution lines (>30 chars) appear in
`section.code + section.body.ru`. A line-level localization of every match shows: on all 25 days
every matched line lives inside the section **code block that is the teaching example** (day 1/2:
`sections[0].code`; other days: `sections[1].code`), and `practice.solution` equals that example
by design. No solution line appears in any section body prose or in any practice hint. The
example is shown deliberately with a line-by-line walkthrough, and each task contains an
independent step 4 («Самостоятельно…»). Verdict: heuristic false positive for this course model —
removing the example would break the guided-run design and the run-verification contract.
No change; recorded here as the required manual review.

## Source verification (GNU Bash manual)

Opened and read via web fetch (one at a time):

- `https://www.gnu.org/software/bash/manual/bash.html` — confirmed the Bash Reference Manual
  (Edition 5.3, 18 May 2025); the single-page HTML was truncated before the Set Builtin, so the
  section pages below were fetched.
- `https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html` — confirmed `set -e`
  exits on a failing pipeline and does not apply to "part of the test in an if statement",
  "part of any command executed in a && or || list except the command following the final && or ||",
  pipelines except the last command, `while`/`until` bodies and `!`-negated commands; `set -x`
  prints traces "after they are expanded and before they are executed" prefixed by PS4; `set -u`
  errors on unset variables ("An error message will be written to the standard error, and a
  non-interactive shell will exit"). These quotes back the day-27/28 additions.
- `https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html` — confirmed
  `#`/`##` remove the shortest/longest leading match, `%`/`%%` the shortest/longest trailing
  match, and `${#parameter}` is the character length (element count for `[@]`/`[*]`). Backs the
  day-29 addition.
- `https://www.gnu.org/software/bash/manual/html_node/Bash-Conditional-Expressions.html` —
  confirmed `-e/-f/-d/-r/-w`, `-z/-n`, `-eq/-ne/-lt/-le/-gt/-ge`. (The `=~` operator is not on
  that page; it is not used by any new text.) Backs days 6/7 additions.
- `https://www.gnu.org/software/bash/manual/html_node/Arithmetic-Expansion.html` — confirmed
  `$(( ))` "evaluates an arithmetic expression and substitutes the result". Integer-division
  truncation and `let`/`(( ))` status semantics are not on that page; those claims were verified
  by execution instead (see below), matching the already-published day-11 text.

Not opened (out of scope for the claims made): tldp HOWTO page — the course already cites it and
no new claim needed it. No URL failed to open.

## Execution verification (real bash, Git Bash on Windows)

1. **All executable day solutions** (`bash main.sh`, no arguments, cwd = fresh temp dir, stdout
   compared with the first section carrying `output.en`): 26/26 PASS (days 3–26, 29, 30).
2. **Day-30 argument matrix**: 4 modes as listed above — all correct.
3. **91 code claims from the new sections** executed against real bash in a scratch directory
   (script with a `check` helper printing PASS/FAIL): **91/91 PASS** after two of my own draft
   claims were corrected during review — `ca?t` matches `cart` but not `cat` (the question mark
   needs exactly one character), and `[st]art` matches `tart` but not `start` (the class eats one
   character). The day-10 section text was corrected accordingly before finalizing; this is the
   only place where execution contradicted a drafted sentence.
4. Test/type/lint gates:
   - `npx vitest run tests/programming-intros.test.ts` → 5 passed, 7 skipped (absent runtimes),
     0 failed — Bash, Java, Node, SQL all green.
   - `npx vitest run tests/course-quality-guard.test.ts` → 9 passed.
   - `npx tsc --noEmit` → clean. `npm run lint` (eslint src/) → clean.
5. Semantic diff against HEAD: only sanctioned changes (appended sections/questions/hints,
   day-30 solution and output). Existing sections, questions, options order, interviews,
   prerequisites, ids and sourceIds are byte-identical.
6. JSON formatting: file rewritten with the same 1-space indent and CRLF working-tree style.
   The three pre-existing `interview` blocks keep their content but are now at the canonical
   indent (the original file had inconsistent indentation there — re-indentation shows as ~54
   diff lines; content verified identical).

## Known residuals (documented, not fixable within the constraints)

- **11 days (13, 16, 18, 19, 20, 21, 24, 25, 26, 29, 30) have two existing questions sharing
  correctIndex 0**, so a day-level "three distinct correctIndex values" is impossible without
  editing existing questions, which the task forbids. Within every one of these days the NEW q3
  uses 1 or 2 — it never repeats the existing value, and no new duplicates were introduced.
- **Heuristic flags that remain by design**: 25 `practiceSolutionInTheoryCandidates`
  (example-equals-solution, verdict above); dominant correct position 45.6 % (>45 flag) and
  longest-correct-option-RU 84.4 % — both inherited from the 60 untouched existing questions
  whose correct options carry explanatory tails; the 30 new questions improve the balance but
  cannot cancel the existing pattern.
- Day-30 section[1] keeps the braced-block example code and its walkthrough prose, while its
  recorded `output` now reflects the practice script (coordinator's decision). The prose in the
  section body still describes the example's own expected output, so learners can verify the
  example by running it; the structured output field is what the automated verifier compares.
- Day 1/2 `practice.kind` remains unset and days 27/28 remain `written` — untouched as existing
  authored data.
- `src/content/courses/javascript-pro.json` and `tests/premium-curriculum.test.ts` show as
  modified in the working tree — these changes are not from this session and were left untouched.

## Remaining work

- Primary-agent review of this course (per the audit queue rules) before integration.
- If the coordinator later wants the 11 `[0,0]` days to reach three distinct correctIndexes,
  that requires an explicit authorization to adjust one existing question's correctIndex per day.
- `grep -E`/`[st]art`-style claims in the day-10 section were verified; no other drafted claim
  failed execution.
