'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { day, TIER_NAME, type Membership, type PlanMode, type Tier } from './admin-api';
import styles from './admin.module.css';

const DAY_MS = 86_400_000;
const PRESETS = [7, 30, 90, 365];
const PLAN_TEXT: Record<PlanMode, { title: string; confirm: string }> = {
  grant: { title: 'Додани подписка', confirm: 'Додан' },
  extend: { title: 'Дароз кардани подписка', confirm: 'Дароз кардан' },
  shorten: { title: 'Кам кардани рӯзҳо', confirm: 'Кам кардан' },
};

/** Give, extend or shorten a plan. Shows the new end date before anything is saved. */
export function PlanDialog({
  mode,
  email,
  current,
  busy,
  onConfirm,
  onClose,
}: {
  mode: PlanMode;
  email: string;
  current: Membership | null;
  busy: boolean;
  onConfirm: (tier: Tier, days: number) => void;
  onClose: () => void;
}) {
  const [tier, setTier] = useState<Tier>(current?.tier ?? 'pro');
  const [days, setDays] = useState('30');
  const tierId = useId();
  const daysId = useId();
  const count = Number(days);
  const valid = Number.isInteger(count) && count >= 1 && count <= 3660;
  // Date.now() is read during render only for a preview; the server computes the real date.
  const [now] = useState(() => Date.now());
  const end = current ? new Date(current.expiresAt).getTime() : now;
  const newEnd = !valid
    ? null
    : mode === 'grant'
      ? now + count * DAY_MS
      : mode === 'extend'
        ? Math.max(now, end) + count * DAY_MS
        : Math.max(now, end - count * DAY_MS);
  const text = PLAN_TEXT[mode];

  return (
    <Dialog title={text.title} busy={busy} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (valid && !busy) onConfirm(tier, count);
        }}
      >
        <p className={styles.dialogText}>
          <strong>{email}</strong>
          <br />
          {current
            ? `Ҳозир: ${TIER_NAME[current.tier]}, ${
                current.active
                  ? `${current.daysLeft} рӯз монд, то ${day(current.expiresAt)}`
                  : 'мӯҳлат гузашт'
              }`
            : 'Ҳозир подписка надорад.'}
        </p>
        {mode === 'grant' && (
          <div className={styles.field}>
            <label htmlFor={tierId} className={styles.fieldLabel}>
              Тариф
            </label>
            <select
              id={tierId}
              className={styles.dialogInput}
              value={tier}
              onChange={(event) => setTier(event.target.value === 'expert' ? 'expert' : 'pro')}
            >
              <option value="pro">Pro</option>
              <option value="expert">Ultra</option>
            </select>
          </div>
        )}
        <div className={styles.field}>
          <label htmlFor={daysId} className={styles.fieldLabel}>
            Шумораи рӯз
          </label>
          <input
            id={daysId}
            className={`${styles.dialogInput} ${valid ? '' : styles.inputError}`}
            inputMode="numeric"
            aria-invalid={!valid}
            value={days}
            onChange={(event) => setDays(event.target.value.replace(/\D/g, '').slice(0, 4))}
          />
          <div className={styles.presets} role="group" aria-label="Интихоби тез">
            {PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${count === value ? styles.chipActive : ''}`}
                aria-pressed={count === value}
                onClick={() => setDays(String(value))}
              >
                {value} рӯз
              </button>
            ))}
          </div>
        </div>
        <p className={styles.preview} aria-live="polite">
          {newEnd === null
            ? 'Аз 1 то 3660 рӯз нависед.'
            : newEnd <= now
              ? 'Подписка имрӯз тамом мешавад.'
              : `Санаи нави тамомшавӣ: ${day(new Date(newEnd).toISOString())}`}
        </p>
        <div className={styles.dialogActions}>
          <button type="button" className="button subtle" disabled={busy} onClick={onClose}>
            Бекор
          </button>
          <button type="submit" className="button primary" disabled={!valid || busy}>
            {busy ? 'Иҷро мешавад…' : text.confirm}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

/**
 * Modal shell: overlay, Escape and overlay click close it (unless an action is running),
 * focus moves inside on open and returns to the previous element on close.
 */
function Dialog({
  title,
  busy,
  onClose,
  children,
}: {
  title: string;
  busy: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = box.current?.querySelector<HTMLElement>(
      'input, textarea, select, button:not([disabled])',
    );
    first?.focus();
    return () => previous?.focus?.();
  }, []);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onClose]);
  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={box}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={styles.dialogTitle}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger = false,
  busy,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog title={title} busy={busy} onClose={onClose}>
      <p className={styles.dialogText}>{message}</p>
      <div className={styles.dialogActions}>
        <button type="button" className="button subtle" disabled={busy} onClick={onClose}>
          Бекор
        </button>
        <button
          type="button"
          className={danger ? `button ${styles.dangerButton}` : 'button primary'}
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? 'Иҷро мешавад…' : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

/** Deletion asks twice: first "are you sure", then the full email must be typed. */
export function DeleteDialog({
  email,
  busy,
  onConfirm,
  onClose,
}: {
  email: string;
  busy: boolean;
  onConfirm: (typedEmail: string) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [typed, setTyped] = useState('');
  const matches = typed.trim().toLowerCase() === email.toLowerCase();
  const inputId = useId();

  if (step === 1)
    return (
      <Dialog title="Нест кардани аккаунт" busy={busy} onClose={onClose}>
        <p className={styles.dialogText}>
          Аккаунти <strong>{email}</strong> бо ҳамаи прогресс, подписка ва паёмҳояш якбора нест
          мешавад. Инро барнагардонидан мумкин нест.
        </p>
        <p className={styles.dialogText}>Шумо мутмаин ҳастед?</p>
        <div className={styles.dialogActions}>
          <button type="button" className="button subtle" onClick={onClose}>
            Не, бекор
          </button>
          <button
            type="button"
            className={`button ${styles.dangerButton}`}
            onClick={() => setStep(2)}
          >
            Ҳа, идома додан
          </button>
        </div>
      </Dialog>
    );

  return (
    <Dialog title="Тасдиқи охирин" busy={busy} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (matches && !busy) onConfirm(typed.trim());
        }}
      >
        <label className={styles.dialogText} htmlFor={inputId}>
          Барои тасдиқ email-ро пурра нависед: <strong>{email}</strong>
        </label>
        <input
          id={inputId}
          className={styles.dialogInput}
          type="email"
          autoComplete="off"
          spellCheck={false}
          value={typed}
          disabled={busy}
          onChange={(event) => setTyped(event.target.value)}
        />
        <div className={styles.dialogActions}>
          <button type="button" className="button subtle" disabled={busy} onClick={onClose}>
            Бекор
          </button>
          <button
            type="submit"
            className={`button ${styles.dangerButton}`}
            disabled={!matches || busy}
          >
            {busy ? 'Нест мешавад…' : 'Абадан нест кардан'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

const BAN_CHOICES = [
  { value: '1', label: '1 рӯз' },
  { value: '7', label: '7 рӯз' },
  { value: '30', label: '30 рӯз' },
  { value: '365', label: '1 сол' },
  { value: 'forever', label: 'То бардоштан (доимӣ)' },
];

export function BanDialog({
  email,
  busy,
  onConfirm,
  onClose,
}: {
  email: string;
  busy: boolean;
  onConfirm: (days: number | null) => void;
  onClose: () => void;
}) {
  const [choice, setChoice] = useState('7');
  const selectId = useId();
  return (
    <Dialog title="Блок кардани корбар" busy={busy} onClose={onClose}>
      <p className={styles.dialogText}>
        <strong>{email}</strong> дигар ворид шуда наметавонад. Сайт ва база ӯро дарҳол рад мекунанд;
        session-и кушодаи ӯ ҳангоми навсозии токен қатъ мешавад.
      </p>
      <label className={styles.dialogText} htmlFor={selectId}>
        Мӯҳлат
      </label>
      <select
        id={selectId}
        className={styles.dialogInput}
        value={choice}
        disabled={busy}
        onChange={(event) => setChoice(event.target.value)}
      >
        {BAN_CHOICES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className={styles.dialogActions}>
        <button type="button" className="button subtle" disabled={busy} onClick={onClose}>
          Бекор
        </button>
        <button
          type="button"
          className={`button ${styles.dangerButton}`}
          disabled={busy}
          onClick={() => onConfirm(choice === 'forever' ? null : Number(choice))}
        >
          {busy ? 'Иҷро мешавад…' : 'Блок кардан'}
        </button>
      </div>
    </Dialog>
  );
}

export const MESSAGE_MAX = 500;

export function NotifyDialog({
  email,
  busy,
  onConfirm,
  onClose,
}: {
  email: string;
  busy: boolean;
  onConfirm: (message: string) => void;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const textId = useId();
  const length = message.trim().length;
  return (
    <Dialog title="Паём ба корбар" busy={busy} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (length > 0 && !busy) onConfirm(message.trim());
        }}
      >
        <label className={styles.dialogText} htmlFor={textId}>
          Ба <strong>{email}</strong>. Агар ӯ ҳоло дар сайт бошад, паём дар 5–15 сония пайдо
          мешавад; вагарна ҳангоми вуруди навбатӣ.
        </label>
        <textarea
          id={textId}
          className={`${styles.dialogInput} ${styles.textarea}`}
          maxLength={MESSAGE_MAX}
          rows={4}
          value={message}
          disabled={busy}
          onChange={(event) => setMessage(event.target.value)}
        />
        <div className={styles.counter}>
          {message.length} / {MESSAGE_MAX}
        </div>
        <div className={styles.dialogActions}>
          <button type="button" className="button subtle" disabled={busy} onClick={onClose}>
            Бекор
          </button>
          <button type="submit" className="button primary" disabled={length === 0 || busy}>
            {busy ? 'Фиристода мешавад…' : 'Фиристодан'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
