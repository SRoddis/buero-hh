"use client";

import { Building } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

const isPreOptimized = (src: string) => src.includes("/storage/v1/object/public/") && src.endsWith(".webp");

/** next/image mit Platzhalter, falls ein Objekt keine Bilder hat oder ein Bild nicht geladen werden kann. */
export function ListingImage({ src, alt, className, ...props }: Omit<ImageProps, "src"> & { src?: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <NoImage alt={alt} className={className} />;

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

/**
 * Platzhalter ohne Bilder: zarte Hamburg-Skyline am unteren Rand (volle Breite, damit Michel und
 * Elbphilharmonie auch in schmalen Karten sichtbar bleiben), darüber die Himmelsfarbe des Bildes.
 * Größen per Container-Query – in kleinen Vorschaubildern nur das Symbol.
 */
function NoImage({ alt, className }: { alt: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${alt} – aktuell keine Bilder verfügbar`}
      className={cn(
        "@container absolute inset-0 flex size-full flex-col items-center justify-center bg-[#fcf8f9] bg-[url(/images/keine-bilder-hintergrund.webp)] bg-[length:100%_auto] bg-bottom bg-no-repeat text-center",
        className,
      )}
    >
      {/* Abstand nach unten, damit der Inhalt über der Skyline steht */}
      <div className="flex flex-col items-center pb-[12%]">
        <span className="flex size-9 items-center justify-center rounded-full bg-white/80 text-brand/60 shadow-xs @[220px]:size-12 @[520px]:size-16">
          <Building className="size-4 @[220px]:size-5 @[520px]:size-7" strokeWidth={1.75} />
        </span>
        <p className="mt-2 hidden px-4 text-sm font-medium text-foreground/60 @[220px]:block @[520px]:mt-4 @[520px]:text-lg">
          Für dieses Objekt sind aktuell keine Bilder verfügbar.
        </p>
      </div>
    </div>
  );
}
