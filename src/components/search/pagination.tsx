"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** Seitenzahlen mit Auslassungen, z. B. 1 … 4 5 6 … 12 */
function pageItems(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < pageCount - 1) items.push("…");
  items.push(pageCount);
  return items;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const base =
    "flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Seitennavigation">
      <button
        type="button"
        className={cn(base, "border bg-white hover:bg-muted")}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Vorherige Seite"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pageItems(page, pageCount).map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(base, item === page ? "bg-brand text-white" : "hover:bg-white")}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className={cn(base, "border bg-white hover:bg-muted")}
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Nächste Seite"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
