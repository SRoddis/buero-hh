import type { ExpressionSpecification } from "maplibre-gl";

import { CATEGORY_COLORS, type PropertyCategory } from "@/lib/constants";
import type { MapMarker } from "@/lib/types";

/** Kostenloser Vektor-Kartenstil ohne API-Key; per Umgebungsvariable austauschbar (z. B. MapTiler). */
export const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/positron";

export const WORKER_URL = "/vendor/maplibre-gl-worker.mjs";

export const BRAND = CATEGORY_COLORS["buero-praxis"];

export const CATEGORY_COLOR_EXPRESSION: ExpressionSpecification = [
  "match",
  ["get", "category"],
  ...Object.entries(CATEGORY_COLORS).flat(),
  BRAND,
] as unknown as ExpressionSpecification;

/**
 * Angezeigte Objektart (Farbe von Punkt und Preis-Pin): bei aktivem Objektart-Filter dessen Farbe –
 * gemischte Objekte wie „Büro/Praxis + Halle/Lager“ erscheinen dann z. B. gold –, sonst die Hauptobjektart.
 */
export function displayCategory(marker: MapMarker, colorCategory: PropertyCategory | null): PropertyCategory {
  return colorCategory && marker.categories.includes(colorCategory) ? colorCategory : marker.category;
}

export function toFeatureCollection(
  markers: MapMarker[],
  colorCategory: PropertyCategory | null = null,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: markers.map((m) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [m.lng, m.lat] },
      properties: {
        id: m.id,
        category: displayCategory(m, colorCategory),
      },
    })),
  };
}
