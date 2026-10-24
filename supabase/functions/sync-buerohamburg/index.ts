/**
 * Edge Function „sync-buerohamburg“ – hält Supabase mit buerohamburg.de synchron.
 *
 * Aufrufe (POST, Header x-sync-secret):
 *   { "mode": "sync" }          alle 10 Min. (pg_cron): neue/geänderte Objekte übernehmen, fehlende archivieren
 *   { "mode": "images" }        jede Minute (pg_cron): Bild-Warteschlange an Einzelaufrufe verteilen
 *   { "mode": "image", "id" }   ein Bild in WebP umwandeln (intern, ein Bild je Aufruf wegen CPU-Limit)
 */
import { createClient } from "npm:@supabase/supabase-js@2";

import { processImage, dispatchImages } from "./images.ts";
import { runSync } from "./sync.ts";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  const secret = Deno.env.get("SYNC_SECRET");
  if (!secret || req.headers.get("x-sync-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { mode?: string; id?: string };
  try {
    switch (body.mode) {
      case "sync":
        return json(await runSync(db));
      case "images":
        return json(await dispatchImages(db, secret));
      case "image":
        if (!body.id) return json({ error: "id fehlt" }, 400);
        return json(await processImage(db, body.id));
      default:
        return json({ error: `Unbekannter Modus: ${body.mode}` }, 400);
    }
  } catch (error) {
    console.error(`[${body.mode}]`, error);
    return json({ error: String(error) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
