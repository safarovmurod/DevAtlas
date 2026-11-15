import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';

/** Browser side of the billing API. The access token is read from the saved session. */
export class BillingRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
    this.name = 'BillingRequestError';
  }
}

async function accessToken(): Promise<string | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  try {
    const { data, error } = await getSessionWithTimeout(client);
    return error || !data.session ? null : data.session.access_token;
  } catch {
    return null;
  }
}

/**
 * `login: false` (status only) works without a session. Every other call needs one and
 * fails with `authentication_required` before anything is sent.
 */
export async function billingFetch<T>(
  path: '/api/billing/status' | '/api/billing/checkout' | '/api/billing/portal',
  options: { method?: 'GET' | 'POST'; body?: unknown; login?: boolean } = {},
): Promise<T> {
  const token = await accessToken();
  if (!token && options.login !== false)
    throw new BillingRequestError('authentication_required', 401);
  let response: Response;
  try {
    response = await fetch(path, {
      method: options.method ?? 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new BillingRequestError('generic', 0);
  }
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const code =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'generic';
    throw new BillingRequestError(code, response.status);
  }
  return data as T;
}
