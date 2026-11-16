'use client';

import { useEffect, useState } from 'react';
import { useAccount } from '@/components/account/account-provider';
import { billingFetch } from '@/lib/billing/billing-client';
import type { BillingStatus } from '@/lib/billing/billing-server';
import { practiceAccessFromStatus, type PracticeAccess } from '@/lib/billing/practice-access';

/**
 * Practice state for the signed-in account, read from the database through
 * /api/billing/status. Guests are locked. Without accounts (no Supabase) nothing is
 * sold, so practice stays open. The server checks the plan again on every submission.
 */
export function usePracticeAccess(): PracticeAccess {
  const { configured, loading, user } = useAccount();
  const userId = user?.id ?? null;
  const [result, setResult] = useState<{ userId: string; access: PracticeAccess } | null>(null);

  useEffect(() => {
    if (!configured || loading || !userId) return;
    let active = true;
    billingFetch<BillingStatus>('/api/billing/status', { login: false })
      .then((status) => {
        if (active) setResult({ userId, access: practiceAccessFromStatus(status) });
      })
      .catch(() => {
        if (active) setResult({ userId, access: 'locked' });
      });
    return () => {
      active = false;
    };
  }, [configured, loading, userId]);

  if (!configured) return 'open';
  if (loading) return 'loading';
  if (!userId) return 'locked';
  return result?.userId === userId ? result.access : 'loading';
}
