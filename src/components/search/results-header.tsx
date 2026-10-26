"use client";

import { Columns2, List, Map as MapIcon, type LucideIcon } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_OPTIONS, type SortKey } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useSearch } from "./search-context";

/** Desktop: nur Liste, Liste mit Karte daneben oder nur Karte · Mobil: „geteilt“ zeigt wie „liste“ die Liste */
export type ResultsView = "liste" | "geteilt" | "karte";

const VIEWS: { value: ResultsView; label: string; icon: LucideIcon }[] = [
  { value: "liste", label: "Liste", icon: List },
  { value: "geteilt", label: "Liste/Karte", icon: Columns2 },
  { value: "karte", label: "Karte", icon: MapIcon },
];

export function ResultsHeader({
  total,
  view,
  onViewChange,
}: {
  total: number;
  view: ResultsView;
  onViewChange: (view: ResultsView) => void;
}) {
  const { filters, update, districts, isPending } = useSearch();
  const names = filters.districts.map((slug) => districts.find((d) => d.slug === slug)?.name ?? slug);
  const where = filters.bbox
    ? "im Kartenausschnitt"
    : names.length === 0
      ? "in Hamburg"
      : names.length <= 2
        ? `in ${names.join(" & ")}`
        : `in ${names.length} Stadtteilen`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl" aria-live="polite">
        <span className={cn("transition-opacity", isPending && "opacity-50")}>{formatNumber(total)}</span>{" "}
        {total === 1 ? "Immobilie" : "Immobilien"} {where}
      </h1>

      <div className="flex items-center gap-2">
        {/* In der Kartenansicht spielt die Reihenfolge keine Rolle */}
        {view !== "karte" && (
          <>
            <span className="hidden text-sm text-muted-foreground sm:inline">Sortieren nach</span>
            <Select value={filters.sort} onValueChange={(sort) => update({ sort: sort as SortKey })}>
              <SelectTrigger className="h-9! min-w-40 bg-white" aria-label="Sortierung">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        <div className="hidden rounded-lg border bg-white p-0.5 lg:flex" role="group" aria-label="Ansicht">
          {VIEWS.map(({ value, label, icon }) => (
            <ViewButton key={value} active={view === value} onClick={() => onViewChange(value)} icon={icon}>
              {label}
            </ViewButton>
          ))}
        </div>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
        active ? "bg-brand text-white" : "text-foreground hover:bg-muted",
      )}
    >
      <Icon className="size-4" />
      {children}
    </button>
  );
}
