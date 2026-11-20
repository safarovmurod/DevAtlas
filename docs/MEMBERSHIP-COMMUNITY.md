# Membership and community integration

The `/plans` page distinguishes the free Starter experience from Pro/Expert access. Existing ordinary courses stay free; separately published premium courses require an active database membership. Paid access is provisioned only by a trusted administrator or by the verified Dodo Payments webhook (see `docs/BILLING.md`), never by choosing a plan in the browser.

`POST /api/billing/checkout` accepts an authenticated request with `{"tier":"pro"}` or `{"tier":"expert"}` and creates a Dodo Payments checkout session server-side. Without the five `DODO_*` environment variables it returns HTTP 503 `billing_not_configured`. This endpoint never grants access: membership is granted only after the verified, replay-safe subscription webhook (`/api/billing/webhook`); the browser redirect and `metadata.tier` are never trusted, the plan comes from the product id.

## Database prerequisites

Review migrations in a test Supabase project before any production application. After the account migrations, the community chain is `20261022010000_memberships_chat.sql`, `20261115000000_chat_ultra_only.sql`, `20261116000000_admin_tools.sql`, then `20261118000000_community_all_members.sql`. The Ultra-only migration is historical: the last migration opens the community to every signed-in member whose session passes the MFA/ban check, including Starter. It also adds media/code posts, own-message deletion and the private `community-media` bucket. Billing has its separate incremental migration documented in `docs/BILLING.md`.

For progress sync, apply `20261118010000_progress_revision_guard.sql` after the account/progress migrations. It rejects a NULL expected revision without changing valid compare-and-swap calls; negative and stale revisions still return `PT409`.

On 2026-11-18, the owner-authorized hosted check matched existing Ultra-only, admin-tools and Dodo-billing migration metadata in project `fqboksromagjdzrpijeb`. The final community migration, progress revision guard and `20261118020000_course_storage.sql` were then applied successfully. This confirms migration application; live account/MFA and payment lifecycle tests remain separate. The course release upload is still pending, so the bucket's creation does not establish that course assets are published.

The community tables and final behavior are:

- `react_mentor_memberships`: users can read their own membership; no browser insert/update/delete grants or policies exist. Only a trusted administrator or verified billing service provisions `pro` or `expert` with an explicit future `expires_at`. A paid plan is not required for community access.
- `react_mentor_chat_messages`: allowed signed-in sessions read messages. Users cannot directly write messages. The RPCs derive author/time/profile name on the server, validate text (1–2000 characters) or code (1–8000), check ownership/type/size of attachments, serialize submissions and enforce a 2-second gap and 20 messages per minute per account. Images are limited to 5 MB and videos to 25 MB.
- `react_mentor_chat_presence`: the heartbeat RPC derives caller/time. Updates are coalesced to at most one per 15 seconds; rows older than 90 seconds are excluded from reads. Old rows do not imply active users; they can be periodically pruned operationally.

The API uses the caller's JWT, verifies the authenticated user and current MFA/ban requirement, reads membership from the database and fails closed when storage is unavailable. Message JSON is bounded at 20,000 bytes and bodies are plaintext. The UI renders text using React escaping, not HTML. Message history is limited to the latest 60 messages. Media links are signed for one hour from a private bucket. Network polling is every 5 seconds while the page is visible; heartbeat is every 30 seconds. There are no invented messages or online users. An account switch remounts and clears the private chat state.

## Validation boundaries

Focused tests validate membership expiry/fail-closed behavior, authentication requirements, unavailable checkout, rejected forged author/time fields, payload limits and database RPC error mapping. These API tests mock the database. Separately, `tests/database-migrations.test.ts` checks the historical Ultra-only state in PGlite; `tests/community-database.test.ts` checks the final all-members migration, media ownership/limits and role policies. `tests/progress-database.test.ts` checks the additive revision guard and existing progress contract. Their identity/storage helpers model Supabase; they do not demonstrate a deployed Supabase instance or payment integration.

Before production, test with real accounts A/B across Starter, paid and expired memberships: all allowed signed-in members can read/send; anonymous, banned and MFA-unsatisfied sessions cannot; direct table writes must fail; media ownership/type/size policies must hold; concurrent message bursts must hit DB rate limits; presence must expire after disconnection; script-looking text must remain literal. Also verify Dodo's signed webhook lifecycle in the intended environment, define moderation/retention/support policies, run deployment load/security tests and set operational database retention limits.

## Premium course content boundaries

Course catalog `accessTier` metadata defaults existing ordinary courses to Starter. `javascript-pro`, `backend-pro`, `ux-pro` and `business-pro` require Pro; `architecture-expert` requires Expert. Expert includes Pro. Unknown catalog IDs do not default to free.

`GET /api/courses/:courseId` checks verified Bearer authentication and protected membership expiry before loading premium content. Missing authentication returns 401 `authentication_required`; insufficient membership returns 403 `membership_required` with `requiredTier`; unavailable storage returns 503 `service_unavailable`. Denials contain no lesson or solution data. Premium success and denial responses are `private, no-store`.

The local tutor applies the same guard before looking up premium reference answers. Attachments are authorized before reading bytes unless the same verified hash is also published by an ordinary course. A file shared between Pro and Expert is accessible to Pro. Clients downloading future premium attachments must use authenticated Bearer fetch rather than a bare anchor URL; no browser-cookie authorization fallback is implemented.

Focused mocked tests cover hierarchy, expiry, fail-closed storage, body non-disclosure, unauthenticated tutor reference attempts and premium-only attachment checks. Actual live Supabase account and membership tests remain a deployment prerequisite.
