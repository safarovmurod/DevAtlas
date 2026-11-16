<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## DevAtlas curriculum handoff — 2026-11-17

Use the existing checkout at `D:/Проектҳо/DevAtlas`; inspect git status, recent commits, open PRs and their actual head SHAs before editing. The old OneDrive react-mentor path is stale. [Current loader-based audit](docs/audits/course-quality-2026-11-17.md) supersedes stale gaps in the dated 2026-11-15 report.

### Saved authored coverage

- Five Starter courses contain 147 scheduled lessons: Content Creation 30, English Foundations 42, Digital Literacy 30, Personal Productivity 22, Management Foundations 23. Targets remain in docs/curriculum-design/short-courses.draft.json.
- Actual loader inventory: 43 courses, 38 tracks, 1255 scheduled days, 42 stages with published curricula and 72 missing stages. Authored availability is not Verified learning completion.
- React already has at least four theory sections and three questions on all 60 days. Next.js has four sections and at least three questions on all 20 days, including distinct RU/TG/EN for days 1–12. Preserve these authored additions; do not recreate the stale React40/Next12 gaps.
- TypeScript retains its complete authored 14-day block. Further continuation and the other four 14-day programs still require review against their accepted plans.
- Digital Literacy 10–30 is authored. Source evidence: docs/curriculum-design/digital-literacy-10-30-source-review.md.

### Resume here

Current complete-loader review queue: docs/audits/continuation-quality-2026-11-17.md and its JSON (28 structural-gap courses,29 including Management authoring,38 priority courses including heuristics). Read exact coordinates and distinguish observed omissions from review candidates.

Continue management-foundations at day 24 using docs/curriculum-design/short-courses.draft.json. 7 short-course days remain. Reuse docs/curriculum-design/management-foundations-24-30-recovered.draft.json as an unreviewed draft rather than reauthoring it. Review missing project rubrics in Management days16/23. Preserve all authored lessons, quiz options and progress IDs. Recheck current loaders before editing other courses.

Preserve existing lesson IDs, day order, prerequisites, quiz IDs and original option order. Keep original RU/TG/EN explanations, useful linked feedback, independent practice and task-specific rubrics. Self Reviewed never proves actual device/account operations, real team outcomes, pronunciation or independently assessed mastery. Only count lessons loaded by the application.

After count changes synchronize catalog-other.ts, localized scope copy and tests. Regenerate coverage-matrix.mjs, delivery-report.mjs, course-content-quality-report.mjs and audit-backlog.mjs; check blueprint, schema, relevant routes and tests. React navigation metadata only needs rebuilding after changes to React quiz content.

The latest owner request is to save the work to this point and write one continuation prompt. Read docs/CURRICULUM-CHECKPOINT-2026-11-17.md and docs/CURRICULUM-RESUME-PROMPT-2026-11-17.md. No PR was opened or pushed. An older Digital-only PR-preparation worktree exists; do not overwrite this owning checkout with it. External publication is a separate operation. Keep credentials/settings outside handoffs.

### Source provenance to retain

- Content Creation 14–16, 17–23 and 24–30: the corresponding source-review files in docs/curriculum-design document OpenStax, W3C WAI, Creative Commons, original examples and Self Reviewed limits.
- English Foundations 11–14 and 15–42: source-review files record Saylor/CMU checks, original explanations and written/oral-practice limits. Do not recreate finished English lessons or claim measured listening/pronunciation.
- UX Design day19 contains the owner-supplied twelve design principles as original lesson text, twelve questions and practice. The PDF is not committed or published. Day21 fixes contrast/keyboard examples. Preserve existing options/IDs; see docs/curriculum-design/design-principles-source-review.md.
