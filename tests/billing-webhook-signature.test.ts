// @vitest-environment node
import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  verifyWebhook,
  webhookSignature,
  WEBHOOK_TOLERANCE_SECONDS,
} from '@/lib/billing/webhook-signature';
import { SECRET } from './billing-helpers';

const body = '{"type":"subscription.active","data":{"subscription_id":"sub_1"}}';
const id = 'msg_2abc';
const now = Date.UTC(2026, 10, 15, 12, 0, 0);
const seconds = String(now / 1000);
const header = (signature: string) => ({ id, timestamp: seconds, signature });
const good = () => 'v1,' + webhookSignature(SECRET, id, seconds, body);

describe('webhook signature (Standard Webhooks, as documented by Dodo Payments)', () => {
  it('signs `${id}.${timestamp}.${body}` with the base64 key and base64 HMAC-SHA256', () => {
    // Independent re-implementation of the documented steps.
    const key = Buffer.from(SECRET.slice('whsec_'.length), 'base64');
    const expected = createHmac('sha256', key).update(`${id}.${seconds}.${body}`).digest('base64');
    expect(webhookSignature(SECRET, id, seconds, body)).toBe(expected);
  });

  it('accepts a correct signature', () => {
    expect(verifyWebhook(SECRET, header(good()), body, now)).toEqual({ ok: true });
  });

  it('accepts when any of several space separated v1 signatures matches', () => {
    const other = 'v1,' + Buffer.from('not the signature').toString('base64');
    expect(verifyWebhook(SECRET, header(`${other} ${good()}`), body, now).ok).toBe(true);
    expect(verifyWebhook(SECRET, header(`v2,abc ${good()}`), body, now).ok).toBe(true);
  });

  it('rejects a body that was changed after signing', () => {
    const forged = body.replace('sub_1', 'sub_2');
    expect(verifyWebhook(SECRET, header(good()), forged, now)).toEqual({
      ok: false,
      reason: 'mismatch',
    });
    // Same JSON, different bytes: re-serialised bodies must not pass either.
    expect(
      verifyWebhook(SECRET, header(good()), JSON.stringify(JSON.parse(body), null, 1), now).ok,
    ).toBe(false);
  });

  it('rejects another webhook id, another timestamp and another secret', () => {
    const signature = good();
    expect(
      verifyWebhook(SECRET, { id: 'msg_other', timestamp: seconds, signature }, body, now).ok,
    ).toBe(false);
    const later = String(now / 1000 + 1);
    expect(verifyWebhook(SECRET, { id, timestamp: later, signature }, body, now).ok).toBe(false);
    const otherSecret = 'whsec_' + Buffer.from('some-other-secret-value').toString('base64');
    expect(verifyWebhook(otherSecret, header(signature), body, now).ok).toBe(false);
  });

  it('rejects an old timestamp (replay) and one from the future', () => {
    const old = String(now / 1000 - WEBHOOK_TOLERANCE_SECONDS - 1);
    const oldSig = 'v1,' + webhookSignature(SECRET, id, old, body);
    expect(verifyWebhook(SECRET, { id, timestamp: old, signature: oldSig }, body, now)).toEqual({
      ok: false,
      reason: 'stale_timestamp',
    });
    const future = String(now / 1000 + WEBHOOK_TOLERANCE_SECONDS + 1);
    const futureSig = 'v1,' + webhookSignature(SECRET, id, future, body);
    expect(
      verifyWebhook(SECRET, { id, timestamp: future, signature: futureSig }, body, now).ok,
    ).toBe(false);
    // The edge of the window is still fine.
    const edge = String(now / 1000 - WEBHOOK_TOLERANCE_SECONDS);
    const edgeSig = 'v1,' + webhookSignature(SECRET, id, edge, body);
    expect(verifyWebhook(SECRET, { id, timestamp: edge, signature: edgeSig }, body, now).ok).toBe(
      true,
    );
  });

  it('rejects missing headers, a non numeric timestamp and garbage signatures', () => {
    expect(
      verifyWebhook(SECRET, { id: null, timestamp: seconds, signature: good() }, body, now),
    ).toEqual({ ok: false, reason: 'missing_headers' });
    expect(verifyWebhook(SECRET, { id, timestamp: null, signature: good() }, body, now).ok).toBe(
      false,
    );
    expect(verifyWebhook(SECRET, { id, timestamp: seconds, signature: null }, body, now).ok).toBe(
      false,
    );
    expect(verifyWebhook(SECRET, { id, timestamp: 'abc', signature: good() }, body, now)).toEqual({
      ok: false,
      reason: 'bad_timestamp',
    });
    for (const signature of ['', 'v1', 'v1,', 'v1,!!!', 'garbage', 'v1,' + 'A'.repeat(400)])
      expect(verifyWebhook(SECRET, header(signature), body, now).ok, signature).toBe(false);
  });

  it('never accepts anything with an unusable secret', () => {
    expect(verifyWebhook('whsec_', header(good()), body, now).ok).toBe(false);
    expect(verifyWebhook('', header(good()), body, now).ok).toBe(false);
  });
});
