import { PAGE_SIZE } from "@/lib/constants";
import type { ListingSummary, MapMarker, SearchFilters, SearchResult } from "@/lib/types";

/**
 * In-Memory-Implementierung der Suche (für Mock-Daten).
 * Die Semantik entspricht der SQL-Funktion `search_properties` in supabase/migrations.
 */
export function matchesFilters(listing: ListingSummary, f: SearchFilters): boolean {
  if (f.districts.length && !f.districts.includes(listing.districtSlug)) return false;
  if (f.category && !listing.categories.includes(f.category)) return false;
  if (f.marketArea && listing.marketArea !== f.marketArea) return false;

  // Flächen: angebotene Fläche plus weitere Flächen im Objekt müssen den gesuchten Bereich berühren
  const searchMin = Math.min(listing.area, listing.areaRangeMin ?? listing.area);
  const searchMax = Math.max(listing.area, listing.areaRangeMax ?? listing.area);
  if (f.areaMin != null && searchMax < f.areaMin) return false;
  if (f.areaMax != null && searchMin > f.areaMax) return false;

  // Miete pro m²: Objekte „auf Anfrage“ werden bei gesetztem Preisfilter ausgeblendet
  if (f.rentMin != null || f.rentMax != null) {
    if (listing.rentPerSqm == null) return false;
    if (f.rentMin != null && listing.rentPerSqm < f.rentMin) return false;
    if (f.rentMax != null && listing.rentPerSqm > f.rentMax) return false;
  }

  if (f.features.length && !f.features.every((feature) => listing.features.includes(feature))) {
    return false;
  }

  if (f.bbox) {
    if (listing.lat == null || listing.lng == null) return false;
    const [w, s, e, n] = f.bbox;
    if (listing.lng < w || listing.lng > e || listing.lat < s || listing.lat > n) return false;
  }

  return true;
}

/** Objektnummer als Zahl – höhere Nummern sind neuere Objekte */
const referenceSort = (l: ListingSummary) => Number(l.referenceNumber.replace(/\D/g, "")) || 0;

export function sortListings(listings: ListingSummary[], sort: SearchFilters["sort"]) {
  const sorted = [...listings];
  const rent = (l: ListingSummary) => l.rentPerSqm ?? Number.POSITIVE_INFINITY;
  switch (sort) {
    case "neueste":
      return sorted.sort((a, b) => referenceSort(b) - referenceSort(a));
    case "miete-asc":
      return sorted.sort((a, b) => rent(a) - rent(b));
    case "miete-desc":
      return sorted.sort((a, b) => (b.rentPerSqm ?? -1) - (a.rentPerSqm ?? -1));
    case "flaeche-asc":
      return sorted.sort((a, b) => a.area - b.area);
    case "flaeche-desc":
      return sorted.sort((a, b) => b.area - a.area);
    default:
      // Relevanz: hervorgehobene Objekte zuerst, danach die neuesten
      return sorted.sort(
        (a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || referenceSort(b) - referenceSort(a),
      );
  }
}

export function toMarker(l: ListingSummary): MapMarker | null {
  if (l.lat == null || l.lng == null) return null;
  return {
    id: l.id,
    slug: l.slug,
    title: l.title,
    category: l.category,
    categories: l.categories,
    type: l.type,
    lat: l.lat,
    lng: l.lng,
    area: l.area,
    rentPerSqm: l.rentPerSqm,
    rentTotalMonthly: l.rentTotalMonthly,
    priceType: l.priceType,
    address: l.address,
    districtName: l.districtName,
    images: l.images.slice(0, 5),
  };
}

export function searchInMemory(all: ListingSummary[], filters: SearchFilters): SearchResult {
  const matches = sortListings(
    all.filter((l) => matchesFilters(l, filters)),
    filters.sort,
  );
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  return {
    items: matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: matches.length,
    page,
    pageCount,
    markers: matches.map(toMarker).filter((m): m is MapMarker => m !== null),
  };
}
