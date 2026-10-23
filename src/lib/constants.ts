/**
 * Fachliche Stammdaten (Objektarten, Lagen, Ausstattungsmerkmale, Sortierung).
 * Die Werte (value) sind gleichzeitig die Schlüssel in URL, Datenbank und Sync-Service.
 * Grundlage ist der Objektbestand von BüroHamburg (FileMaker).
 */

export const PROPERTY_CATEGORIES = [
  { value: "buero-praxis", label: "Büro- und Praxisflächen", short: "Büro & Praxis", type: "buero" },
  { value: "laden-gastro", label: "Ladenflächen", short: "Laden", type: "laden" },
  { value: "lager-logistik", label: "Hallen-, Lager- & Produktionsflächen", short: "Halle & Lager", type: "lager" },
] as const;

export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number]["value"];

export const PROPERTY_TYPES = {
  buero: { label: "Büro/Praxis", category: "buero-praxis" },
  laden: { label: "Laden", category: "laden-gastro" },
  lager: { label: "Halle/Lager", category: "lager-logistik" },
} as const satisfies Record<string, { label: string; category: PropertyCategory }>;

export type PropertyType = keyof typeof PROPERTY_TYPES;

/** Lagen (Teilmärkte) wie auf buerohamburg.de */
export const MARKET_AREAS = [
  { value: "hh-city", label: "HH-City" },
  { value: "hh-city-sued", label: "HH-City-Süd" },
  { value: "hh-alster", label: "HH-Alster" },
  { value: "hh-west", label: "HH-West" },
  { value: "hh-nord", label: "HH-Nord" },
  { value: "hh-ost", label: "HH-Ost" },
  { value: "hh-sued", label: "HH-Süd" },
] as const;

export type MarketArea = (typeof MARKET_AREAS)[number]["value"];

/**
 * Ausstattungsmerkmale (FileMaker-Suchkriterien web_suchKrit01–08 plus Courtage).
 * \u00AD = weiche Trennstelle: lange Wörter brechen in schmalen Kacheln sauber um, sonst unsichtbar.
 */
export const FEATURES = {
  provisionsfrei: "Provisionsfrei",
  barrierefrei: "Barrierefrei",
  stellplaetze: "Hauseigene Parkplätze",
  "balkon-terrasse": "Balkon / Terrasse",
  wasserblick: "Wasserblick",
  erdgeschoss: "Erdgeschoss\u00ADfläche",
  lastenaufzug: "Lasten\u00ADaufzug",
  personenaufzug: "Personen\u00ADaufzug",
  neubau: "Neubau",
} as const;

export type FeatureKey = keyof typeof FEATURES;
export const FEATURE_KEYS = Object.keys(FEATURES) as FeatureKey[];

/** Merkmale, die als Schnellfilter direkt unter der Suchleiste angeboten werden. */
export const QUICK_FEATURES: FeatureKey[] = [
  "provisionsfrei",
  "barrierefrei",
  "stellplaetze",
  "balkon-terrasse",
  "wasserblick",
  "erdgeschoss",
];

/** Merkmale, die als farbige Badges auf den Karten erscheinen (in dieser Priorität). */
export const BADGE_FEATURES: FeatureKey[] = ["provisionsfrei", "neubau", "barrierefrei"];

export const SORT_OPTIONS = [
  { value: "relevanz", label: "Relevanz" },
  { value: "neueste", label: "Neueste zuerst" },
  { value: "miete-asc", label: "Miete aufsteigend" },
  { value: "miete-desc", label: "Miete absteigend" },
  { value: "flaeche-asc", label: "Fläche aufsteigend" },
  { value: "flaeche-desc", label: "Fläche absteigend" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export const PAGE_SIZE = 12;

export const HAMBURG_CENTER: [number, number] = [9.9937, 53.5511];

export const CATEGORY_COLORS: Record<PropertyCategory, string> = {
  "buero-praxis": "#8B2038",
  "laden-gastro": "#6B7280",
  "lager-logistik": "#B08D57",
};

export function categoryLabel(value: PropertyCategory) {
  return PROPERTY_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function marketAreaLabel(value: MarketArea) {
  return MARKET_AREAS.find((l) => l.value === value)?.label ?? value;
}
