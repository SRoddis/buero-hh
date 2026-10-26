/**
 * Suchauftrag – erlaubte Werte der API von buerohamburg.de (/api/suchauftrag), übernommen aus dem
 * Formular der bisherigen Website. Andere Werte lehnt die API ab (HTTP 400).
 */

export const REQUEST_OBJECT_TYPES = [
  { value: "Büro", label: "Büro- und Praxisflächen" },
  { value: "Laden", label: "Laden- und Gastroflächen" },
] as const;

export const REQUEST_MARKET_AREAS = ["HH-Nord", "HH-Alster", "HH-West", "HH-City", "HH-City-Süd", "HH-Ost", "HH-Süd"] as const;

/** Flächenstufen in m² („5000+“ = mehr als 5.000 m²) */
export const REQUEST_AREAS = [
  "0", "100", "200", "300", "400", "500", "600", "700", "800", "900", "1000",
  "1250", "1500", "1750", "2000", "2500", "3000", "3500", "4000", "4500", "5000", "5000+",
] as const;

/** Mietpreis in ganzen Euro je m² */
export const REQUEST_RENTS = Array.from({ length: 31 }, (_, i) => String(i));

export const REQUEST_CRITERIA = [
  "Balkon / Terrasse",
  "Barrierefrei",
  "Wasserblick",
  "Erdgeschossfläche",
  "Hauseigene Parkplätze",
  "Lastenaufzug",
] as const;

export const areaLabel = (value: string) =>
  value === "5000+" ? "über 5.000 m²" : `${Number(value).toLocaleString("de-DE")} m²`;
export const rentLabel = (value: string) => `${value},00 €`;

/** Zahl zum Vergleichen von „von“ und „bis“ */
export const areaNumber = (value: string) => (value === "5000+" ? 5001 : Number(value));
