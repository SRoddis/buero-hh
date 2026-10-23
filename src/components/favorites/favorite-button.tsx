"use client";

import { HeartIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { useFavorites } from "./favorites-provider";

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
  variant?: "overlay" | "outline";
}

export function FavoriteButton({ listingId, className, variant = "overlay" }: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(listingId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Von der Merkliste entfernen" : "Zur Merkliste hinzufügen"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(listingId);
        toast(added ? "Zur Merkliste hinzugefügt" : "Von der Merkliste entfernt");
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        variant === "overlay"
          ? "size-9 bg-black/25 text-white backdrop-blur-sm hover:bg-black/40"
          : "size-10 border bg-white text-foreground hover:bg-muted",
        className,
      )}
    >
      <HeartIcon
        className={cn("size-5 transition-transform", active && "scale-110 fill-brand text-brand")}
        strokeWidth={2}
      />
    </button>
  );
}
