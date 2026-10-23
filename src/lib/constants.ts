/**
 * Fachliche Stammdaten (Objektarten, Lagen, Ausstattungsmerkmale, Sortierung).
 * Die Werte (value) sind gleichzeitig die Schlüssel in URL, Datenbank und Sync-Service.
 */

export const PROPERTY_CATEGORIES = [
  { value: "buero-praxis", label: "Büro- und Praxisflächen", types: ["buero", "praxis"] },
  { value: "laden-gastro", label: "Laden- und Gastroflächen", types: ["laden", "gastro"] },
  { value: "lager-logistik", label: "Lager- und Logistikflächen", types: ["lager"] },
] as const;

export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number]["value"];

export const PROPERTY_TYPES = {
  buero: { label: "Büro", plural: "Büroflächen", category: "buero-praxis" },
  praxis: { label: "Praxis", plural: "Praxisflächen", category: "buero-praxis" },
  laden: { label: "Laden", plural: "Ladenflächen", category: "laden-gastro" },
  gastro: { label: "Gastro", plural: "Gastroflächen", category: "laden-gastro" },
  lager: { label: "Lager", plural: "Lagerflächen", category: "lager-logistik" },
} as const satisfies Record<string, { label: string; plural: string; category: PropertyCategory }>;

export type PropertyType = keyof typeof PROPERTY_TYPES;
export const PROPERTY_TYPE_KEYS = Object.keys(PROPERTY_TYPES) as PropertyType[];

export const LOCATION_CLASSES = [
  { value: "city", label: "City / Innenstadt" },
  { value: "citynah", label: "Cityrand" },
  { value: "buerozentrum", label: "Bürozentren" },
  { value: "peripherie", label: "Peripherie" },
] as const;

export type LocationClass = (typeof LOCATION_CLASSES)[number]["value"];

export const FEATURES = {
  provisionsfrei: "Provisionsfrei",
  neubau: "Neubau",
  barrierefrei: "Barrierefrei",
  klimatisiert: "Klimatisiert",
  stellplaetze: "Stellplätze",
  aufzug: "Aufzug",
  glasfaser: "Glasfaser",
  teekueche: "Teeküche",
  kantine: "Kantine",
  dachterrasse: "Dachterrasse",
  empfang: "Empfang / Concierge",
  teilbar: "Teilbar",
  "sofort-verfuegbar": "Sofort verfügbar",
  denkmalschutz: "Denkmalschutz",
  wasserblick: "Wasserblick",
  "oepnv-nah": "ÖPNV-Anbindung",
  "e-ladestation": "E-Ladestation",
  schaufenster: "Schaufensterfront",
  abluft: "Abluftanlage",
  rampe: "Rampe / Andienung",
} as const;

export type FeatureKey = keyof typeof FEATURES;
export const FEATURE_KEYS = Object.keys(FEATURES) as FeatureKey[];

/** Merkmale, die als Schnellfilter direkt unter der Suchleiste angeboten werden. */
export const QUICK_FEATURES: FeatureKey[] = [
  "provisionsfrei",
  "neubau",
  "barrierefrei",
  "klimatisiert",
  "stellplaetze",
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

export function locationClassLabel(value: LocationClass) {
  return LOCATION_CLASSES.find((l) => l.value === value)?.label ?? value;
}
