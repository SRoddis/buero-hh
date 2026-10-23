import { parseFmTimestamp } from "./filemaker/client";
import type { FmBuilding, FmContact, FmImage, FmProperty, FmUnit } from "./filemaker/types";

/**
 * Reine Mapping-Funktionen FileMaker → Supabase-Zeilen (ohne Seiteneffekte, gut testbar).
 * Fremdschlüssel werden über die FileMaker-IDs aufgelöst, die der Aufrufer als Lookup übergibt.
 */

const SOURCE = "filemaker" as const;

const TYPE_MAP: Record<string, { type: string; category: string }> = {
  buero: { type: "buero", category: "buero-praxis" },
  praxis: { type: "praxis", category: "buero-praxis" },
  laden: { type: "laden", category: "laden-gastro" },
  einzelhandel: { type: "laden", category: "laden-gastro" },
  gastro: { type: "gastro", category: "laden-gastro" },
  gastronomie: { type: "gastro", category: "laden-gastro" },
  lager: { type: "lager", category: "lager-logistik" },
  logistik: { type: "lager", category: "lager-logistik" },
};

const STATUS_MAP: Record<string, string> = {
  online: "published",
  aktiv: "published",
  veroeffentlicht: "published",
  reserviert: "reserved",
  vermietet: "rented",
  archiviert: "archived",
};

const LOCATION_MAP: Record<string, string> = {
  city: "city",
  innenstadt: "city",
  cityrand: "citynah",
  citynah: "citynah",
  buerozentrum: "buerozentrum",
  peripherie: "peripherie",
};

/** FileMaker-Werteliste → Merkmal-Schlüssel des Frontends (src/lib/constants.ts) */
const FEATURE_MAP: Record<string, string> = {
  neubau: "neubau",
  barrierefrei: "barrierefrei",
  klimaanlage: "klimatisiert",
  klimatisiert: "klimatisiert",
  stellplaetze: "stellplaetze",
  tiefgarage: "stellplaetze",
  aufzug: "aufzug",
  glasfaser: "glasfaser",
  teekueche: "teekueche",
  kantine: "kantine",
  dachterrasse: "dachterrasse",
  empfang: "empfang",
  concierge: "empfang",
  denkmalschutz: "denkmalschutz",
  wasserblick: "wasserblick",
  "oepnv-anbindung": "oepnv-nah",
  "e-ladestation": "e-ladestation",
  schaufenster: "schaufenster",
  abluft: "abluft",
  rampe: "rampe",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const num = (v: number | string | undefined) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const bool = (v: number | string | undefined) => v === 1 || v === "1" || String(v).toLowerCase() === "ja";
const iso = (v: string | undefined) => parseFmTimestamp(v)?.toISOString() ?? null;
const date = (v: string | undefined) => iso(v)?.slice(0, 10) ?? null;

export function parseFeatures(value: string | undefined) {
  return [
    ...new Set(
      (value ?? "")
        .split(/[\r\n]+/)
        .map((v) => FEATURE_MAP[slugify(v)])
        .filter(Boolean),
    ),
  ];
}

export function mapContact(fm: FmContact) {
  return {
    source: SOURCE,
    external_id: fm.ID,
    name: fm.Name,
    role: fm.Funktion ?? "",
    email: fm.EMail,
    phone: fm.Telefon ?? "",
  };
}

export function mapBuilding(fm: FmBuilding) {
  const lat = num(fm.Breitengrad);
  const lng = num(fm.Laengengrad);
  if (lat == null || lng == null) throw new Error(`Gebäude ${fm.ID}: Koordinaten fehlen`);
  return {
    source: SOURCE,
    external_id: fm.ID,
    name: fm.Bezeichnung || null,
    street: fm.Strasse,
    house_number: fm.Hausnummer ?? "",
    postal_code: fm.PLZ,
    city: fm.Ort || "Hamburg",
    district_slug: slugify(fm.Stadtteil),
    // PostgREST akzeptiert EWKT für geography-Spalten
    location: `SRID=4326;POINT(${lng} ${lat})`,
    location_class: LOCATION_MAP[slugify(fm.Lage)] ?? "peripherie",
    year_built: num(fm.Baujahr),
    year_renovated: num(fm.Modernisiert),
    floors: num(fm.Geschosse),
    features: parseFeatures(fm.Merkmale),
    external_modified_at: iso(fm.Geaendert_am),
    synced_at: new Date().toISOString(),
  };
}

export function mapProperty(fm: FmProperty, refs: { buildingId: string; contactId: string | null }) {
  const usage = TYPE_MAP[slugify(fm.Nutzungsart)];
  if (!usage) throw new Error(`Objekt ${fm.ID}: unbekannte Nutzungsart "${fm.Nutzungsart}"`);
  return {
    source: SOURCE,
    external_id: fm.ID,
    building_id: refs.buildingId,
    contact_id: refs.contactId,
    slug: `${slugify(fm.Titel)}-${slugify(fm.Objektnummer || fm.ID)}`,
    reference_number: fm.Objektnummer || null,
    title: fm.Titel,
    teaser: fm.Kurzbeschreibung ?? "",
    description: fm.Beschreibung ?? "",
    category: usage.category,
    property_type: usage.type,
    status: STATUS_MAP[slugify(fm.Status)] ?? "draft",
    commission_free: bool(fm.Provisionsfrei),
    features: parseFeatures(fm.Merkmale),
    published_at: iso(fm.Veroeffentlicht_am),
    external_modified_at: iso(fm.Geaendert_am),
    synced_at: new Date().toISOString(),
  };
}

export function mapUnit(fm: FmUnit, refs: { propertyId: string }) {
  const area = num(fm.Flaeche_qm);
  if (!area) throw new Error(`Fläche ${fm.ID}: Flächenangabe fehlt`);
  return {
    source: SOURCE,
    external_id: fm.ID,
    property_id: refs.propertyId,
    label: fm.Bezeichnung || "Gesamtfläche",
    floor: num(fm.Etage) ?? 0,
    area_sqm: area,
    rent_per_sqm: num(fm.Miete_qm),
    service_charge_per_sqm: num(fm.NK_qm),
    available_from: date(fm.Verfuegbar_ab),
    rooms: num(fm.Raeume),
    divisible: bool(fm.Teilbar),
    sort_order: num(fm.Sortierung) ?? 0,
    external_modified_at: iso(fm.Geaendert_am),
    synced_at: new Date().toISOString(),
  };
}

export function mapImage(fm: FmImage, refs: { propertyId: string; url: string; storagePath: string; checksum: string }) {
  return {
    source: SOURCE,
    external_id: fm.ID,
    property_id: refs.propertyId,
    url: refs.url,
    storage_path: refs.storagePath,
    alt: fm.Beschreibung ?? "",
    sort_order: num(fm.Sortierung) ?? 0,
    checksum: refs.checksum,
    synced_at: new Date().toISOString(),
  };
}
