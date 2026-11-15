import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import { audit, json, NOTIFICATIONS, parseBody } from '@/lib/account/admin-users';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const MESSAGE_MAX = 500;
// Control characters other than line breaks are removed; the text is shown as plain text.
const CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F]/g;

const Body = z.object({
  userId: z.string().uuid(),
  message: z
    .string()
    .max(2000)
    .transform((value) => value.replace(CONTROL, '').trim())
    .pipe(z.string().min(1).max(MESSAGE_MAX)),
});

/** Admin-only: send one plain-text message to one user. It appears as a toast on their screen. */
export async function POST(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const parsed = await parseBody(request, Body, 4096);
  if (!parsed.ok) return parsed.response;
  const { userId, message } = parsed.data;

  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);
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
  return json({ sent: true });
}
