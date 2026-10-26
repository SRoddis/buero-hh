import "server-only";

import {
  PAGE_SIZE,
  PROPERTY_CATEGORIES,
  type FeatureKey,
  type MarketArea,
  type PropertyCategory,
  type PropertyType,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabase } from "@/lib/supabase/server";
import type {
  Building,
  Contact,
  District,
  InquiryInput,
  Listing,
  ListingSummary,
  MapMarker,
  PropertyImage,
  RentalUnit,
  SearchFilters,
  SearchResult,
} from "@/lib/types";

import { DEFAULT_CONTACT } from "./contact";
import type { PropertyRepository } from "./repository";

/** Zeile der View `property_listings` (JSON-Spalten sind in den generierten Typen nur als Json typisiert). */
interface ListingRow {
  id: string;
  reference_number: string;
  slug: string;
  title: string;
  teaser: string;
  description: string;
  category: PropertyCategory;
  categories: PropertyCategory[];
  property_type: PropertyType;
  price_type: "qm" | "monat";
  price_note: string | null;
  commission_free: boolean;
  commission_months: number | null;
  commission_note: string | null;
  expose_pdf_url: string | null;
  featured_rank: number | null;
  market_area: MarketArea;
  district_slug: string;
  district_name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  area: number;
  area_range_min: number | null;
  area_range_max: number | null;
  rent_per_sqm: number | null;
  rent_total_monthly: number | null;
  features: FeatureKey[];
  images: PropertyImage[];
  units: RentalUnit[];
  building: Building;
  contact: Contact | null;
}

const SUMMARY_COLUMNS =
  // reference_sort wird für die Sortierung benötigt (PostgREST sortiert RPC-Ergebnisse nur nach ausgewählten Spalten)
  "id,reference_number,reference_sort,slug,title,teaser,category,categories,property_type,price_type,price_note,commission_free,commission_months,featured_rank,market_area,district_slug,district_name,address,lat,lng,area,area_range_min,area_range_max,rent_per_sqm,rent_total_monthly,features,images";

const MARKER_COLUMNS =
  "id,reference_number,slug,title,category,categories,property_type,lat,lng,area,rent_per_sqm,rent_total_monthly,price_type,address,district_name,images";

/** Sortierung über PostgREST; Relevanz = Hervorhebung zuerst, danach die neuesten Objekte */
const SORT_COLUMNS: Record<SearchFilters["sort"], { column: string; ascending: boolean }[]> = {
  relevanz: [
    { column: "featured_rank", ascending: true },
    { column: "reference_sort", ascending: false },
  ],
  neueste: [{ column: "reference_sort", ascending: false }],
  "miete-asc": [{ column: "rent_per_sqm", ascending: true }],
  "miete-desc": [{ column: "rent_per_sqm", ascending: false }],
  "flaeche-asc": [{ column: "area", ascending: true }],
  "flaeche-desc": [{ column: "area", ascending: false }],
};

const toNumber = (value: number | string | null) => (value == null ? null : Number(value));

function toSummary(row: ListingRow): ListingSummary {
  return {
    id: row.id,
    slug: row.slug,
    referenceNumber: row.reference_number,
    title: row.title,
    teaser: row.teaser,
    category: row.category,
    categories: row.categories,
    type: row.property_type,
    districtSlug: row.district_slug,
    districtName: row.district_name,
    marketArea: row.market_area,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    area: Number(row.area),
    areaRangeMin: toNumber(row.area_range_min),
    areaRangeMax: toNumber(row.area_range_max),
    rentPerSqm: toNumber(row.rent_per_sqm),
    rentTotalMonthly: toNumber(row.rent_total_monthly),
    priceType: row.price_type,
    priceNote: row.price_note,
    commissionFree: row.commission_free,
    commissionMonths: toNumber(row.commission_months),
    features: row.features,
    images: row.images ?? [],
    featuredRank: row.featured_rank,
  };
}

function toListing(row: ListingRow): Listing {
  return {
    ...toSummary(row),
    description: row.description,
    commissionNote: row.commission_note,
    exposeUrl: row.expose_pdf_url,
    building: row.building,
    units: row.units.map((u) => ({
      ...u,
      areaSqm: Number(u.areaSqm),
      rentPerSqm: toNumber(u.rentPerSqm),
      rentTotalMonthly: toNumber(u.rentTotalMonthly),
      serviceChargePerSqm: toNumber(u.serviceChargePerSqm),
    })),
    contact: row.contact ?? DEFAULT_CONTACT,
  };
}

function toMarker(row: ListingRow): MapMarker | null {
  if (row.lat == null || row.lng == null) return null;
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    slug: row.slug,
    title: row.title,
    category: row.category,
    categories: row.categories,
    type: row.property_type,
    lat: row.lat,
    lng: row.lng,
    area: Number(row.area),
    rentPerSqm: toNumber(row.rent_per_sqm),
    rentTotalMonthly: toNumber(row.rent_total_monthly),
    priceType: row.price_type,
    address: row.address,
    districtName: row.district_name,
    images: (row.images ?? []).slice(0, 5),
  };
}

type SearchArgs = Database["public"]["Functions"]["search_properties"]["Args"];

/** Nicht gesetzte Filter werden weggelassen – die SQL-Funktion nutzt dann ihren Standardwert (null). */
function searchArgs(f: SearchFilters): SearchArgs {
  const orUndefined = <T>(value: T | null) => value ?? undefined;
  return {
    p_districts: f.districts.length ? f.districts : undefined,
    p_category: orUndefined(f.category),
    p_market_area: orUndefined(f.marketArea),
    p_area_min: orUndefined(f.areaMin),
    p_area_max: orUndefined(f.areaMax),
    p_rent_min: orUndefined(f.rentMin),
    p_rent_max: orUndefined(f.rentMax),
    p_features: f.features.length ? f.features : undefined,
    p_bbox: orUndefined(f.bbox),
  };
}

const UUID = /^[0-9a-f-]{36}$/i;
/** Maximale Zeilenzahl pro Abfrage (Supabase-Standard „max rows“) */
const MAX_ROWS = 1000;

export class SupabasePropertyRepository implements PropertyRepository {
  private db = getSupabase();

  async search(filters: SearchFilters): Promise<SearchResult> {
    const args = searchArgs(filters);
    const from = (filters.page - 1) * PAGE_SIZE;

    let pageQuery = this.db.rpc("search_properties", args, { count: "exact" }).select(SUMMARY_COLUMNS);
    for (const { column, ascending } of SORT_COLUMNS[filters.sort]) {
      pageQuery = pageQuery.order(column, { ascending, nullsFirst: false });
    }

    const [page, markerRows] = await Promise.all([
      pageQuery.order("id").range(from, from + PAGE_SIZE - 1),
      this.allMarkerRows(args),
    ]);

    if (page.error) throw page.error;

    const total = page.count ?? 0;
    return {
      items: (page.data as unknown as ListingRow[]).map(toSummary),
      total,
      page: filters.page,
      pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      markers: markerRows.map(toMarker).filter((m): m is MapMarker => m !== null),
    };
  }

  async getFeatured(limit = 4) {
    const { data, error } = await this.db
      .rpc("search_properties", {})
      .select(SUMMARY_COLUMNS)
      .not("featured_rank", "is", null)
      .order("featured_rank", { ascending: true })
      .order("reference_sort", { ascending: true })
      .limit(limit * 3);
    if (error) throw error;
    // Je Rang nur ein Objekt (bei gleichem Rang die niedrigere Objektnummer) – so wählt auch buerohamburg.de (/api/objects/home)
    const seenRanks = new Set<number>();
    return (data as unknown as ListingRow[])
      .map(toSummary)
      .filter((l) => !seenRanks.has(l.featuredRank!) && seenRanks.add(l.featuredRank!))
      .slice(0, limit);
  }

  async countListings() {
    const count = async (args: SearchArgs) => {
      const { count, error } = await this.db.rpc("search_properties", args, { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    };
    const [total, ...perCategory] = await Promise.all([
      count({}),
      ...PROPERTY_CATEGORIES.map(({ value }) => count({ p_category: value })),
    ]);
    return {
      total,
      byCategory: Object.fromEntries(PROPERTY_CATEGORIES.map(({ value }, i) => [value, perCategory[i]])) as Record<
        PropertyCategory,
        number
      >,
    };
  }

  /** Supabase liefert höchstens 1.000 Zeilen pro Abfrage – Kartenpunkte daher seitenweise laden. */
  private async allMarkerRows(args: SearchArgs): Promise<ListingRow[]> {
    const rows: ListingRow[] = [];
    for (let from = 0; ; from += MAX_ROWS) {
      const { data, error } = await this.db
        .rpc("search_properties", args)
        .select(MARKER_COLUMNS)
        .order("id")
        .range(from, from + MAX_ROWS - 1);
      if (error) throw error;
      rows.push(...(data as unknown as ListingRow[]));
      if (data.length < MAX_ROWS) return rows;
    }
  }

  async getByReferenceNumber(referenceNumber: string) {
    const { data, error } = await this.db
      .from("property_listings")
      .select("*")
      .eq("reference_number", referenceNumber)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return data ? toListing(data as unknown as ListingRow) : null;
  }

  async getByIds(ids: string[]) {
    const uuids = ids.filter((id) => UUID.test(id));
    if (!uuids.length) return [];
    const { data, error } = await this.db
      .from("property_listings")
      .select(SUMMARY_COLUMNS)
      .in("id", uuids)
      .eq("status", "published");
    if (error) throw error;
    return (data as unknown as ListingRow[]).map(toSummary);
  }

  async getByReferenceNumbers(referenceNumbers: string[]) {
    if (!referenceNumbers.length) return [];
    const { data, error } = await this.db
      .from("property_listings")
      .select(SUMMARY_COLUMNS)
      .in("reference_number", referenceNumbers)
      .eq("status", "published");
    if (error) throw error;
    return (data as unknown as ListingRow[]).map(toSummary);
  }

  async getSimilar(listing: Listing, limit = 3) {
    const { data, error } = await this.db
      .rpc("search_properties", { p_category: listing.category, p_market_area: listing.marketArea })
      .select(SUMMARY_COLUMNS)
      .neq("id", listing.id)
      .limit(40);
    if (error) throw error;
    return (data as unknown as ListingRow[])
      .map(toSummary)
      .sort((a, b) => score(b, listing) - score(a, listing))
      .slice(0, limit);
  }

  async listDistricts(): Promise<District[]> {
    const { data, error } = await this.db
      .from("districts")
      .select("slug,name,market_area,center_lng,center_lat")
      .order("name");
    if (error) throw error;
    return data.map((d) => ({
      slug: d.slug,
      name: d.name,
      marketArea: d.market_area,
      center: d.center_lng != null && d.center_lat != null ? [d.center_lng, d.center_lat] : null,
    }));
  }

  async createInquiry(input: InquiryInput) {
    const { error } = await this.db.from("inquiries").insert({
      property_id: UUID.test(input.propertyId) ? input.propertyId : null,
      name: input.name,
      company: input.company ?? null,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message,
    });
    if (error) throw error;
  }
}

/** Ähnlichkeit: gleicher Stadtteil, vergleichbare Größe */
function score(candidate: ListingSummary, listing: Listing) {
  return (
    (candidate.districtSlug === listing.districtSlug ? 3 : 0) -
    Math.abs(Math.log((candidate.area || 1) / (listing.area || 1)))
  );
}
