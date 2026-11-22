import type { User } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import {
  activeBan,
  audit,
  isAdminUser,
  json,
  MEMBERSHIPS,
  NOTIFICATIONS,
  parseBody,
} from '@/lib/account/admin-users';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const MESSAGE_MAX = 500;
// Control characters other than line breaks are removed; the text is shown as plain text.
const CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F]/g;

const MessageField = z
  .string()
  .max(2000)
  .transform((value) => value.replace(CONTROL, '').trim())
  .pipe(z.string().min(1).max(MESSAGE_MAX));

const DirectBody = z.object({
  userId: z.string().uuid(),
  message: MessageField,
});

const BroadcastBody = z.object({
  broadcast: z.literal(true),
  audience: z.enum(['all', 'paid', 'free']).default('all'),
  message: MessageField,
});

const Body = z.union([DirectBody, BroadcastBody]);

/**
 * Admin-only: send a plain-text notification to one user, or broadcast to all / paid / free
 * non-banned learners at once. Every send is server-verified and written to the audit log.
 */
export async function POST(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const parsed = await parseBody(request, Body, 4096);
  if (!parsed.ok) return parsed.response;

  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);

  if ('userId' in parsed.data) {
    const { userId, message } = parsed.data;
    const target = await admin.auth.admin.getUserById(userId);
    if (target.error || !target.data.user) return json({ error: 'user_not_found' }, 404);

    const saved = await admin
      .from(NOTIFICATIONS)
      .insert({ user_id: userId, body: message, created_by: check.user.id });
    if (saved.error) return json({ error: 'unavailable' }, 503);
    await audit(
      admin,
      check.user,
      'notify',
      { id: userId, email: target.data.user.email },
      { length: message.length },
    );
    return json({ sent: true, count: 1 });
  }

  // Broadcast flow: fetch non-banned learners and insert notification rows in bounded chunks.
  const { audience, message } = parsed.data;
  const users: User[] = [];
  for (let scan = 1; scan <= 5; scan += 1) {
    const listed = await admin.auth.admin.listUsers({ page: scan, perPage: 1000 });
    if (listed.error) return json({ error: 'unavailable' }, 503);
    users.push(...listed.data.users);
    if (listed.data.users.length < 1000) break;
  }

  let recipients = users.filter((u) => !isAdminUser(u) && activeBan(u) === null);
  if (audience === 'paid' || audience === 'free') {
    const nowIso = new Date().toISOString();
    const activePlans = await admin
      .from(MEMBERSHIPS)
      .select('user_id')
      .gt('expires_at', nowIso)
      .limit(10_000);
    if (activePlans.error) return json({ error: 'unavailable' }, 503);
    const paidIds = new Set((activePlans.data ?? []).map((row) => String(row.user_id)));
    recipients =
      audience === 'paid'
        ? recipients.filter((u) => paidIds.has(u.id))
        : recipients.filter((u) => !paidIds.has(u.id));
  }

  let delivered = 0;
  for (let i = 0; i < recipients.length; i += 200) {
    const chunk = recipients.slice(i, i + 200).map((u) => ({
      user_id: u.id,
      body: message,
      created_by: check.user.id,
    }));
    if (!chunk.length) continue;
    const saved = await admin.from(NOTIFICATIONS).insert(chunk);
    if (saved.error) return json({ error: 'unavailable' }, 503);
    delivered += chunk.length;
  }

  await audit(admin, check.user, 'broadcast_notify', null, {
    audience,
    count: delivered,
    length: message.length,
  });
  return json({ sent: true, count: delivered });
}
