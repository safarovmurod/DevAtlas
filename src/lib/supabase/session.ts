import type { SupabaseClient } from '@supabase/supabase-js';

const SESSION_TIMEOUT_MS = 12_000;

/**
 * Reads the saved session, but stops waiting after 12 seconds so the page
 * never hangs when the auth service does not answer.
 */
export async function getSessionWithTimeout(client: SupabaseClient) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Session timeout')), SESSION_TIMEOUT_MS);
  });
  try {
    return await Promise.race([client.auth.getSession(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
