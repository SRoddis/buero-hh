import { createHash } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Config } from "./config";
import { FileMakerClient, parseFmTimestamp } from "./filemaker/client";
import type { FmBuilding, FmContact, FmImage, FmProperty, FmRecord, FmUnit } from "./filemaker/types";
import { mapBuilding, mapContact, mapImage, mapProperty, mapUnit } from "./mapping";

interface SyncStats {
  [entity: string]: { fetched: number; upserted: number; failed: number };
}

/**
 * Delta-Sync FileMaker → Supabase.
 *
 * Ablauf: Ansprechpartner → Gebäude → Objekte → Flächen → Bilder (Abhängigkeitsreihenfolge),
 * anschließend Export neuer Kontaktanfragen nach FileMaker.
 * Upserts erfolgen idempotent über (source, external_id); fehlerhafte Einzeldatensätze
 * werden protokolliert, brechen den Lauf aber nicht ab.
 */
export async function runSync(config: Config, options: { full?: boolean } = {}) {
  const db = createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } });
  const fm = new FileMakerClient(
    config.filemaker.host,
    config.filemaker.database,
    config.filemaker.user,
    config.filemaker.password,
  );
  const stats: SyncStats = {};

  const since = options.full ? null : await lastWatermark(db);
  const { data: run, error } = await db.from("sync_runs").insert({ source: "filemaker" }).select("id").single();
  if (error) throw error;

  let watermark = since;
  const track = (records: FmRecord<{ Geaendert_am: string }>[]) => {
    for (const r of records) {
      const modified = parseFmTimestamp(r.fieldData.Geaendert_am);
      if (modified && (!watermark || modified > watermark)) watermark = modified;
    }
  };
  const fetchAll = async <T extends { Geaendert_am: string }>(layout: string) => {
    const records = await fm.findAll<T>(layout, { modifiedSince: since, pageSize: config.filemaker.pageSize });
    track(records);
    return records;
  };

  try {
    const { layouts } = config.filemaker;

    const contacts = await fetchAll<FmContact>(layouts.contacts);
    await upsert(db, "contacts", contacts, (r) => mapContact(r.fieldData), stats);

    const buildings = await fetchAll<FmBuilding>(layouts.buildings);
    await upsert(db, "buildings", buildings, (r) => mapBuilding(r.fieldData), stats);

    const [buildingIds, contactIds] = await Promise.all([idLookup(db, "buildings"), idLookup(db, "contacts")]);
    const properties = await fetchAll<FmProperty>(layouts.properties);
    await upsert(
      db,
      "properties",
      properties,
      (r) =>
        mapProperty(r.fieldData, {
          buildingId: required(buildingIds, r.fieldData.Gebaeude_ID, "Gebäude"),
          contactId: contactIds.get(r.fieldData.Ansprechpartner_ID) ?? null,
        }),
      stats,
    );

    const propertyIds = await idLookup(db, "properties");
    const units = await fetchAll<FmUnit>(layouts.units);
    await upsert(
      db,
      "rental_units",
      units,
      (r) => mapUnit(r.fieldData, { propertyId: required(propertyIds, r.fieldData.Objekt_ID, "Objekt") }),
      stats,
    );

    const images = await fetchAll<FmImage>(layouts.images);
    await syncImages(db, fm, config, images, propertyIds, stats);

    await exportInquiries(db, fm, layouts.inquiries, propertyIds, stats);

    await db
      .from("sync_runs")
      .update({ status: "succeeded", finished_at: new Date().toISOString(), watermark, stats })
      .eq("id", run.id);
    return stats;
  } catch (err) {
    await db
      .from("sync_runs")
      .update({ status: "failed", finished_at: new Date().toISOString(), stats, error: String(err) })
      .eq("id", run.id);
    throw err;
  } finally {
    await fm.logout();
  }
}

async function lastWatermark(db: SupabaseClient): Promise<Date | null> {
  const { data } = await db
    .from("sync_runs")
    .select("watermark")
    .eq("status", "succeeded")
    .not("watermark", "is", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.watermark ? new Date(data.watermark) : null;
}

/** FileMaker-ID → Supabase-UUID für Fremdschlüssel */
async function idLookup(db: SupabaseClient, table: string) {
  const map = new Map<string, string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from(table)
      .select("id, external_id")
      .eq("source", "filemaker")
      .range(from, from + 999);
    if (error) throw error;
    for (const row of data) map.set(row.external_id, row.id);
    if (data.length < 1000) return map;
  }
}

function required(map: Map<string, string>, externalId: string, label: string) {
  const id = map.get(externalId);
  if (!id) throw new Error(`${label} ${externalId} ist (noch) nicht synchronisiert`);
  return id;
}

async function upsert<T>(
  db: SupabaseClient,
  table: string,
  records: FmRecord<T>[],
  map: (record: FmRecord<T>) => Record<string, unknown>,
  stats: SyncStats,
) {
  const entry = (stats[table] = { fetched: records.length, upserted: 0, failed: 0 });
  const rows: Record<string, unknown>[] = [];
  for (const record of records) {
    try {
      rows.push(map(record));
    } catch (err) {
      entry.failed++;
      console.warn(`[${table}] Datensatz ${record.recordId} übersprungen:`, (err as Error).message);
    }
  }
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await db.from(table).upsert(chunk, { onConflict: "source,external_id" });
    if (error) throw new Error(`[${table}] Upsert fehlgeschlagen: ${error.message}`);
    entry.upserted += chunk.length;
  }
}

/** Lädt geänderte Container-Bilder in Supabase Storage; unveränderte Dateien (gleiche Prüfsumme) werden übersprungen. */
async function syncImages(
  db: SupabaseClient,
  fm: FileMakerClient,
  config: Config,
  records: FmRecord<FmImage>[],
  propertyIds: Map<string, string>,
  stats: SyncStats,
) {
  const entry = (stats.property_images = { fetched: records.length, upserted: 0, failed: 0 });
  const { data: existing } = await db
    .from("property_images")
    .select("external_id, checksum")
    .eq("source", "filemaker");
  const checksums = new Map((existing ?? []).map((r) => [r.external_id, r.checksum]));

  for (const record of records) {
    const image = record.fieldData;
    try {
      const propertyId = required(propertyIds, image.Objekt_ID, "Objekt");
      const { data, contentType } = await fm.downloadContainer(image.Bild);
      const checksum = createHash("sha256").update(Buffer.from(data)).digest("hex");
      if (checksums.get(image.ID) === checksum) continue;

      const extension = image.Dateiname?.split(".").pop()?.toLowerCase() || "jpg";
      const storagePath = `${propertyId}/${image.ID}.${extension}`;
      const bucket = db.storage.from(config.supabase.imageBucket);
      const { error: uploadError } = await bucket.upload(storagePath, data, { contentType, upsert: true });
      if (uploadError) throw uploadError;

      const url = bucket.getPublicUrl(storagePath).data.publicUrl;
      const { error } = await db
        .from("property_images")
        .upsert(mapImage(image, { propertyId, url, storagePath, checksum }), { onConflict: "source,external_id" });
      if (error) throw error;
      entry.upserted++;
    } catch (err) {
      entry.failed++;
      console.warn(`[property_images] Bild ${image.ID} übersprungen:`, (err as Error).message);
    }
  }
}

/** Überträgt neue Kontaktanfragen aus dem Portal nach FileMaker und markiert sie als exportiert. */
async function exportInquiries(
  db: SupabaseClient,
  fm: FileMakerClient,
  layout: string,
  propertyIds: Map<string, string>,
  stats: SyncStats,
) {
  const { data, error } = await db.from("inquiries").select("*").is("exported_at", null).order("created_at").limit(200);
  if (error) throw error;
  const entry = (stats.inquiries = { fetched: data.length, upserted: 0, failed: 0 });
  const externalByUuid = new Map([...propertyIds].map(([external, uuid]) => [uuid, external]));

  for (const inquiry of data) {
    try {
      const recordId = await fm.create(layout, {
        Objekt_ID: externalByUuid.get(inquiry.property_id) ?? "",
        Name: inquiry.name,
        Firma: inquiry.company ?? "",
        EMail: inquiry.email,
        Telefon: inquiry.phone ?? "",
        Nachricht: inquiry.message,
        Eingang_am: inquiry.created_at,
      });
      await db
        .from("inquiries")
        .update({ exported_at: new Date().toISOString(), external_id: recordId })
        .eq("id", inquiry.id);
      entry.upserted++;
    } catch (err) {
      entry.failed++;
      console.warn(`[inquiries] Anfrage ${inquiry.id} nicht exportiert:`, (err as Error).message);
    }
  }
}
