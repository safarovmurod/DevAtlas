# English Foundations 15–42 — source and authoring review

Reviewed 2026-11-15. All 42 planned days now exist in the application loader. This change appends days 15–42; the first fourteen lessons, their questions/options and existing source records remain unchanged. Each new day has four original theory sections, three questions with linked feedback, and independent written practice with two hints, three task-specific criteria and RU/TG/EN reference answers. English language samples remain English in all three locales; the explanations are separately authored.

## Sources actually inspected

The official Saylor publishing repositories were read locally. The pinned references are public, reproducible source locations. Earlier British Council links are retained, but are not represented as newly reviewed: direct access from this environment returned HTTP 403.

**Handbook for Writers**, repository `saylordotorg/text_handbook-for-writers`, commit `d8f8485ddcb662d65c1e8f8c257bbe7a9bb76cd6`:

- `s25-02-english-word-order.html`: subject/verb/object order, adjective placement and negative patterns.
- `s25-11-adverbs-and-adjectives.html`, `s24-06-using-adverbs-and-adjectives.html`: adjective/adverb roles, unchanged adjective number and placement. The course uses a limited size/colour sequence rather than assigning an absolute rule to every adjective combination.
- `s25-06-verb-tenses.html`: affirmative, negative, do/does questions, short answers and wh-questions. `s24-01-making-sure-subject-and-verbs-.html` supports agreement.
- `s19-02-choosing-appropriate-verb-tens.html`: simple versus progressive forms. The source contains a labelling error in its perfect table (saying be while showing have); that unrelated table is not reproduced or taught.
- `s25-08-modal-auxiliary-verbs.html`: can for capability and modal request patterns. A skill statement is distinguished from proof of that skill.
- `s25-17-prepositions-and-prepositional.html`: clock times, weekdays/dates and concrete spatial relations. The lessons do not promise one translation for every use of each preposition.
- `s23-04-inserting-numbers-into-text.html`: numbers as quantities/identifiers, compound number spelling, times and dates. Style-guide-specific number thresholds are not imposed as universal English grammar.
- `s20-06-managing-mood.html`: imperatives and the understood subject. Only the relevant sentence pattern is used, not the source's unrelated biographical or statistical examples.
- `s25-19-not-and-other-negative-words.html`: negative placement and contractions. Its broad claims about double negatives are not adopted; the lesson explicitly teaches the standard target pattern without making claims about all dialects.

**Business English for Success**, repository `saylordotorg/text_business-english-for-success`, commit `3d58ff85cd479e9b37b5bf900182e6e68ed7eac2`:

- `s08-04-pronouns.html`: subject/object forms and clear references. No gender is inferred from an occupation.
- `s08-05-verb-tenses.html`: agreement and be + present participle, including current and temporary situations. The course does not claim that Continuous can only refer to the instant of speaking.
- `s17-01-text-e-mail-and-netiquette.html`: recipient, purpose, clear content and review before sending. Dated technology/anecdotal claims from the chapter are not included.
- `s10-02-coordination-and-subordination.html`: addition, contrast and supported reasons. A causal relation is not invented merely because two facts occur together.

These Saylor adaptations are CC BY-NC-SA 3.0. Textbook prose, exercises, tables and translations are not copied. DevAtlas supplies original explanations, situations, dialogues, notices, timetable data, tasks and reference responses based on general language facts. The user’s design lecture is handled separately in [the design review](design-principles-source-review.md).

## Sequence and learning decisions

| Days | Application |
| --- | --- |
| 15–18 | Adjectives, quantity, there is/are and a fact-preserving room description |
| 19–26 | Present Simple, agreement, questions/negatives, information questions, dates/times, frequency and routine dialogue |
| 27–34 | Abilities, requests, imperatives, locations, object pronouns, current actions, routine/current contrast and clarification |
| 35–42 | Notices, timetable selection, a purposeful email, connectors, introduction, dialogue preparation, written project and oral-practice/review log |

The worked example and independent input differ. Questions distinguish grammatical form from whether a statement preserves the supplied facts. Unknown prices, rooms, dates and availability remain unknown or become questions. Ambiguous numeric dates and twelve-hour times are clarified instead of guessed. Frequency words are not assigned fictional fixed percentages.

Day 41 produces a reading record, complete unsent email, source-grounded answers and a justified revision. Day 42 produces a dialogue and an honest activity log plus targeted review actions. Both have three-level, three-criterion rubrics matching the task criteria. Performing aloud is encouraged; an unperformed oral part must be recorded as unperformed, with a concrete plan. Neither a written answer nor Self Reviewed certifies pronunciation, listening, partner understanding, fluency or an independently assessed CEFR level.

## Validation

Structural audit: 42 days; no missing sections, questions, feedback, translations or substantive written solutions; dominant correct position 33%, longest correct answer 29% by the audit’s Russian-length metric; no reference-answer leakage detected. Full-suite and browser results are recorded below. These diagnostics do not substitute for an independent teacher/translator review.

## Implementation verification

- Full Vitest run: 90 files, 533 tests passed, 9 skipped. After the final wording review, the four affected course/schema/coverage test files passed again (13 tests).
- TypeScript, ESLint and production build passed. After final wording edits the production build passed again, followed by four repeated desktop/mobile checks of the English final module and UX principles.
- Chromium desktop/mobile: 24 selected checks passed, including all new English days, linked wrong-answer feedback, persistent written drafts, final rubric review, all twelve UX principles without a PDF link, existing Content Creation/Productivity flows and six-locale route smoke tests.
- Catalog, introductory duration, six-language descriptions and generated coverage/delivery/backlog reports match 42 English days and 1,220 total scheduled days. Blueprint and freshness checks passed.
- A direct comparison with the previous main commit confirms the first fourteen English lessons and source records, all existing UX question options, lesson IDs/prerequisites, and unchanged UX lessons outside days 19/21. No PDF file or source transcript was added.
- These checks cover implementation and consistency, not an independent pedagogical review or measured learner outcomes.
