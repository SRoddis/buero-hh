/**
 * Überführt die gescrapten Rohdaten von buerohamburg.de (data/scrape/buerohamburg.json)
 * in das Domänenmodell der App. Grundlage für den Seed (Supabase) und die Mock-Daten.
 *
 * Die eigentliche Feldzuordnung steckt in supabase/functions/_shared/buerohamburg.ts und wird
 * auch vom laufenden Sync (Edge Function) verwendet – Schlüssel und Werte sind dadurch identisch.
 */
import type { FeatureKey, MarketArea } from "../../src/lib/constants";
import { DEFAULT_CONTACT } from "../../src/lib/data/contact";
import type { District, Listing } from "../../src/lib/types";
import { normalize, type BhRaw } from "../../supabase/functions/_shared/buerohamburg";

export { slugify } from "../../supabase/functions/_shared/buerohamburg";

export interface ScrapedObject {
  detail: BhRaw;
  images: string[];
  pdf: { url: string; exists: boolean };
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

  for (const { detail, images, pdf } of objects) {
    const o = normalize(detail);
    if (!o.marketArea) {
      console.warn(`Objekt ${o.referenceNumber}: unbekannte Lage „${detail.webs_lage}“ – übersprungen`);
      continue;
    }
    const marketArea = o.marketArea;

    // Statistik für Stadtteil-Stammdaten
    const names = districtNames.get(o.districtSlug) ?? new Map<string, number>();
    names.set(o.districtName, (names.get(o.districtName) ?? 0) + 1);
    districtNames.set(o.districtSlug, names);
    const areas = districtAreas.get(o.districtSlug) ?? new Map<MarketArea, number>();
    areas.set(marketArea, (areas.get(marketArea) ?? 0) + 1);
    districtAreas.set(o.districtSlug, areas);
    if (o.lat != null && o.lng != null) {
      districtCoords.set(o.districtSlug, [...(districtCoords.get(o.districtSlug) ?? []), [o.lng, o.lat]]);
    }

    const id = `bh-${o.referenceNumber}`;
    const features = (o.commissionFree ? ["provisionsfrei", ...o.features] : o.features) as FeatureKey[];

    listings.push({
      id,
      slug: o.slug,
      referenceNumber: o.referenceNumber,
      title: o.title,
      teaser: o.teaser,
      description: o.description,
      category: o.category,
      categories: o.categories,
      type: o.propertyType,
      districtSlug: o.districtSlug,
      districtName: o.districtName, // wird unten auf die einheitliche Schreibweise gesetzt
      marketArea,
      address: `${[o.street, o.houseNumber].filter(Boolean).join(" ")}, ${o.postalCode} ${o.city}`,
      lat: o.lat,
      lng: o.lng,
      area: o.area,
      areaRangeMin: o.areaRangeMin,
      areaRangeMax: o.areaRangeMax,
      rentPerSqm: o.rentPerSqm,
      rentTotalMonthly: o.rentTotalMonthly,
      priceType: o.priceType,
      priceNote: o.priceNote,
      commissionFree: o.commissionFree,
      commissionMonths: o.commissionMonths,
      commissionNote: o.commissionNote,
      features,
      images: images.map((url, i) => ({ id: `${id}-i${i + 1}`, url, alt: `${o.title} – Bild ${i + 1}` })),
      featuredRank: o.featuredRank,
      exposeUrl: pdf.exists ? pdf.url : null,
      building: {
        id: o.buildingKey,
        name: null,
        street: o.street,
        houseNumber: o.houseNumber,
        postalCode: o.postalCode,
        city: o.city,
        features: [],
      },
      units: [
        {
          id: `${id}-u1`,
          label: "Mietfläche",
          floor: null,
          areaSqm: o.area,
          rentPerSqm: o.rentPerSqm,
          rentTotalMonthly: o.rentTotalMonthly,
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
