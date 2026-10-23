"use client";

import { Check, LoaderCircle, Search, X } from "lucide-react";

import { CategoryDot } from "@/components/listing/category-dot";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FEATURE_KEYS, FEATURES, MARKET_AREAS, PROPERTY_CATEGORIES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { DistrictPicker } from "./district-picker";
import { AreaRange, RentRange } from "./filter-fields";
import { toggleValue, useSearch } from "./search-context";

/**
 * Mobiles Such-Fly-up (Bottom-Sheet) im Stil großer Immobilienportale.
 * Alle Änderungen wirken sofort auf die URL; der Button zeigt die aktuelle Trefferzahl.
 */
export function MobileSearchSheet({ trigger, total }: { trigger: React.ReactNode; total: number }) {
  const { filters, update, reset, isPending } = useSearch();

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[92dvh] gap-0 rounded-t-2xl border-0 duration-300 data-[side=bottom]:data-closed:slide-out-to-bottom-full data-[side=bottom]:data-open:slide-in-from-bottom-full"
      >
        <header className="flex items-center justify-between px-5 pt-5 pb-3">
          <SheetTitle className="text-xl font-semibold">Suche</SheetTitle>
          <SheetDescription className="sr-only">Suchfilter für Gewerbeimmobilien in Hamburg</SheetDescription>
          <SheetClose className="-mr-2 flex size-10 items-center justify-center rounded-full hover:bg-muted" aria-label="Schließen">
            <X className="size-6" />
          </SheetClose>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 pt-2 pb-6">
          <Section title="Wo suchst du?">
            <DistrictPicker size="lg" />
          </Section>

          <Section title="Objektart">
            <div className="grid grid-cols-4 rounded-full bg-muted p-1">
              {[{ value: null, label: "Alle" }, ...PROPERTY_CATEGORIES.map((c) => ({ value: c.value, label: c.short }))].map(
                (option) => {
                  const active = filters.category === option.value;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => update({ category: option.value })}
                      className={cn(
                        "flex h-10 items-center justify-center gap-1.5 rounded-full px-1 text-[13px] leading-tight font-semibold transition-all",
                        active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      {option.value && <CategoryDot category={option.value} className="size-2" />}
                      {option.label}
                    </button>
                  );
                },
              )}
            </div>
          </Section>

          <Section title="Miete in € pro m²">
            <RentRange layout="split" />
          </Section>

          <Section title="Mietfläche in m²">
            <AreaRange layout="split" />
          </Section>

          <Section title="Lage">
            <PillGroup>
              <Pill active={filters.marketArea === null} onClick={() => update({ marketArea: null })}>
                Alle Lagen
              </Pill>
              {MARKET_AREAS.map((l) => (
                <Pill
                  key={l.value}
                  active={filters.marketArea === l.value}
                  onClick={() => update({ marketArea: filters.marketArea === l.value ? null : l.value })}
                >
                  {l.label}
                </Pill>
              ))}
            </PillGroup>
          </Section>

          <Section title="Ausstattung & Eigenschaften">
            <PillGroup>
              {FEATURE_KEYS.map((feature) => (
                <Pill
                  key={feature}
                  active={filters.features.includes(feature)}
                  onClick={() => update({ features: toggleValue(filters.features, feature) })}
                >
                  {FEATURES[feature]}
                </Pill>
              ))}
            </PillGroup>
          </Section>
        </div>

        <footer className="flex items-center gap-4 border-t bg-white px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-6px_16px_rgb(0_0_0/0.06)]">
          <button type="button" onClick={reset} className="text-sm font-semibold underline underline-offset-4">
            Zurücksetzen
          </button>
          <SheetClose asChild>
            <button
              type="button"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? <LoaderCircle className="size-[18px] animate-spin" /> : <Search className="size-[18px]" />}
              {formatNumber(total)} Treffer anzeigen
            </button>
          </SheetClose>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function PillGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors",
        active
          ? "border-2 border-brand bg-brand-light px-[15px] font-semibold text-brand-dark"
          : "border-border bg-white hover:border-foreground/30",
      )}
    >
      {active && <Check className="size-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}
