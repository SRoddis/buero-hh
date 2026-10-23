"use client";

import { Check, Link2, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { categoryLabel, FEATURES, QUICK_FEATURES } from "@/lib/constants";
import { countActiveFilters } from "@/lib/search/params";
import { cn } from "@/lib/utils";

import { DistrictPicker } from "./district-picker";
import { AreaRange, CategorySelect, FieldLabel, MarketAreaSelect, RentRange } from "./filter-fields";
import { FilterDialog } from "./filter-dialog";
import { MobileSearchSheet } from "./mobile-search-sheet";
import { toggleValue, useSearch } from "./search-context";

export function SearchBar({ total }: { total: number }) {
  const { filters, districts } = useSearch();
  const activeCount = countActiveFilters(filters);
  const names = filters.districts.map((slug) => districts.find((d) => d.slug === slug)?.name ?? slug);
  const where = names.length === 0 ? "Hamburg" : names.length <= 2 ? names.join(", ") : `${names[0]} +${names.length - 1}`;

  return (
    <section className="lg:rounded-xl lg:border lg:bg-white lg:px-4 lg:py-3 lg:shadow-sm" aria-label="Immobiliensuche">
      {/* Desktop: alle Felder in einer Zeile */}
      <form
        className="hidden items-end gap-2.5 lg:grid lg:grid-cols-[1.15fr_1.15fr_1fr_1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          (document.activeElement as HTMLElement | null)?.blur();
          document.getElementById("ergebnisse")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        <div>
          <FieldLabel>Standort / Stadtteil</FieldLabel>
          <DistrictPicker />
        </div>
        <div>
          <FieldLabel>Objektart</FieldLabel>
          <CategorySelect />
        </div>
        <div>
          <FieldLabel>Lage</FieldLabel>
          <MarketAreaSelect />
        </div>
        <div>
          <FieldLabel>Mietfläche (m²)</FieldLabel>
          <AreaRange />
        </div>
        <div>
          <FieldLabel>Miete (€/m²)</FieldLabel>
          <RentRange />
        </div>
        <Button type="submit" className="h-9 min-w-28 gap-2 px-5 font-semibold">
          <Search className="size-4" />
          Suchen
        </Button>
      </form>

      {/* Mobil: Suchleiste öffnet das Fly-up */}
      <MobileSearchSheet
        total={total}
        trigger={
          <button
            type="button"
            className="flex h-14 w-full items-center gap-3 rounded-full border bg-white pr-2 pl-4 text-left shadow-sm transition-shadow active:shadow-none lg:hidden"
          >
            <Search className="size-5 shrink-0 text-brand" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">{where}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {filters.category ? categoryLabel(filters.category) : "Alle Objektarten"}
                {activeCount > 0 && ` · ${activeCount} Filter aktiv`}
              </span>
            </span>
            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border">
              <SlidersHorizontal className="size-[18px]" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </span>
          </button>
        }
      />

      <FilterChips total={total} />
    </section>
  );
}

function FilterChips({ total }: { total: number }) {
  const { filters, update } = useSearch();
  const moreCount = filters.features.filter((f) => !QUICK_FEATURES.includes(f)).length;

  return (
    <div className="mt-2.5 flex items-center gap-3">
      <div className="-mx-3 flex flex-1 gap-1.5 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {QUICK_FEATURES.map((feature) => (
          <Chip
            key={feature}
            active={filters.features.includes(feature)}
            onClick={() => update({ features: toggleValue(filters.features, feature) })}
          >
            {FEATURES[feature]}
          </Chip>
        ))}
      </div>
      <div className="hidden shrink-0 items-center gap-3 lg:flex">
        <FilterDialog
          total={total}
          trigger={
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-full border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-muted"
            >
              <SlidersHorizontal className="size-3.5" />
              Weitere Filter
              {moreCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                  {moreCount}
                </span>
              )}
            </button>
          }
        />
        <ShareSearchButton />
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-3 text-[13px] font-medium whitespace-nowrap transition-colors",
        active
          ? "border-brand bg-brand text-white hover:bg-brand-dark"
          : "border-border bg-secondary/60 text-foreground hover:border-foreground/25 hover:bg-secondary",
      )}
    >
      {active && <Check className="size-3" strokeWidth={3} />}
      {children}
    </button>
  );
}

/** Ohne Login wird die Suche als teilbarer Link gespeichert (alle Filter stecken in der URL). */
function ShareSearchButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success("Link zur Suche kopiert", {
            description: "Speichern Sie ihn als Lesezeichen oder teilen Sie ihn mit Ihrem Team.",
          });
        } catch {
          toast.error("Link konnte nicht kopiert werden");
        }
      }}
      title="Link zur Suche kopieren"
      aria-label="Suche speichern"
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
    >
      <Link2 className="size-4" />
      <span className="hidden 2xl:inline">Suche speichern</span>
    </button>
  );
}
