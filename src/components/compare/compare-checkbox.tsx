"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";

import { MAX_COMPARE } from "@/lib/constants";
import type { ListingSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

import { toCompareItem, useCompare } from "./compare-provider";

/** Auswahlkästchen „Vergleichen“ oben links auf dem Kartenbild */
export function CompareCheckbox({ listing, className }: { listing: ListingSummary; className?: string }) {
  const { isSelected, add, remove } = useCompare();
  const selected = isSelected(listing.id);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={selected ? "Aus dem Vergleich entfernen" : "Zum Vergleich hinzufügen"}
      title={selected ? "Aus dem Vergleich entfernen" : "Vergleichen"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (selected) remove(listing.id);
        else if (!add(toCompareItem(listing))) toast(`Sie können höchstens ${MAX_COMPARE} Objekte vergleichen.`);
      }}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        selected ? "bg-brand text-white shadow-md hover:bg-brand-dark" : "bg-black/25 backdrop-blur-sm hover:bg-black/40",
        className,
      )}
    >
      {selected ? (
        <Check className="size-5" strokeWidth={3} />
      ) : (
        <span className="size-5 rounded-[5px] border-2 border-white bg-white/20" aria-hidden />
      )}
    </button>
  );
}
