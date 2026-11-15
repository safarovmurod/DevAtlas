import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getDodoConfig } from './dodo-config';
import { planSubscriptionEvent } from './subscription-events';
import { verifyWebhook } from './webhook-signature';

/**
 * POST /api/billing/webhook, step by step. Order matters: nothing is parsed or written
 * before the signature on the RAW body is verified, and a 2xx answer is only sent after the
 * database write succeeded (otherwise the provider retries, which is what we want).
 */
const MAX_BODY_BYTES = 256 * 1024;
const MEMBERSHIPS = 'react_mentor_memberships';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });

class BodyTooLarge extends Error {}

async function readRawBody(request: Request): Promise<string> {
  const length = request.headers.get('content-length');
  if (length && /^\d+$/.test(length) && Number(length) > MAX_BODY_BYTES) {
    await request.body?.cancel().catch(() => undefined);
    throw new BodyTooLarge();
  }
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new BodyTooLarge();
      }
      chunks.push(chunk.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8').decode(bytes);
}

export async function handleDodoWebhook(request: Request): Promise<Response> {
  const config = getDodoConfig();
  if (!config) return reply({ error: 'billing_not_configured' }, 503);

  let body: string;
  try {
    body = await readRawBody(request);
  } catch (error) {
    return reply({ error: 'invalid_request' }, error instanceof BodyTooLarge ? 413 : 400);
  }

  const headers = {
    id: request.headers.get('webhook-id'),
    timestamp: request.headers.get('webhook-timestamp'),
    signature: request.headers.get('webhook-signature'),
  };
  const verified = verifyWebhook(config.webhookKey, headers, body);
  if (!verified.ok) return reply({ error: 'invalid_signature' }, 401);

  let event: unknown;
  try {
    event = JSON.parse(body);
  } catch {
    return reply({ error: 'invalid_request' }, 400);
  }

  const planned = planSubscriptionEvent(event, config);
  if (planned.kind === 'ignore') {
    // Events we do not act on are acknowledged so the provider stops retrying them.
    if (planned.reason !== 'unknown_event')
      console.error('billing webhook ignored', { reason: planned.reason, type: planned.type });
    return reply({ received: true, ignored: planned.reason });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return reply({ error: 'unavailable' }, 503);

  // Who owns this subscription already? A different owner than the metadata says is a
  // forged or broken event, so it changes nothing.
  const owned = await admin
    .from(MEMBERSHIPS)
    .select('user_id')
    .eq('provider', 'dodo')
    .eq('provider_subscription_id', planned.subscriptionId)
    .maybeSingle();
  if (owned.error) return reply({ error: 'unavailable' }, 503);
  const ownerId = typeof owned.data?.user_id === 'string' ? owned.data.user_id : null;
  const hint = planned.userHint && UUID.test(planned.userHint) ? planned.userHint : null;
  if (ownerId && hint && ownerId.toLowerCase() !== hint.toLowerCase()) {
    console.error('billing webhook ignored', { reason: 'user_mismatch', type: planned.type });
    return reply({ received: true, ignored: 'user_mismatch' });
  }
  const userId = ownerId ?? hint;
  if (!userId) {
    console.error('billing webhook ignored', { reason: 'no_user', type: planned.type });
    return reply({ received: true, ignored: 'no_user' });
  }

  // The user must really exist before anything is written for them.
  const found = await admin.auth.admin.getUserById(userId);
  if (found.error || !found.data?.user) {
    const missing =
      !found.error || found.error.status === 404 || found.error.code === 'user_not_found';
    if (!missing) return reply({ error: 'unavailable' }, 503);
    console.error('billing webhook ignored', { reason: 'user_not_found', type: planned.type });
    return reply({ received: true, ignored: 'user_not_found' });
  }

  const applied = await admin.rpc('react_mentor_apply_payment_event', {
    p_webhook_id: headers.id,
    p_event_type: planned.type,
    p_event_at: planned.eventAt,
    p_user_id: userId,
    p_grant: planned.grant,
    p_tier: planned.tier,
    p_expires_at: planned.expiresAt,
    p_customer_id: planned.customerId,
    p_subscription_id: planned.subscriptionId,
    p_status: planned.status,
    p_cancel_at_period_end: planned.cancelAtPeriodEnd,
  });
  if (applied.error) {
    console.error('billing webhook write failed', { code: applied.error.code, type: planned.type });
    return reply({ error: 'unavailable' }, 500);
  }
  if (applied.data === 'conflict') {
    // Money was taken for a second subscription (or a lower plan than an admin gift).
    // Access is not changed; the owner has to refund it in the Dodo dashboard.
    console.error('billing conflict: refund may be needed', {
      userId,
      subscriptionId: planned.subscriptionId,
      type: planned.type,
    });
  }
  return reply({ received: true, result: applied.data });
}
