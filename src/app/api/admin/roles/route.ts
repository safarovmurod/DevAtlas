import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import {
  activeBan,
  audit,
  forbiddenReason,
  json,
  loadAdminUser,
  parseBody,
} from '@/lib/account/admin-users';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const Body = z.object({
  userId: z.string().uuid(),
  action: z.enum(['grant', 'revoke']),
});

/**
 * Owner-only: give or remove the admin role (`app_metadata.app_role`). The role is read
 * with `getUser` on every admin request, so a removed role stops working at once even if
 * the person's browser still holds an older token.
 */
export async function POST(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const parsed = await parseBody(request, Body, 512);
  if (!parsed.ok) return parsed.response;
  const { userId, action } = parsed.data;
  const kind = action === 'grant' ? 'role_grant' : 'role_revoke';

  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);
  const target = await admin.auth.admin.getUserById(userId);
  if (target.error || !target.data.user) return json({ error: 'user_not_found' }, 404);
  const user = target.data.user;
  const reason = forbiddenReason(check.user, user, kind);
  if (reason) return json({ error: reason }, 403);
  if (action === 'grant' && (!user.email_confirmed_at || user.is_anonymous))
    return json({ error: 'email_not_confirmed' }, 400);
  if (action === 'grant' && activeBan(user)) return json({ error: 'target_banned' }, 409);

  // The whole object is sent back so other keys (providers, app_owner) are kept;
  // null removes the role.
  const updated = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { ...(user.app_metadata ?? {}), app_role: action === 'grant' ? 'admin' : null },
  });
  if (updated.error) return json({ error: 'unavailable' }, 503);
  await audit(admin, check.user, kind, { id: user.id, email: user.email });
  try {
    return json({ user: await loadAdminUser(admin, userId, check.user) });
  } catch {
    return json({ user: null });
  }
}
