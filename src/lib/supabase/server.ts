import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { boundedSupabaseFetch } from './request';

function isValidSupabaseUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function getSupabaseServerClient(authHeader?: string): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase Server Client called in client context');
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !anonKey || !isValidSupabaseUrl(supabaseUrl) || anonKey.length <= 10) {
    return null;
  }

  return createClient(supabaseUrl, anonKey, {
    global: {
      fetch: boundedSupabaseFetch,
      headers: authHeader ? { Authorization: authHeader } : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
