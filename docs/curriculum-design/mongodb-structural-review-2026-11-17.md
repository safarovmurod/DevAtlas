# MongoDB course — structural review and completion (2026-11-17)

Scope: `src/content/courses/mongodb.json` only. No catalog, schema, scripts, tests, other courses or reports were touched. Nothing committed or pushed.

Baseline: `docs/audits/continuation-quality-2026-11-17.json` → `courses[courseId=’mongodb’]`:
30 published days; 13 days with <4 sections (`3,6,7,8,9,13,15,17,18,21,23,25,26`); all 30 days with <3 questions;
52 questions without linked hints; 27 days flagged `practiceSolutionInTheoryCandidate`;
`correctPositionCounts [0,60,0]` (every existing question has correctIndex 1); `longestCorrectOptionRuPercentIncludingTies 97`.

## What was found and what was changed

### 1. Days with fewer than 4 sections (13 days)

All 13 flagged days had exactly 3 sections (`theory → Разберите пример (code) → Запустите и проверьте`); none had a
standalone "Частые ошибки" section, so per the task rule the new closing section was appended at the end. Each day got
one new section `{title, body} × ru/tg/en` titled by its content (e.g. «Глубже: отсутствие поля и null — не одно и
то же», «Глубже: цена глубокой пагинации»), 250–700 RU characters (min 80), tg ≠ ru, with an edge case and links to
earlier days (3↔9, 6↔18, 8↔6/7, 12↔13, 16↔17, 20↔21, 22↔25 …). RU lengths verified 250–700 for all 13 (day 21 trimmed
to 698).

### 2. Third question on every day (30 new questions, ids `mongodb-day-XX-q3`)

- Ids follow the existing per-day pattern; no clash with existing ids or interview ids (`mongodb-day-01..03-written`).
- Topics match the same day: day 1 findOne/null, day 2 matchedCount 0, day 3 dot path, day 4 auto ObjectId, day 5 cursor,
  day 6 `$gte/$lte` range, day 7 empty `$in`, day 8 reading `$or` aloud, day 9 whole-object match order, day 10 `$all`,
  day 11 `$elemMatch` "at least one", day 12 dot-path `$set`, day 13 `$mul` on missing field, day 14 `upsertedCount`,
  day 15 deleteOne vs deleteMany, day 16 unstable sort on ties, day 17 skip formula, day 18 zero as a business answer,
  day 19 idempotent createIndex, day 20 price snapshot, day 21 who syncs the embedded summary, day 22 `$sum:1`,
  day 23 fields available after `$group`, day 24 `$size`, day 25 fractional `$avg`, day 26 Date vs string type,
  day 27 mongod vs mongosh, day 28 odd replica-set nodes, day 29 `$unwind` fan-out, day 30 `distinct`.
- 3 options each in ru/tg/en; distractors are real beginner mistakes. correctIndex is **0 on odd days, 2 on even days** —
  this breaks the observed 100% same-index pattern (final distribution 15/60/15) without touching any existing question.
  Existing options and their order were not modified.
- Option length ratio max/min kept ≤ 1.8 per locale for all new questions after a dedicated rebalance pass
  (16 questions reworded), so the correct answer is not findable by length.
- Every new question has a hint (does not reveal the answer) and a correct `relatedSection`.

### 3. Hints + relatedSection on existing questions

52 existing questions lacked hints (the audit counted 52 missing ids, 8 questions already had a hint+relatedSection and
were preserved untouched). All 52 now carry `{hint, relatedSection}` in ru/tg/en; hint/relatedSection are always set
together (schema requirement), and `relatedSection < sections.length` was verified for all 90 questions.

### 4. 27 overlap candidates — all are trust-examples, no prose rewritten

For all 27 flagged days the practice `solution` is byte-identical (modulo CRLF) to the `code` of section 1
(«Разберите пример») — the code block is deliberately shown in theory. A per-line scan found **zero** solution lines
inside any section prose body (ru/tg/en). Per the task rule this is the trust-example case: recorded here, changed
nothing. Days 20/27/28 are written-practice days (solution = referenceAnswer) and were not flagged.

### 5. Preserved content

Verified programmatically against the pre-edit file: lesson order/ids, titles, summaries, prerequisiteDays, interviews,
all original sections, all original question ids/questions/options/correctIndex, and every practice object are
byte-identical. New sections are appended; new questions are appended; only hint/relatedSection fields were added to
existing questions that lacked them.

## Source verification (MongoDB manual, opened one by one via WebFetch)

All facts stated in the new content were checked against the official manual (all URLs opened 2026-11-17):

- https://www.mongodb.com/docs/manual/reference/operator/query/in/ — `$in` matches any listed value, incl. array fields
  containing a listed element.
- https://www.mongodb.com/docs/manual/reference/operator/query/ne/ — "$ne … includes documents that do not contain the
  field" (supports day 6/7/8 hint and section claims).
- https://www.mongodb.com/docs/manual/reference/operator/query/elemMatch/ — "at least one element that matches all the
  specified query criteria".
- https://www.mongodb.com/docs/manual/reference/method/db.collection.updateOne/ — first matching doc; upsert creates a
  doc from filter+update when nothing matches; matchedCount/modifiedCount/upsertedCount semantics.
- https://www.mongodb.com/docs/manual/reference/operator/update/inc/ — "If the field does not exist, $inc creates the
  field and sets it to the specified value."
- https://www.mongodb.com/docs/manual/reference/operator/update/mul/ — "$mul creates the field and sets the value to
  zero" when missing (supports day-13 q3 and «Глубже» section).
- https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteMany/ — empty filter deletes all documents;
  deletedCount semantics.
- https://www.mongodb.com/docs/manual/reference/method/cursor.sort/ — sort is not stable; include `_id` for a
  consistent order (day 16 q3 / related section 3).
- https://www.mongodb.com/docs/manual/reference/method/cursor.skip/ — skip/limit semantics; skip beyond data returns
  empty result without error; skip cost grows with offset (day 17 q3 and «Глубже» section).
- https://www.mongodb.com/docs/manual/reference/method/db.collection.countDocuments/ — exact filtered count vs
  estimatedDocumentCount metadata estimate without filter.
- https://www.mongodb.com/docs/manual/indexes/ and …/core/indexes/create-index/ — collection scan without indexes;
  `_id_` auto index; write cost; "MongoDB only creates the index if an index of the same specification does not exist"
  (day 19 q3 idempotency); default names `<field>_<direction>`.
- https://www.mongodb.com/docs/manual/aggregation/ — pipeline stages execute in written order; `$match` filters,
  `$group` groups by `_id` key, `$unwind` deconstructs arrays.
- https://www.mongodb.com/docs/manual/reference/limits/ — "The maximum BSON document size is 16 mebibytes."
- https://www.mongodb.com/docs/manual/reference/method/Date/ — ISODate helper is UTC; `new Date("<YYYY-mm-dd>")` is
  midnight UTC (day 26 q1 and «Глубже» section).
- https://www.mongodb.com/docs/manual/reference/command/ping/ — no-op liveness check (day 27).
- https://www.mongodb.com/docs/manual/replication/ — primary receives writes, secondaries replicate the oplog, election
  of a new primary on failure (day 28).
- https://www.mongodb.com/docs/manual/sharding/ — shards hold subsets, shard key distributes documents, mongos routes
  queries (day 28).
- https://www.mongodb.com/docs/manual/reference/operator/aggregation/sum/ — `$sum:1` counts documents; `$sum:"$total"`
  sums a field; non-numeric values ignored (day 25 «Глубже» section).
- https://www.mongodb.com/docs/manual/reference/method/db.collection.distinct/ — returns an array of unique values
  (day 30 q3).
- https://www.mongodb.com/docs/manual/reference/operator/aggregation/size/ — "$size counts and returns the total number
  of items in an array" (day 24 q3).
- https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/ — one output document per array element
  (day 29 q3).

No URL failed to open. One fetch attempt returned a transient "user concurrency limit exceeded" twice
(`$elemMatch`, `updateOne`) and was retried successfully; no fact was taken from a failed fetch.

## Verification performed

- `npx vitest run tests/course-quality-guard.test.ts tests/course-taxonomy.test.ts tests/programming-intros.test.ts`
  — 22 passed, 7 skipped (the skips are the pre-existing `it.skip` placeholders for courses without local runtimes).
- `npx vitest run tests/course-audit.test.ts` — 8 passed. This course loads **all** catalog courses through
  `loadCourseContent` + `courseContentSchema.parse`, so mongodb.json passes the zod schema, duplicate-id checks,
  hint/relatedSection pairing and source references; the track-coverage CLI inside it still reports honest day totals.
- `npx vitest run tests/course-content.test.ts tests/course-day-plan.test.ts` — 14 passed (provenance/digests for every
  course, plan helpers).
- `npx tsc --noEmit` — exit 0. `npm run lint` — exit 0.
- Programmatic diff against the pre-edit backup: only intended additions; tg ≠ ru for all new bodies/hints/options;
  RU 250–700 for the 13 new sections; 30 days × 4 sections × 3 questions; all 90 questions have hint+relatedSection.

## Honest limits

- **mongosh is not installed in this environment** (`mongosh --version` → command not found). The 27 mongosh practice
  scripts and their recorded outputs remain **SKIPPED / UNVERIFIED**: nothing in this pass executed against a real
  MongoDB server. The recorded outputs were trusted only as previously authored artifacts and were not modified.
- No real device/account operations, no Atlas cluster, no independently assessed mastery — Self Reviewed remains Self
  Reviewed; this pass is a structural completion, not a runtime attestation.
- Days 20, 27, 28 keep their written practice; the platform does not verify essays or installs — unchanged by design.
- Correct-position histogram after this pass is [15, 60, 15]: the 60 legacy questions at index 1 are preserved as
  required (existing options untouched); the new 30 questions break the same-index pattern but cannot rebalance the
  legacy ones. A future pass could only fix that by editing existing options, which this task forbids.
- Answer-position pattern `longest option = correct` was fixed only for the 30 new questions; legacy questions keep
  their original option texts/order per the "do not change existing options" rule.

## Remaining work (candidates for a future pass)

- Verify the 27 mongosh scripts on a real local MongoDB/mongosh and re-record outputs (blocked on environment).
- Optionally rebalance legacy option lengths / correct positions (requires changing existing options — out of scope here).
- The audit's heuristic flags ("position/length patterns require manual review") are partially addressed: new content
  is clean; legacy content retains its original authored patterns.
