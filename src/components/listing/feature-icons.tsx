import {
  Accessibility,
  ArrowUpDown,
  BadgePercent,
  Building,
  CircleParking,
  DoorOpen,
  Package,
  Sun,
  WavesHorizontal,
  type LucideIcon,
} from "lucide-react";

import type { FeatureKey } from "@/lib/constants";

export const FEATURE_ICONS: Record<FeatureKey, LucideIcon> = {
  provisionsfrei: BadgePercent,
  barrierefrei: Accessibility,
  stellplaetze: CircleParking,
  "balkon-terrasse": Sun,
  wasserblick: WavesHorizontal,
  erdgeschoss: DoorOpen,
  lastenaufzug: Package,
  personenaufzug: ArrowUpDown,
  neubau: Building,
};
