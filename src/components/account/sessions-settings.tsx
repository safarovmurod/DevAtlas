'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, MonitorSmartphone, UsersRound } from 'lucide-react';
import { currentSessionInfo, describeDevice, type CurrentSessionInfo } from '@/lib/account/session';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useLearningStore } from '@/stores/learning-store';
import type { InterfaceLocale } from '@/lib/locale';
import { useAccount } from './account-provider';
import { SESSIONS_COPY } from './sessions-settings-copy';

const DATE_LOCALE: Record<InterfaceLocale, string> = {
  ru: 'ru-RU',
  tg: 'tg-TJ',
  es: 'es-ES',
  en: 'en-US',
};

function formatTime(iso: string, language: InterfaceLocale) {
  try {
    return new Date(iso).toLocaleString(DATE_LOCALE[language], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

/** "google" → "Google", "email" → "Email". */
function providerName(provider: string) {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

type Loaded = { info: CurrentSessionInfo; device: string };

/**
 * Settings → sessions and devices. It shows the real session of this device and can
 * end all other sessions. The sign-in service does not give a browser the list of
 * other devices, so the list is not invented.
 */
export function SessionsSettings() {
  const account = useAccount();
  const language = useLearningStore((state) => state.language);
  const copy = SESSIONS_COPY[language];
  const userId = account.user?.id ?? null;

  const [loaded, setLoaded] = useState<Loaded | 'loading' | 'failed'>('loading');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<'othersDone' | 'othersError' | ''>('');

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    Promise.resolve()
      .then(() => client.auth.getSession())
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data.session || data.session.user.id !== userId) {
          setLoaded('failed');
          return;
        }
        setLoaded({
          info: currentSessionInfo(data.session),
          device: describeDevice(navigator.userAgent),
        });
      })
      .catch(() => {
        if (active) setLoaded('failed');
      });
    return () => {
      active = false;
    };
  }, [userId]);

  async function signOutOthers() {
    const client = getSupabaseBrowserClient();
    if (!client || busy) return;
    setBusy(true);
    setNotice('');
    try {
      const { error } = await client.auth.signOut({ scope: 'others' });
      setNotice(error ? 'othersError' : 'othersDone');
    } catch {
      setNotice('othersError');
    } finally {
      setBusy(false);
    }
  }

  if (!userId)
    return (
      <section id="account-sessions" className="panel account-panel">
        <div className="section-heading">
          <h2>
            <MonitorSmartphone size={19} />
            {copy.title}
          </h2>
          <span className="account-badge">{copy.guestBadge}</span>
        </div>
        <p>{copy.guestHint}</p>
        <Link className="button subtle" href="/login">
          {copy.guestLogin}
        </Link>
      </section>
    );

  return (
    <section id="account-sessions" className="panel account-panel">
      <div className="section-heading">
        <h2>
          <MonitorSmartphone size={19} />
          {copy.title}
        </h2>
        <span className="account-badge">{copy.signedInBadge}</span>
      </div>
      <p>{copy.intro}</p>

      <div className="mt-4 rounded-xl border border-border bg-muted p-4" data-testid="this-device">
        {loaded === 'loading' ? (
          <p aria-busy="true" className="m-0 text-sm text-muted-foreground">
            {copy.loading}
          </p>
        ) : loaded === 'failed' ? (
          <p role="alert" className="m-0 text-sm text-destructive">
            {copy.sessionError}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{loaded.device || copy.current}</strong>
              {loaded.device && <span className="account-badge">{copy.current}</span>}
            </div>
            <dl className="m-0 mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">{copy.signedInAt}</dt>
              <dd className="m-0">
                {loaded.info.signedInAt
                  ? formatTime(loaded.info.signedInAt, language)
                  : copy.unknown}
              </dd>
              <dt className="text-muted-foreground">{copy.method}</dt>
              <dd className="m-0">
                {loaded.info.provider ? providerName(loaded.info.provider) : copy.unknown}
              </dd>
              <dt className="text-muted-foreground">{copy.sessionId}</dt>
              <dd className="m-0 font-mono">
                {loaded.info.sessionId ? loaded.info.sessionId.slice(0, 8) : copy.unknown}
              </dd>
            </dl>
          </>
        )}
      </div>

      <p className="account-hint">{copy.othersNote}</p>
      <div className="button-row">
        <button className="button subtle" disabled={busy} onClick={signOutOthers}>
          <UsersRound size={17} />
          {busy ? copy.working : copy.signOutOthers}
        </button>
        <button className="button subtle" disabled={busy} onClick={account.signOut}>
          <LogOut size={17} />
          {copy.signOutHere}
        </button>
      </div>
      {notice === 'othersError' && (
        <p role="alert" className="error-message">
          {copy.othersError}
        </p>
      )}
      {notice === 'othersDone' && (
        <p role="status" className="account-success">
          {copy.othersDone}
        </p>
      )}
    </section>
  );
}
