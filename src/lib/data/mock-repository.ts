import "server-only";

import { searchInMemory } from "@/lib/search/filter";
import type { District, InquiryInput, Listing, SearchFilters } from "@/lib/types";

import fixture from "./mock/fixture.json";
import type { PropertyRepository } from "./repository";
import { toSummary } from "./summary";

/**
 * Repräsentative Auswahl echter Objekte von buerohamburg.de (erzeugt mit `npm run db:seed:generate`).
 * Ermöglicht Entwicklung ohne Datenbank.
 */
const LISTINGS = fixture.listings as Listing[];
const DISTRICTS = fixture.districts as District[];
const SUMMARIES = LISTINGS.map(toSummary);

export class MockPropertyRepository implements PropertyRepository {
  async search(filters: SearchFilters) {
    return searchInMemory(SUMMARIES, filters);
  }

  async getBySlug(slug: string) {
    return LISTINGS.find((l) => l.slug === slug) ?? null;
  }

  async getByIds(ids: string[]) {
    return SUMMARIES.filter((l) => ids.includes(l.id));
  }

  async getSimilar(listing: Listing, limit = 3) {
    return SUMMARIES.filter((l) => l.id !== listing.id && l.categories.includes(listing.category))
      .map((l) => ({
        l,
        score:
          (l.districtSlug === listing.districtSlug ? 3 : 0) +
          (l.marketArea === listing.marketArea ? 1 : 0) -
          Math.abs(l.area - listing.area) / 1000,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ l }) => l);
  }

  async listDistricts() {
    return [...DISTRICTS].sort((a, b) => a.name.localeCompare(b.name, "de"));
  }

  async createInquiry(input: InquiryInput) {
    console.info("[mock] Neue Anfrage", input);
  }
}
