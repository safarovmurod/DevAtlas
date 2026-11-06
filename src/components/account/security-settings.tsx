'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ACCOUNT_COPY, type AccountCopyKey } from '@/lib/account-copy';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useLearningStore } from '@/stores/learning-store';
import { useAccount } from './account-provider';

/** Two-factor authentication with an authenticator app (TOTP). */
export function SecuritySettings() {
  const account = useAccount();
  const copy = ACCOUNT_COPY[useLearningStore((state) => state.language)];
  const [factors, setFactors] = useState<{ id: string; friendly_name?: string }[]>([]);
  // Without a configured auth service there is nothing to load.
  const [loading, setLoading] = useState(() => getSupabaseBrowserClient() !== null);
  const [enrollment, setEnrollment] = useState<{ id: string; qr: string; secret: string } | null>(
    null,
  );
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountCopyKey | ''>('');
  const [message, setMessage] = useState<AccountCopyKey | ''>('');
  useEffect(() => {
    let active = true;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    client.auth.mfa
      .listFactors()
      .then((result) => {
        if (!active) return;
        if (result.error) setError('factorCheckError');
        else setFactors(result.data.totp);
      })
      .catch(() => {
        // A network failure must not leave the section loading forever.
        if (active) setError('factorCheckError');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function enroll() {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error();
      // Remove incomplete factors left by abandoned enrollment before starting.
      const listed = await client.auth.mfa.listFactors();
      if (listed.error) throw listed.error;
      for (const factor of listed.data.all.filter(
        (f) => f.factor_type === 'totp' && f.status === 'unverified',
      )) {
        const removed = await client.auth.mfa.unenroll({ factorId: factor.id });
        if (removed.error) throw removed.error;
      }
      const result = await client.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'DevAtlas',
        issuer: 'DevAtlas',
      });
      if (result.error) throw result.error;
      const qr = result.data.totp.qr_code;
      setEnrollment({
        id: result.data.id,
        qr: qr.startsWith('data:')
          ? qr
          : 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qr),
        secret: result.data.totp.secret,
      });
      setCode('');
    } catch {
      setError('enrollError');
    } finally {
      setBusy(false);
    }
  }
  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (!enrollment || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await getSupabaseBrowserClient()?.auth.mfa.challengeAndVerify({
        factorId: enrollment.id,
        code,
      });
      if (!result || result.error) throw new Error();
      setEnrollment(null);
      setCode('');
      await account.reload();
    } catch {
      setError('verifyError');
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    if (!enrollment || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await getSupabaseBrowserClient()?.auth.mfa.unenroll({
        factorId: enrollment.id,
      });
      if (!result || result.error) throw new Error();
      setEnrollment(null);
      setCode('');
    } catch {
      setError('cancelError');
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await getSupabaseBrowserClient()?.auth.mfa.unenroll({ factorId: id });
      if (!result || result.error) throw new Error();
      setFactors((items) => items.filter((f) => f.id !== id));
      setMessage('factorRemoved');
      await account.reload();
    } catch {
      setError('factorRemoveError');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel account-panel">
      <div className="section-heading">
        <h2>
          <ShieldCheck size={19} />
          {copy.security}
        </h2>
        <span className="account-badge">
          {loading ? copy.checking : factors.length ? copy.connected : copy.ordinaryLogin}
        </span>
      </div>
      <p>{copy.securityDescription}</p>
      {loading ? null : enrollment ? (
        <div className="mfa-enrollment">
          <p>
            {copy.enrollScan}
            <br />
            {copy.enrollCode}
          </p>
          {
            /* Sensitive enrollment QR stays in component memory only. */
            // eslint-disable-next-line @next/next/no-img-element
            <img src={enrollment.qr} alt={copy.enrollAlt} width={192} height={192} />
          }
          <details>
            <summary>{copy.enrollManual}</summary>
            <code className="mfa-secret">{enrollment.secret}</code>
          </details>
          <p className="account-hint">{copy.enrollHint}</p>
          <form className="account-form" onSubmit={verify}>
            <label>
              {copy.appCode}
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </label>
            <div className="button-row">
              <button className="button primary" disabled={busy || code.length !== 6}>
                {copy.enableSecurity}
              </button>
              <button type="button" className="button subtle" disabled={busy} onClick={cancel}>
                {copy.cancel}
              </button>
            </div>
          </form>
        </div>
      ) : factors.length ? (
        factors.map((factor) => (
          <div className="setting-row" key={factor.id}>
            <div>
              <strong>{factor.friendly_name || 'Authenticator'}</strong>
              <p>{copy.requiredCode}</p>
            </div>
            <button className="button subtle" disabled={busy} onClick={() => remove(factor.id)}>
              {copy.disable}
            </button>
          </div>
        ))
      ) : (
        <button className="button subtle" disabled={busy} onClick={enroll}>
          <ShieldCheck size={17} />
          {copy.enroll}
        </button>
      )}
      {error && (
        <p role="alert" className="error-message">
          {copy[error]}
        </p>
      )}
      {message && (
        <p role="status" className="account-success">
          {copy[message]}
        </p>
      )}
    </section>
  );
}
