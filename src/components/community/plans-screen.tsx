'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useAccount } from '@/components/account/account-provider';
import { useLearningStore } from '@/stores/learning-store';
import { BillingRequestError, billingFetch } from '@/lib/billing/billing-client';
import type { BillingStatus } from '@/lib/billing/billing-server';
import { MEMBERSHIP_COPY, type MembershipCopy } from '@/lib/billing/copy';
import { isDodoUrl } from '@/lib/billing/dodo-client';
import { PLAN_PRICE_USD, planName, planOwnFeatures, type PlanId } from '@/lib/billing/plans';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { courseDisplayName } from '@/lib/catalog-copy';
import type { InterfaceLocale } from '@/lib/locale';
import styles from './membership.module.css';

const PLAN_NAME: Record<PlanId, string> = { start: 'Start', pro: 'Pro', ultra: 'Ultra' };
type PaidPlan = 'pro' | 'ultra';
/** Stored tier names: `expert` is Ultra. */
const TIER: Record<PaidPlan, 'pro' | 'expert'> = { pro: 'pro', ultra: 'expert' };
const RANK: Record<string, number> = { pro: 1, expert: 2 };
const DATE_LOCALE: Record<InterfaceLocale, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  tg: 'tg-TJ',
  es: 'es-ES',
};
const POLL_MS = 3000;
const POLL_TRIES = 20;
const INCLUDES_COURSES = {
  ru: 'Курсы по этому тарифу',
  en: 'Courses in this plan',
  tg: 'Курсҳои дохили ин тариф',
  es: 'Cursos incluidos en este plan',
};

type Membership = NonNullable<BillingStatus['membership']>;
type Returned = { state: 'return' | 'cancelled' | 'failed'; plan: PaidPlan };

/** The paid plan (or a higher one) is in the database, from a real payment. */
function reached(status: BillingStatus | null, plan: PaidPlan) {
  const membership = status?.membership;
  return Boolean(
    membership?.active &&
    membership.source === 'payment' &&
    RANK[membership.tier] >= RANK[TIER[plan]],
  );
}

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

function formatDate(iso: string, locale: InterfaceLocale) {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return '';
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], { dateStyle: 'medium' }).format(time);
}

function describeMembership(membership: Membership, copy: MembershipCopy, locale: InterfaceLocale) {
  const date = formatDate(membership.expiresAt, locale);
  if (membership.source === 'admin') return fill(copy.giftUntil, { date });
  if (membership.status === 'on_hold' || membership.status === 'past_due') return copy.onHold;
  if (!membership.active) return '';
  if (membership.cancelAtPeriodEnd) return fill(copy.endsOn, { date });
  return fill(copy.renewsOn, { date });
}

/** Start, Pro and Ultra. Buying only starts a checkout: the plan itself is switched on by the
 * provider's verified webhook, and this page shows it only after the database says so. */
export function PlansScreen() {
  const { user } = useAccount();
  const locale = useLearningStore((state) => state.language);
  const copy = MEMBERSHIP_COPY[locale];
  const userId = user?.id ?? null;
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [busy, setBusy] = useState<PaidPlan | 'portal' | null>(null);
  const [error, setError] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const [returned, setReturned] = useState<Returned | null>(null);
  const [waitFor, setWaitFor] = useState<PaidPlan | null>(null);
  const [slow, setSlow] = useState(false);

  const load = useCallback(async () => {
    try {
      const next = await billingFetch<BillingStatus>('/api/billing/status', { login: false });
      setStatus(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  // What the database says now. Runs again when the signed-in account changes.
  useEffect(() => {
    let active = true;
    billingFetch<BillingStatus>('/api/billing/status', { login: false })
      .then((next) => {
        if (active) setStatus(next);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId]);

  // Coming back from the provider's checkout: `?checkout=return&plan=pro|ultra`.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get('checkout');
    if (state !== 'return' && state !== 'cancelled') return;
    const plan: PaidPlan = params.get('plan') === 'ultra' ? 'ultra' : 'pro';
    const result = params.get('status');
    const failed = result === 'failed' || result === 'cancelled' || result === 'expired';
    const next: Returned = {
      state: state === 'cancelled' ? 'cancelled' : failed ? 'failed' : 'return',
      plan,
    };
    queueMicrotask(() => {
      setReturned(next);
      if (next.state === 'return') setWaitFor(plan);
    });
  }, []);

  // The webhook may arrive a few seconds after the redirect: ask the database, up to a minute.
  useEffect(() => {
    if (!waitFor || !userId) return;
    let stopped = false;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      const next = await load();
      if (stopped) return;
      if (reached(next, waitFor)) {
        setWaitFor(null);
        setUpgrading(false);
      } else if (tries >= POLL_TRIES) {
        setWaitFor(null);
        setSlow(true);
      }
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [waitFor, userId, load]);

  // Back button after the checkout page: the buttons must work again.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setBusy(null);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  function failure(cause: unknown) {
    const code = cause instanceof BillingRequestError ? cause.code : 'generic';
    setError(copy.errors[code] ?? copy.errors.generic);
  }

  async function subscribe(plan: PaidPlan) {
    setError('');
    setBusy(plan);
    try {
      const result = await billingFetch<{ url?: string; upgraded?: boolean }>(
        '/api/billing/checkout',
        { method: 'POST', body: { tier: TIER[plan] } },
      );
      if (result.url) {
        if (!isDodoUrl(result.url)) throw new BillingRequestError('provider_error', 502);
        window.location.assign(result.url);
        return;
      }
      if (result.upgraded) {
        setUpgrading(true);
        setWaitFor(plan);
      }
    } catch (cause) {
      failure(cause);
    }
    setBusy(null);
  }

  async function manage() {
    setError('');
    setBusy('portal');
    try {
      const result = await billingFetch<{ url: string }>('/api/billing/portal', { method: 'POST' });
      if (!isDodoUrl(result.url)) throw new BillingRequestError('provider_error', 502);
      window.location.assign(result.url);
      return;
    } catch (cause) {
      failure(cause);
    }
    setBusy(null);
  }

  const membership = status?.membership ?? null;
  const configured = status?.configured === true;
  const signedIn = status?.signedIn === true;
  const myRank = membership?.active ? RANK[membership.tier] : 0;

  let banner: { tone: 'info' | 'success' | 'error'; text: string } | null = null;
  if (returned?.state === 'cancelled') banner = { tone: 'info', text: copy.returnCancelled };
  else if (returned?.state === 'failed') banner = { tone: 'error', text: copy.returnFailed };
  else if (returned?.state === 'return') {
    if (reached(status, returned.plan) && membership) {
      banner = {
        tone: 'success',
        text: fill(copy.returnActive, {
          plan: planName(membership.tier),
          date: formatDate(membership.expiresAt, locale),
        }),
      };
    } else if (slow || (status && !status.signedIn)) {
      banner = { tone: 'info', text: copy.returnSlow };
    } else {
      banner = { tone: 'info', text: copy.returnWaiting };
    }
  } else if (upgrading) banner = { tone: 'info', text: copy.upgradeStarted };

  const plans: { id: PlanId; tag: string; badge: string; lead?: string }[] = [
    { id: 'start', tag: copy.startTag, badge: copy.free },
    { id: 'pro', tag: copy.proTag, badge: copy.main, lead: copy.everythingStart },
    { id: 'ultra', tag: copy.ultraTag, badge: copy.max, lead: copy.everythingPro },
  ];

  function paidAction(plan: PaidPlan) {
    if (!configured) {
      return (
        <>
          <p className="mt-auto mb-2 text-xs text-muted-foreground">{copy.planned}</p>
          <button disabled className={`button subtle ${styles.button}`}>
            {copy.unavailable}
          </button>
        </>
      );
    }
    if (!signedIn) {
      return (
        <Link href="/login" className={`button primary mt-auto ${styles.button}`}>
          {copy.signInToBuy}
        </Link>
      );
    }
    const planRank = RANK[TIER[plan]];
    if (membership?.active && myRank === planRank) {
      return (
        <button disabled className={`button subtle mt-auto ${styles.button}`}>
          {copy.currentPlan}
        </button>
      );
    }
    if (membership?.active && myRank > planRank) {
      return (
        <button disabled className={`button subtle mt-auto ${styles.button}`}>
          {copy.includedInPlan}
        </button>
      );
    }
    const upgrade = plan === 'ultra' && membership?.active && membership.tier === 'pro';
    return (
      <button
        type="button"
        className={`button primary mt-auto ${styles.button}`}
        disabled={busy !== null || waitFor !== null}
        onClick={() => void subscribe(plan)}
      >
        {busy === plan ? copy.opening : upgrade ? copy.upgrade : copy.subscribe}
      </button>
    );
  }

  return (
    <section>
      <header className={styles.hero}>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>
      {banner && (
        <p
          role={banner.tone === 'error' ? 'alert' : 'status'}
          data-tone={banner.tone}
          className="mb-5 rounded-xl border border-border bg-muted p-4 text-sm leading-6 text-foreground"
        >
          {banner.text}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-border bg-muted p-4 text-sm">
          {error}
        </p>
      )}
      {membership && (membership.active || membership.canManage) && (
        <div
          data-testid="current-plan"
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-foreground"
        >
          <div>
            <p className="m-0 font-semibold">
              {copy.currentPlan}: {planName(membership.tier)}
            </p>
            <p className="m-0 mt-1 text-sm text-muted-foreground">
              {describeMembership(membership, copy, locale)}
            </p>
          </div>
          {membership.canManage && (
            <div className="flex flex-col items-start gap-1">
              <button
                type="button"
                className={`button subtle ${styles.button}`}
                disabled={busy !== null}
                onClick={() => void manage()}
              >
                {busy === 'portal' ? copy.opening : copy.manage}
              </button>
              <span className="text-xs text-muted-foreground">{copy.manageHint}</span>
            </div>
          )}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const free = plan.id === 'start';
          return (
            <article
              key={plan.id}
              data-plan={plan.id}
              className={
                'flex flex-col rounded-2xl border bg-card p-5 text-foreground md:p-6 ' +
                (plan.id === 'pro' ? 'border-primary' : 'border-border')
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="m-0 text-2xl font-semibold">{PLAN_NAME[plan.id]}</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {plan.badge}
                </span>
              </div>
              {!free && (
                <p className="mt-3 mb-0 text-foreground" data-price={plan.id}>
                  <span className="text-3xl font-semibold">
                    ${PLAN_PRICE_USD[plan.id as PaidPlan]}
                  </span>{' '}
                  <span className="text-sm text-muted-foreground">{copy.perMonth}</span>
                </p>
              )}
              <p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">{plan.tag}</p>
              <ul className="my-5 grid list-none gap-3 p-0">
                {plan.lead && (
                  <li className="text-sm font-medium text-muted-foreground">{plan.lead}</li>
                )}
                {planOwnFeatures(plan.id).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm leading-6">
                    <Check
                      size={17}
                      className="mt-[3px] shrink-0 text-success"
                      aria-hidden="true"
                    />
                    <span>{copy.features[feature]}</span>
                  </li>
                ))}
              </ul>
              {!free && (
                <div className="mb-5 rounded-xl border border-border bg-muted/40 p-3">
                  <p className="m-0 text-sm font-semibold text-foreground">
                    {INCLUDES_COURSES[locale]}
                  </p>
                  <ul className="mt-2 space-y-1 pl-4 text-sm text-muted-foreground">
                    {COURSE_CATALOG.filter(
                      (course) =>
                        course.accessTier === 'pro' ||
                        (plan.id === 'ultra' && course.accessTier === 'expert'),
                    ).map((course) => (
                      <li key={course.id}>{courseDisplayName(course.id, locale)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {free ? (
                <Link href="/courses" className={`button primary mt-auto ${styles.button}`}>
                  {copy.start}
                </Link>
              ) : (
                paidAction(plan.id as PaidPlan)
              )}
            </article>
          );
        })}
      </div>
      {configured && <p className={styles.note}>{copy.taxNote}</p>}
      <p className={styles.note}>{configured ? copy.noteLive : copy.note}</p>
      <Link className={`button subtle ${styles.button}`} href="/community">
        {copy.community}
      </Link>
    </section>
  );
}
