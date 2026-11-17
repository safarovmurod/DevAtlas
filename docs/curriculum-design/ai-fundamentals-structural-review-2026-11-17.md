# AI Fundamentals review, 2026-11-17

Status READY FOR INDEPENDENT REVIEW. The owning source is `src/content/courses/ai-fundamentals.json`, loaded by `loadCourseContent('ai-fundamentals')` and validated by `courseContentSchema`.

## Scope and preservation

Read and reviewed all 14 scheduled days, including the original RU/TG/EN explanations, quizzes, practice tasks, references and guided examples. Added one substantive topic-specific section per day, explanatory feedback with section links for every quiz, five application questions, six locally executable independent practices and eight written rubrics. The final project has a written code/output/explanation submission with its own rubric.

The course now contains 56 theory sections, 42 quiz questions and the three existing written interview questions. A temporary baseline captured before authoring agrees with HEAD on the 14-day sequence and 37 original quiz IDs. All original lesson IDs, days, order, prerequisiteDays, lesson sourceIds, written interviews, quiz IDs, correctIndex values and option positions remain intact. New questions were appended on days 4, 5, 6, 11 and 13.

Seventeen original questions received scoped wording or correct-option corrections where an old claim contradicted current documentation or the revised task. These are day 1 q2, day 2 q1–q2, day 3 q1–q3, day 4 q2, day 5 q1–q2, day 7 q2, day 8 q2, day 9 q1, day 10 q1–q2, day 12 q3 and day 13 q1–q2. Options were never shuffled. Good existing examples and independent written work were retained with specific corrections and rubrics.

## Confirmed corrections

- Days 1–2 now distinguish AI approaches, ML training, ordinary generation and app-managed history. Current documents or authorized tools can supply facts that postdate a training cutoff. Storing a preference does not require changing model weights.
- Day 3 labels the words-to-tokens formula as an estimate. The independent task works with already measured counts and reserves output space. The guided example was actually run and prints `used: 22 fits: true`.
- Days 4–6 qualify prompt outcomes, identify the actual author/role of instructions and evaluate new cases outside few-shot examples. The notice reference gives a source text and checkable facts. Examples consume input space, with charges dependent on pricing/cache terms.
- Day 7 separates JSON syntax, schema conformance and business meaning. Refusal/incomplete/error handling and bounded retries are explicit. Diagnostics use safe reasons without raw customer text.
- Day 8 removes the claim that a model’s tone is always equally confident. Its standard-library verification uses ECMAScript Array.prototype and a clean runtime. An absent page in one reference alone is insufficient evidence. The task distinguishes standard methods and library additions.
- Day 9 is a fictional defensive redesign on paper. The unsafe starting design sends drafts automatically. The redesigned assistant prepares drafts, while the employee reviews the exact content and the app checks authorization. Markers and schemas carry explicit limits. Literal attack payloads and operational attack exercises are absent.
- Day 10 distinguishes application functions and provider-built tools. The local mock validates the allowed name and arguments before execution. The former dictionary lookup could accept inherited object names without an own-key check. The revised mock uses an explicit allowed-name comparison and Map-backed fictional weather data.
- Day 11 acknowledges that changing parseFloat’s result from 12 to 12.5 changes behavior. The independent prompt concerns a different function and states preserved string cases and a new null case.
- Day 12 returns only public readiness metadata from fictional configuration. Whitespace and wrong types are rejected. No real key or account action is needed.
- Day 13 separates temporary rate limits, quota and spend. Retries do not imply one universal billing rule. Its independent integer micro-unit calculator counts cached input once and validates counts.
- Day 14 uses supplied fictional verdicts for independent routing. Refund always requires review under the exercise’s policy, even if needsHuman is false. A malformed third record must not prevent the fourth from being processed. The written submission identifies model, application and human responsibilities.

## Every-day practice review

| Day | Independent evidence | Result and boundary |
| --- | --- | --- |
| 1 | `routeBox(score)` | 0.8 is included, 0.79 needs review, null/out-of-range/type errors give unknown |
| 2 | Saved-preference/current-schedule analysis | Three task-specific rubric criteria cover source, freshness and missing evidence |
| 3 | `planTokens(parts,window,reserve)` | Exact boundary fits, one extra reserved token fails, empty input handled |
| 4 | Three prompts for one supplied notice | Predictions and date/time/place checks remain written until real outputs exist |
| 5 | Fictional workshop roles/availability | Platform, developer, user and pre-booking app check have concrete rubric levels |
| 6 | Few-shot classification prompt | New delivery case plus mixed duplicate-charge case, expected payment priority |
| 7 | `parsePriority(raw)` | Valid data, malformed JSON, null, array, blank title, unknown priority and extra field |
| 8 | Standard API verification protocol | Specification, runtime evidence and library/version distinction |
| 9 | Paper redesign of review replies | Outside data, draft content, independent authorization and exact approval |
| 10 | `dispatchOrder(turn)` | Allowed function only, typed/ranged arguments, missing/unknown input |
| 11 | Coding-assistant request for `label` | New null behavior and two preserved string outputs |
| 12 | `publicStatus(env)` | Fictional marker accepted, blank/missing/non-string configuration rejected, key omitted |
| 13 | `estimateCharge(usage)` | 230 for 100 input/20 cached/10 output, zero, all-cached and invalid counts |
| 14 | `routeVerdicts(items)` plus output/explanation | `F1:queue \| F2:review \| F3:invalid-review \| F4:review`, later record survives invalid neighbor |

All eight written tasks have three criteria with explicit 0/1/2 evidence descriptions and two review questions. Self Reviewed assesses the submitted text. It does not establish live model behavior, actual data retention, external authorization or independently assessed mastery.

## Research actually read

Access date 2026-11-17. These are primary sources. The provider guides are rolling documents, so the course avoids fixed model prices, token ceilings, account limits and model names. Eleven supplementary URLs were appended to course.sources. The original source IDs and original lesson sourceIds remain valid.

| Exact URL | Checked claims and use |
| --- | --- |
| https://developers.google.com/machine-learning/intro-to-ml/what-is-ml | Training uses data to produce useful predictions, used in days 1–2. Page reports updated 2026-01-27. |
| https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview | Redirected to https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview. Success criteria and empirical evaluation inform days 4–6. |
| https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/multishot-prompting | Redirected to https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices. Examples and model/task dependence inform day 6. |
| https://platform.openai.com/docs/guides/prompt-engineering | Redirected to https://developers.openai.com/api/docs/guides/prompt-engineering. Read its `.md` version for instructions, roles and evaluation in days 4–6 and 11. |
| https://model-spec.openai.com/2025-12-18.html | Dated authority definitions support platform/system, developer and user distinctions on day 5. API field support still depends on endpoint/model. |
| https://developers.openai.com/api/docs/guides/conversation-state.md | Stateless calls can receive earlier history, while state can be managed separately. Used in days 2–3. |
| https://help.openai.com/en/articles/4936856-understanding-and-counting-tokens | Approximate English ratios, encoding/language variation, full request counts and output/reasoning space. Used in days 3 and 13. |
| https://developers.openai.com/api/docs/guides/structured-outputs.md | Completed non-refusal schema-constrained output, refusal/incomplete/error cases and remaining business checks. Used in days 7 and 14. |
| https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations | Factual errors, context grounding and uncertainty. Used in day 8 without claiming that one technique guarantees correctness. |
| https://tc39.es/ecma262/multipage/indexed-collections.html#sec-properties-of-the-array-prototype-object | Array prototype methods and filter behavior. The accessed rolling document labels itself ECMAScript 2027. No dependency on a new 2027 feature was introduced. |
| https://genai.owasp.org/llm-top-10/ | The accessed index is the 2025 list. Used for risk naming in day 9. |
| https://genai.owasp.org/llmrisk/llm01-prompt-injection/ | Direct/indirect risk, limits of defenses and controls. Used only for the defensive paper analysis. |
| https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | Minimum functionality/permissions and independent approval of consequential actions. Used in days 9–10 and 14. |
| https://developers.openai.com/api/docs/guides/function-calling.md | Model proposals, app execution, returned outputs and built-in tools. Used in day 10. The mock shape is labeled as a teaching format. |
| https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety | Long-lived key storage, backend routing and exposure response. Used in day 12. |
| https://developers.openai.com/api/docs/guides/your-data.md | Distinct application state, abuse-monitoring retention and settings. Used in days 2 and 12 without claiming a universal retention period. |
| https://developers.openai.com/api/docs/guides/prompt-caching.md | Matching eligible prefix, model-specific rates and actual usage. Used in days 6 and 13. |
| https://developers.openai.com/api/docs/guides/rate-limits.md | Temporary rate retry, bounded attempts/time and errors requiring quota/billing action. Used in day 13. |
| https://www.anthropic.com/research/building-effective-agents | Published 2024-12-19, now carries a tooling-age notice. Workflow/agent conceptual distinction and simplest applicable process inform day 14. Current operational API details come from the current guides above. |

All new explanations, examples, quiz items and rubrics were authored for DevAtlas. No provider prose, media or code sample was copied. The Google page footer identifies CC BY 4.0 for content and Apache 2.0 for code samples. The OWASP footer identifies CC BY-SA 4.0 unless otherwise stated. This review does not assert that all third-party linked content shares those licenses. Provider documentation was used to verify facts, with links retained as attribution.

## Verification

- `python -I scripts/course-authoring/audit.py ai-fundamentals` completed. Before → after results are sections<4 14→0, questions<3 5→0, noHint 14→0, reference overlap 7%→0%, autoGraded 0→6. Missing EN, TG=RU, broken/generic criteria, short solutions and repeated generic headings remain 0.
- Original positions were preserved. The most common correct index is 33%. Correct-answer-longest remains 69%, down from 75%. Existing long explanatory answers and obvious distractors retain a pattern and need a separately approved assessment rewrite if changed comprehensively. This limitation remains visible.
- `node scripts/course-authoring/verify_js.mjs src/content/courses/ai-fundamentals.json` checked six executable lessons with 37 fixtures and reported 0 problems. It ran each solution, verified argument nonmutation and required each starter to fail at least one fixture.
- Seven guided JavaScript programs were actually run in isolated local Node contexts and compared with expected logs. Results were day 1 spam/spam, day 3 `used: 22 fits: true`, day 7 true/false, day 10 fictional sunny weather, day 12 public status objects, day 13 `0.0045`, and day 14 the three expected guided routes.
- The final written reference’s JavaScript block was separately executed locally and matched the four expected routes. Empty input, null/array verdicts, unknown category and invalid priority were tested, plus a wrong refund-policy mutation that the expected result rejected.
- Clean local checks observed `typeof [].compact` as undefined, `['a','','b'].filter(value => value !== '')` as `['a','b']`, and `parseFloat('12 сомони 50 дирам')` as 12. These observations support the corresponding content corrections.
- `npx vitest run tests/course-content.test.ts tests/course-quality-guard.test.ts` passed two files and twelve tests after the final summary/source corrections. Schema feedback anchors and all written rubrics were included in that run.
- Read-back comparison preserved fourteen progress identities, all 37 original quiz IDs/positions/correctIndex values, original sourceIds and three written interview objects. Global quiz/interview IDs are unique. Text was checked for unwanted zero-width/BOM characters.

Live provider calls, real tokenization, billing, account settings, attacks on external systems, sends and key operations were not performed. Live model answer quality, independent native-language review and course-wide browser/mobile coverage remain unverified. Full build/tests and generated aggregate reports belong to integration. The temporary authoring script is outside the checkout and was stopped before the final fresh-JSON corrections.
