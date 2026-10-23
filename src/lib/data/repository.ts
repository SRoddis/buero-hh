import "server-only";

import type {
  District,
  InquiryInput,
  Listing,
  ListingSummary,
  SearchFilters,
  SearchResult,
} from "@/lib/types";

/**
 * Zentrale Datenzugriffs-Schnittstelle. Seiten und Server Actions kennen nur dieses Interface –
 * ob die Daten aus Mock-Daten oder Supabase kommen, entscheidet `getRepository()`.
 */
export interface PropertyRepository {
  search(filters: SearchFilters): Promise<SearchResult>;
  getBySlug(slug: string): Promise<Listing | null>;
  getByIds(ids: string[]): Promise<ListingSummary[]>;
  getSimilar(listing: Listing, limit?: number): Promise<ListingSummary[]>;
  listDistricts(): Promise<District[]>;
  createInquiry(input: InquiryInput): Promise<void>;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

let repository: Promise<PropertyRepository> | undefined;

/** DATA_SOURCE=mock|supabase erzwingt eine Quelle; sonst Supabase, sobald konfiguriert. */
export function getRepository(): Promise<PropertyRepository> {
  repository ??= (async () => {
    const source = process.env.DATA_SOURCE ?? (isSupabaseConfigured() ? "supabase" : "mock");
    if (source === "supabase") {
      const { SupabasePropertyRepository } = await import("./supabase-repository");
      return new SupabasePropertyRepository();
    }
    const { MockPropertyRepository } = await import("./mock-repository");
    return new MockPropertyRepository();
  })();
  return repository;
}
