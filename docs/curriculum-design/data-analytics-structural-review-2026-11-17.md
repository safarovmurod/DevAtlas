# data-analytics — structural continuation review 2026-11-17

Course owner continuation for `data-analytics` (branch `main`, local only — no commit/push).
Touched files: `src/content/courses/data-analytics.json` and this review document. All other
dirty files (agent-harness, business-foundations, …) were left untouched.

## Baseline (audit 2026-11-17, docs/audits/continuation-quality-2026-11-17.json)

- 30 scheduled days; every day had fewer than 4 sections (27 days had 3, days 24/25 had 2).
- 0 days with fewer than 3 questions (all days have 5) — no new questions required.
- 117 questions missing `hint` + `relatedSection` (150 questions total).
- Overlap candidates: days 1 and 2 (`practiceSolutionInTheoryCandidate: true`), days 17/18
  (`matchingSolutionLines: 2`, not flagged — SQL worked examples).
- correctIndex distribution `[148, 1, 1]` (98.7% at index 0), longest-correct-option RU 92%.

## Handoff findings — verified in current source before fixing

| # | Finding (handoff) | Verified in source | Action |
|---|---|---|---|
| 1 | Day 12: `[2,3,3,4,18]` mean is 6, not 10 | **Already correct.** Every occurrence of the list (day 2 sections/practice/learningFlow, day 11 sections, day 12 questions) states `среднее 30/5 = 6`; day 12 sec 1's "то же среднее 10" refers to the separate hypothetical day `9, 10, 10, 11, 10` (mean 10, correct). | No change; recorded. |
| 2 | Range is `max − min`, not the maximum wait itself | **Confirmed** in day 12 `sections[2]` all locales: «Размах полезен для границы „худший случай“: самое долгое ожидание дня» / "The range serves the worst-case boundary: the day's longest wait". | Fixed in ru/tg/en: the range is a distance (max − min); the worst-case boundary is the maximum itself. |
| 3 | Singleton condition in task does not match function output | **Confirmed.** Day 12 `practice.task` item 2 said «одиночное значение — все меры null, кроме Q1=Q3», but `spread([5])` returns `{range: 0, q1: 5, q3: 5, iqr: 0}` (verified against the stored solution and tests). | Task text fixed in ru/tg/en to state the actual output: range 0, IQR 0, Q1 = Q3 = the value. Function, tests, execution untouched. |
| 4 | Day 25: week-1 retention 60% > 50%, text says the opposite | **Confirmed.** Day 25 `sections[1]` all locales claimed «но удержание w2 лучше» / "yet w2 retains better" while the data is w1 = 60%, w2 = 50% (execution test expects `rates [100,60,30]` vs `[100,50]`; day 25 q05 already answered "w1: 60% против 50%" correctly — the section contradicted its own quiz). | Fixed in ru/tg/en: by shares w1 is ahead too (60% vs 50%); the gap in shares is smaller than the gap in people. Numbers and tests untouched. |
| 5 | Missing cohort period must not be replaced with 0 or fabricated data | **Already correct** in day 25 `sections[0]` («неделя, для которой данных ещё нет, — пропуск, а не ноль») and q04. | No change; the new day-25 sections and fixes respect this (nothing fabricated, no 0-substitution). |
| 6 | "Week two always dips harder" is a false generalization | **Confirmed** in day 25 `sections[1]` all locales («вторая неделя везде проседает сильнее первой» / "week two always dips harder"). | Fixed in ru/tg/en: the dip is an observation of these two cohorts and a common shape, explicitly not a law (flat and non-monotonic curves occur). |
| 7 | Local auto-check must not be called server verification or Mastered | **Not present.** 0 hits for "Mastered"/"сервер"/"server" in the course JSON; day 10 sec 2 and the executable-day task texts say "Auto Verified"/"машина подтверждает расчёт" and contrast with Self Reviewed — honest. | No change; recorded. |
| 8 | Do not invent the NULL cause and "касса confirmed" without given data | **Confirmed.** Day 1's given table states only «A02 — значение не указано» / «требует уточнения»; no source-check result is attached anywhere in the task data. Day 5 asserted «касса не записала (сбой)» / "(a till glitch — the value was forgotten by the system)" as fact (sec 1, solution = referenceAnswer ru/tg/en, demo paragraph); day 6 asserted «касса подтверждает дубль после сбоя» / "the till confirms a post-glitch duplicate" (sec 1, sec 2 journal line, solution = referenceAnswer ru/tg/en, demo). | Fixed in ru/tg/en: day 5's cause is now the working hypothesis «забыли записать» (to be checked against the till in a real project); day 6's confirmation is now an explicitly scenario-accepted outcome of the assigned till check (source-check result not attached to the set). Day 13's outlier confirmation was left alone: it is given as a premise inside that day's own question. Day 7's conditional rule «удалять только при подтверждении кассой» stays (it is a rule, not a claim). |

## Overlap review (audit heuristic, manual follow-up)

- **Days 1, 2 (flagged, fixed):** `sections[1]` body was the written `referenceAnswer` verbatim
  (day 1 in ru only; day 2 two full paragraphs). The prose was rewritten in ru/tg/en to teach the
  same worked example with different wording; the practice `solution`/`referenceAnswer`,
  criteria, tasks and tests are untouched. Post-check: no reference-answer fragment remains in
  any section body.
- **Days 17, 18 (not flagged; trust-example, recorded, unchanged):** `matchingSolutionLines: 2`.
  Day 17 sec 1 repeats two SELECT lines, day 18 sec 1 repeats the GROUP BY header lines; these are
  the deliberate worked SQL examples, and the test suite requires day 18 sec 1 to keep the
  reconciled dataset lines («понедельник 4/455», «455+210+460 = 1125»). Practice on these days
  asks for several queries; only the exemplar shape is shown. Kept as trusted examples.

## Structural additions

- **32 new sections** (30 days now have exactly 4 sections each):
  - One «Глубже …» section per day with a content-specific title (e.g. day 25 «Глубже: когорты с
    разными длинами наблюдения», day 21 «Глубже: часовой пояс и граница дня»), each containing a
    concrete edge case and an explicit link to earlier days; no code/execution in any new section.
  - Days 24 and 25 additionally received a «Частые ошибки …» section (the two-section days from
    the audit).
  - Placement: days 9, 14, 18, 22, 23, 26, 27 insert the «Глубже» section **before** their
    existing errors/trap section («Ловушка смешанных уровней», «Пусто, ноль и обман шкалы»,
    «Опасность молчаливого AVG», «Честные оси», «Ложные KPI», «Ложные корреляции», «Ловушки
    экспериментов»); all other days append it at the end.
  - Every new section: `{title, body}` with ru/tg/en, ru 250–700 chars, all three locales distinct
    (tg ≠ ru ≠ en), titles about content rather than generic labels.
- **117 question hints added** (33 → 150 of 150 questions now carry `hint` + `relatedSection`
  together, as the schema requires). 115 in the main pass; a follow-up pass caught the two q03
  questions of days 26/27. Hints are content nudges (no answer, no option-length clues),
  ru/tg/en distinct, and `relatedSection` points at the section that answers the question
  (validated: 0 ≤ rel < 4 per day).
- **relatedSection remap on insertion:** day 9 q04, day 14 q03, day 18 q04, day 22 q03 moved
  2 → 3 so they still point at the trap sections that moved one slot down. `learningFlow`
  walkthroughs all use `[0,1]` and needed no remap.
- Untouched, as required: all question ids/questions/options/correctIndex/answers, day order,
  prerequisites, learningFlow chains, practice tasks/solutions/execution tests, day-2 mean
  30/5 = 6 worked example, the day 18/20 test-mandated dataset strings.

## Sources opened and verified (WebFetch, 2026-11-17)

| URL | Status | What it confirmed |
|---|---|---|
| https://support.google.com/analytics/answer/9670133 (GA4 Cohort exploration) | Opened | Cohort = users sharing a characteristic (acquisition date as the standard case); inclusion/return criteria; daily/weekly/monthly granularity; cells count users meeting the return criterion. Backs day 25 definitions and the retention-as-share framing. |
| https://docs.getdbt.com/reference/resource-properties/data-tests (dbt data tests) | Opened | `unique` = "no duplicate values present in a field", `not_null` = "no null values present in a column". Backs day 3 grain/key reasoning and day 6 duplicate checks. |
| https://amplitude.com/docs/analytics/charts/retention-analysis/retention-analysis-interpret | Opened | Retention percentages are shares of the cohort; curve shapes vary by measurement mode with explicit non-monotonic examples ("a later bracket can read higher than an earlier one"); no universal week-two dip. Backs the day-25 "always dips" fix. |
| https://docs.mixpanel.com/docs/reports/retention | Opened | Cohort formed by the birth event per period; retention = percentage of the cohort retained; no universal shape claim. Corroborates the day-25 fix. |
| https://www.sqlite.org/lang_aggfunc.html (in-course source) | Opened | avg() averages non-NULL values only and returns NULL with no non-NULL input; count(X) counts non-NULL, count(*) all rows; sum() returns NULL with no non-NULL input. Backs day 18 «Опасность молчаливого AVG» and day 20 NULL reporting. |
| https://support.google.com/analytics/answer/9356763 | **HTTP 404** (stale URL) | Not used; replaced by answer/9670133 above. Recorded honestly. |

## Checks executed (all green)

1. `npx vitest run tests/course-quality-guard.test.ts tests/course-audit.test.ts` — 17/17 pass.
2. `npx vitest run tests/data-analytics-course.test.ts tests/general-course-content.test.ts` —
   11/11 pass (includes `courseContentSchema.parse` of the patched JSON, the 30-day/quiz
   invariants, the mean 30/5 = 6 worked example, the SQL dataset reconciliation and the
   executable-function suites: 5 lessons, 34 cases).
3. `node scripts/course-authoring/verify_js.mjs src/content/courses/data-analytics.json` —
   "checked 5 executable lessons, 0 problems".
4. `npx tsc --noEmit` — exit 0. `npm run lint` — exit 0.
5. Custom structural script: 30 days × 4 sections × ≥3 questions (actual: 5 per day); 150/150
   hints with tg ≠ ru ≠ en and in-range `relatedSection`; answer == options[correctIndex] in all
   locales; day-12 mean/range/IQR claims correct; no leftover "w2 retains better", "always dips",
   "все меры null, кроме Q1=Q3", «касса подтверждает дубль», "Mastered" strings; no section body
   equals a written reference answer.

## Honest limitations / remaining work

- **correctIndex distribution unchanged:** `[148, 1, 1]` (98.7% at index 0), longest-correct RU
  option 92% (tg 90%, en 92.7%). The handoff forbids touching existing questions and no day has
  fewer than 3 questions, so no rebalancing questions were added. A future pass should author
  replacement questions (new ids, new options) for integration-owner review if the platform adds
  a position-balance guard for this course.
- The generated reports listed in AGENTS.md (coverage-matrix.mjs, delivery-report.mjs,
  course-content-quality-report.mjs, audit-backlog.mjs, continuation-quality-audit.mjs) were NOT
  regenerated — they are outside this task's two-file ownership. The integration owner should
  regenerate them over the current tree.
- New RU/TG/EN section and hint text is authored by this continuation pass; an independent
  reviewer should read it against the source table above (Self Reviewed status unchanged — no
  new runtime evidence was claimed).
- Day 12's executable `spread` function keeps its declared behavior for a single value
  (`{range: 0, q1: v, q3: v, iqr: 0}`); the task text was aligned to the code, not the reverse.
