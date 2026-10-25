# Kotlin/JVM beginner course

The free course publishes 30 scheduled days. Days 1–2 retain the original
introductory lessons unchanged; days 3–30 extend them with RU/TG/EN explanations,
worked output traces, quizzes and boundary exercises. Catalog descriptions in
all six interface locales describe the complete schedule.

## Scope

- Days 1–10: bindings, contracts, numeric types, strings, Boolean logic, control
  flow, loops and function parameters.
- Days 11–20: null safety, text parsing, lists, mutation, maps, sets, lambdas,
  transformations, accumulation and deterministic sorting.
- Days 21–28: constructors, data classes, encapsulation, interfaces, enum and
  sealed results, exception boundaries, generics and extensions.
- Days 29–30: an in-memory task list with unique identifiers, validated titles,
  immutable updates, deletion and executable checks.

These are standalone console programs. They do not build Android APKs, implement
disk persistence or establish production readiness. Completing a self-check on
the website does not mean that a server executed the learner's Kotlin code.

## Run a lesson

Install Kotlin/JVM and a JDK, save one solution as `Main.kt` in its own directory,
then run:

```sh
kotlinc Main.kt -include-runtime -d lesson.jar
java -jar lesson.jar
```

Run examples independently: names such as `Task` and `main` intentionally recur
in different lessons. All examples use Kotlin/JVM and its standard library,
including the Java `Math.multiplyExact` operation where overflow must be detected.

## Verify the published examples

From the repository root, with `kotlinc` and `java` on `PATH`:

```sh
node scripts/verify-kotlin-examples.mjs
npm run test -- tests/kotlin-course.test.ts tests/programming-intros.test.ts
```

Use `KOTLINC` to select a compiler executable and `JAVA` to select the JVM. For
example, the prepared cloud instance has
`KOTLINC=/workspace/tooling/bin/kotlinc`; this path is local tooling, not a
repository dependency or a requirement for other machines.

The verifier compiles all 30 programs in distinct packages, executes each main
and compares stdout with the recorded RU/TG/EN output. It also checks negative
input and integer overflow in the original total function, then confirms that
changing the final project's deletion predicate causes its checks to fail.
Temporary source files and JARs are removed after the run.

The examples were executed using Kotlin/JVM 2.2.21 and OpenJDK 21. The Vitest
runtime check is explicitly skipped when the selected compiler is unavailable;
structural and translation checks still run. The standalone verifier fails if
the compiler is missing, so use it when execution evidence is required.

## Preserved introductory wording

The original days 1–2 still refer to their two-day introductory module. Their
lesson blocks are preserved verbatim, so the generated content auditor reports
these historical scope phrases and the original single-question quizzes. The
published plan and catalog report the actual complete 30-day course. This
preservation is deliberate; the auditor flags have not been suppressed.
