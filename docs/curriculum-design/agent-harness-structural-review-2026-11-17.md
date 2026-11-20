# agent-harness — structural review and repair (2026-11-17)

Course owner session for `agent-harness` on `main`. Languages RU/TG/EN. No commit/push; the owner pushes. Only two files were changed: `src/content/courses/agent-harness.json` and this review document. Other dirty files (business-foundations, AGENTS.md) were not touched.

## Before — audit findings (docs/audits/continuation-quality-2026-11-17.json, courseId `agent-harness`)

- 14 scheduled days, but **all 14 days had fewer than 4 sections** (each had exactly 3).
- **Days 1, 2, 5 had only 2 questions.**
- **All 39 questions lacked `hint` + `relatedSection`** (schema requires both together: `src/lib/courses/schema.ts` superRefine — hint/relatedSection must be both present or both absent, and `relatedSection < sections.length`).
- **5 solution-in-theory overlap candidates** (days 4, 6, 7, 10, 11): in each, the theory section's `code` field was byte-identical to `practice.solution` (100% of substantive solution lines matched theory).
- Heuristics, recorded only (no rebalancing performed): dominant correct position 51% (option index 1), longest-correct-option-RU 95% including ties.
- Handoff listed concrete factual defects for days 2, 6, 7, 10, 11, 12, 14 plus three cross-cutting concerns (`APPROVAL` simulation, `path in files` inherited keys, trace content honesty).

## Defect verification before fixing (local Node probes, 2026-11-17)

Every handoff defect was re-verified against the current source before repair:

| Day | Handoff claim | Probe result | Verdict |
|---|---|---|---|
| 2 | «закрыли окно — контекст исчез» is an overgeneralization | text inspection: the sentence claimed chatbot memory dies with the window; a chatbot app can persist history server-side and offer buttons/tools | confirmed, fixed |
| 6 | tool lookup from object accepts inherited `toString` | `tools['toString']` returned a function; calling it executed (probe printed `[object Undefined]`) | confirmed, fixed |
| 7 | validator accepts `constructor` extra key, `limit: -5`, `NaN` | `validateToolCall({path:'a.txt', constructor:'x'})` → `ok:true`; `limit:-5` → `ok:true`; `limit:NaN` → `ok:true` | confirmed, fixed |
| 10 | first-20-char cut drops the important `FAIL` tail | `'test1 ok, test2 ok, test3 FAIL'.slice(0,20)` → `test1 ok, test2 ok,` — FAIL lost | confirmed, fixed |
| 11 | `5 + 7 + 9` = 21, observation said 16; first explicit error event ≠ first actual mistake | arithmetic probe confirmed 21 | confirmed, fixed |
| 12 | solution only prints backoff/checkpoint; no real pause, no durable save | code inspection: no sleep, `console.log('checkpoint saved…')` only | confirmed, renamed honestly |
| 14 | unknown tool falls into write branch; `path in files` sees inherited keys | `step.tool='delete_file'` → write branch; `'toString' in files` → `true` | confirmed, fixed |

## Repairs applied (per day)

### Structural

1. **New 4th section on every day** (title/body in ru/tg/en; RU 250–700 chars; tg ≠ ru; no code/execution in new sections). Titles are content-specific («Глубже в реальном проекте: …»): day 1 one-step loop edge case, day 2 chat-in-front-of-agent hybrid, day 4 plateau detection, day 5 prompt promises a tool missing from config, day 6 inherited registry names, day 7 valid-but-meaningless arguments, day 8 symlink/case/journal limits of prefix checks, day 9 trusted code still sandboxed, day 10 what compression loses, day 11 where a failure surfaced vs where it happened, day 12 retries do not cure invalid calls, day 13 multiple acceptable answers, day 14 what changes when a real model replaces the scripted policy.
   - Day 3: the new section was **inserted before** the errors-flavored closer «Что ломается без harness» per the placement rule; all other days appended it last. Day 12's errors section («Какие бывают ошибки») opens the day, so «Глубже» went last there — recorded as a deliberate placement decision.
2. **Third questions for days 1, 2, 5** (new ids `agent-harness-day-01-q3`, `-02-q3`, `-05-q3`): each with question/answer/options/correctIndex + hint + relatedSection, RU/TG/EN. Correct indexes were placed on 3, 2, 2 respectively to avoid strengthening the dominant position. Existing question ids, option order and correctIndex untouched.
3. **hint + relatedSection added to all 39 existing questions** (both fields together per schema), mapping each question to the section it is based on; hints are RU/TG/EN, guidance-only, no length clues, no answer giveaways.

### Factual repairs

- **Day 2** (section 1, ru/tg/en): the memory claim rewritten honestly — in the simplest interface history lives while the conversation is open; the application may persist history on a server, offer buttons and even tools; as long as the turn is text-only and nothing executes, it is a chatbot.
- **Day 6**: registry lookup now checks own keys only (`Object.prototype.hasOwnProperty.call(tools, call.tool)`); hint and criteria updated to teach the inherited-key pitfall; section 3 prose gained the same explanation.
- **Day 7**: validator contract completed — unknown keys via `hasOwnProperty` (catches `constructor`), `Number.isFinite` for numbers (catches `NaN`), and schema-driven `min` range check (rejects `limit: -5`). Demo calls extended from three to six (`constructor`, `limit:-5`, `limit:NaN`); task, hint, criteria and section-3 prose updated consistently (expected output now OK + five REJECT lines).
- **Day 10**: compression now keeps **head (14 chars) + ellipsis + tail (6 chars)** instead of first-20 — the `3 FAIL` tail survives; budget recalculated to 161 (`context used: 161 of 161`, verified by execution); task/hint/criteria/prose updated, and the prose now enumerates the three raw outputs and explains why tail-only-head compression loses FAIL.
- **Day 11**: observation fixed to `21` (was 16 for `sum [5, 7, 9]`); section-3 output block updated; prose and hint teach the distinction between where a failure **surfaced** (first `error` event) and where it **happened** (read the events before it).
- **Day 12**: simulation renamed honestly — printed line is now `checkpoint (printed, not persisted): …`, solution carries a top comment that the pause is computed/printed (not slept) and the checkpoint is printed (not persisted); task step 3 now says printing is the educational save; criteria and section-3 prose say a real harness does both.
- **Day 14**: allowlist `['read_file', 'write_file']` checked **before** the read/write branch (unknown tool is now rejected instead of falling into the write branch); `writeSchema` added — **every** tool has a schema; file existence uses `hasOwnProperty` instead of `in` (inherited `toString` no longer counts as a file); `APPROVAL` comment and section-2 prose state it is a simulated gate and a real harness binds approval to a concrete action and asks a live human at execution time; line count in prose updated to ~90.
- **Trace content honesty** (handoff item): checked day 11/13 questions and prose — the trace requirement stores arguments, observations and harness decisions, no raw secrets or private model reasoning is required anywhere (day 5 q1 already keeps secrets out of prompts). Recorded, no change needed.
- **`path in files`** — fixed inside the day 14 solution and taught in the day 14 hint.

### Overlap candidates (days 4, 6, 7, 10, 11)

All five were solution-in-theory (section `code` identical to `practice.solution`) — not trust-examples, so per instruction the theory was replaced, not the practice:

- Each section's `code` became a short self-contained teaching fragment on a **different example** with its own `output`: day 4 loop skeleton on a queue domain, day 6 own-key registry lookup against a `toString` request, day 7 one contract rule (`path must be a string`), day 10 head+tail compression preserving `3 FAIL`, day 11 first-error-event search.
- Practice tasks, hints, criteria and solutions remain the full independent work; day 4's task step 1 and section-3 sentence were reworded to say "assemble from the skeleton" instead of "use the section's code".
- Post-repair audit run: `daysWithPracticeSolutionInTheoryCandidates` for agent-harness is **empty**.

## Verification performed

1. **Local probes** — all seven handoff defects reproduced on the original source before fixing (table above).
2. **Executed every changed solution and fragment** in Node: day 4 (unchanged output), day 6 (3 observation lines incl. `error unknown tool unknown_tool`), day 7 (OK + 5 REJECTs with the exact reasons the task promises), day 10 (`context used: 161 of 161` + 4 context lines with `3 FAIL` visible), day 11 (10 lines, `6 observation 21`, `TASK FAILED AT STEP 9`), day 12 (backoff 100ms/200ms + `checkpoint (printed, not persisted)`), day 14 (TASK, 4 CONTEXT, `ERRORS: none`, correct REPORT); fragments print exactly their section `output`.
3. **`npx vitest run tests/course-quality-guard.test.ts tests/course-audit.test.ts`** — 17/17 pass (course-audit parses every catalog course through `courseContentSchema`, so the schema contract is covered).
4. **`node scripts/course-authoring/verify_js.mjs src/content/courses/agent-harness.json`** — `checked 0 executable lessons, 0 problems` (course has no `execution` blocks; unchanged).
5. **`npx tsc --noEmit`** — clean. **`npm run lint`** — clean.
6. **Custom structural script** — 14 days × 4 sections × ≥3 questions; new-section RU bodies within 250–700; all section bodies ≥80 RU chars; tg ≠ ru and en ≠ ru for all section bodies and titles; hints complete (RU/TG/EN, >15 chars, tg ≠ ru) on all 42 questions; every `relatedSection` in range; every `correctIndex` valid.
7. **Continuation audit re-run** (`scripts/continuation-quality-audit.mjs`): for agent-harness `daysWithFewerThan4Sections`, `daysWithFewerThan3Questions`, `daysWithMissingLinkedHints`, `daysWithPracticeSolutionInTheoryCandidates`, `missingTranslations`, `equalBodyCandidates`, `copyingTaskCandidates`, `duplicatePracticeSolutionCandidates` are all **empty**; the course left `structuralGapCourseIds` (now 6 other courses). Remaining heuristic-only values: dominant position 48% (was 51), longest-correct-option-RU 95% — recorded, not rebalanced.
   - Honest note: that script **writes** the shared `docs/audits/continuation-quality-2026-11-17.json/.md`. Since shared reports belong to the integration owner and only two files were allowed, both were restored to their committed state (`git checkout --`) immediately after extracting the row above; the integration owner can regenerate the audit in the coherent file state.
8. **Preservation diff vs HEAD**: courseId/sources, lesson ids, day order, `prerequisiteDays`, `sourceIds`, lesson titles/summaries, all 39 original question ids, question/answer text, full option arrays, `correctIndex` values, interviews, practice kinds and hints — identical. Differences are exactly the authorized set: new sections, new questions, new hint/relatedSection fields, section 3 bodies/code/output on repair days, task/hint/criteria/solution on days 4, 6, 7, 10, 11, 12, 14.

## Sources read (WebFetch, 2026-11-17) and what they confirmed

1. `https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview` → **301 redirect to `https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview`** (followed). Confirmed: tools defined by name/description/`input_schema`; the model returns a `tool_use` request, the developer executes and returns `tool_result`; errors are signaled back through tool results; strict tool use enforces exact schema conformance. Supports day 3 (model proposes, harness executes), day 6, day 7.
2. `https://www.anthropic.com/engineering/building-effective-agents` — confirmed: agent = model using tools on environmental feedback in a loop; explicit stopping conditions such as max iteration count; extensive testing in sandboxed environments with guardrails; human review at checkpoints; invest in tool (ACI) design; pausing for human input. Supports days 1, 2, 4, 9, 13.
3. `https://developers.openai.com/api/docs/guides/function-calling` (redirect from `platform.openai.com/docs/guides/function-calling`, followed). Confirmed: tool definitions with name/description/parameters JSON schema; `strict` mode requires `additionalProperties: false`; the dispatch code must handle unknown function names; errors are returned to the model as string output it reasons over. Supports day 6 (error-as-observation) and day 7 (unknown keys, strict schema).
4. `https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents` — confirmed: harness = tools + prompts + context management; checkpoints via commits/progress files; resumability routines; explicit honest limits (vision constraints, undetected bug classes). Supports days 3, 12, 14.
5. `https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents` — confirmed: context rot; compaction; structured note-taking outside the context; just-in-time retrieval; keep context informative but tight. Supports day 10 (and the course's cross-references to «Контекст-инжиниринг»).
6. `https://openai.com/index/harness-engineering/` — confirmed: harness is everything around the model; evals and feedback loops; traces/observability; mechanical guardrails; escalation to humans where judgment is required. Supports days 3, 5, 11, 13.
7. `https://modelcontextprotocol.io/docs/concepts/tools` — confirmed: MCP tools carry name/description/`inputSchema`; `tools/list`/`tools/call`; unknown tool is a protocol-level error; tool **execution** errors return `isError: true` with actionable text so the model can self-correct; servers MUST validate all tool inputs and SHOULD confirm sensitive operations with a human. Supports days 6, 7, 8, 13.

All URLs opened successfully; the two redirects above are recorded as encountered. No URL failed to open.

## Preserved as-is

Course/lesson/question IDs, original option order, `correctIndex` values, day order, `prerequisiteDays`, `sourceIds`, summaries, interviews, all correct existing prose outside the repair list, day 1/3/5/8/9/13 practice content (except hints now attached to questions), day 4 solution code and expected outputs, shared catalog/loader/progress files. No tests were weakened or skipped; no IDs reordered.

## Remaining work (honest register)

- Heuristic flags only: dominant correct position 48%, longest-correct-option-RU 95% — per instruction these are recorded, not acted on; any rebalancing would need explicit authorization because it touches existing options.
- 7 written-practice days still have no `rubric` (`writtenDaysWithRubric: 0`) and 0 `execution`-backed code days — that belongs to the accepted independent-practice/rubric review scope, not this structural repair.
- Real-device operations, team outcomes and assessed mastery remain outside what Self Reviewed can establish.
- The shared continuation audit JSON/MD should be regenerated by the integration owner in the coherent file state; the agent-harness row will then show zero structural omissions (values extracted and recorded above).
