'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';
import styles from './admin.module.css';

type Membership = { tier: 'pro' | 'expert'; expiresAt: string };
type AdminUser = {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  providers: string[];
  isAdmin: boolean;
  membership: Membership | null;
};
type Listing = { page: number; perPage: number; total: number; users: AdminUser[] };

const TIER_NAME = { pro: 'Pro', expert: 'Ultra' } as const;
const ERRORS: Record<string, string> = {
  authentication_required: 'Аввал ба аккаунт ворид шавед.',
  admin_required: 'Ин саҳифа танҳо барои админ аст.',
  mfa_required: 'Барои админ 2FA лозим аст. Дар Settings онро фаъол кунед ва бо код ворид шавед.',
  user_not_found: 'Корбар ёфт нашуд.',
  no_membership: 'Ин корбар подписка надорад.',
  cannot_delete_admin: 'Админро нест кардан мумкин нест.',
  email_mismatch: 'Email мувофиқ нест. Корбар нест нашуд.',
  invalid_request: 'Маълумот нодуруст аст.',
  unavailable: 'Сервис ҳоло ҷавоб намедиҳад. Баъдтар кӯшиш кунед.',
};

async function call(path: string, init?: { method: 'POST' | 'DELETE'; body: unknown }) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error('authentication_required');
  const { data, error } = await getSessionWithTimeout(client);
  if (error || !data.session) throw new Error('authentication_required');
  const response = await fetch(path, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      ...(init ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(init ? { body: JSON.stringify(init.body) } : {}),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(typeof payload.error === 'string' ? payload.error : 'unavailable');
  return payload;
}

function day(value: string | null) {
  return value ? new Date(value).toLocaleDateString('ru-RU') : '—';
}

function isActive(membership: Membership | null) {
  return Boolean(membership && new Date(membership.expiresAt).getTime() > Date.now());
}

export function AdminUsers() {
  const [page, setPage] = useState(1);
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [query, setQuery] = useState('');
  const [tiers, setTiers] = useState<Record<string, 'pro' | 'expert'>>({});
  const [days, setDays] = useState<Record<string, string>>({});
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    call(`/api/admin/users?page=${page}`)
      .then((next: Listing) => {
        if (!active) return;
        setError('');
        setListing(next);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setListing(null);
        setError(ERRORS[cause instanceof Error ? cause.message : ''] ?? ERRORS.unavailable);
      });
    return () => {
      active = false;
    };
  }, [page, version]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!listing) return [];
    return needle
      ? listing.users.filter((user) => (user.email ?? '').toLowerCase().includes(needle))
      : listing.users;
  }, [listing, query]);
  const paid = listing ? listing.users.filter((user) => isActive(user.membership)).length : 0;
  const lastPage = listing ? Math.max(1, Math.ceil(listing.total / listing.perPage)) : 1;

  async function run(user: AdminUser, send: () => Promise<unknown>) {
    setBusyId(user.id);
    setError('');
    try {
      await send();
      setVersion((value) => value + 1);
    } catch (cause) {
      setError(ERRORS[cause instanceof Error ? cause.message : ''] ?? ERRORS.unavailable);
    } finally {
      setBusyId('');
    }
  }

  function daysFor(user: AdminUser) {
    const count = Number(days[user.id] || '30');
    if (!Number.isInteger(count) || count < 1 || count > 3660) {
      setError('Шумораи рӯз бояд аз 1 то 3660 бошад.');
      return null;
    }
    return count;
  }

  function grant(user: AdminUser) {
    const count = daysFor(user);
    if (count === null) return;
    void run(user, () =>
      call('/api/admin/memberships', {
        method: 'POST',
        body: { action: 'grant', userId: user.id, tier: tiers[user.id] ?? 'pro', days: count },
      }),
    );
  }
  function extend(user: AdminUser) {
    const count = daysFor(user);
    if (count === null) return;
    void run(user, () =>
      call('/api/admin/memberships', {
        method: 'POST',
        body: { action: 'extend', userId: user.id, days: count },
      }),
    );
  }
  function revoke(user: AdminUser) {
    if (!window.confirm(`Подпискаи ${user.email ?? user.id} бекор карда шавад?`)) return;
    void run(user, () =>
      call('/api/admin/memberships', {
        method: 'POST',
        body: { action: 'revoke', userId: user.id },
      }),
    );
  }
  function remove(user: AdminUser) {
    if (!user.email) return;
    const typed = window.prompt(
      `Нест кардани аккаунт ҳамаи прогресс ва подпискаи ӯро якбора нест мекунад ва барнамегардад.\nБарои тасдиқ email-ро пурра нависед:\n${user.email}`,
    );
    if (typed === null) return;
    void run(user, () =>
      call('/api/admin/users', {
        method: 'DELETE',
        body: { userId: user.id, confirmEmail: typed },
      }),
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1>Админ-панель</h1>
        <p className={styles.muted}>
          Танҳо барои соҳиби сайт. Дар ин ҷо корбаронро мебинӣ ва подпискаро медиҳӣ, дароз мекунӣ ё
          бекор мекунӣ. «Ultra» дар база ҳамчун tier-и <code>expert</code> нигоҳ дошта мешавад.
        </p>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          {error}{' '}
          {(error === ERRORS.mfa_required || error === ERRORS.authentication_required) && (
            <Link href="/settings">Ба Settings</Link>
          )}
        </div>
      )}
      {!listing && !error && <p className={styles.muted}>Бор мешавад…</p>}
      {listing && (
        <>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>{listing.total}</strong>
              <span>Ҳамаи корбарон</span>
            </div>
            <div className={styles.stat}>
              <strong>{paid}</strong>
              <span>Подпискаи фаъол (дар ин саҳифа)</span>
            </div>
          </div>
          <input
            className={styles.search}
            type="search"
            placeholder="Ҷустуҷӯ бо email (дар ин саҳифа)"
            aria-label="Ҷустуҷӯ бо email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className={styles.list}>
            {visible.length === 0 && <p className={styles.muted}>Корбар ёфт нашуд.</p>}
            {visible.map((user) => {
              const paidNow = isActive(user.membership);
              const busy = busyId === user.id;
              return (
                <article className={styles.card} key={user.id}>
                  <div className={styles.top}>
                    <div>
                      <div className={styles.email}>{user.email ?? 'Бе email'}</div>
                      <div className={styles.meta}>
                        <span>Воридшавӣ: {user.providers.join(', ') || '—'}</span>
                        <span>Охирин вуруд: {day(user.lastSignInAt)}</span>
                        <span>Сабт: {day(user.createdAt)}</span>
                      </div>
                    </div>
                    <div className={styles.badges}>
                      {user.isAdmin && (
                        <span className={`${styles.badge} ${styles.badgeAdmin}`}>Админ</span>
                      )}
                      {!user.emailConfirmed && (
                        <span className={`${styles.badge} ${styles.badgeWarn}`}>
                          Email тасдиқ нашуд
                        </span>
                      )}
                      {user.membership ? (
                        <span
                          className={`${styles.badge} ${paidNow ? styles.badgePaid : styles.badgeWarn}`}
                        >
                          {TIER_NAME[user.membership.tier]} {paidNow ? 'то' : 'тамом шуд'}{' '}
                          {day(user.membership.expiresAt)}
                        </span>
                      ) : (
                        <span className={styles.badge}>Бе подписка</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>Подписка:</span>
                    {!user.membership && (
                      <select
                        className={styles.select}
                        aria-label="Тариф"
                        value={tiers[user.id] ?? 'pro'}
                        onChange={(event) =>
                          setTiers((old) => ({
                            ...old,
                            [user.id]: event.target.value === 'expert' ? 'expert' : 'pro',
                          }))
                        }
                      >
                        <option value="pro">Pro</option>
                        <option value="expert">Ultra</option>
                      </select>
                    )}
                    <input
                      className={styles.input}
                      inputMode="numeric"
                      aria-label="Шумораи рӯз"
                      value={days[user.id] ?? '30'}
                      onChange={(event) =>
                        setDays((old) => ({ ...old, [user.id]: event.target.value }))
                      }
                    />
                    <span className={styles.label}>рӯз</span>
                    {user.membership ? (
                      <>
                        <button
                          type="button"
                          className="button primary"
                          disabled={busy}
                          onClick={() => extend(user)}
                        >
                          Дароз кардан
                        </button>
                        <button
                          type="button"
                          className="button subtle"
                          disabled={busy}
                          onClick={() => revoke(user)}
                        >
                          Бекор кардан
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="button primary"
                        disabled={busy}
                        onClick={() => grant(user)}
                      >
                        Додани подписка
                      </button>
                    )}
                    {!user.isAdmin && user.email && (
                      <button
                        type="button"
                        className={`button subtle ${styles.danger}`}
                        disabled={busy}
                        onClick={() => remove(user)}
                      >
                        Нест кардани аккаунт
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <div className={styles.pager}>
            <button
              type="button"
              className="button subtle"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Пештар
            </button>
            <span>
              {page} / {lastPage}
            </span>
            <button
              type="button"
              className="button subtle"
              disabled={page >= lastPage}
              onClick={() => setPage(page + 1)}
            >
              Баъдӣ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
