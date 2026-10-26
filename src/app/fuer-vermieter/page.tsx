import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

import { RequestList } from "@/components/landlords/request-list";
import { COMPANY } from "@/lib/company";
import { getRentalRequests } from "@/lib/data/rental-requests";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Für Vermieter und Eigentümer",
  description:
    "Passende Mieter für Ihre Gewerbeimmobilie in Hamburg: aktuelle Mietgesuche aus unserem aktiv suchenden Kundenstamm.",
};

/** Gesuche höchstens alle 10 Minuten neu laden */
export const revalidate = 600;

export default async function LandlordsPage() {
  const requests = await getRentalRequests();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 pt-8 pb-14 sm:px-6 lg:px-8">
      <p className="text-sm font-medium tracking-wide text-brand uppercase">Für Vermieter und Eigentümer</p>
      <Heading as="h1" className="mt-2">
        Passende Mieter. Für Ihre Immobilie.
      </Heading>

      <div className="mt-6 grid gap-x-12 gap-y-4 leading-relaxed text-foreground/80 md:grid-cols-2 md:divide-x">
        <p className="md:pr-12">
          Profitieren Sie von unserem aktiv suchenden Kundenstamm und unserer langjährigen Erfahrung am Hamburger
          Immobilienmarkt. Wir bringen Sie mit passenden Unternehmen und Teams zusammen – diskret, persönlich und
          effizient.
        </p>
        <p className="md:-ml-12 md:pl-12">
          Durch unsere Marktkenntnis und ein etabliertes Netzwerk finden wir für Ihre Immobilie den idealen Mieter. Sie
          erhalten einen Auszug aktueller Suchgesuche mit detaillierten Anforderungen. Gerne beraten wir Sie persönlich
          und freuen uns auf Ihre Kontaktaufnahme.
        </p>
      </div>

      <section aria-labelledby="gesuche" className="mt-12">
        <Heading as="h2" id="gesuche">
          Aktuelle Mietergesuche
        </Heading>

        {requests === null ? (
          <div className="mt-6 rounded-xl border bg-card p-6 shadow-xs">
            <p className="font-semibold">Die Mietgesuche können gerade nicht geladen werden.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sprechen Sie uns gerne direkt an – wir nennen Ihnen passende Interessenten für Ihre Fläche.
            </p>
            <ContactLinks className="mt-4" />
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-card p-6 shadow-xs">
            <p className="font-semibold">Aktuell sind keine Mietgesuche veröffentlicht.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Unser Kundenstamm sucht laufend – sprechen Sie uns zu Ihrer Fläche an.
            </p>
            <ContactLinks className="mt-4" />
          </div>
        ) : (
          <RequestList requests={requests} />
        )}
      </section>
    </main>
  );
}

/** Überschrift mit kurzem roten Balken darunter (wie auf „Über uns“) */
function Heading({
  as: Tag,
  id,
  className,
  children,
}: {
  as: "h1" | "h2";
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      id={id}
      className={cn(
        "relative pb-3 text-3xl font-bold tracking-tight after:absolute after:bottom-0 after:left-0 after:h-1 after:w-12 after:rounded-full after:bg-brand sm:text-4xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

function ContactLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-x-6 gap-y-2 text-sm", className)}>
      <a href={COMPANY.phone.href} className="inline-flex items-center gap-2 font-semibold text-brand hover:underline">
        <Phone className="size-4" />
        {COMPANY.phone.display}
      </a>
      <a href={`mailto:${COMPANY.email}`} className="inline-flex items-center gap-2 font-semibold text-brand hover:underline">
        <Mail className="size-4" />
        {COMPANY.email}
      </a>
    </div>
  );
}
