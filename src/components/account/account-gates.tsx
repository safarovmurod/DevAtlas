'use client';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Brand } from '@/components/layout/brand';
import { ACCOUNT_COPY, accountErrorKey, type AccountCopyKey } from '@/lib/account-copy';
import { AUTH_COPY } from '@/lib/auth-copy';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useLearningStore } from '@/stores/learning-store';
import { useAccount } from './account-provider';

// Screens that stand between sign-in and the app: profile name, MFA code, new password.

/** First sign-in: the learner chooses the name shown on the profile. */
export function FirstProfileScreen() {
  const account = useAccount();
  const language = useLearningStore((state) => state.language);
  const copy = AUTH_COPY[language];
  const [name, setName] = useState(
    String(account.user?.user_metadata?.full_name || '').slice(0, 60),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountCopyKey | ''>('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await account.saveProfile(name);
    } catch (cause) {
      setError(accountErrorKey(cause, 'nameError'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="account-screen">
      <section className="auth-card">
        <Brand variant="auth" />
        <h1>{copy.firstNameTitle}</h1>
        <p>{copy.firstNameDescription}</p>
        <form className="account-form" onSubmit={submit}>
          <label>
            {copy.name}
            <input
              autoFocus
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={60}
              required
            />
          </label>
          <button className="button primary" disabled={busy || name.trim().length < 2}>
            {busy ? copy.saveWait : copy.firstNameStart}
          </button>
        </form>
        {error && (
          <p role="alert" className="error-message">
            {ACCOUNT_COPY[language][error]}
          </p>
        )}
        <button className="guest-button" onClick={account.signOut} disabled={busy}>
          {copy.logout}
        </button>
      </section>
    </div>
  );
}

/** Second step of sign-in when two-factor authentication is on. */
export function MfaChallengeScreen() {
  const account = useAccount();
  const copy = ACCOUNT_COPY[useLearningStore((state) => state.language)];
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error();
      const factors = await client.auth.mfa.listFactors();
      const factor = factors.data?.totp[0];
      if (factors.error || !factor) throw new Error();
      const result = await client.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
      if (result.error) throw result.error;
      await account.reload();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="account-screen">
      <section className="auth-card">
        <span className="auth-logo">
          <ShieldCheck size={28} />
        </span>
        <h1>{copy.challengeTitle}</h1>
        <p>{copy.challengeDescription}</p>
        <form className="account-form" onSubmit={verify}>
          <label>
            {copy.challengeCode}
            <input
              className="mfa-code"
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </label>
          <button className="button primary" disabled={busy || code.length !== 6}>
            {busy ? copy.checking : copy.confirm}
          </button>
        </form>
        {error && (
          <p role="alert" className="error-message">
            {copy.challengeError}
          </p>
        )}
        <button className="guest-button" onClick={account.signOut} disabled={busy}>
          {copy.logout}
        </button>
      </section>
    </div>
  );
}

/** Opened from the reset e-mail: set a new password, then sign in again. */
export function PasswordRecoveryScreen() {
  const account = useAccount();
  const copy = ACCOUNT_COPY[useLearningStore((state) => state.language)];
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<'passwordMismatch' | 'recoveryError' | ''>('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError('passwordMismatch');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await getSupabaseBrowserClient()?.auth.updateUser({ password });
      if (!result || result.error) throw new Error();
      await account.signOut();
    } catch {
      setError('recoveryError');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="account-screen">
      <section className="auth-card">
        <h1>{copy.newPassword}</h1>
        <p>{copy.recoveryDescription}</p>
        <form className="account-form" onSubmit={submit}>
          <label>
            {copy.newPassword}
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label>
            {copy.repeatPassword}
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          <button className="button primary" disabled={busy}>
            {copy.savePassword}
          </button>
        </form>
        {error && (
          <p role="alert" className="error-message">
            {copy[error]}
          </p>
        )}
        <button className="guest-button" onClick={account.signOut} disabled={busy}>
          {copy.cancel}
        </button>
      </section>
    </div>
  );
}
