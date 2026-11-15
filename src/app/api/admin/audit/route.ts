import { requireAdmin } from '@/lib/account/require-admin';
import { AUDIT, json } from '@/lib/account/admin-users';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

type AuditRow = {
  id: string;
  actor_email: string | null;
  action: string;
  target_id: string | null;
  target_email: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

/** Admin-only: the latest entries of the admin audit log (newest first). */
export async function GET(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);

  const raw = new URL(request.url).searchParams.get('limit') ?? '30';
  const limit = /^\d{1,3}$/.test(raw) ? Math.min(100, Math.max(1, Number(raw))) : 30;
  const found = await admin
    .from(AUDIT)
    .select('id,actor_email,action,target_id,target_email,details,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (found.error) return json({ error: 'unavailable' }, 503);
  return json({
    entries: ((found.data ?? []) as AuditRow[]).map((row) => ({
      id: row.id,
      actorEmail: row.actor_email,
      action: row.action,
      targetId: row.target_id,
      targetEmail: row.target_email,
      details: row.details ?? {},
      createdAt: row.created_at,
    })),
  });
}
