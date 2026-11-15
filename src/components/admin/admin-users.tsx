'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
  invalid_request: 'Маълумот нодуруст аст.',
  unavailable: 'Сервис ҳоло ҷавоб намедиҳад. Баъдтар кӯшиш кунед.',
};

async function call(path: string, init?: { method: 'POST'; body: unknown }) {
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

export function AdminUsers() {
  const [page, setPage] = useState(1);
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
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

  async function act(user: AdminUser, action: 'grant' | 'extend' | 'revoke') {
    const count = Number(days[user.id] || '30');
    if (action !== 'revoke' && (!Number.isInteger(count) || count < 1 || count > 3660)) {
      setError('Шумораи рӯз бояд аз 1 то 3660 бошад.');
      return;
    }
    if (
      action === 'revoke' &&
      !window.confirm(`Подпискаи ${user.email ?? user.id} бекор карда шавад?`)
    )
      return;
    setBusyId(user.id);
    setError('');
    try {
      await call('/api/admin/memberships', {
        method: 'POST',
        body:
          action === 'grant'
            ? { action, userId: user.id, tier: tiers[user.id] ?? 'pro', days: count }
            : action === 'extend'
              ? { action, userId: user.id, days: count }
              : { action, userId: user.id },
      });
      setVersion((value) => value + 1);
    } catch (cause) {
      setError(ERRORS[cause instanceof Error ? cause.message : ''] ?? ERRORS.unavailable);
    } finally {
      setBusyId('');
    }
  }

  const lastPage = listing ? Math.max(1, Math.ceil(listing.total / listing.perPage)) : 1;
  return (
    <div className={styles.wrap}>
      <h1>Админ: корбарон</h1>
      <p className={styles.muted}>
        Рӯйхати аккаунтҳо ва подпискаҳо. «Ultra» дар база ҳамчун tier-и <code>expert</code> нигоҳ
        дошта мешавад.
      </p>
      {error && (
        <div className={styles.error} role="alert">
          {error}{' '}
          {(error === ERRORS.mfa_required || error === ERRORS.authentication_required) && (
            <Link href="/settings">Ба Settings</Link>
          )}
        </div>
      )}
      <section className={styles.panel} aria-busy={!listing && !error}>
        {!listing && !error && <p className={styles.muted}>Бор мешавад…</p>}
        {listing && (
          <>
            <p className={styles.muted}>Ҳамагӣ: {listing.total}</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Воридшавӣ</th>
                    <th>Охирин вуруд</th>
                    <th>Подписка</th>
                    <th>Амал</th>
                  </tr>
                </thead>
                <tbody>
                  {listing.users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.email ?? '—'}
                        {user.isAdmin ? ' · admin' : ''}
                        {!user.emailConfirmed ? ' · email тасдиқ нашудааст' : ''}
                      </td>
                      <td>{user.providers.join(', ') || '—'}</td>
                      <td>{day(user.lastSignInAt)}</td>
                      <td>
                        {user.membership
                          ? `${TIER_NAME[user.membership.tier]} до ${day(user.membership.expiresAt)}`
                          : 'Не'}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {!user.membership && (
                            <select
                              className={styles.select}
                              aria-label="Тарифи нав"
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
                          {user.membership ? (
                            <>
                              <button
                                type="button"
                                disabled={busyId === user.id}
                                onClick={() => act(user, 'extend')}
                              >
                                Дароз кардан
                              </button>
                              <button
                                type="button"
                                disabled={busyId === user.id}
                                onClick={() => act(user, 'revoke')}
                              >
                                Бекор кардан
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              disabled={busyId === user.id}
                              onClick={() => act(user, 'grant')}
                            >
                              Додан
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.pager}>
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Пештар
              </button>
              <span>
                {page} / {lastPage}
              </span>
              <button type="button" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
                Баъдӣ
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
