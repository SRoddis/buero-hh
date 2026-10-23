"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ListingCard } from "@/components/listing/listing-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListingSummary } from "@/lib/types";

import { useFavorites } from "./favorites-provider";

export function MerklisteView() {
  const { ids, ready } = useFavorites();
  const [items, setItems] = useState<ListingSummary[] | null>(null);
  const key = [...ids].sort().join(",");

  useEffect(() => {
    if (!ready) return;
    if (!key) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/listings?ids=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { items: ListingSummary[] }) => setItems(data.items))
      .catch(() => {});
    return () => controller.abort();
  }, [key, ready]);

  if (!ready || items === null) {
    return (
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl bg-white" />
        ))}
      </div>
    );
  }

  // Entfernte Objekte sofort ausblenden, ohne neu zu laden
  const visible = items.filter((item) => ids.includes(item.id));

  if (!visible.length) {
    return (
      <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed bg-white px-6 py-16 text-center">
        <Heart className="size-10 text-brand/60" />
        <h2 className="mt-4 text-lg font-semibold">Noch keine Objekte gemerkt</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Tippen Sie in der Suche auf das Herz-Symbol, um interessante Flächen hier zu sammeln und zu vergleichen.
        </p>
        <Button asChild size="lg" className="mt-6 h-11 px-6">
          <Link href="/immobilien">Immobilien entdecken</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((item) => (
        <ListingCard key={item.id} listing={item} />
      ))}
    </div>
  );
}
