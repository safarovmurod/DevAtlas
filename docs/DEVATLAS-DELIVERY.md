# DevAtlas delivery status (generated)

Regenerate: `node scripts/delivery-report.mjs`. CI checks `--check`. Inventory comes from every real catalog/content loader, including React and Next.js. Checkpoint metadata comes from [delivery-state.json](delivery-state.json); it is a recorded checkpoint, not a live deployment assertion.

Recorded main checkpoint: `1b1f0d0da7a2d28461a152f331125ecede3b7d96`. 43 course IDs; 38 tracks; 114 stage requirements; 936 actual scheduled days (786 free, 150 premium). 38 Starter, 4 Pro and 1 Expert course IDs.

42 stages have published curricula; 72 stages are missing (1 Beginner, 34 Pro, 37 Expert). 0 tracks have all three stages published. Source availability is not Verified educational completion; the generated matrix grants no Verified status. JavaScript 1 and 2 are two IDs in one Beginner stage.

Current P0/P1/P2 tasks, acceptance criteria and blockers: [full audit register](audits/2026-10-26-tasks.md). Historical checklists are dated evidence, not today’s completion status.

## Published inventory

| Course ID | Access tier | Actual days |
|---|---|---:|
| html | starter | 30 |
| css | starter | 30 |
| javascript-1 | starter | 30 |
| javascript-2 | starter | 30 |
| react | starter | 60 |
| nextjs | starter | 20 |
| git | starter | 30 |
| typescript | starter | 14 |
| algorithms | starter | 14 |
| python | starter | 30 |
| backend | starter | 44 |
| mobile | starter | 2 |
| cpp | starter | 30 |
| java | starter | 30 |
| csharp | starter | 30 |
| go | starter | 30 |
| rust | starter | 30 |
| php | starter | 30 |
| ruby | starter | 30 |
| sql | starter | 30 |
| bash | starter | 30 |
| nodejs | starter | 30 |
| mongodb | starter | 30 |
| swift | starter | 30 |
| kotlin | starter | 30 |
| ux-design | starter | 2 |
| ai-fundamentals | starter | 14 |
| context-engineering | starter | 14 |
| agent-harness | starter | 14 |
| digital-marketing | starter | 2 |
| data-analytics | starter | 2 |
| business-foundations | starter | 2 |
| communication | starter | 2 |
| content-creation | starter | 2 |
| english-foundations | starter | 2 |
| digital-literacy | starter | 2 |
| personal-productivity | starter | 2 |
| management-foundations | starter | 2 |
| javascript-pro | pro | 30 |
| backend-pro | pro | 30 |
| architecture-expert | expert | 30 |
| ux-pro | pro | 30 |
| business-pro | pro | 30 |

## Implemented and bounded

- Existing catalog, tracks, accounts, progress, notes, drafts, Monaco, themes, Aurora, sidebar and six UI languages are retained. Authored new lesson material requires RU/TG/EN. Older incomplete translations keep visible fallback.
- HTML day 1 has a compatible Learn → Understand → Watch → Try → Practice → Test → Review → Master pilot, real sandboxed HTML exploration and two authored eight-question assessment forms. Quiz result badges are distinct from full mastery. Wider lesson-flow rollout remains unfinished.
- Mastered requires successful assessed practice, ≥80% and every critical question. Self review allows study continuation but cannot mint protected mastery. Late account results are isolated; legacy progress/XP is preserved. Readiness never grants or revokes paid content access.
- The protected assessment ledger has server-derived grading, own-account/MFA reads and service-only idempotent writes. Its migration has PostgreSQL-compatible tests; live Supabase application is not verified. Missing configuration does not fabricate persistence.
- The SQLite pilot checks day 1 in a disposable browser worker with real WASM SQLite, changed datasets, constraints, expected/actual output and execution/output limits. It is local assessment, not server attestation. Other SQL days remain local CLI exercises. See [SQLITE-PRACTICE.md](SQLITE-PRACTICE.md) and the recorded publication status in delivery-state.json.
- Communication day 1 has a versioned written rubric with three-language performance descriptors and required reflection. Reviews bind to the exact answer hash and existing account-scoped drafts. Self Reviewed remains separate from Auto Verified, AI Feedback and Human Reviewed; it never mints verified Mastered. Wider written-rubric rollout and authorized human review remain pending.
- Backend currently has 44 authored days with RU/TG/EN explanations and five checks per day, including its 44-day capstone sequence. Supported function tasks reuse the isolated browser runner; code traces are explanatory and local Node.js project tests are separate. Daily CLI graders exercise learner files against actual Node/SQLite cases; capstone gates load the supplied project modules and reject broken ownership. Reference success does not establish learner authorship or server attestation.
- React function labs retain their existing isolated browser runner. Other native languages are not advertised as browser-compiled merely because an editor exists. Provision and test isolated trusted runners before enabling them.
- Existing TutorDrawer and Floating Site Agent remain the two assistants. Owner-scoped local Agent history, cancellation and mandatory persistent AI budget reservations are implemented; live budget migration/configuration and shared persistent multi-chat remain pending. Do not represent local chat history as complete server history.
- Beginner remains free. Pro/Expert bodies, solutions, tutor references and paid attachments retain server authorization and private/no-store caching. Billing remains billing_not_configured; a browser flag or fake redirect never grants membership.

## Required remaining work

All 11 two-day programs still require full authored expansion: `mobile`, `ux-design`, `digital-marketing`, `data-analytics`, `business-foundations`, `communication`, `content-creation`, `english-foundations`, `digital-literacy`, `personal-productivity`, `management-foundations`.

All 5 fourteen-day programs still require a reviewed continuation: `typescript`, `algorithms`, `ai-fundamentals`, `context-engineering`, `agent-harness`.

Complete the 72 missing programs in the track/stage matrix, deepen HTML/JS1/JS2/Git/C++ and other thin explanations, and roll out meaningful assessments/projects across full curricula. Do not publish a plan as a lesson or duplicate days to reach a number.

Subject visualizers, complete AI Mentor history and live quota activation, the full platform design update, personalized roadmap/placement/repetition, project portfolios and remaining product functions still require implementation and verification. Human review authority cannot come from learner-editable metadata. Subjective mastery needs actual authorized human review.

## Validation and deployment evidence

Current source audit finds 0 stale duration claims. This measures wording, not overall teaching quality; thin-theory and quiz-density findings remain in [SELF_LEARNING_CONTENT_AUDIT.md](SELF_LEARNING_CONTENT_AUDIT.md).

Recorded local validation checkpoint: 452 tests passed, 7 skipped; 120 targeted desktop/mobile cases passed (Recorded full local108 desktop/mobile +12 mock-auth; final source-attribution/Light-Dark contrast follow-up2 passed; consult exact-head CI); dependency audit 0 known vulnerabilities. Typecheck, lint and production build passed at the recorded checkpoint. Skipped runtimes are not executed proof; consult current CI for the exact head.

PRs, merge SHAs and pending work are recorded in delivery-state.json. Vercel success metadata is separate from live HTTP/browser proof. Direct deployment HTTP was blocked by this workspace CONNECT proxy (403); live database, payment and online-AI configuration are not inferred from successful builds.

## Local setup and trust boundaries

Use the repository lockfile and Node 24 in this workspace: `npm ci --cache /workspace/.npm-cache`, then `npm run dev`. Predev/prebuild package ignored same-origin Monaco and SQLite assets with license notices. Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e` and `npm run test:auth` as appropriate. Playwright owns port 3100; stop owned dev servers before rebuilding production outputs.

Kotlin example execution uses the separately installed local KOTLINC path when available. SDK paths are machine-specific; missing compilers must be reported as skipped, not simulated.

Follow [accounts-setup.md](accounts-setup.md) and [LAUNCH-STEPS-RU.md](LAUNCH-STEPS-RU.md). Review migrations in order in a test database, including 20261026000000_assessment_evidence.sql and 20261026010000_tutor_budgets.sql after account/session migrations. Never expose SUPABASE_SERVICE_ROLE_KEY or provider secrets to the browser. No live migration is claimed here. Payments require a real provider, agreed prices/currencies and verified lifecycle webhooks; online AI requires approved provider configuration and durable cost controls.

Repository changes, environment configuration drafts and production publication are separate operations. Preserve existing useful work; correct factual errors without regenerating completed courses. Do not force-push or bypass failed CI.
