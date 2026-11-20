import { z } from 'zod';
import { tierForProduct, type DodoConfig, type PaidTier } from './dodo-config';

/**
 * Turns a verified Dodo subscription webhook into one decision: ignore it, give paid time
 * until a date, or only record a status / end access. The decision depends on the state in
 * the payload (the provider sends the latest subscription state with every event), and on
 * the event type as a second guard, so an inconsistent event can only ever take access
 * away, never add it.
 */
export const SUBSCRIPTION_EVENTS = [
  'subscription.active',
  'subscription.updated',
  'subscription.renewed',
  'subscription.plan_changed',
  'subscription.update_payment_method',
  'subscription.unpaused',
  'subscription.past_due',
  'subscription.on_hold',
  'subscription.paused',
  'subscription.cancelled',
  'subscription.failed',
  'subscription.expired',
] as const;
const KNOWN = new Set<string>(SUBSCRIPTION_EVENTS);

const Envelope = z.object({
  type: z.string().max(100),
  timestamp: z.string().max(64).optional(),
  data: z.unknown(),
});
const SubscriptionData = z
  .object({
    subscription_id: z.string().min(1).max(200),
    product_id: z.string().min(1).max(200),
    status: z.string().max(50),
    customer: z.object({ customer_id: z.string().min(1).max(200) }),
    metadata: z.record(z.string(), z.unknown()).nullish(),
    next_billing_date: z.string().max(64).nullish(),
    cancel_at_next_billing_date: z.boolean().nullish(),
    past_due_ends_at: z.string().max(64).nullish(),
  })
  .passthrough();

export type PlannedEvent =
  | { kind: 'ignore'; reason: string; type?: string }
  | {
      kind: 'apply';
      type: string;
      /** true = paid time until `expiresAt`; false = status only / access ends. */
      grant: boolean;
      tier: PaidTier;
      /** Unverified id from metadata. The caller checks it against the database. */
      userHint: string | null;
      subscriptionId: string;
      customerId: string;
      status: string;
      cancelAtPeriodEnd: boolean;
      expiresAt: string | null;
      eventAt: string;
    };

const time = (value: string | null | undefined) => {
  const ms = value ? Date.parse(value) : NaN;
  return Number.isFinite(ms) ? ms : null;
};

export function planSubscriptionEvent(
  rawEvent: unknown,
  config: DodoConfig,
  nowMs = Date.now(),
): PlannedEvent {
  const envelope = Envelope.safeParse(rawEvent);
  if (!envelope.success) return { kind: 'ignore', reason: 'bad_envelope' };
  const { type } = envelope.data;
  if (!KNOWN.has(type)) return { kind: 'ignore', reason: 'unknown_event', type };
  const parsed = SubscriptionData.safeParse(envelope.data.data);
  if (!parsed.success) return { kind: 'ignore', reason: 'bad_subscription', type };
  const sub = parsed.data;

  // The plan comes from the product that was bought, never from metadata.tier.
  const tier = tierForProduct(config, sub.product_id);
  if (!tier) return { kind: 'ignore', reason: 'unknown_product', type };

  const userHint =
    typeof sub.metadata?.user_id === 'string' && sub.metadata.user_id.length <= 64
      ? sub.metadata.user_id
      : null;
  const eventAtMs = time(envelope.data.timestamp) ?? nowMs;
  const nextBilling = time(sub.next_billing_date);
  const cancelAtPeriodEnd = sub.cancel_at_next_billing_date === true;
  const now = new Date(nowMs).toISOString();
  const base = {
    kind: 'apply' as const,
    type,
    tier,
    userHint,
    subscriptionId: sub.subscription_id,
    customerId: sub.customer.customer_id,
    status: sub.status,
    cancelAtPeriodEnd,
    eventAt: new Date(eventAtMs).toISOString(),
  };
  const grantUntil = (ms: number): PlannedEvent => ({
    ...base,
    grant: true,
    expiresAt: new Date(ms).toISOString(),
  });
  const endNow: PlannedEvent = { ...base, grant: false, expiresAt: now };
  const statusOnly: PlannedEvent = { ...base, grant: false, expiresAt: null };

  // Event types that can only end or hold access, whatever the status field says.
  if (type === 'subscription.expired' || type === 'subscription.paused') return endNow;
  if (type === 'subscription.failed' || type === 'subscription.on_hold') return statusOnly;
  if (type === 'subscription.cancelled' || sub.status === 'cancelled') {
    // Cancelled "at the next billing date": paid time stays until that date.
    return cancelAtPeriodEnd && nextBilling !== null && nextBilling > nowMs
      ? grantUntil(nextBilling)
      : endNow;
  }

  switch (sub.status) {
    case 'active':
      if (nextBilling === null) return { kind: 'ignore', reason: 'no_billing_date', type };
      return grantUntil(nextBilling);
    case 'past_due': {
      // A failed renewal: the customer keeps access until the grace period ends.
      const graceEnd = time(sub.past_due_ends_at);
      return graceEnd !== null ? grantUntil(graceEnd) : statusOnly;
    }
    case 'expired':
    case 'paused':
      return endNow;
    case 'on_hold':
    case 'failed':
      return statusOnly;
    default:
      return { kind: 'ignore', reason: 'unhandled_status', type };
  }
}
