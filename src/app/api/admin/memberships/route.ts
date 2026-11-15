import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const DAY_MS = 86_400_000;

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
  z.object({ action: z.literal('revoke'), userId: z.string().uuid() }),
]);

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

/** Admin-only: give, extend or cancel a paid membership. Service role stays on the server. */
export async function POST(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);

  let parsed;
  try {
    parsed = Body.safeParse(await readBoundedJson(request, 1024));
  } catch (error) {
    return json(
      { error: 'invalid_request' },
      error instanceof RequestBodyError ? error.status : 400,
    );
  }
  if (!parsed.success) return json({ error: 'invalid_request' }, 400);
  const body = parsed.data;

  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);

  const target = await admin.auth.admin.getUserById(body.userId);
  if (target.error || !target.data.user) return json({ error: 'user_not_found' }, 404);

  const existing = await admin
    .from('react_mentor_memberships')
    .select('tier,expires_at')
    .eq('user_id', body.userId)
    .maybeSingle();
  if (existing.error) return json({ error: 'unavailable' }, 503);

  if (body.action === 'revoke') {
    if (!existing.data) return json({ error: 'no_membership' }, 404);
    const removed = await admin
      .from('react_mentor_memberships')
      .delete()
      .eq('user_id', body.userId);
    if (removed.error) return json({ error: 'unavailable' }, 503);
    console.info('admin membership revoke', { admin: check.user.id, target: body.userId });
    return json({ membership: null });
  }

  const now = Date.now();
  let tier: 'pro' | 'expert';
  let base = now;
  if (body.action === 'extend') {
    if (!existing.data) return json({ error: 'no_membership' }, 404);
    tier = existing.data.tier === 'expert' ? 'expert' : 'pro';
    // Extending an active plan continues from its end, an expired one restarts from today.
    base = Math.max(now, new Date(existing.data.expires_at).getTime());
  } else {
    tier = body.tier;
  }
  const expiresAt = new Date(base + body.days * DAY_MS).toISOString();
  const saved = await admin
    .from('react_mentor_memberships')
    .upsert(
      { user_id: body.userId, tier, expires_at: expiresAt, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  if (saved.error) return json({ error: 'unavailable' }, 503);
  console.info(`admin membership ${body.action}`, {
    admin: check.user.id,
    target: body.userId,
    tier,
  });
  return json({ membership: { tier, expiresAt } });
}
