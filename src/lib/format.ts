import type { ListingSummary } from "@/lib/types";

const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const date = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

export function formatArea(value: number) {
  return `${number.format(value)} m²`;
}

export function formatAreaRange(min: number, max: number) {
  return min === max ? formatArea(min) : `${number.format(min)} – ${number.format(max)} m²`;
}

/** „weitere Flächen 15 – 60 m²“ – nur wenn das Objekt mehr als die angebotene Fläche bietet */
export function formatFurtherAreas(listing: Pick<ListingSummary, "area" | "areaRangeMin" | "areaRangeMax">) {
  const { area, areaRangeMin: min, areaRangeMax: max } = listing;
  if (min == null && max == null) return null;
  if (min != null && max != null) return min === max && min === area ? null : formatAreaRange(min, max);
  return min != null ? `ab ${formatArea(min)}` : `bis ${formatArea(max!)}`;
}

export function formatRent(value: number) {
  return `${currency.format(value)} €`;
}

type PriceFields = Pick<ListingSummary, "rentPerSqm" | "rentTotalMonthly" | "priceType">;

/** „24,50 € / m²“, „1.060,00 € / Monat“ oder „auf Anfrage“ */
export function formatRentLabel(listing: PriceFields) {
  if (listing.priceType === "monat" && listing.rentTotalMonthly != null) {
    return `${formatRent(listing.rentTotalMonthly)} / Monat`;
  }
  if (listing.rentPerSqm == null) return "auf Anfrage";
  return `${formatRent(listing.rentPerSqm)} / m²`;
}

/** Kurzform für Preis-Pins auf der Karte */
export function formatRentShort(listing: PriceFields) {
  if (listing.priceType === "monat" && listing.rentTotalMonthly != null) {
    return `${number.format(listing.rentTotalMonthly)} €`;
  }
  return listing.rentPerSqm == null ? "auf Anfrage" : `${formatRent(listing.rentPerSqm)}/m²`;
}

/** Bei Pauschalmiete zusätzlich der umgerechnete m²-Preis */
export function formatRentPerSqmHint(listing: PriceFields) {
  return listing.priceType === "monat" && listing.rentPerSqm != null ? `≈ ${formatRent(listing.rentPerSqm)} / m²` : null;
}

export function formatCommission(listing: Pick<ListingSummary, "commissionFree" | "commissionMonths">) {
  if (listing.commissionFree) return "provisionsfrei";
  if (listing.commissionMonths != null) {
    return `${decimal.format(listing.commissionMonths)} ${listing.commissionMonths === 1 ? "Monatsmiete" : "Monatsmieten"}`;
  }
  return "nach Vereinbarung";
}

export function formatFloor(floor: number) {
  if (floor === 0) return "EG";
  if (floor < 0) return `${Math.abs(floor)}. UG`;
  return `${floor}. OG`;
}

export function formatAvailability(iso: string | null) {
  if (!iso) return "auf Anfrage";
  return new Date(iso) <= new Date() ? "sofort" : `ab ${date.format(new Date(iso))}`;
}

export function formatNumber(value: number) {
  return number.format(value);
}

export function formatCount(n: number, singular: string, plural: string) {
  return `${number.format(n)} ${n === 1 ? singular : plural}`;
}
