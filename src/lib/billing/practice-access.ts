import type { MembershipTier } from './entitlements';
import { planForTier, planIncludes } from './plans';

/**
 * Practice tasks belong to the plan in FEATURE_PLAN.practiceTasks (Pro, and Ultra above it).
 * `loading` is shown while the plan is still being read, so a paying learner never sees a
 * lock flash before the editor appears.
 */
export type PracticeAccess = 'loading' | 'open' | 'locked';

/** Only an active plan from the database counts; an expired or missing row is Start. */
export function practiceOpenForTier(tier: MembershipTier): boolean {
  return planIncludes(planForTier(tier), 'practiceTasks');
}

/** Turns the billing status answer into the practice state. */
export function practiceAccessFromStatus(
  status: { membership: null | { tier: MembershipTier; active: boolean } } | null,
): Exclude<PracticeAccess, 'loading'> {
  const membership = status?.membership;
  return membership?.active && practiceOpenForTier(membership.tier) ? 'open' : 'locked';
}
