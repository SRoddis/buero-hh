import type { Metadata } from "next";

import { CompareView } from "@/components/compare/compare-view";
import { MAX_COMPARE } from "@/lib/constants";
import { getRepository } from "@/lib/data/repository";
import type { Listing, ListingSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "Immobilien vergleichen",
  robots: { index: false },
};

type SearchParams = Promise<{ nr?: string; ids?: string }>;

const parseList = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE);

/**
 * /immobilien/vergleich?nr=097,25003 – teilbarer Link über die FileMaker-Objektnummern (dauerhaft stabil).
 * ?ids=… (interne IDs) nutzt die Vergleichsleiste der Suche; die Seite stellt die Adresse dann auf ?nr= um.
 */
export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const numbers = parseList(params.nr);
  const ids = numbers.length ? [] : parseList(params.ids);

  const repository = await getRepository();
  const summaries = numbers.length
    ? await repository.getByReferenceNumbers(numbers)
    : ids.length
      ? await repository.getByIds(ids)
      : [];
  // Reihenfolge wie in der URL
  const ordered = (numbers.length ? numbers : ids)
    .map((key) => summaries.find((s) => (numbers.length ? s.referenceNumber : s.id) === key))
    .filter((s): s is ListingSummary => s !== undefined);

  // Vollständige Daten (Mieteinheiten, Exposé) für die Vergleichstabelle
  const listings = (await Promise.all(ordered.map((s) => repository.getByReferenceNumber(s.referenceNumber)))).filter(
    (l): l is Listing => l !== null,
  );
  // Objekte aus einem älteren Link, die inzwischen vermietet bzw. offline sind
  const missing = (numbers.length || ids.length) - listings.length;

  return <CompareView listings={listings} missing={missing} />;
}
