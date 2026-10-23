"use client";

import { X } from "lucide-react";

import { FEATURE_ICONS } from "@/components/listing/feature-icons";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FEATURE_KEYS, FEATURES } from "@/lib/constants";
import { formatCount } from "@/lib/format";

import { MarketAreaSelect } from "./filter-fields";
import { toggleValue, useSearch } from "./search-context";

/** Desktop: Dialog „Weitere Filter“ (mobil übernimmt das Fly-up in mobile-search-sheet.tsx). */
export function FilterDialog({ trigger, total }: { trigger: React.ReactNode; total: number }) {
  const { filters, update, reset, isPending } = useSearch();

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[640px]"
      >
        <div className="flex items-start justify-between gap-4 px-7 pt-7 pb-5">
          <div>
            <DialogTitle className="text-2xl font-bold">Filter</DialogTitle>
            <DialogDescription className="mt-1 text-[15px]">
              Grenzen Sie Ihre Suche nach Lage, Größe und Ausstattung ein.
            </DialogDescription>
          </div>
          <DialogClose
            className="-mt-1 -mr-2 flex size-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted"
            aria-label="Schließen"
          >
            <X className="size-6" />
          </DialogClose>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-7 pb-7">
          <section>
            <h3 className="mb-2.5 text-base font-semibold">Lage</h3>
            <div className="[&_[data-slot=select-trigger]]:h-12! [&_[data-slot=select-trigger]]:px-4 [&_[data-slot=select-trigger]]:text-[15px]">
              <MarketAreaSelect />
            </div>
          </section>

          <section className="border-t pt-6">
            <h3 className="mb-3 text-base font-semibold">Ausstattung & Eigenschaften</h3>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
              {FEATURE_KEYS.map((feature) => {
                const Icon = FEATURE_ICONS[feature];
                return (
                  <label
                    key={feature}
                    className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm leading-snug transition-colors hover:border-foreground/25 has-[[data-state=checked]]:border-brand/60 has-[[data-state=checked]]:bg-brand-light"
                  >
                    <Checkbox
                      checked={filters.features.includes(feature)}
                      onCheckedChange={() => update({ features: toggleValue(filters.features, feature) })}
                    />
                    <Icon className="size-[18px] shrink-0 text-muted-foreground" />
                    {/* Lange Wörter brechen an den weichen Trennstellen aus FEATURES um */}
                    <span className="min-w-0">
                      {FEATURES[feature]}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-7 py-4">
          <button
            type="button"
            onClick={reset}
            className="h-11 rounded-xl bg-muted px-7 text-[15px] font-semibold transition-colors hover:bg-muted/70"
          >
            Zurücksetzen
          </button>
          <DialogClose asChild>
            <button
              type="button"
              disabled={isPending}
              className="h-11 rounded-xl bg-brand px-10 text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {isPending ? "Suche läuft …" : `${formatCount(total, "Ergebnis", "Ergebnisse")} anzeigen`}
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
