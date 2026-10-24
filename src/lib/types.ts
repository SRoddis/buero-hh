import type { FeatureKey, MarketArea, PropertyCategory, PropertyType, SortKey } from "@/lib/constants";

/**
 * Domänenmodell – spiegelt das Supabase-Schema (siehe supabase/migrations):
 *   districts ─┐
 *              └─ buildings ── properties ──┬─ rental_units
 *   contacts ──────────────────┘            └─ property_images
 */

export interface District {
  slug: string;
  name: string;
  marketArea: MarketArea;
  center: [lng: number, lat: number] | null;
}

export interface Building {
  id: string;
  name: string | null;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  features: FeatureKey[];
}

export interface RentalUnit {
  id: string;
  label: string;
  floor: number | null;
  areaSqm: number;
  /** Nettokaltmiete in €/m²; null = Preis auf Anfrage */
  rentPerSqm: number | null;
  /** Pauschalmiete pro Monat (bei Preisart „Monat“) */
  rentTotalMonthly: number | null;
  serviceChargePerSqm: number | null;
  /** ISO-Datum; null = keine Angabe */
  availableFrom: string | null;
  rooms: number | null;
  divisible: boolean;
}

export interface PropertyImage {
  id: string;
  /** Große Variante (WebP 1280 px) bzw. Original, solange noch nicht umgewandelt */
  url: string;
  /** Kleine Variante (WebP 640 px) für Listen und Kartenpopups */
  thumbUrl?: string;
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

/** Kompakte Darstellung für Trefferliste, Merkliste und Karte. */
export interface ListingSummary {
  id: string;
  slug: string;
  /** Objektnummer aus FileMaker */
  referenceNumber: string;
  title: string;
  teaser: string;
  category: PropertyCategory;
  categories: PropertyCategory[];
  type: PropertyType;
  districtSlug: string;
  districtName: string;
  marketArea: MarketArea;
  address: string;
  /** null, wenn (noch) keine Koordinaten vorliegen */
  lat: number | null;
  lng: number | null;
  /** angebotene Mietfläche in m² */
  area: number;
  /** weitere Flächen im Objekt („ab ca. … / bis ca. … qm“) */
  areaRangeMin: number | null;
  areaRangeMax: number | null;
  /** Miete pro m²; null = auf Anfrage */
  rentPerSqm: number | null;
  /** Pauschalmiete pro Monat, falls so angeboten */
  rentTotalMonthly: number | null;
  priceType: "qm" | "monat";
  /** z. B. „zzgl. NK u. MwSt.“ */
  priceNote: string | null;
  commissionFree: boolean;
  /** Courtage in Monatsmieten (bei courtagepflichtigen Objekten) */
  commissionMonths: number | null;
  features: FeatureKey[];
  images: PropertyImage[];
  /** Hervorhebung (1 = ganz oben), null = keine */
  featuredRank: number | null;
}

/** Vollständige Immobilie für die Detailseite. */
export interface Listing extends ListingSummary {
  description: string;
  commissionNote: string | null;
  exposeUrl: string | null;
  building: Building;
  units: RentalUnit[];
  contact: Contact;
}

export type MapMarker = Pick<
  ListingSummary,
  | "id"
  | "slug"
  | "title"
  | "category"
  | "categories"
  | "type"
  | "area"
  | "rentPerSqm"
  | "rentTotalMonthly"
  | "priceType"
  | "address"
  | "districtName"
  | "images"
> & { lat: number; lng: number };

export interface SearchFilters {
  districts: string[];
  category: PropertyCategory | null;
  marketArea: MarketArea | null;
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
