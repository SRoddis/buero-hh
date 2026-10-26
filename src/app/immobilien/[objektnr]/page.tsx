import { ChevronRight, FileText, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
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
import { categoryLabel, FEATURES, marketAreaLabel } from "@/lib/constants";
import { getRepository } from "@/lib/data/repository";
import {
  formatArea,
  formatCommission,
  formatFurtherAreas,
  formatRentLabel,
  formatRentPerSqmHint,
} from "@/lib/format";
import { DEFAULT_FILTERS, filtersToHref } from "@/lib/search/params";
import { listingHref, REFERENCE_NUMBER } from "@/lib/urls";

/** /immobilien/<Objektnummer>, z. B. /immobilien/097 */
type Params = Promise<{ objektnr: string }>;

/** Dedupliziert den Abruf zwischen generateMetadata und der Seite. */
const getListing = cache(async (referenceNumber: string) =>
  REFERENCE_NUMBER.test(referenceNumber) ? (await getRepository()).getByReferenceNumber(referenceNumber) : null,
);

/**
 * Frühere Adressen (/immobilien/<titel>-<objektnummer>) dauerhaft auf die neue Form umleiten,
 * damit geteilte Links und Suchmaschinen-Einträge weiter funktionieren.
 */
function redirectLegacySlug(param: string) {
  const legacy = /-(\d+)$/.exec(decodeURIComponent(param));
  if (legacy) permanentRedirect(listingHref({ referenceNumber: legacy[1] }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const listing = await getListing((await params).objektnr);
  if (!listing) return { title: "Objekt nicht gefunden" };
  return {
    title: `${listing.title} – ${listing.districtName}`,
    description: listing.teaser,
    alternates: { canonical: listingHref(listing) },
    openGraph: { images: listing.images[0] ? [listing.images[0].url] : [] },
  };
}

export default async function ListingDetailPage({ params }: { params: Params }) {
  const { objektnr } = await params;
  if (!REFERENCE_NUMBER.test(objektnr)) redirectLegacySlug(objektnr);
  const listing = await getListing(objektnr);
  if (!listing) notFound();

  const similar = await (await getRepository()).getSimilar(listing, 3);
  const { building } = listing;

  const furtherAreas = formatFurtherAreas(listing);

  const facts = [
    { label: "Mietfläche", value: formatArea(listing.area), hint: furtherAreas ? `weitere Flächen: ${furtherAreas}` : undefined },
    {
      label: listing.priceType === "monat" ? "Miete pauschal" : "Miete",
      value: formatRentLabel(listing),
      hint: formatRentPerSqmHint(listing) ?? undefined,
    },
    { label: "Nebenkosten", value: listing.priceNote ?? "auf Anfrage" },
    { label: "Courtage", value: formatCommission(listing) },
    { label: "Lage", value: marketAreaLabel(listing.marketArea), hint: listing.districtName },
  ];

  const objectData = [
    ["Objekt-Nr.", listing.referenceNumber],
    ["Objektart", listing.categories.map(categoryLabel).join(", ")],
    ["Lage", marketAreaLabel(listing.marketArea)],
    ["Stadtteil", listing.districtName],
    ["Adresse", [building.street, building.houseNumber].filter(Boolean).join(" ")],
    ["Weitere Flächen im Objekt", furtherAreas],
  ].filter(([, value]) => value != null && value !== "") as [string, string][];

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
                <ListingBadges categories={listing.categories} features={listing.features} max={3} className="[&>span]:border [&>span]:shadow-none" />
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

            {listing.features.length > 0 && (
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
            )}

            {listing.units.length > 1 && (
              <Section title={`Mietflächen (${listing.units.length})`}>
                <UnitsTable units={listing.units} />
              </Section>
            )}

            {listing.commissionNote && (
              <p className="-mt-4 rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">{listing.commissionNote}</p>
            )}

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
                {listing.lat != null && listing.lng != null && (
                  <div className="h-72 sm:h-80">
                    <LocationMap lat={listing.lat} lng={listing.lng} />
                  </div>
                )}
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
                  {[formatRentPerSqmHint(listing), listing.priceNote].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatArea(listing.area)} · {listing.districtName}
                </p>
                {listing.exposeUrl && (
                  <Button asChild variant="outline" className="mt-4 h-10 w-full gap-2">
                    <a href={listing.exposeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="size-4" />
                      Exposé als PDF
                    </a>
                  </Button>
                )}
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
          <p className="truncate text-xs text-muted-foreground">{formatArea(listing.area)}</p>
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
