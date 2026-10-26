# Browser SQLite practice pilot

SQL day 1 uses actual SQLite via `sql.js` 1.15.1 (MIT; upstream SQLite is public domain), matching the course's dialect. It does not silently substitute PostgreSQL. The existing editor and saved drafts are reused. Other SQL days remain local CLI practice until their own graders are authored.

On explicit Run, a disposable classic Web Worker loads same-origin packaged JS/WASM. It creates a fresh in-memory database. The main application server never executes learner SQL. There is no production database, account token, persistent filesystem, extension bridge or JavaScript function exposed to submitted SQL.

The source is limited to 32 KiB UTF-8. Startup has a 20-second deadline; execution has a 5-second deadline controlled by the main thread, which terminates the worker. The Stop button and component/account cleanup also terminate it. SQLite's hard heap limit is set to 16 MiB, main database pages to 512, and result collection to 32 rows with at most 2000 characters/bytes per value. This limits SQLite allocations, not the browser process's total memory. The SQL PRAGMA hard heap limit cannot raise an already lower limit. Workers are discarded after results; an old result is hidden after draft edits and cannot cross account scopes.

Seven objective checks execute the submitted script and reuse its actual last result-producing statement against changed datasets: initial Tea/36, required schema, Coffee/21 with a distractor row, Free/0, absent id=1, negative-price rejection and NULL-name rejection. Equivalent arithmetic and output aliases are accepted. A hard-coded Tea/36 answer and an omitted WHERE do not pass the changed fixtures. Syntax errors and expected/actual values come from the real engine.

These are local automatic SQL behavior checks. They do not mint server attestations, Mastered, certificates or premium access. The existing separate rubric remains Self Reviewed, including explaining the result in the learner's own words. Production verified SQL would require a separately isolated trusted runner; client claims are never accepted as proof.

`scripts/prepare-sqlite.mjs` packages the pinned runtime, author/license notices, bundled worker and a SHA-256 manifest under generated `public/sqlite/` assets during predev/prebuild. No third-party CDN is requested. Research references: the installed upstream [sql.js README/API documentation](https://github.com/sql-js/sql.js), MIT LICENSE, and the existing course's SQLite documentation source. Grader, UI and exercises here are original.

Validation includes real WASM unit tests for alternate solutions, changed fixtures, constraints, syntax and fresh attempts; Playwright exercises the real browser worker on desktop/mobile, terminates an infinite recursive query and then successfully runs another attempt. Live Vercel HTTP and a trusted production runner remain separate checks.
