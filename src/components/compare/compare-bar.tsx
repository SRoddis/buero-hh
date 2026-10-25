"use client";

import { ArrowRight, Plus, Scale, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ListingImage } from "@/components/listing/listing-image";
import { buttonVariants } from "@/components/ui/button";
import { MAX_COMPARE } from "@/lib/constants";
import { formatArea, formatRentShort } from "@/lib/format";
import { cn } from "@/lib/utils";

import { compareHref, useCompare } from "./compare-provider";
import { rememberSearchPosition } from "./search-return";

/** Leiste am unteren Rand, sobald mindestens ein Objekt zum Vergleich gewählt ist. Vergleichen ab 2 Objekten. */
export function CompareBar({ className }: { className?: string }) {
  const { items: selected, remove, replace } = useCompare();
  // Nach dem Entfernen des letzten Objekts die bisherige Auswahl noch zeigen, bis die Leiste hinausgeglitten ist
  const [lastShown, setLastShown] = useState(selected);
  if (selected.length && selected !== lastShown) setLastShown(selected);
  const closing = !selected.length && lastShown.length > 0;
  const items = closing ? lastShown : selected;
  if (!items.length) return null;

  const canCompare = items.length >= 2;
  const free = MAX_COMPARE - items.length;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-white shadow-[0_-8px_24px_rgb(0_0_0/0.08)] duration-300 ease-out print:hidden",
        closing ? "pointer-events-none animate-out fill-mode-forwards slide-out-to-bottom" : "animate-in slide-in-from-bottom",
        className,
      )}
      onAnimationEnd={() => closing && setLastShown([])}
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:gap-6 lg:px-8">
        <div className="min-w-0 flex-1 lg:flex-none lg:shrink-0">
          <p className="truncate font-semibold">
            {items.length} {items.length === 1 ? "Immobilie" : "Immobilien"} ausgewählt
          </p>
          <p className="truncate text-sm text-muted-foreground">
            <span className="hidden sm:inline">Sie können bis zu {MAX_COMPARE} Objekte vergleichen.</span>
            <span className="sm:hidden">{canCompare ? `bis zu ${MAX_COMPARE} möglich` : "mind. 2 wählen"}</span>
          </p>
        </div>

        {/* Desktop: gewählte Objekte als Kacheln */}
        <ul className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          {items.map((item) => (
            <li key={item.id} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border bg-white p-2 pr-1.5">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <ListingImage src={item.imageUrl} alt="" fill sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatArea(item.area)} · {formatRentShort(item)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`${item.title} aus dem Vergleich entfernen`}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
          {/* Immer alle Plätze zeigen, damit die Kacheln unabhängig von der Anzahl gleich breit sind */}
          {Array.from({ length: free }, (_, i) => (
            <li
              key={`frei-${i}`}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-dashed p-2 text-muted-foreground"
            >
              <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                <Plus className="size-5" />
              </span>
              <span className="min-w-0 text-sm">
                <span className="block truncate font-medium text-foreground">Weiteres Objekt hinzufügen</span>
                {i === 0 && <span className="block truncate text-xs">Noch {free} möglich</span>}
              </span>
            </li>
          ))}
        </ul>

        {canCompare ? (
          <Link
            href={compareHref(items.map((i) => i.id))}
            onClick={rememberSearchPosition}
            className={cn(buttonVariants({ size: "lg" }), "ml-auto h-11 shrink-0 gap-2 rounded-xl px-4 sm:px-5")}
          >
            <Scale className="size-[18px]" />
            <span className="sm:hidden">Vergleichen</span>
            <span className="hidden sm:inline">Jetzt vergleichen</span>
            <ArrowRight className="hidden size-4 sm:block" />
          </Link>
        ) : (
          <span
            aria-disabled
            title="Mindestens 2 Objekte auswählen"
            className={cn(buttonVariants({ size: "lg" }), "pointer-events-none ml-auto h-11 shrink-0 gap-2 rounded-xl px-4 opacity-50 sm:px-5")}
          >
            <Scale className="size-[18px]" />
            <span className="sm:hidden">Vergleichen</span>
            <span className="hidden sm:inline">Jetzt vergleichen</span>
          </span>
        )}
        {/* Vergleich abbrechen: alle Haken entfernen – die Leiste gleitet hinaus */}
        <button
          type="button"
          onClick={() => replace([])}
          aria-label="Vergleich abbrechen"
          title="Vergleich abbrechen"
          className="-ml-1 flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:ml-0"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
