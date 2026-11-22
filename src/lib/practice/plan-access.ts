import { authenticatedUser } from '@/lib/account/require-user';
import { serverMembership } from '@/lib/billing/entitlements';
import { FEATURE_PLAN, planForTier, planIncludes, type PlanFeature } from '@/lib/billing/plans';
import { getSupabaseServerClient } from '@/lib/supabase/server';

function deny(error: string, status: number, feature: PlanFeature) {
  return Response.json(
    { error, ...(status === 403 ? { requiredPlan: FEATURE_PLAN[feature] } : {}) },
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
  return featurePlanDenial(request, 'practiceTasks');
}

export type FeaturePlanAccessResult =
  { denial: Response; userId?: never } | { denial: null; userId: string | null };

export async function featurePlanAccess(
  request: Request,
  feature: PlanFeature,
): Promise<FeaturePlanAccessResult> {
  if (typeof window !== 'undefined') throw new Error('Practice plan check is server-only');
  const authorization = request.headers.get('authorization') ?? '';
  const client = getSupabaseServerClient(authorization || undefined);
  if (!client)
    return process.env.NODE_ENV === 'production'
      ? { denial: deny('service_unavailable', 503, feature) }
      : { denial: null, userId: null };
  if (!authorization.startsWith('Bearer ') || !authorization.slice(7).trim())
    return { denial: deny('authentication_required', 401, feature) };
  try {
    const user = await authenticatedUser(request);
    if (!user) return { denial: deny('authentication_required', 401, feature) };
    const membership = await serverMembership(client, user.id);
    if (!membership.available) return { denial: deny('service_unavailable', 503, feature) };
    if (!planIncludes(planForTier(membership.tier), feature))
      return { denial: deny('membership_required', 403, feature) };
    return { denial: null, userId: user.id };
  } catch {
    return { denial: deny('service_unavailable', 503, feature) };
  }
}

export async function featurePlanDenial(
  request: Request,
  feature: PlanFeature,
): Promise<Response | null> {
  const result = await featurePlanAccess(request, feature);
  return result.denial;
}
