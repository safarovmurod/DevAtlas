# Versioned assessment pilot

This is the first compatible slice of phase 3, not completion of the curriculum or the full interactive learning flow. The existing HTML day 1 practice editor now includes a real assessment. No existing lesson, progress, note, code draft or XP record is migrated or deleted.

## Authoring and grading

`src/lib/practice/assessment.ts` validates complete RU/TG/EN objectives, questions, progressive hints and feedback. A bank requires at least two retry variants with 5–10 questions each, critical checks and source IDs. The HTML pilot has two independently authored eight-question forms covering single choice, multiple answers, code output, find a bug, fill a blank, matching, short answer and a scenario. References are the existing MDN and WHATWG sources; questions and translations are original, with no third-party text copied.

Canonical keys stay in the server-loaded bank. Learner DTOs omit them. Submission shapes reject forged owner/verification fields and duplicate questions; unanswered questions remain in the denominator. Failed answers receive the first conceptual hint and a link to the related explanation. Later hints are learner-controlled. Retry chooses a different form without an XP penalty.

The only enabled practice adapter is the existing parse-only HTML day 1 validator. It checks document behavior/structure rather than requiring the reference source string. No submitted code runs on the application server. Other programming languages are not declared supported by this pilot.

Mastered requires passing practice, at least 80% of all questions and every critical question. `courseDayReady()` remains the legacy continuation rule; `courseDayReadiness()` additionally exposes assessed status. Self review can permit continuation but cannot grant verified mastery. The pure evidence model is not an authorization boundary and is never accepted as a submitted server grade.

## Storage and trust

Draft answers are private per browser actor/course/lesson, separately from existing code drafts. Account changes remount and abort the old assessment session. Restored answers are regraded; cached client data cannot restore a server attestation. A guest receives deterministic automatic feedback explicitly labeled local, without server XP or durable completion.

For authenticated requests the server derives the owner from the verified JWT, grades the submitted code and answers, and records only its own aggregates. The separate SQL ledger has owner/MFA-protected reads, no learner writes and a service-only RPC. UUID attempt IDs plus a submission hash make retries idempotent and reject conflicting reuse. Database-generated mastery uses the same threshold and critical/practice conditions. Legacy progress writes cannot overwrite this table.

## Deployment

Apply `supabase/migrations/20261026000000_assessment_evidence.sql` through the existing trusted migration process after the account/session migrations. It has been executed in PostgreSQL-compatible PGlite tests, including RLS, ownership, threshold and idempotency checks. This does **not** prove that a live Supabase migration has run. No production database credentials are available in this workspace. Missing configuration, migration or persistence returns a local result with an explicit unavailable notice; it never fabricates successful server persistence. Existing billing remains fail-closed.

The new evidence ledger awards no additional XP. A passing HTML practice result reuses the existing practice completion/verifier path, so learners do not need to click a second code-check button to continue. Its existing idempotent XP rules remain intact. Responses for edited drafts cannot complete the newer draft. Certificates, full calendar evidence badges and subjective project reviews still require wider phase 3 work.

## Compatible lesson-flow contract

`learningFlow` is an optional authored extension to existing lesson JSON. Existing content stays valid. New flows require full RU/TG/EN goals, a real-world case, referenced walkthrough sections, a prediction with explanatory feedback, a supported subject demonstration, guided practice, independent practice, an assessment version, a mini challenge with a self-review example, a summary, review prompts and a real next lesson. Tests check that every published flow has its matching server assessment. It travels through the existing course-content authorization boundary, including premium bodies.

HTML day 1 implements Learn → Understand → Watch → Try → Practice → Test → Review → Master. Its five original explanation sections and existing practice remain intact. The HTML explorer renders a real sandboxed document from escaped literal text and shows an explicitly simplified element tree. Editing title, h1 or p demonstrates independent effects. Prediction and guided review are instructional and award no verified progress. Practice and Test open the existing editor/assessment; Review and Master explain retrieval practice and honest assessment requirements. Legacy calendar quiz badges now say “Quiz result” to avoid implying full practice mastery.

Research checked 2026-10-25: MDN's official `mdn/content` tutorial [Basic HTML syntax](https://github.com/mdn/content/blob/main/files/en-us/learn_web_development/core/structuring_content/basic_html_syntax/index.md), blob `fe6d993075def157f97c690532aef503b815df0b`, especially document anatomy, head/title and body. The repository's [LICENSE.md](https://github.com/mdn/content/blob/main/LICENSE.md) identifies prose as CC-BY-SA 2.5. It was consulted for factual ordering; the club case, prediction, exercise wording, translations and implementation here are original, not copied tutorial prose or code. Existing MDN/WHATWG lesson source references are retained. Direct MDN/WHATWG HTTP was blocked by the environment proxy; the official MDN source was read through GitHub API.

## Written rubric pilot

Communication day 1 extends the existing written practice with a versioned rubric. Each existing criterion has original RU/TG/EN descriptors for absent, partial and demonstrated performance, a weight and reflection prompts. Existing task, answer, reference example and criteria are preserved. This is not the course's still-required thirty-day expansion.

Learners select descriptors supported by their text and explain their rating and next improvement. The percentage is explicitly a self rating, not a test grade or automatic assessment of prose quality. Even 100% Self Reviewed never grants Auto Verified, Human Reviewed or verified Mastered. Saving permits self-study continuation through the existing idempotent four-point manual-practice path; it creates no protected ledger record.

Reviews save through existing per-account drafts, keyed by rubric version and bound to SHA-256 of the exact answer. Edited answers invalidate the displayed review; retry is allowed. Incompatible/corrupt records are preserved in recovery drafts before replacement. A late digest cannot save into a switched account, even if the accounts have identical answers. No online AI, keyword scoring or simulated human grader is used.

The optional schema keeps legacy practices valid, requires matching written criteria, and requires complete RU/TG/EN throughout lessons adopting a structured flow or rubric. It rejects forged verification/method fields. Tests cover weighted scores without verified mastery, stale/incomplete rubrics, exact-answer hashing, recovery and account-switch races. Real desktop/mobile browser tests cover persistence, restoration, changed drafts and 320px layout. Wider course adoption and authorized human review workflows remain unfinished.
