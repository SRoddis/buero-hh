"use client";

import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ListingImage } from "@/components/listing/listing-image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { PropertyImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ImageGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const show = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const [main, ...rest] = images;
  const thumbs = rest.slice(0, 4);

  return (
    <>
      <div className="relative grid h-[260px] gap-2 overflow-hidden rounded-xl sm:h-[380px] md:grid-cols-4 md:grid-rows-2 lg:h-[460px]">
        <GalleryTile
          className="md:col-span-2 md:row-span-2"
          image={main}
          alt={main?.alt ?? title}
          onClick={() => show(0)}
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        {thumbs.map((image, i) => (
          <GalleryTile
            key={image.id}
            className="hidden md:block"
            image={image}
            alt={image.alt}
            onClick={() => show(i + 1)}
            sizes="25vw"
          />
        ))}
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => show(0)}
            className="absolute right-4 bottom-4 flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-medium shadow-md transition-colors hover:bg-muted"
          >
            <Images className="size-4" />
            Alle {images.length} Bilder
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(1200px,96vw)] gap-0 border-0 bg-black p-0 text-white sm:max-w-[min(1200px,96vw)]">
          <DialogTitle className="sr-only">Bildergalerie: {title}</DialogTitle>
          <div className="relative aspect-[3/2] w-full">
            <ListingImage
              key={images[index]?.id}
              src={images[index]?.url}
              alt={images[index]?.alt ?? title}
              fill
              sizes="96vw"
              className="object-contain"
            />
            {images.length > 1 && (
              <>
                <LightboxButton side="left" onClick={() => step(-1)} />
                <LightboxButton side="right" onClick={() => step(1)} />
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span className="truncate text-white/80">{images[index]?.alt}</span>
            <span className="shrink-0 tabular-nums">
              {index + 1} / {images.length}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 pb-4">
            {images.map((image, i) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-md opacity-60 transition-opacity hover:opacity-100",
                  i === index && "opacity-100 ring-2 ring-white",
                )}
                aria-label={`Bild ${i + 1} anzeigen`}
              >
                <ListingImage src={image.url} alt="" fill sizes="80px" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GalleryTile({
  image,
  alt,
  className,
  onClick,
  priority,
  sizes,
}: {
  image?: PropertyImage;
  alt: string;
  className?: string;
  onClick: () => void;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("group relative overflow-hidden bg-muted", className)}
      aria-label={`${alt} vergrößern`}
    >
      <ListingImage
        src={image?.url}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </button>
  );
}

function LightboxButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Vorheriges Bild" : "Nächstes Bild"}
      className={cn(
        "absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg hover:bg-white",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
