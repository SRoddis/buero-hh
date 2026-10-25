"use client";

import { ArrowRight, House, Mail, RefreshCw, Search, TriangleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DEFAULT_CONTACT } from "@/lib/data/contact";
import { cn } from "@/lib/utils";

import { HOMEPAGE, InfoTile, SkylineIllustration } from "./status-page";

/**
 * Störungsseite, wenn die Objektdaten nicht verfügbar sind (Datenbank nicht erreichbar oder nicht
 * konfiguriert). Bewusst ehrlich statt Ersatzdaten – Interessenten sollen keine veralteten Angebote sehen.
 */
export function OutagePage({ onRetry, retrying }: { onRetry: () => void; retrying?: boolean }) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 pt-8 pb-16 text-center sm:pt-12">
      <div className="relative w-full max-w-xl">
        <SkylineIllustration />
        <span className="absolute bottom-0 left-1/2 flex size-20 -translate-x-1/2 translate-y-1/3 items-center justify-center rounded-full bg-white shadow-[0_8px_30px_-6px_rgb(139_32_56/0.35)] ring-8 ring-brand-light">
          <TriangleAlert className="size-9 text-brand" strokeWidth={1.75} />
        </span>
      </div>

      <h1 className="mt-14 text-2xl font-bold tracking-tight text-balance sm:text-4xl">
        Unsere Immobiliensuche ist aktuell nicht verfügbar
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground sm:text-lg">
        Es ist ein technisches Problem aufgetreten. Unser System ist derzeit nicht erreichbar. Wir arbeiten bereits an
        einer Lösung und sind schnellstmöglich wieder für Sie da.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button size="lg" onClick={onRetry} disabled={retrying} className="h-12 gap-2 rounded-xl px-7 text-base">
          <RefreshCw className={cn("size-[18px]", retrying && "animate-spin")} />
          Erneut versuchen
        </Button>
        <a
          href={HOMEPAGE}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 gap-2 rounded-xl border-brand/40 px-7 text-base text-brand hover:bg-brand-light hover:text-brand",
          )}
        >
          <House className="size-[18px]" />
          Zur Startseite
        </a>
      </div>

      <div className="mt-12 grid w-full max-w-2xl divide-y rounded-2xl border bg-white shadow-xs sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <InfoTile icon={Search} title="Später erneut versuchen">
          Die meisten Störungen sind in kurzer Zeit behoben.
        </InfoTile>
        <InfoTile
          icon={Mail}
          title="Kontakt aufnehmen"
          action={
            <a
              href={`mailto:${DEFAULT_CONTACT.email}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              Jetzt kontaktieren
              <ArrowRight className="size-4" />
            </a>
          }
        >
          Bei dringenden Anfragen erreichen Sie uns unter{" "}
          <a href={`tel:${DEFAULT_CONTACT.phone.replace(/\s/g, "")}`} className="whitespace-nowrap text-foreground hover:underline">
            {DEFAULT_CONTACT.phone}
          </a>
          .
        </InfoTile>
      </div>
    </main>
  );
}
