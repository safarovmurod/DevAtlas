# Context Engineering course — structural review and completion, 2026-11-17

Course: `context-engineering` (src/content/courses/context-engineering.json), 14 published days, starter tier, free access.
Trigger: half-finished batch handoff (days 13–14 did not reach handoff; last 6 questions missing linked feedback).
Scope of this change: ONLY src/content/courses/context-engineering.json and this review file. Nothing was committed or pushed. All other dirty files (other courses, AGENTS.md, docs, scripts) were left untouched.

## State at start (per handoff, verified against the file)

- 14 days, 42 questions; days 1–12 verified: 36 questions with linked `hint` + `relatedSection`, 8 executable practices (days 1, 3, 4, 5, 7, 8, 9, 11) with `verify_js` 0 problems, 4 written rubrics (days 2, 6, 10, 12).
- Day 13: 3 sections; questions had no hint/relatedSection; written practice had `hint` but no `hints` array and no `rubric`.
- Day 14: 4 sections; questions had no hint/relatedSection; practice was `kind: "code"` with `hint` only — no `hints`, no `referenceAnswer`, no `rubric`.

## What was completed

### 1. Day 13 — fourth section, question feedback, practice completion

- New section 4: «Прямая и косвенная инъекция» / «Инъексияи мустақим ва ғайримустақим» / "Direct and indirect injection". Own RU/TG/EN text (tg≠ru): direct vs indirect injection, the RAG soft-spot, the "who wrote this text?" rule, and the explicit statement that neither marking nor tags create a security boundary by themselves.
- Questions `context-engineering-day-13-q1..q3`: full `hint` (RU/TG/EN) + `relatedSection` 0, 1, 2 respectively. No existing option, order, or `correctIndex` changed.
- Written practice: added `hints` (2 items; `hints[0]` === existing `hint`, the course-wide pattern) and `rubric` (version 1, 3 criteria matching the 3 practice criteria, weight 1 each, 3 levels per criterion, standard review-questions pair used by days 2/6/10/12). Tajik rubric levels are complete sentences.

### 2. Day 14 — final project completion

- Questions `context-engineering-day-14-q1..q3`: full `hint` (RU/TG/EN) + `relatedSection` 2, 1, 3 respectively.
- Practice upgraded to the repo's final-project pattern (same as ai-fundamentals day 14):
  - `kind: "code"` → `kind: "written"` (schema rule: a `rubric` is only valid on a written practice — src/lib/courses/schema.ts superRefine "Written rubric must match written practice criteria").
  - Task: existing 5 steps preserved; step 3 gained the explicit overflow rule; new step 6 tells the learner what to submit (full packer.js code, actual output of both runs, output with BUDGET = 40).
  - `hints`: 2 items (`hints[0]` === existing `hint`; hint 2 covers the mandatory-core overflow check).
  - `referenceAnswer` (RU/TG/EN): expected 70-budget log (verified by running the solution), expected BUDGET = 40 overflow behavior, the reminder that the figures come from the program's own conditional "chars/4" counter and not the provider's tokenizer, plus the full reference program so the code stays visible in the written practice's solution block (for written practices the UI renders `referenceAnswer`, not `solution`).
  - `rubric`: version 1, 3 criteria × 3 levels aligned with the 3 practice criteria, weight 1 each, standard review-questions pair. Full Tajik sentences in every level.
- Existing IDs, day order, `prerequisiteDays`, quiz IDs, option order, `correctIndex`, and the section code/output pair all preserved. The practice `solution` code is unchanged; it was executed and reproduces the section-4 numbers exactly (instructions 13, package.json 18, tree 15, theme.js 13, summary 10; 69 of 70).

### 3. Register review of days 1–12 (read-only re-check; minimal fixes only)

Register item → result:

- `characters / 4` is an estimate, no hard token limit — day 3 S1 already honest ("Для английской прозы четыре символа на токен — грубый ориентир... text.length в JavaScript считает UTF-16 единицы, а не токены модели... Решение о реальном лимите требует подсчёта всего сериализованного запроса нужным счётчиком"). Confirmed against provider docs (see Sources): no chars-per-token guidance; use a token-counting API.
- Mandatory context can exceed the budget — day 3 S3 ("верните явную ошибку") and day 11 S2 already covered. Day 14 now states it too (below).
- Final pack must reveal mandatory-core overflow — day 14 S1 rewritten: if the mandatory core's total exceeds the budget, the log must show the overflow and demand a bigger budget instead of silently dropping a core part (the solution already prints «обязательное, но не влезло (увеличьте бюджет)»; verified at BUDGET = 40). Day 14 S2 wording «ядро всегда» → «ядро обязательно и идёт первым» (RU/TG/EN) to match.
- Wrapper overhead and output reserve must be counted — day 14 S1 gained: part price is measured on the final text including labels (path, headers travel in the context), and room for the answer is reserved beyond the input budget (day 3), so 70 must not be read as "the model's whole limit" (RU/TG/EN).
- Local practice measured-cost contract, not the provider tokenizer — day 14 S1/RU/TG/EN now calls the estimate a "measurable contract of our program for the mock exercise, not the provider's tokenizer"; reference answer repeats the reminder. Day 3 S1 unchanged (already correct).
- Tag/JSON/`<data>` is not a tool grant or security boundary — day 4 S2 ("теги не назначают полномочия и не гарантируют защиту") and day 13 S2 already correct; the new day-13 section 4 restates it; OWASP LLM01 mitigations align (see Sources).
- Trace is evidence of where to look; cause needs reproduction — day 1 S1/S3, day 1 q2, day 1 practice already correct in text, but the day-1 S3 recorded `output` contradicted them: it claimed the cause as fact («Ошибка в button.js, строка 12: addEventListener вызывается до createElement.») while the code actually prints «Проверить button.js:12 и воспроизвести сбой: причина пока не подтверждена.». FIXED: recorded output (ru/tg/en) now matches the real `node day01.js` output.
- Old section text agrees with new fixes — day 14 S1/S2 amended as above; days 1–12 cross-references to day 14 (days 2, 6, 9) checked and consistent ("журнал включённого и исключённого", "путь файла будет ездить с каждым куском").
- Tajik rubric sentences complete — days 2/6/10/12 rubrics left as verified (terse but grammatical complete sentences); new day-13/14 rubric levels written as complete sentences.

Additional defects found outside the register and fixed:

- Day 7 practice criterion 1 (RU) contained a Tajik word: «регистр и фосила нормализованы» → «регистр и пробелы нормализованы» (tg field untouched; фосила is correct Tajik there).
- Day 10 S1 (RU) contained an English artifact: «детали pleasant-разговора теряются безболезненно» → «детали приятного разговора теряются безболезненно».
- Day 8 S2 code had the guard `if (!best || score(best) === 0) throw new Error('No matching source');` duplicated three times in a row; deduplicated to one (no behavior change, output unchanged and re-verified).
- Day 9 S3 code had the `RangeError('Invalid chunk window')` validation block duplicated twice; deduplicated to one (no behavior change, output unchanged and re-verified).

All 14 section code snippets were executed with Node and compared to the recorded `output` fields: 13 of 14 matched; the only mismatch was day 1 S3 (fixed above). Days 8/9/13/14 snippets re-verified after the dedupe/insertion edits.

## Sources opened and confirmed (2026-11-17, via WebFetch)

1. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — OPENED. Confirms: context engineering as curating/maintaining the optimal token set during inference; "smallest set of high-signal tokens"; attention budget and context rot; just-in-time retrieval; compaction preserving goals/decisions. Notably gives NO tokens-per-character figure — supports the course's honest "estimate/mock contract" framing.
2. https://docs.anthropic.com/en/docs/build-with-claude/context-windows — OPENED via 301 redirect to https://platform.claude.com/docs/en/build-with-claude/context-windows (recorded; JSON source URL left as-is, it resolves). Confirms: "Everything in the request counts toward the context window" (system prompt, messages, tool results, tool definitions) and output counts too — matches day 3 S0 and the day-14 output-reserve note. Token estimation: "use the token counting API" — no chars-per-token guidance on the page. Overflow: 400 "prompt is too long" — matches day 3 S3.
3. https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents — OPENED. Confirms: compaction alone insufficient; structured on-disk state (progress notes, feature JSON, git history) bridging sessions; re-orientation routine; verification by real execution — "code inspection and unit tests alone led to premature done claims" — matches day 12's honest done/unknown separation.
4. https://platform.openai.com/docs/guides/prompt-engineering — OPENED via 301 redirect to https://developers.openai.com/api/docs/guides/prompt-engineering (recorded; JSON source URL left as-is). Confirms: developer message sections Identity/Instructions/Examples/Context; Markdown/XML tags to mark logical boundaries (a readability device, not a security boundary — aligns with day 4/13); RAG as supplying reference text; no prompt-injection claim that tagging alone is protection.
5. https://genai.owasp.org/llm-top-10/ — OPENED. Confirms LLM01:2025 Prompt Injection. Full entry https://genai.owasp.org/llmrisk/llm01-prompt-injection/ — OPENED. Confirms direct ("user's prompt input directly alters the behavior") vs indirect ("LLM accepts input from external sources, such as websites or files") injection; "unclear if there are fool-proof methods of prevention"; mitigations: least privilege/"Restrict the model's access privileges to the minimum necessary", human-in-the-loop for privileged operations, segregate and clearly label untrusted content, input/output filtering — matches day 13's layered defense and the detector-as-alarm status.
6. OpenAI cookbook tokenizer — https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken — OPENED via 308 redirect to https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken (recorded). Confirms tokenization is encoding/model-dependent, "in some languages tokens can be shorter than one character or longer than one word", and message token counts are "an estimate, not a timeless guarantee". The specific "~4 characters per token for English" rule of thumb is NOT on this page (it lives in OpenAI help docs); the cookbook confirms only qualitatively that English tokens "commonly range in length from one character to one word". Day 3's phrasing ("английская проза, грубый ориентир") remains a fair, hedged estimate claim.

## Verification (commands and results, 2026-11-17)

- `npx vitest run tests/course-quality-guard.test.ts tests/course-audit.test.ts` → 2 files, 17/17 passed (schema parse via the real loader for all catalog courses; stale-copy scan clean; catalog day totals intact). Run before and after all edits.
- `node scripts/course-authoring/verify_js.mjs src/content/courses/context-engineering.json` → "checked 8 executable lessons, 0 problems" (before and after).
- `npx tsc --noEmit` → exit 0, no errors.
- `npm run lint` → eslint clean, no output.
- Structural script (node, ad hoc): 14 days × 4 sections × 3 questions; every question has `hint` + `relatedSection` in range; practice `hint === hints[0]`; `hints` length 2; tg≠ru across titles, summaries, section bodies, questions, options, answers, hints, criteria, rubric levels, review questions, reference answers; rubric criteria count === practice criteria count (3), 3 levels each; kind-written-with-rubric rule satisfied. Result: all pass. Day order 1..14 intact, `prerequisiteDays` all before their day, 45 unique IDs (42 question IDs + 3 interview IDs, no duplicates).
- Day 14 practice solution executed: reproduces the section-4 log exactly (69 of 70); with BUDGET = 40 the log shows budget exclusions plus explicit mandatory-core overflow («tree — обязательное, но не влезло (увеличьте бюджет)») — matching criterion 3 and the register item.

## Remaining work (for the integration owner)

- Content counts changed for this course (day 14 practice kind code→written; one section added on day 13), so the shared reports need a regeneration pass in a coherent tree state: coverage-matrix.mjs, delivery-report.mjs, course-content-quality-report.mjs, audit-backlog.mjs, continuation-quality-audit.mjs. Not done here — those files are other owners' dirty files and out of my scope. Audit-stat note: context-engineering code-practice days become 1, 3, 4, 5, 7, 8, 9, 11 (8 days); written days 2, 6, 10, 12, 13, 14 (6 days). `publishedDays` (14) and all catalog assertions unchanged; vitest passes.
- The two source URLs in the JSON `sources` array now 301-redirect to platform.claude.com / developers.openai.com. They still resolve; updating them is a judgment call for the integration owner (URL/id changes were outside the preserve-list rules I followed).
- Self Reviewed limits stand: no real-model answer quality, no real tokenizer measurements, no device/account operations were claimed.
