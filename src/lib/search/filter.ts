import { PAGE_SIZE } from "@/lib/constants";
import type { ListingSummary, MapMarker, SearchFilters, SearchResult } from "@/lib/types";

/**
 * In-Memory-Implementierung der Suche (für Mock-Daten).
 * Die Semantik entspricht der SQL-Funktion `search_properties` in supabase/migrations.
 */
export function matchesFilters(listing: ListingSummary, f: SearchFilters): boolean {
  if (f.districts.length && !f.districts.includes(listing.districtSlug)) return false;
  if (f.category && listing.category !== f.category) return false;
  if (f.types.length && !f.types.includes(listing.type)) return false;
  if (f.locationClass && listing.locationClass !== f.locationClass) return false;

  // Flächen: Überschneidung des gesuchten Bereichs mit der Spanne der Mietflächen
  if (f.areaMin != null && listing.areaMax < f.areaMin) return false;
  if (f.areaMax != null && listing.areaMin > f.areaMax) return false;

  // Miete: Objekte "auf Anfrage" werden bei gesetztem Preisfilter ausgeblendet
  if (f.rentMin != null || f.rentMax != null) {
    if (listing.rentMin == null) return false;
    if (f.rentMin != null && (listing.rentMax ?? listing.rentMin) < f.rentMin) return false;
    if (f.rentMax != null && listing.rentMin > f.rentMax) return false;
  }

  if (f.features.length && !f.features.every((feature) => listing.features.includes(feature))) {
    return false;
  }

  if (f.bbox) {
    const [w, s, e, n] = f.bbox;
    if (listing.lng < w || listing.lng > e || listing.lat < s || listing.lat > n) return false;
  }

  return true;
}

export function sortListings(listings: ListingSummary[], sort: SearchFilters["sort"]) {
  const sorted = [...listings];
  const rent = (l: ListingSummary) => l.rentMin ?? Number.POSITIVE_INFINITY;
  switch (sort) {
    case "neueste":
      return sorted.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    case "miete-asc":
      return sorted.sort((a, b) => rent(a) - rent(b));
    case "miete-desc":
      return sorted.sort((a, b) => (b.rentMin ?? -1) - (a.rentMin ?? -1));
    case "flaeche-asc":
      return sorted.sort((a, b) => a.areaMin - b.areaMin);
    case "flaeche-desc":
      return sorted.sort((a, b) => b.areaMax - a.areaMax);
    default:
      // Relevanz: Objekte mit Bildern, Preisangabe und neuerem Datum zuerst
      return sorted.sort((a, b) => relevance(b) - relevance(a));
  }
}

function relevance(l: ListingSummary) {
  const ageDays = (Date.now() - new Date(l.publishedAt).getTime()) / 86_400_000;
  return (l.rentMin != null ? 2 : 0) + Math.min(l.images.length, 4) * 0.5 + Math.max(0, 30 - ageDays) / 10;
}

export function toMarker(l: ListingSummary): MapMarker {
  return {
    id: l.id,
    slug: l.slug,
    title: l.title,
    category: l.category,
    type: l.type,
    lat: l.lat,
    lng: l.lng,
    areaMin: l.areaMin,
    areaMax: l.areaMax,
    rentMin: l.rentMin,
    rooms: l.rooms,
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
    markers: matches.map(toMarker),
  };
}
