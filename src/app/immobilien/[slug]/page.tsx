import { ChevronRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ContactForm } from "@/components/detail/contact-form";
import { ImageGallery } from "@/components/detail/image-gallery";
import { ShareButton } from "@/components/detail/share-button";
import { UnitsTable } from "@/components/detail/units-table";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { FEATURE_ICONS } from "@/components/listing/feature-icons";
import { ListingBadges } from "@/components/listing/listing-badges";
import { ListingCard } from "@/components/listing/listing-card";
import { LocationMap } from "@/components/map/location-map-lazy";
import { Button } from "@/components/ui/button";
import { categoryLabel, FEATURES, locationClassLabel, PROPERTY_TYPES } from "@/lib/constants";
import { getRepository } from "@/lib/data/repository";
import {
  formatAreaRange,
  formatAvailability,
  formatDate,
  formatFloorRange,
  formatRent,
  formatRentLabel,
} from "@/lib/format";
import { DEFAULT_FILTERS, filtersToHref } from "@/lib/search/params";

type Params = Promise<{ slug: string }>;

/** Dedupliziert den Abruf zwischen generateMetadata und der Seite. */
const getListing = cache(async (slug: string) => (await getRepository()).getBySlug(slug));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const listing = await getListing((await params).slug);
  if (!listing) return { title: "Objekt nicht gefunden" };
  return {
    title: `${listing.title} – ${listing.districtName}`,
    description: listing.teaser,
    openGraph: { images: listing.images[0] ? [listing.images[0].url] : [] },
  };
}

export default async function ListingDetailPage({ params }: { params: Params }) {
  const listing = await getListing((await params).slug);
  if (!listing) notFound();

  const similar = await (await getRepository()).getSimilar(listing, 3);
  const { building } = listing;

  const facts = [
    { label: "Mietfläche", value: formatAreaRange(listing.areaMin, listing.areaMax) },
    {
      label: "Miete",
      value: formatRentLabel(listing),
      hint: listing.rentMin != null ? "netto kalt zzgl. NK" : undefined,
    },
    { label: "Etage", value: formatFloorRange(listing.floorMin, listing.floorMax) },
    { label: "Verfügbar", value: formatAvailability(listing.availableFrom) },
    { label: "Provision", value: listing.commissionFree ? "provisionsfrei" : "nach Vereinbarung" },
  ];

  const objectData = [
    ["Objekt-Nr.", listing.id.toUpperCase()],
    ["Objektart", categoryLabel(listing.category)],
    ["Nutzung", PROPERTY_TYPES[listing.type].plural],
    ["Lage", locationClassLabel(listing.locationClass)],
    ["Gebäude", building.name],
    ["Baujahr", building.yearBuilt],
    ["Modernisierung", building.yearRenovated],
    ["Geschosse", building.floors],
    ["Online seit", formatDate(listing.publishedAt)],
  ].filter(([, value]) => value != null) as [string, string | number][];

  return (
    <main className="pb-24 lg:pb-12">
      <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <nav aria-label="Brotkrumen" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/immobilien" className="hover:text-brand">
            Immobilien suchen
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href={filtersToHref({ ...DEFAULT_FILTERS, districts: [listing.districtSlug] })} className="hover:text-brand">
            {listing.districtName}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="truncate text-foreground">{listing.title}</span>
        </nav>

        <ImageGallery images={listing.images} title={listing.title} />

        <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-10">
            <header className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <ListingBadges type={listing.type} features={listing.features} max={3} className="[&>span]:border [&>span]:shadow-none" />
                <div className="flex shrink-0 gap-2">
                  <ShareButton title={listing.title} />
                  <FavoriteButton listingId={listing.id} variant="outline" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{listing.title}</h1>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-brand" />
                {listing.address} · {listing.districtName}
              </p>
            </header>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3 xl:grid-cols-5">
              {facts.map((fact) => (
                <div key={fact.label} className="bg-white p-4">
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{fact.label}</dt>
                  <dd className="mt-1 text-base font-semibold">{fact.value}</dd>
                  {fact.hint && <dd className="text-xs text-muted-foreground">{fact.hint}</dd>}
                </div>
              ))}
            </dl>

            <Section title="Beschreibung">
              <div className="space-y-4 leading-relaxed text-foreground/85">
                {listing.description.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </Section>

            <Section title="Ausstattung & Eigenschaften">
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {listing.features.map((feature) => {
                  const Icon = FEATURE_ICONS[feature];
                  return (
                    <li key={feature} className="flex items-center gap-3 rounded-lg border bg-white px-3.5 py-3 text-sm">
                      <span className="flex size-8 items-center justify-center rounded-md bg-brand-light text-brand">
                        <Icon className="size-4" />
                      </span>
                      {FEATURES[feature]}
                    </li>
                  );
                })}
              </ul>
            </Section>

            <Section title={listing.units.length > 1 ? `Mietflächen (${listing.units.length})` : "Mietfläche"}>
              <UnitsTable units={listing.units} />
              {listing.rentMin != null && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Alle Mietpreise netto kalt zzgl. Nebenkosten und gesetzlicher Umsatzsteuer. Ab{" "}
                  {formatRent(listing.rentMin)} / m².
                </p>
              )}
            </Section>

            <Section title="Objektdaten">
              <dl className="grid gap-x-8 rounded-xl border bg-white px-5 py-2 sm:grid-cols-2">
                {objectData.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b py-2.5 text-sm last:border-0 sm:[&:nth-last-child(2)]:border-0">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section title="Lage">
              <div className="overflow-hidden rounded-xl border bg-white">
                <div className="h-72 sm:h-80">
                  <LocationMap lat={listing.lat} lng={listing.lng} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-brand" />
                    {listing.address}
                  </span>
                  <Link
                    href={filtersToHref({ ...DEFAULT_FILTERS, districts: [listing.districtSlug] })}
                    className="font-medium text-brand hover:underline"
                  >
                    Weitere Objekte in {listing.districtName}
                  </Link>
                </div>
              </div>
            </Section>
          </div>

          <aside id="kontakt" className="scroll-mt-4">
            <div className="space-y-4 lg:sticky lg:top-6">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">Mietpreis</p>
                <p className="text-2xl font-bold">{formatRentLabel(listing)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatAreaRange(listing.areaMin, listing.areaMax)} · {listing.districtName}
                </p>
              </div>
              <ContactForm propertyId={listing.id} title={listing.title} contact={listing.contact} />
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold tracking-tight">Ähnliche Objekte</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobil: Kontakt immer erreichbar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t bg-white px-4 py-3 shadow-[0_-4px_20px_rgb(0_0_0/0.08)] lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-base font-bold">{formatRentLabel(listing)}</p>
          <p className="truncate text-xs text-muted-foreground">{formatAreaRange(listing.areaMin, listing.areaMax)}</p>
        </div>
        <Button asChild size="lg" className="h-11 px-6">
          <a href="#kontakt">Jetzt anfragen</a>
        </Button>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
