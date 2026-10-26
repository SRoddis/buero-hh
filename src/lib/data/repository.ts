import "server-only";

import type { PropertyCategory } from "@/lib/constants";
import type {
  District,
  InquiryInput,
  Listing,
  ListingSummary,
  SearchFilters,
  SearchResult,
} from "@/lib/types";

/**
 * Zentrale Datenzugriffs-Schnittstelle. Seiten und Server Actions kennen nur dieses Interface;
 * die Daten kommen aus Supabase (`getRepository()`).
 */
export interface PropertyRepository {
  search(filters: SearchFilters): Promise<SearchResult>;
  /** Vollständiges Objekt für die Detailseite über die FileMaker-Objektnummer */
  getByReferenceNumber(referenceNumber: string): Promise<Listing | null>;
  getByIds(ids: string[]): Promise<ListingSummary[]>;
  /** Über die FileMaker-Objektnummern – dauerhaft stabil, daher für geteilte Links */
  getByReferenceNumbers(referenceNumbers: string[]): Promise<ListingSummary[]>;
  getSimilar(listing: Listing, limit?: number): Promise<ListingSummary[]>;
  /** Top-Objekte der Startseite (FileMaker-Feld webs_home, Rang 1 zuerst) */
  getFeatured(limit?: number): Promise<ListingSummary[]>;
  /** Anzahl veröffentlichter Objekte – gesamt und je Objektart (gemischte Objekte zählen in jeder ihrer Arten) */
  countListings(): Promise<{ total: number; byCategory: Record<PropertyCategory, number> }>;
  listDistricts(): Promise<District[]>;
  createInquiry(input: InquiryInput): Promise<void>;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY));
}

/**
 * Datenquelle nicht verfügbar (fehlende Konfiguration). Bewusst kein Rückfall auf Testdaten –
 * die Seiten zeigen stattdessen die Störungsseite (src/app/error.tsx).
 */
export class DataSourceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataSourceUnavailableError";
  }
}

let repository: Promise<PropertyRepository> | undefined;

export function getRepository(): Promise<PropertyRepository> {
  if (!isSupabaseConfigured()) {
    // Nicht zwischenspeichern: Sobald die Umgebungsvariablen gesetzt sind, klappt der nächste Aufruf
    return Promise.reject(
      new DataSourceUnavailableError("Supabase ist nicht konfiguriert (SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY fehlen)"),
    );
  }
  repository ??= import("./supabase-repository").then(({ SupabasePropertyRepository }) => new SupabasePropertyRepository());
  return repository;
}
