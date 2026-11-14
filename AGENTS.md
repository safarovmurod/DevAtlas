<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## DevAtlas curriculum handoff — 2026-11-15

The current project is `D:/Проектҳо/DevAtlas`. The former OneDrive Desktop `react-mentor` path is stale. Use the existing checkout and inspect `git status --short --branch` and `git log -5 --oneline` before editing. Start with the saved curriculum checkpoint in that checkout and consult [the dated audit](docs/CURRICULUM-AUDIT-2026-11-15.md).

### Work already saved

- Five existing Starter courses now contain 63 scheduled lessons: Content Creation 13, English Foundations 10, Digital Literacy 9, Personal Productivity 22, Management Foundations 9. That is 53 new days and 10 revised introductory days. Existing lesson IDs, prerequisites, quiz IDs and original option order were kept. Catalog copy, introductory duration, tests and generated reports reflect the actual lessons.
- TypeScript days 1–14 now have four theory sections, three questions with linked hints and independent practice. Reference exercises were checked locally through TypeScript and Node.js. The strict-diagnostics day remains a written exercise backed by a local program.
- Next.js days 13–20 were expanded in RU/TG/EN. They cover React interview practice and the project sequence through loading/error states and release checks. Next.js still has 20 scheduled days and existing question IDs were kept.
- React has at least three quiz questions on all 60 days. The previously thin eight days received 16 new questions and deeper theory across nine topics. Core days 1–5 were also deepened. Together these edits add 30 theory sections. 40 React days still have fewer than four sections. Existing topic IDs, plan order and progress identifiers stay valid.
- Source inventory at the checkpoint: 43 courses, 38 tracks, 1,171 scheduled days, 42 stages with published curricula and 72 missing stages. For current counts, use the application loaders and generated coverage reports.

### Resume here

1. Personal Productivity now has all **22 planned days** authored in RU/TG/EN. Days 19–22 add daily review, weekly retrospective, one testable improvement and the final learning-system project. Each day has four sections, three questions and independent written practice; the capstone distinguishes Self Reviewed from independent assessment. Existing lesson and progress IDs are preserved. Content Creation days **10–13** are also authored with four sections, three questions and independent written practice each. Resume **Content Creation days 14–16**, the next module in [the outline](docs/curriculum-design/short-courses.draft.json), then continue the remaining unfinished courses. Do not recreate the completed Personal Productivity lessons.
2. After that, continue only the actual unfinished work in the [dated audit](docs/CURRICULUM-AUDIT-2026-11-15.md) and [coverage matrix](docs/coverage-matrix-20261024.md). The next module starts at day 14 in Content Creation and day 10 in Digital Literacy and Management Foundations, and at day 11 in English Foundations. Next.js days 1–12 still need distinct RU/TG/EN content. React still has theory gaps outside this checkpoint. Reuse the finished lessons, tests and data instead of authoring them again.
3. Keep new lessons sequential and preserve existing IDs, choice order and progress. Use original RU/TG/EN material, subject-specific examples, useful quiz feedback and independent practice. Only count lessons that exist in the actual loader. Consult [the authoring guide](docs/course-authoring-prompt.md) for the content contract.
4. When counts change, synchronize `catalog-other.ts`, localized copy if needed, catalog/coverage tests and backlog evidence. Regenerate with `node scripts/coverage-matrix.mjs`, `node scripts/delivery-report.mjs`, `node scripts/course-content-quality-report.mjs`, and `node scripts/audit-backlog.mjs`. For React quiz additions, regenerate the navigation metadata with `node scripts/build-learning-index.cjs`. Check the changed routes and run the relevant tests.
5. External publication is a separate decision. Use the local checkpoint for a same-PC account. For a separate cloud checkout, transfer the checkpoint through a user-approved Git push or an explicitly shared patch. Avoid relying on the cloud copy of `main` to contain local work. Keep real account credentials and service settings outside the handoff.
