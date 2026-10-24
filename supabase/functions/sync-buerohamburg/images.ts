import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import decodeJpeg, { init as initJpeg } from "npm:@jsquash/jpeg@1.6.0/decode.js";
import resize, { initResize } from "npm:@jsquash/resize@2.1.0";
import encodeWebp, { init as initWebp } from "npm:@jsquash/webp@1.5.0/encode.js";

import { bhImageUrl, BH_MAX_IMAGES } from "../_shared/buerohamburg.ts";
import { checksumOf, download, head } from "./http.ts";

const BUCKET = "property-images";
const SOURCE = "filemaker";
/** Bilder pro Minute (jedes in einem eigenen Aufruf – eine Umwandlung braucht ~0,5 s CPU, Limit 2 s) */
const IMAGES_PER_DISPATCH = 15;
const MAX_ATTEMPTS = 3;
/** Hängende Verarbeitungen nach dieser Zeit zurück in die Warteschlange */
const STALE_PROCESSING_MINUTES = 10;
const SIZES = { large: 1280, thumb: 640 } as const;
const WEBP_OPTIONS = { quality: 72, method: 2 };

interface ImageRow {
  id: string;
  external_id: string | null;
  sort_order: number;
  checksum: string | null;
  storage_paths: string[];
}

// ---------------------------------------------------------------------------
// Bilder eines Objekts ermitteln und neue/geänderte in die Warteschlange stellen
// ---------------------------------------------------------------------------
export async function discoverImages(db: SupabaseClient, propertyId: string, ref: string, title: string): Promise<number> {
  const found: { index: number; url: string; checksum: string }[] = [];
  for (let index = 1; index <= BH_MAX_IMAGES; index++) {
    const url = bhImageUrl(ref, index);
    const res = await head(url);
    if (!res?.ok) break;
    found.push({ index, url, checksum: checksumOf(res.headers) });
  }

  const { data: existing, error } = await db
    .from("property_images")
    .select("id, external_id, sort_order, checksum, storage_paths")
    .eq("property_id", propertyId);
  if (error) throw error;
  const rows = (existing ?? []) as ImageRow[];

  // Keine Bilder gefunden, aber vorhanden → vermutlich Störung; nichts löschen
  if (!found.length && rows.length) return 0;

  const byExternalId = new Map(rows.map((r) => [r.external_id, r]));
  let queued = 0;
  for (const image of found) {
    const externalId = `${ref}-${String(image.index).padStart(2, "0")}`;
    const row = byExternalId.get(externalId);
    if (!row) {
      const { error: insertError } = await db.from("property_images").insert({
        property_id: propertyId,
        url: image.url,
        source_url: image.url,
        alt: `${title} – Bild ${image.index}`,
        sort_order: image.index - 1,
        source: SOURCE,
        external_id: externalId,
        checksum: image.checksum,
        status: "pending",
      });
      if (insertError) throw insertError;
      queued++;
    } else if (row.checksum !== image.checksum) {
      // Bild geändert – alte Varianten bleiben sichtbar, bis die neuen fertig sind
      await db
        .from("property_images")
        .update({ checksum: image.checksum, source_url: image.url, status: "pending", attempts: 0, last_error: null })
        .eq("id", row.id);
      queued++;
    }
  }

  // Bilder, die es bei buerohamburg.de nicht mehr gibt
  const validIds = new Set(found.map((f) => `${ref}-${String(f.index).padStart(2, "0")}`));
  const removed = rows.filter((r) => !validIds.has(r.external_id ?? ""));
  if (removed.length) {
    await removeStorage(db, removed.flatMap((r) => r.storage_paths));
    await db.from("property_images").delete().in("id", removed.map((r) => r.id));
  }
  return queued;
}

export async function removeStorage(db: SupabaseClient, paths: string[]) {
  for (let i = 0; i < paths.length; i += 500) {
    const chunk = paths.slice(i, i + 500);
    if (chunk.length) await db.storage.from(BUCKET).remove(chunk);
  }
}

// ---------------------------------------------------------------------------
// Warteschlange: offene Bilder an parallele Einzelaufrufe verteilen
// ---------------------------------------------------------------------------
export async function dispatchImages(db: SupabaseClient, secret: string) {
  const stale = new Date(Date.now() - STALE_PROCESSING_MINUTES * 60_000).toISOString();
  await db.from("property_images").update({ status: "pending" }).eq("status", "processing").lt("processed_at", stale);

  const { data: pending, error } = await db
    .from("property_images")
    .select("id")
    .eq("status", "pending")
    .lt("attempts", MAX_ATTEMPTS)
    .order("attempts")
    .order("sort_order") // Titelbilder zuerst
    .limit(IMAGES_PER_DISPATCH);
  if (error) throw error;
  if (!pending?.length) return { dispatched: 0 };

  // Beanspruchen, damit kein paralleler Lauf dieselben Bilder nimmt
  const { data: claimed } = await db
    .from("property_images")
    .update({ status: "processing", processed_at: new Date().toISOString() })
    .in("id", pending.map((p) => p.id))
    .eq("status", "pending")
    .select("id");

  const self = `${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-buerohamburg`;
  const results = await Promise.allSettled(
    (claimed ?? []).map((row) =>
      fetch(self, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-sync-secret": secret },
        body: JSON.stringify({ mode: "image", id: row.id }),
      }).then((r) => r.ok),
    ),
  );
  return {
    dispatched: claimed?.length ?? 0,
    succeeded: results.filter((r) => r.status === "fulfilled" && r.value).length,
  };
}

// ---------------------------------------------------------------------------
// Ein Bild umwandeln: JPEG → WebP 1280 px + 640 px, Upload, alte Dateien löschen
// ---------------------------------------------------------------------------
let codecs: Promise<void> | null = null;
const cdnWasm = (path: string) => WebAssembly.compileStreaming(fetch(`https://cdn.jsdelivr.net/npm/${path}`));

/** WASM-Module einmal pro Isolate laden (Netzwerk zählt nicht zur CPU-Zeit) */
function loadCodecs() {
  codecs ??= (async () => {
    const [jpeg, webp, resizer] = await Promise.all([
      cdnWasm("@jsquash/jpeg@1.6.0/codec/dec/mozjpeg_dec.wasm"),
      cdnWasm("@jsquash/webp@1.5.0/codec/enc/webp_enc_simd.wasm"),
      cdnWasm("@jsquash/resize@2.1.0/lib/resize/pkg/squoosh_resize_bg.wasm"),
    ]);
    await Promise.all([initJpeg(jpeg), initWebp(webp), initResize(resizer)]);
  })();
  return codecs;
}

async function shortHash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].slice(0, 5).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function processImage(db: SupabaseClient, id: string) {
  const { data: row, error } = await db
    .from("property_images")
    .select("id, sort_order, source_url, storage_paths, attempts, properties(reference_number)")
    .eq("id", id)
    .single();
  if (error) throw error;

  try {
    const [res] = await Promise.all([download(row.source_url), loadCodecs()]);
    const checksum = checksumOf(res.headers);
    const original = await decodeJpeg(await res.arrayBuffer());

    // Nie hochskalieren; 640 px aus der 1280-px-Fassung (spart CPU)
    const scale = (img: ImageData, width: number) =>
      img.width <= width ? img : resize(img, { width, height: Math.round((img.height / img.width) * width) });
    const large = await scale(original, SIZES.large);
    const largeWebp = await encodeWebp(large, WEBP_OPTIONS);
    const thumb = await scale(large, SIZES.thumb);
    const thumbWebp = await encodeWebp(thumb, WEBP_OPTIONS);

    // Inhaltsabhängiger Dateiname → Dateien sind unveränderlich und dürfen dauerhaft gecacht werden
    const ref = (row.properties as unknown as { reference_number: string }).reference_number;
    const base = `${ref}/${String(row.sort_order + 1).padStart(2, "0")}-${await shortHash(checksum)}`;
    const paths = { large: `${base}-${SIZES.large}.webp`, thumb: `${base}-${SIZES.thumb}.webp` };
    const bucket = db.storage.from(BUCKET);
    for (const [path, data] of [[paths.large, largeWebp], [paths.thumb, thumbWebp]] as const) {
      const { error: uploadError } = await bucket.upload(path, data, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
      if (uploadError) throw uploadError;
    }

    const newPaths = [paths.large, paths.thumb];
    const { error: updateError } = await db
      .from("property_images")
      .update({
        url: bucket.getPublicUrl(paths.large).data.publicUrl,
        thumb_url: bucket.getPublicUrl(paths.thumb).data.publicUrl,
        storage_paths: newPaths,
        checksum,
        status: "done",
        last_error: null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (updateError) throw updateError;

    await removeStorage(db, (row.storage_paths as string[]).filter((p) => !newPaths.includes(p)));
    return { id, ok: true, bytes: { large: largeWebp.byteLength, thumb: thumbWebp.byteLength } };
  } catch (err) {
    const attempts = (row.attempts as number) + 1;
    await db
      .from("property_images")
      .update({ status: attempts >= MAX_ATTEMPTS ? "failed" : "pending", attempts, last_error: String(err) })
      .eq("id", id);
    throw err;
  }
}
