"use client";

import { Building, Euro, MapPinned, Maximize } from "lucide-react";

import { CategoryDot } from "@/components/listing/category-dot";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MARKET_AREAS, PROPERTY_CATEGORIES, type MarketArea, type PropertyCategory } from "@/lib/constants";

import { RangeField } from "./range-field";
import { useSearch } from "./search-context";

const ALL = "alle";
const triggerClass = "h-9! w-full bg-white px-2.5 data-[state=open]:border-brand";

/** Einzelne Suchfelder – werden von der Desktop-Suchleiste und dem mobilen Filter-Sheet gemeinsam genutzt. */

export function CategorySelect() {
  const { filters, update } = useSearch();
  return (
    <Select
      value={filters.category ?? ALL}
      onValueChange={(value) => update({ category: value === ALL ? null : (value as PropertyCategory) })}
    >
      <SelectTrigger className={triggerClass} aria-label="Objektart">
        <span className="flex min-w-0 items-center gap-2">
          <Building className="text-muted-foreground" />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value={ALL}>Alle Objektarten</SelectItem>
        {PROPERTY_CATEGORIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            <span className="flex items-center gap-2">
              <CategoryDot category={c.value} />
              {c.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function MarketAreaSelect() {
  const { filters, update } = useSearch();
  return (
    <Select
      value={filters.marketArea ?? ALL}
      onValueChange={(value) => update({ marketArea: value === ALL ? null : (value as MarketArea) })}
    >
      <SelectTrigger className={triggerClass} aria-label="Lage">
        <span className="flex min-w-0 items-center gap-2">
          <MapPinned className="text-muted-foreground" />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value={ALL}>Alle Lagen</SelectItem>
        {MARKET_AREAS.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AreaRange({ layout }: { layout?: "combined" | "split" }) {
  const { filters, update } = useSearch();
  return (
    <RangeField
      icon={Maximize}
      label="Mietfläche"
      unit="m²"
      step={10}
      min={filters.areaMin}
      max={filters.areaMax}
      onCommit={(areaMin, areaMax) => update({ areaMin, areaMax })}
      layout={layout}
    />
  );
}

export function RentRange({ layout }: { layout?: "combined" | "split" }) {
  const { filters, update } = useSearch();
  return (
    <RangeField
      icon={Euro}
      label="Miete"
      unit="€/m²"
      step={0.5}
      min={filters.rentMin}
      max={filters.rentMax}
      onCommit={(rentMin, rentMax) => update({ rentMin, rentMax })}
      layout={layout}
    />
  );
}

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-foreground/80">
      {children}
    </label>
  );
}
