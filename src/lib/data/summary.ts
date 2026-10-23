import type { Listing, ListingSummary } from "@/lib/types";

/** Reduziert eine vollständige Immobilie auf die Felder, die Liste und Karte benötigen. */
export function toSummary(listing: Listing): ListingSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { description, building, units, contact, ...summary } = listing;
  return summary;
}
