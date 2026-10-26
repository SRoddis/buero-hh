import { FEATURE_KEYS, FEATURES, marketAreaLabel, PROPERTY_CATEGORIES, type FeatureKey } from "@/lib/constants";
import {
  formatArea,
  formatAvailability,
  formatCommission,
  formatFurtherAreas,
  formatRent,
} from "@/lib/format";
import type { Listing } from "@/lib/types";

/**
 * Zeilen des Objektvergleichs – gemeinsame Grundlage für die Vergleichsseite und das Vergleichs-PDF,
 * damit beide immer dieselben Angaben zeigen.
 */

export type Tone = "good" | "bad" | null;

export type CompareRowKey =
  | "lage"
  | "adresse"
  | "marktgebiet"
  | "objektart"
  | "objektnummer"
  | "mietflaeche"
  | "flaechen"
  | "miete-qm"
  | "miete-monat"
  | "nebenkosten"
  | "verfuegbarkeit"
  | "provision"
  | "expose"
  | `merkmal-${FeatureKey}`;

export interface CompareRow {
  key: CompareRowKey;
  label: string;
  /** Text je Objekt (auch für „Nur Unterschiede“ verglichen); null = keine Angabe */
  values: (string | null)[];
  /** Ja/Nein-Merkmal – als Haken bzw. Kreuz darstellen */
  flags?: boolean[];
  tones?: Tone[];
}

export const shortCategories = (listing: Listing) =>
  listing.categories.map((c) => PROPERTY_CATEGORIES.find((p) => p.value === c)?.short ?? c).join(", ");

/** Monatsmiete: Pauschale oder Fläche × m²-Preis */
function monthlyRent(listing: Listing) {
  if (listing.rentTotalMonthly != null) return { value: listing.rentTotalMonthly, estimated: false };
  if (listing.rentPerSqm != null && listing.area > 0) return { value: listing.rentPerSqm * listing.area, estimated: true };
  return null;
}

/** Günstigster Wert grün, teuerster rot – nur wenn sich die Werte unterscheiden */
function lowerIsBetter(values: (number | null)[]): Tone[] {
  const known = values.filter((v): v is number => v != null);
  if (known.length < 2) return values.map(() => null);
  const min = Math.min(...known);
  const max = Math.max(...known);
  if (min === max) return values.map(() => null);
  return values.map((v) => (v === min ? "good" : v === max ? "bad" : null));
}

/** Ja grün, Nein rot – nur wenn nicht alle Objekte gleich sind */
function yesIsBetter(values: boolean[]): Tone[] {
  if (values.every((v) => v === values[0])) return values.map(() => null);
  return values.map((v) => (v ? "good" : "bad"));
}

export function buildCompareRows(listings: Listing[]): CompareRow[] {
  const rents = listings.map((l) => l.rentPerSqm);
  const monthly = listings.map(monthlyRent);
  const serviceCharges = listings.map((l) => l.units.find((u) => u.serviceChargePerSqm != null)?.serviceChargePerSqm ?? null);
  const availability = listings.map((l) => {
    if (!l.units.length) return null;
    const dates = l.units.map((u) => u.availableFrom).filter((d): d is string => d != null).sort();
    return formatAvailability(dates[0] ?? null);
  });

  const rows: CompareRow[] = [
    { key: "lage", label: "Lage", values: listings.map((l) => l.districtName) },
    { key: "adresse", label: "Adresse", values: listings.map((l) => l.address || null) },
    { key: "marktgebiet", label: "Marktgebiet", values: listings.map((l) => marketAreaLabel(l.marketArea)) },
    { key: "objektart", label: "Objektart", values: listings.map(shortCategories) },
    { key: "objektnummer", label: "Objektnummer", values: listings.map((l) => l.referenceNumber) },
    { key: "mietflaeche", label: "Mietfläche", values: listings.map((l) => formatArea(l.area)) },
    { key: "flaechen", label: "Flächen im Objekt", values: listings.map((l) => formatFurtherAreas(l)) },
    {
      key: "miete-qm",
      label: "Miete / m²",
      values: rents.map((r) => (r == null ? "auf Anfrage" : formatRent(r))),
      tones: lowerIsBetter(rents),
    },
    {
      key: "miete-monat",
      label: "Miete / Monat",
      // „ca.“ statt „≈“ – das Zeichen fehlt in der Standardschrift des PDFs
      values: monthly.map((m) => (m ? `${m.estimated ? "ca. " : ""}${formatRent(m.value)}` : "auf Anfrage")),
      tones: lowerIsBetter(monthly.map((m) => m?.value ?? null)),
    },
    {
      key: "nebenkosten",
      label: "Nebenkosten",
      values: listings.map((l, i) =>
        serviceCharges[i] != null ? `${formatRent(serviceCharges[i]!)} / m²` : (l.priceNote ?? null),
      ),
    },
    { key: "verfuegbarkeit", label: "Verfügbarkeit", values: availability },
    {
      key: "provision",
      label: "Provision",
      values: listings.map((l) => formatCommission(l)),
      tones: yesIsBetter(listings.map((l) => l.commissionFree)),
    },
    ...FEATURE_KEYS.filter((f) => f !== "provisionsfrei").map((feature): CompareRow => {
      const has = listings.map((l) => l.features.includes(feature));
      return {
        key: `merkmal-${feature}`,
        // weiche Trennstellen entfernen – in der Tabelle ist genug Platz
        label: FEATURES[feature].replace(/­/g, ""),
        values: has.map((h) => (h ? "Ja" : "Nein")),
        flags: has,
        tones: yesIsBetter(has),
      };
    }),
    { key: "expose", label: "Exposé", values: listings.map((l) => (l.exposeUrl ? "PDF" : null)) },
  ];

  // Zeilen ohne jede Angabe weglassen
  return rows.filter((row) => row.values.some((v) => v != null));
}

/** „Nur Unterschiede“: Zeilen, in denen sich mindestens zwei Objekte unterscheiden */
export const differingRows = (rows: CompareRow[]) => rows.filter((r) => new Set(r.values).size > 1);
