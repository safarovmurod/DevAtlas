import { authenticatedUser } from '@/lib/account/require-user';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { communityResponse } from '@/lib/billing/community-server';
import {
  allowProviderCall,
  MEMBERSHIPS,
  siteOrigin,
  tierRank,
  type MembershipRow,
} from '@/lib/billing/billing-server';
import {
  changeSubscriptionPlan,
  createCheckoutSession,
  DodoApiError,
} from '@/lib/billing/dodo-client';
import { getDodoConfig, type PaidTier } from '@/lib/billing/dodo-config';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const COLUMNS =
  'tier,expires_at,source,provider,provider_subscription_id,provider_status,cancel_at_period_end';

/**
 * Starts a real payment for Pro or Ultra. `tier` is the stored name (`expert` is Ultra).
 *
 * - Without the Dodo settings nothing happens (`billing_not_configured`).
 * - Someone who already has this plan or a higher one cannot buy it again (`already_subscribed`).
 * - Upgrade Pro -> Ultra with a paid Pro subscription changes THAT subscription at Dodo
 *   (charged for the difference now), so there is never a second subscription.
 * - A subscription that is on hold, past due or already scheduled to cancel is managed in the
 *   customer portal (`manage_in_portal`): a new checkout would create a second subscription.
 * - Access is never granted here. Only the verified webhook changes the database.
 */
export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return communityResponse({ error: 'authentication_required' }, 401);
  let body: unknown;
  try {
    body = await readBoundedJson(request, 1024);
  } catch (error) {
    return communityResponse(
      { error: 'invalid_request' },
      error instanceof RequestBodyError ? error.status : 400,
    );
  }
  if (
    !body ||
    typeof body !== 'object' ||
    !('tier' in body) ||
    !['pro', 'expert'].includes(String(body.tier))
  ) {
    return communityResponse({ error: 'invalid_plan' }, 400);
  }
  const tier = body.tier as PaidTier;

  const config = getDodoConfig();
  if (!config) return communityResponse({ error: 'billing_not_configured' }, 503);
  const admin = getSupabaseAdminClient();
  if (!admin) return communityResponse({ error: 'service_unavailable' }, 503);
  if (!user.email) return communityResponse({ error: 'email_required' }, 400);
  if (!allowProviderCall(user.id)) return communityResponse({ error: 'too_many_requests' }, 429);

  const found = await admin.from(MEMBERSHIPS).select(COLUMNS).eq('user_id', user.id).maybeSingle();
  if (found.error) return communityResponse({ error: 'service_unavailable' }, 503);
  const row = (found.data as MembershipRow | null) ?? null;

  if (row) {
    const active = Date.parse(row.expires_at) > Date.now();
    if (active && tierRank(row.tier) >= tierRank(tier))
      return communityResponse({ error: 'already_subscribed' }, 409);
    const paid =
      row.source === 'payment' && row.provider === 'dodo' && !!row.provider_subscription_id;
    if (paid && (row.provider_status === 'on_hold' || row.provider_status === 'past_due'))
      return communityResponse({ error: 'manage_in_portal' }, 409);
    if (active && paid) {
      // Upgrade of a paid subscription: change the plan instead of creating a second one.
      if (row.provider_status !== 'active' || row.cancel_at_period_end)
        return communityResponse({ error: 'manage_in_portal' }, 409);
      try {
        const changed = await changeSubscriptionPlan(config, row.provider_subscription_id!, tier);
        if (changed.url) return communityResponse({ url: changed.url });
        return communityResponse({ upgraded: true });
      } catch (error) {
        logProviderFailure('change-plan', error);
        return communityResponse({ error: 'provider_error' }, 502);
      }
    }
    // An admin gift of a lower plan, or an ended plan: a normal checkout is fine.
  }

  const origin = siteOrigin(request);
  try {
    const session = await createCheckoutSession(config, {
      tier,
      userId: user.id,
      email: user.email,
      // `plan` only tells the page which plan to wait for. It proves nothing.
      returnUrl: `${origin}/plans?checkout=return&plan=${tier === 'expert' ? 'ultra' : 'pro'}`,
      cancelUrl: `${origin}/plans?checkout=cancelled`,
    });
    return communityResponse({ url: session.url });
  } catch (error) {
    logProviderFailure('checkout', error);
    return communityResponse({ error: 'provider_error' }, 502);
  }
}

function logProviderFailure(step: string, error: unknown) {
  // Status and code only: never the key, the email or the response body.
  console.error('billing provider call failed', {
    step,
    status: error instanceof DodoApiError ? error.status : null,
    code: error instanceof DodoApiError ? error.code : null,
  });
}
