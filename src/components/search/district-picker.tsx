"use client";

import { MapPin, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { toggleValue, useSearch } from "./search-context";

/** size="lg": größeres Touch-Ziel im mobilen Fly-up */
export function DistrictPicker({ className, size = "default" }: { className?: string; size?: "default" | "lg" }) {
  const { filters, update, districts } = useSearch();
  const [query, setQuery] = useState("");
  const selected = filters.districts;

  const byBorough = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = new Map<string, typeof districts>();
    for (const d of districts) {
      if (q && !d.name.toLowerCase().includes(q) && !d.borough.toLowerCase().includes(q)) continue;
      groups.set(d.borough, [...(groups.get(d.borough) ?? []), d]);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "de"));
  }, [districts, query]);

  const names = selected.map((slug) => districts.find((d) => d.slug === slug)?.name ?? slug);
  const label = names.length === 0 ? "Hamburg" : names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;

  return (
    <Popover onOpenChange={(open) => !open && setQuery("")}>
      <div className={cn("relative", className)}>
        <PopoverTrigger
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-white pr-8 pl-2.5 text-left text-sm transition-colors outline-none hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:border-brand",
            size === "lg" && "h-11 pl-3 text-base",
          )}
          aria-label="Standort oder Stadtteil wählen"
        >
          <MapPin className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
        </PopoverTrigger>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => update({ districts: [] })}
            className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Stadtteilauswahl zurücksetzen"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <PopoverContent align="start" className="w-[min(92vw,340px)] p-0">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Stadtteil oder Bezirk suchen"
              className="h-9 w-full rounded-md bg-muted pr-3 pl-8 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {byBorough.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">Kein Stadtteil gefunden</p>}
          {byBorough.map(([borough, items]) => (
            <div key={borough} className="py-1">
              <p className="px-2.5 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{borough}</p>
              {items.map((d) => (
                <label
                  key={d.slug}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-muted"
                >
                  <Checkbox
                    checked={selected.includes(d.slug)}
                    onCheckedChange={() => update({ districts: toggleValue(selected, d.slug) })}
                  />
                  {d.name}
                </label>
              ))}
            </div>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="flex items-center justify-between border-t px-3 py-2 text-sm">
            <span className="text-muted-foreground">{selected.length} ausgewählt</span>
            <button type="button" className="font-medium text-brand hover:underline" onClick={() => update({ districts: [] })}>
              Alle entfernen
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
