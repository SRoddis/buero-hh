"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { PropertyImage } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ListingImage } from "./listing-image";

interface ImageCarouselProps {
  images: PropertyImage[];
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Overlays wie Badges oder Merklisten-Button */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Bildwechsler für Karten in Liste und Kartenpopup.
 * Pfeile erscheinen beim Hover über das umgebende Element mit der Klasse `group`.
 */
export function ImageCarousel({ images, alt, sizes, priority, children, className }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const visible = images.slice(0, 5);
  const image = visible[index];

  const step = (delta: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + delta + visible.length) % visible.length);
  };

  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-muted", className)}>
      <ListingImage
        src={image?.url}
        alt={image?.alt ?? alt}
        fill
        priority={priority}
        sizes={sizes}
        className="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

      {visible.length > 1 && (
        <>
          <CarouselButton side="left" onClick={step(-1)} />
          <CarouselButton side="right" onClick={step(1)} />
          <div className="absolute right-3 bottom-4 flex gap-1">
            {visible.map((img, i) => (
              <span
                key={img.id}
                className={cn("size-1.5 rounded-full bg-white/60 transition-all", i === index && "w-3 bg-white")}
              />
            ))}
          </div>
        </>
      )}

      {children}
    </div>
  );
}

function CarouselButton({ side, onClick }: { side: "left" | "right"; onClick: (e: React.MouseEvent) => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Vorheriges Bild" : "Nächstes Bild"}
      className={cn(
        "absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-white focus-visible:opacity-100",
        side === "left" ? "left-2" : "right-2",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
