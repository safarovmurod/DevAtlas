# Kotlin: structural and content review, 2026-11-17

Status: ACCEPTED WITH LIMITS by the coordinator after independent all-day review. This is an authored-content pass, not verified learner completion or Kotlin execution evidence.

## Scope and preservation

Reviewed all 30 scheduled lessons in `src/content/courses/kotlin.json`, including RU/TG/EN theory, guided examples, original quizzes, written questions, independent tasks, references, criteria and boundaries. The production loader in `src/lib/courses/content.ts` imports this exact JSON and validates it with `courseContentSchema`.

Preserved all 30 lesson IDs, days 1–30, ordering, prerequisiteDays and original lesson sourceIds. Preserved the texts, IDs, options, option order, correct indices and answers of all 58 original quiz questions, plus all three existing written interviews. Added 32 application/boundary questions, resulting in 90 quiz questions. Original guided examples and boundary experiments remain available in theory. No new days, routes, dependencies, backend operations or changes to learner progress were introduced.

Baseline was captured outside the checkout at `%TEMP%/devatlas-kotlin-baseline-20261117.json`. A final comparison against it checked the progress fields, all original quiz content and written interviews. Only this course JSON and this review document are owned by the course author; the integration owner handles shared tests and a course-specific runtime harness.

## Actual changes and audit

Added a fourth topic-specific theory section on every day, with practical analogies, boundary reasoning and concrete mistakes. Renamed generic section headings to identify the day's subject. Added explanatory feedback and real section anchors to all 90 quiz questions. Existing option ordering is preserved; appended questions balance correct-answer positions without moving original options.

Every day now has an independent task with a different scenario/behavior from its retained guided example, a complete reference, explicit expected output, and three checks: output, implementation, and a relevant edge case. Replaced criteria that repeated the entire task or an unrelated quiz hint with 60 concise implementation/boundary checks. Each reference ends in `// Expected output:` followed by comment lines. These expected values were traced statically; the comment is an expectation, not an execution receipt.

Specific review fixes: day 1 now explains `+=`/`-=` before independent use and states the Kotlin/JVM 1.9+ requirement; day 6's application question contains the exact conditional expression and branch labels; day 2's added questions separately cover overflow and use of a returned value. Day 26 explains `let`, smart casts and same-module/package sealed restrictions. Day 28 explains the nullable-element limit of a fallback. Day 29 assumes the existing list already satisfies its ID invariant. Day 30 checks equal titles with different IDs and separates in-memory behavior from persistence.

`python -I scripts/course-authoring/audit.py kotlin`:

| Metric | Before | After |
| --- | ---: | ---: |
| Scheduled lessons/days | 30/30 | 30/30 |
| Theory sections | 90 | 120 |
| Quiz questions | 58 | 90 |
| Days with fewer than 4 sections | 30 | 0 |
| Days with fewer than 3 questions | 30 | 0 |
| Days with missing quiz hints | 30 | 0 |
| Missing EN / copied TG=RU / broken criteria | 0/0/0 | 0/0/0 |
| Generic criteria / short solutions | 28/1 | 0/0 |
| Most common correct-answer index | 67% | 43% |
| Correct answer longest | 36% | 37% |
| Reference overlaps theory | 96% | 0% |
| Repeated generic headings | 92% | 0% |
| Browser auto-grading | 0 | 0 |

The audit measures structural heuristics. It does not establish pedagogical quality, translation independence or runtime correctness. Original trace-question distractors remain unchanged under the preservation contract; newly appended questions use topic-specific alternatives. Two old two-option questions also remain intact.

## All-day reference and edge review

Each row records a static review of the task/reference contract, not a compiler run. A slash separates printed lines.

| Day | Independent task | Expected output / edge evidence |
| --- | --- | --- |
| 1 | Till opening, sale and two refunds | `40 / 50 / 0`; opening binding retained |
| 2 | Delivery product with input and overflow checks | `28 / 0 / invalid / overflow`; distinct catches |
| 3 | Bottles shared among tables | `2 / 3 / 2.75 / 0.0`; conversion before division |
| 4 | Trimmed label | `[Ali] / 3 / false / 0`; spaces-only input |
| 5 | Admission and guarded division | `true / false / false / false`; zero divisor short-circuits |
| 6 | Taxi fare category | `invalid / local / local / long`; -1,0,5,6 |
| 7 | Delivery zone | `pickup / near / far / invalid`; 0,3,4,8 and -1 policy |
| 8 | Even station sum and empty range | `20 / 0`; `0 until 0` has no visits |
| 9 | Two-box shipping trips | `3 / 0 / 0`; nonpositive stock terminates immediately |
| 10 | Ticket zone and named arguments | `A:Ali / B:Sara / :`; explicit empty strings |
| 11 | Address fallback | `[Dushanbe] / [unknown] / []`; null differs from empty |
| 12 | Seat-count parsing | `8 / null / null / null`; zero, fraction, overflow |
| 13 | Route indices | `Dushanbe / missing / missing`; size and empty-list indices |
| 14 | Alias and snapshot | `pen,book / 0 / false`; clear and missing removal |
| 15 | Map presence and stock | `true / false / 0 / book,pen`; existing zero differs from missing |
| 16 | Permission intersection | `write / 2 / 0`; + preserves original set |
| 17 | Apply a function three times | `11 / 2 / 0`; identity and constant lambdas |
| 18 | Positive quantities doubled | `6,10 / 3,-2,0,5 / 0`; source retained and empty input |
| 19 | Balance with initial 100 | `115 / 100 / 0`; empty changes and refund |
| 20 | Length and name ordering | `Bo,Ali,Zed,Sara / Sara / 0`; tie-break and source retained |
| 21 | Parcel invariant and exact area | `30 / 0 / invalid / overflow`; constructor versus result checks |
| 22 | Product data-class copies | `12 / 15 / true / false`; equality versus identity |
| 23 | Encapsulated stock counter | `true / true / false / false / 3`; zero, negative and overflow |
| 24 | Two price-source implementations | `10 / 0`; unchanged caller and empty source |
| 25 | Delivery enum fees | `10,5,0`; adding PAUSED must require a branch |
| 26 | Typed seat results | `count=3 / error=invalid seats / error=invalid seats`; trim and rejection |
| 27 | Packing exception boundary | `5 / invalid / cleanup`; after-error print is unreachable |
| 28 | Generic fallback extension | `7 / 0 / none`; Int/String typing and empty lists |
| 29 | Task insertion contract | `7:Stock\|9:Pack / 1 / rejected / rejected / rejected / 1`; duplicate, nonpositive ID, blank title and empty input |
| 30 | Complete/remove by unique ID | `9:true,12:true / Checks passed`; equal titles, source retained, idempotence, unknown ID, empty input and deletion predicate mutation |

The additional guided boundary experiments remain optional learner experiments. Negative compilation examples (val reassignment, private setter, missing enum branch), changed-input demonstrations and day-30 mutation testing have NOT been executed here.

## Sources actually opened and read

Access date: 2026-11-17. Technical explanations and examples are authored for DevAtlas; no documentation prose, source sample, media or PDF was imported. The Kotlin guide is rolling documentation; API pages identify Kotlin 2.4, while the course intentionally uses stable constructs available in Kotlin/JVM 1.9+. `Enum.entries` sets that lower bound. JVM-only `java.lang.Math.multiplyExact` is checked against Java SE 17, not presented as a Kotlin/JS or Native API.

| Exact URL | Claims checked | Days |
| --- | --- | --- |
| https://kotlinlang.org/docs/basic-syntax.html | main, val/var, functions, basic control syntax | 1–10 |
| https://kotlinlang.org/docs/command-line.html | kotlinc -include-runtime -d and java -jar; JDK/JVM console context | 1–30 |
| https://kotlinlang.org/docs/numbers.html | Int range, integer division, explicit numeric conversion | 2–3,12,21,23 |
| https://kotlinlang.org/docs/strings.html | immutable strings, templates, indexing | 4,10 |
| https://kotlinlang.org/docs/characters.html | UTF-16 code units versus whole Unicode characters | 4 |
| https://kotlinlang.org/docs/control-flow.html | expression branches, first matching when, loops | 5–9,25–27 |
| https://kotlinlang.org/docs/functions.html | parameters, returned values, named arguments and defaults | 2,10,17 |
| https://kotlinlang.org/docs/null-safety.html | nullable types, safe call, Elvis and not-null assertion | 11–12,26,28 |
| https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-int-or-null.html | signed decimal parsing, invalid syntax, overflow, whitespace | 12,26 |
| https://kotlinlang.org/docs/collections-overview.html | List/Set/Map semantics; read-only differs from immutable | 13–16 |
| https://kotlinlang.org/docs/lambdas.html | function types, lambda results, sequential invocation and fold | 17–19 |
| https://kotlinlang.org/docs/collection-transformations.html | map preserves order and returns transformed values; joinToString | 18,29–30 |
| https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fold.html | left-to-right accumulator and empty-input initial value | 19,24 |
| https://kotlinlang.org/docs/collection-ordering.html | sorted output, comparators, thenBy | 20 |
| https://kotlinlang.org/docs/classes.html | constructor properties and init | 21 |
| https://kotlinlang.org/docs/data-classes.html | generated equality, constructor properties, shallow copy | 22,29–30 |
| https://kotlinlang.org/docs/properties.html | private setter visibility; validation remains a method responsibility | 23 |
| https://kotlinlang.org/docs/interfaces.html | override and interface capabilities | 24 |
| https://kotlinlang.org/docs/enum-classes.html | finite variants, entries and exhaustive handling | 25 |
| https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/-enum-entries/ | EnumEntries is available since Kotlin 1.9 | 25 |
| https://kotlinlang.org/docs/sealed-classes.html | direct implementations in the same module/package; exhaustive narrowing | 26 |
| https://kotlinlang.org/docs/exceptions.html | require versus check exceptions, catch and finally | 2,21,27,29–30 |
| https://kotlinlang.org/docs/generics.html | type parameters retain input/result relationships | 28 |
| https://kotlinlang.org/docs/extensions.html | extensions have no private-member access and resolve statically | 28 |
| https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Math.html#multiplyExact(int,int) | ArithmeticException for int multiplication overflow | 2,21 |

Nine supplemental official source URLs were appended to course.sources. Existing lesson sourceIds remain unchanged for preservation; this table gives the supplemental claims/day mapping.

License check: opened https://github.com/JetBrains/kotlin-web-site/blob/master/LICENSE and read the Apache License 2.0 identification. The Kotlin API footer also identifies Apache 2 licensing. This establishes the checked repository/API license context, not a claim that every externally linked article or image has that license. Oracle documentation is used only as a factual reference; no Oracle text/code is republished.

Lookup limitation: the initially tried enum helper URL `https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/enum-entries.html` was not used for the version claim; the valid `-enum-entries/` type page above explicitly supplies Since Kotlin 1.9.

## Verification and remaining limits

- `python -I scripts/course-authoring/audit.py kotlin`: passed with the final metrics above.
- `npx vitest run tests/course-content.test.ts`: 1 file, 3 tests passed after the ID fix and again after final criterion/source additions.
- Baseline-preservation comparison: passed for all 30 progress identities, original lesson sourceIds, all 58 original quiz contents/options/order and all three written interviews.
- Duplicate-ID issue during drafting: a temporary authoring script reapplied two new boundary objects and collided in the global question namespace. The final fresh-JSON cleanup removed only repeated new objects and gave them unique `-boundary-check` IDs. Original objects were preserved. The authoring script is no longer used; the real schema retest passed.
- Compiler inventory: no `kotlinc` or `kotlin` on PATH or in the scoped known installation directories. Java JDK 17 is present. No compiler, IDE or dependency was installed, and no external compilation service was used.
- Kotlin compilation, all 30 guided executions, all 30 reference executions, changed-input/negative/mutation runs: **UNVERIFIED**. Static tracing and schema success cannot substitute for these runs. The integration owner can run the supplied Kotlin harness when a compiler becomes available.
- RU/TG/EN reviewed for meaning and task/output consistency by the author; no independent native-speaker translation review claimed. The coordinator independently read the 30-day content. Final acceptance remains the coordinator's decision.
- Browser/mobile rendering was not exercised by this course author. The coordinator separately reported desktop/mobile inspection of Kotlin day 30, wrong/correct quiz feedback surviving reload, and feedback links targeting section 3. This is coordinator evidence, not Kotlin runtime execution or all-day UI coverage. Full tests/build/lint/typecheck and generated aggregate reports belong to integration.

## Runtime follow-up with Kotlin 1.9.24

Root obtained the official JetBrains portable compiler and verified its release SHA-256. It runs from a temporary folder with Microsoft OpenJDK 17. Root independently compiled and executed all 30 guided examples and all 30 independent solutions, and confirmed that the reversed deletion predicate fails the final project's checks.

The shared verifier now handles a Windows `kotlinc.bat` by launching the compiler through Java with an argument array. It uses `org.jetbrains.kotlin.cli.jvm.K2JVMCompiler`, the compiler distribution's `lib/*` classpath and `-kotlin-home`. Unix compiler commands retain direct execution. The test probe and verifier use the same invocation logic.

With explicit `KOTLINC` and `JAVA` paths, `npx vitest run tests/kotlin-course.test.ts` passed all 3 tests in 36 seconds. The runtime test executed 30 guided examples, 30 independent solutions, both day 2 boundary fixtures and a broken-deletion fixture. A deliberately nonexistent `KOTLINC` path returned an error. An optional undiscovered toolchain probe returned the documented skip status. No compiler files or dependencies were added to the repository.

No commit, push, PR, merge, deployment, database change or settings/dependency change was performed.
