import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

// Null when unconfigured rather than throwing at import time: lib/store.ts falls
// back to local-only mode via apiConfigured(), and the app must still render.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        // No accounts: the app must always talk to PostgREST as anon, because
        // every write policy is scoped TO anon. With the default persistSession,
        // supabase-js picks up any leftover sb-<ref>-auth-token in localStorage
        // and sends it as a JWT -- the role becomes authenticated, the anon_*
        // policies stop applying, and every save fails with "new row violates
        // row-level security policy". Turning sessions off makes that
        // unreachable instead of relying on the token being cleared by hand.
        // Flip these back when the account feature returns.
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      })
    : null;

export function supabaseConfigured() {
  return Boolean(supabase);
}

export function db() {
  if (!supabase) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured.");
  }
  return supabase;
}
