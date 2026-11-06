import { getSupabaseAdminClient } from '@/lib/supabase/admin';
export const TUTOR_MAX_OUTPUT_TOKENS = 256;
const integer = (value: string | undefined, max: number) => {
  if (!value || !/^\d+$/.test(value)) return 0;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= max ? parsed : 0;
};
export function tutorBudgetConfig(env: Record<string, string | undefined> = process.env) {
  return {
    global: integer(env.AI_DAILY_BUDGET_MICROUSD, 1e12),
    user: integer(env.AI_USER_DAILY_BUDGET_MICROUSD, 1e12),
    requests: integer(env.AI_USER_DAILY_REQUEST_LIMIT, 10000),
    rate: integer(env.AI_MAX_MICROUSD_PER_TOKEN, 1e6),
    bounded: env.AI_PROVIDER_USAGE_BOUND_CONFIRMED === 'true',
  };
}
export type TutorBudgetResult =
  | { allowed: true }
  | {
      allowed: false;
      status: 429 | 503;
      error: 'ai_budget_not_configured' | 'ai_budget_unavailable' | 'ai_budget_exhausted';
    };
export async function reserveTutorBudget(
  userId: string,
  messages: { role: string; content: string }[],
): Promise<TutorBudgetResult> {
  const config = tutorBudgetConfig();
  if (!config.bounded || !config.global || !config.user || !config.requests || !config.rate)
    return { allowed: false, status: 503, error: 'ai_budget_not_configured' };
  // One UTF-8 byte per input token is a deliberately conservative upper bound
  // for the configured byte-token model, plus generous message framing. The
  // provider must enforce max_tokens across ALL billable output/reasoning.
  const tokens =
    Buffer.byteLength(JSON.stringify(messages), 'utf8') +
    messages.length * 64 +
    TUTOR_MAX_OUTPUT_TOKENS;
  const cost = tokens * config.rate;
  if (!Number.isSafeInteger(cost))
    return { allowed: false, status: 503, error: 'ai_budget_not_configured' };
  const admin = getSupabaseAdminClient();
  if (!admin) return { allowed: false, status: 503, error: 'ai_budget_unavailable' };
  try {
    const result = await admin.rpc('react_mentor_reserve_ai_budget', {
      learner_id: userId,
      reservation_microusd: cost,
      global_limit_microusd: config.global,
      user_limit_microusd: config.user,
      user_request_limit: config.requests,
    });
    if (result.error)
      return result.error.code === 'PT429'
        ? { allowed: false, status: 429, error: 'ai_budget_exhausted' }
        : { allowed: false, status: 503, error: 'ai_budget_unavailable' };
    return { allowed: true };
  } catch {
    return { allowed: false, status: 503, error: 'ai_budget_unavailable' };
  }
}
