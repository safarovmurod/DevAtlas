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
  type AdminModeration,
  type MembershipRow,
} from '@/lib/account/admin-users';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const PER_PAGE = 50;
// Filters and search read whole pages of accounts from Supabase Auth. The cap keeps a
// single request bounded; the response says when it was reached.
const SCAN_PER_PAGE = 1000;
const SCAN_MAX_PAGES = 5;
const FILTERS = ['all', 'paid', 'free', 'expired', 'admins', 'banned', 'strikes'] as const;
type Filter = (typeof FILTERS)[number];

const DeleteBody = z.object({
  userId: z.string().uuid(),
  confirmEmail: z.string().trim().min(3).max(320),
});

type StrikeRow = {
  user_id: string;
  strikes?: number | null;
  blocked_until?: string | null;
  profanity_strikes?: number | null;
  profanity_blocked_until?: string | null;
};

function toAdminModeration(row: StrikeRow | undefined, now = Date.now()): AdminModeration | null {
  if (!row) return null;
  const otEnd = row.blocked_until ? Date.parse(row.blocked_until) : NaN;
  const otBlocked = Number.isFinite(otEnd) && otEnd > now;
  const otStrikes = otBlocked
    ? 3
    : row.blocked_until
      ? 0
      : Math.max(0, Math.min(3, Number(row.strikes ?? 0)));

  const prEnd = row.profanity_blocked_until ? Date.parse(row.profanity_blocked_until) : NaN;
  const prBlocked = Number.isFinite(prEnd) && prEnd > now;
  const prStrikes = prBlocked
    ? 5
    : row.profanity_blocked_until
      ? 0
      : Math.max(0, Math.min(5, Number(row.profanity_strikes ?? 0)));

  if (otStrikes === 0 && !otBlocked && prStrikes === 0 && !prBlocked) return null;
  return {
    offTopicStrikes: otStrikes,
    offTopicBlocked: otBlocked,
    offTopicBlockedUntil: otBlocked ? row.blocked_until! : null,
    profanityStrikes: prStrikes,
    profanityBlocked: prBlocked,
    profanityBlockedUntil: prBlocked ? row.profanity_blocked_until! : null,
  };
}

async function moderationsFor(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  ids: string[],
) {
  const map = new Map<string, AdminModeration>();
  if (!ids.length) return map;
  try {
    let data: StrikeRow[] | null = null;
    const full = await admin
      .from('react_mentor_tutor_strikes')
      .select('user_id,strikes,blocked_until,profanity_strikes,profanity_blocked_until')
      .in('user_id', ids);
    if (!full.error && full.data) {
      data = full.data as StrikeRow[];
    } else {
      const legacy = await admin
        .from('react_mentor_tutor_strikes')
        .select('user_id,strikes,blocked_until')
        .in('user_id', ids);
      if (!legacy.error && legacy.data) {
        data = legacy.data as StrikeRow[];
      }
    }
    if (!data) return map;
    for (const row of data) {
      const mod = toAdminModeration(row);
      if (mod) map.set(row.user_id, mod);
    }
  } catch {
    // Non-fatal: users table still renders if moderation table is absent in legacy test fixtures.
  }
  return map;
}

/**
 * Admin-only list of accounts with their effective membership & moderation status, fifty per page.
 * `filter` = all | paid | free | expired | admins | banned | strikes, `q` = part of an email.
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
      const ids = users.map((user) => user.id);
      const [rows, mods] = await Promise.all([
        membershipsFor(admin, ids),
        moderationsFor(admin, ids),
      ]);
      const reported = (listed.data as { total?: number }).total;
      return json({
        page,
        perPage: PER_PAGE,
        total: typeof reported === 'number' ? reported : users.length,
        filter,
        q,
        truncated: false,
        viewer,
        users: await present(admin, users, rows, mods, check.user),
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

    const scopePool = usersOnly ? everyone.filter((user) => !isAdminUser(user)) : everyone;
    const allIds = scopePool.map((u) => u.id);
    const now = Date.now();
    const [allRows, allMods] = await Promise.all([
      membershipsFor(admin, allIds),
      moderationsFor(admin, allIds),
    ]);

    // Compute accurate summary metrics across all non-admin users in scope.
    let activePro = 0;
    let activeUltra = 0;
    let freeOrExpired = 0;
    let bannedCount = 0;
    let moderatedCount = 0;
    for (const u of scopePool) {
      const m = allRows.get(u.id);
      const isActive = m ? Date.parse(m.expires_at) > now : false;
      if (isActive && m?.tier === 'expert') activeUltra += 1;
      else if (isActive && m?.tier === 'pro') activePro += 1;
      else freeOrExpired += 1;
      if (activeBan(u, now) !== null) bannedCount += 1;
      if (allMods.has(u.id)) moderatedCount += 1;
    }

    let matched = q
      ? scopePool.filter((user) => (user.email ?? '').toLowerCase().includes(q))
      : scopePool;
    if (filter === 'admins') matched = everyone.filter(isAdminUser);
    if (filter === 'banned') matched = matched.filter((user) => activeBan(user, now) !== null);
    if (filter === 'paid') {
      matched = matched.filter((user) => {
        const m = allRows.get(user.id);
        return Boolean(m && Date.parse(m.expires_at) > now);
      });
    }
    if (filter === 'free') {
      matched = matched.filter((user) => {
        const m = allRows.get(user.id);
        return !m || Date.parse(m.expires_at) <= now;
      });
    }
    if (filter === 'expired') {
      matched = matched.filter((user) => {
        const m = allRows.get(user.id);
        return Boolean(m && Date.parse(m.expires_at) <= now);
      });
    }
    if (filter === 'strikes') {
      matched = matched.filter((user) => allMods.has(user.id));
    }

    const slice = matched.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const sliceIds = slice.map((u) => u.id);
    const sliceRows = filter === 'admins' ? await membershipsFor(admin, sliceIds) : allRows;
    const sliceMods = filter === 'admins' ? await moderationsFor(admin, sliceIds) : allMods;
    const known = new Map(everyone.map((user) => [user.id, user.email ?? null]));
    return json({
      page,
      perPage: PER_PAGE,
      total: matched.length,
      filter,
      q,
      truncated,
      viewer,
      summary: {
        totalUsers: scopePool.length,
        activePro,
        activeUltra,
        freeOrExpired,
        bannedCount,
        moderatedCount,
      },
      users: await present(admin, slice, sliceRows, sliceMods, check.user, known),
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
  mods: Map<string, AdminModeration>,
  actor: User,
  known = new Map<string, string | null>(),
) {
  for (const user of users) known.set(user.id, user.email ?? null);
  known.set(actor.id, actor.email ?? null);
  const used = users.map((user) => rows.get(user.id)).filter((row) => row !== undefined);
  const emails = await granterEmails(admin, used, known);
  return users.map((user) => ({
    ...toAdminUser(user, rows.get(user.id), emails),
    moderation: mods.get(user.id) ?? null,
  }));
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
