import type { MembershipTier } from './entitlements';

/**
 * The three plans people see: Start (free), Pro (main) and Ultra (max).
 * The stored membership tier keeps its old database name: `expert` is Ultra.
 */
export type PlanId = 'start' | 'pro' | 'ultra';
export const PLAN_IDS: readonly PlanId[] = ['start', 'pro', 'ultra'];

export const PLAN_TIER: Record<PlanId, MembershipTier> = {
  start: 'starter',
  pro: 'pro',
  ultra: 'expert',
};

export function planForTier(tier: MembershipTier): PlanId {
  return tier === 'expert' ? 'ultra' : tier === 'pro' ? 'pro' : 'start';
}

/** Name shown to people. Use this instead of printing the stored tier. */
export function planName(tier: MembershipTier): string {
  return { start: 'Start', pro: 'Pro', ultra: 'Ultra' }[planForTier(tier)];
}

export type PlanFeature =
  | 'platformIntro'
  | 'basicLessons'
  | 'editorChecks'
  | 'deepStudy'
  | 'allCourses'
  | 'practiceTasks'
  | 'certificate'
  | 'aiTutor'
  | 'mentor'
  | 'projectReview'
  | 'privateCommunity'
  | 'jobPrep'
  | 'voiceAssistant';

/**
 * The first plan that includes a feature. Pro includes Start, and Ultra includes
 * Pro. The AI Tutor chat is Pro, the voice assistant and the community chat are Ultra.
 */
export const FEATURE_PLAN: Record<PlanFeature, PlanId> = {
  platformIntro: 'start',
  basicLessons: 'start',
  editorChecks: 'start',
  deepStudy: 'pro',
  allCourses: 'pro',
  practiceTasks: 'pro',
  certificate: 'pro',
  aiTutor: 'pro',
  mentor: 'ultra',
  projectReview: 'ultra',
  privateCommunity: 'ultra',
  jobPrep: 'ultra',
  voiceAssistant: 'ultra',
};

const RANK: Record<PlanId, number> = { start: 0, pro: 1, ultra: 2 };

/** True when a plan includes a feature, either directly or from a lower plan. */
export function planIncludes(plan: PlanId, feature: PlanFeature): boolean {
  return RANK[plan] >= RANK[FEATURE_PLAN[feature]];
}

/** The features a plan adds on top of the plan below it, in display order. */
export function planOwnFeatures(plan: PlanId): PlanFeature[] {
  return (Object.keys(FEATURE_PLAN) as PlanFeature[]).filter(
    (feature) => FEATURE_PLAN[feature] === plan,
  );
}
