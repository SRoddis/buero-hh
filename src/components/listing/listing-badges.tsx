import { BADGE_FEATURES, FEATURES, PROPERTY_CATEGORIES, type FeatureKey, type PropertyCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FEATURE_BADGE_STYLES: Partial<Record<FeatureKey, string>> = {
  provisionsfrei: "bg-emerald-100 text-emerald-800",
  neubau: "bg-rose-100 text-rose-800",
  barrierefrei: "bg-sky-100 text-sky-800",
};

export function ListingBadges({
  categories,
  features,
  max = 2,
  className,
}: {
  /** Alle Objektarten – gemischte Objekte zeigen z. B. „Büro/Praxis“ und „Halle/Lager“ */
  categories: PropertyCategory[];
  features: FeatureKey[];
  max?: number;
  className?: string;
}) {
  // Gemischte Objekte haben mehrere Objektart-Badges – dafür weniger Ausstattungs-Badges, damit alles in eine Zeile passt
  const highlighted = BADGE_FEATURES.filter((f) => features.includes(f)).slice(0, Math.max(1, max - categories.length + 1));

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {categories.map((category) => (
        <Pill key={category} className="bg-white text-foreground">
          {PROPERTY_CATEGORIES.find((c) => c.value === category)?.short}
        </Pill>
      ))}
      {highlighted.map((feature) => (
        <Pill key={feature} className={FEATURE_BADGE_STYLES[feature]}>
          {FEATURES[feature]}
        </Pill>
      ))}
    </div>
  );
}

function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs leading-none font-medium shadow-sm", className)}>
      {children}
    </span>
  );
}
