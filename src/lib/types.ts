import type {
  FeatureKey,
  LocationClass,
  PropertyCategory,
  PropertyType,
  SortKey,
} from "@/lib/constants";

/**
 * Domänenmodell – spiegelt das Supabase-Schema (siehe supabase/migrations):
 *   districts ─┐
 *              └─ buildings ── properties ──┬─ rental_units
 *   contacts ──────────────────┘            └─ property_images
 */

export interface District {
  slug: string;
  name: string;
  /** Bezirk, z. B. "Hamburg-Mitte" */
  borough: string;
  center: [lng: number, lat: number];
  locationClass: LocationClass;
}

export interface Building {
  id: string;
  name: string | null;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  districtSlug: string;
  districtName: string;
  lat: number;
  lng: number;
  locationClass: LocationClass;
  yearBuilt: number | null;
  yearRenovated: number | null;
  floors: number | null;
  features: FeatureKey[];
}

export interface RentalUnit {
  id: string;
  label: string;
  /** 0 = Erdgeschoss, negative Werte = Untergeschoss */
  floor: number;
  areaSqm: number;
  /** Nettokaltmiete in €/m²; null = Preis auf Anfrage */
  rentPerSqm: number | null;
  serviceChargePerSqm: number | null;
  /** ISO-Datum; null = sofort verfügbar */
  availableFrom: string | null;
  rooms: number | null;
  divisible: boolean;
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  imageUrl: string | null;
}

/** Vollständige Immobilie für die Detailseite. */
export interface Listing extends ListingSummary {
  description: string;
  building: Building;
  units: RentalUnit[];
  contact: Contact;
}

/** Kompakte Darstellung für Trefferliste, Merkliste und Karte. */
export interface ListingSummary {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  category: PropertyCategory;
  type: PropertyType;
  districtSlug: string;
  districtName: string;
  address: string;
  lat: number;
  lng: number;
  locationClass: LocationClass;
  areaMin: number;
  areaMax: number;
  /** null = Mietpreis auf Anfrage */
  rentMin: number | null;
  rentMax: number | null;
  rooms: number | null;
  floorMin: number;
  floorMax: number;
  unitCount: number;
  availableFrom: string | null;
  features: FeatureKey[];
  commissionFree: boolean;
  images: PropertyImage[];
  publishedAt: string;
}

export type MapMarker = Pick<
  ListingSummary,
  | "id"
  | "slug"
  | "title"
  | "category"
  | "type"
  | "lat"
  | "lng"
  | "areaMin"
  | "areaMax"
  | "rentMin"
  | "rooms"
  | "address"
  | "districtName"
  | "images"
>;

export interface SearchFilters {
  districts: string[];
  category: PropertyCategory | null;
  types: PropertyType[];
  locationClass: LocationClass | null;
  areaMin: number | null;
  areaMax: number | null;
  rentMin: number | null;
  rentMax: number | null;
  features: FeatureKey[];
  sort: SortKey;
  page: number;
  /** Kartenausschnitt [west, south, east, north] – nur gesetzt, wenn „Suche im Kartenausschnitt“ aktiv ist */
  bbox: [number, number, number, number] | null;
}

export interface SearchResult {
  items: ListingSummary[];
  total: number;
  page: number;
  pageCount: number;
  markers: MapMarker[];
}

export interface InquiryInput {
  propertyId: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message: string;
}
