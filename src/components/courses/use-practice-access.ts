'use client';

import { useEffect, useState } from 'react';
import { useAccount } from '@/components/account/account-provider';
import { billingFetch } from '@/lib/billing/billing-client';
import type { BillingStatus } from '@/lib/billing/billing-server';
import type { PracticeAccess } from '@/lib/billing/practice-access';
import { planForTier, planIncludes, type PlanFeature } from '@/lib/billing/plans';

/**
 * Practice state for the signed-in account, read from the database through
 * /api/billing/status. Guests are locked. Without accounts (no Supabase) nothing is
 * sold, so practice stays open. The server checks the plan again on every submission.
 */
export function usePracticeAccess(): PracticeAccess {
  return usePlanAccess('practiceTasks');
}

export function usePlanAccess(feature: PlanFeature, enabled = true): PracticeAccess {
  const { configured, loading, user } = useAccount();
  const userId = user?.id ?? null;
  const [result, setResult] = useState<{
    userId: string;
    feature: PlanFeature;
    access: PracticeAccess;
  } | null>(null);

  useEffect(() => {
    if (!configured || loading || !userId || !enabled) return;
    let active = true;
    billingFetch<BillingStatus>('/api/billing/status', { login: false })
      .then((status) => {
        const membership = status?.membership;
        const access =
          membership?.active && planIncludes(planForTier(membership.tier), feature)
            ? 'open'
            : 'locked';
        if (active) setResult({ userId, feature, access });
      })
      .catch(() => {
        if (active) setResult({ userId, feature, access: 'locked' });
      });
    return () => {
      active = false;
    };
  }, [configured, loading, userId, feature, enabled]);

  if (!configured) return process.env.NODE_ENV === 'production' ? 'locked' : 'open';
  if (loading) return 'loading';
  if (!userId) return 'locked';
  return result?.userId === userId && result.feature === feature ? result.access : 'loading';
}
