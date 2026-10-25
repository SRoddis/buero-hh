"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { MAX_COMPARE } from "@/lib/constants";
import type { ListingSummary } from "@/lib/types";

const STORAGE_KEY = "bh:vergleich";

/** Das Nötigste für die Vergleichsleiste – so kann sie ohne Nachladen angezeigt werden */
export type CompareItem = Pick<
  ListingSummary,
  "id" | "title" | "districtName" | "area" | "rentPerSqm" | "rentTotalMonthly" | "priceType"
> & { imageUrl: string | null };

export const toCompareItem = (listing: ListingSummary): CompareItem => ({
  id: listing.id,
  title: listing.title,
  districtName: listing.districtName,
  area: listing.area,
  rentPerSqm: listing.rentPerSqm,
  rentTotalMonthly: listing.rentTotalMonthly,
  priceType: listing.priceType,
  imageUrl: listing.images[0]?.thumbUrl ?? listing.images[0]?.url ?? null,
});

interface CompareContextValue {
  items: CompareItem[];
  /** true, sobald die gespeicherte Auswahl geladen ist */
  ready: boolean;
  isSelected: (id: string) => boolean;
  /** false, wenn bereits MAX_COMPARE Objekte gewählt sind */
  add: (item: CompareItem) => boolean;
  remove: (id: string) => void;
  /** Auswahl komplett ersetzen (z. B. beim Öffnen eines geteilten Vergleichs) */
  replace: (items: CompareItem[]) => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

/** Auswahl für den Objektvergleich (bis zu 3 Objekte) – lokal im Browser gespeichert, wie die Merkliste. */
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) setItems(stored.filter((v) => typeof v?.id === "string").slice(0, MAX_COMPARE));
    } catch {
      // ungültiger oder blockierter Speicher – Auswahl startet leer
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Speichern nicht möglich (z. B. privater Modus)
    }
  }, [items, ready]);

  const add = useCallback(
    (item: CompareItem) => {
      if (items.some((i) => i.id === item.id)) return true;
      if (items.length >= MAX_COMPARE) return false;
      setItems((current) => (current.some((i) => i.id === item.id) ? current : [...current, item]));
      return true;
    },
    [items],
  );
  const remove = useCallback((id: string) => setItems((current) => current.filter((i) => i.id !== id)), []);
  const replace = useCallback((next: CompareItem[]) => setItems(next.slice(0, MAX_COMPARE)), []);

  const value = useMemo(
    () => ({ items, ready, isSelected: (id: string) => items.some((i) => i.id === id), add, remove, replace }),
    [items, ready, add, remove, replace],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare muss innerhalb von <CompareProvider> verwendet werden");
  return context;
}

export const compareHref = (ids: string[]) => `/immobilien/vergleich?ids=${ids.map(encodeURIComponent).join(",")}`;
