import { authenticatedUser } from '@/lib/account/require-user';
import { serverMembership } from '@/lib/billing/entitlements';
import { practiceOpenForTier } from '@/lib/billing/practice-access';
import { getSupabaseServerClient } from '@/lib/supabase/server';

function deny(error: string, status: number) {
  return Response.json(
    { error, ...(status === 403 ? { requiredPlan: 'pro' } : {}) },
    { status, headers: { 'Cache-Control': 'private, no-store' } },
  );
}

/**
 * Server check for practice routes (submit, graded assessment). Returns a response to send
 * when the caller's plan does not include practice, or null when the request may continue.
 * The plan is read from the database with the caller's own token, never from the body.
 * Without Supabase there are no accounts and no plans to sell, so practice stays open.
 */
export async function practicePlanDenial(request: Request): Promise<Response | null> {
  if (typeof window !== 'undefined') throw new Error('Practice plan check is server-only');
  const authorization = request.headers.get('authorization') ?? '';
  const client = getSupabaseServerClient(authorization || undefined);
  if (!client) return null;
  if (!authorization.startsWith('Bearer ') || !authorization.slice(7).trim())
    return deny('authentication_required', 401);
  try {
    const user = await authenticatedUser(request);
    if (!user) return deny('authentication_required', 401);
    const membership = await serverMembership(client, user.id);
    if (!membership.available) return deny('service_unavailable', 503);
    if (!practiceOpenForTier(membership.tier)) return deny('membership_required', 403);
    return null;
  } catch {
    return deny('service_unavailable', 503);
  }
}
