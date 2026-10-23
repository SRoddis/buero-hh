import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/**
 * Serverseitiger Supabase-Client mit dem öffentlichen anon-Key.
 * Ohne Login gibt es keine Nutzersitzung – Zugriffe werden über RLS-Policies abgesichert.
 */
export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL und SUPABASE_ANON_KEY müssen gesetzt sein.");
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
