import {
  BADGE_FEATURES,
  CATEGORY_COLORS,
  FEATURES,
  PROPERTY_CATEGORIES,
  type FeatureKey,
  type PropertyCategory,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

import { FEATURE_ICONS } from "./feature-icons";

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
    <div className={cn("flex flex-wrap gap-1", className)}>
      {categories.map((category) => (
        <Pill
          key={category}
          // Farbe der Objektart wie die Pins auf der Karte – heller Hintergrund, dunklere Schrift für den Kontrast
          style={{
            backgroundColor: `color-mix(in srgb, ${CATEGORY_COLORS[category]} 12%, white)`,
            color: `color-mix(in srgb, ${CATEGORY_COLORS[category]} 80%, black)`,
          }}
        >
          {PROPERTY_CATEGORIES.find((c) => c.value === category)?.short}
        </Pill>
      ))}
      {highlighted.map((feature) => {
        const Icon = FEATURE_ICONS[feature];
        return (
          <Pill key={feature} className={cn("gap-0.5", FEATURE_BADGE_STYLES[feature])}>
            <Icon className="size-3 shrink-0" strokeWidth={2} aria-hidden />
            {FEATURES[feature]}
          </Pill>
        );
      })}
    </div>
  );
}

/** Feste Höhe und zentrierter Inhalt – sonst streckt die Zeile Pills ohne Icon auf die Höhe der Pills mit Icon und der Text klebt oben */
function Pill({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <span
      style={style}
      className={cn("inline-flex h-5 items-center rounded-full px-1.5 text-[11px] leading-none font-medium whitespace-nowrap", className)}
    >
      {children}
    </span>
  );
}
