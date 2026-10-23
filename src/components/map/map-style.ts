import type { ExpressionSpecification } from "maplibre-gl";

import { CATEGORY_COLORS } from "@/lib/constants";
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

export function toFeatureCollection(markers: MapMarker[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: markers.map((m) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [m.lng, m.lat] },
      properties: { id: m.id, category: m.category },
    })),
  };
}
