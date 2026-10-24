/**
 * Zuordnung der Objektdaten von buerohamburg.de (FileMaker-Felder webs_…, web_suchKrit…) auf unser
 * Datenmodell. Reines TypeScript ohne Abhängigkeiten – wird von der Edge Function (Deno) und den
 * Node-Skripten (Seed, Scrape) gemeinsam genutzt, damit Schlüssel und Werte überall identisch sind.
 */

export const BH_BASE = "https://www.buerohamburg.de";

/** Liste aller Objekte – ohne objektart/lage-Filter liefert die API nichts, ungültige Werte → 400 */
export const BH_SEARCH_URL =
  `${BH_BASE}/api/objects/search?objektart=B%C3%BCro&objektart=Laden&lage=HH-Nord&lage=HH-Alster` +
  "&lage=HH-West&lage=HH-City&lage=HH-City-S%C3%BCd&lage=HH-Ost&lage=HH-S%C3%BCd";

export const bhDetailUrl = (nr: string) => `${BH_BASE}/api/objects/${encodeURIComponent(nr)}`;
export const bhImageUrl = (nr: string, index: number) =>
  `${BH_BASE}/objects/images/${encodeURIComponent(nr)}/${String(index).padStart(2, "0")}_webBig.jpg`;
export const bhPdfUrl = (nr: string) => `${BH_BASE}/objects/pdf/BHI_${encodeURIComponent(nr)}.pdf`;
/** Die Website prüft Bilder 01–19 fortlaufend bis zur ersten Lücke */
export const BH_MAX_IMAGES = 19;

export type BhRaw = Record<string, string | number | null | undefined>;

export type Category = "buero-praxis" | "laden-gastro" | "lager-logistik";
export type MarketArea = "hh-city" | "hh-city-sued" | "hh-alster" | "hh-west" | "hh-nord" | "hh-ost" | "hh-sued";

const MARKET_AREAS = new Set<MarketArea>(["hh-city", "hh-city-sued", "hh-alster", "hh-west", "hh-nord", "hh-ost", "hh-sued"]);
const TYPE_BY_CATEGORY: Record<Category, "buero" | "laden" | "lager"> = {
  "buero-praxis": "buero",
  "laden-gastro": "laden",
  "lager-logistik": "lager",
};
const CATEGORY_BY_OBJEKTART: Record<string, Category> = {
  "buero/praxis": "buero-praxis",
  laden: "laden-gastro",
  "halle/lager/prod.": "lager-logistik",
};
/** FileMaker-Suchkriterien → Merkmal-Schlüssel des Frontends (src/lib/constants.ts) */
export const FEATURE_BY_CRITERION: Record<string, string> = {
  web_suchKrit01: "balkon-terrasse",
  web_suchKrit02: "barrierefrei",
  web_suchKrit03: "personenaufzug",
  web_suchKrit04: "lastenaufzug",
  web_suchKrit05: "erdgeschoss",
  web_suchKrit06: "neubau",
  web_suchKrit07: "stellplaetze",
  web_suchKrit08: "wasserblick",
};
/** Courtage-Codes: bc = courtagefrei, no = courtagefrei bei fester Laufzeit, Zahl = Monatsmieten */
const COMMISSION_FREE_CODES = new Set(["bc", "no"]);

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

export const cleanText = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();

/** Deutsche Zahl: „1.200“ → 1200, „22,5“ → 22.5 */
export function germanNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const match = cleanText(value).match(/\d[\d.]*(?:,\d+)?/);
  if (!match) return null;
  const n = Number(match[0].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function coordinate(value: unknown) {
  const n = Number(cleanText(value));
  return cleanText(value) && Number.isFinite(n) && n !== 0 ? n : null;
}

export function teaserOf(description: string, max = 180) {
  if (description.length <= max) return description;
  const cut = description.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))} …`;
}

export function categoriesOf(objektart: unknown): Category[] {
  const categories = String(objektart ?? "")
    .split(/[\r\n]+/)
    .map((part) => CATEGORY_BY_OBJEKTART[cleanText(part).toLowerCase().replace(/ü/g, "ue")])
    .filter((c): c is Category => Boolean(c));
  return categories.length ? [...new Set(categories)] : ["buero-praxis"];
}

/** null bei unbekannter Lage (z. B. wenn BüroHamburg eine neue einführt) */
export function marketAreaOf(lage: unknown): MarketArea | null {
  const slug = slugify(cleanText(lage)) as MarketArea;
  return MARKET_AREAS.has(slug) ? slug : null;
}

/** Fester Gebäudeschlüssel: gleiche Adresse = gleiches Gebäude */
export const buildingKeyOf = (street: string, houseNumber: string, postalCode: string) =>
  `${slugify(street)}-${slugify(houseNumber)}-${postalCode}`;

/** Normalisiertes Objekt – Grundlage für Datenbankzeilen (Edge Function) und Domänenobjekte (Seed) */
export interface BhObject {
  referenceNumber: string;
  title: string;
  slug: string;
  description: string;
  teaser: string;
  categories: Category[];
  category: Category;
  propertyType: "buero" | "laden" | "lager";
  districtName: string;
  districtSlug: string;
  marketArea: MarketArea | null;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  buildingKey: string;
  lat: number | null;
  lng: number | null;
  area: number;
  areaRangeMin: number | null;
  areaRangeMax: number | null;
  priceType: "qm" | "monat";
  rentPerSqm: number | null;
  rentTotalMonthly: number | null;
  priceNote: string | null;
  commissionFree: boolean;
  commissionMonths: number | null;
  commissionNote: string | null;
  /** Merkmale aus den Suchkriterien (ohne „provisionsfrei“, das ergibt sich aus der Courtage) */
  features: string[];
  featuredRank: number | null;
}

export function normalize(d: BhRaw): BhObject {
  const referenceNumber = cleanText(d.webs_objektnr);
  const title = cleanText(d.webs_objekttitel);
  const description = String(d.webs_beschreibung ?? "").trim();
  const districtName = cleanText(d.webs_stadtteil);
  const street = cleanText(d.webs_strasse);
  const houseNumber = cleanText(d.webs_hausnummer);
  const postalCode = cleanText(d.webs_plz);
  const categories = categoriesOf(d.webs_objektart);
  const priceType = cleanText(d.webs_preisart).toLowerCase() === "monat" ? "monat" : "qm";
  const commissionCode = cleanText(d.webs_court_text).toLowerCase();
  const commissionFree = COMMISSION_FREE_CODES.has(commissionCode);
  const isSet = (v: unknown) => v === 1 || v === "1";

  return {
    referenceNumber,
    title,
    slug: `${slugify(title)}-${slugify(referenceNumber)}`,
    description,
    teaser: teaserOf(description),
    categories,
    category: categories[0],
    propertyType: TYPE_BY_CATEGORY[categories[0]],
    districtName,
    districtSlug: slugify(districtName),
    marketArea: marketAreaOf(d.webs_lage),
    street,
    houseNumber,
    postalCode,
    city: cleanText(d.webs_ort) || "Hamburg",
    buildingKey: buildingKeyOf(street, houseNumber, postalCode),
    lat: coordinate(d.webs_lat),
    lng: coordinate(d.webs_lng),
    area: germanNumber(d.webs_mietflaeche) ?? 0,
    areaRangeMin: germanNumber(d.webs_mietflaeche_von),
    areaRangeMax: germanNumber(d.webs_mietflaeche_bis),
    priceType,
    rentPerSqm: germanNumber(d.webs_mietFormel),
    rentTotalMonthly: priceType === "monat" ? germanNumber(d.webs_miete) : null,
    priceNote: cleanText(d.webs_mwst) || null,
    commissionFree,
    commissionMonths: commissionFree ? null : germanNumber(commissionCode),
    commissionNote: cleanText(d.webs_court) || null,
    features: Object.entries(FEATURE_BY_CRITERION)
      .filter(([field]) => isSet(d[field]))
      .map(([, feature]) => feature),
    featuredRank: germanNumber(d.webs_home),
  };
}

/**
 * Stabiler Hash eines API-Datensatzes (Schlüssel sortiert, flüchtige Felder ausgenommen).
 * Ändert sich der Hash, hat sich am Objekt etwas geändert.
 */
const VOLATILE_FIELDS = new Set(["recordId"]);

export async function hashRecord(record: BhRaw): Promise<string> {
  const canonical = JSON.stringify(
    Object.keys(record)
      .filter((k) => !VOLATILE_FIELDS.has(k))
      .sort()
      .map((k) => [k, record[k]]),
  );
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
