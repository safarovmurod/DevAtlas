import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const PER_PAGE = 50;
const DeleteBody = z.object({
  userId: z.string().uuid(),
  confirmEmail: z.string().trim().min(3).max(320),
});

/**
 * Permanently deletes an account and everything linked to it (all tables reference
 * auth.users with ON DELETE CASCADE). It cannot be undone, so the caller must retype the
 * account email. Admins, including the caller, cannot be deleted here.
 */
export async function DELETE(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);

  let parsed;
  try {
    parsed = DeleteBody.safeParse(await readBoundedJson(request, 1024));
  } catch (error) {
    return json(
      { error: 'invalid_request' },
      error instanceof RequestBodyError ? error.status : 400,
    );
  }
  if (!parsed.success) return json({ error: 'invalid_request' }, 400);
  const { userId, confirmEmail } = parsed.data;
  if (userId === check.user.id) return json({ error: 'cannot_delete_admin' }, 403);

  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);
  const target = await admin.auth.admin.getUserById(userId);
  if (target.error || !target.data.user) return json({ error: 'user_not_found' }, 404);
  const user = target.data.user;
  if (user.app_metadata?.app_role === 'admin') return json({ error: 'cannot_delete_admin' }, 403);
  if (!user.email || user.email.toLowerCase() !== confirmEmail.toLowerCase())
    return json({ error: 'email_mismatch' }, 400);

  const removed = await admin.auth.admin.deleteUser(userId);
  if (removed.error) return json({ error: 'unavailable' }, 503);
  console.info('admin user delete', { admin: check.user.id, target: userId });
  return json({ deleted: true });
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

/** Admin-only list of accounts with their paid membership, fifty per page. */
export async function GET(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);

  const raw = new URL(request.url).searchParams.get('page') ?? '1';
  const page = /^\d{1,4}$/.test(raw) ? Math.max(1, Number(raw)) : 1;

  const listed = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
  if (listed.error) return json({ error: 'unavailable' }, 503);

  const ids = listed.data.users.map((user) => user.id);
  const tiers = new Map<string, { tier: string; expiresAt: string }>();
  if (ids.length) {
    const memberships = await admin
      .from('react_mentor_memberships')
      .select('user_id,tier,expires_at')
      .in('user_id', ids);
    if (memberships.error) return json({ error: 'unavailable' }, 503);
    for (const row of memberships.data ?? [])
      tiers.set(row.user_id, { tier: row.tier, expiresAt: row.expires_at });
  }

  const reported = (listed.data as { total?: number }).total;
  const total = typeof reported === 'number' ? reported : listed.data.users.length;
  return json({
    page,
    perPage: PER_PAGE,
    total,
    users: listed.data.users.map((user) => ({
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
      emailConfirmed: Boolean(user.email_confirmed_at),
      providers: Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers : [],
      isAdmin: user.app_metadata?.app_role === 'admin',
      membership: tiers.get(user.id) ?? null,
    })),
  });
}
