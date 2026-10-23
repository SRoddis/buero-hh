import { BADGE_FEATURES, FEATURES, PROPERTY_TYPES, type FeatureKey, type PropertyType } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FEATURE_BADGE_STYLES: Partial<Record<FeatureKey, string>> = {
  provisionsfrei: "bg-emerald-100 text-emerald-800",
  neubau: "bg-rose-100 text-rose-800",
  barrierefrei: "bg-sky-100 text-sky-800",
};

export function ListingBadges({
  type,
  features,
  max = 2,
  className,
}: {
  type: PropertyType;
  features: FeatureKey[];
  max?: number;
  className?: string;
}) {
  const highlighted = BADGE_FEATURES.filter((f) => features.includes(f)).slice(0, max);

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <Pill className="bg-white text-foreground">{PROPERTY_TYPES[type].label}</Pill>
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
