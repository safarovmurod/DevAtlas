'use client';
import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAccount } from './account-provider';
import { useLearningStore } from '@/stores/learning-store';
import { AUTH_COPY } from '@/lib/auth-copy';
import { ACCOUNT_COPY, accountErrorKey, localizedAuthError } from '@/lib/account-copy';
import { GoogleMark } from './google-mark';
import { Brand } from '@/components/layout/brand';

export { FirstProfileScreen, MfaChallengeScreen, PasswordRecoveryScreen } from './account-gates';

/** Sign in, sign up or reset the password. Guests can skip it. */
export function AuthScreen() {
  const account = useAccount();
  const language = useLearningStore((state) => state.language);
  const copy = AUTH_COPY[language];
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<
    { kind: 'google' } | { kind: 'provider'; cause: unknown; mode: typeof mode } | null
  >(null);
  const [message, setMessage] = useState<'resetSent' | 'confirmEmail' | ''>('');
  const errorMessage = error
    ? error.kind === 'google'
      ? copy.googleError
      : localizedAuthError(error.cause, error.mode, language)
    : account.error
      ? ACCOUNT_COPY[language][accountErrorKey(account.error, 'openError')]
      : '';
  function changeMode(next: 'login' | 'signup' | 'reset') {
    setMode(next);
    setError(null);
    setMessage('');
    setPassword('');
    setPasswordVisible(false);
  }
  function continueAsGuest() {
    account.continueAsGuest();
    if (window.location.pathname !== '/home') window.location.assign('/home');
  }
  async function google() {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch {
      setError({ kind: 'google' });
      setBusy(false);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client || busy) return;
    setBusy(true);
    setError(null);
    setMessage('');
    try {
      if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/auth/callback?recovery=1',
        });
        if (error) throw error;
        setMessage('resetSent');
      } else if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: window.location.origin + '/auth/callback',
          },
        });
        if (error) throw error;
        if (!data.session) setMessage('confirmEmail');
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (cause) {
      setError({ kind: 'provider', cause, mode });
    } finally {
      setBusy(false);
    }
  }
  const title =
    mode === 'signup' ? copy.signupTitle : mode === 'reset' ? copy.resetTitle : copy.loginTitle;
  return (
    <div className="account-screen auth-layout">
      <aside className="auth-aside">
        <Brand variant="auth" />
        <div>
          <h2>{copy.panelTitle}</h2>
          <ul>
            {copy.panelBenefits.map((benefit) => (
              <li key={benefit}>
                <CheckCircle2 size={18} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div className="auth-panel-preview">
          <span className="eyebrow">DevAtlas</span>
          <strong>{copy.panelFlow}</strong>
        </div>
      </aside>
      <section className="auth-card">
        <div className="auth-mobile-brand">
          <Brand variant="auth" />
        </div>
        <h1>{title}</h1>
        <p>{copy.intro}</p>
        <div className="auth-tabs" role="group" aria-label={copy.loginTab}>
          <button
            type="button"
            aria-pressed={mode === 'login'}
            onClick={() => changeMode('login')}
            disabled={busy}
          >
            {copy.loginTab}
          </button>
          <button
            type="button"
            aria-pressed={mode === 'signup'}
            onClick={() => changeMode('signup')}
            disabled={busy}
          >
            {copy.createAccount}
          </button>
        </div>
        {!account.configured && (
          <section className="auth-unavailable">
            <p role="status">{copy.unavailable}</p>
            <button className="button primary" onClick={continueAsGuest}>
              {copy.guest}
            </button>
          </section>
        )}
        <div className="google-option">
          <button
            className="button google-button"
            onClick={google}
            disabled={busy || !account.configured}
          >
            <span className="google-mark" aria-hidden="true">
              <GoogleMark />
            </span>
            <span>{copy.google}</span>
          </button>
          <span className="recommend-tag">{copy.recommended}</span>
        </div>
        <div className="auth-divider">{copy.orEmail}</div>
        <form className="account-form" onSubmit={submit}>
          <fieldset
            className="account-fields"
            disabled={busy || !account.configured}
            aria-label={mode === 'signup' ? copy.signUp : copy.signIn}
          >
            {mode === 'signup' && (
              <label>
                {copy.name}
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={60}
                />
              </label>
            )}
            <label>
              {copy.email}
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
              />
            </label>
            {mode !== 'reset' && (
              <div className="password-field">
                <label htmlFor="auth-password">{copy.password}</label>
                <div className="password-input">
                  <input
                    id="auth-password"
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === 'signup' ? 8 : 1}
                    maxLength={128}
                    aria-describedby={mode === 'signup' ? 'auth-password-hint' : undefined}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={passwordVisible ? copy.hidePassword : copy.showPassword}
                    aria-pressed={passwordVisible}
                    onClick={() => setPasswordVisible((value) => !value)}
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode === 'signup' && <small id="auth-password-hint">{copy.passwordHint}</small>}
              </div>
            )}
            <button className="button subtle" disabled={busy || !account.configured}>
              <Mail size={17} />
              {busy
                ? copy.saveWait
                : mode === 'signup'
                  ? copy.signUp
                  : mode === 'reset'
                    ? copy.sendLink
                    : copy.signIn}
            </button>
          </fieldset>
        </form>
        {errorMessage && (
          <p role="alert" className="error-message">
            {errorMessage}
          </p>
        )}
        {message && (
          <p role="status" className="account-success">
            {copy[message]}
          </p>
        )}
        <div className="auth-links">
          <button onClick={() => changeMode(mode === 'reset' ? 'login' : 'reset')} disabled={busy}>
            {mode === 'reset' ? copy.backToLogin : copy.forgot}
          </button>
        </div>
        {!account.user && account.configured && (
          <button className="guest-button" onClick={continueAsGuest} disabled={busy}>
            {copy.guest}
          </button>
        )}
        <p className="auth-security">
          <ShieldCheck size={15} />
          {copy.security}
        </p>
      </section>
    </div>
  );
}
