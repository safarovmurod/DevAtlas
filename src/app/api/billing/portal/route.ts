import { authenticatedUser } from '@/lib/account/require-user';
import { communityResponse } from '@/lib/billing/community-server';
import { allowProviderCall, MEMBERSHIPS, siteOrigin } from '@/lib/billing/billing-server';
import { createPortalSession, DodoApiError } from '@/lib/billing/dodo-client';
import { getDodoConfig } from '@/lib/billing/dodo-config';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * Opens Dodo's customer portal (cancel, change card, invoices) for the signed-in user.
 * The customer id is read from the user's own membership row, never from the request.
 * After a cancellation the plan stays active until the end of the paid period: the
 * webhook keeps `expires_at` at the next billing date.
 */
export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return communityResponse({ error: 'authentication_required' }, 401);
  const config = getDodoConfig();
  if (!config) return communityResponse({ error: 'billing_not_configured' }, 503);
  const admin = getSupabaseAdminClient();
  if (!admin) return communityResponse({ error: 'service_unavailable' }, 503);
  if (!allowProviderCall(user.id)) return communityResponse({ error: 'too_many_requests' }, 429);

  const found = await admin
    .from(MEMBERSHIPS)
    .select('provider,provider_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (found.error) return communityResponse({ error: 'service_unavailable' }, 503);
  const customerId = found.data?.provider === 'dodo' ? found.data.provider_customer_id : null;
  if (typeof customerId !== 'string' || !customerId)
    return communityResponse({ error: 'no_subscription' }, 404);

  try {
    const session = await createPortalSession(config, customerId, `${siteOrigin(request)}/plans`);
    return communityResponse({ url: session.url });
  } catch (error) {
    console.error('billing provider call failed', {
      step: 'portal',
      status: error instanceof DodoApiError ? error.status : null,
      code: error instanceof DodoApiError ? error.code : null,
    });
    return communityResponse({ error: 'provider_error' }, 502);
  }
}
