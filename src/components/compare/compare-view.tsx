"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  CircleX,
  Euro,
  FileText,
  Hash,
  Heart,
  Landmark,
  Layers,
  MapPin,
  Maximize,
  Navigation,
  Percent,
  Printer,
  Receipt,
  Scale,
  Share2,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useFavorites } from "@/components/favorites/favorites-provider";
import { FEATURE_ICONS } from "@/components/listing/feature-icons";
import { ImageCarousel } from "@/components/listing/image-carousel";
import { ListingImage } from "@/components/listing/listing-image";
import { CompareMap } from "@/components/map/compare-map-lazy";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAX_COMPARE, type FeatureKey } from "@/lib/constants";
import { formatArea, formatRentLabel } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildCompareRows, differingRows, shortCategories, type CompareRow, type CompareRowKey } from "@/lib/compare-rows";
import { listingHref } from "@/lib/urls";

import { toCompareItem, useCompare } from "./compare-provider";
import { searchReturnHref } from "./search-return";

const LETTERS = ["A", "B", "C"];

/** Symbol je Vergleichszeile (Merkmale nutzen dieselben Symbole wie die Ausstattungskacheln) */
function rowIcon(key: CompareRowKey): LucideIcon {
  if (key.startsWith("merkmal-")) return FEATURE_ICONS[key.slice("merkmal-".length) as FeatureKey];
  const icons: Record<string, LucideIcon> = {
    lage: MapPin,
    adresse: Navigation,
    marktgebiet: Landmark,
    objektart: Building2,
    objektnummer: Hash,
    mietflaeche: Maximize,
    flaechen: Layers,
    "miete-qm": Euro,
    "miete-monat": Wallet,
    nebenkosten: Receipt,
    verfuegbarkeit: CalendarDays,
    provision: Percent,
    expose: FileText,
  };
  return icons[key];
}

/** Zelleninhalt: Haken/Kreuz für Merkmale, Link fürs Exposé, sonst der Text */
function cellContent(row: CompareRow, listing: Listing, i: number): React.ReactNode {
  if (row.flags) return <YesNo value={row.flags[i]} />;
  if (row.key === "expose") {
    return listing.exposeUrl ? (
      <a href={listing.exposeUrl} target="_blank" rel="noopener" className="font-medium text-brand underline-offset-4 hover:underline">
        PDF öffnen
      </a>
    ) : null;
  }
  return row.values[i];
}

/** Dauerhaft gültiger Link: FileMaker-Objektnummern statt interner IDs */
const shareHref = (listings: Listing[]) =>
  `/immobilien/vergleich?nr=${listings.map((l) => encodeURIComponent(l.referenceNumber)).join(",")}`;

export function CompareView({ listings, missing = 0 }: { listings: Listing[]; missing?: number }) {
  const router = useRouter();
  const { items, ready, remove, replace } = useCompare();
  const { isFavorite, toggle } = useFavorites();
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  // Rücksprung in die Suche mit allen Filtern (gemerkt beim Klick auf „Jetzt vergleichen“)
  const [backHref, setBackHref] = useState("/immobilien");
  useEffect(() => setBackHref(searchReturnHref()), []);

  // Auswahl an die angezeigten Objekte angleichen (z. B. bei einem geteilten Link)
  const ids = listings.map((l) => l.id).join(",");
  useEffect(() => {
    // erst nach dem Laden der gespeicherten Auswahl, sonst würde diese den Abgleich überschreiben
    if (!ids || !ready) return;
    const shown = ids.split(",");
    if (items.length === shown.length && items.every((i) => shown.includes(i.id))) return;
    replace(listings.map(toCompareItem));
    // nur beim Wechsel der angezeigten Objekte
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, ready]);

  // Adresszeile immer in der teilbaren Form (?nr=…) – auch wenn die Suche mit internen IDs verlinkt hat
  const canonical = shareHref(listings);
  useEffect(() => {
    if (listings.length && window.location.pathname + window.location.search !== canonical) {
      router.replace(canonical, { scroll: false });
    }
  }, [canonical, listings.length, router]);

  const removeListing = (id: string) => {
    remove(id);
    router.replace(shareHref(listings.filter((l) => l.id !== id)), { scroll: false });
  };

  const share = async () => {
    const url = window.location.origin + canonical;
    try {
      // Mobil das Teilen-Menü des Geräts, sonst in die Zwischenablage
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: "Immobilien vergleichen – BüroHamburg", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link zum Vergleich kopiert");
      }
    } catch {
      // Teilen abgebrochen
    }
  };

  // beim ersten Aufruf festhalten – nach dem Umstellen der Adresse (ohne die fehlenden Objekte) ist missing 0
  const [missingAtOpen] = useState(missing);
  const missingNotice =
    missingAtOpen > 0 ? (
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {missingAtOpen === 1 ? "Ein Objekt" : `${missingAtOpen} Objekte`} aus diesem Vergleich {missingAtOpen === 1 ? "ist" : "sind"} nicht mehr
        verfügbar – vermutlich bereits vermietet.
      </p>
    ) : null;

  const saveAll = () => {
    const missing = listings.filter((l) => !isFavorite(l.id));
    for (const l of missing) toggle(l.id);
    toast(missing.length ? `${missing.length} ${missing.length === 1 ? "Objekt" : "Objekte"} zur Merkliste hinzugefügt` : "Alle Objekte sind bereits auf der Merkliste");
  };

  if (listings.length < 2) {
    return (
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <Scale className="size-10 text-brand/60" />
        {missingNotice}
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Mindestens zwei Objekte auswählen</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Wählen Sie in der Trefferliste über das Kästchen oben links auf den Bildern bis zu {MAX_COMPARE} Objekte aus.
        </p>
        <Link href={backHref} className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
          Zur Immobiliensuche
        </Link>
      </main>
    );
  }

  const rows = buildCompareRows(listings);
  const visibleRows = onlyDifferences ? differingRows(rows) : rows;
  const located = listings
    .map((l, i) => ({ listing: l, letter: LETTERS[i] }))
    .filter(({ listing }) => listing.lat != null && listing.lng != null);
  const columns = listings.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-12 sm:px-6 lg:px-8 print:max-w-none print:p-0">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline print:hidden"
      >
        <ArrowLeft className="size-4" />
        Zurück zur Suche
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Immobilien vergleichen</h1>
      <p className="mt-1 text-muted-foreground">
        Vergleichen Sie bis zu {MAX_COMPARE} Gewerbeimmobilien auf einen Blick.
      </p>

      {/* Objektkarten */}
      <ul className={cn("mt-6 grid gap-4", columns)}>
        {listings.map((listing, i) => (
          <li key={listing.id} className="group relative overflow-hidden rounded-xl border bg-card shadow-xs">
            <ImageCarousel
              images={listing.images}
              alt={listing.title}
              maxImages={19}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="aspect-[2/1]"
            >
              <span className="absolute top-3 left-3 flex items-center gap-1.5">
                <Letter>{LETTERS[i]}</Letter>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs leading-none font-medium shadow-sm">
                  {shortCategories(listing)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => removeListing(listing.id)}
                aria-label={`${listing.title} aus dem Vergleich entfernen`}
                className="absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all hover:bg-black/40 print:hidden"
              >
                <X className="size-5" />
              </button>
            </ImageCarousel>
            <div className="px-4 py-3">
              <h2 className="line-clamp-1 font-semibold" title={listing.title}>
                <Link href={listingHref(listing)} target="_blank" rel="noopener" className="hover:text-brand">
                  {listing.title}
                </Link>
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {listing.districtName}, Hamburg
              </p>
              <p className="mt-1.5 flex items-baseline gap-3">
                <span className="font-bold">{formatRentLabel(listing)}</span>
                <span className="text-sm text-muted-foreground">{formatArea(listing.area)}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      {missingNotice}

      {/* Werkzeugleiste */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-xs print:hidden">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          <button
            type="button"
            role="switch"
            aria-checked={onlyDifferences}
            onClick={() => setOnlyDifferences((v) => !v)}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              onlyDifferences ? "bg-brand" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
                onlyDifferences && "translate-x-5",
              )}
            />
          </button>
          Nur Unterschiede anzeigen
        </label>
        {/* Mobil 2 × 2 mit Kurzbeschriftung, ab sm in einer Reihe */}
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <Button variant="outline" size="lg" onClick={saveAll} className="gap-2">
            <Heart className="size-4" />
            <span className="sm:hidden">Merken</span>
            <span className="hidden sm:inline">Alle merken</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}>
              <FileText className="size-4" />
              Exposés
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              {listings.map((listing, i) => (
                <DropdownMenuItem key={listing.id} disabled={!listing.exposeUrl} asChild={Boolean(listing.exposeUrl)}>
                  {listing.exposeUrl ? (
                    <a href={listing.exposeUrl} target="_blank" rel="noopener" className="flex items-center gap-2">
                      <Letter small>{LETTERS[i]}</Letter>
                      <span className="truncate">{listing.title}</span>
                    </a>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Letter small>{LETTERS[i]}</Letter>
                      <span className="truncate">Kein Exposé verfügbar</span>
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="lg" onClick={share} className="gap-2">
            <Share2 className="size-4" />
            <span className="sm:hidden">Teilen</span>
            <span className="hidden sm:inline">Vergleich teilen</span>
          </Button>
          {/* Vergleichs-PDF mit genau der angezeigten Tabelle (inkl. „Nur Unterschiede“), erzeugt von unserem Server */}
          <a
            href={`/api/vergleich/pdf?nr=${encodeURIComponent(listings.map((l) => l.referenceNumber).join(","))}${onlyDifferences ? "&unterschiede=1" : ""}`}
            target="_blank"
            rel="noopener"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            <Printer className="size-4" />
            <span className="sm:hidden">Drucken</span>
            <span className="hidden sm:inline">Vergleich drucken</span>
          </a>
        </div>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px] print:block">
        {/* Vergleichstabelle */}
        <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
          {/* feste Spaltenbreiten: lange Titel werden gekürzt statt die Tabelle zu verbreitern */}
          <table className="w-full min-w-[560px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="w-40 px-4 py-3 text-left font-semibold sm:w-48">
                  Kriterium
                </th>
                {listings.map((listing) => (
                  <th key={listing.id} scope="col" className="border-l px-4 py-3 text-left font-normal">
                    <span className="flex items-center gap-3">
                      <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        <ListingImage
                          src={listing.images[0]?.thumbUrl ?? listing.images[0]?.url}
                          alt=""
                          fill
                          sizes="56px"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{listing.districtName}</span>
                        <span className="block truncate text-xs text-muted-foreground">{listing.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {formatRentLabel(listing)} · {formatArea(listing.area)}
                        </span>
                      </span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.key} className="border-b last:border-b-0">
                  <th scope="row" className="px-4 py-2.5 text-left font-normal text-muted-foreground">
                    <span className="flex items-center gap-2.5">
                      {(() => {
                        const Icon = rowIcon(row.key);
                        return <Icon className="size-4 shrink-0" />;
                      })()}
                      {row.label}
                    </span>
                  </th>
                  {listings.map((listing, i) => (
                    <td
                      key={listing.id}
                      className={cn(
                        "border-l px-4 py-2.5 break-words",
                        row.tones?.[i] === "good" && "bg-emerald-50 font-semibold text-emerald-900",
                        row.tones?.[i] === "bad" && "bg-rose-50 font-semibold text-rose-900",
                      )}
                    >
                      {cellContent(row, listing, i) ?? <span className="text-muted-foreground">–</span>}
                    </td>
                  ))}
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={listings.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                    Keine Unterschiede in den verglichenen Angaben.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Karte mit Standorten */}
        {located.length > 0 && (
          <aside className="overflow-hidden rounded-xl border bg-card shadow-xs print:hidden">
            <div className="h-64">
              <CompareMap
                points={located.map(({ listing, letter }) => ({ label: letter, lat: listing.lat!, lng: listing.lng! }))}
              />
            </div>
            <div className="p-4">
              <h2 className="text-sm font-semibold">Standorte der verglichenen Immobilien</h2>
              <ul className="mt-3 space-y-3">
                {located.map(({ listing, letter }) => (
                  <li key={listing.id} className="flex items-center gap-3">
                    <Letter>{letter}</Letter>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{listing.districtName}</span>
                      <span className="block truncate text-xs text-muted-foreground">{listing.address}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-muted-foreground">
                      {formatRentLabel(listing)}
                      <br />
                      {formatArea(listing.area)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

    </main>
  );
}

/** Ja/Nein als Symbol: grüner Haken bzw. rotes X in gleicher Form */
function YesNo({ value }: { value: boolean }) {
  const Icon = value ? CircleCheck : CircleX;
  return (
    // block statt inline – sonst macht die Text-Grundlinie die Zeile höher als die übrigen
    <span className="flex h-5 items-center">
      <Icon className={cn("size-5", value ? "text-emerald-600" : "text-rose-600")} strokeWidth={2.25} aria-hidden />
      <span className="sr-only">{value ? "Ja" : "Nein"}</span>
    </span>
  );
}

function Letter({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <span
      className={cn(
        // text-white! – Menüeinträge färben beim Hervorheben sonst alle Kindelemente dunkel ein
        "flex shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white!",
        small ? "size-6 text-xs" : "size-8 text-sm",
      )}
    >
      {children}
    </span>
  );
}
