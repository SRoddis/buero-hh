import { Building2, ChevronRight, Euro, MapPin, Maximize, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ImageCarousel } from "@/components/listing/image-carousel";
import { marketAreaLabel, PROPERTY_CATEGORIES } from "@/lib/constants";
import { formatNumber, formatRent } from "@/lib/format";
import type { ListingSummary } from "@/lib/types";
import { listingHref } from "@/lib/urls";

/** „16,90 € pro qm monatlich“ bzw. „1.350,00 € pro Monat“ – Formulierung wie auf buerohamburg.de */
function priceText(listing: ListingSummary) {
  if (listing.priceType === "monat" && listing.rentTotalMonthly != null) return `${formatRent(listing.rentTotalMonthly)} pro Monat`;
  return listing.rentPerSqm != null ? `${formatRent(listing.rentPerSqm)} pro qm monatlich` : "auf Anfrage";
}

/** Top-Objekt auf der Startseite: Bild, Titel und Eckdaten als kompakte Liste */
export function FeaturedCard({ listing }: { listing: ListingSummary }) {
  const facts: [LucideIcon, string, string][] = [
    [MapPin, "Lage", marketAreaLabel(listing.marketArea)],
    [Building2, "Stadtteil", listing.districtName],
    [Maximize, "Größe", `ca. ${formatNumber(listing.area)} m²`],
    [Euro, "Preis", priceText(listing)],
  ];

  return (
    <article data-swipe-area className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-2 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Bild mit Innenabstand und eigenen Rundungen wie auf buerohamburg.de; Wischen/Pfeile wie in der Trefferliste */}
      <ImageCarousel
        images={listing.images}
        alt={listing.title}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[2/1] rounded-lg"
      >
        <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs leading-none font-medium shadow-sm">
          {PROPERTY_CATEGORIES.find((c) => c.value === listing.category)?.short}
        </span>
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton listingId={listing.id} />
        </div>
      </ImageCarousel>

      <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
        <h3 className="flex items-start justify-between gap-3 text-[15px] leading-snug font-semibold">
          <Link href={listingHref(listing)} className="line-clamp-2 after:absolute after:inset-0">
            {listing.title}
          </Link>
          <ChevronRight className="mt-0.5 size-5 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
        </h3>
        <dl className="mt-3 space-y-1 text-[13px]">
          {facts.map(([Icon, label, value]) => (
            <div key={label} className="grid grid-cols-[1rem_4.5rem_1fr] items-start gap-x-2">
              <Icon className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
              <dt className="text-muted-foreground">{label}:</dt>
              <dd className="leading-snug">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
