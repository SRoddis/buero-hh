import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

let client: SupabaseClient<Database> | undefined;

/** Öffentlicher Schlüssel: neuer Publishable-Key (sb_publishable_…) oder klassischer anon-Key */
export function supabasePublicKey() {
  return process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
}

/**
 * Serverseitiger Supabase-Client mit dem öffentlichen Publishable-/anon-Key.
 * Ohne Login gibt es keine Nutzersitzung – Zugriffe werden über RLS-Policies abgesichert.
 */
export function getSupabase(): SupabaseClient<Database> {
  const url = process.env.SUPABASE_URL;
  const key = supabasePublicKey();
  if (!url || !key) throw new Error("SUPABASE_URL und SUPABASE_PUBLISHABLE_KEY müssen gesetzt sein.");
  client ??= createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
