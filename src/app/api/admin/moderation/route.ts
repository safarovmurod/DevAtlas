import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import { audit, json, loadAdminUser, parseBody } from '@/lib/account/admin-users';
import { resetUserModeration } from '@/lib/tutor/strikes';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const Body = z.object({
  action: z.literal('reset'),
  userId: z.string().uuid(),
});

/** Admin-only: clear a learner's off-topic & profanity strikes/blocks immediately. */
export async function POST(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const parsed = await parseBody(request, Body, 1024);
  if (!parsed.ok) return parsed.response;
  const { userId } = parsed.data;

  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);
  const target = await admin.auth.admin.getUserById(userId);
  if (target.error || !target.data.user) return json({ error: 'user_not_found' }, 404);

  const ok = await resetUserModeration(userId);
  if (!ok) return json({ error: 'unavailable' }, 503);
  await audit(admin, check.user, 'moderation_reset', {
    id: userId,
    email: target.data.user.email,
  });

  try {
    const user = await loadAdminUser(admin, userId, check.user);
    return json({
      user: user
        ? {
            ...user,
            moderation: {
              offTopicStrikes: 0,
              offTopicBlocked: false,
              offTopicBlockedUntil: null,
              profanityStrikes: 0,
              profanityBlocked: false,
              profanityBlockedUntil: null,
            },
          }
        : null,
    });
  } catch {
    return json({ user: null });
  }
}
