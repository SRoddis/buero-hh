"use client";

import { List, Map as MapIcon, SearchX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CompareBar } from "@/components/compare/compare-bar";
import { useCompare } from "@/components/compare/compare-provider";
import { restoreSearchPosition } from "@/components/compare/search-return";
import { ListingCard } from "@/components/listing/listing-card";
import { ListingsMap } from "@/components/map/listings-map-lazy";
import { Button } from "@/components/ui/button";
import type { SearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Pagination } from "./pagination";
import { ResultsHeader, type ResultsView } from "./results-header";
import { SearchBar } from "./search-bar";
import { useSearch } from "./search-context";

/** Desktop: Liste allein oder mit Karte daneben */
const GRID_COLUMNS: Record<Exclude<ResultsView, "karte">, string> = {
  liste: "lg:grid-cols-1",
  geteilt: "lg:grid-cols-[minmax(0,1fr)_minmax(420px,44vw)]",
};

/**
 * Spalten nach Breite der Liste (Container Query, Karten ca. 280–290 px + 20 px Abstand; 6 Spalten schon bei
 * Full HD ohne Karte) – nur 1, 2, 3, 4, 6 oder 8,
 * damit PAGE_SIZE (24) immer volle Reihen ergibt und keine Lücken am Ende bleiben
 */
const CARD_COLUMNS =
  "grid-cols-1 @min-[600px]:grid-cols-2 @min-[910px]:grid-cols-3 @min-[1220px]:grid-cols-4 @min-[1780px]:grid-cols-6 @min-[2460px]:grid-cols-8";

/**
 * Orchestriert Suchleiste, Trefferliste und Karte.
 * Hover und Auswahl werden zwischen Liste und Karte synchronisiert.
 */
export function SearchView({ result, fitKey }: { result: SearchResult; fitKey: string }) {
  const { filters, update, reset, isPending } = useSearch();
  const comparing = useCompare().items.length > 0;
  const [view, setView] = useState<ResultsView>("geteilt");
  /** Listenansicht, zu der „Zurück“ aus der mobilen Karte führt */
  const listView = useRef<Exclude<ResultsView, "karte">>("geteilt");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Bewusst kein automatisches Scrollen zur Listenkarte bei Auswahl auf der Karte: Das würde die
  // Seite und damit die Karte unter dem Mauszeiger verschieben, sodass der nächste Klick daneben geht.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Anforderung „auf der Karte anzeigen“ – seq unterscheidet wiederholte Klicks auf dasselbe Objekt */
  const [mapFocus, setMapFocus] = useState<{ id: string; seq: number } | null>(null);

  /**
   * Mobil: Die Kartenansicht bekommt einen eigenen Verlaufseintrag, damit „Zurück“ zur Liste an die
   * vorherige Scrollposition führt statt die Suche zu verlassen. Gesetzt, solange dieser Eintrag aktiv ist.
   */
  const mapEntry = useRef<{ scrollY: number } | null>(null);

  const openMobileMap = () => {
    if (!mapEntry.current) {
      mapEntry.current = { scrollY: window.scrollY };
      window.history.pushState(window.history.state, "", window.location.href);
    }
    setView("karte");
    window.scrollTo({ top: 0 });
  };

  const closeMobileMap = (target: Exclude<ResultsView, "karte"> = listView.current) => {
    listView.current = target;
    // Über den Verlauf zurück – der popstate-Handler stellt Liste und Scrollposition wieder her
    if (mapEntry.current) window.history.back();
    else setView(target);
  };

  useEffect(() => {
    const onPopState = () => {
      const entry = mapEntry.current;
      if (!entry) return;
      mapEntry.current = null;
      setView(listView.current);
      // erst nach dem Rendern der Liste scrollen, sonst ist die Seite noch zu kurz
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: entry.scrollY })));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const showOnMap = (id: string) => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) openMobileMap();
    else if (view === "liste") setView("geteilt");
    setSelectedId(id);
    // erst nach dem Umschalten, damit die Karte ihre endgültige Größe hat
    requestAnimationFrame(() => setMapFocus((f) => ({ id, seq: (f?.seq ?? 0) + 1 })));
  };

  // Rückkehr aus dem Objektvergleich: an die vorherige Stelle der Liste springen
  useEffect(restoreSearchPosition, []);

  const changePage = (page: number) => {
    update({ page });
    document.getElementById("ergebnisse")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    // Desktop: Liste und Liste/Karte scrollen mit der Seite, die Karte bleibt dabei stehen (sticky).
    // Nur die Kartenansicht füllt genau die Bildschirmhöhe (abzüglich Seitenheader h-16).
    <div className={cn("flex flex-1 flex-col", view === "karte" && "lg:h-[calc(100dvh-4rem)] lg:flex-none")}>
      <div className="mx-auto w-full max-w-[1600px] shrink-0 px-4 pt-3 sm:px-6 lg:px-8 lg:pt-4">
        <SearchBar total={result.total} />
      </div>

      {/* Kopfzeile in beiden Ansichten über die volle Breite – Bedienelemente bleiben immer oben rechts */}
      <div className="shrink-0 px-4 pt-4 sm:px-6 lg:px-8">
        <ResultsHeader total={result.total} view={view} onViewChange={(v) => (v === "karte" ? setView(v) : closeMobileMap(v))} />
      </div>

      <div
        id="ergebnisse"
        className={cn(
          // lg:pb-6: Abstand unter Liste und Karte
          "grid flex-1 scroll-mt-2 gap-x-6 gap-y-4 pt-4 lg:pb-6",
          view !== "karte" ? GRID_COLUMNS[view] : "lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]",
        )}
      >
        <section
          aria-label="Suchergebnisse"
          className={cn(
            "min-w-0 px-4 pb-24 sm:px-6 lg:pb-0 lg:pl-8",
            view === "liste" ? "lg:pr-8" : "lg:pr-0",
            view === "karte" && "hidden lg:hidden",
            // Platz für die Vergleichsleiste
            comparing && "pb-40 lg:pb-28",
          )}
        >
          <div className="@container space-y-5">
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
                    onShowOnMap={() => showOnMap(listing.id)}
                    compare
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
            view !== "karte"
              ? cn(
                  // bleibt beim Scrollen der Liste 16 px unter dem Fensterrand stehen (24 px Abstand unten)
                  "hidden lg:sticky lg:top-4 lg:h-[calc(100dvh-2.5rem)] lg:self-start lg:pr-8",
                  view === "geteilt" && "lg:block",
                )
              : "block px-4 pb-24 sm:px-6 lg:min-h-0 lg:px-8 lg:pb-0",
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border shadow-sm",
              view !== "karte" ? "h-full" : "h-[calc(100dvh-4.5rem)] lg:h-full",
            )}
          >
            <ListingsMap
              markers={result.markers}
              hoveredId={hoveredId}
              selectedId={selectedId}
              onSelect={setSelectedId}
              bbox={filters.bbox}
              onBboxChange={(bbox) => update({ bbox })}
              fitKey={fitKey}
              colorCategory={filters.category}
              focus={mapFocus}
            />
          </div>
        </div>
      </div>

      {/* mobil nur in der Listenansicht – in der Kartenansicht liegt dort die Objektkarte */}
      <CompareBar className={view === "karte" ? "max-lg:hidden" : undefined} />

      {/* Mobil: Umschalter zwischen Liste und Karte */}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 z-30 flex justify-center transition-[bottom] duration-300 ease-out lg:hidden",
          // über der Vergleichsleiste, die mobil nur in der Listenansicht erscheint
          comparing && view !== "karte" ? "bottom-[92px]" : "bottom-5",
        )}
      >
        <Button
          size="lg"
          className="pointer-events-auto h-12 gap-2 rounded-full px-6 text-[0.95rem] shadow-xl"
          onClick={() => (view !== "karte" ? openMobileMap() : closeMobileMap())}
        >
          {view !== "karte" ? <MapIcon className="size-[18px]" /> : <List className="size-[18px]" />}
          {view !== "karte" ? "Karte" : "Liste"}
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
