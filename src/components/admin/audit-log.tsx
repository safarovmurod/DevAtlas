'use client';
import { useEffect, useState } from 'react';
import { adminCall, dateTime, errorText, TIER_NAME, type AuditEntry } from './admin-api';
import styles from './admin.module.css';

const ACTION_NAME: Record<string, string> = {
  membership_grant: 'подписка дод',
  membership_extend: 'подпискаро дароз кард',
  membership_revoke: 'подпискаро бекор кард',
  role_grant: 'админ кард',
  role_revoke: 'нақши админро гирифт',
  ban: 'блок кард',
  unban: 'аз блок баровард',
  notify: 'паём фиристод',
  delete_user: 'аккаунтро нест кард',
  moderation_reset: 'огоҳӣ/блоки AI-чатро тоза кард',
  broadcast_notify: 'паёми умумӣ фиристод',
};

function describe(entry: AuditEntry) {
  const details = entry.details;
  const parts: string[] = [];
  if (details.tier === 'pro' || details.tier === 'expert') parts.push(TIER_NAME[details.tier]);
  if (typeof details.days === 'number') parts.push(`${details.days} рӯз`);
  if (entry.action === 'ban' && details.days === null) parts.push('доимӣ');
  if (typeof details.length === 'number') parts.push(`${details.length} аломат`);
  return parts.join(', ');
}

/** Latest admin actions. Loaded lazily and refreshed after every action in the panel. */
export default function AuditLog({ version }: { version: number }) {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    adminCall<{ entries: AuditEntry[] }>('/api/admin/audit?limit=30', undefined, controller.signal)
      .then((data) => {
        setEntries(data.entries);
        setError('');
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(errorText(cause));
      });
    return () => controller.abort();
  }, [version]);

  return (
    <section className={styles.audit} aria-labelledby="admin-audit-title">
      <h2 id="admin-audit-title" className={styles.sectionTitle}>
        Журнали амалҳо
      </h2>
      {error && (
        <p className={styles.muted} role="alert">
          {error}
        </p>
      )}
      {!entries && !error && <p className={styles.muted}>Бор мешавад…</p>}
      {entries && entries.length === 0 && <p className={styles.muted}>Ҳоло ягон амал нест.</p>}
      {entries && entries.length > 0 && (
        <ol className={styles.auditList}>
          {entries.map((entry) => {
            const extra = describe(entry);
            return (
              <li key={entry.id} className={styles.auditItem}>
                <time dateTime={entry.createdAt}>{dateTime(entry.createdAt)}</time>
                <span>
                  <strong>{entry.actorEmail ?? 'Админ'}</strong>{' '}
                  {ACTION_NAME[entry.action] ?? entry.action}
                  {entry.targetEmail ? ` → ${entry.targetEmail}` : ''}
                  {extra ? ` (${extra})` : ''}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
