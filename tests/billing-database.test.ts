// @vitest-environment node
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { applyEvent, createBillingDb, resetBillingDb } from './billing-db';
import { DAY, USER_A, USER_B } from './billing-helpers';

// Real PostgreSQL execution of the billing migration and its one write function.
let db: PGlite;
const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();
const row = async (user = USER_A) =>
  (
    await db.query<Record<string, unknown>>(
      `select tier, source, granted_by, granted_at, provider, provider_customer_id,
              provider_subscription_id, provider_status, cancel_at_period_end,
              expires_at, provider_event_at
         from public.react_mentor_memberships where user_id = $1`,
      [user],
    )
  ).rows[0];
const seen = async () =>
  (
    await db.query<{ id: string }>('select id from public.react_mentor_webhook_events order by id')
  ).rows.map((r) => r.id);
const time = (value: unknown) => new Date(value as string | Date).getTime();

beforeAll(async () => {
  db = await createBillingDb();
}, 30000);
beforeEach(async () => {
  await resetBillingDb(db);
});
afterAll(async () => {
  await db?.close();
});

describe('payment event function', () => {
  it('creates a payment membership linked to the provider subscription', async () => {
    const expires = iso(30 * DAY);
    expect(await applyEvent(db, { expires })).toBe('applied');
    const saved = await row();
    expect(saved).toMatchObject({
      tier: 'pro',
      source: 'payment',
      granted_by: null,
      provider: 'dodo',
      provider_customer_id: 'cus_1',
      provider_subscription_id: 'sub_1',
      provider_status: 'active',
      cancel_at_period_end: false,
    });
    expect(time(saved.expires_at)).toBe(new Date(expires).getTime());
    expect(saved.granted_at).toBeTruthy();
    expect(await seen()).toEqual(['wh_1']);
  });

  it('is idempotent: the same webhook id changes nothing the second time', async () => {
    await applyEvent(db, { expires: iso(30 * DAY) });
    const before = await row();
    expect(await applyEvent(db, { tier: 'expert', expires: iso(400 * DAY) })).toBe('duplicate');
    expect(await row()).toEqual(before);
    expect(await seen()).toEqual(['wh_1']);
  });

  it('renewal moves the end date forward and keeps the original grant date', async () => {
    await applyEvent(db, { expires: iso(30 * DAY), at: iso(-2000) });
    const first = await row();
    const next = iso(60 * DAY);
    expect(
      await applyEvent(db, {
        id: 'wh_2',
        type: 'subscription.renewed',
        expires: next,
        at: iso(-1000),
      }),
    ).toBe('applied');
    const renewed = await row();
    expect(time(renewed.expires_at)).toBe(new Date(next).getTime());
    expect(renewed.granted_at).toEqual(first.granted_at);
  });

  it('plan change to Ultra updates the tier of the same subscription', async () => {
    await applyEvent(db, { at: iso(-2000) });
    await applyEvent(db, {
      id: 'wh_2',
      tier: 'expert',
      type: 'subscription.plan_changed',
      at: iso(-1000),
    });
    expect((await row()).tier).toBe('expert');
  });

  it('ignores an older event for the same subscription', async () => {
    await applyEvent(db, { expires: iso(60 * DAY), at: iso(-1000) });
    const result = await applyEvent(db, {
      id: 'wh_old',
      expires: iso(5 * DAY),
      at: iso(-60_000),
    });
    expect(result).toBe('stale');
    expect(time((await row()).expires_at)).toBeGreaterThan(Date.now() + 50 * DAY);
  });

  it('cancelled at the next billing date keeps the end date and records the flag', async () => {
    const expires = iso(20 * DAY);
    await applyEvent(db, { expires, at: iso(-2000) });
    expect(
      await applyEvent(db, {
        id: 'wh_c',
        type: 'subscription.cancelled',
        expires,
        status: 'cancelled',
        cancel: true,
        at: iso(-1000),
      }),
    ).toBe('applied');
    expect(await row()).toMatchObject({ provider_status: 'cancelled', cancel_at_period_end: true });
    expect(time((await row()).expires_at)).toBe(new Date(expires).getTime());
  });

  it('immediate cancellation or expiry ends access now, and a status event never extends it', async () => {
    await applyEvent(db, { expires: iso(20 * DAY), at: iso(-3000) });
    await applyEvent(db, {
      id: 'wh_x',
      type: 'subscription.cancelled',
      grant: false,
      expires: iso(0),
      status: 'cancelled',
      at: iso(-2000),
    });
    const ended = await row();
    expect(time(ended.expires_at)).toBeLessThanOrEqual(Date.now());
    // A later status-only event with a far date cannot bring the access back.
    await applyEvent(db, {
      id: 'wh_y',
      type: 'subscription.expired',
      grant: false,
      expires: iso(90 * DAY),
      status: 'expired',
      at: iso(-1000),
    });
    expect(time((await row()).expires_at)).toBeLessThanOrEqual(Date.now());
    expect((await row()).provider_status).toBe('expired');
  });

  it('on hold only records the status and leaves the end date alone', async () => {
    const expires = iso(2 * DAY);
    await applyEvent(db, { expires, at: iso(-2000) });
    expect(
      await applyEvent(db, {
        id: 'wh_h',
        type: 'subscription.on_hold',
        grant: false,
        expires: null,
        status: 'on_hold',
        at: iso(-1000),
      }),
    ).toBe('applied');
    const held = await row();
    expect(held.provider_status).toBe('on_hold');
    expect(time(held.expires_at)).toBe(new Date(expires).getTime());
  });

  it('ignores a status event for a subscription that has no membership', async () => {
    expect(
      await applyEvent(db, {
        grant: false,
        expires: null,
        status: 'failed',
        type: 'subscription.failed',
      }),
    ).toBe('ignored');
    expect(await row()).toBeUndefined();
  });

  it('never lets a second paid subscription replace running access', async () => {
    await applyEvent(db, { expires: iso(20 * DAY), at: iso(-2000) });
    expect(await applyEvent(db, { id: 'wh_2', sub: 'sub_2' })).toBe('conflict');
    expect(await applyEvent(db, { id: 'wh_3', sub: 'sub_2', tier: 'expert' })).toBe('conflict');
    expect((await row()).provider_subscription_id).toBe('sub_1');
    // Once the first subscription has ended, a new one takes over.
    await db.exec(
      `update public.react_mentor_memberships set expires_at = now() - interval '1 minute'`,
    );
    expect(await applyEvent(db, { id: 'wh_4', sub: 'sub_2', tier: 'expert' })).toBe('applied');
    expect(await row()).toMatchObject({ provider_subscription_id: 'sub_2', tier: 'expert' });
  });

  it('keeps a higher admin gift, but a payment for an equal or higher plan replaces a gift', async () => {
    await db.exec(`insert into public.react_mentor_memberships(user_id, tier, expires_at, source)
      values('${USER_A}', 'expert', now() + interval '100 days', 'admin')`);
    expect(await applyEvent(db, { tier: 'pro' })).toBe('conflict');
    expect(await row()).toMatchObject({ tier: 'expert', source: 'admin', provider: null });
    await db.exec(
      `update public.react_mentor_memberships set tier = 'pro', expires_at = now() + interval '100 days'`,
    );
    expect(await applyEvent(db, { id: 'wh_p', tier: 'pro' })).toBe('applied');
    expect(await row()).toMatchObject({
      tier: 'pro',
      source: 'payment',
      provider_subscription_id: 'sub_1',
    });
  });

  it('records the webhook id only when the write succeeds (a failed write is retried)', async () => {
    await applyEvent(db, { user: USER_B, sub: 'sub_1', id: 'wh_b' });
    // User A tries to claim the same subscription id: the unique index rejects it.
    await expect(applyEvent(db, { id: 'wh_a', sub: 'sub_1' })).rejects.toThrow(/unique|duplicate/i);
    expect(await seen()).toEqual(['wh_b']);
    // After the cause is gone the same webhook id is processed normally.
    await db.exec(`delete from public.react_mentor_memberships where user_id = '${USER_B}'`);
    expect(await applyEvent(db, { id: 'wh_a', sub: 'sub_1' })).toBe('applied');
  });

  it('rejects incomplete grants and unknown tiers without recording anything', async () => {
    await expect(applyEvent(db, { tier: 'admin' })).rejects.toThrow(/tier/i);
    await expect(applyEvent(db, { expires: null })).rejects.toThrow(/end date/i);
    expect(await seen()).toEqual([]);
    expect(await row()).toBeUndefined();
  });
});

describe('billing tables and function permissions', () => {
  it('only the service role can call the function or touch processed webhook ids', async () => {
    await db.exec(`reset role; set request.jwt.claim.sub='${USER_A}'; set role authenticated`);
    await expect(applyEvent(db)).rejects.toThrow(/permission denied/i);
    await expect(db.query('select * from public.react_mentor_webhook_events')).rejects.toThrow(
      /permission denied/i,
    );
    await expect(
      db.query("insert into public.react_mentor_webhook_events(id, type) values('x', 'y')"),
    ).rejects.toThrow(/permission denied/i);
    await db.exec(`reset role; set role anon`);
    await expect(applyEvent(db)).rejects.toThrow(/permission denied/i);
    await db.exec(`reset role; set role service_role`);
    expect(await applyEvent(db)).toBe('applied');
  });

  it('a signed-in user cannot write their own plan, only read their own row', async () => {
    await applyEvent(db, { user: USER_B, sub: 'sub_b', id: 'wh_b' });
    await applyEvent(db);
    await db.exec(`reset role; set request.jwt.claim.sub='${USER_A}'; set role authenticated`);
    const own = await db.query<{ provider_subscription_id: string }>(
      'select provider_subscription_id from public.react_mentor_memberships',
    );
    expect(own.rows).toEqual([{ provider_subscription_id: 'sub_1' }]);
    await expect(
      db.query("update public.react_mentor_memberships set tier = 'expert'"),
    ).rejects.toThrow(/permission denied/i);
    await expect(
      db.query(
        `insert into public.react_mentor_memberships(user_id, tier, expires_at) values('${USER_A}', 'expert', now())`,
      ),
    ).rejects.toThrow(/permission denied/i);
  });
});
