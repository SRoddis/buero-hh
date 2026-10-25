import { MapPin, X } from "lucide-react";
import Link from "next/link";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ImageCarousel } from "@/components/listing/image-carousel";
import { formatArea, formatRentLabel } from "@/lib/format";
import type { MapMarker } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Oberer Teil der Kartenpopups (Einzelobjekt und mehrere Angebote): Bildkarussell mit Herz und X,
 * darunter Miete · Fläche, Titel und Adresse. Bild und Text bilden eine gemeinsame Klickfläche
 * (Link-Overlay); Herz, X und Bildpfeile liegen darüber.
 */
export function MapListingPreview({
  marker,
  onClose,
  compact = false,
}: {
  marker: MapMarker;
  onClose: () => void;
  /** Mobil: flacheres Bild, damit der Ort darüber sichtbar bleibt */
  compact?: boolean;
}) {
  const street = marker.address.split(",")[0];

  return (
    <div className="group relative" data-swipe-area>
      <ImageCarousel
        // key: beim Wechsel des Angebots wieder beim ersten Bild beginnen
        key={marker.id}
        images={marker.images}
        alt={marker.title}
        sizes="340px"
        maxImages={19}
        className={compact ? "aspect-[2/1]" : undefined}
      >
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          {/* gleicher Stil wie auf den Listenkarten */}
          <FavoriteButton listingId={marker.id} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="inline-flex size-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all hover:bg-black/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <X className="size-5" />
          </button>
        </div>
      </ImageCarousel>

      <Link
        href={`/immobilien/${marker.slug}`}
        target="_blank"
        rel="noopener"
        className="block px-4 pt-3 pb-3 after:absolute after:inset-0"
      >
        <p className="flex flex-wrap gap-x-3 text-[17px] font-bold text-foreground">
          <span>{formatRentLabel(marker)}</span>
          <span>{formatArea(marker.area)}</span>
        </p>
        <h3 className="mt-0.5 truncate text-sm font-medium text-foreground">{marker.title}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {street}, {marker.districtName}
          </span>
        </p>
      </Link>
    </div>
  );
}

/** Objektvorschau im Kartenpopup für ein einzelnes Objekt. */
export function MapPopupCard({
  marker,
  onClose,
  compact = false,
  className,
}: {
  marker: MapMarker;
  onClose: () => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <article className={cn("w-[320px] bg-white pb-1 font-sans", className)}>
      <MapListingPreview marker={marker} onClose={onClose} compact={compact} />
    </article>
  );
}
