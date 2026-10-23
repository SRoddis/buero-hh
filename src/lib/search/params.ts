import {
  FEATURE_KEYS,
  LOCATION_CLASSES,
  PROPERTY_CATEGORIES,
  PROPERTY_TYPE_KEYS,
  SORT_OPTIONS,
  type FeatureKey,
  type LocationClass,
  type PropertyCategory,
  type PropertyType,
  type SortKey,
} from "@/lib/constants";
import type { SearchFilters } from "@/lib/types";

/**
 * Abbildung der Suchfilter auf sprechende, deutschsprachige URL-Parameter, z. B.
 * /immobilien?stadtteil=hafencity,altstadt&typ=buero&flaeche_von=200&ausstattung=provisionsfrei
 */
export const PARAM_KEYS = {
  districts: "stadtteil",
  category: "objektart",
  types: "typ",
  locationClass: "lage",
  areaMin: "flaeche_von",
  areaMax: "flaeche_bis",
  rentMin: "miete_von",
  rentMax: "miete_bis",
  features: "ausstattung",
  sort: "sortierung",
  page: "seite",
  bbox: "karte",
} as const satisfies Record<keyof SearchFilters, string>;

export const DEFAULT_FILTERS: SearchFilters = {
  districts: [],
  category: null,
  types: [],
  locationClass: null,
  areaMin: null,
  areaMax: null,
  rentMin: null,
  rentMax: null,
  features: [],
  sort: "relevanz",
  page: 1,
  bbox: null,
};

type RawParams = URLSearchParams | Record<string, string | string[] | undefined>;

function read(params: RawParams, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | undefined) {
  return value ? value.split(",").map((v) => v.trim()).filter(Boolean) : [];
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | null {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function positiveNumber(value: string | undefined) {
  if (!value) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseBbox(value: string | undefined): SearchFilters["bbox"] {
  const parts = list(value).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [w, s, e, n] = parts;
  return w < e && s < n ? [w, s, e, n] : null;
}

export function parseSearchParams(params: RawParams): SearchFilters {
  const category = oneOf<PropertyCategory>(
    read(params, PARAM_KEYS.category),
    PROPERTY_CATEGORIES.map((c) => c.value),
  );
  const page = Math.max(1, Math.floor(positiveNumber(read(params, PARAM_KEYS.page)) ?? 1));

  return {
    districts: list(read(params, PARAM_KEYS.districts)),
    category,
    types: list(read(params, PARAM_KEYS.types)).filter((t): t is PropertyType =>
      (PROPERTY_TYPE_KEYS as string[]).includes(t),
    ),
    locationClass: oneOf<LocationClass>(
      read(params, PARAM_KEYS.locationClass),
      LOCATION_CLASSES.map((l) => l.value),
    ),
    areaMin: positiveNumber(read(params, PARAM_KEYS.areaMin)),
    areaMax: positiveNumber(read(params, PARAM_KEYS.areaMax)),
    rentMin: positiveNumber(read(params, PARAM_KEYS.rentMin)),
    rentMax: positiveNumber(read(params, PARAM_KEYS.rentMax)),
    features: list(read(params, PARAM_KEYS.features)).filter((f): f is FeatureKey =>
      (FEATURE_KEYS as string[]).includes(f),
    ),
    sort: oneOf<SortKey>(read(params, PARAM_KEYS.sort), SORT_OPTIONS.map((s) => s.value)) ?? "relevanz",
    page,
    bbox: parseBbox(read(params, PARAM_KEYS.bbox)),
  };
}

/** Serialisiert nur Werte, die vom Standard abweichen – so bleiben URLs kurz und teilbar. */
export function serializeFilters(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined && value !== "") params.set(key, String(value));
  };

  set(PARAM_KEYS.districts, filters.districts.join(","));
  set(PARAM_KEYS.category, filters.category);
  set(PARAM_KEYS.types, filters.types.join(","));
  set(PARAM_KEYS.locationClass, filters.locationClass);
  set(PARAM_KEYS.areaMin, filters.areaMin);
  set(PARAM_KEYS.areaMax, filters.areaMax);
  set(PARAM_KEYS.rentMin, filters.rentMin);
  set(PARAM_KEYS.rentMax, filters.rentMax);
  set(PARAM_KEYS.features, filters.features.join(","));
  if (filters.sort !== DEFAULT_FILTERS.sort) set(PARAM_KEYS.sort, filters.sort);
  if (filters.page > 1) set(PARAM_KEYS.page, filters.page);
  if (filters.bbox) set(PARAM_KEYS.bbox, filters.bbox.map((n) => n.toFixed(4)).join(","));

  return params;
}

export function filtersToHref(filters: SearchFilters, pathname = "/immobilien") {
  const qs = serializeFilters(filters).toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Anzahl aktiver Filter (ohne Sortierung, Seite und Kartenausschnitt) – für Badges an Filter-Buttons. */
export function countActiveFilters(filters: SearchFilters) {
  return (
    filters.districts.length +
    (filters.category ? 1 : 0) +
    filters.types.length +
    (filters.locationClass ? 1 : 0) +
    (filters.areaMin != null || filters.areaMax != null ? 1 : 0) +
    (filters.rentMin != null || filters.rentMax != null ? 1 : 0) +
    filters.features.length
  );
}

/** Schlüssel der inhaltlichen Filter (ohne Seite, Sortierung, Kartenausschnitt) – steuert das Zoomen der Karte. */
export function contentFilterKey(f: SearchFilters) {
  return JSON.stringify([
    f.districts,
    f.category,
    f.types,
    f.locationClass,
    f.areaMin,
    f.areaMax,
    f.rentMin,
    f.rentMax,
    f.features,
  ]);
}
