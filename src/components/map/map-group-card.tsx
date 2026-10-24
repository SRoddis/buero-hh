"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import type { MapMarker } from "@/lib/types";
import { cn } from "@/lib/utils";

import { MapListingPreview } from "./map-popup-card";

/**
 * Mehrere Angebote am selben Ort (z. B. mehrere Mietflächen in einem Gebäude) – solche Punkte
 * lassen sich durch Zoomen nicht trennen. Oben durch die Bilder blättern, unten durch die Angebote.
 */
export function MapGroupCard({
  markers,
  initialId,
  onActiveChange,
  onClose,
  onShowAll,
  compact = false,
  className,
}: {
  markers: MapMarker[];
  /** Angebot, mit dem die Karte startet (z. B. aus „Auf der Karte anzeigen“) */
  initialId?: string;
  /** Meldet das aktuell angezeigte Angebot (für den Preis-Pin auf der Karte) */
  onActiveChange: (id: string) => void;
  onClose: () => void;
  onShowAll: () => void;
  /** Mobil: flacheres Bild, damit der Ort darüber sichtbar bleibt */
  compact?: boolean;
  className?: string;
}) {
  const startIndex = Math.max(0, markers.findIndex((m) => m.id === initialId));
  const [index, setIndex] = useState(startIndex);
  const marker = markers[Math.min(index, markers.length - 1)];

  // Neue Gruppe → beim gewählten bzw. ersten Angebot beginnen
  useEffect(() => setIndex(startIndex), [markers, startIndex]);

  // Der Preis-Pin auf der Karte folgt dem angezeigten Angebot
  const markerId = marker?.id;
  useEffect(() => {
    if (markerId) onActiveChange(markerId);
  }, [markerId, onActiveChange]);

  if (!marker) return null;
  const step = (delta: number) => setIndex((i) => (i + delta + markers.length) % markers.length);

  return (
    <article className={cn("w-[320px] bg-white font-sans", className)}>
      <MapListingPreview marker={marker} onClose={onClose} compact={compact} />

      <div className="mx-4 flex items-center justify-center gap-6 border-t py-2.5">
        <PagerButton direction="prev" onClick={() => step(-1)} />
        <span className="min-w-16 text-center text-sm font-medium tabular-nums">
          {index + 1} von {markers.length}
        </span>
        <PagerButton direction="next" onClick={() => step(1)} />
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onShowAll}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-light text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
        >
          Alle {markers.length} Angebote anzeigen
          <ArrowRight className="size-4" />
        </button>
      </div>
    </article>
  );
}

function PagerButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Vorheriges Angebot" : "Nächstes Angebot"}
      className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-brand-light hover:text-brand"
    >
      <Icon className="size-5" />
    </button>
  );
}
