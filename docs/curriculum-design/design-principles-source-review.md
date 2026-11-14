# Twelve design principles — text lesson review, 2026-11-15

The owner supplied **12 принципов dизайна.pdf** and explicitly requested its information as lesson text, without publishing the PDF. The 22-page attachment was read through local text extraction. SHA-256: `80d6038b5a15f043430f1a2b5c57ebf6b5feb76a5b34ad6fe2f08a63641688ab`. No author or publisher was identifiable in the extracted text; no attribution or public URL has been invented. Neither the attachment nor its extracted transcript is committed or offered as a course download.

UX Design day 19 already teaches hierarchy and labels for a booking interface. It now contains original RU/TG/EN explanations of the twelve principles at that point in the learning sequence. Existing lesson IDs, prerequisites, the three original sections and five original quiz questions/options remain. Twelve new questions link feedback to the corresponding new section. The independent exercise combines the original six booking labels with a before/after sketch and a twelve-principle review.

| Attachment pages | Principles incorporated |
| --- | --- |
| 6–9 | Contrast, emphasis, hierarchy, proportion |
| 11–14 | Balance, whitespace, unity, variety |
| 16–19 | Repetition, pattern, rhythm, movement |
| 20–22 | Checklist, application and review |

The lecture is a starting point, not a technical standard. One emphasis, three or four hierarchy levels, a spacing scale, font counts and 2:1 layouts are contextual heuristics. Equal layouts can suit equal comparisons. Movement can describe a reading path without animation; F/Z scanning is not imposed as a universal user behaviour. Learners record expected effects separately from observed evidence.

Technical claims were checked against the official W3C WCAG repository at `c9ea04d4f3702e92249997c11fd678777f9c03ae`:

- `understanding/20/contrast-minimum.html`: ordinary text 4.5:1, large text 3:1 at AA, large-text definition and exceptions; do not round a failure upward.
- `understanding/21/non-text-contrast.html`: necessary visual information for active controls/states against adjacent colours, not a blanket requirement for every decorative boundary.
- `understanding/21/animation-from-interactions.html`: reduction or disabling of nonessential interaction animation; essential movement has qualifications. This criterion is AAA; the lesson presents the design advice without claiming all animation is forbidden by AA.

Public W3C Understanding links are attached to the lessons for these specific claims. They are not represented as the source of the lecture's twelve-part taxonomy. The nearby day 21 example was corrected: an undefined “gray 60” is not a contrast measurement; ordinary headings need not be Tab stops; standard button activation includes Space. A paper focus plan is distinguished from a browser keyboard test.

No user test, contrast measurement on a real learner design, oral assessment or independent pedagogical review is claimed. Written responses remain self-reviewed.

## Implementation verification

- Full Vitest run: 90 files, 533 tests passed, 9 skipped. After the final wording review, the four affected course/schema/coverage test files passed again (13 tests).
- TypeScript, ESLint and production build passed. After final wording edits the production build passed again, followed by four repeated desktop/mobile checks of the English final module and UX principles.
- Chromium desktop/mobile: 24 selected checks passed, including all new English days, linked wrong-answer feedback, persistent written drafts, final rubric review, all twelve UX principles without a PDF link, existing Content Creation/Productivity flows and six-locale route smoke tests.
- Catalog, introductory duration, six-language descriptions and generated coverage/delivery/backlog reports match 42 English days and 1,220 total scheduled days. Blueprint and freshness checks passed.
- A direct comparison with the previous main commit confirms the first fourteen English lessons and source records, all existing UX question options, lesson IDs/prerequisites, and unchanged UX lessons outside days 19/21. No PDF file or source transcript was added.
- These checks cover implementation and consistency, not an independent pedagogical review or measured learner outcomes.
