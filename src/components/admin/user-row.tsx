'use client';
import { memo, useEffect, useId, useRef, useState } from 'react';
import { banLabel, day, TIER_NAME, type AdminUser, type Intent } from './admin-api';
import styles from './admin.module.css';

type Props = {
  user: AdminUser;
  busy: boolean;
  viewerId: string;
  viewerIsOwner: boolean;
  onIntent: (intent: Intent) => void;
};

type MenuItem = { label: string; intent: Intent; danger?: boolean; separated?: boolean };

/** Every action an admin may take on this account. The server enforces the same rules. */
function menuItems(user: AdminUser, viewerId: string, viewerIsOwner: boolean): MenuItem[] {
  const self = user.id === viewerId;
  const membership = user.membership;
  const canTakePlan = !user.isOwner;
  const canChangeRole = viewerIsOwner && !user.isOwner && !self;
  const canBanOrDelete = !user.isOwner && !user.isAdmin && !self;
  const items: MenuItem[] = [];

  if (membership?.active) {
    items.push({ label: 'Дароз кардан…', intent: { kind: 'plan', user, mode: 'extend' } });
    if (canTakePlan)
      items.push({ label: 'Кам кардани рӯзҳо…', intent: { kind: 'plan', user, mode: 'shorten' } });
  } else {
    items.push({
      label: membership ? 'Подпискаи нав…' : 'Додани подписка…',
      intent: { kind: 'plan', user, mode: 'grant' },
    });
  }
  if (membership && canTakePlan)
    items.push({ label: 'Бекор кардани подписка', intent: { kind: 'revoke', user } });

  items.push({
    label: 'Паём фиристодан…',
    intent: { kind: 'notify', user },
    separated: true,
  });
  if (canChangeRole)
    items.push({
      label: user.isAdmin ? 'Гирифтани нақши админ' : 'Админ кардан',
      intent: { kind: 'role', user, grant: !user.isAdmin },
    });
  if (canBanOrDelete) {
    items.push(
      user.bannedUntil
        ? { label: 'Аз блок баровардан', intent: { kind: 'unban', user } }
        : { label: 'Блок кардан…', intent: { kind: 'ban', user } },
    );
    if (user.email)
      items.push({
        label: 'Нест кардани аккаунт…',
        intent: { kind: 'delete', user },
        danger: true,
        separated: true,
      });
  }
  return items;
}

/** A small accessible dropdown: Escape or a click outside closes it. */
function ActionsMenu({
  items,
  busy,
  onPick,
}: {
  items: MenuItem[];
  busy: boolean;
  onPick: (intent: Intent) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const menuId = useId();
  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    box.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.menuBox} ref={box}>
      <button
        type="button"
        className={`button subtle ${styles.menuButton}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
      >
        {busy ? 'Иҷро мешавад…' : 'Амалҳо'}
        <span aria-hidden="true"> ▾</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu" id={menuId} aria-label="Амалҳо">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`${styles.menuItem} ${item.danger ? styles.menuDanger : ''} ${
                item.separated ? styles.menuSeparated : ''
              }`}
              onClick={() => {
                setOpen(false);
                onPick(item.intent);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * One table row. Memoized: after an action only the changed user object is replaced,
 * so the other rows keep their props and do not re-render.
 */
export const UserRow = memo(function UserRow({
  user,
  busy,
  viewerId,
  viewerIsOwner,
  onIntent,
}: Props) {
  const self = user.id === viewerId;
  const membership = user.membership;
  const grantedBy = membership
    ? `Манбаъ: ${membership.source === 'payment' ? 'пардохт' : 'админ'}. Дод: ${
        membership.grantedByEmail ?? (membership.grantedById ? 'админи нестшуда' : 'номаълум')
      }${membership.grantedAt ? `, ${day(membership.grantedAt)}` : ''}`
    : undefined;

  return (
    <tr className={busy ? styles.rowBusy : undefined} aria-busy={busy}>
      <td>
        <div className={styles.email}>
          {user.email ?? 'Бе email'}
          {self && <span className={styles.you}> (шумо)</span>}
        </div>
        <div className={styles.badges}>
          {user.isOwner && <span className={`${styles.badge} ${styles.badgeOwner}`}>Соҳиб</span>}
          {user.isAdmin && !user.isOwner && (
            <span className={`${styles.badge} ${styles.badgeAdmin}`}>Админ</span>
          )}
          {user.bannedUntil && (
            <span className={`${styles.badge} ${styles.badgeDanger}`}>
              {banLabel(user.bannedUntil)}
            </span>
          )}
          {!user.emailConfirmed && (
            <span className={`${styles.badge} ${styles.badgeWarn}`}>Email тасдиқ нашуд</span>
          )}
          <span className={styles.subtle}>
            {user.providers.join(', ') || '—'} · сабт {day(user.createdAt)}
          </span>
        </div>
      </td>
      <td>
        {membership ? (
          <span
            className={`${styles.badge} ${membership.active ? styles.badgePaid : styles.badgeWarn}`}
          >
            {TIER_NAME[membership.tier]}
          </span>
        ) : (
          <span className={styles.subtle}>—</span>
        )}
      </td>
      <td title={grantedBy}>
        {membership ? (
          membership.active ? (
            <>
              <div className={styles.ok}>{membership.daysLeft} рӯз монд</div>
              <div className={styles.subtle}>то {day(membership.expiresAt)}</div>
            </>
          ) : (
            <>
              <div className={styles.warn}>Тамом шуд</div>
              <div className={styles.subtle}>{day(membership.expiresAt)}</div>
            </>
          )
        ) : (
          <span className={styles.subtle}>Бе подписка</span>
        )}
      </td>
      <td className={styles.nowrap}>{day(user.lastSignInAt)}</td>
      <td className={styles.actionsCell}>
        <ActionsMenu
          items={menuItems(user, viewerId, viewerIsOwner)}
          busy={busy}
          onPick={onIntent}
        />
      </td>
    </tr>
  );
});
