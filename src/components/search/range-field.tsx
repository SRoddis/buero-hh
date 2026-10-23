"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface RangeFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  unit: string;
  min: number | null;
  max: number | null;
  step?: number;
  onCommit: (min: number | null, max: number | null) => void;
  /** combined: ein Feld mit Icon (Desktop) · split: zwei getrennte Felder (mobiles Fly-up) */
  layout?: "combined" | "split";
  className?: string;
}

function parse(value: string) {
  if (!value.trim()) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Von/Bis-Eingabe, die ihren Wert beim Verlassen des Feldes oder per Enter übernimmt. */
export function RangeField({
  icon: Icon,
  label,
  unit,
  min,
  max,
  step = 1,
  onCommit,
  layout = "combined",
  className,
}: RangeFieldProps) {
  const [draftMin, setDraftMin] = useState(min?.toString() ?? "");
  const [draftMax, setDraftMax] = useState(max?.toString() ?? "");

  useEffect(() => setDraftMin(min?.toString() ?? ""), [min]);
  useEffect(() => setDraftMax(max?.toString() ?? ""), [max]);

  const commit = () => {
    let nextMin = parse(draftMin);
    let nextMax = parse(draftMax);
    if (nextMin != null && nextMax != null && nextMin > nextMax) [nextMin, nextMax] = [nextMax, nextMin];
    if (nextMin !== min || nextMax !== max) onCommit(nextMin, nextMax);
  };

  const inputProps = (which: "von" | "bis") => ({
    type: "number" as const,
    inputMode: "decimal" as const,
    min: 0,
    step,
    value: which === "von" ? draftMin : draftMax,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      (which === "von" ? setDraftMin : setDraftMax)(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => e.key === "Enter" && commit(),
    "aria-label": `${label} ${which} (${unit})`,
  });
  const noSpinner = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none";

  if (layout === "split") {
    const splitInput = cn(
      "h-11 w-full min-w-0 rounded-lg border border-input bg-white px-3 text-base outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-3 focus:ring-brand/20",
      noSpinner,
    );
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input {...inputProps("von")} placeholder="egal" className={splitInput} />
        <span className="text-muted-foreground">–</span>
        <input {...inputProps("bis")} placeholder="egal" className={splitInput} />
      </div>
    );
  }

  const inputClass = cn(
    "ml-1 h-full w-full min-w-0 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground",
    noSpinner,
  );

  return (
    <div
      className={cn(
        "flex h-9 items-center rounded-lg border border-input bg-white pl-2.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 hover:border-foreground/30",
        className,
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <input {...inputProps("von")} placeholder="von" className={inputClass} />
      <span className="h-5 w-px shrink-0 bg-border" />
      <input {...inputProps("bis")} placeholder="bis" className={inputClass} />
    </div>
  );
}
