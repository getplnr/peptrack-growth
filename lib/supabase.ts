import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service_role key. This is an internal
 * admin tool, so the server reads/writes past RLS (deny-by-default for the
 * public). NEVER import this in a client component.
 *
 * Returns null when env isn't configured — callers fall back to demo data so the
 * dashboard runs out-of-the-box with `npm run dev`.
 */
let _client: SupabaseClient | null | undefined;

export function supabaseAdmin(): SupabaseClient | null {
  if (_client !== undefined) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT")) {
    _client = null;
    return _client;
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return supabaseAdmin() !== null;
}
