"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "bh:merkliste";

interface FavoritesContextValue {
  ids: string[];
  ready: boolean;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Merkliste ohne Login – lokal im Browser gespeichert. */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) setIds(stored.filter((v) => typeof v === "string"));
    } catch {
      // ungültiger oder blockierter Speicher – Merkliste startet leer
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Speichern nicht möglich (z. B. privater Modus)
    }
  }, [ids, ready]);

  const toggle = useCallback(
    (id: string) => {
      const added = !ids.includes(id);
      setIds((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]));
      return added;
    },
    [ids],
  );

  const value = useMemo(
    () => ({ ids, ready, isFavorite: (id: string) => ids.includes(id), toggle }),
    [ids, ready, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites muss innerhalb von <FavoritesProvider> verwendet werden");
  return context;
}
