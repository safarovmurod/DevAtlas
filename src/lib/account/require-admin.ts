import type { User } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export type AdminCheck =
  | { ok: true; user: User }
  | {
      ok: false;
      status: 401 | 403 | 503;
      error: 'authentication_required' | 'admin_required' | 'mfa_required' | 'unavailable';
    };

/**
 * Server-side admin check. The role is read from the auth server (`getUser`), not from
 * the token payload, so removing `app_role` takes effect at once. The token must also be
 * at the aal2 level, which means the TOTP code was entered for this session.
 */
export async function requireAdmin(request: Request): Promise<AdminCheck> {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'authentication_required' };
  }
  const token = header.slice(7);
  const client = getSupabaseServerClient(header);
  if (!client) return { ok: false, status: 503, error: 'unavailable' };
  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return { ok: false, status: 401, error: 'authentication_required' };
    const user = data.user;
    if (user.is_anonymous || !user.email_confirmed_at || user.app_metadata?.app_role !== 'admin') {
      return { ok: false, status: 403, error: 'admin_required' };
    }
    const level = await client.auth.mfa.getAuthenticatorAssuranceLevel(token);
    if (level.error || level.data?.currentLevel !== 'aal2') {
      return { ok: false, status: 403, error: 'mfa_required' };
    }
    return { ok: true, user };
  } catch {
    return { ok: false, status: 503, error: 'unavailable' };
  }
}
