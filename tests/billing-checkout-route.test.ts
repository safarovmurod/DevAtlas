// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetProviderCalls, toBillingStatus } from '@/lib/billing/billing-server';
import { createPortalSession, isDodoUrl } from '@/lib/billing/dodo-client';
import { getDodoConfig } from '@/lib/billing/dodo-config';
import { BILLING_ENV, DAY, setBillingEnv, USER_A } from './billing-helpers';

// Every HTTP call to Dodo Payments is a mock. Any other URL fails the test.
const mocks = vi.hoisted(() => ({
  user: null as null | { id: string; email?: string | null },
  row: null as Record<string, unknown> | null,
  rowError: false,
  statusRowErrors: [] as boolean[],
  selects: [] as string[],
}));
vi.mock('@/lib/account/require-user', () => ({ authenticatedUser: async () => mocks.user }));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () =>
            mocks.rowError
              ? { data: null, error: { code: 'XX000' } }
              : { data: mocks.row, error: null },
        }),
      }),
    }),
  }),
}));
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: () => ({
      select: (columns: string) => ({
        eq: () => ({
          maybeSingle: async () => {
            mocks.selects.push(columns);
            const failed = mocks.statusRowErrors.shift() ?? false;
            return failed
              ? { data: null, error: { code: '42703' } }
              : { data: mocks.row, error: null };
          },
        }),
      }),
    }),
  }),
}));
import { POST as checkout } from '@/app/api/billing/checkout/route';
import { POST as portal } from '@/app/api/billing/portal/route';
import { GET as status } from '@/app/api/billing/status/route';

const CHECKOUT_URL = 'https://test.checkout.dodopayments.com/session/cks_1';
type Call = { url: string; init: RequestInit; body: Record<string, any> | null };
let calls: Call[];
let reply: (call: Call) => { status: number; json: unknown };

function request(path: string, body?: unknown, method = 'POST') {
  return new Request('https://devatlas.test' + path, {
    method,
    headers: { 'content-type': 'application/json', authorization: 'Bearer token' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
const buy = (tier: string) => checkout(request('/api/billing/checkout', { tier }));
const days = (n: number) => new Date(Date.now() + n * DAY).toISOString();
const paidRow = (overrides: Record<string, unknown> = {}) => ({
  tier: 'pro',
  expires_at: days(10),
  source: 'payment',
  provider: 'dodo',
  provider_customer_id: 'cus_1',
  provider_subscription_id: 'sub_1',
  provider_status: 'active',
  cancel_at_period_end: false,
  ...overrides,
});

beforeEach(() => {
  mocks.user = { id: USER_A, email: 'learner@example.test' };
  mocks.row = null;
  mocks.rowError = false;
  mocks.statusRowErrors = [];
  mocks.selects = [];
  calls = [];
  reply = (call) => {
    if (call.url === 'https://test.dodopayments.com/checkouts')
      return { status: 200, json: { session_id: 'cks_1', checkout_url: CHECKOUT_URL } };
    if (call.url === 'https://test.dodopayments.com/subscriptions/sub_1/change-plan')
      return { status: 200, json: { status: 'processing' } };
    if (
      call.url.startsWith('https://test.dodopayments.com/customers/cus_1/customer-portal/session')
    )
      return {
        status: 200,
        json: { link: 'https://test.customer.dodopayments.com/session/portal_1' },
      };
    throw new Error('Unexpected network call: ' + call.url);
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      const call: Call = {
        url,
        init,
        body: typeof init.body === 'string' ? JSON.parse(init.body) : null,
      };
      calls.push(call);
      const result = reply(call);
      return new Response(JSON.stringify(result.json), { status: result.status });
    }),
  );
  setBillingEnv(vi.stubEnv);
  resetProviderCalls();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('checkout', () => {
  it('requires a signed-in user and calls nobody otherwise', async () => {
    mocks.user = null;
    expect((await buy('pro')).status).toBe(401);
    expect(calls).toHaveLength(0);
  });

  it('is off without the Dodo variables: billing_not_configured, no provider call', async () => {
    vi.stubEnv('DODO_PRODUCT_ULTRA', '');
    for (const tier of ['pro', 'expert']) {
      const response = await buy(tier);
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: 'billing_not_configured' });
    }
    expect(calls).toHaveLength(0);
  });

  it('rejects unknown plans, oversized and broken bodies', async () => {
    expect((await buy('admin')).status).toBe(400);
    expect((await buy('starter')).status).toBe(400);
    expect(
      (await checkout(request('/api/billing/checkout', { tier: 'pro', pad: 'x'.repeat(2000) })))
        .status,
    ).toBe(413);
    expect(
      (await checkout(new Request('https://devatlas.test/x', { method: 'POST', body: 'nope' })))
        .status,
    ).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it('creates a hosted checkout for the product of the plan, with user id and tier in metadata', async () => {
    const pro = await buy('pro');
    expect(pro.status).toBe(200);
    expect(await pro.json()).toEqual({ url: CHECKOUT_URL });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://test.dodopayments.com/checkouts');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe(
      'Bearer ' + BILLING_ENV.DODO_PAYMENTS_API_KEY,
    );
    expect(calls[0].body).toMatchObject({
      product_cart: [{ product_id: 'pdt_pro_test', quantity: 1 }],
      customer: { email: 'learner@example.test' },
      metadata: { user_id: USER_A, tier: 'pro' },
      return_url: 'https://devatlas.test/plans?checkout=return&plan=pro',
      cancel_url: 'https://devatlas.test/plans?checkout=cancelled',
    });
    await buy('expert');
    expect(calls[1].body).toMatchObject({
      product_cart: [{ product_id: 'pdt_ultra_test', quantity: 1 }],
      metadata: { user_id: USER_A, tier: 'expert' },
      return_url: 'https://devatlas.test/plans?checkout=return&plan=ultra',
    });
  });

  it('uses the live address only in live mode', async () => {
    setBillingEnv(vi.stubEnv, {
      DODO_PAYMENTS_ENVIRONMENT: 'live_mode',
      DODO_PAYMENTS_API_KEY: 'dodo_live_unit_test_key',
    });
    reply = (call) => {
      expect(call.url).toBe('https://live.dodopayments.com/checkouts');
      return { status: 200, json: { checkout_url: 'https://checkout.dodopayments.com/session/x' } };
    };
    expect((await buy('pro')).status).toBe(200);
  });

  it('a user without an email cannot subscribe', async () => {
    mocks.user = { id: USER_A, email: null };
    expect((await buy('pro')).status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it('does not charge twice for the same plan or a lower one', async () => {
    mocks.row = paidRow({ tier: 'pro' });
    expect(await (await buy('pro')).json()).toEqual({ error: 'already_subscribed' });
    mocks.row = paidRow({ tier: 'expert' });
    expect((await buy('pro')).status).toBe(409);
    expect((await buy('expert')).status).toBe(409);
    // An admin gift counts too.
    mocks.row = { tier: 'expert', expires_at: days(5), source: 'admin' };
    expect((await buy('expert')).status).toBe(409);
    expect(calls).toHaveLength(0);
  });

  it('upgrades Pro to Ultra on the SAME subscription instead of creating a second one', async () => {
    mocks.row = paidRow();
    const response = await buy('expert');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ upgraded: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://test.dodopayments.com/subscriptions/sub_1/change-plan');
    expect(calls[0].body).toEqual({
      product_id: 'pdt_ultra_test',
      quantity: 1,
      proration_billing_mode: 'prorated_immediately',
      on_payment_failure: 'prevent_change',
    });
  });

  it('redirects to Dodo payment_link when change-plan requires hosted payment confirmation', async () => {
    mocks.row = paidRow();
    reply = () => ({
      status: 200,
      json: { payment_link: 'https://test.checkout.dodopayments.com/session/upgrade_1' },
    });
    const response = await buy('expert');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: 'https://test.checkout.dodopayments.com/session/upgrade_1',
    });

    reply = () => ({ status: 200, json: { payment_link: 'https://evil.example/steal' } });
    expect((await buy('expert')).status).toBe(502);
  });

  it('uses validated HTTPS REACT_MENTOR_SITE_URL when request origin is local behind a proxy', async () => {
    vi.stubEnv('REACT_MENTOR_SITE_URL', 'https://devatlas.app');
    const localReq = new Request('http://127.0.0.1:3000/api/billing/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer token' },
      body: JSON.stringify({ tier: 'pro' }),
    });
    const response = await checkout(localReq);
    expect(response.status).toBe(200);
    expect(calls[0].body).toMatchObject({
      return_url: 'https://devatlas.app/plans?checkout=return&plan=pro',
      cancel_url: 'https://devatlas.app/plans?checkout=cancelled',
    });
  });

  it('sends a subscription that needs attention to the customer portal, never to a second checkout', async () => {
    for (const row of [
      paidRow({ provider_status: 'on_hold' }),
      paidRow({ provider_status: 'past_due' }),
      paidRow({ cancel_at_period_end: true }),
      paidRow({ provider_status: 'on_hold', expires_at: days(-1) }),
      paidRow({ provider_status: 'cancelled' }),
    ]) {
      mocks.row = row;
      const response = await buy(row.expires_at < new Date().toISOString() ? 'pro' : 'expert');
      expect(await response.json(), JSON.stringify(row)).toEqual({ error: 'manage_in_portal' });
      expect(response.status).toBe(409);
    }
    expect(calls).toHaveLength(0);
  });

  it('lets an admin gift of a lower plan, or an ended plan, buy normally', async () => {
    mocks.row = { tier: 'pro', expires_at: days(30), source: 'admin' };
    expect((await buy('expert')).status).toBe(200);
    mocks.row = paidRow({ expires_at: days(-3), provider_status: 'expired' });
    expect((await buy('pro')).status).toBe(200);
    expect(calls.map((call) => call.url)).toEqual([
      'https://test.dodopayments.com/checkouts',
      'https://test.dodopayments.com/checkouts',
    ]);
  });

  it('turns provider failures into a generic 502 without leaking details', async () => {
    reply = () => ({ status: 401, json: { code: 'UNAUTHORIZED', message: 'secret details' } });
    const response = await buy('pro');
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'provider_error' });
    expect(console.error).toHaveBeenCalledWith('billing provider call failed', {
      step: 'checkout',
      status: 401,
      code: 'UNAUTHORIZED',
    });
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).not.toContain(BILLING_ENV.DODO_PAYMENTS_API_KEY);
    expect(logged).not.toContain('learner@example.test');
  });

  it('refuses a checkout address that is not a Dodo address', async () => {
    reply = () => ({ status: 200, json: { checkout_url: 'https://evil.example/pay' } });
    expect((await buy('pro')).status).toBe(502);
    reply = () => ({ status: 200, json: { checkout_url: 'http://checkout.dodopayments.com/x' } });
    expect((await buy('pro')).status).toBe(502);
    expect(isDodoUrl('https://dodopayments.com.evil.example/x')).toBe(false);
    expect(isDodoUrl('https://test.checkout.dodopayments.com/session/x')).toBe(true);
  });

  it('a network failure is a 502, not a crash', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    expect((await buy('pro')).status).toBe(502);
  });

  it('is unavailable when the membership cannot be read, and throttles repeated calls', async () => {
    mocks.rowError = true;
    expect((await buy('pro')).status).toBe(503);
    mocks.rowError = false;
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await buy('pro')).status);
    expect(statuses.slice(-1)).toEqual([429]);
  });
});

describe('customer portal', () => {
  const open = () => portal(request('/api/billing/portal', {}));

  it('requires a login and the Dodo settings', async () => {
    mocks.user = null;
    expect((await open()).status).toBe(401);
    mocks.user = { id: USER_A, email: 'learner@example.test' };
    vi.stubEnv('DODO_PAYMENTS_API_KEY', '');
    expect(await (await open()).json()).toEqual({ error: 'billing_not_configured' });
    expect(calls).toHaveLength(0);
  });

  it('has nothing to open for an account without a paid subscription', async () => {
    expect((await open()).status).toBe(404);
    mocks.row = { provider: null, provider_customer_id: null };
    expect((await open()).status).toBe(404);
    expect(calls).toHaveLength(0);
  });

  it('opens the portal for the customer stored on the account, never one from the request', async () => {
    mocks.row = { provider: 'dodo', provider_customer_id: 'cus_1' };
    const response = await portal(request('/api/billing/portal', { customer_id: 'cus_other' }));
    expect(await response.json()).toEqual({
      url: 'https://test.customer.dodopayments.com/session/portal_1',
    });
    expect(calls[0].url).toBe(
      'https://test.dodopayments.com/customers/cus_1/customer-portal/session?return_url=' +
        encodeURIComponent('https://devatlas.test/plans'),
    );
    expect(calls[0].init.method).toBe('POST');
  });

  it('turns a provider failure into 502', async () => {
    mocks.row = { provider: 'dodo', provider_customer_id: 'cus_1' };
    reply = () => ({ status: 500, json: { code: 'INTERNAL' } });
    expect((await open()).status).toBe(502);
  });

  it('only follows Dodo links', async () => {
    const config = getDodoConfig({ ...BILLING_ENV })!;
    reply = () => ({ status: 200, json: { link: 'https://evil.example/login' } });
    await expect(
      createPortalSession(config, 'cus_1', 'https://devatlas.test/plans'),
    ).rejects.toThrow();
  });
});

describe('status for the plans page', () => {
  const read = async (signedIn = true) => {
    mocks.user = signedIn ? { id: USER_A, email: 'a@example.test' } : null;
    const response = await status(request('/api/billing/status', undefined, 'GET'));
    return { status: response.status, json: await response.json() };
  };

  it('tells a guest only whether payments are on', async () => {
    mocks.row = paidRow();
    expect(await read(false)).toEqual({
      status: 200,
      json: { configured: true, signedIn: false, membership: null },
    });
    vi.stubEnv('DODO_PRODUCT_PRO', '');
    expect((await read(false)).json.configured).toBe(false);
  });

  it('shows what the database says, including whether the portal can be opened', async () => {
    const expires = days(25);
    mocks.row = paidRow({ expires_at: expires, tier: 'expert', cancel_at_period_end: true });
    expect((await read()).json).toEqual({
      configured: true,
      signedIn: true,
      membership: {
        tier: 'expert',
        expiresAt: expires,
        active: true,
        source: 'payment',
        status: 'active',
        cancelAtPeriodEnd: true,
        canManage: true,
      },
    });
  });

  it('shows no plan before the webhook has written one (a redirect is not proof)', async () => {
    mocks.row = null;
    expect((await read()).json).toEqual({ configured: true, signedIn: true, membership: null });
  });

  it('still answers before the billing migration is applied', async () => {
    mocks.statusRowErrors = [true];
    mocks.row = { tier: 'pro', expires_at: days(3), source: 'admin' };
    const result = await read();
    expect(result.status).toBe(200);
    expect(result.json.membership).toMatchObject({
      tier: 'pro',
      source: 'admin',
      canManage: false,
    });
    expect(mocks.selects).toEqual([
      expect.stringContaining('provider_status'),
      'tier,expires_at,source',
    ]);
  });

  it('maps rows without inventing access', () => {
    const now = Date.now();
    expect(toBillingStatus(null, true, true, now).membership).toBeNull();
    expect(
      toBillingStatus({ tier: 'starter', expires_at: days(1) }, true, true, now).membership,
    ).toBeNull();
    expect(
      toBillingStatus({ tier: 'pro', expires_at: days(-1), source: 'admin' }, true, true, now)
        .membership,
    ).toMatchObject({ active: false, canManage: false });
    expect(
      toBillingStatus({ tier: 'pro', expires_at: 'garbage' }, true, true, now).membership?.active,
    ).toBe(false);
    // Without Dodo settings the portal is never offered, even for a paid row.
    expect(toBillingStatus(paidRow() as never, false, true, now).membership?.canManage).toBe(false);
    // Admin rows never leak stale provider status or cancelAtPeriodEnd flags.
    expect(
      toBillingStatus(
        paidRow({ source: 'admin', provider_status: 'cancelled', cancel_at_period_end: true }) as never,
        true,
        true,
        now,
      ).membership,
    ).toMatchObject({
      source: 'admin',
      status: null,
      cancelAtPeriodEnd: false,
      canManage: false,
    });
  });
});
