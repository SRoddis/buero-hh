import "server-only";

import { PAGE_SIZE, type FeatureKey, type LocationClass, type PropertyCategory, type PropertyType } from "@/lib/constants";
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

import type { PropertyRepository } from "./repository";

/** Zeile der View `property_listings` (siehe supabase/migrations). */
interface ListingRow {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string;
  category: PropertyCategory;
  property_type: PropertyType;
  commission_free: boolean;
  published_at: string | null;
  location_class: LocationClass;
  district_slug: string;
  district_name: string;
  address: string;
  lat: number;
  lng: number;
  area_min: number;
  area_max: number;
  rent_min: number | null;
  rent_max: number | null;
  rooms: number | null;
  floor_min: number;
  floor_max: number;
  unit_count: number;
  available_from: string | null;
  features: FeatureKey[];
  images: PropertyImage[];
  units: RentalUnit[];
  building: Omit<Building, "districtSlug" | "districtName" | "lat" | "lng" | "locationClass">;
  contact: Contact | null;
}

const SUMMARY_COLUMNS =
  "id,slug,title,teaser,category,property_type,commission_free,published_at,location_class,district_slug,district_name,address,lat,lng,area_min,area_max,rent_min,rent_max,rooms,floor_min,floor_max,unit_count,available_from,features,images";

const MARKER_COLUMNS =
  "id,slug,title,category,property_type,lat,lng,area_min,area_max,rent_min,rooms,address,district_name,images";

const SORT_COLUMNS: Record<SearchFilters["sort"], { column: string; ascending: boolean }> = {
  relevanz: { column: "published_at", ascending: false },
  neueste: { column: "published_at", ascending: false },
  "miete-asc": { column: "rent_min", ascending: true },
  "miete-desc": { column: "rent_min", ascending: false },
  "flaeche-asc": { column: "area_min", ascending: true },
  "flaeche-desc": { column: "area_max", ascending: false },
};

const FALLBACK_CONTACT: Contact = {
  id: "default",
  name: "BüroHamburg Vermietung",
  role: "Gewerbeimmobilien Hamburg",
  email: "info@buerohamburg.de",
  phone: "+49 40 300 865 0",
  imageUrl: null,
};

function toSummary(row: ListingRow): ListingSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    teaser: row.teaser,
    category: row.category,
    type: row.property_type,
    districtSlug: row.district_slug,
    districtName: row.district_name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    locationClass: row.location_class,
    areaMin: Number(row.area_min),
    areaMax: Number(row.area_max),
    rentMin: row.rent_min != null ? Number(row.rent_min) : null,
    rentMax: row.rent_max != null ? Number(row.rent_max) : null,
    rooms: row.rooms,
    floorMin: row.floor_min,
    floorMax: row.floor_max,
    unitCount: row.unit_count,
    availableFrom: row.available_from,
    features: row.features,
    commissionFree: row.commission_free,
    images: row.images ?? [],
    publishedAt: row.published_at ?? new Date(0).toISOString(),
  };
}

function toListing(row: ListingRow): Listing {
  const summary = toSummary(row);
  return {
    ...summary,
    description: row.description,
    building: {
      ...row.building,
      districtSlug: row.district_slug,
      districtName: row.district_name,
      lat: row.lat,
      lng: row.lng,
      locationClass: row.location_class,
    },
    units: row.units.map((u) => ({
      ...u,
      areaSqm: Number(u.areaSqm),
      rentPerSqm: u.rentPerSqm != null ? Number(u.rentPerSqm) : null,
      serviceChargePerSqm: u.serviceChargePerSqm != null ? Number(u.serviceChargePerSqm) : null,
    })),
    contact: row.contact ?? FALLBACK_CONTACT,
  };
}

function toMarker(row: Pick<ListingRow, "id" | "slug" | "title" | "category" | "property_type" | "lat" | "lng" | "area_min" | "area_max" | "rent_min" | "rooms" | "address" | "district_name" | "images">): MapMarker {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    type: row.property_type,
    lat: row.lat,
    lng: row.lng,
    areaMin: Number(row.area_min),
    areaMax: Number(row.area_max),
    rentMin: row.rent_min != null ? Number(row.rent_min) : null,
    rooms: row.rooms,
    address: row.address,
    districtName: row.district_name,
    images: (row.images ?? []).slice(0, 5),
  };
}

function searchArgs(f: SearchFilters) {
  return {
    p_districts: f.districts.length ? f.districts : null,
    p_category: f.category,
    p_types: f.types.length ? f.types : null,
    p_location_class: f.locationClass,
    p_area_min: f.areaMin,
    p_area_max: f.areaMax,
    p_rent_min: f.rentMin,
    p_rent_max: f.rentMax,
    p_features: f.features.length ? f.features : null,
    p_bbox: f.bbox,
  };
}

export class SupabasePropertyRepository implements PropertyRepository {
  private db = getSupabase();

  async search(filters: SearchFilters): Promise<SearchResult> {
    const args = searchArgs(filters);
    const sort = SORT_COLUMNS[filters.sort];
    const from = (filters.page - 1) * PAGE_SIZE;

    const [page, markers] = await Promise.all([
      this.db
        .rpc("search_properties", args, { count: "exact" })
        .select(SUMMARY_COLUMNS)
        .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
        .order("id")
        .range(from, from + PAGE_SIZE - 1),
      this.db.rpc("search_properties", args).select(MARKER_COLUMNS).limit(2000),
    ]);

    if (page.error) throw page.error;
    if (markers.error) throw markers.error;

    const total = page.count ?? 0;
    return {
      items: (page.data as unknown as ListingRow[]).map(toSummary),
      total,
      page: filters.page,
      pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      markers: (markers.data as unknown as ListingRow[]).map(toMarker),
    };
  }

  async getBySlug(slug: string) {
    const { data, error } = await this.db
      .from("property_listings")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return data ? toListing(data as ListingRow) : null;
  }

  async getByIds(ids: string[]) {
    const uuids = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
    if (!uuids.length) return [];
    const { data, error } = await this.db
      .from("property_listings")
      .select(SUMMARY_COLUMNS)
      .in("id", uuids)
      .eq("status", "published");
    if (error) throw error;
    return (data as unknown as ListingRow[]).map(toSummary);
  }

  async getSimilar(listing: Listing, limit = 3) {
    const { data, error } = await this.db
      .rpc("search_properties", { p_category: listing.category })
      .select(SUMMARY_COLUMNS)
      .neq("id", listing.id)
      .limit(30);
    if (error) throw error;
    return (data as unknown as ListingRow[])
      .map(toSummary)
      .sort((a, b) => score(b, listing) - score(a, listing))
      .slice(0, limit);
  }

  async listDistricts(): Promise<District[]> {
    const { data, error } = await this.db
      .from("districts")
      .select("slug,name,borough,location_class,center_lng,center_lat")
      .order("name");
    if (error) throw error;
    return data.map((d) => ({
      slug: d.slug,
      name: d.name,
      borough: d.borough,
      locationClass: d.location_class,
      center: [d.center_lng, d.center_lat] as [number, number],
    }));
  }

  async createInquiry(input: InquiryInput) {
    const { error } = await this.db.from("inquiries").insert({
      property_id: /^[0-9a-f-]{36}$/i.test(input.propertyId) ? input.propertyId : null,
      name: input.name,
      company: input.company ?? null,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message,
    });
    if (error) throw error;
  }
}

function score(candidate: ListingSummary, listing: Listing) {
  return (
    (candidate.districtSlug === listing.districtSlug ? 3 : 0) +
    (candidate.type === listing.type ? 2 : 0) +
    (candidate.locationClass === listing.locationClass ? 1 : 0)
  );
}

