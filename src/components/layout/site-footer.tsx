import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";

import { PROPERTY_CATEGORIES } from "@/lib/constants";
import { filtersToHref, DEFAULT_FILTERS } from "@/lib/search/params";

import { Logo } from "./logo";

/** Stadtteile mit den meisten Angeboten */
const POPULAR_DISTRICTS = [
  { slug: "altstadt", name: "Altstadt" },
  { slug: "neustadt", name: "Neustadt" },
  { slug: "hammerbrook", name: "Hammerbrook" },
  { slug: "bahrenfeld", name: "Bahrenfeld" },
  { slug: "st-georg", name: "St. Georg" },
  { slug: "hafencity", name: "HafenCity" },
];

export function SiteFooter() {
  return (
    <footer id="site-footer" className="mt-auto bg-[#2a1017] text-white/75 print:hidden">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed">
            Ihr Partner für Gewerbeimmobilien in Hamburg – persönlich, marktkundig und unabhängig.
          </p>
        </div>

        <FooterColumn title="Objektarten">
          {PROPERTY_CATEGORIES.map((c) => (
            <FooterLink key={c.value} href={filtersToHref({ ...DEFAULT_FILTERS, category: c.value })}>
              {c.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Beliebte Stadtteile">
          {POPULAR_DISTRICTS.map((d) => (
            <FooterLink key={d.slug} href={filtersToHref({ ...DEFAULT_FILTERS, districts: [d.slug] })}>
              Büros in {d.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Kontakt">
          <li className="flex items-start gap-2">
            <MapPinIcon className="mt-0.5 size-4 shrink-0" /> Hamburg
          </li>
          <li className="flex items-center gap-2">
            <PhoneIcon className="size-4 shrink-0" /> +49 40 226 211 00
          </li>
          <li className="flex items-center gap-2">
            <MailIcon className="size-4 shrink-0" /> kontakt@buerohamburg.de
          </li>
        </FooterColumn>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} BüroHamburg.de</span>
          <div className="flex gap-5">
            <a href="https://www.buerohamburg.de" className="hover:text-white">Impressum</a>
            <a href="https://www.buerohamburg.de" className="hover:text-white">Datenschutz</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">{title}</h2>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
