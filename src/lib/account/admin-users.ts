import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { ZodType } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';

/**
 * Shared server-side pieces of the admin panel: who may act on whom, how a user is
 * shown to the panel, and the audit log. Only API routes import this file.
 */

export const MEMBERSHIPS = 'react_mentor_memberships';
export const AUDIT = 'react_mentor_admin_audit';
export const NOTIFICATIONS = 'react_mentor_notifications';
export const MEMBERSHIP_COLUMNS = 'user_id,tier,expires_at,source,granted_by,granted_at';
export const DAY_MS = 86_400_000;
/** Supabase's own example for a permanent ban: 100 years. */
export const FOREVER_HOURS = 876_000;

export type MembershipRow = {
  user_id: string;
  tier: string;
  expires_at: string;
  source?: string | null;
  granted_by?: string | null;
  granted_at?: string | null;
};

export type AdminMembership = {
  tier: 'pro' | 'expert';
  expiresAt: string;
  active: boolean;
  daysLeft: number;
  source: 'admin' | 'payment';
  grantedById: string | null;
  grantedByEmail: string | null;
  grantedAt: string | null;
};

export type AdminUserView = {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  providers: string[];
  isAdmin: boolean;
  isOwner: boolean;
  bannedUntil: string | null;
  membership: AdminMembership | null;
};

export type AdminAction =
  | 'membership_grant'
  | 'membership_extend'
  | 'membership_revoke'
  | 'role_grant'
  | 'role_revoke'
  | 'ban'
  | 'unban'
  | 'notify'
  | 'delete_user';

export const isAdminUser = (user: Pick<User, 'app_metadata'>) =>
  user.app_metadata?.app_role === 'admin';
/** The owner flag is set only with SQL in the Supabase dashboard, never by the panel. */
export const isOwnerUser = (user: Pick<User, 'app_metadata'>) =>
  user.app_metadata?.app_owner === true;

export function activeBan(user: Pick<User, 'banned_until'>, now = Date.now()) {
  const until = user.banned_until ? new Date(user.banned_until).getTime() : NaN;
  return Number.isFinite(until) && until > now ? new Date(until).toISOString() : null;
}

/**
 * Server-side rules. The UI hides buttons too, but this is what actually decides.
 * - Nobody can demote, ban, delete or take the membership of the owner.
 * - Only the owner grants or removes the admin role.
 * - Admins cannot ban or delete themselves or other admins; remove the role first.
 */
export function forbiddenReason(actor: User, target: User, action: AdminAction): string | null {
  const targetIsOwner = isOwnerUser(target);
  if (
    targetIsOwner &&
    (action === 'role_revoke' ||
      action === 'ban' ||
      action === 'delete_user' ||
      action === 'membership_revoke')
  )
    return 'owner_protected';
  if (action === 'role_grant' || action === 'role_revoke') {
    if (!isOwnerUser(actor)) return 'owner_required';
    if (actor.id === target.id) return 'cannot_target_self';
  }
  if (action === 'ban' || action === 'delete_user') {
    if (actor.id === target.id) return 'cannot_target_self';
    if (isAdminUser(target)) return 'admin_protected';
  }
  return null;
}

export function toMembership(
  row: MembershipRow | null | undefined,
  emails: Map<string, string | null>,
  now = Date.now(),
): AdminMembership | null {
  if (!row) return null;
  const end = new Date(row.expires_at).getTime();
  const active = end > now;
  return {
    tier: row.tier === 'expert' ? 'expert' : 'pro',
    expiresAt: row.expires_at,
    active,
    daysLeft: active ? Math.ceil((end - now) / DAY_MS) : 0,
    source: row.source === 'payment' ? 'payment' : 'admin',
    grantedById: row.granted_by ?? null,
    grantedByEmail: row.granted_by ? (emails.get(row.granted_by) ?? null) : null,
    grantedAt: row.granted_at ?? null,
  };
}

export function toAdminUser(
  user: User,
  row: MembershipRow | null | undefined,
  emails: Map<string, string | null>,
): AdminUserView {
  return {
    id: user.id,
    email: user.email ?? null,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    emailConfirmed: Boolean(user.email_confirmed_at),
    providers: Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers : [],
    isAdmin: isAdminUser(user),
    isOwner: isOwnerUser(user),
    bannedUntil: activeBan(user),
    membership: toMembership(row, emails),
  };
}

/** Emails of the admins who granted memberships, looked up once each (they are few). */
export async function granterEmails(
  admin: SupabaseClient,
  rows: Iterable<MembershipRow>,
  known: Map<string, string | null>,
) {
  const emails = new Map(known);
  const missing = new Set<string>();
  for (const row of rows)
    if (row.granted_by && !emails.has(row.granted_by)) missing.add(row.granted_by);
  for (const id of [...missing].slice(0, 10)) {
    const found = await admin.auth.admin.getUserById(id);
    emails.set(id, found.data?.user?.email ?? null);
  }
  return emails;
}

/** Reloads one user and their membership so the panel can replace that row in place. */
export async function loadAdminUser(
  admin: SupabaseClient,
  userId: string,
  actor?: User,
): Promise<AdminUserView | null> {
  const found = await admin.auth.admin.getUserById(userId);
  if (found.error || !found.data.user) return null;
  const membership = await admin
    .from(MEMBERSHIPS)
    .select(MEMBERSHIP_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();
  if (membership.error) throw new Error('unavailable');
  const row = (membership.data as MembershipRow | null) ?? null;
  const known = new Map<string, string | null>();
  if (actor) known.set(actor.id, actor.email ?? null);
  known.set(found.data.user.id, found.data.user.email ?? null);
  const emails = await granterEmails(admin, row ? [row] : [], known);
  return toAdminUser(found.data.user, row, emails);
}

/**
 * Writes one audit entry. The action has already happened, so a failed write is logged
 * on the server rather than reported as a failed action.
 */
export async function audit(
  admin: SupabaseClient,
  actor: User,
  action: AdminAction,
  target: { id: string; email?: string | null } | null,
  details: Record<string, unknown> = {},
) {
  try {
    const saved = await admin.from(AUDIT).insert({
      actor_id: actor.id,
      actor_email: actor.email ?? null,
      action,
      target_id: target?.id ?? null,
      target_email: target?.email ?? null,
      details,
    });
    if (saved.error) console.error('admin audit write failed', { action, code: saved.error.code });
  } catch {
    console.error('admin audit write failed', { action });
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

/** Reads a small JSON body and validates it. Returns the data or a ready error response. */
export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
  maxBytes = 2048,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let raw: unknown;
  try {
    raw = await readBoundedJson(request, maxBytes);
  } catch (error) {
    return {
      ok: false,
      response: json(
        { error: 'invalid_request' },
        error instanceof RequestBodyError ? error.status : 400,
      ),
    };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, response: json({ error: 'invalid_request' }, 400) };
  return { ok: true, data: parsed.data };
}
