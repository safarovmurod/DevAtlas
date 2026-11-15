import type { MembershipTier } from './entitlements';

/**
 * Dodo Payments settings. They come only from environment variables and are never read
 * in the browser. Without ALL of them payments stay switched off (`billing_not_configured`):
 * taking money without a webhook key to switch the plan on would charge people for nothing.
 */
export type DodoEnvironment = 'test_mode' | 'live_mode';
export type PaidTier = Extract<MembershipTier, 'pro' | 'expert'>;

export type DodoConfig = {
  apiKey: string;
  webhookKey: string;
  environment: DodoEnvironment;
  baseUrl: string;
  /** Dodo product id for each stored tier (`expert` is Ultra). */
  products: Record<PaidTier, string>;
};

const BASE_URL: Record<DodoEnvironment, string> = {
  test_mode: 'https://test.dodopayments.com',
  live_mode: 'https://live.dodopayments.com',
};
const PRODUCT_ID = /^pdt_[A-Za-z0-9_-]{3,100}$/;

type Env = Record<string, string | undefined>;

export function getDodoConfig(env: Env = process.env): DodoConfig | null {
  const apiKey = env.DODO_PAYMENTS_API_KEY?.trim();
  const webhookKey = env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();
  const environment = env.DODO_PAYMENTS_ENVIRONMENT?.trim();
  const pro = env.DODO_PRODUCT_PRO?.trim();
  const ultra = env.DODO_PRODUCT_ULTRA?.trim();
  if (!apiKey || !webhookKey || !pro || !ultra) return null;
  if (environment !== 'test_mode' && environment !== 'live_mode') return null;
  if (!PRODUCT_ID.test(pro) || !PRODUCT_ID.test(ultra) || pro === ultra) return null;
  // A test key never works against live (and the other way round): refuse the mix-up here
  // instead of sending real customers to a checkout that cannot finish.
  if (environment === 'live_mode' && apiKey.startsWith('dodo_test_')) return null;
  if (environment === 'test_mode' && apiKey.startsWith('dodo_live_')) return null;
  return {
    apiKey,
    webhookKey,
    environment,
    baseUrl: BASE_URL[environment],
    products: { pro, expert: ultra },
  };
}

/** The tier a Dodo product id sells, or null for any product we do not know. */
export function tierForProduct(config: DodoConfig, productId: unknown): PaidTier | null {
  if (typeof productId !== 'string') return null;
  if (productId === config.products.expert) return 'expert';
  if (productId === config.products.pro) return 'pro';
  return null;
}
