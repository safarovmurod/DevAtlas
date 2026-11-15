'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAccount } from './account-provider';
import { useLearningStore } from '@/stores/learning-store';
import { AUTH_COPY } from '@/lib/auth-copy';
import { ACCOUNT_COPY, accountErrorKey, localizedAuthError } from '@/lib/account-copy';
import { GoogleMark } from './google-mark';
import { Brand } from '@/components/layout/brand';
import { AuthShowcase, AuthShowcaseMobile } from './auth-showcase';
import { authFormSchema, type AuthFormValues, type AuthMode } from '@/lib/account/form-schemas';

export { FirstProfileScreen, MfaChallengeScreen, PasswordRecoveryScreen } from './account-gates';

/** Sign in, sign up or reset the password. Guests can skip it. */
export function AuthScreen() {
  const account = useAccount();
  const language = useLearningStore((state) => state.language);
  const copy = AUTH_COPY[language];
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { mode: 'login', name: '', email: '', password: '' },
  });
  const mode = useWatch({ control: form.control, name: 'mode' });
  const fieldErrors = form.formState.errors;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<
    | { kind: 'oauth'; provider: 'google' | 'github' | 'facebook' }
    | { kind: 'provider'; cause: unknown; mode: typeof mode }
    | null
  >(null);
  const [message, setMessage] = useState<'resetSent' | 'confirmEmail' | ''>('');
  const errorMessage = error
    ? error.kind === 'oauth'
      ? copy.googleError.replaceAll(
          'Google',
          error.provider === 'github'
            ? 'GitHub'
            : error.provider === 'facebook'
              ? 'Facebook'
              : 'Google',
        )
      : localizedAuthError(error.cause, error.mode, language)
    : account.error
      ? ACCOUNT_COPY[language][accountErrorKey(account.error, 'openError')]
      : '';
  function changeMode(next: AuthMode) {
    form.setValue('mode', next);
    form.setValue('password', '');
    form.clearErrors();
    setError(null);
    setMessage('');
    setPasswordVisible(false);
  }
  function continueAsGuest() {
    account.continueAsGuest();
    if (window.location.pathname !== '/home') window.location.assign('/home');
  }
  async function signInWithProvider(provider: 'google' | 'github' | 'facebook') {
    const client = getSupabaseBrowserClient();
    if (!client || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
        },
      });
      if (error) throw error;
    } catch {
      setError({ kind: 'oauth', provider });
      setBusy(false);
    }
  }
  // Runs after the Zod check passed. The Supabase calls are the same as before.
  async function submit({ mode, name, email, password }: AuthFormValues) {
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
      <aside className="auth-aside auth-aside-showcase">
        <Brand variant="auth" />
        <AuthShowcase />
      </aside>
      <section className="auth-card">
        <div className="auth-mobile-brand">
          <Brand variant="auth" />
        </div>
        <h1>{title}</h1>
        <p>{copy.intro}</p>
        <AuthShowcaseMobile copy={copy} />
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
            onClick={() => signInWithProvider('google')}
            disabled={busy || !account.configured}
          >
            <span className="google-mark" aria-hidden="true">
              <GoogleMark />
            </span>
            <span>{copy.google}</span>
          </button>
        </div>
        <div className="social-login-options">
          <button
            type="button"
            className="button google-button"
            onClick={() => signInWithProvider('github')}
            disabled={busy || !account.configured}
          >
            <Image src="/auth-icons/github.svg" width={20} height={20} alt="" aria-hidden="true" />
            <span>{copy.google.replaceAll('Google', 'GitHub')}</span>
          </button>
          <button
            type="button"
            className="button google-button"
            onClick={() => signInWithProvider('facebook')}
            disabled={busy || !account.configured}
          >
            <Image
              src="/auth-icons/facebook.svg"
              width={20}
              height={20}
              alt=""
              aria-hidden="true"
            />
            <span>{copy.google.replaceAll('Google', 'Facebook')}</span>
          </button>
        </div>
        <div className="auth-divider">{copy.orEmail}</div>
        <form className="account-form" onSubmit={form.handleSubmit(submit)}>
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
                  {...form.register('name')}
                  aria-invalid={Boolean(fieldErrors.name)}
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
                {...form.register('email')}
                aria-invalid={Boolean(fieldErrors.email)}
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
                    {...form.register('password')}
                    aria-invalid={Boolean(fieldErrors.password)}
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
