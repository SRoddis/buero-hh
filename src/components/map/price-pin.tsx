import { CATEGORY_COLORS, type PropertyCategory } from "@/lib/constants";
import { formatRentShort } from "@/lib/format";
import type { MapMarker } from "@/lib/types";

/** Hervorgehobener Marker: Preis-Label in der Farbe der Objektart anstelle des Punkts. */
export function PricePin({
  marker,
  category,
  selected,
}: {
  marker: MapMarker;
  /** Angezeigte Objektart – dieselbe Farbe wie der Punkt auf der Karte */
  category: PropertyCategory;
  selected: boolean;
}) {
  const color = CATEGORY_COLORS[category];
  return (
    <div
      className="pointer-events-none flex items-center rounded-full border-2 border-white px-2.5 py-1 font-sans text-[13px] leading-none font-bold whitespace-nowrap text-white"
      style={{
        backgroundColor: color,
        // ausgewählt: zusätzlicher Ring in der Objektart-Farbe
        boxShadow: `0 4px 14px rgb(0 0 0 / 0.3)${selected ? `, 0 0 0 5px ${color}40` : ""}`,
        filter: selected ? "brightness(0.88)" : undefined,
      }}
    >
      {formatRentShort(marker)}
    </div>
  );
}
