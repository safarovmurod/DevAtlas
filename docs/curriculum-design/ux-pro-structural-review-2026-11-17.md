# ux-pro — structural review and repair (2026-11-17)

Course owner session for `ux-pro` on `main`. Languages RU/TG/EN. No commit/push; the owner pushes. Only two files were changed: `src/content/courses/ux-pro.json` and this review document. Other dirty files (React/Next, billing, styles, other courses' reviews) were not touched. The day-19 owner-supplied design-principles lesson belongs to `ux-design`, not `ux-pro`; it was not consulted or modified — every one of the 30 `ux-pro` days was reviewed here.

## Before — audit findings (docs/audits/continuation-quality-2026-11-17.json, courseId `ux-pro`)

Local probes on the pre-repair file (2026-11-17) confirmed every audit claim:

- 30 scheduled days; **all 30 days had fewer than 4 sections** (each exactly 3: main idea → «Разобранный пример» → day-specific closer).
- **All 30 days had fewer than 3 questions** (each exactly 2).
- **All 60 questions lacked `hint` + `relatedSection`** (`src/lib/courses/schema.ts` superRefine requires both together and `relatedSection < sections.length`).
- Heuristics, recorded only (no rebalancing of existing options): `answerSameIdx` **22/30 (73%)** — q01 and q02 shared one correct position on 22 days; longest-correct-option-RU **51/60 (85%)**.
- All 30 days are written practice; interviews exist on days 1–3; every lesson level `intermediate`; no `learningFlow`.

## Overlap verification (before fixing)

- **Solution-in-prose candidates: days 1, 2, 3.** In each, the RU body of section S1 «Разобранный пример» is byte-identical to `practice.solution`. This is the worked example mirroring the practice reference — a **trust-example**, so per instruction it was **recorded, not changed**. (The `general-course-content.test.ts` prohibition of solution-in-prose applies to `expandedIntroductions` courses, not to the `applied` tier.)
- **Question answers verbatim in prose: none.** Every existing question answer (ru/tg/en, also with quotes stripped) was searched in all section bodies of its day — no containment found. No prose replacement was needed anywhere.

## Repairs applied

### 1. One new section on every day («Глубже», RU/TG/EN)

- Content pattern per instruction: a deeper real-project nuance of the **same day's topic** plus an **edge case** plus an explicit **link to previous days** (day 1 honestly states there are no previous days yet and anchors the initial dated version of the evidence map).
- Titles are content-specific («Глубже: двойная отправка и гонки», «Глубже: брендовый цвет не проходит контраст», «Глубже: комбинации состояний», …). No `code`, `language` or `output` keys in any new section (the schema/test requires sections to stay prose-only for this course).
- RU bodies are 541–681 chars (within the required 250–700); tg/en bodies are full translations, tg ≠ ru ≠ en by content and wording. New sections contain no answer text of any quiz question.
- **Placement** (per the errors rule): inserted **before** the errors-type closer on 19 days — 5, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22, 23, 24, 26, 27, 28, 29 («Типичные ошибки», «Ошибки …», and day 9 «Антипаттерны категорий», counted as errors-type because anti-patterns are the day's common-mistakes section); appended **at the end** on 11 days — 1, 2, 3, 4, 6, 7, 8, 14, 21, 25, 30. Recorded placement calls: day 8 «Как не скопировать» and day 25 «Оговорки аналитики» are guidance/caveat closers, not errors lists, so their new sections went last; day 14 «Правила измерений» and day 21 «Проверка иерархии» likewise. Final section order per day is therefore 4 sections everywhere.

### 2. Third question on every day (`ux-pro-day-XX-q03`, RU/TG/EN)

- Each new question tests the **same day's topic** with a realistic beginner distractor (research synthesis, usability heuristics, accessibility/WCAG, design systems, metrics — matching that day), 3 options, `answer == options[correctIndex]` in all three locales, unique options per locale.
- `correctIndex` of every new question **differs** from the day's existing positions: after the repair no day has all questions on one correct position (`answerSameIdx` fell from 22/30 to **0/30**). Overall distribution across the 90 questions is [27, 46, 17] for indexes 0/1/2.
- Option length hygiene for the new questions only: max/min ratio ≤ 1.8 in every locale, and the correct option is the longest in only **17 of 90** new-question/locale pairs (the pre-existing 85% pattern was not reproduced).
- Every new question carries `hint` (all locales, guidance-only, no answer text, >15 chars) and a correct `relatedSection`: index 2 (the new «Глубже» section) on the 19 insert days, index 3 on the 11 append days.
- Existing question ids, option order and `correctIndex` values untouched.

### 3. hint + relatedSection added to all 60 existing questions (both fields together)

- Each question maps to the section that actually teaches it: **56 point to S0** (main idea), **4 point to S1** («Разобранный пример»: day 1 q02 neutral instruction, day 2 q01 error recovery, day 2 q02 subscription placement, day 20 q02 button label — the tested wording lives in the worked example).
- Hints are RU/TG/EN, question-scoped, never contain the answer string, no length clues; every hint locale exceeds 15 chars.
- `question`/`answer`/`options`/`correctIndex` of all 60 existing questions are byte-identical to HEAD (verified by diff probe, see below).

## Verification performed

1. **Schema parse**: `tests/general-course-content.test.ts` parses `ux-pro.json` through `courseContentSchema.parse` — passed (also confirms the hint/relatedSection together rule and `relatedSection < sections.length`).
2. **Vitest**: `npx vitest run tests/course-quality-guard.test.ts tests/course-audit.test.ts tests/general-course-content.test.ts` — **24/24 passed** (course-audit re-loads every catalog course live, so the ux-pro row reflects the repaired file). Related suite `npx vitest run tests/premium-course-access.test.ts tests/course-taxonomy.test.ts tests/free-courses.test.ts tests/placement.test.ts tests/sequential-progression.test.ts tests/published-curriculum.test.ts` — **89/89 passed**, including the dedicated `ux-pro` curriculum check.
3. **`npx tsc --noEmit`** — exit 0. **`npm run lint`** (eslint src/) — exit 0.
4. **Structural script (30×4×3)**: 30 days × 4 sections × 3 questions; hints complete in ru/tg/en for all 90 questions; tg ≠ ru in every section; every new section RU 250–700; `answer == options[correctIndex]` with 0 mismatches across 270 locale checks; no `code`/`language`/`output` in new sections; no quality-guard placeholder markers.
5. **Preservation diff vs HEAD** (`git show HEAD:…ux-pro.json` compared item-by-item): courseId/sources, lesson ids, day order, `prerequisiteDays`, `sourceIds`, titles, summaries, levels, all existing sections (byte-identical), all 60 original question ids, question/answer text, full option arrays, `correctIndex`, interviews, practice — identical. Differences are exactly the authorized set: 30 new sections, 30 new questions, new `hint`/`relatedSection` fields on the 60 existing questions. Note: re-serialization (`JSON.stringify` indent 1, CRLF) normalized **56 whitespace-only lines** left by earlier hand edits inside this one file; no content line changed.
6. **Not run on purpose**: `scripts/course-content-quality-report.mjs` and `scripts/continuation-quality-audit.mjs` **write** shared report files (`docs/audits/*`), which belong to the integration owner and are outside the two-file allowance. The live audit test (`course-audit.test.ts`) already re-computed the course row from the repaired file and passed; regeneration in the coherent file state is left to the integration owner.

## Sources read (WebFetch, 2026-11-18) and what they confirmed

1. `https://www.nngroup.com/articles/ten-usability-heuristics/` — confirmed: «10 Usability Heuristics for User Interface Design» by Jakob Nielsen, with the full ten: visibility of system status; match between system and the real world; user control and freedom; consistency and standards; error prevention; recognition rather than recall; flexibility and efficiency of use; aesthetic and minimalist design; **help users recognize, diagnose, and recover from errors** (plain-language messages that identify the problem and suggest a constructive next step); help and documentation. Supports the day 2/19/20 error-state and microcopy material and the day 22 form errors.
2. `https://www.w3.org/WAI/WCAG21/quickref/` — confirmed: customizable quick reference for WCAG 2.0/2.1/2.2 (filter by version, level, tags, techniques); the four POUR principles; **1.4.3 Contrast (Minimum), Level AA: "at least 4.5:1"** (3:1 for large text; AAA 1.4.6 is 7:1); 2.1.1 Keyboard; 2.4.7 Focus Visible; 3.3.1 Error Identification. Supports day 15 (the 4.5:1 AA threshold in section, question and hint, and the large-text exception in the new «Глубже» section).
3. `https://www.nngroup.com/articles/` — confirmed: NN/g articles index with topic areas for **Personas**, **Journey Mapping 101**, **Usability (User) Testing 101**, **Why You Only Need to Test with 5 Users**, **Affinity Diagramming for Collaboratively Sorting UX Findings** (research synthesis), **Analytics & Metrics**, **Accessibility**. Supports days 1, 4, 5, 6, 13, 14, 25. These match the course's own declared sources `ux-pro-nngroup` and `ux-pro-wcag`; all three URLs opened successfully, none failed.

## Preserved as-is

Course/lesson/question IDs, original option order and count (day 1 q01 keeps its 4 options), `correctIndex` values, day order, `prerequisiteDays`, `sourceIds`, summaries, interviews (days 1–3), all practice content, the worked-example sections including the days 1–3 solution duplication (trust-example), all correct existing prose. No tests were weakened or skipped; nothing was reordered.

## Remaining work (honest register)

- Heuristic residue, recorded only: longest-correct-option-RU across all 90 questions improved from 85% to 66% (existing options untouched); dominant correct position remains index 1 (46/90) — further balancing would require touching existing options and needs explicit authorization.
- The days 1–3 worked-example/proactice-solution duplication stands as a trust-example; if the integration owner later wants the `expandedIntroductions`-style prohibition applied to the applied tier, that is a deliberate editorial decision, not part of this structural repair.
- Written-practice `rubric`s, independent-practice review, UX rubric review and outcome review belong to the accepted-batch queue (Management/Python/Mobile/JS-Pro/Bash/Algorithms scope) and were not touched here.
- Shared reports (`coverage-matrix.mjs`, `delivery-report.mjs`, `course-content-quality-report.mjs`, `audit-backlog.mjs`, `continuation-quality-audit.mjs`) should be regenerated by the integration owner in the coherent file state; the `ux-pro` row will then show 30 days × 4 sections × 3 questions with full hint coverage.
- Real device/account operations, team outcomes and assessed mastery remain outside what Self Reviewed can establish.
