import { CATEGORY_COLORS, PROPERTY_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MapLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("space-y-1.5 rounded-lg bg-white/95 px-3 py-2.5 text-xs shadow-md", className)}>
      {PROPERTY_CATEGORIES.map((category) => (
        <li key={category.value} className="flex items-center gap-2">
          <span
            className="size-3 rounded-full ring-2 ring-white"
            style={{ backgroundColor: CATEGORY_COLORS[category.value] }}
          />
          {category.label}
        </li>
      ))}
    </ul>
  );
}
