import type { ListingSummary } from "@/lib/types";

const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
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

export function formatRent(value: number) {
  return `${currency.format(value)} €`;
}

/** "24,50 € / m²", "ab 18,00 € / m²" oder "auf Anfrage" */
export function formatRentLabel(listing: Pick<ListingSummary, "rentMin" | "rentMax">) {
  if (listing.rentMin == null) return "auf Anfrage";
  const prefix = listing.rentMax != null && listing.rentMax !== listing.rentMin ? "ab " : "";
  return `${prefix}${formatRent(listing.rentMin)} / m²`;
}

export function formatFloor(floor: number) {
  if (floor === 0) return "EG";
  if (floor < 0) return `${Math.abs(floor)}. UG`;
  return `${floor}. OG`;
}

export function formatFloorRange(min: number, max: number) {
  if (min === max) return formatFloor(min);
  return min === 0 ? `EG – ${formatFloor(max)}` : `ab ${formatFloor(min)}`;
}

export function formatAvailability(iso: string | null) {
  if (!iso || new Date(iso) <= new Date()) return "sofort";
  return `ab ${date.format(new Date(iso))}`;
}

export function formatDate(iso: string) {
  return date.format(new Date(iso));
}

export function formatNumber(value: number) {
  return number.format(value);
}

export function formatCount(n: number, singular: string, plural: string) {
  return `${number.format(n)} ${n === 1 ? singular : plural}`;
}
