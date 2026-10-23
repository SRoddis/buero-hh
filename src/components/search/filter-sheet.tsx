"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FEATURE_KEYS, FEATURES, PROPERTY_TYPE_KEYS, PROPERTY_TYPES } from "@/lib/constants";
import { formatCount } from "@/lib/format";

import { FEATURE_ICONS } from "@/components/listing/feature-icons";

import { FieldLabel, LocationSelect } from "./filter-fields";
import { toggleValue, useSearch } from "./search-context";

/** Desktop: Seitenpanel „Weitere Filter“ (mobil übernimmt das Fly-up in mobile-search-sheet.tsx). */
export function FilterSheet({ trigger, total }: { trigger: React.ReactNode; total: number }) {
  const { filters, update, reset, isPending } = useSearch();
  const types = filters.category
    ? PROPERTY_TYPE_KEYS.filter((t) => PROPERTY_TYPES[t].category === filters.category)
    : PROPERTY_TYPE_KEYS;

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="text-lg">Filter</SheetTitle>
          <SheetDescription>Grenzen Sie Ihre Suche nach Lage, Größe und Ausstattung ein.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-7 overflow-y-auto p-4">
          <section>
            <FieldLabel>Lage</FieldLabel>
            <LocationSelect />
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold">Nutzungsart</h3>
            <div className="grid grid-cols-2 gap-2">
              {types.map((type) => (
                <OptionTile
                  key={type}
                  checked={filters.types.includes(type)}
                  onToggle={() => update({ types: toggleValue(filters.types, type) })}
                >
                  {PROPERTY_TYPES[type].plural}
                </OptionTile>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold">Ausstattung & Eigenschaften</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FEATURE_KEYS.map((feature) => {
                const Icon = FEATURE_ICONS[feature];
                return (
                  <OptionTile
                    key={feature}
                    checked={filters.features.includes(feature)}
                    onToggle={() => update({ features: toggleValue(filters.features, feature) })}
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    {FEATURES[feature]}
                  </OptionTile>
                );
              })}
            </div>
          </section>
        </div>

        <SheetFooter className="flex-row gap-2 border-t">
          <Button variant="outline" size="lg" className="h-11 flex-1" onClick={reset}>
            Zurücksetzen
          </Button>
          <SheetClose asChild>
            <Button size="lg" className="h-11 flex-[2]" disabled={isPending}>
              {isPending ? "Suche läuft …" : `${formatCount(total, "Ergebnis", "Ergebnisse")} anzeigen`}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function OptionTile({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted has-[[data-state=checked]]:border-brand/50 has-[[data-state=checked]]:bg-brand-light"
    >
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      {children}
    </label>
  );
}
