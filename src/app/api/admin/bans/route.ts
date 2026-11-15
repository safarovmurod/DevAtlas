import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import {
  audit,
  forbiddenReason,
  FOREVER_HOURS,
  json,
  loadAdminUser,
  parseBody,
} from '@/lib/account/admin-users';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const Body = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('ban'),
    userId: z.string().uuid(),
    // null = until unbanned (Supabase's 100-year ban).
    days: z.number().int().min(1).max(3650).nullable(),
  }),
  z.object({ action: z.literal('unban'), userId: z.string().uuid() }),
]);

/**
 * Admin-only: block or unblock sign-in through Supabase Auth `ban_duration`. A banned
 * account cannot sign in or refresh its session; our API and RLS also refuse it at once.
 */
export async function POST(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const parsed = await parseBody(request, Body, 512);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);
  const target = await admin.auth.admin.getUserById(body.userId);
  if (target.error || !target.data.user) return json({ error: 'user_not_found' }, 404);
  const user = target.data.user;
  const reason = forbiddenReason(check.user, user, body.action);
  if (reason) return json({ error: reason }, 403);

  const hours = body.action === 'ban' ? (body.days === null ? FOREVER_HOURS : body.days * 24) : 0;
  const updated = await admin.auth.admin.updateUserById(body.userId, {
    ban_duration: body.action === 'ban' ? `${hours}h` : 'none',
  });
  if (updated.error) return json({ error: 'unavailable' }, 503);
  await audit(
    admin,
    check.user,
    body.action,
    { id: user.id, email: user.email },
    body.action === 'ban' ? { days: body.days } : {},
  );
  try {
    return json({ user: await loadAdminUser(admin, body.userId, check.user) });
  } catch {
    return json({ user: null });
  }
}
