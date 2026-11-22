import type { DodoConfig, PaidTier } from './dodo-config';

/**
 * The three Dodo Payments API calls DevAtlas needs, over plain `fetch` with a timeout
 * (no SDK, so there is nothing extra to install or audit). Field names follow
 * https://docs.dodopayments.com: POST /checkouts, POST /subscriptions/{id}/change-plan and
 * POST /customers/{id}/customer-portal/session.
 */
const TIMEOUT_MS = 10_000;

export class DodoApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
  ) {
    super(`Dodo Payments request failed (${status}${code ? ' ' + code : ''})`);
    this.name = 'DodoApiError';
  }
}

/** Only ever send people to Dodo's own hosts, even if a response were unexpected. */
export function isDodoUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'dodopayments.com' || url.hostname.endsWith('.dodopayments.com'))
    );
  } catch {
    return false;
  }
}

async function dodoRequest(config: DodoConfig, path: string, body?: unknown): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(config.baseUrl + path, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch {
    // Network error or timeout: nothing from the response can be trusted or logged.
    throw new DodoApiError(0, 'network');
  }
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const code =
      data && typeof data === 'object' && 'code' in data && typeof data.code === 'string'
        ? data.code.slice(0, 80)
        : null;
    throw new DodoApiError(response.status, code);
  }
  return data;
}

export type CheckoutInput = {
  tier: PaidTier;
  userId: string;
  email: string;
  returnUrl: string;
  cancelUrl: string;
};

/** A hosted checkout for the product that sells `tier`. The link works once. */
export async function createCheckoutSession(config: DodoConfig, input: CheckoutInput) {
  const data = await dodoRequest(config, '/checkouts', {
    product_cart: [{ product_id: config.products[input.tier], quantity: 1 }],
    customer: { email: input.email },
    // Returned unchanged in the subscription webhooks. The plan is still taken from the
    // product id there; the user id is checked against the database before it is used.
    metadata: { user_id: input.userId, tier: input.tier },
    return_url: input.returnUrl,
    cancel_url: input.cancelUrl,
  });
  const url =
    data && typeof data === 'object' && 'checkout_url' in data ? data.checkout_url : undefined;
  if (!isDodoUrl(url)) throw new DodoApiError(502, 'bad_checkout_url');
  return { url };
}

/** Upgrade an existing subscription to another product instead of creating a second one. */
export async function changeSubscriptionPlan(
  config: DodoConfig,
  subscriptionId: string,
  tier: PaidTier,
): Promise<{ url?: string }> {
  const data = await dodoRequest(
    config,
    `/subscriptions/${encodeURIComponent(subscriptionId)}/change-plan`,
    {
      product_id: config.products[tier],
      quantity: 1,
      // Charge the rest of the current period difference now. If the card is declined the
      // subscription stays on its current plan, so the higher plan is never given for free.
      proration_billing_mode: 'prorated_immediately',
      on_payment_failure: 'prevent_change',
    },
  );
  if (data && typeof data === 'object' && 'payment_link' in data && data.payment_link != null) {
    if (!isDodoUrl(data.payment_link)) throw new DodoApiError(502, 'bad_payment_link');
    return { url: data.payment_link };
  }
  return {};
}

/** A signed link (valid 24 hours) to Dodo's customer portal: cancel, card, invoices. */
export async function createPortalSession(
  config: DodoConfig,
  customerId: string,
  returnUrl: string,
) {
  const data = await dodoRequest(
    config,
    `/customers/${encodeURIComponent(customerId)}/customer-portal/session?return_url=${encodeURIComponent(returnUrl)}`,
  );
  const link = data && typeof data === 'object' && 'link' in data ? data.link : undefined;
  if (!isDodoUrl(link)) throw new DodoApiError(502, 'bad_portal_url');
  return { url: link };
}
