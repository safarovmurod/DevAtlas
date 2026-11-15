import type { Session, SupabaseClient } from '@supabase/supabase-js';

/** Refresh a rejected access token once without asking for another Google login. */
export async function verifySavedSession(client: SupabaseClient, saved: Session): Promise<Session> {
  let session = saved;
  let verification = await client.auth.getUser(session.access_token);
  if (
    verification.error &&
    (verification.error.status === 401 || verification.error.code === 'bad_jwt')
  ) {
    const refreshed = await client.auth.refreshSession();
    if (refreshed.error) throw refreshed.error;
    if (!refreshed.data.session || refreshed.data.session.user.id !== saved.user.id)
      throw new Error('Сессия изменилась. Повторите открытие аккаунта.');
    session = refreshed.data.session;
    verification = await client.auth.getUser(session.access_token);
  }
  if (verification.error) throw verification.error;
  if (verification.data.user?.id !== saved.user.id)
    throw new Error('Не удалось подтвердить аккаунт. Войдите ещё раз.');
  return { ...session, user: verification.data.user };
}

/** What the browser can honestly tell about the session that is open on this device. */
export interface CurrentSessionInfo {
  /** The auth service's id of this session, read from the access token. */
  sessionId: string | null;
  /** When this sign-in happened (ISO time), or null when the service did not say. */
  signedInAt: string | null;
  /** The sign-in provider, for example `google` or `email`. */
  provider: string | null;
}

/** Reads the payload of an access token. The token is only decoded, never trusted for access. */
function tokenClaims(accessToken: string): Record<string, unknown> {
  try {
    const payload = accessToken.split('.')[1] ?? '';
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
    const claims: unknown = JSON.parse(json);
    return claims && typeof claims === 'object' ? (claims as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Facts about this device's session: its id, the sign-in time and the sign-in provider. */
export function currentSessionInfo(session: Session): CurrentSessionInfo {
  const claims = tokenClaims(session.access_token);
  const sessionId = typeof claims.session_id === 'string' ? claims.session_id : null;
  const amr = Array.isArray(claims.amr) ? (claims.amr as { timestamp?: unknown }[]) : [];
  const stamp = amr.map((entry) => entry?.timestamp).find((value) => typeof value === 'number');
  const issuedAt = typeof claims.iat === 'number' ? claims.iat : undefined;
  const lastSignIn = session.user.last_sign_in_at;
  const seconds = typeof stamp === 'number' ? stamp : undefined;
  const signedInAt =
    lastSignIn && Number.isFinite(Date.parse(lastSignIn))
      ? new Date(lastSignIn).toISOString()
      : seconds !== undefined || issuedAt !== undefined
        ? new Date((seconds ?? issuedAt!) * 1000).toISOString()
        : null;
  const provider = session.user.app_metadata?.provider;
  return { sessionId, signedInAt, provider: typeof provider === 'string' ? provider : null };
}

/** "Chrome · Windows" from the browser's own description. Unknown parts are left out. */
export function describeDevice(userAgent: string): string {
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /OPR\/|Opera/.test(userAgent)
      ? 'Opera'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Chrome\/|CriOS\//.test(userAgent)
          ? 'Chrome'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : '';
  const system = /Windows/.test(userAgent)
    ? 'Windows'
    : /Android/.test(userAgent)
      ? 'Android'
      : /iPhone|iPad|iPod/.test(userAgent)
        ? 'iOS'
        : /Mac OS X|Macintosh/.test(userAgent)
          ? 'macOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : '';
  return [browser, system].filter(Boolean).join(' · ');
}
