import { ArrowRight, House, Mail, Search } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_CONTACT } from "@/lib/data/contact";
import { cn } from "@/lib/utils";

import { BackLink } from "./back-link";
import { HOMEPAGE, InfoTile, SkylineIllustration } from "./status-page";

/** 404-Ansicht: unbekannte Adresse bzw. nicht mehr verfügbares Objekt */
export function NotFoundView({
  title = "Seite nicht gefunden",
  text = "Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben. Vielleicht finden Sie über unsere Suche oder die Startseite schnell wieder das passende Objekt.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 pt-8 pb-16 text-center sm:pt-12">
      <div className="relative w-full max-w-xl">
        <SkylineIllustration />
        {/* „404“ vor der Skyline, unten leicht ausgeblendet wie eine Spiegelung */}
        <span
          className="absolute inset-x-0 bottom-[2%] bg-gradient-to-b from-[#d68597] to-[#f3d3da] bg-clip-text text-[5.5rem] leading-none font-black tracking-tight text-transparent sm:text-[7.5rem]"
          aria-hidden
        >
          404
        </span>
      </div>

      <h1 className="mt-8 text-2xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-xl text-muted-foreground sm:text-lg">{text}</p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <a href={HOMEPAGE} className={cn(buttonVariants({ size: "lg" }), "h-12 gap-2 rounded-xl px-7 text-base")}>
          <House className="size-[18px]" />
          Zur Startseite
        </a>
        <Link
          href="/immobilien"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 gap-2 rounded-xl border-brand/40 px-7 text-base text-brand hover:bg-brand-light hover:text-brand",
          )}
        >
          <Search className="size-[18px]" />
          Immobilien suchen
        </Link>
      </div>
      <BackLink className="mt-5" />

      <div className="mt-10 grid w-full max-w-2xl divide-y rounded-2xl border bg-white shadow-xs sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <InfoTile
          icon={Search}
          title="Suche nutzen"
          action={
            <Link href="/immobilien" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
              Zur Immobiliensuche
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          Finden Sie passende Büro- und Gewerbeimmobilien in Hamburg.
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
          Bei Fragen oder individuellen Anfragen erreichen Sie unser Team unter{" "}
          <a href={`tel:${DEFAULT_CONTACT.phone.replace(/\s/g, "")}`} className="whitespace-nowrap text-foreground hover:underline">
            {DEFAULT_CONTACT.phone}
          </a>
          .
        </InfoTile>
      </div>
    </main>
  );
}
