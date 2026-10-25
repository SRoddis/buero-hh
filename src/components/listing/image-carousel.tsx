"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import { useSwipeArea } from "@/hooks/use-swipe";
import type { PropertyImage } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ListingImage } from "./listing-image";
import { SlideTransition } from "./slide-transition";

interface ImageCarouselProps {
  images: PropertyImage[];
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Overlays wie Badges oder Merklisten-Button */
  children?: React.ReactNode;
  /** Maximale Anzahl durchblätterbarer Bilder */
  maxImages?: number;
  className?: string;
}

/**
 * Bildwechsler für Karten in Liste und Kartenpopup.
 * Pfeile erscheinen beim Hover über das umgebende Element mit der Klasse `group`.
 */
export function ImageCarousel({
  images,
  alt,
  sizes,
  priority,
  children,
  maxImages = 5,
  className,
}: ImageCarouselProps) {
  const [{ index, dir }, setSlide] = useState<{ index: number; dir: 1 | -1 }>({ index: 0, dir: 1 });
  // Nachbarbilder erst nach der ersten Interaktion vorladen, damit die Liste nicht alle Bilder auf einmal lädt
  const [warm, setWarm] = useState(false);
  const visible = images.slice(0, maxImages);
  const wrap = (i: number) => (i + visible.length) % visible.length;

  const go = (delta: 1 | -1) => {
    setWarm(true);
    setSlide((s) => ({ index: wrap(s.index + delta), dir: delta }));
  };
  // Wischen auch dann, wenn eine Link-Fläche der Karte über dem Bild liegt (siehe data-swipe-area)
  const rootRef = useRef<HTMLDivElement>(null);
  useSwipeArea(rootRef, { onNext: () => go(1), onPrevious: () => go(-1) }, visible.length > 1);

  const step = (delta: 1 | -1) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    go(delta);
  };

  const renderImage = (i: number, imageClassName?: string) => {
    const image = visible[i];
    return (
      <ListingImage
        src={image?.thumbUrl ?? image?.url}
        alt={image?.alt ?? alt}
        fill
        priority={priority && i === 0}
        sizes={sizes}
        className={cn("transition-transform duration-500 group-hover:scale-[1.03]", imageClassName)}
      />
    );
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative aspect-[16/10] overflow-hidden bg-muted", className)}
      onPointerEnter={visible.length > 1 ? () => setWarm(true) : undefined}
    >
      {warm &&
        visible.length > 1 &&
        [wrap(index + 1), wrap(index - 1)]
          .filter((i) => i !== index)
          .map((i) => (
            <div key={visible[i].id} className="invisible absolute inset-0" aria-hidden>
              {renderImage(i)}
            </div>
          ))}
      <SlideTransition index={index} direction={dir} render={renderImage} />
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
