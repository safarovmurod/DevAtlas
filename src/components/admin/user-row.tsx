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
  const hasModeration = Boolean(
    user.moderation &&
    (user.moderation.offTopicStrikes > 0 ||
      user.moderation.offTopicBlocked ||
      user.moderation.profanityStrikes > 0 ||
      user.moderation.profanityBlocked),
  );
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

  if (hasModeration) {
    items.push({
      label: 'Тоза кардани огоҳӣ / блоки AI-чат',
      intent: { kind: 'reset_moderation', user },
      separated: true,
    });
  }

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
  const [place, setPlace] = useState<{ top: number; right: number } | null>(null);
  const open = place !== null;
  const box = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const close = () => setPlace(null);
  function toggle() {
    if (open || !trigger.current) return setPlace(null);
    const rect = trigger.current.getBoundingClientRect();
    const height = items.length * 40 + 24;
    const below = rect.bottom + 6;
    setPlace({
      top: below + height > window.innerHeight ? Math.max(8, rect.top - height - 6) : below,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }
  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setPlace(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setPlace(null);
    }
    const hide = () => setPlace(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    box.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [open]);

  return (
    <div className={styles.menuBox} ref={box}>
      <button
        type="button"
        ref={trigger}
        className={`button subtle ${styles.menuButton}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={busy}
        onClick={toggle}
      >
        {busy ? 'Иҷро мешавад…' : 'Амалҳо'}
        <span aria-hidden="true"> ▾</span>
      </button>
      {place && (
        <div
          className={styles.menu}
          style={{ top: place.top, right: place.right }}
          role="menu"
          id={menuId}
          aria-label="Амалҳо"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`${styles.menuItem} ${item.danger ? styles.menuDanger : ''} ${
                item.separated ? styles.menuSeparated : ''
              }`}
              onClick={() => {
                close();
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
 * Expired plans display honestly as "Start (бе подписка)" instead of active Pro/Ultra.
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
  const mod = user.moderation;
  const grantedBy = membership
    ? `Манбаъ: ${membership.source === 'payment' ? 'пардохт' : 'админ'}. Дод: ${
        membership.grantedByEmail ?? (membership.grantedById ? 'админи нестшуда' : 'номаълум')
      }${membership.grantedAt ? `, ${day(membership.grantedAt)}` : ''}`
    : undefined;

  return (
    <tr className={busy ? styles.rowBusy : undefined} aria-busy={busy}>
      <td>
        <div className={styles.email}>
          <button
            type="button"
            onClick={() => onIntent({ kind: 'details', user })}
            className="cursor-pointer border-0 bg-transparent p-0 text-left font-inherit text-inherit hover:underline"
          >
            {user.email ?? 'Бе email'}
          </button>
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
          {mod && (mod.offTopicStrikes > 0 || mod.offTopicBlocked) && (
            <span
              className={`${styles.badge} ${mod.offTopicBlocked ? styles.badgeDanger : styles.badgeWarn}`}
            >
              AI {mod.offTopicStrikes}/3{mod.offTopicBlocked ? ' · блок' : ''}
            </span>
          )}
          {mod && (mod.profanityStrikes > 0 || mod.profanityBlocked) && (
            <span
              className={`${styles.badge} ${mod.profanityBlocked ? styles.badgeDanger : styles.badgeWarn}`}
            >
              Ҳақорат {mod.profanityStrikes}/5{mod.profanityBlocked ? ' · блок' : ''}
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
        {membership && membership.active ? (
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles.badgePaid}`}>
              {TIER_NAME[membership.tier]}
            </span>
            {membership.source === 'payment' && (
              <span className={`${styles.badge} ${styles.badgeAdmin}`}>Пардохт</span>
            )}
          </div>
        ) : user.isOwner ? (
          <span className={`${styles.badge} ${styles.badgePaid}`}>Ultra</span>
        ) : (
          <span className={styles.badge}>Start</span>
        )}
      </td>
      <td title={grantedBy}>
        {membership && membership.active ? (
          <>
            <div className={styles.ok}>{membership.daysLeft} рӯз монд</div>
            <div className={styles.subtle}>то {day(membership.expiresAt)}</div>
          </>
        ) : membership && !membership.active ? (
          <>
            <div className={styles.subtle}>Бе подписка</div>
            <div className={styles.warn}>
              қаблан {TIER_NAME[membership.tier]} · тамом шуд {day(membership.expiresAt)}
            </div>
          </>
        ) : user.isOwner ? (
          <span className={styles.ok}>Дастрасии пурра (Соҳиб)</span>
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
