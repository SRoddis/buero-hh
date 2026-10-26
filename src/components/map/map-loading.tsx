import { Wordmark } from "@/components/layout/logo";

/**
 * Ladezustand der Karte: Bildmarke und Schriftzug in Markenfarbe, sanft pulsierend. Wird vor dem
 * Laden des Kartencodes und bis zum Einblenden der Karte gezeigt – beide Male identisch, damit nichts springt.
 */
export function MapLoading() {
  return (
    <div
      role="status"
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#eef0f1] text-brand"
    >
      <div className="flex animate-[map-loading_1.8s_ease-in-out_infinite] flex-col items-center gap-2 motion-reduce:animate-none">
        {/* Gebäude-Bildmarke (weiß auf transparent) per Maske in Markenfarbe einfärben */}
        <span
          aria-hidden
          className="h-9 w-[62px] bg-brand [mask-image:url(/brand/buerohamburg-gebaeude.png)] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
        />
        <Wordmark className="[&>span]:!text-lg" />
      </div>
      <span className="text-xs text-muted-foreground">Karte wird geladen …</span>
    </div>
  );
}
