'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  adminCall,
  ERRORS,
  errorText,
  TIER_NAME,
  type AdminUser,
  type Filter,
  type Intent,
  type Listing,
} from './admin-api';
import { UserRow } from './user-row';
import styles from './admin.module.css';

// Dialogs and the audit log are only needed on this page and only on demand.
const ConfirmDialog = dynamic(() => import('./admin-dialogs').then((m) => m.ConfirmDialog), {
  ssr: false,
});
const DeleteDialog = dynamic(() => import('./admin-dialogs').then((m) => m.DeleteDialog), {
  ssr: false,
});
const BanDialog = dynamic(() => import('./admin-dialogs').then((m) => m.BanDialog), {
  ssr: false,
});
const NotifyDialog = dynamic(() => import('./admin-dialogs').then((m) => m.NotifyDialog), {
  ssr: false,
});
const AuditLog = dynamic(() => import('./audit-log'), {
  ssr: false,
  loading: () => <p className={styles.muted}>Журнал бор мешавад…</p>,
});

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Ҳама' },
  { value: 'paid', label: 'Бо подписка' },
  { value: 'expired', label: 'Подписка тамом шуд' },
  { value: 'admins', label: 'Админҳо' },
  { value: 'banned', label: 'Блокшудаҳо' },
];
const NEEDS_DIALOG = new Set<Intent['kind']>(['revoke', 'ban', 'role', 'notify', 'delete']);

type Toast = { id: number; text: string; tone: 'ok' | 'error' };
type Extra = { email?: string; days?: number | null; message?: string };
type Planned = { path: string; method: 'POST' | 'DELETE'; body: unknown; done: string };

function plan(intent: Intent, extra: Extra): Planned {
  const userId = intent.user.id;
  const who = intent.user.email ?? 'корбар';
  switch (intent.kind) {
    case 'grant':
      return {
        path: '/api/admin/memberships',
        method: 'POST',
        body: { action: 'grant', userId, tier: intent.tier, days: intent.days },
        done: `${TIER_NAME[intent.tier]} ба ${who} барои ${intent.days} рӯз дода шуд.`,
      };
    case 'extend':
      return {
        path: '/api/admin/memberships',
        method: 'POST',
        body: { action: 'extend', userId, days: intent.days },
        done: `Подпискаи ${who} ${intent.days} рӯз дароз шуд.`,
      };
    case 'shorten':
      return {
        path: '/api/admin/memberships',
        method: 'POST',
        body: { action: 'shorten', userId, days: intent.days },
        done: `Аз подпискаи ${who} ${intent.days} рӯз кам шуд.`,
      };
    case 'revoke':
      return {
        path: '/api/admin/memberships',
        method: 'POST',
        body: { action: 'revoke', userId },
        done: `Подпискаи ${who} бекор шуд.`,
      };
    case 'ban':
      return {
        path: '/api/admin/bans',
        method: 'POST',
        body: { action: 'ban', userId, days: extra.days ?? null },
        done: `${who} блок шуд.`,
      };
    case 'unban':
      return {
        path: '/api/admin/bans',
        method: 'POST',
        body: { action: 'unban', userId },
        done: `${who} аз блок баромад.`,
      };
    case 'role':
      return {
        path: '/api/admin/roles',
        method: 'POST',
        body: { action: intent.grant ? 'grant' : 'revoke', userId },
        done: intent.grant ? `${who} акнун админ аст.` : `Нақши админ аз ${who} гирифта шуд.`,
      };
    case 'notify':
      return {
        path: '/api/admin/notifications',
        method: 'POST',
        body: { userId, message: extra.message ?? '' },
        done: `Паём ба ${who} фиристода шуд.`,
      };
    case 'delete':
      return {
        path: '/api/admin/users',
        method: 'DELETE',
        body: { userId, confirmEmail: extra.email ?? '' },
        done: `Аккаунти ${who} нест карда шуд.`,
      };
  }
}

export function AdminUsers() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [listing, setListing] = useState<Listing | null>(null);
  // The listing is "loading" while the shown data belongs to an older request.
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  const [dialog, setDialog] = useState<Intent | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [auditVersion, setAuditVersion] = useState(0);
  const toastId = useRef(0);

  // Server-side search, sent after the admin stops typing.
  useEffect(() => {
    const next = search.trim().toLowerCase();
    if (next === q) return;
    const timer = setTimeout(() => {
      setQ(next);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, q]);

  const requestKey = `${page}|${filter}|${q}|${reloadKey}`;
  const loading = loadedKey !== requestKey;
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), filter });
    if (q) params.set('q', q);
    const key = `${page}|${filter}|${q}|${reloadKey}`;
    adminCall<Listing>(`/api/admin/users?${params}`, undefined, controller.signal)
      .then((next) => {
        setError('');
        setListing(next);
        setLoadedKey(key);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setListing(null);
        setError(errorText(cause));
        setLoadedKey(key);
      });
    return () => controller.abort();
  }, [page, filter, q, reloadKey]);

  const notify = useCallback((text: string, tone: Toast['tone']) => {
    const id = ++toastId.current;
    setToasts((old) => [...old.slice(-3), { id, text, tone }]);
    setTimeout(() => setToasts((old) => old.filter((toast) => toast.id !== id)), 4500);
  }, []);

  const setBusy = useCallback((id: string, busy: boolean) => {
    setBusyIds((old) => {
      const next = new Set(old);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  /** Runs one action, then replaces only the affected row with the server's answer. */
  const execute = useCallback(
    async (intent: Intent, extra: Extra = {}) => {
      const step = plan(intent, extra);
      setBusy(intent.user.id, true);
      try {
        const result = await adminCall<{ user?: AdminUser | null; deleted?: boolean }>(step.path, {
          method: step.method,
          body: step.body,
        });
        if (intent.kind === 'delete') {
          setListing((old) =>
            old
              ? {
                  ...old,
                  total: Math.max(0, old.total - 1),
                  users: old.users.filter((user) => user.id !== intent.user.id),
                }
              : old,
          );
        } else if (result.user) {
          const updated = result.user;
          setListing((old) =>
            old
              ? {
                  ...old,
                  users: old.users.map((user) => (user.id === updated.id ? updated : user)),
                }
              : old,
          );
        } else if (intent.kind !== 'notify') {
          setReloadKey((value) => value + 1);
        }
        notify(step.done, 'ok');
        setAuditVersion((value) => value + 1);
      } catch (cause) {
        notify(errorText(cause), 'error');
      } finally {
        setBusy(intent.user.id, false);
        setDialog(null);
      }
    },
    [notify, setBusy],
  );

  // Stable for every row, so a memoized row only re-renders when its own data changes.
  const onIntent = useCallback(
    (intent: Intent) => {
      if (NEEDS_DIALOG.has(intent.kind)) setDialog(intent);
      else void execute(intent);
    },
    [execute],
  );
  const closeDialog = useCallback(() => setDialog(null), []);

  const users = listing?.users ?? [];
  const lastPage = listing ? Math.max(1, Math.ceil(listing.total / listing.perPage)) : 1;
  const onPage = {
    paid: users.filter((user) => user.membership?.active).length,
    admins: users.filter((user) => user.isAdmin).length,
    banned: users.filter((user) => user.bannedUntil).length,
  };
  const dialogBusy = dialog ? busyIds.has(dialog.user.id) : false;
  const dialogEmail = dialog?.user.email ?? dialog?.user.id ?? '';

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1>Админ-панел</h1>
        <p className={styles.muted}>
          Корбарон, подпискаҳо, нақшҳо, блок ва паёмҳо. Ҳар амал дар server санҷида мешавад ва дар
          журнал навишта мешавад. «Ultra» дар база ҳамчун tier-и <code>expert</code> нигоҳ дошта
          мешавад.
        </p>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}{' '}
          {(error === ERRORS.mfa_required || error === ERRORS.authentication_required) && (
            <Link href="/settings">Ба Settings</Link>
          )}{' '}
          {error === ERRORS.unavailable && (
            <button
              type="button"
              className="button subtle"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              Аз нав кӯшиш кардан
            </button>
          )}
        </div>
      )}

      {listing && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{listing.total}</strong>
            <span>{filter === 'all' && !q ? 'Ҳамаи корбарон' : 'Ёфт шуд'}</span>
          </div>
          <div className={styles.stat}>
            <strong>{onPage.paid}</strong>
            <span>Подпискаи фаъол (дар саҳифа)</span>
          </div>
          <div className={styles.stat}>
            <strong>{onPage.admins}</strong>
            <span>Админ (дар саҳифа)</span>
          </div>
          <div className={styles.stat}>
            <strong>{onPage.banned}</strong>
            <span>Блок (дар саҳифа)</span>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="search"
          placeholder="Ҷустуҷӯ бо email (дар ҳамаи корбарон)"
          aria-label="Ҷустуҷӯ бо email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className={styles.filters} role="group" aria-label="Филтр">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.chip} ${filter === option.value ? styles.chipActive : ''}`}
              aria-pressed={filter === option.value}
              onClick={() => {
                setFilter(option.value);
                setPage(1);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {listing?.truncated && (
        <p className={styles.notice}>
          Ҷустуҷӯ танҳо дар 5000 корбари аввал гузаронида шуд. Email-ро дақиқтар нависед.
        </p>
      )}

      {loading && !listing && !error && (
        <div className={styles.list} aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className={`${styles.card} ${styles.skeleton}`} />
          ))}
        </div>
      )}

      {listing && (
        <>
          <div className={`${styles.list} ${loading ? styles.stale : ''}`} aria-busy={loading}>
            {users.length === 0 && (
              <div className={styles.empty}>
                {q || filter !== 'all'
                  ? 'Бо ин филтр ё ҷустуҷӯ корбар ёфт нашуд.'
                  : 'Ҳоло корбар нест.'}
              </div>
            )}
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                busy={busyIds.has(user.id)}
                viewerId={listing.viewer.id}
                viewerIsOwner={listing.viewer.isOwner}
                onIntent={onIntent}
              />
            ))}
          </div>
          {lastPage > 1 && (
            <div className={styles.pager}>
              <button
                type="button"
                className="button subtle"
                disabled={page <= 1 || loading}
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
                disabled={page >= lastPage || loading}
                onClick={() => setPage(page + 1)}
              >
                Баъдӣ
              </button>
            </div>
          )}
          <AuditLog version={auditVersion} />
        </>
      )}

      {dialog?.kind === 'delete' && dialog.user.email && (
        <DeleteDialog
          email={dialog.user.email}
          busy={dialogBusy}
          onClose={closeDialog}
          onConfirm={(email) => void execute(dialog, { email })}
        />
      )}
      {dialog?.kind === 'ban' && (
        <BanDialog
          email={dialogEmail}
          busy={dialogBusy}
          onClose={closeDialog}
          onConfirm={(days) => void execute(dialog, { days })}
        />
      )}
      {dialog?.kind === 'notify' && (
        <NotifyDialog
          email={dialogEmail}
          busy={dialogBusy}
          onClose={closeDialog}
          onConfirm={(message) => void execute(dialog, { message })}
        />
      )}
      {dialog?.kind === 'revoke' && (
        <ConfirmDialog
          title="Бекор кардани подписка"
          message={`Подпискаи ${dialogEmail} ҳозир бекор шавад? Дастрасии пулакӣ дарҳол қатъ мешавад.`}
          confirmLabel="Бекор кардани подписка"
          danger
          busy={dialogBusy}
          onClose={closeDialog}
          onConfirm={() => void execute(dialog)}
        />
      )}
      {dialog?.kind === 'role' && (
        <ConfirmDialog
          title={dialog.grant ? 'Додани нақши админ' : 'Гирифтани нақши админ'}
          message={
            dialog.grant
              ? `${dialogEmail} ба админ-панел дастрасӣ мегирад (бо 2FA). Идома диҳем?`
              : `${dialogEmail} дигар ба админ-панел дастрасӣ надорад. Идома диҳем?`
          }
          confirmLabel={dialog.grant ? 'Админ кардан' : 'Гирифтани нақш'}
          danger={!dialog.grant}
          busy={dialogBusy}
          onClose={closeDialog}
          onConfirm={() => void execute(dialog)}
        />
      )}

      <div className={styles.toasts} aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={`${styles.toast} ${toast.tone === 'error' ? styles.toastError : styles.toastOk}`}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}
