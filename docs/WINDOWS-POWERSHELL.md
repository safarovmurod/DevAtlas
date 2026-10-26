# Windows / PowerShell validation

Use a normal user terminal in the repository. The CI matrix tests Windows Server 2022 x64 with Node 22/24 and both Windows PowerShell 5.1 (`powershell`) and PowerShell 7 (`pwsh`), including repository and temporary paths containing spaces and Tajik characters. Read the actual job results before claiming a combination passed. Linux PowerShell testing does not replace these Windows jobs.

Install Node 22 or 24 LTS and Python 3.12. JDK 21 is needed for the Java example checks; other language SDKs are optional and their unavailable checks are reported as skipped, not successful execution. Git Bash can provide the real Bash runtime. Playwright installs its own Chromium if a configured/system browser is not available.

```powershell
cd 'D:\Projects with spaces\DevAtlas'
npm.cmd ci
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-platform.ps1 -SkipInstall
```

For PowerShell 7, use `pwsh.exe` in the last command. The explicit process option applies only to this reviewed local script invocation; no machine/user execution policy is changed. Using `npm.cmd` and `npx.cmd` avoids selecting the `npm.ps1` shim, so ordinary Node commands need no PowerShell policy change. Organization-managed policy remains applicable.

The script stops immediately on failed native commands and returns their nonzero exit code. It checks generated reports, lint, TypeScript, Vitest/native example tests, Python importer tests, production build, real Chromium desktop/mobile flows and mock-auth regressions. Use `-Phase checks` or `-Phase browser` for a targeted rerun; the default `all` runs both. `-SkipInstall` assumes dependencies already match the lockfile.

Individual commands also work without a PowerShell script:

```powershell
node scripts/coverage-matrix.mjs --check
node scripts/delivery-report.mjs --check
node scripts/check-short-course-blueprints.mjs
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
node scripts/run-python-tests.mjs
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
npm.cmd run test:auth
```

Python discovery executes a Python version probe, rejects Windows Store aliases/old interpreters and supports `python`, `python3` and `py -3`. Launcher prefix arguments are retained for actual execution. Importer tests require a real Python 3.10+ interpreter and fail explicitly if it is absent. Child processes use UTF-8; expected text normalizes CRLF without weakening result comparisons.

Screenshots use Playwright's per-test output paths. The default result directory is the operating system's writable temporary directory; optionally set `$env:PLAYWRIGHT_OUTPUT_DIR = Join-Path $env:TEMP 'devatlas-results'`. The Windows jobs retain failed browser traces for seven days with separate names for every matrix combination.

The portable cloud PowerShell used for local shell validation was downloaded from the official PowerShell GitHub release and checked against its SHA-256 manifest (the upstream manifest is UTF-16). A restricted Linux workspace may need XDG cache/config/data directories under its writable workspace. These local environment choices are not required Windows paths and are not proof of a Windows run.
