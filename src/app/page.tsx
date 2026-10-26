import { ArrowRight, Building2, ChevronRight, FileText, MapPin, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FeaturedCard } from "@/components/home/featured-card";
import { CompanyContact, CompanyImprint } from "@/components/layout/company-imprint";
import { LegalLink } from "@/components/layout/legal-dialog";
import { LegalLinks } from "@/components/layout/legal-links";
import { LocationMap } from "@/components/map/location-map-lazy";
import { buttonVariants } from "@/components/ui/button";
import { COMPANY, COMPANY_ADDRESS } from "@/lib/company";
import { getRepository } from "@/lib/data/repository";
import { formatRoundedCount } from "@/lib/format";
import { DEFAULT_FILTERS, filtersToHref } from "@/lib/search/params";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Gewerbeimmobilien in Hamburg mieten | BüroHamburg.de" },
};

/** Startseite nach jedem Sync aktuell halten (Top-Objekte und Anzahlen ändern sich höchstens alle 10 Minuten) */
export const revalidate = 600;

const roundedCount = formatRoundedCount;

export default async function HomePage() {
  const repository = await getRepository();
  const [featured, { total, byCategory: counts }] = await Promise.all([
    repository.getFeatured(4),
    repository.countListings(),
  ]);

  // gleiche Breite wie Kopfzeile und Suche
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-[1.75rem]">
          {roundedCount(total)} Gewerbeimmobilien in Hamburg. Willkommen.
        </h1>
        <p className="mt-1 text-muted-foreground">
          Büroflächen, Praxisflächen, Ladenlokale und Gastroflächen – in den besten Lagen der Hansestadt.
        </p>
      </header>

      {featured.length > 0 && (
        <section aria-label="Ausgewählte Immobilien" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((listing) => (
            <FeaturedCard key={listing.id} listing={listing} />
          ))}
        </section>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Link
          href={filtersToHref({ ...DEFAULT_FILTERS, category: "buero-praxis" })}
          className={cn(buttonVariants({ size: "lg" }), "h-12 gap-3 rounded-lg text-sm font-semibold tracking-wide uppercase")}
        >
          <Building2 className="size-5" />
          {roundedCount(counts["buero-praxis"])} Büro- und Praxisflächen
          <ChevronRight className="size-5" />
        </Link>
        <Link
          href={filtersToHref({ ...DEFAULT_FILTERS, category: "laden-gastro" })}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 gap-3 rounded-lg border-brand/40 bg-brand-light/50 text-sm font-semibold tracking-wide text-brand uppercase hover:bg-brand-light hover:text-brand",
          )}
        >
          <Store className="size-5" />
          {roundedCount(counts["laden-gastro"])} Laden- und Gastroflächen
          <ChevronRight className="size-5" />
        </Link>
      </div>

      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <section id="kontakt" className="rounded-xl border bg-card p-5 shadow-xs sm:p-6">
          <h2 className="border-b pb-3 text-lg font-semibold">Kontakt</h2>
          <CompanyContact className="mt-4" />
          <LegalLinks className="mt-4 border-y py-3 text-muted-foreground" />
          <CompanyImprint className="mt-4 text-xs text-muted-foreground [&_.font-semibold]:text-foreground" />
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-xs sm:p-6">
          <h2 className="text-lg font-semibold">Anfahrt</h2>
          <div className="mt-3 h-52 overflow-hidden rounded-lg border">
            {/* herausgezoomt, damit Stadtteile zur Orientierung sichtbar sind */}
            <LocationMap lat={COMPANY.location.lat} lng={COMPANY.location.lng} zoom={12} />
          </div>
          <div className="mt-4 flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="font-semibold">{COMPANY_ADDRESS}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{COMPANY.transit}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 border-t pt-4">
            <FileText className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="font-semibold">AGB</p>
              <LegalLink
                doc="agb"
                className="mt-0.5 inline-flex cursor-pointer items-center gap-1.5 text-left text-sm text-muted-foreground hover:text-brand"
              >
                Lesen Sie unsere allgemeinen Geschäftsbedingungen
                <ArrowRight className="size-3.5" />
              </LegalLink>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
