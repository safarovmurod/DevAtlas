'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Megaphone } from 'lucide-react';
import { broadcastMembershipRefresh } from '@/components/courses/use-membership-status';
import {
  adminCall,
  day,
  ERRORS,
  errorText,
  revokeMessage,
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
const BroadcastDialog = dynamic(() => import('./admin-dialogs').then((m) => m.BroadcastDialog), {
  ssr: false,
});
const UserDetailDialog = dynamic(() => import('./admin-dialogs').then((m) => m.UserDetailDialog), {
  ssr: false,
});
const PlanDialog = dynamic(() => import('./admin-dialogs').then((m) => m.PlanDialog), {
  ssr: false,
});
const AuditLog = dynamic(() => import('./audit-log'), {
  ssr: false,
  loading: () => <p className={styles.muted}>Журнал бор мешавад…</p>,
});

// Filters for the users table. Admins always have their own table above it.
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Ҳама' },
  { value: 'paid', label: 'Бо подписка (фаъол)' },
  { value: 'free', label: 'Start (бе подписка / тамомшуда)' },
  { value: 'expired', label: 'Подписка тамом шуд' },
  { value: 'strikes', label: 'Огоҳӣ / Блоки AI-чат' },
  { value: 'banned', label: 'Блокшудаҳо' },
];
const NEEDS_DIALOG = new Set<Intent['kind']>([
  'details',
  'plan',
  'revoke',
  'ban',
  'role',
  'notify',
  'delete',
]);

type Toast = { id: number; text: string; tone: 'ok' | 'error' };
type Extra = { email?: string; days?: number | null; message?: string };
type Planned = { path: string; method: 'POST' | 'DELETE'; body: unknown; done: string };

/** Prevents CSV spreadsheet formula injection by prefixing leading formula characters. */
function safeCsvCell(value: string): string {
  const clean = value.replace(/\r?\n/g, ' ');
  const neutralized = /^[=+\-@\t\r]/.test(clean) ? `'${clean}` : clean;
  return `"${neutralized.replace(/"/g, '""')}"`;
}

function plan(intent: Intent, extra: Extra): Planned {
  const userId = intent.user.id;
  const who = intent.user.email ?? 'корбар';
  switch (intent.kind) {
    case 'plan':
    case 'details':
      throw new Error('invalid_request');
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
        done: `Подпискаи ${who} бекор шуд (акнун Start).`,
      };
    case 'reset_moderation':
      return {
        path: '/api/admin/moderation',
        method: 'POST',
        body: { action: 'reset', userId },
        done: `Огоҳӣ ва блоки AI/чат барои ${who} тоза шуд.`,
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

function replaceUser(list: Listing | null, updated: AdminUser) {
  return list
    ? { ...list, users: list.users.map((user) => (user.id === updated.id ? updated : user)) }
    : list;
}
function dropUser(list: Listing | null, id: string) {
  if (!list || !list.users.some((user) => user.id === id)) return list;
  return {
    ...list,
    total: Math.max(0, list.total - 1),
    users: list.users.filter((user) => user.id !== id),
  };
}

function Table({
  caption,
  users,
  viewer,
  busyIds,
  onIntent,
  stale,
}: {
  caption: string;
  users: AdminUser[];
  viewer: Listing['viewer'];
  busyIds: ReadonlySet<string>;
  onIntent: (intent: Intent) => void;
  stale?: boolean;
}) {
  return (
    <div className={`${styles.tableWrap} ${stale ? styles.stale : ''}`} aria-busy={stale}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Email</th>
            <th scope="col">Тариф</th>
            <th scope="col">Мӯҳлат</th>
            <th scope="col">Охирин вуруд</th>
            <th scope="col" className={styles.actionsCell}>
              <span className={styles.srOnly}>Амалҳо</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              busy={busyIds.has(user.id)}
              viewerId={viewer.id}
              viewerIsOwner={viewer.isOwner}
              onIntent={onIntent}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminUsers() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [listing, setListing] = useState<Listing | null>(null);
  const [admins, setAdmins] = useState<Listing | null>(null);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  const [dialog, setDialog] = useState<Intent | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastBusy, setBroadcastBusy] = useState(false);
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

  // Admins: their own small table, never mixed with ordinary users.
  useEffect(() => {
    const controller = new AbortController();
    adminCall<Listing>('/api/admin/users?filter=admins', undefined, controller.signal)
      .then(setAdmins)
      .catch(() => {
        if (!controller.signal.aborted) setAdmins(null);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const requestKey = `${page}|${filter}|${q}|${reloadKey}`;
  const loading = loadedKey !== requestKey;
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), filter, scope: 'users' });
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

  /** Runs one action, then updates the affected row and refreshes summary/entitlements. */
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
          setListing((old) => dropUser(old, intent.user.id));
          setAdmins((old) => dropUser(old, intent.user.id));
        } else if (intent.kind === 'role' || !result.user) {
          if (intent.kind !== 'notify') setReloadKey((value) => value + 1);
        } else {
          const updated = result.user;
          setListing((old) => replaceUser(old, updated));
          setAdmins((old) => replaceUser(old, updated));
        }
        if (
          intent.kind === 'grant' ||
          intent.kind === 'extend' ||
          intent.kind === 'shorten' ||
          intent.kind === 'revoke'
        ) {
          broadcastMembershipRefresh();
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

  const sendBroadcast = useCallback(
    async (audience: 'all' | 'paid' | 'free', message: string) => {
      setBroadcastBusy(true);
      try {
        const res = await adminCall<{ sent: boolean; count: number }>('/api/admin/notifications', {
          method: 'POST',
          body: { broadcast: true, audience, message },
        });
        notify(`Паёми умумӣ ба ${res.count} корбар фиристода шуд.`, 'ok');
        setAuditVersion((v) => v + 1);
        setBroadcastOpen(false);
      } catch (cause) {
        notify(errorText(cause), 'error');
      } finally {
        setBroadcastBusy(false);
      }
    },
    [notify],
  );

  const exportCsv = useCallback(() => {
    const rows = listing?.users ?? [];
    if (!rows.length) return;
    const header = [
      'Email',
      'Тарифи фаъол',
      'Мӯҳлат',
      'Охирин вуруд',
      'Блок',
      'AI огоҳӣ',
      'Ҳақорат огоҳӣ',
    ];
    const lines = [
      header.map(safeCsvCell).join(','),
      ...rows.map((u) => {
        const activePlan = u.membership?.active ? TIER_NAME[u.membership.tier] : 'Start';
        const expiry = u.membership?.active
          ? `${u.membership.daysLeft} рӯз (${day(u.membership.expiresAt)})`
          : u.membership
            ? `Тамом шуд (${day(u.membership.expiresAt)})`
            : 'Бе подписка';
        return [
          u.email ?? '',
          activePlan,
          expiry,
          day(u.lastSignInAt),
          u.bannedUntil ? day(u.bannedUntil) : 'Не',
          String(u.moderation?.offTopicStrikes ?? 0),
          String(u.moderation?.profanityStrikes ?? 0),
        ]
          .map(safeCsvCell)
          .join(',');
      }),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devatlas-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [listing]);

  const onIntent = useCallback(
    (intent: Intent) => {
      if (NEEDS_DIALOG.has(intent.kind)) setDialog(intent);
      else void execute(intent);
    },
    [execute],
  );
  const closeDialog = useCallback(() => setDialog(null), []);

  const users = listing?.users ?? [];
  const summary = listing?.summary;
  const viewer = listing?.viewer ?? admins?.viewer ?? { id: '', isOwner: false };
  const lastPage = listing ? Math.max(1, Math.ceil(listing.total / listing.perPage)) : 1;
  const paidCount = summary
    ? summary.activePro + summary.activeUltra
    : users.filter((user) => user.membership?.active).length;
  const dialogBusy = dialog ? busyIds.has(dialog.user.id) : false;
  const dialogEmail = dialog?.user.email ?? dialog?.user.id ?? '';

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1>Админ-панел</h1>
        <p className={styles.muted}>
          Корбарон, подпискаҳо, нақшҳо, модератсия, блок ва паёмҳо. Ҳар амал дар server санҷида ва
          дар журнал навишта мешавад.
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className={styles.stat}>
            <strong>{summary?.totalUsers ?? listing.total}</strong>
            <span>Корбарон</span>
          </div>
          <div className={styles.stat}>
            <strong>{paidCount}</strong>
            <span>
              Фаъол (
              {summary ? `Pro ${summary.activePro} · Ultra ${summary.activeUltra}` : 'подписка'})
            </span>
          </div>
          <div className={styles.stat}>
            <strong>{summary?.freeOrExpired ?? '—'}</strong>
            <span>Start (бе подписка)</span>
          </div>
          <div className={styles.stat}>
            <strong>{summary?.moderatedCount ?? 0}</strong>
            <span>Огоҳӣ / AI-блок</span>
          </div>
          <div className={styles.stat}>
            <strong>{summary?.bannedCount ?? 0}</strong>
            <span>Блокшудаҳо</span>
          </div>
          <div className={styles.stat}>
            <strong>{admins?.users.length ?? '—'}</strong>
            <span>Админҳо</span>
          </div>
        </div>
      )}

      {admins && admins.users.length > 0 && (
        <section className={styles.section} aria-labelledby="admins-title">
          <h2 id="admins-title" className={styles.sectionTitle}>
            Админҳо
          </h2>
          <Table
            caption="Админҳо"
            users={admins.users}
            viewer={viewer}
            busyIds={busyIds}
            onIntent={onIntent}
          />
        </section>
      )}

      <section className={styles.section} aria-labelledby="users-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="users-title" className={`${styles.sectionTitle} !m-0`}>
            Корбарон
          </h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="button subtle" onClick={() => setBroadcastOpen(true)}>
              <Megaphone size={15} aria-hidden="true" />
              Паёми умумӣ
            </button>
            <button
              type="button"
              className="button subtle"
              disabled={!users.length}
              onClick={exportCsv}
            >
              <Download size={15} aria-hidden="true" />
              Экспорт CSV
            </button>
          </div>
        </div>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            type="search"
            placeholder="Ҷустуҷӯ бо email"
            aria-label="Ҷустуҷӯ бо email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className={styles.select}
            aria-label="Филтр"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value as Filter);
              setPage(1);
            }}
          >
            {FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {listing?.truncated && (
          <p className={styles.notice}>
            Ҷустуҷӯ танҳо дар 5000 корбари аввал гузаронида шуд. Email-ро дақиқтар нависед.
          </p>
        )}

        {loading && !listing && !error && (
          <div className={`${styles.empty} ${styles.skeleton}`} aria-busy="true">
            Бор мешавад…
          </div>
        )}

        {listing &&
          (users.length === 0 ? (
            <div className={styles.empty}>
              {q || filter !== 'all'
                ? 'Бо ин филтр ё ҷустуҷӯ корбар ёфт нашуд.'
                : 'Ҳоло корбар нест.'}
            </div>
          ) : (
            <Table
              caption="Корбарон"
              users={users}
              viewer={viewer}
              busyIds={busyIds}
              onIntent={onIntent}
              stale={loading}
            />
          ))}

        {listing && lastPage > 1 && (
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
      </section>

      {listing && <AuditLog version={auditVersion} />}

      {dialog?.kind === 'details' && (
        <UserDetailDialog
          user={dialog.user}
          busy={dialogBusy}
          onClose={closeDialog}
          onQuickGrant={(tier, days) =>
            void execute({ kind: 'grant', user: dialog.user, tier, days })
          }
          onRevoke={() => void execute({ kind: 'revoke', user: dialog.user })}
          onResetModeration={() => void execute({ kind: 'reset_moderation', user: dialog.user })}
        />
      )}
      {dialog?.kind === 'plan' && (
        <PlanDialog
          mode={dialog.mode}
          email={dialogEmail}
          current={dialog.user.membership}
          busy={dialogBusy}
          onClose={closeDialog}
          onConfirm={(tier, days) => {
            const user = dialog.user;
            void execute(
              dialog.mode === 'grant'
                ? { kind: 'grant', user, tier, days }
                : { kind: dialog.mode, user, days },
            );
          }}
        />
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
          message={revokeMessage(dialogEmail, dialog.user.membership)}
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
      {broadcastOpen && (
        <BroadcastDialog
          busy={broadcastBusy}
          onClose={() => setBroadcastOpen(false)}
          onConfirm={(audience, message) => void sendBroadcast(audience, message)}
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
