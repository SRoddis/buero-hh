"use client";

import { ArrowRight, Layers, MapPin, MapPinned, Ruler } from "lucide-react";
import Link from "next/link";
import { forwardRef } from "react";

import { CompareCheckbox } from "@/components/compare/compare-checkbox";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { marketAreaLabel } from "@/lib/constants";
import { formatArea, formatFurtherAreas, formatRentLabel, formatRentPerSqmHint } from "@/lib/format";
import type { ListingSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ImageCarousel } from "./image-carousel";
import { ListingBadges } from "./listing-badges";

interface ListingCardProps {
  listing: ListingSummary;
  highlighted?: boolean;
  onHoverChange?: (id: string | null) => void;
  /** Zeigt einen Button, der das Objekt auf der Karte anzeigt (nur in der Suche mit Karte) */
  onShowOnMap?: () => void;
  /** Auswahlkästchen für den Objektvergleich (nur in der Suche) */
  compare?: boolean;
  priority?: boolean;
  className?: string;
}

export const ListingCard = forwardRef<HTMLElement, ListingCardProps>(function ListingCard(
  { listing, highlighted, onHoverChange, onShowOnMap, compare, priority, className },
  ref,
) {
  const furtherAreas = formatFurtherAreas(listing);

  return (
    <article
      ref={ref}
      data-swipe-area
      onMouseEnter={() => onHoverChange?.(listing.id)}
      onMouseLeave={() => onHoverChange?.(null)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        highlighted && "border-brand/60 shadow-lg ring-2 ring-brand/40",
        className,
      )}
    >
      <ImageCarousel
        images={listing.images}
        alt={listing.title}
        priority={priority}
        sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw"
      >
        <ListingBadges categories={listing.categories} features={listing.features} className="absolute bottom-3 left-3" />
        {compare && <CompareCheckbox listing={listing} className="absolute top-3 left-3 z-10" />}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          {onShowOnMap && listing.lat != null && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShowOnMap();
              }}
              aria-label="Auf der Karte anzeigen"
              title="Auf der Karte anzeigen"
              className="inline-flex size-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all hover:bg-black/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <MapPin className="size-5" strokeWidth={2} />
            </button>
          )}
          <FavoriteButton listingId={listing.id} />
        </div>
      </ImageCarousel>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
            <Link href={`/immobilien/${listing.slug}`} target="_blank" rel="noopener" className="after:absolute after:inset-0">
              {listing.title}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{listing.districtName}, Hamburg</span>
          </p>
        </div>

        <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <Fact icon={Ruler} label="Mietfläche">
            {formatArea(listing.area)}
          </Fact>
          {furtherAreas && (
            <Fact icon={Layers} label="Weitere Flächen im Objekt">
              im Objekt {furtherAreas}
            </Fact>
          )}
          <Fact icon={MapPinned} label="Lage">
            {marketAreaLabel(listing.marketArea)}
          </Fact>
        </dl>

        <div className="mt-auto flex items-end justify-between pt-1">
          <p className="text-lg font-bold text-foreground">
            {formatRentLabel(listing)}
            <span className="block text-xs font-normal text-muted-foreground">
              {[formatRentPerSqmHint(listing), listing.priceNote].filter(Boolean).join(" · ")}
            </span>
          </p>
          <ArrowRight className="size-5 text-brand transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
});

function Fact({ icon: Icon, label, children }: { icon: typeof Ruler; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="sr-only">{label}</dt>
      <Icon className="size-4 shrink-0" aria-hidden />
      <dd>{children}</dd>
    </div>
  );
}

