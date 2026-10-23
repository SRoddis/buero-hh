import { formatRent } from "@/lib/format";
import type { MapMarker } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Hervorgehobener Marker: Preis-Label im Corporate Design anstelle des Punkts. */
export function PricePin({ marker, selected }: { marker: MapMarker; selected: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none flex items-center rounded-full border-2 border-white bg-brand px-2.5 py-1 font-sans text-[13px] leading-none font-bold whitespace-nowrap text-white shadow-[0_4px_14px_rgb(0_0_0/0.3)]",
        selected && "bg-brand-dark ring-4 ring-brand/25",
      )}
    >
      {marker.rentMin != null ? (
        <>
          {formatRent(marker.rentMin)}
          <span className="ml-0.5 text-[11px] font-semibold opacity-85">/m²</span>
        </>
      ) : (
        "auf Anfrage"
      )}
    </div>
  );
}
