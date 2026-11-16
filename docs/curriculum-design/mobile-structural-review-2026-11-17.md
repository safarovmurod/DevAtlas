# Mobile course structural review — 2026-11-17

Scope: `src/content/courses/mobile.json`, `content/mobile-lab/drafts/day-01.json` … `day-44.json`, this document.
Branch: `codex/complete-starter-curricula`. Languages: RU/TG/EN. Nothing else was edited
(the concurrent edits to `python.json`, `management-foundations.json`, `catalog-other.ts`,
`course-descriptions.ts` and shared tests in the same working tree belong to sibling
review sessions, not to this one).

## Findings

1. **Structure.** Days 1-2 had 3 sections, days 3-44 had 2 sections — below the 4-section
   minimum. All questions reference sections 0/1 (`relatedSection`), walkthroughs reference
   section 1 (`walkthroughSections`), so appending sections at the end cannot break either.
2. **Stale draft, day-10.** Draft `questions[1]` (`mobile-day-10-q2`) had `correctIndex: 0`
   while published had `1`. Published is correct: the related section says «Откройте
   package.json в корне проекта: в dependencies должны быть указаны expo…», which is option
   index 1 («В разделе dependencies файла package.json»). The draft fix is 0 → 1.
3. **Stale draft, day-22 (not in the earlier diagnosis).** The draft lost the regex
   backslashes: section-2 body and `mobile-day-22-q4` question text said `^d+$` while the
   lesson code (line 9) and the published text use `/^\d+$/`. The published text is correct;
   the draft was restored to match it (ru/tg/en in both places).
4. **Published day-10 prediction inconsistency.** `learningFlow.prediction` mirrors quiz
   question 2 exactly on 43 of 44 days; on day 10 it kept the pre-fix `correctIndex: 0`
   (option «В имени папки проекта» — wrong) while q2 had the correct `1`. Fixed 0 → 1 in
   published and draft, restoring the 44/44 mirroring invariant.
5. **No solution-in-lesson.** For all 44 days the example code section equals
   `content/mobile-lab/examples/day-XX.tsx.txt` and `practice.solution` equals
   `content/mobile-lab/solutions/day-XX.tsx.txt`; no example equals its solution, and no
   section body carries the practice solution. The 37 theory/solution overlap candidates
   from the audit remain a semantic-review item; nothing here qualified for a mechanical fix.
6. **Answer-placement statistics (left for semantic review, per decision).**
   `correctIndex` distribution over 220 questions: 0 → 77, 1 → 77, 2 → 66 (35/35/30 —
   near uniform, no single-spot concentration). The real bias: in 185/220 (84.1 %) of
   questions the correct option is the longest one. Per the owner decision this was NOT
   mechanically permuted (AGENTS.md preserves original option order; a longest-equals-correct
   bias is also explainable by organic authoring). Question ids, texts, answers, hints and
   option orders are untouched.

## Changes applied

- **86 new sections** appended after the existing ones: days 3-44 received a 3rd section
  («deeper / in a real project»: edge cases, connections to earlier days) and a 4th section
  («Частые ошибки»: 3-4 real beginner mistakes with causes); days 1-2 received only the 4th
  section (they already had 3). Every section is `{title, body}` with ru/tg/en; RU bodies
  are 250-700 characters, TG is a real translation (never a copy of RU), EN is complete.
  Totals: 44 days × 4 sections = 176 sections; 42 s3 + 44 s4 = 86 additions.
- **Draft sync**: the same sections were mirrored into all 44 drafts, plus the day-10
  (`q2.correctIndex`, `prediction.correctIndex`) and day-22 (regex escapes) restorations.
  Published and drafts are deep-equal again (required by `tests/mobile-draft.test.ts`).
- Preserved everywhere: lesson ids, day order, prerequisites, quiz ids, option texts and
  order, correctIndex values (except the documented day-10 fixes), answers, hints,
  practice tasks/solutions/criteria, example and solution files.
- Serialization is byte-exact (2-space indent, CRLF), so diffs contain only the appended
  sections and the one-line prediction fix.

## Source grounding (official docs read via web fetch)

Opened successfully — what each confirmed for the authored sections:

- https://reactnative.dev/docs/handling-text-input — controlled TextInput: value + state,
  onChangeText per keystroke, validation-while-typing (days 14, 22).
- https://reactnative.dev/docs/network — fetch returns a Promise, then/catch and
  async/await, «Don't forget to catch any errors…», HTTPS/cleartext notes (days 25, 27, 42).
- https://reactnative.dev/docs/accessibility — accessible, accessibilityLabel default
  («constructed by concatenating all Text node children»), accessibilityRole values,
  accessibilityHint (Android cannot turn hints off), accessibilityLiveRegion polite/assertive,
  testing with TalkBack/VoiceOver (days 15, 32, 43).
- https://reactnative.dev/docs/intro-react — state as component memory, setter triggers
  re-render, `const` on the tuple does not make state immutable (days 2, 3, 7, 21).
- https://reactnative.dev/docs/using-a-listview — FlatList vs ScrollView, «renders elements
  that are currently showing… not all the elements at once», data + renderItem (days 16, 34).
- https://reactnative.dev/docs/flexbox — RN defaults: flexDirection column, alignContent
  flex-start, flexShrink 0, flex takes one number; gap/rowGap/columnGap (days 11, 13).
- https://reactnative.dev/docs/pressable — onPressIn/Out/onPress, onLongPress at 500 ms,
  style function with pressed flag, hitSlop/pressRetentionOffset (day 15).
- https://reactnative.dev/docs/keyboardavoidingview — behavior height/position/padding,
  «Android and iOS both interact with this prop differently», keyboardVerticalOffset
  (day 31).
- https://docs.expo.dev/versions/latest/sdk/async-storage/ — AsyncStorage is «an
  asynchronous, unencrypted, persistent, key-value storage API», installed with
  `npx expo install @react-native-async-storage/async-storage` (days 28-30).
- https://docs.expo.dev/get-started/create-a-project/ — `npx create-expo-app@latest`,
  `--template`, SDK 58/57 transition notes (days 1, 10).
- https://reactnative.dev/docs/optimizing-flatlist-configuration — VirtualizedList window vs
  viewport, initialNumToRender 10, windowSize 21, getItemLayout, memoized items,
  avoid anonymous renderItem (day 34).
- https://react.dev/learn/queueing-a-series-of-state-updates — batching, updater functions
  `n => n + 1`, «replace» entries ignoring queued updates, purity of updaters (days 2, 8).
- https://reactnavigation.org/docs/navigating/ — navigate on the current screen does
  nothing, push adds a route, goBack/popTo/popToTop, invalid route error in development
  (days 18-20).
- https://reactnative.dev/docs/testing-overview — Jest unit tests, mocking native modules,
  «Component tests are only JavaScript tests running in Node.js… They do not take into
  account any iOS, Android… code», E2E with Detox/Maestro (days 35-37).
- https://reactnative.dev/docs/text — allowFontScaling default true, maxFontSizeMultiplier
  semantics, numberOfLines/ellipsizeMode, accessibilityLabel on Text (days 33, 43).

Did not open (404s, recorded for honesty):

- https://docs.expo.dev/develop/navigation/ — 404; React Navigation content came from
  reactnavigation.org instead.
- https://react-native-async-storage.github.io/async-storage/docs/usage (and the trailing-slash
  variant) — 404; getItem/string-or-null semantics were taken from the Expo SDK page and the
  course's existing day-28/29 texts.
- https://reactnative.dev/docs/state — opened but is legacy class-component content;
  useState depth came from react.dev instead.

## Verification

- `npx vitest run tests/mobile-draft.test.ts` — green (deep-equal of all 44 published
  lessons vs drafts, quiz identities, example/solution files).
- `npx vitest run tests/introductory-tracks.test.ts` — green (mobile part: sequential days,
  code section, questions, solution, RU/TG/EN titles/tasks).
- Structure script: 44 days × 4 sections; in every added section `tg != ru`, RU 250-700
  chars, EN present; drafts deep-equal published lessons on all 44 days.
- `npx vitest run tests/general-course-content.test.ts` — green (run because a sibling
  session modified it concurrently).
- `npx tsc --noEmit` — clean. `npm run lint` — clean.

## Remaining work

1. Semantic review of the 37 theory/solution overlap candidates (owner decision: untouched
   here; nothing was mechanically fixable).
2. Answer-placement review: decide whether to permute options in the subset where the
   correct answer is the longest option (84.1 % of 220 questions). If pursued: same option
   texts, new order + correctIndex only; keep day-1/day-2 q1 locked by the test; keep the
   per-day `learningFlow.prediction` mirroring its question.
3. Loader-side checks of catalog/coverage reports are out of this scope (no counts changed:
   still 44 scheduled days, 220 questions, same ids).
