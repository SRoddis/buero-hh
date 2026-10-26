"use client";

import { ArrowRight, Maximize, X } from "lucide-react";
import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPANY } from "@/lib/company";
import type { RentalRequest } from "@/lib/data/rental-requests";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "standard", label: "Standard" },
  { value: "flaeche-auf", label: "Fläche aufsteigend" },
  { value: "flaeche-ab", label: "Fläche absteigend" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

/** Flächenstufen für den Filter – angezeigt werden nur Stufen, in die mindestens ein Gesuch fällt */
const AREA_BANDS = [
  { value: "bis-300", label: "bis 300 m²", min: 0, max: 300 },
  { value: "300-500", label: "300 – 500 m²", min: 300, max: 500 },
  { value: "500-1000", label: "500 – 1.000 m²", min: 500, max: 1000 },
  { value: "ab-1000", label: "ab 1.000 m²", min: 1000, max: Infinity },
] as const;
type AreaBand = (typeof AREA_BANDS)[number];

/** Gesuch passt zur Stufe, wenn sich seine Flächenspanne mit der Stufe überschneidet */
function inBand(request: RentalRequest, band: AreaBand) {
  if (request.areaMin == null && request.areaMax == null) return false;
  const min = request.areaMin ?? request.areaMax!;
  const max = request.areaMax ?? request.areaMin!;
  // „ab 1.000 m²“ schließt die Grenze ein (ein Gesuch „bis ca. 1.000 m²“ passt zu 1.000 m²);
  // zwischen den übrigen Stufen zählt nur echte Überschneidung, damit Gesuche nicht doppelt erscheinen
  if (band.max === Infinity) return max >= band.min;
  return min < band.max && max > band.min;
}

/**
 * Mietgesuche mit Filtern für Vermieter: Lage, „passt zu meiner Fläche“ und Sortierung nach Fläche.
 * Alles im Browser – es sind nur wenige Gesuche.
 */
export function RequestList({ requests }: { requests: RentalRequest[] }) {
  const [areaBand, setAreaBand] = useState<AreaBand["value"] | null>(null);
  const [marketArea, setMarketArea] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("standard");

  const marketAreas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of requests) if (r.marketArea) counts.set(r.marketArea, (counts.get(r.marketArea) ?? 0) + 1);
    return [...counts].sort(([a], [b]) => a.localeCompare(b, "de"));
  }, [requests]);

  const bands = useMemo(
    () =>
      AREA_BANDS.map((b) => ({ ...b, count: requests.filter((r) => inBand(r, b)).length })).filter((b) => b.count > 0),
    [requests],
  );
  const band = AREA_BANDS.find((b) => b.value === areaBand) ?? null;

  const visible = useMemo(() => {
    const list = requests.filter((r) => {
      if (marketArea && r.marketArea !== marketArea) return false;
      return !band || inBand(r, band);
    });
    if (sort === "standard") return list;
    const dir = sort === "flaeche-auf" ? 1 : -1;
    return [...list].sort((a, b) => ((a.area ?? 0) - (b.area ?? 0)) * dir);
  }, [requests, marketArea, band, sort]);

  const filtered = marketArea !== null || band !== null;
  const reset = () => {
    setMarketArea(null);
    setAreaBand(null);
  };
  const noun = (n: number) => (n === 1 ? "Gesuch" : "Gesuche");

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border bg-card p-3 shadow-xs sm:p-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lage">
          <Chip active={marketArea === null} onClick={() => setMarketArea(null)} count={requests.length}>
            Alle
          </Chip>
          {marketAreas.map(([value, count]) => (
            <Chip key={value} active={marketArea === value} onClick={() => setMarketArea(value)} count={count}>
              {value}
            </Chip>
          ))}
        </div>

        {bands.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ihre Fläche</span>
            <Select
              value={areaBand ?? "alle"}
              onValueChange={(v) => setAreaBand(v === "alle" ? null : (v as AreaBand["value"]))}
            >
              <SelectTrigger className="h-9! min-w-48 bg-white" aria-label="Ihre Fläche">
                <Maximize className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectItem value="alle">Alle Flächen</SelectItem>
                {bands.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-sm text-muted-foreground">Sortieren nach</span>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-9! min-w-44 bg-white" aria-label="Sortierung">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {SORTS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visible.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {visible.map((request) => (
            <RequestCard key={request.title + request.marketArea} request={request} />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed bg-white px-6 py-10 text-center">
          <p className="font-semibold">Kein aktuelles Gesuch passt zu Ihrer Auswahl.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Unser Kundenstamm ist größer als dieser Auszug – sprechen Sie uns zu Ihrer Fläche gerne direkt an.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}>
              <X className="size-4" />
              Filter zurücksetzen
            </button>
            <a href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Fläche zur Vermietung")}`} className={buttonVariants()}>
              Fläche anbieten
            </a>
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        {filtered
          ? `${visible.length} von ${requests.length} Gesuchen ${visible.length === 1 ? "passt" : "passen"} zu Ihrer Auswahl.`
          : `Es wurden insgesamt ${requests.length} ${noun(requests.length)} gefunden.`}
      </p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
        active
          ? "border-brand bg-brand text-white hover:bg-brand-dark"
          : "border-border bg-secondary/60 text-foreground hover:border-foreground/25 hover:bg-secondary",
      )}
    >
      {children}
      <span className={cn("text-xs tabular-nums", active ? "text-white/80" : "text-muted-foreground")}>{count}</span>
    </button>
  );
}

/** „Angebot senden“ – E-Mail an BüroHamburg mit Gesuch und Ansprechpartner im Betreff (wie auf der bisherigen Website) */
const offerMailto = (request: RentalRequest) =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(
    `Angebot zu ${request.title}${request.contactPerson ? ` / Ansprechpartner: ${request.contactPerson}` : ""}`,
  )}`;

/** „ab ca. 280 qm“ → „ab ca. 280 m²“ – Einheit wie im Rest der Seite */
const qmToSqm = (value: string) => value.replace(/\bqm\b/g, "m²");

function RequestCard({ request }: { request: RentalRequest }) {
  const facts: [string, React.ReactNode][] = [
    ["Lage", <span key="lage" className="font-semibold">{request.marketArea}</span>],
    [
      "Mietfläche",
      <span key="flaeche">
        {request.area != null && <span className="block font-semibold">ca. {formatNumber(request.area)} m²</span>}
        {request.areaFrom && <span className="block text-muted-foreground">{qmToSqm(request.areaFrom)}</span>}
        {request.areaTo && <span className="block text-muted-foreground">{qmToSqm(request.areaTo)}</span>}
      </span>,
    ],
    ...(request.moveIn ? ([["Bezug", request.moveIn]] as [string, React.ReactNode][]) : []),
    ...(request.contactPerson ? ([["Ansprechpartner", request.contactPerson]] as [string, React.ReactNode][]) : []),
  ];

  return (
    <li className="grid gap-5 rounded-xl border bg-card p-5 shadow-xs lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)_auto] lg:gap-6">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold">{request.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-foreground/80">{request.description}</p>
      </div>
      <dl className="grid grid-cols-[8.5rem_1fr] content-start gap-x-4 gap-y-1.5 border-t pt-4 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        {facts.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}:</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="lg:pt-0.5">
        <a
          href={offerMailto(request)}
          className={cn(buttonVariants({ size: "lg" }), "w-full gap-2 rounded-lg whitespace-nowrap lg:w-auto")}
        >
          Angebot senden
          <ArrowRight className="size-4" />
        </a>
      </div>
    </li>
  );
}
