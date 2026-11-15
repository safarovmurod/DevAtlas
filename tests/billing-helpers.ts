import { webhookSignature } from '@/lib/billing/webhook-signature';

/** Shared fixtures for the billing tests. Every key and id here is a made-up test value. */
export const SECRET = 'whsec_' + Buffer.from('devatlas-test-signing-key-123456').toString('base64');
export const BILLING_ENV = {
  DODO_PAYMENTS_API_KEY: 'dodo_test_key_for_unit_tests',
  DODO_PAYMENTS_WEBHOOK_KEY: SECRET,
  DODO_PAYMENTS_ENVIRONMENT: 'test_mode',
  DODO_PRODUCT_PRO: 'pdt_pro_test',
  DODO_PRODUCT_ULTRA: 'pdt_ultra_test',
} as const;

export const USER_A = '11111111-1111-4111-8111-111111111111';
export const USER_B = '22222222-2222-4222-8222-222222222222';
export const DAY = 86_400_000;

export function setBillingEnv(
  stub: (name: string, value: string) => unknown,
  overrides: Partial<Record<keyof typeof BILLING_ENV, string>> = {},
) {
  for (const [name, value] of Object.entries({ ...BILLING_ENV, ...overrides })) stub(name, value);
}

/** The `data` of a Dodo subscription webhook (only the fields DevAtlas reads). */
export function subscriptionData(overrides: Record<string, unknown> = {}) {
  return {
    payload_type: 'Subscription',
    subscription_id: 'sub_test_1',
    product_id: BILLING_ENV.DODO_PRODUCT_PRO,
    status: 'active',
    customer: { customer_id: 'cus_test_1', email: 'learner@example.test', name: 'Learner' },
    metadata: { user_id: USER_A, tier: 'pro' },
    next_billing_date: new Date(Date.now() + 30 * DAY).toISOString(),
    previous_billing_date: new Date().toISOString(),
    cancel_at_next_billing_date: false,
    ...overrides,
  };
}

export function eventBody(
  type: string,
  data: Record<string, unknown> = subscriptionData(),
  timestamp = new Date().toISOString(),
) {
  return JSON.stringify({ business_id: 'bus_test', type, timestamp, data });
}

export function signedWebhook(
  body: string,
  options: {
    id?: string;
    timestamp?: number;
    secret?: string;
    signature?: string | null;
    omit?: 'webhook-id' | 'webhook-timestamp' | 'webhook-signature';
  } = {},
) {
  const id = options.id ?? 'msg_' + Math.random().toString(36).slice(2);
  const timestamp = String(options.timestamp ?? Math.floor(Date.now() / 1000));
  const signature =
    options.signature !== undefined
      ? options.signature
      : 'v1,' + webhookSignature(options.secret ?? SECRET, id, timestamp, body);
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'webhook-id': id,
    'webhook-timestamp': timestamp,
  };
  if (signature) headers['webhook-signature'] = signature;
  if (options.omit) delete headers[options.omit];
  return new Request('https://example.test/api/billing/webhook', {
    method: 'POST',
    headers,
    body,
  });
}
