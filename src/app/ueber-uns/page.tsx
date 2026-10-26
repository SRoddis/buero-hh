import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { TEAM, type TeamMember } from "@/content/team";
import { COMPANY } from "@/lib/company";
import { getRepository } from "@/lib/data/repository";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Büro Hamburg Immobilien: seit 2001 inhabergeführt und spezialisiert auf die Vermietung und Vermittlung von Gewerbeimmobilien in Hamburg.",
};

/** Objektzahl im Text höchstens alle 10 Minuten neu ermitteln */
export const revalidate = 600;

/** „über 1.100 Objekten“ aus dem echten Bestand; ohne Datenbank ein neutraler Text statt Störungsseite */
async function portfolioPhrase() {
  try {
    const { total } = await (await getRepository()).countListings();
    const step = total >= 1000 ? 100 : 10;
    return `über ${formatNumber(Math.floor(total / step) * step)} Objekten`;
  } catch {
    return "einem umfangreichen Angebot";
  }
}

export default async function AboutPage() {
  const portfolio = await portfolioPhrase();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 pt-6 pb-14 sm:px-6 lg:px-8">
      <div className="relative aspect-[1280/483] max-h-[420px] w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src="/images/ueber-uns/ueber-uns-1.webp"
          alt="Büroräume von Büro Hamburg Immobilien"
          fill
          priority
          sizes="(min-width: 1600px) 1536px, 100vw"
          className="object-cover"
        />
      </div>

      <header className="mt-8">
        <Heading as="h1">Wir sind BüroHamburg Immobilien.</Heading>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground sm:text-xl">
          Ihr Partner für die Vermietung und Vermittlung von Gewerbeimmobilien in Hamburg – persönlich, marktkundig und
          engagiert.
        </p>
      </header>

      <div className="mt-6 grid gap-x-12 gap-y-4 leading-relaxed text-foreground/80 md:grid-cols-2 md:divide-x [&_p+p]:mt-4">
        <div className="md:pr-12">
          <p>
            Die Büro Hamburg Immobilien GmbH wurde 2001 von Ulf von der Heydt gegründet und ist bis heute ein
            inhabergeführtes Unternehmen, spezialisiert auf die Vermietung und Vermittlung von Gewerbeimmobilien.
          </p>
          <p>
            Unser junges und hochmotiviertes Team ausgebildeter Immobilienexperten berät und unterstützt kompetent in allen
            Fragen rund um die Immobilie. Umfassende Marktkenntnis und Präsenz sowie dynamisches Reagieren auf die sich
            wandelnden Anforderungen im Immobilienmarkt sind unsere Stärken. Wir schauen hin und hören zu – um unsere
            Kunden dann optimal bei der Suche einer maßgeschneiderten Büro- oder Ladenfläche zu unterstützen.
          </p>
        </div>
        <div className="md:-ml-12 md:pl-12">
          <p>
            Als umfangreiches Immobilienportal mit <strong className="font-semibold text-foreground">{portfolio}</strong>{" "}
            ermöglichen wir Mietinteressenten einen schnellen und umfassenden Überblick über das aktuelle Angebot an freien
            Mietflächen in Hamburg, ohne auf individuelle und fachkundige Beratung verzichten zu müssen.
          </p>
          <p>
            Lebendigkeit, Teamgeist und Transparenz prägen unsere interne Kommunikation. Eine enge Kundenbindung und
            zielgerichtete, stets lösungsorientierte Betreuung sind für uns elementar – vom Erstkontakt bis zum
            Vertragsabschluss und darüber hinaus.
          </p>
          <p>
            Den Grundeigentümern und ihren Vertretern sind wir zuverlässige Partner in der Vermarktung ihrer Immobilien –
            unsere langjährige Erfahrung, nachhaltige Kontakte und eine umfangreiche, stetig aktualisierte Datenbank in
            Verbindung mit unserer Kenntnis der vakanten und projektierten Hamburger Mietflächen erlauben uns, für jedes
            Objekt den passenden Kunden zu finden.
          </p>
        </div>
      </div>

      <section aria-labelledby="team" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <Heading as="h2" id="team">
            Unser Team
          </Heading>
          <p className="text-muted-foreground">
            Unsere Immobilienexperten beraten Sie gerne persönlich und mit langjähriger Erfahrung.
          </p>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <TeamCard key={member.email} member={member} />
          ))}
        </ul>
      </section>
    </main>
  );
}

/** Überschrift mit kurzem roten Balken darunter */
function Heading({ as: Tag, id, children }: { as: "h1" | "h2"; id?: string; children: React.ReactNode }) {
  return (
    <Tag
      id={id}
      className="relative pb-3 text-3xl font-bold tracking-tight after:absolute after:bottom-0 after:left-0 after:h-1 after:w-12 after:rounded-full after:bg-brand sm:text-4xl"
    >
      {children}
    </Tag>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  // min-w-0: Rasterelemente schrumpfen sonst nicht unter die Breite der E-Mail-Adresse
  return (
    <li className="flex min-w-0 gap-4 rounded-xl border bg-card p-3 shadow-xs sm:gap-5">
      <div className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-40 xl:size-44">
        <Image src={member.image} alt={member.name} fill sizes="176px" className="object-cover object-top" />
      </div>
      <div className="flex min-w-0 flex-col justify-center py-1">
        <h3 className="text-lg font-semibold">{member.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{member.role}</p>
        <div className="mt-3 space-y-1.5 text-sm">
          <a href={COMPANY.phone.href} className="flex items-center gap-2.5 hover:text-brand">
            <Phone className="size-4 shrink-0 text-brand" aria-hidden />
            {COMPANY.phone.display}
          </a>
          <a href={`mailto:${member.email}`} className="flex min-w-0 items-start gap-2.5 text-brand hover:underline">
            <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
            {/* bei Platzmangel am „@“ umbrechen statt abschneiden – die Adresse bleibt vollständig lesbar */}
            <span className="min-w-0">
              {member.email.split("@")[0]}
              <wbr />@{member.email.split("@")[1]}
            </span>
          </a>
        </div>
      </div>
    </li>
  );
}
