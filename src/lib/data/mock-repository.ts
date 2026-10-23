import "server-only";

import { searchInMemory } from "@/lib/search/filter";
import type { InquiryInput, Listing, SearchFilters } from "@/lib/types";

import { DISTRICTS } from "./mock/districts";
import { MOCK_LISTINGS } from "./mock/listings";
import type { PropertyRepository } from "./repository";
import { toSummary } from "./summary";

const SUMMARIES = MOCK_LISTINGS.map(toSummary);

export class MockPropertyRepository implements PropertyRepository {
  async search(filters: SearchFilters) {
    return searchInMemory(SUMMARIES, filters);
  }

  async getBySlug(slug: string) {
    return MOCK_LISTINGS.find((l) => l.slug === slug) ?? null;
  }

  async getByIds(ids: string[]) {
    return SUMMARIES.filter((l) => ids.includes(l.id));
  }

  async getSimilar(listing: Listing, limit = 3) {
    return SUMMARIES.filter((l) => l.id !== listing.id && l.category === listing.category)
      .map((l) => ({
        l,
        score:
          (l.districtSlug === listing.districtSlug ? 3 : 0) +
          (l.type === listing.type ? 2 : 0) +
          (l.locationClass === listing.locationClass ? 1 : 0) -
          Math.abs(l.areaMax - listing.areaMax) / 1000,
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
