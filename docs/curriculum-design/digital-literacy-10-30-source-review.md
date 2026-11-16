# Digital Literacy: source review for days 10–30

Reviewed on 2026-11-16. The implementation appends days 10–23 to the nine existing lessons without changing those lessons or their progress identifiers. Days 24–30 were authored and reviewed as a separate fragment, then integrated below. The first nine lessons and original source records remain unchanged.

## Sources actually read

| Source | Read content and authored application |
|---|---|
| [Google Search: search tips](https://support.google.com/websearch/answer/134479?hl=en) | Start with a concrete question, add descriptive terms and use words likely to occur in the target material. Day 10 uses original Windows/Firefox search scenarios. |
| [Google Search: refine searches](https://support.google.com/websearch/answer/2466433?hl=en) | Quoted phrases, `site:` without a following space, and narrowing search scope. Search operators do not establish factual accuracy. |
| [St. Lawrence University Library: Evaluating Sources](https://library.stlawu.edu/guide/evaluating-sources) | Currency, relevance, authority, evidence, purpose and the lateral-reading questions. Days 11–13 use original fictional source records, dates and dependent retellings. The library is the institutional author of this instructional guide; it is not presented as primary evidence about the fictional events. |
| [FTC: Native Advertising](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses) | Commercial intent can be obscured by editorial-looking presentation. Day 12 distinguishes commercial purpose, evaluation and a testable claim. No Tajik advertising-law conclusion is derived from U.S. guidance. |
| [Google Docs: headings and contents](https://support.google.com/docs/answer/116338?hl=en) | Heading styles and their relationship with document structure and contents. Day 14 teaches meaningful sections; day 16 supplies Heading 1/Heading 2 hierarchy. |
| [Google Sheets: formulas](https://support.google.com/docs/answer/46977?hl=en) | Formulas begin with `=`; examples use simple cell references and arithmetic rather than locale-dependent function separators. The calculations are independently checked below. |
| [Google Docs: accessible documents](https://support.google.com/docs/answer/6199477?hl=en) | Informative link labels, table heading rows, heading structure, image descriptions and avoiding color-only meaning. Its numerical contrast paragraph is not used: the lesson makes no AA/AAA ratio claim or universal accessibility guarantee. |
| [FTC: strong passwords and account protection](https://consumer.ftc.gov/articles/creating-strong-passwords-and-other-ways-protect-your-accounts) | Long, hard-to-guess passphrases, password managers, the importance of email and additional factors. Days 17–19 use role labels rather than actual secrets. |
| [Google Account: backup codes](https://support.google.com/accounts/answer/1187538?hl=en) | Backup codes as an alternative second step; each Google code is single use and generating a new set invalidates the old set. The behavior is explicitly scoped to Google. No real codes are created or collected. |
| [FTC: phishing](https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams) | Unexpected links/attachments, account-problem stories, independent verification through known contacts, and official protective actions after disclosure. Days 20–21 do not require opening suspect destinations. |
| [FTC: five protective actions](https://consumer.ftc.gov/consumer-alerts/2024/08/five-ways-keep-scammers-hackers-away) | Updating systems/browsers/apps and keeping backup copies on suitable external/cloud storage. Days 21/23 add original non-destructive planning and restoration exercises. |
| [Android: app permissions](https://support.google.com/android/answer/9431959?hl=en) | Capabilities covered by permissions; device/version/type-dependent options including while-using, ask-every-time and denial. Day 22 avoids promising identical menus on all devices. |
| [Google Account: account recovery](https://support.google.com/accounts/answer/7682439?hl=en) | Official recovery routes, work/school administrator limits and avoiding password/recovery-code disclosure. Day 23 distinguishes restoring file data from recovering account access. |

The Digital Inquiry Group page for “Intro to Who’s Behind the Information?” was searched and opened, but the browser extract contained only its navigation/footer rather than the lesson body. It is not used as the lesson's reviewed evidence. St. Lawrence University's actually readable institutional guide supplies the source-evaluation evidence instead. Failed generic FTC password and malware URLs were likewise not used.

## Original content and verification boundaries

- Four original RU/TG/EN sections, three application questions with linked explanatory hints, and one independent written assignment were added for each of 14 days: **56 sections, 42 questions and 14 assignments**. Distractor wording and situations are original rather than copied source passages.
- Each new day's three correct-answer positions occur once each. Across a module, each ordinal changes position. Existing question option order and all first-nine-lesson data remain unchanged.
- Written practice uses task-specific criteria. Days 16 and 23 have three-level rubrics with concrete deficits and observable completion requirements. `Self Reviewed` means the learner's self-assessment; no device configuration, account security, universal accessibility or independently verified mastery is claimed.
- Day 16's reference contains usable source URLs and a real heading hierarchy. Describing a link is distinguished from having tested it in a created document.
- All profiles, workshops, messages, dates and budgets introduced in the exercises are fictional teaching data. Real passwords, partial passwords, backup codes, private addresses and account screenshots are neither requested nor included.
- Day 15: `12 + 8 = 20`, then `12 + 10 = 22`; independent practice `15 + 7 = 22`, then `15 + 9 = 24`. Day 16: `6 + 4 = 10`, then `7 + 4 = 11`. These arithmetic results were checked with Node.js. No real spreadsheet application or Google account was modified.
- Backup restoration is planned into a new test folder without replacing a working original. A written plan does not establish that a backup exists, can be restored, or that any account recovery has succeeded.

## Local checks performed for days 10–23

- Parsed the complete course with the application's bundled `courseContentSchema`: passed.
- Compared the first nine lessons against `git show HEAD:src/content/courses/digital-literacy.json` using deep JSON equality: unchanged.
- Checked all new titles over 15 characters, summaries over 80 characters, numbered 1–4 task format, reference answers over 180 characters, all RU/TG/EN sections at least 250 characters: passed; shortest new section is 251 characters.
- `python -I scripts/course-authoring/audit.py digital-literacy`: 23 days; all missing/template/translation/criteria checks zero; dominant correct position 33%, longest correct answer 30%; no copied practice solutions found by the audit.
- Ran no live account, operating-system permissions, installation or recovery operation. Independent pedagogy/translation review and reader accessibility trials remain separate work. Root integration owns the final 30-day count, generated reports and browser/full-suite validation.


# Digital Literacy days 24–30: source review fragment

Reviewed on 16 November 2026 for the existing approved module “Совместная работа и самостоятельность”. This fragment contains seven original RU/TG/EN lessons, 28 sections, 21 questions, seven independent written exercises and a task-specific three-level final-project rubric. It changes no course IDs, prior lessons or application behavior.

## Primary pages actually opened and read

| Topic / lesson | Source | Verified scope used |
|---|---|---|
| 24, 25, 28–30 | [Google Drive: Share and manage access to files and folders](https://support.google.com/drive/answer/7166529?hl=en) | Viewer/Commenter/Editor roles; audience and role are separate choices; shared-folder inheritance; a file cannot reduce an inherited parent Editor role; organization policies may restrict options. Existing course ID `digital-sharing` is reused. |
| 25 | [Microsoft: Share files and folders in OneDrive](https://support.microsoft.com/en-us/onedrive/share-files-and-folders-in-microsoft-onedrive) | Reading versus editing, link audience, and access arriving through direct grants, folders, groups or links. A person may retain a broader grant after one other grant changes. Personal and organization account interfaces can differ. New ID `digital-onedrive-sharing`. |
| 26, 30 | [Google Docs: Find what changed in a file](https://support.google.com/docs/answer/190843?hl=en) | Browsing prior versions requires editing permission; a prior version can be copied or restored; some revisions may be grouped. Existing course ID `digital-versions` is reused. |
| 26 | [Google Docs: Suggest edits](https://support.google.com/docs/answer/6033474?hl=en) | Suggestions precede acceptance and can be made by Commenters or Editors. A proposed change differs from changing the accepted working text. New ID `digital-docs-suggestions`. |
| 27, 28, 30 | [W3C WAI: Writing for Web Accessibility](https://www.w3.org/WAI/tips/writing/) | Descriptive titles/headings and meaningful link labels, clear instructions and concise language. New ID `digital-accessible-writing`. No numerical contrast threshold is asserted by these lessons. |
| 28, 29 | [NCSC: Backing up your data](https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/always-back-up-your-most-important-data) | A backup is a separate recoverable copy; check that needed data is present; recovery depends on the chosen service or medium. New ID `digital-ncsc-backup`. |
| 29, 30 | [NCSC: Mitigating malware and ransomware attacks, Action 1](https://www.ncsc.gov.uk/guidance/mitigating-malware-and-ransomware-attacks) | Test that restoration works, keep copies separate, and do not treat synchronized changes alone as an independent reserve: damaging changes may propagate. Only this backup scope is adapted; organization incident-response instructions are not prescribed to children. New ID `digital-ncsc-backup-testing`. |

The Google Drive legacy address `https://support.google.com/drive/answer/2494822?hl=en` redirected to the 7166529 page. The canonical existing source is used in the lessons. Two CISA PDF URLs were attempted but returned HTTP 403; they are **not** cited as reviewed evidence and are not added to the course sources:

- `https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf`
- `https://www.cisa.gov/sites/default/files/publications/Cyber%20Essentials%20Toolkit%205%2020200818_508.pdf`

The existing `digital-literacy-reference` FTC source remains the course's established provenance for child safety. The capstone repeats the already taught rule to disclose no real code or password and seek a trusted adult; this fragment does not claim a fresh independent review of that retained page.

## Original authoring choices and limits

- All examples, clubs, source cards, people, folders, role tables and datasets are fictional original exercises. A supplied “confirmed coordinator card” is an exercise condition, not an independently verified real-world event.
- The lesson examples differ from their independent practice. Practice requests textual designs and simulated logs; it creates no cloud account, shares no actual resource, modifies no real permission, sends no message and restores no real file. It asks for no actual passwords, backup codes, contact addresses or private URLs.
- Sharing advice is scoped to the named providers. Folder inheritance in Google Drive is not generalized into an identical rule for every cloud service. The OneDrive lesson highlights multiple access sources without relying on a transient button name or default.
- Restoring an earlier shared-document version changes the current working document, so the explanation requires coordination and distinguishes inspection/copying from replacement. A whole rollback can lose useful newer changes. No version-history retention guarantee is invented.
- Day 28 checks `4 + 7 + 9 = 20` and day 30 checks `6 + 8 + 11 = 25`; these are transparent sums of the exercise numbers. They do not require an actual spreadsheet account. The reference models assign B2/B3/B4 and use `=B2+B3+B4`, the addition already taught in day 15.
- Day 29 explicitly separates expected results from observations marked “not performed”. A reserve missing the newest line cannot establish full recovery of the newest document. A matching filename and owner access are insufficient evidence for all requested checks.
- The final rubric has three specific criteria with distinct zero/partial/full descriptions, aligned with the three practice criteria: traceable kit data; permissions and secret handling; recovery limitations and honest evidence. Its questions ask for evidence within the learner's own answer. It is **Self Reviewed**, not Auto Verified, AI Feedback, Human Reviewed or independently established mastery.

## Fragment validation actually executed

- The fragment was generated by a temporary authoring script before integration and reread as JSON: sequential days 24–30, prerequisites 23–29, 28 sections and 21 unique question IDs.
- In-memory merge with the existing course (without writing the course JSON) passed the real `courseContentSchema`: no issues, 30 lessons at the time of validation.
- Every new section body is 250–700 characters in each RU/TG/EN locale. All seven practices have four numbered steps, two hints, three criteria, reference answers longer than 180 characters in each locale, and `solution` equal to the Russian reference answer.
- Correct positions are distributed 7/7/7 overall and vary across days. No fixed position exists for a particular question number across the module. The conservative longest-answer check including tied maxima is 9/21 (43%) in Russian.
- Full Vitest, course audit, lint, TypeScript, production build and browser checks are integration responsibilities of the root agent; this fragment does not claim those runs.

Independent language/pedagogical review and real learner outcomes remain unverified.

Root review correction: day 28/30 now assigns the input cells and uses explicit addition. Day 30 demonstrates three chosen rubric levels with evidence from the written model and one improvement; actual cloud checks remain unperformed. The corrected fragment was reread on 2026-11-17.
