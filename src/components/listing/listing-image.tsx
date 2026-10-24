"use client";

import { Building } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

const isPreOptimized = (src: string) => src.includes("/storage/v1/object/public/") && src.endsWith(".webp");

/** next/image mit gestaltetem Platzhalter, falls ein Bild fehlt oder nicht geladen werden kann. */
export function ListingImage({ src, alt, className, ...props }: Omit<ImageProps, "src"> & { src?: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center bg-gradient-to-br from-brand-light to-muted text-brand/40",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <Building className="size-10" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
      // Bereits vom Sync als WebP aufbereitet und per CDN ausgeliefert → nicht erneut auf dem Server umrechnen
      unoptimized={isPreOptimized(src)}
      {...props}
    />
  );
}
