import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

import {
  bhDetailUrl,
  bhPdfUrl,
  BH_SEARCH_URL,
  cleanText,
  hashRecord,
  normalize,
  type BhRaw,
} from "../_shared/buerohamburg.ts";
import { discoverImages, removeStorage } from "./images.ts";
import { fetchJson, mapLimit } from "./http.ts";

const SOURCE = "filemaker";
/** Höchstens so viele neue/geänderte Objekte pro Lauf (Rest folgt im nächsten Lauf) */
const MAX_CHANGED_PER_RUN = 120;
/** So viele Objekte werden pro Lauf zusätzlich reihum vollständig geprüft (Details + Bilder) */
const ROLLING_PER_RUN = 60;
/** Parallele Anfragen an buerohamburg.de (deren Backend liefert bei mehr Last vermehrt falsche 404) */
const CONCURRENCY = 3;
/** Fehlen mehr als dieser Anteil, wird nichts archiviert (Schutz vor gestörter API-Antwort) */
const MAX_MISSING_SHARE = 0.05;
/** Archivierte Objekte werden nach so vielen Tagen endgültig gelöscht */
const PURGE_AFTER_DAYS = 7;
/** Ein Lauf gilt nach dieser Zeit als abgebrochen */
const STALE_RUN_MINUTES = 15;

interface ExistingProperty {
  id: string;
  reference_number: string;
  source_hash: string | null;
  detail_hash: string | null;
  status: string;
}

interface Stats {
  listed: number;
  created: number;
  updated: number;
  unchanged: number;
  rechecked: number;
  archived: number;
  restored: number;
  purged: number;
  failed: number;
  /** Objektnummern, deren Details nicht abrufbar waren (werden im nächsten Lauf erneut versucht) */
  failedRefs: string[];
  imagesQueued: number;
  skippedArchive?: string;
}

export async function runSync(db: SupabaseClient) {
  // Kein zweiter Lauf parallel; abgebrochene Läufe (z. B. Ressourcen-Limit) als fehlgeschlagen markieren
  const since = new Date(Date.now() - STALE_RUN_MINUTES * 60_000).toISOString();
  await db
    .from("sync_runs")
    .update({ status: "failed", finished_at: new Date().toISOString(), error: "Abgebrochen (kein Abschluss innerhalb von " + STALE_RUN_MINUTES + " Minuten)" })
    .eq("mode", "sync")
    .eq("status", "running")
    .lt("started_at", since);
  const { data: running } = await db
    .from("sync_runs")
    .select("id")
    .eq("mode", "sync")
    .eq("status", "running")
    .gte("started_at", since)
    .limit(1);
  if (running?.length) return { skipped: "Ein Sync läuft bereits" };

  const { data: run, error: runError } = await db
    .from("sync_runs")
    .insert({ source: SOURCE, mode: "sync" })
    .select("id")
    .single();
  if (runError) throw runError;

  const stats: Stats = {
    listed: 0, created: 0, updated: 0, unchanged: 0, rechecked: 0,
    archived: 0, restored: 0, purged: 0, failed: 0, failedRefs: [], imagesQueued: 0,
  };

  try {
    // 1) Liste von buerohamburg.de
    const list = await fetchJson<{ total: number; items: BhRaw[] }>(BH_SEARCH_URL);
    if (!list?.items || list.items.length < 50) throw new Error(`Unplausible Objektliste (${list?.items?.length ?? 0} Einträge)`);
    stats.listed = list.items.length;

    const existing = await loadExisting(db);
    const byRef = new Map(existing.map((p) => [p.reference_number, p]));
    const now = new Date().toISOString();

    // 2) Hash vergleichen: neu, geändert oder wiederaufgetaucht
    const listed = await Promise.all(
      list.items.map(async (item) => ({ ref: cleanText(item.webs_objektnr), hash: await hashRecord(item) })),
    );
    const changed = listed.filter(({ ref, hash }) => {
      const p = byRef.get(ref);
      return !p || p.source_hash !== hash || p.status !== "published";
    });
    stats.unchanged = listed.length - changed.length;
    // Neue Objekte zuerst
    changed.sort((a, b) => Number(byRef.has(a.ref)) - Number(byRef.has(b.ref)));
    const toUpdate = changed.slice(0, MAX_CHANGED_PER_RUN);

    await mapLimit(toUpdate, CONCURRENCY, async ({ ref, hash }) => {
      const previous = byRef.get(ref);
      const ok = await importObject(db, ref, hash, previous, stats);
      if (!ok) {
        stats.failed++;
        stats.failedRefs.push(ref);
      }
      else if (!previous) stats.created++;
      else if (previous.status !== "published") stats.restored++;
      else stats.updated++;
    });

    // 3) Reihum vollständige Prüfung (fängt Änderungen ab, die nicht in der Liste stehen: Bilder, volle Beschreibung)
    const updatedRefs = new Set(toUpdate.map((c) => c.ref));
    const listedRefs = new Set(listed.map((l) => l.ref));
    const { data: oldest } = await db
      .from("properties")
      .select("reference_number, source_hash")
      .eq("source", SOURCE)
      .eq("status", "published")
      .order("synced_at", { ascending: true, nullsFirst: true })
      .limit(ROLLING_PER_RUN + updatedRefs.size);
    const rolling = (oldest ?? [])
      .filter((p) => listedRefs.has(p.reference_number) && !updatedRefs.has(p.reference_number))
      .slice(0, ROLLING_PER_RUN);
    await mapLimit(rolling, CONCURRENCY, async (p) => {
      const ok = await importObject(db, p.reference_number, p.source_hash, byRef.get(p.reference_number), stats, true);
      if (ok) stats.rechecked++;
      else {
        stats.failed++;
        stats.failedRefs.push(p.reference_number);
      }
    });

    // 4) „Zuletzt gesehen“ für alle gelisteten Objekte
    const refs = [...listedRefs];
    for (let i = 0; i < refs.length; i += 300) {
      await db.from("properties").update({ last_seen_at: now }).eq("source", SOURCE).in("reference_number", refs.slice(i, i + 300));
    }

    // 5) Nicht mehr gelistete Objekte archivieren – mit Schutz vor gestörten API-Antworten
    const active = existing.filter((p) => p.status === "published");
    const missing = active.filter((p) => !listedRefs.has(p.reference_number));
    if (missing.length > Math.max(3, active.length * MAX_MISSING_SHARE)) {
      stats.skippedArchive = `${missing.length} von ${active.length} Objekten fehlen – Archivierung ausgesetzt`;
    } else if (missing.length) {
      const { error } = await db
        .from("properties")
        .update({ status: "archived", archived_at: now })
        .in("id", missing.map((p) => p.id));
      if (error) throw error;
      stats.archived = missing.length;
    }

    // 6) Lange archivierte Objekte endgültig löschen (inkl. Bilder im Storage)
    stats.purged = await purgeArchived(db);

    // 7) Vorberechnetes Suchmodell aktualisieren, wenn sich etwas geändert hat
    const changedSomething =
      stats.created + stats.updated + stats.restored + stats.archived + stats.purged + stats.rechecked > 0;
    if (changedSomething) {
      const { error: refreshError } = await db.rpc("refresh_property_listings");
      if (refreshError) throw refreshError;
    }

    await db.from("sync_runs").update({ status: "succeeded", finished_at: new Date().toISOString(), stats }).eq("id", run.id);
    return stats;
  } catch (error) {
    await db
      .from("sync_runs")
      .update({ status: "failed", finished_at: new Date().toISOString(), stats, error: String(error) })
      .eq("id", run.id);
    throw error;
  }
}

async function loadExisting(db: SupabaseClient): Promise<ExistingProperty[]> {
  const rows: ExistingProperty[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("properties")
      .select("id, reference_number, source_hash, detail_hash, status")
      .eq("source", SOURCE)
      .order("id")
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data as ExistingProperty[]));
    if (data.length < 1000) return rows;
  }
}

/**
 * Holt die Details eines Objekts und schreibt Stadtteil, Gebäude, Objekt und Mietfläche.
 * Bei recheck=true wird nur geschrieben, wenn sich die Detaildaten geändert haben; Bilder werden immer geprüft.
 */
async function importObject(
  db: SupabaseClient,
  ref: string,
  listHash: string | null,
  previous: ExistingProperty | undefined,
  stats: Stats,
  recheck = false,
): Promise<boolean> {
  const detail = await fetchJson<BhRaw>(bhDetailUrl(ref));
  if (!detail?.webs_objektnr) return false;

  const o = normalize(detail);
  if (!o.marketArea) {
    console.warn(`Objekt ${ref}: unbekannte Lage „${detail.webs_lage}“`);
    return false;
  }
  const detailHash = await hashRecord(detail);
  const now = new Date().toISOString();

  if (recheck && previous && previous.detail_hash === detailHash) {
    // Daten unverändert – nur Prüfzeitpunkt setzen und Bilder prüfen
    await db.from("properties").update({ synced_at: now }).eq("id", previous.id);
    stats.imagesQueued += await discoverImages(db, previous.id, ref, o.title);
    return true;
  }

  const hasCoords = o.lat != null && o.lng != null;
  await db.from("districts").upsert(
    {
      slug: o.districtSlug,
      name: o.districtName,
      market_area: o.marketArea,
      center_lng: o.lng,
      center_lat: o.lat,
    },
    { onConflict: "slug", ignoreDuplicates: true },
  );

  const { data: building, error: buildingError } = await db
    .from("buildings")
    .upsert(
      {
        source: SOURCE,
        external_id: o.buildingKey,
        street: o.street,
        house_number: o.houseNumber,
        postal_code: o.postalCode,
        city: o.city,
        district_slug: o.districtSlug,
        market_area: o.marketArea,
        // Ohne Koordinaten die vorhandene Lage des Gebäudes behalten
        ...(hasCoords ? { location: `SRID=4326;POINT(${o.lng} ${o.lat})` } : {}),
        synced_at: now,
      },
      { onConflict: "source,external_id" },
    )
    .select("id")
    .single();
  if (buildingError) throw buildingError;

  const { data: property, error: propertyError } = await db
    .from("properties")
    .upsert(
      {
        source: SOURCE,
        external_id: ref,
        building_id: building.id,
        reference_number: ref,
        slug: o.slug,
        title: o.title,
        teaser: o.teaser,
        description: o.description,
        category: o.category,
        categories: o.categories,
        property_type: o.propertyType,
        status: "published",
        price_type: o.priceType,
        price_note: o.priceNote,
        commission_free: o.commissionFree,
        commission_months: o.commissionMonths,
        commission_note: o.commissionNote,
        features: o.features,
        area_range_min_sqm: o.areaRangeMin,
        area_range_max_sqm: o.areaRangeMax,
        expose_pdf_url: bhPdfUrl(ref),
        featured_rank: o.featuredRank,
        source_hash: listHash,
        detail_hash: detailHash,
        last_seen_at: now,
        archived_at: null,
        synced_at: now,
        ...(previous ? {} : { published_at: now }),
      },
      { onConflict: "source,external_id" },
    )
    .select("id")
    .single();
  if (propertyError) throw propertyError;

  const { error: unitError } = await db.from("rental_units").upsert(
    {
      source: SOURCE,
      external_id: `${ref}-1`,
      property_id: property.id,
      label: "Mietfläche",
      area_sqm: o.area || 1,
      rent_per_sqm: o.rentPerSqm,
      rent_total_monthly: o.rentTotalMonthly,
      synced_at: now,
    },
    { onConflict: "source,external_id" },
  );
  if (unitError) throw unitError;

  stats.imagesQueued += await discoverImages(db, property.id, ref, o.title);
  return true;
}

async function purgeArchived(db: SupabaseClient): Promise<number> {
  const cutoff = new Date(Date.now() - PURGE_AFTER_DAYS * 86_400_000).toISOString();
  const { data: old, error } = await db
    .from("properties")
    .select("id, property_images(storage_paths)")
    .eq("source", SOURCE)
    .eq("status", "archived")
    .lt("archived_at", cutoff)
    .limit(200);
  if (error) throw error;
  if (!old?.length) return 0;

  const paths = old.flatMap((p) => (p.property_images as { storage_paths: string[] }[]).flatMap((i) => i.storage_paths));
  await removeStorage(db, paths);
  const { error: deleteError } = await db.from("properties").delete().in("id", old.map((p) => p.id));
  if (deleteError) throw deleteError;

  // Gebäude ohne Objekte aufräumen
  const { data: orphans } = await db.from("buildings").select("id, properties(id)").eq("source", SOURCE);
  const orphanIds = (orphans ?? []).filter((b) => !(b.properties as unknown[]).length).map((b) => b.id);
  if (orphanIds.length) await db.from("buildings").delete().in("id", orphanIds);
  return old.length;
}
