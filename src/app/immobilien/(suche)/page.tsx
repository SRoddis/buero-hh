import type { Metadata } from "next";

import { SearchProvider } from "@/components/search/search-context";
import { SearchView } from "@/components/search/search-view";
import { getRepository } from "@/lib/data/repository";
import { contentFilterKey, parseSearchParams } from "@/lib/search/params";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Gewerbeimmobilien in Hamburg suchen",
  description:
    "Büro-, Praxis-, Laden- und Gastroflächen in Hamburg: filtern Sie nach Stadtteil, Fläche, Mietpreis und Ausstattung – mit interaktiver Karte.",
};

export default async function ImmobilienPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseSearchParams(await searchParams);
  const repository = await getRepository();
  const [result, districts] = await Promise.all([repository.search(filters), repository.listDistricts()]);

  return (
    <SearchProvider filters={filters} districts={districts}>
      <SearchView result={result} fitKey={contentFilterKey(filters)} />
    </SearchProvider>
  );
}
