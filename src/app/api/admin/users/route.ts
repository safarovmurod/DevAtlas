import { requireAdmin } from '@/lib/account/require-admin';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const PER_PAGE = 50;

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
