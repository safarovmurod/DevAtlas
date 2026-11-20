# Digital Marketing course review — 17 November 2026

Status: completed as a local continuation in the existing main checkout. This review owns `digital-marketing.json` and this source note. The initial audit found 30 scheduled days, three theory sections on every day, five questions per day, and missing linked feedback on all 30 days. Five code exercises already have executable JavaScript contracts on days 19, 20, 22, 23 and 26. Those contracts were preserved untouched (`funnelRates`, `buildUtm`, `kpiCompletion`, `campaignCosts`, `abCompare`); `verify_js` reports 0 problems and the dedicated vitest run passes all declared cases, including zero and invalid inputs.

The first full English read of the 30 lessons identified several factual and task/reference issues for the local authoring pass. CTR uses clicks over impressions, while the course called visits clicks without defining that simplification. The existing UTM exercise accepts only simple bases but its task did not state that boundary. The email example deleted unsubscribed addresses without considering suppression. Cookie identifiers were described as anonymous. The sequential Wednesday/Sunday comparison was presented as a randomized A/B test. Acquisition CPA was confused with a customer's ticket price, a per-meeting cost became per-attendee, and the final project reference claimed a real colleague test. Each correction retained the original IDs and option positions.

## Completed in this pass

### Claim fixes re-verified against the current file before editing (day / field)

- Day 2 `q04`/`q05` hints: the two hints were swapped with unrelated questions (the link-hint sat on the claim question, a zero-denominator hint sat on the personal-data question). Hints now match their questions; `q05.relatedSection` moved 2→0 ("Funnels and conversion" holds the personal-data-in-links rule).
- Day 20 section "Attribution: the last touch" (RU/TG/EN): "the awareness channel **always** looks worse than the action channel" was a false universal — under last-click attribution a first touch can also be the last touch. Now hedged ("usually", "одатан") with the mechanism named: when another channel closes the action the first touch gets no credit. Question `q05` and its hint aligned; `relatedSection` 3→2.
- Day 28 section "Worked example" and `referenceAnswer`/`solution` (RU/TG/EN): "unsubscribing deletes the address" contradicted day 15's suppression-vs-erasure distinction. Now: unsubscribing stops sends immediately; erasure is a separate request; a service may keep a minimal suppression mark. Also "anonymous consented events (day 21)" replaced with "consented pseudonymous events, no names" — day 21 states a cookie ID is pseudonymous, not anonymous.
- Day 29 `referenceAnswer`/`solution` (RU/TG/EN): the stranger test claimed "a colleague understood the campaign in five minutes" — fabricated real-person feedback that contradicted the same lesson's own rule "if no colleague read the case, mark the reader check unrun". Now recorded as prepared-but-unrun. Criterion 3 reworded from "tests pass with recorded results" to "tests have recorded results" so an honest unrun status satisfies it.

### Claims already repaired by the earlier structure/feedback pass and re-verified today (no further edit needed)

- CTR = clicks / impressions with the visits-as-aligned-click-throughs contract documented on days 2 and 19 (theory, solution prose, `q01`).
- Cookie ID not anonymous: days 18 and 21 state pseudonymous recognition; declining visitors fall outside the measured sample.
- Unsubscribe/suppression distinct from deletion: day 15's dedicated section.
- Wednesday/Sunday posts: day 25 states coin-flip ordering is not random assignment; day 26 records the −9.6-point gap as observational.
- CPA = organizer's cost per conversion, not the attendee's ticket price: day 23 sections 2 and 4.
- Tea cost per meeting ≠ per attendee (5/10 = 0.5 per attendee): day 24 section 4 and reference.
- UTM builder input boundary (base without `?`/`#`, no reachability check): day 20 section 4 and task step 1.
- Generalizations: day 4, 9, 13, 14, 25 carry explicit hedges; the remaining "always"-worded lines are intentional wrong quiz distractors.

### Written rubrics added (25 written days)

All 25 written-practice days (1–18, 21, 24, 25, 27–30, including the day-29 assembly and the day-30 final project defense) now carry a `practice.rubric` following the management-foundations pattern: `version: 1`, three criteria 1:1 with `practice.criteria` (same order), each with weight 1 and levels 0/1/2 (deficit → partial → full with concrete evidence), plus two reviewer questions per day. Criterion ids are kebab-case and unique per rubric. Code days (19/20/22/23/26) keep Auto Verified execution with no rubric, as the schema requires.

### Practice/reference review of all 30 days

Read in full (English, with RU/TG spot checks on every edit). Results: every written reference now fulfills its task steps; the five execution references are the function contracts themselves; calculations re-checked (20%/20%/4% funnel, 600-spend CPC/CPM/CPA/ROAS, 80/60≈1.3 payback, 0.5-per-attendee tea, 12/48 vs 8/52 CTR comparison, 235%/133%/210%/0% KPI board). Edge cases are present in references (zero impressions, zero plan, negative margin, all-empty UTM values, zero base CTR). No reference hands the learner a copyable step-by-step solution of the same exercise beyond the already-executable code days, whose `solution` is the checked implementation by design.

### Known limitations (recorded, not fixed, by design)

- `correctIndex` histogram is [148, 2, 0] across 150 questions: the correct option sits first in 148 questions. Reshuffling option order is explicitly out of scope for this pass (IDs, option order and `correctIndex` are preservation-locked), so this is recorded as follow-up work for a future batch with the integration owner; the two exceptions (day-01 `q01`, day-02 `q01` at position 1) are pinned by `tests/digital-marketing-course.test.ts`.
- Three answers are identical across languages because they are tokens ("20%", "4%.", "utm_source, utm_medium, utm_campaign.") — legitimate, and day-02 `q01` is test-pinned.
- Self Reviewed limits stand: no real device/account operations, no team outcomes, no measured listening/pronunciation analog here, no assessed mastery; the capstone states Self Reviewed explicitly and day 30's "What comes next" section names the boundary.

## Sources actually opened (all on 17 November 2026, by this pass unless noted)

| Source | URL | What it confirmed |
| --- | --- | --- |
| Google Ads Help — About CTR | https://support.google.com/google-ads/answer/2615875?hl=en | CTR = "the number of clicks that your ad receives divided by the number of times your ad is shown" (clicks ÷ impressions). Supports days 2 and 19. |
| Google Analytics Help — URL builders / custom URLs | https://support.google.com/analytics/answer/10917952?hl=en | GA4: "you should always use utm_source, utm_medium, and utm_campaign"; values are case sensitive ("google" ≠ "Google"); recommends a strict, consistent, ideally lowercase naming convention. Supports day 20 (three main parameters, "Instagram"/"instagram" distinct). |
| Google Analytics Help — Attribution and attribution modeling | https://support.google.com/analytics/answer/10596866?hl=en | Last-click models "attribute 100% of the key event value to the last channel that the customer clicked through"; all models exclude direct credit unless the path is all-direct. Supports day 20's last-touch description. |
| Google Analytics Help — Sessions | https://support.google.com/analytics/answer/9191807?hl=en | A session is "a period of time during which a user interacts with your website or app", timing out after 30 minutes of inactivity — a session is not an ad click. Supports days 2/19: visits (sessions) ≠ clicks. |
| Google sender guidelines (one-click unsubscribe) | https://support.google.com/a/answer/81126?hl=en | Bulk senders (5,000+ msg/day to Gmail, from Feb 1 2024) "must support one-click unsubscribe" via `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 2369 / RFC 8058) plus a visible link. Supports day 15: visible link and technical one-click header are different mechanisms. |
| Mailchimp — About Unsubscribes | https://mailchimp.com/help/about-unsubscribes | Unsubscribe = opt-out of marketing for that audience; "import their addresses as part of a suppression list" to prevent re-addition as subscribed; resubscription is required to return. Supports days 15 and 28 (suppression ≠ deletion). |
| Mailchimp — Email marketing field guide | https://mailchimp.com/resources/email-marketing-field-guide/ | Warns against purchased lists ("buying email lists… actually isn't a good idea"); mentions compliance and the unsubscribe-rate benchmark. Thin on suppression mechanics — supplemented by the About Unsubscribes page above. |
| Meta Business Help Center — About A/B testing | https://www.facebook.com/business/help/1738164643098669 | Confirmed via the indexed snippet because the page body renders by JS: "Meta's A/B tests split your audience randomly into groups so different versions run simultaneously against a single variable". Supports days 25–26 (concurrent random assignment, one variable). |
| European Commission — Data protection in the EU | https://commission.europa.eu/law/law-topic/data-protection_en | General GDPR portal; the right-to-erasure detail lives on subpages not captured here — recorded as a limitation; the course keeps erasure-vs-suppression generic for that reason. |

Previously opened by the earlier structure pass and relied on: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [Google Ads CTR definition](https://support.google.com/google-ads/answer/2615875?hl=en) (re-verified above today), [Google Analytics data safeguards](https://support.google.com/analytics/answer/6004245?hl=en).

Fetch limitations recorded honestly: `https://support.google.com/analytics/` (root index) contains only navigation, no definitions; `https://ga-dev-tools.google/campaign-url-builder/` and the OpenStax details page render by JavaScript and returned no quotable body, so the UTM parameter evidence comes from the GA4 Help page instead, and the OpenStax reference stays a research-reference title (CC BY-NC-SA per its own listing) without quoted text.

## Checks executed (17 November 2026, coherent file state)

- `npx vitest run tests/digital-marketing-course.test.ts tests/course-quality-guard.test.ts` — 12/12 pass (structure, executable contracts incl. null/invalid cases, capstone honesty markers).
- `npx vitest run tests/course-audit.test.ts` — 8/8 pass (catalog loaders, stale-copy scan over localized rubric/reference text).
- `node scripts/course-authoring/verify_js.mjs src/content/courses/digital-marketing.json` — "checked 5 executable lessons, 0 problems".
- `npx tsc --noEmit` — clean. `npm run lint` — clean.
- Local structure script: 30 lessons × 4 sections × 5 questions (150 total), all RU/TG/EN present and distinct per section/criterion, all question hints present in three languages, `answer == options[correctIndex]` everywhere, 25 written days all with 1:1 rubrics, code days 19/20/22/23/26 without rubrics and with `execution` intact.

## Continuation checkpoint for independent review — 18 November 2026

The current saved JSON has 30 days with four sections and five questions each, 150 linked RU/TG/EN hints, and rubrics on all 25 written days. A later saved continuation added those rubrics and expanded the source note above. The present read verified their existence and inspected days 8, 16, 28, 29 and 30. It did not independently accept every rubric level or certify all 30 task/reference pairs. The completed claim at the top describes authored availability. Independent semantic acceptance remains pending.

Fresh checks at this checkpoint passed `npx vitest run tests/digital-marketing-course.test.ts tests/general-course-content.test.ts`, 10 tests in two files. The calculation test executes all 34 declared fixtures across the five code exercises. A direct comparison with the initial saved data preserved the 30 lesson IDs, days, prerequisites, source IDs, next links, 150 question IDs and option positions. The five `execution` objects and five executable solutions match that baseline exactly. Audit reports zero days below four sections, zero question/hint/translation gaps and five executable lessons. `git diff --check` passed. These checks establish structural and declared calculation behaviour.

Confirmed review work still present in the current saved file includes the following.

- Day 16's reference assigns page visits to an on-page content update and offline return without supplying a consistent supporting measure for those rows. The new fourth section correctly distinguishes their roles, so the reference and older connectivity claims need reconciliation.
- Day 18's older example presents once-per-person-per-day as a default counter rule and places an unlinked door count in the same funnel. The new section describes browser identity and offline attribution limits. Review the old example and counting reference against that definition.
- Day 20's older last-touch discussion still generalizes attribution beyond an explicitly selected model, even after removal of its always claim. Check the current theory and relevant questions against the scoped GA4 documentation.
- Day 28's reference still repairs missing reminder grounds by inserting you agreed at the meeting. The fourth section correctly explains that a sentence cannot create absent consent. Reconcile the reference, older worked example and rubric level with an actual consent record or an unrun subscription plan.
- Day 29's reader check is now honestly unrun, but its assembly repeats upstream counts and persona claims that require checking against the supplied day-4 records and the final event definitions.
- Day 30's reference and theory still mark six criteria met and then all partial because data is fictional. The written-evidence rubric should permit a consistent rating of the stated artefact while retaining its limits. Its next step proposes an A/B repeat on new slots, which must be reconciled with day 25's distinction between random assignment and sequential observation.
- Remaining older learning-flow predictions, summaries and examples require a final pass against the corrected theory. In particular, review the day-19 extra-metric mini-challenge, sample inference and channel guarantees, and any fabricated measured speed or external feedback in practice references.

The existing source note contains earlier executed-check claims and source reads. Those historical checks were not repeated except for the fresh checks specified above. No temporary authoring process is running at this checkpoint. Data Analytics authoring has not started. The working files remain local for the owner's continuation and review.


## Scoped coordinator findings repaired — 18 November 2026

Coordinator reopened only days 16, 28 and 30 after the checkpoint. These repairs supersede the corresponding unresolved entries above; the complete course has not received a new independent semantic acceptance.

- Day 16 sections 0–2, practice hint and reference distinguish the campaign metric from each asset's supporting signal. Reading conditions and repeat attendance are not counted as new page visits. The two offline rows explicitly retain unmeasured/counting-method limitations. Mon2 carries the same hall-photo message and page action in theory and reference. Existing q03 now asks about absence of any clear next action, rather than implying that every offline notice needs a hyperlink. Its original ID/options/answer/correctIndex remain. The dropped-row rubric now asks for an explanation of the missing role, rather than the ambiguous phrase “ties it to neither”.
- Day 28 section 1 and the reference replace the unsupported “you agreed at the meeting” assertion with an unrun explicit signup proposal. No sending is allowed in this case without a recorded choice. The weak-spot rubric requires a repair of the cause, with no fabricated consent evidence. Form implementation, sending and a jurisdiction-specific compliance assessment remain unperformed.
- Day 30 section 1 and the reference use the same six ratings throughout: partial/met/met/partial/met/partial. Ratings concern identified written evidence; fictional status alone does not force every document criterion to partial. The counting-unit and experiment-plan gaps are stated. Section 2/reference select an evidence gap before a larger sample, and distinguish concurrent random assignment from comparing new time slots. Existing q05's correct answer/option wording is repaired in place: “Repeating the experiment on a bigger sample” becomes “Choose a checkable next step that addresses the largest evidence gap.” Option order/count/index and the question ID are unchanged. The pointer rubric accepts an explicit gap alongside a partial rating.

Primary pages opened on 18 November: [GA4 automatically collected events](https://support.google.com/analytics/answer/9234069?hl=en) distinguishes page_view, scroll and other events; [Mailchimp permission](https://mailchimp.com/help/the-importance-of-permission/) requires express permission for its service and describes securing it; [Google consent setup](https://developers.google.com/tag-platform/security/guides/consent) updates consent states from actual user interaction; [Google experiment guidance](https://support.google.com/google-ads/answer/7281575?hl=en) calls for a hypothesis, one changed variable and preselected metrics. These provider descriptions do not establish universal legal compliance. Explanations are original paraphrases; no article text, code or media was imported. No broad reuse licence is claimed for the Help pages or Mailchimp.

Executed after the main alignment save: `verify_js.mjs digital-marketing.json` checked five executable lessons with zero problems; `vitest` on digital-marketing-course + general-course-content passed 10/10. Later Mon2, q03/q05 and rubric edits are text-only, and their final focused rerun is recorded in the handoff. No shared reports were modified. All five executable objects and reference programs remain unchanged. Remaining checkpoint issues include day 18's counting identity, day 20 attribution scope, day 29 provenance and a final pass over old learning-flow claims; this three-day repair is not a full-course semantic certificate.
