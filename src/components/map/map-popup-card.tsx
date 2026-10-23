import Link from "next/link";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ImageCarousel } from "@/components/listing/image-carousel";
import { formatAreaRange, formatRentLabel } from "@/lib/format";
import type { MapMarker } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Objektvorschau im Kartenpopup – Bildkarussell, Eckdaten und Adresse. */
export function MapPopupCard({
  marker,
  className,
  imageClassName,
}: {
  marker: MapMarker;
  className?: string;
  imageClassName?: string;
}) {
  const facts = [
    formatRentLabel({ rentMin: marker.rentMin, rentMax: null }),
    formatAreaRange(marker.areaMin, marker.areaMax),
    marker.rooms != null ? `${marker.rooms} ${marker.rooms === 1 ? "Raum" : "Räume"}` : null,
  ].filter(Boolean);

  return (
    <article className={cn("group relative w-[300px] bg-white font-sans", className)}>
      <ImageCarousel images={marker.images} alt={marker.title} sizes="340px" className={imageClassName}>
        <FavoriteButton listingId={marker.id} className="absolute top-3 right-3 z-10" />
      </ImageCarousel>
      <div className="px-3.5 pt-3 pb-3.5">
        <p className="flex flex-wrap gap-x-3 text-[15px] font-bold text-foreground">
          {facts.map((fact) => (
            <span key={fact}>{fact}</span>
          ))}
        </p>
        <h3 className="mt-0.5 truncate text-[13px] font-medium text-foreground/80">
          <Link href={`/immobilien/${marker.slug}`} className="after:absolute after:inset-0">
            {marker.title}
          </Link>
        </h3>
        <p className="truncate text-[13px] text-muted-foreground">
          {marker.address.replace(/, \d{5} Hamburg$/, "")}, {marker.districtName}
        </p>
      </div>
    </article>
  );
}
