"use client";

import { ChevronLeft, ChevronRight, List, Map as MapIcon, SearchX } from "lucide-react";
import { useRef, useState } from "react";

import { ListingCard } from "@/components/listing/listing-card";
import { ListingsMap } from "@/components/map/listings-map-lazy";
import { Button } from "@/components/ui/button";
import type { SearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Pagination } from "./pagination";
import { ResultsHeader, type ResultsView } from "./results-header";
import { SearchBar } from "./search-bar";
import { useSearch } from "./search-context";

/** Kartengröße in der geteilten Ansicht (Desktop): 0 = ausgeblendet, 1 = normal, 2 = groß */
type MapSize = 0 | 1 | 2;

const GRID_COLUMNS: Record<MapSize, string> = {
  0: "lg:grid-cols-1",
  1: "lg:grid-cols-[minmax(0,1fr)_minmax(420px,44vw)]",
  2: "lg:grid-cols-[minmax(360px,1fr)_minmax(0,64vw)]",
};

/** Mobil/Tablet feste Spalten, ab Desktop so viele Spalten (mind. 340 px breit), wie in die Listenspalte passen */
const CARD_COLUMNS = "sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]";

/**
 * Orchestriert Suchleiste, Trefferliste und Karte.
 * Hover und Auswahl werden zwischen Liste und Karte synchronisiert.
 */
export function SearchView({ result, fitKey }: { result: SearchResult; fitKey: string }) {
  const { filters, update, reset, isPending } = useSearch();
  const [view, setView] = useState<ResultsView>("liste");
  const [mapSize, setMapSize] = useState<MapSize>(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Bewusst kein automatisches Scrollen zur Listenkarte bei Auswahl auf der Karte: Das würde die
  // Seite und damit die Karte unter dem Mauszeiger verschieben, sodass der nächste Klick daneben geht.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listRef = useRef<HTMLElement>(null);

  const changePage = (page: number) => {
    update({ page });
    // Desktop: Liste scrollt in ihrer eigenen Spalte · Mobil: ganze Seite
    if (window.matchMedia("(min-width: 1024px)").matches) listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById("ergebnisse")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    // Desktop: App-Layout in Bildschirmhöhe (abzüglich Seitenheader h-16), damit die Karte immer
    // vollständig sichtbar ist und die Liste in ihrer eigenen Spalte scrollt
    <div className="flex flex-1 flex-col lg:h-[calc(100dvh-4rem)] lg:flex-none">
      <div className="mx-auto w-full max-w-[1600px] shrink-0 px-4 pt-3 sm:px-6 lg:px-8 lg:pt-4">
        <SearchBar total={result.total} />
      </div>

      {/* Kopfzeile in beiden Ansichten über die volle Breite – Bedienelemente bleiben immer oben rechts */}
      <div className="shrink-0 px-4 pt-4 sm:px-6 lg:px-8">
        <ResultsHeader total={result.total} view={view} onViewChange={setView} />
      </div>

      <div
        id="ergebnisse"
        className={cn(
          "grid flex-1 scroll-mt-2 gap-x-6 gap-y-4 pt-4 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]",
          view === "liste" && GRID_COLUMNS[mapSize],
        )}
      >
        <section
          ref={listRef}
          aria-label="Suchergebnisse"
          className={cn(
            "min-w-0 px-4 pb-24 sm:px-6 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pb-6 lg:pl-8",
            mapSize === 0 ? "lg:pr-8" : "lg:pr-2",
            view === "karte" && "hidden lg:hidden",
          )}
        >
          <div className="space-y-5">
            {result.items.length === 0 ? (
              <EmptyState hasBbox={filters.bbox !== null} onReset={reset} onClearBbox={() => update({ bbox: null })} />
            ) : (
              <div
                className={cn(
                  "grid gap-5 transition-opacity",
                  CARD_COLUMNS,
                  isPending && "pointer-events-none opacity-60",
                )}
              >
                {result.items.map((listing, i) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    priority={i < 2}
                    highlighted={listing.id === hoveredId || listing.id === selectedId}
                    onHoverChange={setHoveredId}
                  />
                ))}
              </div>
            )}

            <Pagination page={result.page} pageCount={result.pageCount} onPageChange={changePage} />
          </div>
        </section>

        <div
          className={cn(
            "relative",
            view === "liste"
              ? cn("hidden lg:h-full", mapSize > 0 && "lg:block")
              : "block px-4 pb-24 sm:px-6 lg:min-h-0 lg:px-8 lg:pb-6",
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden",
              view === "liste" ? "h-full" : "h-[calc(100dvh-4.5rem)] rounded-xl border shadow-sm lg:h-full",
            )}
          >
            <ListingsMap
              markers={result.markers}
              hoveredId={hoveredId}
              selectedId={selectedId}
              onHover={setHoveredId}
              onSelect={setSelectedId}
              bbox={filters.bbox}
              onBboxChange={(bbox) => update({ bbox })}
              fitKey={fitKey}
              colorCategory={filters.category}
            />
            {view === "liste" && <MapSizeControls size={mapSize} onChange={setMapSize} />}
          </div>
        </div>
      </div>

      {/* Desktop: ausgeblendete Karte wieder einblenden */}
      {view === "liste" && mapSize === 0 && (
        <button
          type="button"
          onClick={() => setMapSize(1)}
          className="fixed top-1/2 right-0 z-30 hidden -translate-y-1/2 items-center gap-2 rounded-l-xl border border-r-0 bg-white py-3 pr-4 pl-3 text-sm font-medium shadow-lg transition-colors hover:bg-muted lg:flex"
          aria-label="Karte einblenden"
        >
          <ChevronLeft className="size-4" />
          <MapIcon className="size-4 text-brand" />
          Karte
        </button>
      )}

      {/* Mobil: Umschalter zwischen Liste und Karte */}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center lg:hidden">
        <Button
          size="lg"
          className="pointer-events-auto h-12 gap-2 rounded-full px-6 text-[0.95rem] shadow-xl"
          onClick={() => {
            setView(view === "liste" ? "karte" : "liste");
            window.scrollTo({ top: 0 });
          }}
        >
          {view === "liste" ? <MapIcon className="size-[18px]" /> : <List className="size-[18px]" />}
          {view === "liste" ? "Karte" : "Liste"}
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  hasBbox,
  onReset,
  onClearBbox,
}: {
  hasBbox: boolean;
  onReset: () => void;
  onClearBbox: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-white px-6 py-16 text-center">
      <SearchX className="size-10 text-brand/60" />
      <h2 className="mt-4 text-lg font-semibold">Keine passenden Immobilien gefunden</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Passen Sie Ihre Filter an oder vergrößern Sie den Suchbereich. Gerne suchen wir auch persönlich für Sie –
        mit einem unverbindlichen Suchauftrag.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasBbox && (
          <Button variant="outline" size="lg" onClick={onClearBbox}>
            In ganz Hamburg suchen
          </Button>
        )}
        <Button size="lg" onClick={onReset}>
          Alle Filter zurücksetzen
        </Button>
      </div>
    </div>
  );
}

function MapSizeControls({ size, onChange }: { size: MapSize; onChange: (size: MapSize) => void }) {
  const button =
    "flex size-10 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35";
  return (
    <div className="absolute top-16 left-3 flex flex-col divide-y overflow-hidden rounded-full bg-white shadow-md">
      <button
        type="button"
        className={button}
        disabled={size === 2}
        onClick={() => onChange((size + 1) as MapSize)}
        aria-label="Karte vergrößern"
        title="Karte vergrößern"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        className={button}
        onClick={() => onChange((size - 1) as MapSize)}
        aria-label={size === 1 ? "Karte ausblenden" : "Karte verkleinern"}
        title={size === 1 ? "Karte ausblenden" : "Karte verkleinern"}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
