"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useOptimistic, useTransition } from "react";

import { DEFAULT_FILTERS, filtersToHref } from "@/lib/search/params";
import type { District, SearchFilters } from "@/lib/types";

interface SearchContextValue {
  /** Optimistisch aktualisierte Filter – reagieren sofort auf Eingaben */
  filters: SearchFilters;
  update: (patch: Partial<SearchFilters>) => void;
  reset: () => void;
  isPending: boolean;
  districts: District[];
}

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Die URL ist die einzige Quelle der Wahrheit: Filteränderungen schreiben die Suchparameter,
 * die Server-Komponente lädt daraufhin die passenden Treffer neu.
 */
export function SearchProvider({
  filters: serverFilters,
  districts,
  children,
}: {
  filters: SearchFilters;
  districts: District[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filters, setOptimisticFilters] = useOptimistic(serverFilters);

  const navigate = useCallback(
    (next: SearchFilters) => {
      startTransition(() => {
        setOptimisticFilters(next);
        router.replace(filtersToHref(next, pathname), { scroll: false });
      });
    },
    [pathname, router, setOptimisticFilters],
  );

  const update = useCallback(
    (patch: Partial<SearchFilters>) => navigate({ ...filters, page: 1, ...patch }),
    [filters, navigate],
  );

  const reset = useCallback(() => navigate({ ...DEFAULT_FILTERS, sort: filters.sort }), [filters.sort, navigate]);

  return (
    <SearchContext.Provider value={{ filters, update, reset, isPending, districts }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch muss innerhalb von <SearchProvider> verwendet werden");
  return context;
}

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
