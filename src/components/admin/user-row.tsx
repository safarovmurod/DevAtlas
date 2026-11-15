'use client';
import { memo, useState } from 'react';
import { banLabel, day, TIER_NAME, type AdminUser, type Intent, type Tier } from './admin-api';
import styles from './admin.module.css';

type Props = {
  user: AdminUser;
  busy: boolean;
  viewerId: string;
  viewerIsOwner: boolean;
  onIntent: (intent: Intent) => void;
};

/**
 * One account card. Memoized: after an action only the changed user object is replaced,
 * so the other rows keep their props and do not re-render.
 */
export const UserRow = memo(function UserRow({
  user,
  busy,
  viewerId,
  viewerIsOwner,
  onIntent,
}: Props) {
  const [tier, setTier] = useState<Tier>('pro');
  const [days, setDays] = useState('30');
  const [daysError, setDaysError] = useState(false);
  const self = user.id === viewerId;
  const membership = user.membership;
  // The server enforces the same rules; hiding only keeps the card honest.
  const canRevokeMembership = !user.isOwner;
  const canChangeRole = viewerIsOwner && !user.isOwner && !self;
  const canBanOrDelete = !user.isOwner && !user.isAdmin && !self;

  function readDays() {
    const count = Number(days);
    const ok = Number.isInteger(count) && count >= 1 && count <= 3660;
    setDaysError(!ok);
    return ok ? count : null;
  }

  return (
    <article className={styles.card} aria-busy={busy}>
      <div className={styles.top}>
        <div className={styles.identity}>
          <div className={styles.email}>
            {user.email ?? 'Бе email'}
            {self && <span className={styles.you}> (шумо)</span>}
          </div>
          <div className={styles.meta}>
            <span>Воридшавӣ: {user.providers.join(', ') || '—'}</span>
            <span>Охирин вуруд: {day(user.lastSignInAt)}</span>
            <span>Сабт: {day(user.createdAt)}</span>
          </div>
        </div>
        <div className={styles.badges}>
          {user.isOwner && <span className={`${styles.badge} ${styles.badgeOwner}`}>Соҳиб</span>}
          {user.isAdmin && <span className={`${styles.badge} ${styles.badgeAdmin}`}>Админ</span>}
          {user.bannedUntil && (
            <span className={`${styles.badge} ${styles.badgeDanger}`}>
              {banLabel(user.bannedUntil)}
            </span>
          )}
          {!user.emailConfirmed && (
            <span className={`${styles.badge} ${styles.badgeWarn}`}>Email тасдиқ нашуд</span>
          )}
          {membership ? (
            <span
              className={`${styles.badge} ${membership.active ? styles.badgePaid : styles.badgeWarn}`}
            >
              {TIER_NAME[membership.tier]} · {membership.active ? 'фаъол' : 'тамом шуд'}
            </span>
          ) : (
            <span className={styles.badge}>Бе подписка</span>
          )}
        </div>
      </div>

      {membership && (
        <dl className={styles.facts}>
          <div>
            <dt>Тариф</dt>
            <dd>{TIER_NAME[membership.tier]}</dd>
          </div>
          <div>
            <dt>Ҳолат</dt>
            <dd className={membership.active ? styles.ok : styles.warn}>
              {membership.active ? `Фаъол, ${membership.daysLeft} рӯз монд` : 'Мӯҳлат гузашт'}
            </dd>
          </div>
          <div>
            <dt>{membership.active ? 'То' : 'Тамом шуд'}</dt>
            <dd>{day(membership.expiresAt)}</dd>
          </div>
          <div>
            <dt>Манбаъ</dt>
            <dd>{membership.source === 'payment' ? 'Пардохт' : 'Админ'}</dd>
          </div>
          <div>
            <dt>Кӣ дод</dt>
            <dd>
              {membership.grantedByEmail ??
                (membership.grantedById ? 'Админ (нест шудааст)' : 'Номаълум')}
              {membership.grantedAt ? `, ${day(membership.grantedAt)}` : ''}
            </dd>
          </div>
        </dl>
      )}

      <div className={styles.row}>
        <span className={styles.label}>Подписка:</span>
        {(!membership || !membership.active) && (
          <select
            className={styles.select}
            aria-label="Тариф"
            value={tier}
            onChange={(event) => setTier(event.target.value === 'expert' ? 'expert' : 'pro')}
          >
            <option value="pro">Pro</option>
            <option value="expert">Ultra</option>
          </select>
        )}
        <input
          className={`${styles.input} ${daysError ? styles.inputError : ''}`}
          inputMode="numeric"
          aria-label="Шумораи рӯз"
          aria-invalid={daysError}
          title="Аз 1 то 3660 рӯз"
          value={days}
          onChange={(event) => {
            setDays(event.target.value);
            setDaysError(false);
          }}
        />
        <span className={styles.label}>рӯз</span>
        {membership?.active ? (
          <button
            type="button"
            className="button primary"
            disabled={busy}
            onClick={() => {
              const count = readDays();
              if (count !== null) onIntent({ kind: 'extend', user, days: count });
            }}
          >
            Дароз кардан
          </button>
        ) : (
          <button
            type="button"
            className="button primary"
            disabled={busy}
            onClick={() => {
              const count = readDays();
              if (count !== null) onIntent({ kind: 'grant', user, tier, days: count });
            }}
          >
            {membership ? 'Подпискаи нав' : 'Додани подписка'}
          </button>
        )}
        {membership && canRevokeMembership && (
          <button
            type="button"
            className="button subtle"
            disabled={busy}
            onClick={() => onIntent({ kind: 'revoke', user })}
          >
            Бекор кардан
          </button>
        )}
      </div>

      <div className={styles.row}>
        <button
          type="button"
          className="button subtle"
          disabled={busy}
          onClick={() => onIntent({ kind: 'notify', user })}
        >
          Паём фиристодан
        </button>
        {canChangeRole && (
          <button
            type="button"
            className="button subtle"
            disabled={busy}
            onClick={() => onIntent({ kind: 'role', user, grant: !user.isAdmin })}
          >
            {user.isAdmin ? 'Гирифтани нақши админ' : 'Админ кардан'}
          </button>
        )}
        {canBanOrDelete &&
          (user.bannedUntil ? (
            <button
              type="button"
              className="button subtle"
              disabled={busy}
              onClick={() => onIntent({ kind: 'unban', user })}
            >
              Аз блок баровардан
            </button>
          ) : (
            <button
              type="button"
              className={`button subtle ${styles.warnButton}`}
              disabled={busy}
              onClick={() => onIntent({ kind: 'ban', user })}
            >
              Блок кардан
            </button>
          ))}
        {canBanOrDelete && user.email && (
          <button
            type="button"
            className={`button ${styles.dangerButton}`}
            disabled={busy}
            onClick={() => onIntent({ kind: 'delete', user })}
          >
            Нест кардани аккаунт
          </button>
        )}
        {busy && <span className={styles.label}>Иҷро мешавад…</span>}
      </div>
    </article>
  );
});
