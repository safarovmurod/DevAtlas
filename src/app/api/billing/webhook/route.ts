import { handleDodoWebhook } from '@/lib/billing/webhook-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dodo Payments subscription webhooks. No user login here: the request is trusted only
 * after its Standard Webhooks signature on the raw body is verified. See
 * `src/lib/billing/webhook-handler.ts` and `docs/BILLING.md`.
 */
export async function POST(request: Request) {
  return handleDodoWebhook(request);
}
