import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Client-side Supabase client with SSR cookie support for PKCE
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createBrowserClient(url, key);
}

// Check if we're in demo mode (no Supabase configured)
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
