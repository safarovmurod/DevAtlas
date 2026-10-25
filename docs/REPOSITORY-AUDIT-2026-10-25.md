# Repository audit — 2026-10-25

Baseline: `main` at `875a405d6e685f518f226ff9bd390f047f4f77ed` (merged Kotlin PR #8).
The audit covers the complete baseline tracked-file inventory, not only that PR.
It identifies the checks performed; it is not a guarantee that every line is
defect-free or that external production services have been exercised.

## File and content coverage

- **365/365 baseline tracked paths** are present. The per-file methods are listed
  in [the inventory](audits/2026-10-25-file-inventory.csv).
- All tracked JSON files parse; JavaScript entrypoints pass Node syntax checks;
  Python files parse. All **223 baseline TypeScript files** are included in the
  compiler's file list; none are outside the repository typecheck.
- Relative Markdown file links resolve. Binary assets are inventoried rather
  than described as manually reviewed documents or executed programs.
- All **43 catalog courses** load, including React and Next.js from their actual
  TypeScript-backed application sources. The actual schedule is **894 days
  including React**, **834 excluding React**.
- All **20 downloadable course artifacts** are referenced: no missing or orphan
  download was found. The existing provenance test checks their bytes and SHA-256
  digests against the course manifests.

The new audit helpers, regression tests and this report are additional files
created by the fixes; the 365 count describes the baseline, not the new tree.

## Confirmed findings and fixes

| Finding | Evidence before the fix | Fix |
|---|---|---|
| High-severity Zod advisory in a production dependency | `npm audit --omit=dev` identified GHSA-mrhx-c7xc-m3w5 in Zod 4.6.5. | Require at least 4.6.6; lockfile resolves 4.6.7. |
| Vulnerable Undici in the test dependency tree | Full `npm audit` identified GHSA-4qv8-2p9j-2685, GHSA-f72v-6w45-q472 and GHSA-xjj6-f33q-929c in 8.11.2. | Override to patched 8.12.2; keep lockfile integrity checks. |
| Two real courses omitted from audit coverage | The content audit covered 41/43 courses, while the track report printed `file missing` for React/Next.js. | Both scripts use the application's loaders and React plan. Missing/broken courses fail the report. |
| Total labeled as excluding React actually included its 60 days | The old track report printed 894 under the excluding-React label. | Print separate totals: 894 including and 834 excluding React. |
| Library questions inflated scheduled-day quiz density | The numerator included unscheduled reference questions. | Calculate quiz/day from scheduled assignments only; retain distinct question totals separately. |
| Tajik scope claims could evade the old case-sensitive matcher | Capitalized `Рӯзи` was not recognized. | Recognize both cases, with a regression test. |
| Existing Python tests omitted from CI | Vitest only discovers TS/TSX tests; the workflow never invoked the two Python test files. | Add Python unittest discovery to CI. All 10 tests pass locally, including PDF extraction. |
| Compatibility CLI reported killed builds as successful | The react-scripts shim converted a null child exit status to zero, including signal termination and spawn errors. | Propagate spawn errors and return nonzero for terminated builds; four subprocess regression cases cover the exit statuses. |
| Handoff instructions still requested rebuilding the completed Kotlin course | The continuation document still described Kotlin as two days and referenced the older checkpoint. | Update to the merged 30-day state, correct totals and retain Mobile as unfinished. |

CI now also runs `npm audit --audit-level=high`, so known high/critical dependency
advisories cannot silently pass the normal validation job.

## Validation

Executed in the prepared Linux cloud machine with Node 24:

- Frozen installation: `npm ci` using the updated lockfile.
- `npm audit --audit-level=high`: **0 vulnerabilities** across production and
  development dependencies.
- `npm run typecheck` and `npm run lint`: passed.
- `KOTLINC=/workspace/tooling/bin/kotlinc npm run test`: **386 passed, 7 skipped**,
  all 54 test files passed. This includes all 30 real Kotlin/JVM examples and the
  new audit regression tests.
- `python3 -m unittest discover -s tests -p '*_test.py' -v`: **10 passed**.
- Production build: `npm run build` passed. The built server returned all 43
  courses ready, Kotlin with 30 lessons, Next.js with 20, and the home page with
  HTTP 200. Anonymous premium access returned 401 with `no-store`.
- The compatibility entrypoint also completed a real production build with
  `node bin/react-scripts.js build` and returned success only after Next.js exited.
- Both documented reporting commands execute successfully and include every
  catalog course. The CLI regression test checks the totals and TypeScript sources.

The PR workflow separately runs desktop/mobile E2E and mock authentication using
Node 22. Refer to its actual checks for the final remote outcome; local HTTP
smoke checks are not described as a complete browser regression run.

## Remaining scope and limits

- The regenerated [content report](SELF_LEARNING_CONTENT_AUDIT.md) still flags
  short theory, sparse quizzes and historical scope wording. These are visible
  editorial tasks, not missing files or completed course expansions.
- Mobile, Backend and other short introductory modules remain at their real
  published sizes. Future roadmap phases have not been silently marked complete.
- Kotlin's original days 1–2 remain unchanged, as required. Their historical
  two-day wording is still reported rather than suppressed.
- The seven local Vitest skips are SDK-dependent or explicitly unexecuted
  language examples. A skipped check is not execution evidence.
- Supabase/OAuth, payments and paid AI still require their separate live-service
  setup. Mock tests do not establish those production integrations.
- Production Vercel for the baseline reported success, but direct cloud requests
  to its domains were blocked by proxy CONNECT 403. This audit does not claim a
  successful live-page check through that restriction.
