'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount } from '@/components/account/account-provider';
import { billingFetch } from '@/lib/billing/billing-client';
import type { BillingStatus } from '@/lib/billing/billing-server';
import type { PlanId } from '@/lib/billing/plans';

export type LivePlanStatus = {
  loading: boolean;
  plan: PlanId;
  active: boolean;
  expiresAt: string | null;
  source: 'admin' | 'payment' | null;
  isPrivileged: boolean;
  refresh: () => void;
};

export const MEMBERSHIP_REFRESH_EVENT = 'devatlas:membership-refresh';

type CachedMembership = {
  userId: string;
  plan: PlanId;
  active: boolean;
  expiresAt: string | null;
  source: 'admin' | 'payment' | null;
  isPrivileged: boolean;
  fetchedAt: number;
};

const CACHE_TTL_MS = 30_000;
const SESSION_CACHE_KEY = 'devatlas-membership-cache-v1';
let cachedMembership: CachedMembership | null = null;
let inFlight: { userId: string; promise: Promise<CachedMembership> } | null = null;

function readSessionCache(userId: string): CachedMembership | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, Partial<CachedMembership>>;
    const parsed = map?.[userId];
    if (
      parsed &&
      parsed.userId === userId &&
      typeof parsed.fetchedAt === 'number' &&
      Date.now() - parsed.fetchedAt < CACHE_TTL_MS &&
      (parsed.plan === 'start' || parsed.plan === 'pro' || parsed.plan === 'ultra')
    ) {
      return {
        userId,
        plan: parsed.plan,
        active: Boolean(parsed.active),
        expiresAt: typeof parsed.expiresAt === 'string' ? parsed.expiresAt : null,
        source: parsed.source === 'admin' || parsed.source === 'payment' ? parsed.source : null,
        isPrivileged: Boolean(parsed.isPrivileged),
        fetchedAt: parsed.fetchedAt,
      };
    }
  } catch {
    // Ignore storage read errors in private/restricted browser modes.
  }
  return null;
}

function writeSessionCache(entry: CachedMembership | null) {
  if (typeof window === 'undefined') return;
  try {
    if (!entry) {
      window.sessionStorage.removeItem(SESSION_CACHE_KEY);
      return;
    }
    const raw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
    const prev = raw ? (JSON.parse(raw) as Record<string, CachedMembership>) : {};
    const next =
      prev && typeof prev === 'object'
        ? { ...prev, [entry.userId]: entry }
        : { [entry.userId]: entry };
    window.sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage write errors.
  }
}

async function fetchMembershipStatus(userId: string, force = false): Promise<CachedMembership> {
  const now = Date.now();
  if (!force) {
    if (cachedMembership?.userId === userId && now - cachedMembership.fetchedAt < CACHE_TTL_MS) {
      return cachedMembership;
    }
    const stored = readSessionCache(userId);
    if (stored) {
      cachedMembership = stored;
      return stored;
    }
    if (inFlight?.userId === userId) {
      return inFlight.promise;
    }
  }
  const promise = billingFetch<BillingStatus & { isPrivileged?: boolean }>('/api/billing/status', {
    login: false,
  })
    .then((status) => {
      const m = status?.membership;
      const isPriv = Boolean(status?.isPrivileged);
      const active = Boolean(m?.active) || isPriv;
      const plan: PlanId = active
        ? m?.tier === 'expert' || isPriv
          ? 'ultra'
          : m?.tier === 'pro'
            ? 'pro'
            : 'start'
        : 'start';
      const next: CachedMembership = {
        userId,
        plan,
        active: plan !== 'start',
        expiresAt: m?.active ? m.expiresAt : null,
        source: m?.active ? m.source : null,
        isPrivileged: isPriv,
        fetchedAt: Date.now(),
      };
      cachedMembership = next;
      writeSessionCache(next);
      return next;
    })
    .catch(() => {
      const fallback: CachedMembership =
        cachedMembership?.userId === userId
          ? { ...cachedMembership, fetchedAt: Date.now() }
          : {
              userId,
              plan: 'start',
              active: false,
              expiresAt: null,
              source: null,
              isPrivileged: false,
              fetchedAt: Date.now(),
            };
      cachedMembership = fallback;
      writeSessionCache(fallback);
      return fallback;
    })
    .finally(() => {
      if (inFlight?.promise === promise) inFlight = null;
    });
  inFlight = { userId, promise };
  return promise;
}

/** Triggers an immediate plan re-fetch across open tabs/components (e.g., right after Admin grants a plan). */
export function broadcastMembershipRefresh() {
  cachedMembership = null;
  inFlight = null;
  writeSessionCache(null);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MEMBERSHIP_REFRESH_EVENT));
  }
}

/**
 * Live server-verified subscription tier for the signed-in user.
 * Shares a single deduplicated request across Header, Sidebar, and Settings, and refreshes
 * immediately on explicit refresh events or when returning to the tab after TTL expiry.
 */
export function useMembershipStatus(): LivePlanStatus {
  const { configured, loading, user } = useAccount();
  const userId = user?.id ?? null;
  const [state, setState] = useState<CachedMembership | null>(() => {
    if (!userId) return null;
    if (cachedMembership?.userId === userId) return cachedMembership;
    return readSessionCache(userId);
  });
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    cachedMembership = null;
    writeSessionCache(null);
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!configured || loading || !userId) return;
    let alive = true;
    const load = (force = false) => {
      void fetchMembershipStatus(userId, force).then((next) => {
        if (alive) setState(next);
      });
    };
    load(tick > 0);

    const onFocus = () => load(false);
    const onVisible = () => {
      if (!document.hidden) load(false);
    };
    const onRefresh = () => load(true);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener(MEMBERSHIP_REFRESH_EVENT, onRefresh);
    return () => {
      alive = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener(MEMBERSHIP_REFRESH_EVENT, onRefresh);
    };
  }, [configured, loading, userId, tick]);

  if (!configured || !userId) {
    return {
      loading: false,
      plan: 'start',
      active: false,
      expiresAt: null,
      source: null,
      isPrivileged: false,
      refresh,
    };
  }
  if (loading || state?.userId !== userId) {
    return {
      loading: true,
      plan: 'start',
      active: false,
      expiresAt: null,
      source: null,
      isPrivileged: false,
      refresh,
    };
  }
  return {
    loading: false,
    plan: state.plan,
    active: state.active,
    expiresAt: state.expiresAt,
    source: state.source,
    isPrivileged: state.isPrivileged,
    refresh,
  };
}
