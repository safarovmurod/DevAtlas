import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import {
  audit,
  DAY_MS,
  forbiddenReason,
  json,
  loadAdminUser,
  MEMBERSHIPS,
  parseBody,
} from '@/lib/account/admin-users';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

// "expert" is stored for the Ultra plan.
const Body = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('grant'),
    userId: z.string().uuid(),
    tier: z.enum(['pro', 'expert']),
    days: z.number().int().min(1).max(3660),
  }),
  z.object({
    action: z.literal('extend'),
    userId: z.string().uuid(),
    days: z.number().int().min(1).max(3660),
  }),
  z.object({
    action: z.literal('shorten'),
    userId: z.string().uuid(),
    days: z.number().int().min(1).max(3660),
  }),
  z.object({ action: z.literal('revoke'), userId: z.string().uuid() }),
]);

/**
 * Admin-only: give, extend or cancel a paid membership. Service role stays on the server.
 * The response carries the updated user so the panel replaces just that row.
 */
export async function POST(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const parsed = await parseBody(request, Body, 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);

  const target = await admin.auth.admin.getUserById(body.userId);
  if (target.error || !target.data.user) return json({ error: 'user_not_found' }, 404);
  const targetUser = target.data.user;
  // Shortening takes paid time away, so it follows the same owner protection as revoking.
  // The audit log stores it as an extension with negative days (no schema change needed).
  const action =
    body.action === 'shorten' ? 'membership_extend' : (`membership_${body.action}` as const);
  const reason = forbiddenReason(
    check.user,
    targetUser,
    body.action === 'shorten' ? 'membership_revoke' : action,
  );
  if (reason) return json({ error: reason }, 403);

  const existing = await admin
    .from(MEMBERSHIPS)
    .select('tier,expires_at')
    .eq('user_id', body.userId)
    .maybeSingle();
  if (existing.error) return json({ error: 'unavailable' }, 503);

  const now = Date.now();
  const stamp = new Date(now).toISOString();
  let details: Record<string, unknown>;
  if (body.action === 'revoke') {
    if (!existing.data) return json({ error: 'no_membership' }, 404);
    const removed = await admin.from(MEMBERSHIPS).delete().eq('user_id', body.userId);
    if (removed.error) return json({ error: 'unavailable' }, 503);
    details = { tier: existing.data.tier, expiresAt: existing.data.expires_at };
  } else if (body.action === 'extend') {
    if (!existing.data) return json({ error: 'no_membership' }, 404);
    // Extending an active plan continues from its end, an expired one restarts from today.
    const base = Math.max(now, new Date(existing.data.expires_at).getTime());
    const expiresAt = new Date(base + body.days * DAY_MS).toISOString();
    const saved = await admin
      .from(MEMBERSHIPS)
      .update({ expires_at: expiresAt, updated_at: stamp })
      .eq('user_id', body.userId);
    if (saved.error) return json({ error: 'unavailable' }, 503);
    details = { tier: existing.data.tier, days: body.days, expiresAt };
  } else if (body.action === 'shorten') {
    if (!existing.data) return json({ error: 'no_membership' }, 404);
    // Takes days off the current end date. It never goes below "now": the plan then
    // simply ends today and stays in the list as expired, ready for a new grant.
    const end = new Date(existing.data.expires_at).getTime();
    if (end <= now) return json({ error: 'membership_expired' }, 409);
    const expiresAt = new Date(Math.max(now, end - body.days * DAY_MS)).toISOString();
    const saved = await admin
      .from(MEMBERSHIPS)
      .update({ expires_at: expiresAt, updated_at: stamp })
      .eq('user_id', body.userId);
    if (saved.error) return json({ error: 'unavailable' }, 503);
    details = { tier: existing.data.tier, days: -body.days, expiresAt };
  } else {
    // A new grant replaces any previous plan and records who gave it.
    const expiresAt = new Date(now + body.days * DAY_MS).toISOString();
    const saved = await admin.from(MEMBERSHIPS).upsert(
      {
        user_id: body.userId,
        tier: body.tier,
        expires_at: expiresAt,
        updated_at: stamp,
        source: 'admin',
        granted_by: check.user.id,
        granted_at: stamp,
        provider: null,
        provider_customer_id: null,
        provider_subscription_id: null,
        provider_status: null,
        cancel_at_period_end: false,
        provider_event_at: null,
      },
      { onConflict: 'user_id' },
    );
    if (saved.error) return json({ error: 'unavailable' }, 503);
    details = { tier: body.tier, days: body.days, expiresAt };
  }

  await audit(admin, check.user, action, { id: targetUser.id, email: targetUser.email }, details);
  try {
    const user = await loadAdminUser(admin, body.userId, check.user);
    return json({ user });
  } catch {
    return json({ user: null });
  }
}
