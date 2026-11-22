'use client';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';

export type Tier = 'pro' | 'expert';
export type Membership = {
  tier: Tier;
  expiresAt: string;
  active: boolean;
  daysLeft: number;
  source: 'admin' | 'payment';
  grantedById: string | null;
  grantedByEmail: string | null;
  grantedAt: string | null;
};
export type AdminModeration = {
  offTopicStrikes: number;
  offTopicBlocked: boolean;
  offTopicBlockedUntil: string | null;
  profanityStrikes: number;
  profanityBlocked: boolean;
  profanityBlockedUntil: string | null;
};
export type AdminUser = {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  providers: string[];
  isAdmin: boolean;
  isOwner: boolean;
  bannedUntil: string | null;
  membership: Membership | null;
  moderation?: AdminModeration | null;
};
export type AdminSummary = {
  totalUsers: number;
  activePro: number;
  activeUltra: number;
  freeOrExpired: number;
  bannedCount: number;
  moderatedCount: number;
};
export type Filter = 'all' | 'paid' | 'free' | 'expired' | 'admins' | 'banned' | 'strikes';
export type Listing = {
  page: number;
  perPage: number;
  total: number;
  filter: Filter;
  q: string;
  truncated: boolean;
  viewer: { id: string; isOwner: boolean };
  summary?: AdminSummary;
  users: AdminUser[];
};
export type AuditEntry = {
  id: string;
  actorEmail: string | null;
  action: string;
  targetId: string | null;
  targetEmail: string | null;
  details: Record<string, unknown>;
  createdAt: string;
};

/** Everything a row can ask the panel to do. */
export type PlanMode = 'grant' | 'extend' | 'shorten';
export type Intent =
  | { kind: 'details'; user: AdminUser }
  | { kind: 'plan'; user: AdminUser; mode: PlanMode }
  | { kind: 'grant'; user: AdminUser; tier: Tier; days: number }
  | { kind: 'extend'; user: AdminUser; days: number }
  | { kind: 'shorten'; user: AdminUser; days: number }
  | { kind: 'revoke'; user: AdminUser }
  | { kind: 'reset_moderation'; user: AdminUser }
  | { kind: 'ban'; user: AdminUser }
  | { kind: 'unban'; user: AdminUser }
  | { kind: 'role'; user: AdminUser; grant: boolean }
  | { kind: 'notify'; user: AdminUser }
  | { kind: 'delete'; user: AdminUser };

export const TIER_NAME: Record<Tier, string> = { pro: 'Pro', expert: 'Ultra' };

export const PAYMENT_WARNING =
  'Ин подписка бо пардохти воқеӣ аст. Агар шумо онро ин ҷо бекор ё кам кунед, Dodo Payments дар санаи навбатӣ боз пул мегирад ва подписка худаш барқарор мешавад, то даме ки худи муштарӣ онро дар «Идоракунии обуна» бекор кунад. Баргардонидани пулро дар Dodo Payments dashboard иҷро кунед.';
export function revokeMessage(email: string, membership: Membership | null) {
  const base = `Подпискаи ${email} ҳозир бекор шавад? Корбар ба тарифи ройгони Start бармегардад.`;
  return membership?.source === 'payment' ? `${base} ${PAYMENT_WARNING}` : base;
}
export const PAYMENT_EXTEND_NOTE =
  'Ин подписка бо пардохти воқеӣ аст: рӯзҳои иловашуда дар навсозии навбатии пардохт бо санаи худи провайдер иваз мешаванд.';

export const ERRORS: Record<string, string> = {
  authentication_required: 'Аввал ба аккаунт ворид шавед.',
  admin_required: 'Ин саҳифа танҳо барои админ аст.',
  account_banned: 'Ин аккаунт блок шудааст.',
  mfa_required: 'Барои админ 2FA лозим аст. Дар Settings онро фаъол кунед ва бо код ворид шавед.',
  user_not_found: 'Корбар ёфт нашуд. Шояд аллакай нест карда шудааст.',
  no_membership: 'Ин корбар подписка надорад.',
  membership_expired: 'Мӯҳлати подписка аллакай гузаштааст. Подпискаи нав диҳед.',
  owner_protected: 'Соҳиби сайтро тағйир додан мумкин нест.',
  owner_required: 'Нақши админро танҳо соҳиби сайт медиҳад ё мегирад.',
  admin_protected: 'Админро блок ё нест кардан мумкин нест. Аввал нақши админро гиред.',
  cannot_target_self: 'Ин амалро бо аккаунти худ кардан мумкин нест.',
  email_not_confirmed: 'Email-и ин корбар тасдиқ нашудааст.',
  target_banned: 'Корбари блокшударо админ кардан мумкин нест.',
  email_mismatch: 'Email мувофиқ нест. Корбар нест нашуд.',
  invalid_request: 'Маълумот нодуруст аст.',
  unavailable: 'Сервис ҳоло ҷавоб намедиҳад. Баъдтар кӯшиш кунед.',
};

export function errorText(cause: unknown) {
  return ERRORS[cause instanceof Error ? cause.message : ''] ?? ERRORS.unavailable;
}

export async function adminCall<T>(
  path: string,
  init?: { method: 'POST' | 'DELETE'; body: unknown },
  signal?: AbortSignal,
): Promise<T> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error('authentication_required');
  const { data, error } = await getSessionWithTimeout(client);
  if (error || !data.session) throw new Error('authentication_required');
  const response = await fetch(path, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      ...(init ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(init ? { body: JSON.stringify(init.body) } : {}),
    cache: 'no-store',
    signal: signal ?? AbortSignal.timeout(15_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(typeof payload.error === 'string' ? payload.error : 'unavailable');
  return payload as T;
}

export function day(value: string | null) {
  return value ? new Date(value).toLocaleDateString('ru-RU') : '—';
}

export function dateTime(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** A ban longer than 50 years is shown as permanent. */
export function banLabel(until: string) {
  const years = (new Date(until).getTime() - Date.now()) / (365 * 86_400_000);
  return years > 50 ? 'Блок (доимӣ)' : `Блок то ${day(until)}`;
}
