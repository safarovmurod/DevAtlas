'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { MEMBERSHIP_COPY } from '@/lib/billing/copy';
import { planOwnFeatures, type PlanId } from '@/lib/billing/plans';
import styles from './membership.module.css';

const PLAN_NAME: Record<PlanId, string> = { start: 'Start', pro: 'Pro', ultra: 'Ultra' };

/** Start, Pro and Ultra with the features each plan adds. Payments are honestly not connected. */
export function PlansScreen() {
  const copy = MEMBERSHIP_COPY[useLearningStore((state) => state.language)];
  const plans: { id: PlanId; tag: string; badge: string; lead?: string }[] = [
    { id: 'start', tag: copy.startTag, badge: copy.free },
    { id: 'pro', tag: copy.proTag, badge: copy.main, lead: copy.everythingStart },
    { id: 'ultra', tag: copy.ultraTag, badge: copy.max, lead: copy.everythingPro },
  ];
  return (
    <section>
      <header className={styles.hero}>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>
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
              {free ? (
                <Link href="/courses" className={`button primary mt-auto ${styles.button}`}>
                  {copy.start}
                </Link>
              ) : (
                <>
                  <p className="mt-auto mb-2 text-xs text-muted-foreground">{copy.planned}</p>
                  <button disabled className={`button subtle ${styles.button}`}>
                    {copy.unavailable}
                  </button>
                </>
              )}
            </article>
          );
        })}
      </div>
      <p className={styles.note}>{copy.note}</p>
      <Link className={`button subtle ${styles.button}`} href="/community">
        {copy.community}
      </Link>
    </section>
  );
}
