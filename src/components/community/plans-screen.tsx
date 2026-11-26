'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Award, Briefcase, Check, Copy, CreditCard, Gift, Share2, Sparkles } from 'lucide-react';
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
const GROWTH_COPY: Record<
  InterfaceLocale,
  {
    toolsTitle: string;
    certTitle: string;
    certDesc: string;
    portfolioTitle: string;
    portfolioDesc: string;
    ultraTitle: string;
    ultraDesc: string;
    openTool: string;
    referralTitle: string;
    referralText: string;
    copyInvite: string;
    copied: string;
    shareTelegram: string;
    localPayTitle: string;
    localPayText: string;
    localPayBadges: string[];
  }
> = {
  tg: {
    toolsTitle: 'Инструментҳои воқеӣ барои Pro ва Ultra',
    certTitle: 'QR-Сертификатҳо (Pro)',
    certDesc: 'Зеркашии PNG барои резюме ва Stories + саҳифаи тасдиқи оммавӣ.',
    portfolioTitle: 'Портфолио ва Резюме (Pro)',
    portfolioDesc: 'Сохтани CV-и автоматӣ аз пешрафти шумо + линки оммавии /u/...',
    ultraTitle: 'Студияи Ultra (Ultra)',
    ultraDesc: 'Мок-мусоҳибаи техникӣ, аудити лоиҳа ва спринти 30-рӯза ба кор.',
    openTool: 'Кушодан',
    referralTitle: 'Дӯстатро ба DevAtlas даъват кун',
    referralText:
      'Линки шахсии худро ба дӯстон ва гурӯҳҳои Telegram фирист, то якҷоя омӯзед.',
    copyInvite: 'Нусхаи линки даъват',
    copied: 'Нусхабардорӣ шуд!',
    shareTelegram: 'Фиристодан ба Telegram',
    localPayTitle: 'Пардохти маҳаллӣ (Тоҷикистон ва СНГ)',
    localPayText:
      'Пардохти онлайн бо кортҳои Visa/Mastercard тавассути Dodo Payments сурат мегирад. Барои Alif Mobi, Корти Миллӣ ё дастрасии гурӯҳии марказҳои омӯзишӣ — пас аз фаъол кардани канали дастгирии маҳаллӣ тасдиқ мешавад.',
    localPayBadges: ['Alif Mobi', 'Корти Миллӣ', 'DC Next', 'Гурӯҳҳои B2B'],
  },
  ru: {
    toolsTitle: 'Инструменты внутри Pro и Ultra',
    certTitle: 'QR-сертификаты (Pro)',
    certDesc: 'PNG для резюме и Stories + публичная страница проверки подлинности.',
    portfolioTitle: 'Портфолио и CV (Pro)',
    portfolioDesc: 'Автоматический конструктор резюме из прогресса + публичный профиль.',
    ultraTitle: 'Ultra Студия (Ultra)',
    ultraDesc: 'Тренажёр мок-интервью, аудит проектов и 30-дневный спринт к работе.',
    openTool: 'Открыть',
    referralTitle: 'Пригласите друзей в DevAtlas',
    referralText:
      'Поделитесь личной ссылкой-приглашением с друзьями или в учебной группе Telegram.',
    copyInvite: 'Скопировать ссылку',
    copied: 'Скопировано!',
    shareTelegram: 'Поделиться в Telegram',
    localPayTitle: 'Локальные способы оплаты (Таджикистан и СНГ)',
    localPayText:
      'Онлайн-оплата картой в USD работает через Dodo Payments при подключении. Локальные переводы (Alif Mobi, Корти Миллӣ, DC Next) и групповые лицензии активируются администратором после настройки локального канала оплаты.',
    localPayBadges: ['Alif Mobi', 'Корти Миллӣ', 'DC Next', 'Групповые B2B'],
  },
  en: {
    toolsTitle: 'Live Tools Inside Pro & Ultra',
    certTitle: 'QR Certificates (Pro)',
    certDesc: 'Export CV & Story PNG cards with a public QR verification link.',
    portfolioTitle: 'Portfolio & CV Builder (Pro)',
    portfolioDesc: 'Turn verified study progress into a printable CV and public /u/ link.',
    ultraTitle: 'Ultra Career Studio (Ultra)',
    ultraDesc: 'Rubric-scored mock interviews, project audits, and a 30-day job sprint.',
    openTool: 'Open',
    referralTitle: 'Invite friends to DevAtlas',
    referralText:
      'Share your personal invite link with friends or study groups to learn together.',
    copyInvite: 'Copy invite link',
    copied: 'Copied!',
    shareTelegram: 'Share on Telegram',
    localPayTitle: 'Local Payments & Team Access',
    localPayText:
      'International cards use Dodo Payments once configured. Regional payment rails (Alif Mobi, Korti Milli, DC Next) and school/team licenses can be granted by an administrator once local checkout is enabled.',
    localPayBadges: ['Alif Mobi', 'Korti Milli', 'DC Next', 'Team / Classroom'],
  },
  es: {
    toolsTitle: 'Herramientas incluidas en Pro y Ultra',
    certTitle: 'Certificados QR (Pro)',
    certDesc: 'Descarga PNG para CV o Stories con enlace público de verificación QR.',
    portfolioTitle: 'Portafolio y CV (Pro)',
    portfolioDesc: 'Convierte tu progreso real en un CV imprimible y enlace público.',
    ultraTitle: 'Estudio Ultra (Ultra)',
    ultraDesc: 'Entrevistas simuladas con rúbrica, auditoría de proyectos y sprint de 30 días.',
    openTool: 'Abrir',
    referralTitle: 'Invita a tus amigos a DevAtlas',
    referralText:
      'Comparte tu enlace personal en Telegram o con tus compañeros para estudiar juntos.',
    copyInvite: 'Copiar enlace',
    copied: '¡Copiado!',
    shareTelegram: 'Compartir en Telegram',
    localPayTitle: 'Pagos locales y acceso para grupos',
    localPayText:
      'Las tarjetas internacionales usan Dodo Payments cuando está activo. Los pagos locales (Alif Mobi, Korti Milli, DC Next) y licencias grupales se activan mediante administración cuando se configura el canal local.',
    localPayBadges: ['Alif Mobi', 'Korti Milli', 'DC Next', 'Grupos / Escuelas'],
  },
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
  const [inviteCopied, setInviteCopied] = useState(false);
  const [localFormOpen, setLocalFormOpen] = useState(false);
  const [localPlan, setLocalPlan] = useState<PaidPlan>('pro');
  const [localProvider, setLocalProvider] = useState<'alif_mobi' | 'korti_milli' | 'dc_next' | 'eskhata'>('alif_mobi');
  const [localSender, setLocalSender] = useState('');
  const [localContact, setLocalContact] = useState('');
  const [localRef, setLocalRef] = useState('');
  const [localBusy, setLocalBusy] = useState(false);
  const [localResult, setLocalResult] = useState('');
  const growth = GROWTH_COPY[locale];
  const refCode = userId ? userId.replace(/[^a-z0-9]/gi, '').slice(0, 8) : 'devatlas';
  const inviteUrl =
    typeof window === 'undefined'
      ? `/career-test?ref=${refCode}`
      : `${window.location.origin}/career-test?ref=${refCode}`;

  async function submitLocalPayRequest(event: React.FormEvent) {
    event.preventDefault();
    setLocalBusy(true);
    setLocalResult('');
    try {
      const response = await fetch('/api/billing/local-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: localPlan,
          provider: localProvider,
          senderName: localSender,
          contact: localContact,
          referenceCode: localRef,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; persisted?: boolean };
      if (!response.ok || !data.ok) {
        setLocalResult(
          locale === 'tg'
            ? 'Лутфан ҳамаи майдонҳоро дуруст пур кунед.'
            : locale === 'ru'
              ? 'Проверьте заполнение всех полей.'
              : 'Please complete all fields accurately.',
        );
        return;
      }
      setLocalResult(
        locale === 'tg'
          ? 'Дархости пардохт бо ҳолати «Интизори тасдиқи админ» сабт шуд. Пас аз санҷиши чек дастрасӣ кушода мешавад.'
          : locale === 'ru'
            ? 'Заявка отправлена со статусом «Ожидает проверки администратора». Доступ откроется после подтверждения чека.'
            : 'Request submitted (Pending Admin Verification). Membership turns on only after receipt review.',
      );
      setLocalRef('');
    } catch {
      setLocalResult('Network error. Please retry.');
    } finally {
      setLocalBusy(false);
    }
  }

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2200);
    } catch {
      // Ignore clipboard failures in restricted environments.
    }
  }

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

      {/* Pro & Ultra Interactive Feature Hub (uses div, keeping 3 <article> plan cards) */}
      <div className="mt-8 space-y-3">
        <h2 className="m-0 text-lg font-semibold text-foreground">{growth.toolsTitle}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-brand">
              <Award size={18} aria-hidden="true" />
              <strong className="text-sm text-foreground">{growth.certTitle}</strong>
            </div>
            <p className="mt-2 mb-4 text-xs leading-5 text-muted-foreground">{growth.certDesc}</p>
            <Link href="/certificates" className="button subtle mt-auto self-start text-xs no-underline">
              {growth.openTool}
            </Link>
          </div>
          <div className="flex flex-col rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-brand">
              <Briefcase size={18} aria-hidden="true" />
              <strong className="text-sm text-foreground">{growth.portfolioTitle}</strong>
            </div>
            <p className="mt-2 mb-4 text-xs leading-5 text-muted-foreground">
              {growth.portfolioDesc}
            </p>
            <Link href="/portfolio" className="button subtle mt-auto self-start text-xs no-underline">
              {growth.openTool}
            </Link>
          </div>
          <div className="flex flex-col rounded-2xl border border-amber-400/35 bg-card p-4">
            <div className="flex items-center gap-2 text-amber-500">
              <Sparkles size={18} aria-hidden="true" />
              <strong className="text-sm text-foreground">{growth.ultraTitle}</strong>
            </div>
            <p className="mt-2 mb-4 text-xs leading-5 text-muted-foreground">{growth.ultraDesc}</p>
            <Link href="/ultra-studio" className="button subtle mt-auto self-start text-xs no-underline">
              {growth.openTool}
            </Link>
          </div>
        </div>
      </div>

      {/* Referral Invite + Local Payment Info */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-brand">
            <Gift size={18} aria-hidden="true" />
            <h3 className="m-0 text-base font-semibold text-foreground">{growth.referralTitle}</h3>
          </div>
          <p className="mt-2 mb-4 text-xs leading-5 text-muted-foreground">{growth.referralText}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyInviteLink()}
              className="button subtle inline-flex items-center gap-1.5 text-xs"
            >
              <Copy size={14} aria-hidden="true" />
              {inviteCopied ? growth.copied : growth.copyInvite}
            </button>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent('DevAtlas — Free IT Career Finder & Interactive Courses')}`}
              target="_blank"
              rel="noreferrer"
              className="button subtle inline-flex items-center gap-1.5 text-xs no-underline"
            >
              <Share2 size={14} aria-hidden="true" />
              {growth.shareTelegram}
            </a>
            <a
              href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'devatlas_official_bot'}?start=ref_${encodeURIComponent(refCode)}`}
              target="_blank"
              rel="noreferrer"
              className="button subtle inline-flex items-center gap-1.5 text-xs no-underline"
            >
              @{process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'devatlas_official_bot'}
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-brand">
            <CreditCard size={18} aria-hidden="true" />
            <h3 className="m-0 text-base font-semibold text-foreground">{growth.localPayTitle}</h3>
          </div>
          <p className="mt-2 mb-3 text-xs leading-5 text-muted-foreground">{growth.localPayText}</p>
          <div className="flex flex-wrap gap-1.5">
            {growth.localPayBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLocalFormOpen((prev) => !prev)}
              className="button subtle text-xs"
            >
              {locale === 'tg'
                ? 'Фиристодани чеки пардохти маҳаллӣ'
                : locale === 'ru'
                  ? 'Отправить заявку на локальную оплату'
                  : locale === 'es'
                    ? 'Enviar solicitud de pago local'
                    : 'Submit local payment receipt'}
            </button>
            <Link href="/programs" className="button subtle text-xs no-underline">
              B2B / Classroom
            </Link>
          </div>
          {localFormOpen && (
            <form
              onSubmit={(e) => void submitLocalPayRequest(e)}
              className="mt-4 space-y-2.5 rounded-xl border border-border bg-muted/35 p-3.5"
            >
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={localPlan}
                  onChange={(e) => setLocalPlan(e.target.value as PaidPlan)}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                >
                  <option value="pro">Pro ($5/mo)</option>
                  <option value="ultra">Ultra ($12/mo)</option>
                </select>
                <select
                  value={localProvider}
                  onChange={(e) =>
                    setLocalProvider(
                      e.target.value as 'alif_mobi' | 'korti_milli' | 'dc_next' | 'eskhata',
                    )
                  }
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                >
                  <option value="alif_mobi">Alif Mobi</option>
                  <option value="korti_milli">Корти Миллӣ</option>
                  <option value="dc_next">DC Next</option>
                  <option value="eskhata">Eskhata</option>
                </select>
              </div>
              <input
                required
                minLength={2}
                placeholder={locale === 'tg' ? 'Номи фиристанда' : locale === 'ru' ? 'Имя отправителя' : 'Sender full name'}
                value={localSender}
                onChange={(e) => setLocalSender(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
              <input
                required
                minLength={4}
                placeholder={locale === 'tg' ? 'Telegram (@username) ё телефон' : locale === 'ru' ? 'Telegram или телефон' : 'Telegram or phone'}
                value={localContact}
                onChange={(e) => setLocalContact(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
              <input
                required
                minLength={3}
                placeholder={locale === 'tg' ? 'Рақами чек / транзаксия' : locale === 'ru' ? 'Номер чека / перевода' : 'Receipt / Transaction ID'}
                value={localRef}
                onChange={(e) => setLocalRef(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
              <button type="submit" disabled={localBusy} className="button primary text-xs">
                {localBusy ? '...' : locale === 'tg' ? 'Фиристодан барои санҷиш' : locale === 'ru' ? 'Отправить на проверку' : 'Submit for review'}
              </button>
              {localResult && <p className="m-0 text-xs font-medium text-foreground">{localResult}</p>}
            </form>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link className={`button subtle ${styles.button}`} href="/community">
          {copy.community}
        </Link>
      </div>
    </section>
  );
}
