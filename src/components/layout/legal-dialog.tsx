"use client";

import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { CompanyImprint } from "./company-imprint";

export type LegalDoc = "impressum" | "datenschutz" | "agb";

const TITLES: Record<LegalDoc, string> = {
  impressum: "Impressum",
  datenschutz: "Datenschutzerklärung",
  agb: "Allgemeine Geschäftsbedingungen",
};

/** Rechtstexte erst beim Öffnen laden – sie stehen in Fußzeile und Formularen auf jeder Seite */
const LOADERS: Record<Exclude<LegalDoc, "impressum">, () => Promise<string>> = {
  datenschutz: () => import("@/content/legal/datenschutz").then((m) => m.DATENSCHUTZ_HTML),
  agb: () => import("@/content/legal/agb").then((m) => m.AGB_HTML),
};

/** Typografie für die Rechtstexte (statisches HTML aus src/content/legal) */
const PROSE =
  "text-[15px] leading-relaxed text-foreground/85 [&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-brand [&_h2:first-child]:mt-0 [&_h3]:mt-5 [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mt-3 [&_p:first-child]:mt-0 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6";

/**
 * Link auf Impressum, Datenschutz oder AGB – öffnet den Text als Fenster über der aktuellen Seite
 * (wie auf der bisherigen Website), statt eine eigene Seite aufzurufen.
 */
export function LegalLink({ doc, className, children }: { doc: LegalDoc; className?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (open && doc !== "impressum" && html === null) LOADERS[doc]().then(setHtml);
  }, [open, doc, html]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={className}>
          {children ?? TITLES[doc]}
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[88dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="border-b px-6 py-4 pr-14">
          <DialogTitle className="text-xl font-bold tracking-tight">{TITLES[doc]}</DialogTitle>
        </div>
        <div className="overflow-y-auto overscroll-contain px-6 py-5 sm:px-8 sm:py-6">
          {doc === "impressum" ? (
            <CompanyImprint />
          ) : html ? (
            // statisches, im Projekt hinterlegtes HTML – keine Nutzereingaben
            <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="space-y-3" aria-busy>
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${70 + ((i * 13) % 30)}%` }} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
