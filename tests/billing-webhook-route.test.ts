// @vitest-environment node
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBillingDb, resetBillingDb } from './billing-db';
import {
  BILLING_ENV,
  DAY,
  eventBody,
  setBillingEnv,
  signedWebhook,
  subscriptionData,
  USER_A,
  USER_B,
} from './billing-helpers';

// The handler runs against a real PostgreSQL (PGlite) through a small adapter that
// looks like the service-role Supabase client. No real network call is possible.
const mocks = vi.hoisted(() => ({ admin: null as unknown }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: () => mocks.admin }));
import { POST } from '@/app/api/billing/webhook/route';

let db: PGlite;
let existingUsers: string[];
let failWrites: boolean;
let authError: { status: number; code: string } | null;
const getUserById = vi.fn();

function adapter() {
  return {
    auth: {
      admin: {
        getUserById: async (id: string) => {
          getUserById(id);
          if (authError) return { data: { user: null }, error: authError };
          return existingUsers.includes(id)
            ? { data: { user: { id } }, error: null }
            : { data: { user: null }, error: { status: 404, code: 'user_not_found' } };
        },
      },
    },
    from: (table: string) => {
      const filters: [string, unknown][] = [];
      const chain = {
        select: () => chain,
        eq: (column: string, value: unknown) => {
          filters.push([column, value]);
          return chain;
        },
        maybeSingle: async () => {
          const where = filters.map(([column], i) => `${column} = $${i + 1}`).join(' and ');
          const result = await db.query(
            `select user_id from public.${table} where ${where}`,
            filters.map(([, value]) => value),
          );
          return { data: result.rows[0] ?? null, error: null };
        },
      };
      return chain;
    },
    rpc: async (name: string, args: Record<string, unknown>) => {
      if (failWrites) return { data: null, error: { code: 'XX000' } };
      const keys = Object.keys(args);
      try {
        const result = await db.query<{ result: string }>(
          `select public.${name}(${keys.map((key, i) => `${key} => $${i + 1}`).join(', ')}) as result`,
          keys.map((key) => args[key]),
        );
        return { data: result.rows[0].result, error: null };
      } catch (error) {
        return { data: null, error: { code: 'XX000', message: String(error) } };
      }
    },
  };
}

const membership = async (user = USER_A) =>
  (
    await db.query<{
      tier: string;
      source: string;
      expires_at: Date;
      provider_subscription_id: string;
      provider_status: string;
      cancel_at_period_end: boolean;
    }>(
      `select tier, source, expires_at, provider_subscription_id, provider_status, cancel_at_period_end
         from public.react_mentor_memberships where user_id = $1`,
      [user],
    )
  ).rows[0];
const processedIds = async () =>
  (await db.query<{ id: string }>('select id from public.react_mentor_webhook_events')).rows.map(
    (row) => row.id,
  );
const send = async (request: Request) => {
  const response = await POST(request);
  return { status: response.status, json: (await response.json()) as Record<string, unknown> };
};
const deliver = (type: string, data: Record<string, unknown>, id?: string) =>
  send(signedWebhook(eventBody(type, subscriptionData(data)), { id }));
const iso = (days: number) => new Date(Date.now() + days * DAY).toISOString();

beforeAll(async () => {
  db = await createBillingDb();
}, 30000);
afterAll(async () => {
  await db?.close();
});
beforeEach(async () => {
  await resetBillingDb(db);
  existingUsers = [USER_A, USER_B];
  failWrites = false;
  authError = null;
  getUserById.mockClear();
  mocks.admin = adapter();
  setBillingEnv(vi.stubEnv);
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('Unexpected network call in a test');
    }),
  );
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('webhook signature and setup', () => {
  it('answers billing_not_configured (503) without the Dodo variables and touches nothing', async () => {
    vi.stubEnv('DODO_PAYMENTS_WEBHOOK_KEY', '');
    const result = await send(signedWebhook(eventBody('subscription.active')));
    expect(result).toEqual({ status: 503, json: { error: 'billing_not_configured' } });
    expect(getUserById).not.toHaveBeenCalled();
    expect(await membership()).toBeUndefined();
  });

  it('rejects a wrong signature with 401 and no side effects', async () => {
    const wrong = 'whsec_' + Buffer.from('an attacker guessed key').toString('base64');
    const result = await send(signedWebhook(eventBody('subscription.active'), { secret: wrong }));
    expect(result).toEqual({ status: 401, json: { error: 'invalid_signature' } });
    expect(getUserById).not.toHaveBeenCalled();
    expect(await membership()).toBeUndefined();
    expect(await processedIds()).toEqual([]);
  });

  it('rejects a body changed after signing (upgrade to Ultra for free)', async () => {
    const original = eventBody('subscription.active', subscriptionData());
    const forged = original.replace(BILLING_ENV.DODO_PRODUCT_PRO, BILLING_ENV.DODO_PRODUCT_ULTRA);
    const signed = signedWebhook(original, { id: 'msg_forge' });
    const request = new Request(signed.url, {
      method: 'POST',
      headers: signed.headers,
      body: forged,
    });
    expect((await send(request)).status).toBe(401);
    expect(await membership()).toBeUndefined();
  });

  it('rejects an old timestamp, missing headers and garbage signatures', async () => {
    const body = eventBody('subscription.active');
    const old = Math.floor(Date.now() / 1000) - 3600;
    expect((await send(signedWebhook(body, { timestamp: old }))).status).toBe(401);
    for (const omit of ['webhook-id', 'webhook-timestamp', 'webhook-signature'] as const)
      expect((await send(signedWebhook(body, { omit }))).status, omit).toBe(401);
    expect((await send(signedWebhook(body, { signature: 'v1,AAAA' }))).status).toBe(401);
    expect(await membership()).toBeUndefined();
  });

  it('rejects a huge body before reading it all', async () => {
    const result = await send(signedWebhook('x'.repeat(300 * 1024)));
    expect(result.status).toBe(413);
  });
});

describe('subscription lifecycle', () => {
  it('activation switches the plan on until the end of the paid period', async () => {
    const next = iso(30);
    const result = await deliver('subscription.active', { next_billing_date: next });
    expect(result).toEqual({ status: 200, json: { received: true, result: 'applied' } });
    const saved = await membership();
    expect(saved).toMatchObject({
      tier: 'pro',
      source: 'payment',
      provider_subscription_id: 'sub_test_1',
      provider_status: 'active',
    });
    expect(saved.expires_at.getTime()).toBe(new Date(next).getTime());
  });

  it('the same webhook id delivered twice is processed once (idempotent)', async () => {
    const first = await deliver('subscription.active', { next_billing_date: iso(30) }, 'msg_same');
    expect(first.json.result).toBe('applied');
    const before = await membership();
    const second = await deliver(
      'subscription.active',
      { next_billing_date: iso(400), product_id: BILLING_ENV.DODO_PRODUCT_ULTRA },
      'msg_same',
    );
    expect(second).toEqual({ status: 200, json: { received: true, result: 'duplicate' } });
    expect(await membership()).toEqual(before);
    expect(await processedIds()).toEqual(['msg_same']);
  });

  it('renewal extends the end date', async () => {
    await deliver('subscription.active', { next_billing_date: iso(1) });
    const next = iso(31);
    expect((await deliver('subscription.renewed', { next_billing_date: next })).json.result).toBe(
      'applied',
    );
    expect((await membership()).expires_at.getTime()).toBe(new Date(next).getTime());
  });

  it('the plan comes from the product id: forged metadata.tier changes nothing', async () => {
    await deliver('subscription.active', { metadata: { user_id: USER_A, tier: 'expert' } });
    expect((await membership()).tier).toBe('pro');
    await resetBillingDb(db);
    await deliver(
      'subscription.active',
      {
        product_id: BILLING_ENV.DODO_PRODUCT_ULTRA,
        metadata: { user_id: USER_A, tier: 'pro' },
      },
      'msg_ultra',
    );
    expect((await membership()).tier).toBe('expert');
  });

  it('plan change to Ultra upgrades the same subscription', async () => {
    await deliver('subscription.active', {});
    await deliver('subscription.plan_changed', { product_id: BILLING_ENV.DODO_PRODUCT_ULTRA });
    expect(await membership()).toMatchObject({
      tier: 'expert',
      provider_subscription_id: 'sub_test_1',
    });
  });

  it('cancelling at the next billing date keeps access until then', async () => {
    const next = iso(10);
    await deliver('subscription.active', { next_billing_date: iso(10) });
    await deliver('subscription.cancelled', {
      status: 'cancelled',
      cancel_at_next_billing_date: true,
      next_billing_date: next,
    });
    const saved = await membership();
    expect(saved).toMatchObject({ provider_status: 'cancelled', cancel_at_period_end: true });
    expect(saved.expires_at.getTime()).toBe(new Date(next).getTime());
  });

  it('immediate cancellation and expiry end access', async () => {
    await deliver('subscription.active', { next_billing_date: iso(20) });
    await deliver('subscription.cancelled', {
      status: 'cancelled',
      cancel_at_next_billing_date: false,
      next_billing_date: iso(20),
    });
    expect((await membership()).expires_at.getTime()).toBeLessThanOrEqual(Date.now());
    await resetBillingDb(db);
    await deliver('subscription.active', { next_billing_date: iso(20) }, 'msg_again');
    await deliver('subscription.expired', { status: 'expired' });
    const saved = await membership();
    expect(saved.provider_status).toBe('expired');
    expect(saved.expires_at.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('on hold after a failed renewal does not give a new paid period', async () => {
    const end = iso(1);
    await deliver('subscription.active', { next_billing_date: end });
    await deliver('subscription.on_hold', { status: 'on_hold', next_billing_date: iso(31) });
    const saved = await membership();
    expect(saved.provider_status).toBe('on_hold');
    expect(saved.expires_at.getTime()).toBe(new Date(end).getTime());
  });

  it('a failed first payment never creates access', async () => {
    const result = await deliver('subscription.failed', { status: 'failed' });
    expect(result.status).toBe(200);
    expect(await membership()).toBeUndefined();
  });
});

describe('untrusted data inside a correctly signed event', () => {
  it('ignores unknown event types (200) and records nothing', async () => {
    const result = await send(signedWebhook(eventBody('payment.succeeded'), { id: 'msg_pay' }));
    expect(result).toEqual({ status: 200, json: { received: true, ignored: 'unknown_event' } });
    expect(await membership()).toBeUndefined();
    expect(await processedIds()).toEqual([]);
  });

  it('ignores a product we do not sell', async () => {
    const result = await deliver('subscription.active', { product_id: 'pdt_someone_elses' });
    expect(result.json).toEqual({ received: true, ignored: 'unknown_product' });
    expect(await membership()).toBeUndefined();
  });

  it('checks that the user in metadata really exists', async () => {
    const ghost = '99999999-9999-4999-8999-999999999999';
    const result = await deliver('subscription.active', { metadata: { user_id: ghost } });
    expect(result).toEqual({ status: 200, json: { received: true, ignored: 'user_not_found' } });
    expect(getUserById).toHaveBeenCalledWith(ghost);
    const rows = await db.query('select * from public.react_mentor_memberships');
    expect(rows.rows).toEqual([]);
  });

  it('ignores a missing or malformed user id', async () => {
    for (const metadata of [{}, { user_id: 'not-a-uuid' }, { user_id: "1' or '1'='1" }, null]) {
      const result = await deliver('subscription.active', { metadata }, 'msg_' + String(metadata));
      expect(result.json.ignored, JSON.stringify(metadata)).toBe('no_user');
    }
    expect(await membership()).toBeUndefined();
  });

  it('cannot move a subscription to another account with a forged user id', async () => {
    await deliver('subscription.active', { metadata: { user_id: USER_A } });
    const before = await membership();
    const result = await deliver('subscription.renewed', { metadata: { user_id: USER_B } });
    expect(result.json).toEqual({ received: true, ignored: 'user_mismatch' });
    expect(await membership(USER_B)).toBeUndefined();
    expect(await membership()).toEqual(before);
  });

  it('finds the owner of an event that has no user id from the stored subscription', async () => {
    await deliver('subscription.active', {});
    const next = iso(60);
    const result = await deliver('subscription.renewed', { metadata: {}, next_billing_date: next });
    expect(result.json.result).toBe('applied');
    expect((await membership()).expires_at.getTime()).toBe(new Date(next).getTime());
  });

  it('does not let a second subscription replace running access, and logs it for a refund', async () => {
    await deliver('subscription.active', { next_billing_date: iso(20) });
    const result = await deliver('subscription.active', {
      subscription_id: 'sub_double',
      next_billing_date: iso(30),
    });
    expect(result.json.result).toBe('conflict');
    expect((await membership()).provider_subscription_id).toBe('sub_test_1');
    expect(console.error).toHaveBeenCalledWith(
      'billing conflict: refund may be needed',
      expect.objectContaining({ subscriptionId: 'sub_double' }),
    );
  });
});

describe('failures are retried, not hidden', () => {
  it('answers 2xx only after the write: a failed write returns an error and can be retried', async () => {
    failWrites = true;
    const failed = await deliver('subscription.active', {}, 'msg_retry');
    expect(failed.status).toBe(500);
    expect(await membership()).toBeUndefined();
    failWrites = false;
    const retried = await deliver('subscription.active', {}, 'msg_retry');
    expect(retried).toEqual({ status: 200, json: { received: true, result: 'applied' } });
    expect((await membership()).tier).toBe('pro');
  });

  it('a temporary auth-service error is retried (503) and writes nothing', async () => {
    authError = { status: 500, code: 'unexpected_failure' };
    const result = await deliver('subscription.active', {});
    expect(result.status).toBe(503);
    expect(await membership()).toBeUndefined();
    expect(await processedIds()).toEqual([]);
  });

  it('is unavailable (503) when the service role is not configured', async () => {
    mocks.admin = null;
    expect((await deliver('subscription.active', {})).status).toBe(503);
  });
});
