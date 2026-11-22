import { authenticatedUser } from '@/lib/account/require-user';
import { isPrivilegedUser } from '@/lib/account/admin-users';
import { communityResponse } from '@/lib/billing/community-server';
import { MEMBERSHIPS, toBillingStatus, type MembershipRow } from '@/lib/billing/billing-server';
import { getDodoConfig } from '@/lib/billing/dodo-config';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const FULL =
  'tier,expires_at,source,provider,provider_customer_id,provider_status,cancel_at_period_end';

/**
 * What the plans page and workspace badges need: are payments switched on, and what does
 * the DATABASE say about the signed-in user's plan. Without a login only `configured` is
 * returned. Verified owner/admin accounts always retain unrestricted Ultra entitlements.
 */
export async function GET(request: Request) {
  const configured = Boolean(getDodoConfig());
  const user = await authenticatedUser(request);
  if (!user) return communityResponse(toBillingStatus(null, configured, false));
  const client = getSupabaseServerClient(request.headers.get('authorization') || undefined);
  if (!client) return communityResponse({ error: 'service_unavailable' }, 503);

  let result = await client.from(MEMBERSHIPS).select(FULL).eq('user_id', user.id).maybeSingle();
  // Before the billing migration is applied the provider columns do not exist yet.
  if (result.error)
    result = await client
      .from(MEMBERSHIPS)
      .select('tier,expires_at,source')
      .eq('user_id', user.id)
      .maybeSingle();
  if (result.error) return communityResponse({ error: 'service_unavailable' }, 503);

  const status = toBillingStatus((result.data as MembershipRow | null) ?? null, configured, true);
  const privileged = isPrivilegedUser(user);
  if (!privileged) return communityResponse(status);
  if (!status.membership || !status.membership.active) {
    return communityResponse({
      ...status,
      isPrivileged: true,
      membership: {
        tier: 'expert' as const,
        expiresAt: new Date(Date.now() + 365 * 86_400_000).toISOString(),
        active: true,
        source: 'admin' as const,
        status: null,
        cancelAtPeriodEnd: false,
        canManage: false,
      },
    });
  }
  return communityResponse({ ...status, isPrivileged: true });
}
