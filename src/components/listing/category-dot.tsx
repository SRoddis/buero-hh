import { CATEGORY_COLORS, type PropertyCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Farbkreis einer Objektart – dieselben Farben wie die Punkte auf der Karte. */
export function CategoryDot({ category, className }: { category: PropertyCategory; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: CATEGORY_COLORS[category] }}
    />
  );
}
