# Pending curriculum batches: independent review, 2026-11-17

Local-only review. No commit, push, PR, merge, deploy, stash, reset or clean. Course counts and completion claims in older handoffs are not current evidence. Structural validity does not certify lesson semantics or learning outcomes.

## Review scope and ownership

- Reviewer `/root/pending_batch_review` read the new English sections, questions and hints for all 30 days of Java, C# and Rust against the real task/reference context. Exact affected RU/TG/EN fields were inspected for the findings below. This is not a sentence-level independent native review of all translations.
- A read-only comparison of all nine pending JSON courses against HEAD preserved lesson IDs, day order, prerequisites, existing quiz IDs, question/answer/options/correctIndex and practices. Rust day15 section1 prose changed; Swift existing sections changed on days4,8,12,13,16,19,21,23,25 and require specific review. A later review may add findings; no blanket acceptance of these edits is implied.
- Root independently reviewed the new SQL, Node.js and MongoDB diff and supplied findings below. PHP, Ruby and Swift semantic review remains in progress; Backend Pro's already committed batch/source-review is not independently accepted here.
- Java repair ownership was explicitly transferred to this reviewer after the initial findings. Root then independently reviewed all four repaired RU/TG/EN sections and the day1 question/hint, and accepted this limited repair batch. C#/Rust repairs are delegated next; this reviewer must not approve its own repairs.

## Structural delta observed against HEAD

| Course | Added sections | Added questions | Existing questions given hints | Original data change found |
| --- | ---: | ---: | ---: | --- |
| java | 30 | 30 | 60 | None before review repairs |
| csharp | 30 | 30 | 60 | None |
| rust | 30 | 30 | 60 | Day15 original section1 prose |
| php | 2 | 30 | 60 | None |
| ruby | 30 | 30 | 60 | None |
| sql | 14 | 30 | 52 | None |
| nodejs | 9 | 30 | 53 | None |
| mongodb | 13 | 30 | 52 | None |
| swift | 30 | 28 | 62 | Original sections at coordinates above |

## Findings and repair status

All section indexes below are zero-based JSON indexes. Findings identify new content unless marked otherwise. Each language version requires the same factual repair.

### Java: four authored repairs, independently accepted by root with limits

1. **J1, day1 `sections[3].body` and `questions[id=java-day-01-q3]`, RU/TG/EN.** The new content required public `Main` to be in `Main.java` while the lesson's actual command is source-file launch, `java Main.java`. The intended error experiment therefore did not produce the claimed filename error. JDK21 launcher docs explicitly exempt source-file mode from this restriction. Fix: distinguish `javac Hello.java` from `java Hello.java`; make q3/hint explicitly about `javac`. Root independently reproduced `java Hello.java` output `36` and `javac Hello.java` filename failure on JDK17. **REPAIRED; independently accepted by root after RU/TG/EN read and JDK17 focused execution.**
2. **J2, day8 `sections[2].body`, RU/TG/EN.** Arrays were called pass-by-reference; Java passes a copy of the reference value. Fix: distinguish element mutation from rebinding the parameter. Root independently verified element mutation is visible but parameter reassignment does not reassign the caller. **REPAIRED; independently accepted by root after RU/TG/EN read and JDK17 focused execution.**
3. **J3, day10 `sections[2].body`, RU/TG/EN.** The chain `trim().toLowerCase().startsWith("d")` was said to return a new String at every step; `startsWith` returns boolean. The quote escape example also lacked the necessary displayed backslash. Fix: name each return type and retain the original String. Root independently ran a boolean result and unchanged-source case. **REPAIRED; independently accepted by root after RU/TG/EN read and JDK17 focused execution.**
4. **J4, day18 `sections[2].body`, RU/TG/EN.** The exercise referred to the day12 `withdraw` method, but day12 Account contains only `deposit` and `getBalance`. Fix: explicitly add a new method and custom exception constructor, reject invalid withdrawal, and test 500−100=400. Root independently executed both rejected calls and successful withdrawal. **REPAIRED; independently accepted by root after RU/TG/EN read and JDK17 focused execution.**

Sources actually read for J1/J2: [JDK21 java launcher](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html), source-file mode; [Oracle parameter passing](https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html), reference data parameters are also passed by value. Local JDK found: Microsoft OpenJDK17.0.20. JDK21-specific execution is not claimed.

### C#: four repairs independently accepted with limits

1. **C1, day10 `sections[1].body`, RU/TG/EN.** `Book b;` was described as containing null and crashing on the first call. This is an unassigned local: reading it is a compile error (CS0165), not a null dereference. The same section incorrectly suggests record assignment copies differently from class assignment; a record class is still a reference type. Fix: distinguish an unassigned local from explicit nullable `Book? b = null;`, and record class from record struct. Acceptance: compile the unassigned negative case and run an explicit null/record-alias case.
2. **C2, day22 `sections[1].body`, RU/TG/EN.** The proposed `Sum` on `new List<string>()` has no applicable direct string-summing overload. `Max` over an empty reference-type sequence returns null, contradicting the unqualified claimed exception. Fix: use empty `List<int>` with exact 0/exception outcomes and explicitly explain nullable/reference overload behavior. GroupBy's source is buffered before groups are yielded; it is not one independently lazy group at a time. Acceptance: numeric empty Sum/Max, string Max, length-selector Sum, and grouping enumeration cases.
3. **C3, day6 `sections[1].body`, RU/TG/EN.** In a switch expression an unguarded `>=60` arm above `>=90` makes the latter unreachable; the compiler rejects it (CS8510), rather than misclassifying an excellent mark at runtime as claimed. Fix: state compile rejection, distinguish from if/else shadowing, keep boundary tests. Acceptance: negative switch compile and equivalent if/else behavior.
4. **C4, day13 `sections[1].body`, RU/TG/EN.** `: base(...)` was placed in the class header, whereas the course uses ordinary constructors. It belongs on the derived constructor declaration. Primary-constructor base syntax is different and was not taught here. Acceptance: a derived constructor calling its base with an argument compiles.

Sources actually read: [C# variable specification, definite assignment](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/variables); [Enumerable.Max](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.max?view=net-10.0), empty reference-type result; [constructors](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/using-constructors); [switch expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/switch-expression). `dotnet` was not found in this shell; no local SDK execution is claimed by this reviewer.

### Rust: four repairs independently accepted with limits

1. **R1, day3 `sections[3].body`, RU/TG/EN.** `checked_mul` was said to return Result. The actual signature returns `Option<i32>`; day2 converts it with `ok_or` to Result. Fix: separate the two steps. Acceptance: signature/source check; execute success/overflow when rustc exists.
2. **R2, day9 `sections[3].body`, RU/TG/EN.** `days[5]` on a known three-item array was said to compile then panic. The default `unconditional_panic` lint rejects this constant out-of-bounds access; the existing practice already correctly distinguishes constant access from a runtime index. Fix: align the new prose with that distinction. Acceptance: literal negative compile and runtime-supplied index panic.
3. **R3, day21 question2 `hint`, RU/TG/EN.** The new hint says indexing cannot check bounds. Indexing checks and panics on invalid bounds; `get` returns Option instead. Fix: describe both outcomes accurately without replacing existing question/options. Acceptance: invalid indexing vs `get` observation.
4. **R4, day27 `sections[3].body`, RU/TG/EN.** It says the language does not distinguish own and foreign traits. Coherence/orphan rules explicitly depend on whether the trait/type is local. Fix: explain the beginner boundary without implying foreign-on-foreign impl is allowed. Acceptance: own trait implementation passes; foreign trait on foreign type fails coherence.

Sources actually read: [i32 checked_mul API](https://doc.rust-lang.org/std/primitive.i32.html#method.checked_mul); [deny-by-default unconditional_panic](https://doc.rust-lang.org/rustc/lints/listing/deny-by-default.html#unconditional-panic); [Rust implementation coherence](https://doc.rust-lang.org/reference/items/implementations.html#trait-implementation-coherence). `rustc`/`cargo` were not found; runtime verification remains UNVERIFIED.

### Root-supplied SQL / Node.js / MongoDB findings, not repaired here

These are coordinator independent-review evidence, not this reviewer's own execution claims. Keep exact course source coordinates and recheck after owner fixes.

- **SQL day20 section1:** CASE without ELSE yields NULL; these rows form a NULL grouping key, rather than disappearing from GROUP BY. Root reproduced the NULL group in SQLite3.49.1.
- **SQL day23 section1:** the unqualified claim that a new CHECK cannot be added through ALTER and existing rows remain unchecked is false for supported `ADD COLUMN ... CHECK` since SQLite3.37; root reproduced `CHECK constraint failed` against old rows.
- **SQL day26 section1:** modern SQLite rewrites dependent view definitions on RENAME COLUMN rather than necessarily breaking views; root reproduced a working view after rename.
- **SQL day18 section1:** WHERE aliases do not behave identically in every SQL database; qualify SQLite's extension and teach portable form.
- **Node.js day7 section1:** `path.join` alone does not make a relative path independent of cwd; root confirmed a relative join stays relative. Base it on a known absolute module/application path.
- **Node.js day5 q3:** the claim npm install without package.json creates an empty package.json remains a verification candidate, not accepted fact. Verify in an isolated offline fixture and against npm docs.
- **MongoDB day28 q3:** odd node count does not always guarantee an available election majority; reachable healthy voting quorum is required.
- **MongoDB day25 section1:** placing `$match` before `$group` can change totals; state which filtering semantics are intended and whether the transformation is equivalent.

Root's sources: [SQLite ALTER TABLE](https://www.sqlite.org/lang_altertable.html), [SELECT](https://www.sqlite.org/lang_select.html), [MongoDB elections](https://www.mongodb.com/docs/manual/core/replica-set-elections/).

## Verification and remaining scope

- Root baseline full suite before repairs: **116 files, 925 passed, 8 skipped, 0 failed** (coordinator report). It does not detect the factual defects above.
- Root after Java four fixes: `programming-intros`: **5 passed, 7 skipped, 0 failed**; exact four repair scenarios independently executed. No full-course semantic certificate follows.
- Source-review documents were read for Java, C#, Rust. They describe structural authoring and previous checks, but their own blanket claims did not catch the findings above. Preserve their provenance and append correction evidence rather than deleting them.
- Existing practice and references were preserved. Unchanged type-along/trust-example practice does not establish the requested full independent-practice acceptance. Full task/solution completion, task-specific rubrics, sentence-level RU/TG/EN review, runtime evidence and review of unchanged mistakes remain separate outstanding work.
- The review read the new English sections, questions, hints and task context for all 30 days of PHP and Ruby. Their remaining fixes appear below. Swift and Backend Pro still need semantic review. Root independently accepted the scoped Java, C# and Rust repairs.

## 2026-11-17 continuation: authored C# / Rust repairs

Root delegated authoring the four C# and four Rust fixes above after independent review identified them. Root accepted the RU/TG/EN fixes for C# days 6, 10, 13 and 22 and Rust days 3, 9, 21 and 27. Runtime execution remains pending. Rust edits on days 3, 9 and 27 are in section index 3.

## PHP repairs independently accepted with runtime checks

- **P1 day2 section3 body and q3**: missing return is described as invariably returning null, but this day teaches `total(...): int`. Removing its return raises TypeError. Qualify the untyped-function example, explicitly distinguish the typed-return requirement, and adjust q3/hint accordingly. Evidence: actual reference has `: int`; PHP return-type contract at https://www.php.net/manual/en/language.types.declarations.php and https://www.php.net/TypeError . Acceptance: untyped missing-return yields null; typed-int missing-return fails with TypeError. PHP interpreter absent, so execution remains unverified here.
- **P2 day4 q2 hint (all locales)**: says strlen counts characters, contradicting both PHP API and existing sections0/2 which correctly teach bytes. Use bytes and qualify ASCII word code. Source read: https://www.php.net/manual/en/function.strlen.php . Acceptance: ASCII code length4 and Cyrillic byte count distinguish bytes from characters.
- **P3 day22 new q3**: asks to call describe() for each Book, but actual lesson/reference Book defines only title/year/constructor, and no describe method is taught here. Either explicitly state a hypothetical object with that method, or ask for the actual taught title property traversal. Acceptance: snippet runs against the day22 Book reference without undefined-method Error.
- **P4 day13 new q3** repeats existing q1 missing-require behavior. Replace the added assessment with a distinct application/boundary while preserving old question/options.

PHP source-review records manual reads but omits the typed-return exception to its d2 claim. It says unchanged practice copying candidates were outside the structural batch; that is not full independent-practice acceptance under the current agent pack.

The follow-up fixes all four fields in RU/TG/EN. Day 13 now tests load order using the real helper. Day 22 updates the existing `Book.year` fields and predicts their new mean of `2021.0`. The `course-quality-guard` and `general-course-content` suites passed all 16 tests after the changes. Root then verified the fixes with portable PHP 8.4.27 and accepted their scoped runtime behavior. [PHP source review and exact changes](../curriculum-design/php-structural-review-2026-11-17.md).

## Ruby: confirmed new findings, FIX_REQUIRED (read-only)

- **B1 day 8, section index 2 and q3.** Bare `[].reduce(0)` without a block raises `TypeError` on Ruby 3.4.12 with the message `0 is not a symbol nor a string`. The earlier review incorrectly inferred `nil` from the general `enum_inject` fallback and missed the array operation's argument validation. The repaired code supplies the complete block, `[].reduce(0) { |sum, n| sum + n }`, and returns `0`. Both bare and repaired forms have now been checked with the temporary Ruby 3.4.12 CLI.
- **B2 day11 section2**: required/default/splat order is presented as strict. Ruby permits grouped optional arguments before a required argument (`def add_values(a=1,b=2,c)`). Reword as the simple chosen convention and show the actual rule accurately. Source read: https://docs.ruby-lang.org/en/master/syntax/methods_rdoc.html#label-Default+Values (also verify target Ruby3 version). Acceptance: permitted ordering compiles; missing required argument still raises ArgumentError.
- **B3 day1 section3**: blanket string arithmetic failure is false for the exact multiplication context: a string price multiplied by quantity repeats it (`"12" * 3` => "121212") instead of computing36. Explain unexpected repetition vs numeric calculation. Source read: https://docs.ruby-lang.org/en/master/String.html#method-i-2A . Acceptance: numeric12*3 vs string12*3 outputs.
- **B4 day30 section3**: asks learner to run the days27–29 project and check argument validation, symbol hash, yield and exception handling; those references do not contain these constructs (arrays/classes/printing/reduce/tally). Point to the actual earlier-day examples or explicitly ask to add independent behavior with criteria. Acceptance: every requested check maps to existing code or a complete new task.

Ruby source-review explicitly records all runtime snippets including bare reduce(0) as UNVERIFIED; API prose was insufficient to validate that exact call. No Ruby course file was edited by this reviewer.

## Root independent acceptance and runtime evidence (latest)

- Root independently accepted the four Java repairs after reading all three locales and executing focused behavior on Microsoft OpenJDK17.
- Root separately ran all27 Java code-practice references in isolated temporary folders using the absolute executable `C:/Program Files/Microsoft/jdk-17.0.20.101-hotspot/bin/java.exe <temporary>/Main.java`. Result:27/27 matched recorded output;0 problems. This is coordinator-reported execution evidence, not this reviewer execution. It covers code references, not all independent tasks or the three written days. The existing Vitest Java discovery can still skip when its process cannot locate java on PATH.
- Root read and independently accepted C#4/Rust4 corrections after all-locale reads, official Microsoft/Rust source checks, and original-field preservation checks. Status VERIFIED_WITH_LIMITS: neither compiler is installed; no C#/Rust execution was claimed.
- The baseline full suite had 116 files, 925 passes and 8 skips. The Kotlin author fixed the duplicate quiz IDs identified in a focused run. At 13:52 Dushanbe time, root reran the integrated suite with OpenJDK on PATH. The result was 116 files, 926 passes, 8 skips and zero failures. That run preceded the next AI course edits and final UX rubric revisions.

## SQL, Node.js and MongoDB repairs accepted with limits

Root accepted the scoped RU/TG/EN repairs after reading the changed fields and reproducing the SQL and Node.js behavior. MongoDB acceptance used official documentation and code review. Server execution remains pending.

- SQL18 section1 portability: SQLite SELECT-alias-in-WHERE extension is separated from portable expression/subquery use.
- SQL20 section1 CASE NULL rows remain in a NULL group; COUNT(label) differs from COUNT(*). Also corrected overlapping-threshold illustration to price30; Tea12 does not satisfy>=25.
- SQL23 section1 distinguishes ADD COLUMN CHECK validation of existing rows since3.37.0 from attaching arbitrary constraints to existing columns. Unique index is not a replacement for arbitrary CHECK.
- SQL24 new q3 now asks about fixed prefix/range lookup, not universal absence of any index use; LIKE prefix optimization depends on collation/planner and covering scans remain possible. Existing original options/order unchanged.
- SQL26 section1 describes automatic RENAME COLUMN propagation to views/triggers since3.25.0 and ambiguity rejection.
- Node day 5 q3, its correct option and hint, and section index 3 now teach `npm init -y`. In an isolated offline fixture, `npm install` created no `package.json`.
- Node7 new section2: path.join needs an absolute module-directory anchor for cwd independence; plain relative join remains relative.
- Node23 new section2: Git Bash && stops dependent execution on nonzero, while semicolon chaining continues.
- Mongo25 new section3: pre-group match filters source documents and can change aggregates; post-group match filters groups. Also distinguishes empty source/no group row, zero numeric sum, and numeric-only avg/null.
- Mongo28 new q3/option2/answer/hint: odd voting membership is efficient but election still needs reachable majority and eligible candidate.

Follow-up review covered SQL day 12 stable IDs after `UPDATE`, day 20 client-dependent rendering of `NULL`, day 23 validation of existing rows on `ADD COLUMN ... CHECK` and day 26 read-only views with optional `INSTEAD OF` triggers. Node day 20 now distinguishes missing environment variables from defined strings and validates fixed ports explicitly. The authored JSON uses the original one-space indentation.

## Swift partial semantic review: new concrete findings

This reviewer read days1–15 added/modified EN sections and all new questions/hints plus actual tasks. Root read days16–30 new diff separately; combined coverage is not independent all-locale certification. No Swift source edited here.

- Day4 section0/section2 and unchanged task claim bare `5 + 2.5` will not compile. Swift infers floating literals in shared expression context; use typed Int and Double variables for the intended type-mismatch demonstration. Track provenance: some assertion appears in modified original sections and preserved practice, not only the added section.
- Root finding day16 section3: named argument labels do not permit argument reordering; Task(done:false,title:"x") cannot ignore initializer declaration order. Root read official Swift book Functions.md.
- Root finding day25 sections2/3 and q3 hint: removing inout does not silently create a mutable parameter copy; ordinary function parameters are immutable and append fails without an explicit local var copy. Missing & when inout is declared is a compile error.
- Root finding day26 section2: Swift array indexing is bounds-checked and traps; do not call it unprotected.
- Root finding day27 section2: report reference already guards totalMinutes>0, so new prose alleging its empty-list division/crash contradicts actual code. Distinguish integer zero-division trap from floating NaN/infinity.
- Root finding day24 section3: biggest(3,4.5) literal-inference error claim is the same candidate as day4; use typed variables and execute before acceptance.
- Root finding day28 section3: main.swift is a compiled multi-file top-level entry convention, not a universal interpreter script filename requirement. `swift filename.swift` can interpret a differently named script.

Root official-book source: https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/Functions.md . Swift toolchain absent; none of these code cases executed here. Day16 argument-order fact independently sourced by root; other cases require source/runtime completion by the Swift fix owner.

## Backend Pro findings from independent review

Root read 30 added English quiz questions and hints, then checked the relevant lesson fields and reference code. Node 24 tests used local fixtures.

- **Day 20, q3 and section index 2.** A defined environment value is a string and a missing key yields `undefined`. The task asks errors to identify the variable without including its value, while the reference prints the fake input `http`. Teach the distinction and check that errors contain the variable name only.
- **Day 21, q3 and timeout reference.** The question conflates cancellation with an already completed success. Root's loopback test found that bare `fetch` resolves when the headers arrive, so clearing the timeout at that point leaves a slow body unbounded. Including body parsing in the timed operation rejected the delayed response as intended. Teach the boundary explicitly and test delayed headers and delayed body separately.
- **Day 23, circuit breaker theory and reference.** The theory promises one half-open probe. Root held a test promise open and observed two concurrent calls to the operation. Allow one probe until it settles and test the second concurrent call in that state.
- **Day 15, q3.** Tie the required log fields to this exercise. Explain the chosen severity policy as an application policy.
- **Day 8, token comparison and reference.** `timingSafeEqual` covers its byte comparison. The reference derives a session token from the password digest, while the lesson calls for an independent token. Generate the token with a cryptographically secure random source and use the existing safe comparison where applicable. Run the original fixture and verify independent tokens across calls. [Node.js 22 crypto documentation](https://nodejs.org/docs/latest-v22.x/api/crypto.html#cryptotimingsafeequala-b).

The circuit breaker behavioral reference is Microsoft's description of limited requests in Half-Open state. [Azure Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker).

## Latest PHP, Ruby and Kotlin follow-up

Root accepted all four PHP repairs after reading RU/TG/EN and using checksum-verified portable PHP 8.4.27 to execute the repaired cases. All 26 code practice references matched their recorded outputs. PHP's broader practice and translation review remains in the queue.

Ruby's four repairs are written in all three locales. The guided examples and practice objects passed preservation checks. Two focused loader/quality suites passed all 16 tests. Root independently accepted all six scoped repairs after reading all three locales and executing focused cases with checksum-verified portable Ruby 3.4.12. All 28 code practice references matched their recorded RU/TG/EN outputs. Independent-practice completion and full-course language review remain queued.

Root's Ruby 3.4.12 run also found two incorrect recorded outputs. Day 19's string `inspect` includes quotation marks, so its first output line is `"red"`. Day 23's `avocado` has 7 letters, and its length histogram is `{5 => 1, 7 => 1, 6 => 2, 9 => 1}`. Output fields, walkthroughs and practice task text now agree across RU/TG/EN. The integration owner ran these two unchanged reference programs with the temporary Ruby CLI and matched every corrected output. Hash spacing is identified as Ruby 3.4.12 formatting.

Kotlin compiler execution is now available through a checksum-verified temporary Kotlin 1.9.24 distribution with OpenJDK 17. Root independently executed 30 guided examples and 30 solutions. The integration owner then ran the shared Kotlin Vitest suite through the Windows Java compiler invocation. All 3 tests passed in 36 seconds, covering the 60 programs, both argument/overflow fixtures and detection of the broken deletion predicate. The shared optional probe skips only a missing toolchain. An explicit invalid compiler path fails with an error.

## Backend Pro authored repair handoff

Author `/root/pending_batch_review` repaired only days 8, 15, 20, 21 and 23 after root's independent findings. Root reviews separately. The source-review file records all changed fields and authoritative links.

- Day8 sections0–2/q3: independent 32-byte random session token; no digest-derived token; fixed salt and cheap scrypt cost explicitly demo-only; early-return comparison is hypothetical, and timingSafeEqual does not certify surrounding code.
- Day15 section0/q3: log fields and info threshold belong to this HTTP fixture.
- Day20 sections0/2/q3/example/solution/output: defined string versus absent undefined, explicit conversion, string0 truthiness, and no raw input in any validation error.
- Day21 section0/q3/example/solution: deadline callback includes awaited body reading; completed success is not undone by later abort. Root follow-up corrected q1/option0/hint and section2's absolute server-cancellation claim. The operation must cooperate with the supplied signal.
- Day23 section0/example/solution/task: one pending half-open probe; concurrent requests fast-fail without calling the dependency. Other breaker designs may choose a different bounded probe count.

Author test command: `npx vitest run tests/backend-pro-factual-repairs.test.ts tests/premium-curriculum.test.ts` passed **27 tests in 2 files** on Node24.20.0. New cases execute all five references and check independent tokens, config redaction/missing values, headers-versus-body deadline lifetime, and held-probe concurrency. Three injected defects must fail. Later q1/server-cancellation prose corrections did not alter executable references. All lesson/day/prerequisite/question IDs, ordering and answer indices remain unchanged. Only day21 q3 option2 and q1 option0 wording changed in place with root approval because they contained false claims. The rest of the original options are unchanged.

No full semantic acceptance or independent practice completion is implied by these author tests. All 30 guided/practice overlaps remain in the review queue.
