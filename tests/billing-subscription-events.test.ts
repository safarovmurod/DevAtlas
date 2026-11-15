// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getDodoConfig, tierForProduct } from '@/lib/billing/dodo-config';
import { planSubscriptionEvent } from '@/lib/billing/subscription-events';
import { BILLING_ENV, DAY, eventBody, subscriptionData, USER_A } from './billing-helpers';

const config = getDodoConfig({ ...BILLING_ENV })!;
const now = Date.now();
const event = (type: string, overrides: Record<string, unknown> = {}) =>
  JSON.parse(eventBody(type, subscriptionData(overrides)));
const plan = (type: string, overrides: Record<string, unknown> = {}) =>
  planSubscriptionEvent(event(type, overrides), config, now);
const inDays = (days: number) => new Date(now + days * DAY).toISOString();

describe('Dodo settings', () => {
  it('are off until every variable is set', () => {
    expect(getDodoConfig({})).toBeNull();
    for (const name of Object.keys(BILLING_ENV))
      expect(getDodoConfig({ ...BILLING_ENV, [name]: '' }), name).toBeNull();
    expect(getDodoConfig({ ...BILLING_ENV })).toMatchObject({
      environment: 'test_mode',
      baseUrl: 'https://test.dodopayments.com',
      products: { pro: 'pdt_pro_test', expert: 'pdt_ultra_test' },
    });
  });

  it('refuses a wrong environment, a mixed up key and bad product ids', () => {
    expect(getDodoConfig({ ...BILLING_ENV, DODO_PAYMENTS_ENVIRONMENT: 'production' })).toBeNull();
    expect(
      getDodoConfig({
        ...BILLING_ENV,
        DODO_PAYMENTS_ENVIRONMENT: 'live_mode',
        DODO_PAYMENTS_API_KEY: 'dodo_test_abc',
      }),
    ).toBeNull();
    expect(getDodoConfig({ ...BILLING_ENV, DODO_PAYMENTS_API_KEY: 'dodo_live_abc' })).toBeNull();
    expect(getDodoConfig({ ...BILLING_ENV, DODO_PRODUCT_PRO: 'prod_123' })).toBeNull();
    expect(
      getDodoConfig({ ...BILLING_ENV, DODO_PRODUCT_ULTRA: BILLING_ENV.DODO_PRODUCT_PRO }),
    ).toBeNull();
    expect(
      getDodoConfig({
        ...BILLING_ENV,
        DODO_PAYMENTS_ENVIRONMENT: 'live_mode',
        DODO_PAYMENTS_API_KEY: 'dodo_live_abc',
      })?.baseUrl,
    ).toBe('https://live.dodopayments.com');
  });

  it('maps a product id to a tier and nothing else', () => {
    expect(tierForProduct(config, 'pdt_pro_test')).toBe('pro');
    expect(tierForProduct(config, 'pdt_ultra_test')).toBe('expert');
    expect(tierForProduct(config, 'pdt_other')).toBeNull();
    expect(tierForProduct(config, undefined)).toBeNull();
    expect(tierForProduct(config, 'pro')).toBeNull();
  });
});

describe('subscription events become one decision', () => {
  it('gives paid time until the next billing date on activation, renewal and plan change', () => {
    const next = inDays(30);
    for (const type of [
      'subscription.active',
      'subscription.renewed',
      'subscription.plan_changed',
      'subscription.updated',
      'subscription.unpaused',
    ]) {
      expect(plan(type, { next_billing_date: next }), type).toMatchObject({
        kind: 'apply',
        grant: true,
        tier: 'pro',
        expiresAt: next,
        subscriptionId: 'sub_test_1',
        customerId: 'cus_test_1',
        userHint: USER_A,
      });
    }
  });

  it('takes the plan from the product id, never from metadata.tier', () => {
    const forged = plan('subscription.active', {
      metadata: { user_id: USER_A, tier: 'expert' },
    });
    expect(forged).toMatchObject({ kind: 'apply', tier: 'pro' });
    const ultra = plan('subscription.active', {
      product_id: BILLING_ENV.DODO_PRODUCT_ULTRA,
      metadata: { user_id: USER_A, tier: 'pro' },
    });
    expect(ultra).toMatchObject({ kind: 'apply', tier: 'expert' });
  });

  it('ignores a product we do not sell, even with a convincing tier in metadata', () => {
    expect(plan('subscription.active', { product_id: 'pdt_unknown' })).toMatchObject({
      kind: 'ignore',
      reason: 'unknown_product',
    });
  });

  it('ignores unknown event types and malformed payloads', () => {
    expect(planSubscriptionEvent(event('payment.succeeded'), config, now)).toMatchObject({
      kind: 'ignore',
      reason: 'unknown_event',
    });
    expect(planSubscriptionEvent(event('subscription.something_new'), config, now).kind).toBe(
      'ignore',
    );
    expect(planSubscriptionEvent({ nope: true }, config, now)).toMatchObject({ kind: 'ignore' });
    expect(planSubscriptionEvent(null, config, now).kind).toBe('ignore');
    expect(
      planSubscriptionEvent(
        { type: 'subscription.active', data: { status: 'active' } },
        config,
        now,
      ),
    ).toMatchObject({ kind: 'ignore', reason: 'bad_subscription' });
    expect(plan('subscription.active', { next_billing_date: null })).toMatchObject({
      kind: 'ignore',
      reason: 'no_billing_date',
    });
  });

  it('keeps access until the end of the paid period when cancelled at the next billing date', () => {
    const next = inDays(12);
    for (const status of ['active', 'cancelled'])
      expect(
        plan('subscription.cancelled', {
          status,
          cancel_at_next_billing_date: true,
          next_billing_date: next,
        }),
      ).toMatchObject({ grant: true, expiresAt: next, cancelAtPeriodEnd: true });
    // The same flag on a later renewed/updated event (status still active) behaves alike.
    expect(
      plan('subscription.updated', { cancel_at_next_billing_date: true, next_billing_date: next }),
    ).toMatchObject({ grant: true, expiresAt: next, cancelAtPeriodEnd: true });
  });

  it('ends access now when cancelled immediately, expired or paused', () => {
    const immediate = plan('subscription.cancelled', {
      status: 'cancelled',
      cancel_at_next_billing_date: false,
      next_billing_date: inDays(20),
    });
    expect(immediate).toMatchObject({ grant: false, expiresAt: new Date(now).toISOString() });
    expect(plan('subscription.expired', { status: 'expired' })).toMatchObject({
      grant: false,
      expiresAt: new Date(now).toISOString(),
    });
    expect(plan('subscription.paused', { status: 'paused' })).toMatchObject({ grant: false });
    // A "scheduled" cancellation whose date already passed cannot extend access.
    expect(
      plan('subscription.cancelled', {
        status: 'cancelled',
        cancel_at_next_billing_date: true,
        next_billing_date: inDays(-1),
      }),
    ).toMatchObject({ grant: false, expiresAt: new Date(now).toISOString() });
  });

  it('never extends access on a failed payment: on hold and failed only record the status', () => {
    expect(plan('subscription.on_hold', { status: 'on_hold' })).toMatchObject({
      grant: false,
      expiresAt: null,
      status: 'on_hold',
    });
    expect(plan('subscription.failed', { status: 'failed' })).toMatchObject({
      grant: false,
      expiresAt: null,
    });
  });

  it('lets an inconsistent event only take access away, never add it', () => {
    // Type says expired / on hold / failed, status field still says active.
    expect(plan('subscription.expired', { status: 'active' })).toMatchObject({ grant: false });
    expect(plan('subscription.on_hold', { status: 'active' })).toMatchObject({
      grant: false,
      expiresAt: null,
    });
    expect(plan('subscription.failed', { status: 'active' })).toMatchObject({ grant: false });
    expect(plan('subscription.renewed', { status: 'on_hold' })).toMatchObject({ grant: false });
    expect(plan('subscription.renewed', { status: 'expired' })).toMatchObject({ grant: false });
  });

  it('keeps access during the grace period of a failed renewal', () => {
    const grace = inDays(3);
    expect(
      plan('subscription.past_due', { status: 'past_due', past_due_ends_at: grace }),
    ).toMatchObject({ grant: true, expiresAt: grace });
    expect(plan('subscription.past_due', { status: 'past_due' })).toMatchObject({ grant: false });
  });

  it('does not use the cancel flag or a missing user id to grant by itself', () => {
    expect(plan('subscription.active', { metadata: {} })).toMatchObject({
      kind: 'apply',
      userHint: null,
    });
    expect(plan('subscription.active', { metadata: { user_id: 42 } })).toMatchObject({
      userHint: null,
    });
    expect(plan('subscription.active', { status: 'pending' })).toMatchObject({ kind: 'ignore' });
  });
});
