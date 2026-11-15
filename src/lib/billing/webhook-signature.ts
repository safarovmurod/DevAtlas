import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Standard Webhooks signature check, as Dodo Payments documents it:
 * signed content = `${webhook-id}.${webhook-timestamp}.${raw body}`, key = base64 of the
 * secret without its `whsec_` prefix, signature = base64 HMAC-SHA256. The header holds
 * space separated `v1,<signature>` items and any one of them may match.
 * The raw body is used exactly as received; never re-serialise parsed JSON.
 */
export const WEBHOOK_TOLERANCE_SECONDS = 300;

export type WebhookHeaders = {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
};

export type SignatureFailure = 'missing_headers' | 'bad_timestamp' | 'stale_timestamp' | 'mismatch';

function signingKey(secret: string): Buffer | null {
  const raw = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
  if (!raw || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(raw)) return null;
  const key = Buffer.from(raw, 'base64');
  return key.length > 0 ? key : null;
}

export function webhookSignature(secret: string, id: string, timestamp: string, body: string) {
  const key = signingKey(secret);
  if (!key) throw new Error('Invalid webhook secret');
  return createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');
}

export function verifyWebhook(
  secret: string,
  headers: WebhookHeaders,
  body: string,
  nowMs = Date.now(),
): { ok: true } | { ok: false; reason: SignatureFailure } {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return { ok: false, reason: 'missing_headers' };
  if (!/^\d{1,12}$/.test(timestamp)) return { ok: false, reason: 'bad_timestamp' };
  // Both directions: an old copy replayed later, and a timestamp from the future.
  if (Math.abs(nowMs / 1000 - Number(timestamp)) > WEBHOOK_TOLERANCE_SECONDS)
    return { ok: false, reason: 'stale_timestamp' };
  let expected: Buffer;
  try {
    expected = Buffer.from(webhookSignature(secret, id, timestamp, body), 'base64');
  } catch {
    return { ok: false, reason: 'mismatch' };
  }
  let matched = false;
  for (const item of signature.split(' ')) {
    const [version, value] = item.split(',');
    if (version !== 'v1' || !value) continue;
    const candidate = Buffer.from(value, 'base64');
    // timingSafeEqual needs equal lengths; a length difference is not a secret.
    if (candidate.length === expected.length && timingSafeEqual(candidate, expected))
      matched = true;
  }
  return matched ? { ok: true } : { ok: false, reason: 'mismatch' };
}
