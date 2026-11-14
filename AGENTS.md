<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## DevAtlas curriculum handoff — 2026-11-15

The current project is `D:/Проектҳо/DevAtlas`. The former OneDrive Desktop `react-mentor` path is stale. Use the existing checkout and inspect `git status --short --branch` and `git log -5 --oneline` before editing. Start with the saved curriculum checkpoint in that checkout and consult [the dated audit](docs/CURRICULUM-AUDIT-2026-11-15.md).

### Work already saved

- Five existing Starter courses now contain 84 scheduled lessons: Content Creation 30, English Foundations 14, Digital Literacy 9, Personal Productivity 22, Management Foundations 9. That is 74 new days and 10 revised introductory days. Existing lesson IDs, prerequisites, quiz IDs and original option order were kept. Catalog copy, introductory duration, tests and generated reports reflect the actual lessons.
- TypeScript days 1–14 now have four theory sections, three questions with linked hints and independent practice. Reference exercises were checked locally through TypeScript and Node.js. The strict-diagnostics day remains a written exercise backed by a local program.
- Next.js days 13–20 were expanded in RU/TG/EN. They cover React interview practice and the project sequence through loading/error states and release checks. Next.js still has 20 scheduled days and existing question IDs were kept.
- React has at least three quiz questions on all 60 days. The previously thin eight days received 16 new questions and deeper theory across nine topics. Core days 1–5 were also deepened. Together these edits add 30 theory sections. 40 React days still have fewer than four sections. Existing topic IDs, plan order and progress identifiers stay valid.
- Source inventory at the checkpoint: 43 courses, 38 tracks, 1,192 scheduled days, 42 stages with published curricula and 72 missing stages. For current counts, use the application loaders and generated coverage reports.

### Resume here

1. **Content Creation has all 30 planned days authored**, including the publication module and final two-format project. Days 28 and 30 have four-criterion Self Reviewed rubrics. **Personal Productivity has all 22 planned days authored**. Existing IDs and progress are preserved; do not recreate those lessons. English Foundations days **11–14** are now authored: countable nouns, a/an and basic the, plurals, this/that/these/those. Resume **days 15–18**, the second half of module 11–18: adjectives/word order, numbers/quantity, there is/there are and a description project. Use [the outline](docs/curriculum-design/short-courses.draft.json), check authoritative language-teaching sources, and retain original RU/TG/EN explanations, independent practice and honest limits on pronunciation assessment.
2. After that, continue only the actual unfinished work in the [dated audit](docs/CURRICULUM-AUDIT-2026-11-15.md) and [coverage matrix](docs/coverage-matrix-20261024.md). The next modules start at day 10 in Digital Literacy and Management Foundations, and at day 15 in English Foundations. Next.js days 1–12 still need distinct RU/TG/EN content. React still has theory gaps outside this checkpoint. Reuse the finished lessons, tests and data instead of authoring them again.
3. Keep new lessons sequential and preserve existing IDs, choice order and progress. Use original RU/TG/EN material, subject-specific examples, useful quiz feedback and independent practice. Only count lessons that exist in the actual loader. Consult [the authoring guide](docs/course-authoring-prompt.md) for the content contract.
4. When counts change, synchronize `catalog-other.ts`, localized copy if needed, catalog/coverage tests and backlog evidence. Regenerate with `node scripts/coverage-matrix.mjs`, `node scripts/delivery-report.mjs`, `node scripts/course-content-quality-report.mjs`, and `node scripts/audit-backlog.mjs`. For React quiz additions, regenerate the navigation metadata with `node scripts/build-learning-index.cjs`. Check the changed routes and run the relevant tests.
5. External publication is a separate decision. Use the local checkpoint for a same-PC account. For a separate cloud checkout, transfer the checkpoint through a user-approved Git push or an explicitly shared patch. Avoid relying on the cloud copy of `main` to contain local work. Keep real account credentials and service settings outside the handoff.

Content Creation days 14–16 use reviewed OpenStax writing sources (audience, organization, revision); see docs/curriculum-design/content-creation-14-16-source-review.md. Day 16 has a task-specific Self Reviewed rubric. Keep source-grounded explanations, worked before/after examples and clear independent tasks; do not invent factual claims or present exercise constraints as universal rules.

Content Creation days 17–23 are authored with source-checked editing, quotation, image, script, accessibility and licence lessons. See docs/curriculum-design/content-creation-17-23-source-review.md. The publication and final-project block (24–30) is now also authored. The user authorized pushing the prepared work to main in this session; verify remote state and checks before any push.

Content Creation days 24–30 are authored; source and validation evidence: docs/curriculum-design/content-creation-24-30-source-review.md. The course is complete against its 30-day authoring plan; this does not claim independent pedagogical review, live publication of learner projects or measured audience outcomes. User authorization to push prepared changes to main persists for this ongoing work; verify the remote and checks first.

English Foundations 11–14 source evidence and limits: docs/curriculum-design/english-foundations-11-14-source-review.md. Use the reviewed Saylor grammar references and check new rules before expansion. English examples remain English in all locales; original explanations are RU/TG/EN. Written checks do not establish pronunciation or listener understanding.
