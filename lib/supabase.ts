import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

// Null when unconfigured rather than throwing at import time: lib/store.ts falls
// back to local-only mode via apiConfigured(), and the app must still render.
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function supabaseConfigured() {
  return Boolean(supabase);
}

export function db() {
  if (!supabase) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured.");
  }
  return supabase;
}
