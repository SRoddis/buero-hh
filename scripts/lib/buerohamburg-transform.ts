/**
 * Überführt die gescrapten Rohdaten von buerohamburg.de (data/scrape/buerohamburg.json)
 * in das Domänenmodell der App. Grundlage für seed.sql (Supabase) und die Mock-Daten.
 *
 * Die Feldnamen (webs_…, web_suchKrit…) entsprechen den FileMaker-Feldern – dieselbe
 * Zuordnung gilt später für den FileMaker-Sync (services/filemaker-sync/src/mapping.ts).
 */
import type { FeatureKey, MarketArea, PropertyCategory } from "../../src/lib/constants";
import { PROPERTY_CATEGORIES } from "../../src/lib/constants";
import { DEFAULT_CONTACT } from "../../src/lib/data/contact";
import type { District, Listing } from "../../src/lib/types";

type Raw = Record<string, string | number | null | undefined>;

export interface ScrapedObject {
  detail: Raw;
  images: string[];
  pdf: { url: string; exists: boolean };
}

const CATEGORY_BY_OBJEKTART: Record<string, PropertyCategory> = {
  "buero/praxis": "buero-praxis",
  laden: "laden-gastro",
  "halle/lager/prod.": "lager-logistik",
};

const FEATURE_BY_CRITERION: Record<string, FeatureKey> = {
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

const text = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();

/** Deutsche Zahl: „1.200“ → 1200, „22,5“ → 22.5 */
function germanNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const match = text(value).match(/\d[\d.]*(?:,\d+)?/);
  if (!match) return null;
  const n = Number(match[0].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const coordinate = (value: unknown) => {
  const n = Number(text(value));
  return text(value) && Number.isFinite(n) && n !== 0 ? n : null;
};

const isSet = (value: unknown) => value === 1 || value === "1";

function teaserOf(description: string, max = 180) {
  if (description.length <= max) return description;
  const cut = description.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))} …`;
}

function categoriesOf(objektart: unknown): PropertyCategory[] {
  const categories = String(objektart ?? "")
    .split(/[\r\n]+/)
    .map((part) => CATEGORY_BY_OBJEKTART[text(part).toLowerCase().replace(/ü/g, "ue")])
    .filter((c): c is PropertyCategory => Boolean(c));
  return categories.length ? [...new Set(categories)] : ["buero-praxis"];
}

function marketAreaOf(lage: unknown): MarketArea {
  return slugify(text(lage)) as MarketArea;
}

export interface TransformResult {
  listings: Listing[];
  districts: District[];
}

export function transform(objects: ScrapedObject[]): TransformResult {
  const listings: Listing[] = [];
  const districtNames = new Map<string, Map<string, number>>();
  const districtAreas = new Map<string, Map<MarketArea, number>>();
  const districtCoords = new Map<string, [number, number][]>();

  for (const { detail: d, images, pdf } of objects) {
    const nr = text(d.webs_objektnr);
    const title = text(d.webs_objekttitel);
    const description = String(d.webs_beschreibung ?? "").trim();
    const districtName = text(d.webs_stadtteil);
    const districtSlug = slugify(districtName);
    const marketArea = marketAreaOf(d.webs_lage);
    const lat = coordinate(d.webs_lat);
    const lng = coordinate(d.webs_lng);
    const street = text(d.webs_strasse);
    const houseNumber = text(d.webs_hausnummer);
    const postalCode = text(d.webs_plz);
    const city = text(d.webs_ort) || "Hamburg";
    const categories = categoriesOf(d.webs_objektart);
    const category = categories[0];
    const priceType = text(d.webs_preisart).toLowerCase() === "monat" ? "monat" : "qm";
    const commissionCode = text(d.webs_court_text).toLowerCase();
    const commissionFree = COMMISSION_FREE_CODES.has(commissionCode);
    const features = Object.entries(FEATURE_BY_CRITERION)
      .filter(([field]) => isSet(d[field]))
      .map(([, feature]) => feature);
    if (commissionFree) features.unshift("provisionsfrei");

    // Statistik für Stadtteil-Stammdaten
    const names = districtNames.get(districtSlug) ?? new Map<string, number>();
    names.set(districtName, (names.get(districtName) ?? 0) + 1);
    districtNames.set(districtSlug, names);
    const areas = districtAreas.get(districtSlug) ?? new Map<MarketArea, number>();
    areas.set(marketArea, (areas.get(marketArea) ?? 0) + 1);
    districtAreas.set(districtSlug, areas);
    if (lat != null && lng != null) districtCoords.set(districtSlug, [...(districtCoords.get(districtSlug) ?? []), [lng, lat]]);

    const area = germanNumber(d.webs_mietflaeche) ?? 0;
    const rentPerSqm = germanNumber(d.webs_mietFormel);
    const rentTotalMonthly = priceType === "monat" ? germanNumber(d.webs_miete) : null;
    const id = `bh-${nr}`;

    listings.push({
      id,
      slug: `${slugify(title)}-${slugify(nr)}`,
      referenceNumber: nr,
      title,
      teaser: teaserOf(description),
      description,
      category,
      categories,
      type: PROPERTY_CATEGORIES.find((c) => c.value === category)!.type,
      districtSlug,
      districtName, // wird unten auf die einheitliche Schreibweise gesetzt
      marketArea,
      address: `${[street, houseNumber].filter(Boolean).join(" ")}, ${postalCode} ${city}`,
      lat,
      lng,
      area,
      areaRangeMin: germanNumber(d.webs_mietflaeche_von),
      areaRangeMax: germanNumber(d.webs_mietflaeche_bis),
      rentPerSqm,
      rentTotalMonthly,
      priceType,
      priceNote: text(d.webs_mwst) || null,
      commissionFree,
      commissionMonths: commissionFree ? null : germanNumber(commissionCode),
      commissionNote: text(d.webs_court) || null,
      features,
      images: images.map((url, i) => ({ id: `${id}-i${i + 1}`, url, alt: `${title} – Bild ${i + 1}` })),
      featuredRank: germanNumber(d.webs_home),
      exposeUrl: pdf.exists ? pdf.url : null,
      building: {
        id: `${slugify(street)}-${slugify(houseNumber)}-${postalCode}`,
        name: null,
        street,
        houseNumber,
        postalCode,
        city,
        features: [],
      },
      units: [
        {
          id: `${id}-u1`,
          label: "Mietfläche",
          floor: null,
          areaSqm: area,
          rentPerSqm,
          rentTotalMonthly,
          serviceChargePerSqm: null,
          availableFrom: null,
          rooms: null,
          divisible: false,
        },
      ],
      contact: DEFAULT_CONTACT,
    });
  }

  const mostCommon = <T>(counts: Map<T, number>) => [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const districts: District[] = [...districtNames.keys()].map((slug) => {
    const coords = districtCoords.get(slug) ?? [];
    return {
      slug,
      name: mostCommon(districtNames.get(slug)!),
      marketArea: mostCommon(districtAreas.get(slug)!),
      center: coords.length
        ? [coords.reduce((s, c) => s + c[0], 0) / coords.length, coords.reduce((s, c) => s + c[1], 0) / coords.length]
        : null,
    };
  });

  // Einheitliche Stadtteil-Schreibweise (z. B. „Groß Borstel“ statt „Groß-Borstel“)
  const nameBySlug = new Map(districts.map((d) => [d.slug, d.name]));
  // Fehlende Koordinaten von anderen Objekten an derselben Adresse übernehmen
  const coordsByBuilding = new Map<string, [number, number]>();
  for (const l of listings) if (l.lat != null && l.lng != null) coordsByBuilding.set(l.building.id, [l.lat, l.lng]);
  for (const listing of listings) {
    listing.districtName = nameBySlug.get(listing.districtSlug)!;
    const coords = coordsByBuilding.get(listing.building.id);
    if (coords && (listing.lat == null || listing.lng == null)) [listing.lat, listing.lng] = coords;
  }

  return { listings, districts: districts.sort((a, b) => a.name.localeCompare(b.name, "de")) };
}
