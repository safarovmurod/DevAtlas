import type { User } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import {
  activeBan,
  audit,
  forbiddenReason,
  granterEmails,
  isAdminUser,
  isOwnerUser,
  json,
  MEMBERSHIP_COLUMNS,
  MEMBERSHIPS,
  parseBody,
  toAdminUser,
  type MembershipRow,
} from '@/lib/account/admin-users';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const PER_PAGE = 50;
// Filters and search read whole pages of accounts from Supabase Auth. The cap keeps a
// single request bounded; the response says when it was reached.
const SCAN_PER_PAGE = 1000;
const SCAN_MAX_PAGES = 5;
const FILTERS = ['all', 'paid', 'expired', 'admins', 'banned'] as const;
type Filter = (typeof FILTERS)[number];

const DeleteBody = z.object({
  userId: z.string().uuid(),
  confirmEmail: z.string().trim().min(3).max(320),
});

/**
 * Admin-only list of accounts with their membership, fifty per page.
 * `filter` = all | paid | expired | admins | banned, `q` = part of an email.
 */
export async function GET(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);

  const params = new URL(request.url).searchParams;
  const rawPage = params.get('page') ?? '1';
  const page = /^\d{1,4}$/.test(rawPage) ? Math.max(1, Number(rawPage)) : 1;
  const rawFilter = params.get('filter') ?? 'all';
  const filter: Filter = (FILTERS as readonly string[]).includes(rawFilter)
    ? (rawFilter as Filter)
    : 'all';
  const q = (params.get('q') ?? '').trim().toLowerCase().slice(0, 120);
  // scope=users leaves admins out, so the panel can show them in their own table.
  const usersOnly = params.get('scope') === 'users';
  const viewer = { id: check.user.id, isOwner: isOwnerUser(check.user) };

  try {
    if (filter === 'all' && !q && !usersOnly) {
      const listed = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
      if (listed.error) return json({ error: 'unavailable' }, 503);
      const users = listed.data.users;
      const rows = await membershipsFor(
        admin,
        users.map((user) => user.id),
      );
      const reported = (listed.data as { total?: number }).total;
      return json({
        page,
        perPage: PER_PAGE,
        total: typeof reported === 'number' ? reported : users.length,
        filter,
        q,
        truncated: false,
        viewer,
        users: await present(admin, users, rows, check.user),
      });
    }

    // Filter or search: read accounts page by page, then filter on the server.
    const everyone: User[] = [];
    let truncated = false;
    for (let scan = 1; scan <= SCAN_MAX_PAGES; scan += 1) {
      const listed = await admin.auth.admin.listUsers({ page: scan, perPage: SCAN_PER_PAGE });
      if (listed.error) return json({ error: 'unavailable' }, 503);
      everyone.push(...listed.data.users);
      if (listed.data.users.length < SCAN_PER_PAGE) break;
      if (scan === SCAN_MAX_PAGES) truncated = true;
    }

    let matched = q
      ? everyone.filter((user) => (user.email ?? '').toLowerCase().includes(q))
      : everyone;
    let rows: Map<string, MembershipRow> | null = null;
    if (usersOnly) matched = matched.filter((user) => !isAdminUser(user));
    if (filter === 'admins') matched = matched.filter(isAdminUser);
    if (filter === 'banned') matched = matched.filter((user) => activeBan(user) !== null);
    if (filter === 'paid' || filter === 'expired') {
      const now = new Date().toISOString();
      const query = admin.from(MEMBERSHIPS).select(MEMBERSHIP_COLUMNS);
      const found = await (
        filter === 'paid' ? query.gt('expires_at', now) : query.lte('expires_at', now)
      ).limit(10_000);
      if (found.error) return json({ error: 'unavailable' }, 503);
      rows = new Map((found.data as MembershipRow[]).map((row) => [row.user_id, row]));
      const withPlan = rows;
      matched = matched.filter((user) => withPlan.has(user.id));
    }

    const slice = matched.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    if (!rows)
      rows = await membershipsFor(
        admin,
        slice.map((user) => user.id),
      );
    const known = new Map(everyone.map((user) => [user.id, user.email ?? null]));
    return json({
      page,
      perPage: PER_PAGE,
      total: matched.length,
      filter,
      q,
      truncated,
      viewer,
      users: await present(admin, slice, rows, check.user, known),
    });
  } catch {
    return json({ error: 'unavailable' }, 503);
  }
}

async function membershipsFor(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  ids: string[],
) {
  const rows = new Map<string, MembershipRow>();
  if (!ids.length) return rows;
  const found = await admin.from(MEMBERSHIPS).select(MEMBERSHIP_COLUMNS).in('user_id', ids);
  if (found.error) throw new Error('unavailable');
  for (const row of (found.data ?? []) as MembershipRow[]) rows.set(row.user_id, row);
  return rows;
}

async function present(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  users: User[],
  rows: Map<string, MembershipRow>,
  actor: User,
  known = new Map<string, string | null>(),
) {
  for (const user of users) known.set(user.id, user.email ?? null);
  known.set(actor.id, actor.email ?? null);
  const used = users.map((user) => rows.get(user.id)).filter((row) => row !== undefined);
  const emails = await granterEmails(admin, used, known);
  return users.map((user) => toAdminUser(user, rows.get(user.id), emails));
}

/**
 * Permanently deletes an account and everything linked to it (all tables reference
 * auth.users with ON DELETE CASCADE). It cannot be undone, so the caller must retype the
 * account email. The owner, admins and the caller cannot be deleted here.
 */
export async function DELETE(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return json({ error: check.error }, check.status);
  const body = await parseBody(request, DeleteBody, 1024);
  if (!body.ok) return body.response;
  const { userId, confirmEmail } = body.data;
  if (userId === check.user.id) return json({ error: 'cannot_target_self' }, 403);

  const admin = getSupabaseAdminClient();
  if (!admin) return json({ error: 'unavailable' }, 503);
  const target = await admin.auth.admin.getUserById(userId);
  if (target.error || !target.data.user) return json({ error: 'user_not_found' }, 404);
  const user = target.data.user;
  const reason = forbiddenReason(check.user, user, 'delete_user');
  if (reason) return json({ error: reason }, 403);
  if (!user.email || user.email.toLowerCase() !== confirmEmail.toLowerCase())
    return json({ error: 'email_mismatch' }, 400);

  const removed = await admin.auth.admin.deleteUser(userId);
  if (removed.error) return json({ error: 'unavailable' }, 503);
  await audit(admin, check.user, 'delete_user', { id: userId, email: user.email });
  return json({ deleted: true, userId });
}
