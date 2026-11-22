import type { PaidTier } from './dodo-config';

/** Small helpers shared by the billing routes. Server only. */

export const MEMBERSHIPS = 'react_mentor_memberships';

const RANK: Record<string, number> = { starter: 0, pro: 1, expert: 2 };
export const tierRank = (tier: unknown) => RANK[String(tier)] ?? 0;

export type MembershipRow = {
  tier: string;
  expires_at: string;
  source?: string | null;
  provider?: string | null;
  provider_customer_id?: string | null;
  provider_subscription_id?: string | null;
  provider_status?: string | null;
  cancel_at_period_end?: boolean | null;
};

export type BillingStatus = {
  configured: boolean;
  signedIn: boolean;
  membership: null | {
    tier: PaidTier;
    expiresAt: string;
    active: boolean;
    source: 'admin' | 'payment';
    status: string | null;
    cancelAtPeriodEnd: boolean;
    /** True when the customer portal can be opened for this account. */
    canManage: boolean;
  };
};

/** What the plans page may show. The truth is the database row, never the redirect. */
export function toBillingStatus(
  row: MembershipRow | null | undefined,
  configured: boolean,
  signedIn: boolean,
  nowMs = Date.now(),
): BillingStatus {
  if (!row || (row.tier !== 'pro' && row.tier !== 'expert')) {
    return { configured, signedIn, membership: null };
  }
  const end = Date.parse(row.expires_at);
  const payment = row.source === 'payment';
  return {
    configured,
    signedIn,
    membership: {
      tier: row.tier,
      expiresAt: row.expires_at,
      active: Number.isFinite(end) && end > nowMs,
      source: payment ? 'payment' : 'admin',
      status: payment ? (row.provider_status ?? null) : null,
      cancelAtPeriodEnd: payment && row.cancel_at_period_end === true,
      canManage: configured && payment && row.provider === 'dodo' && !!row.provider_customer_id,
    },
  };
}

/** Where Dodo sends the customer back to. Always this site, never a value from the request body. */
export function siteOrigin(
  request: Request,
  env: Record<string, string | undefined> = process.env,
): string {
  const requestOrigin = new URL(request.url).origin;
  const configured = env.REACT_MENTOR_SITE_URL?.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:') {
        const reqUrl = new URL(request.url);
        if (
          reqUrl.protocol !== 'https:' ||
          reqUrl.hostname === 'localhost' ||
          reqUrl.hostname === '127.0.0.1' ||
          reqUrl.hostname === '0.0.0.0'
        ) {
          return parsed.origin;
        }
      }
    } catch {
      // Ignore malformed env value and fall back to request origin.
    }
  }
  return requestOrigin;
}

const attempts = new Map<string, number[]>();
/**
 * A tiny per-instance throttle (5 provider calls per minute and account), so one signed-in
 * user cannot use up the provider's API rate limit for everybody. It is a guard against
 * accidents and abuse, not a security boundary.
 */
export function allowProviderCall(userId: string, nowMs = Date.now()): boolean {
  const recent = (attempts.get(userId) ?? []).filter((time) => nowMs - time < 60_000);
  if (recent.length >= 5) {
    attempts.set(userId, recent);
    return false;
  }
  recent.push(nowMs);
  attempts.set(userId, recent);
  if (attempts.size > 5000) {
    for (const [key, times] of attempts)
      if (times.every((time) => nowMs - time >= 60_000)) attempts.delete(key);
  }
  return true;
}
export const resetProviderCalls = () => attempts.clear();
