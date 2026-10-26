import { Mail, Phone, Printer } from "lucide-react";

import { COMPANY } from "@/lib/company";
import { cn } from "@/lib/utils";

/** Kontaktzeilen (Telefon, Fax, E-Mail) */
export function CompanyContact({ className }: { className?: string }) {
  const rows = [
    { icon: Phone, label: "Telefon", value: COMPANY.phone.display, href: COMPANY.phone.href },
    { icon: Printer, label: "Telefax", value: COMPANY.fax.display },
    { icon: Mail, label: "E-Mail", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  ];
  return (
    <dl className={cn("space-y-2", className)}>
      {rows.map(({ icon: Icon, label, value, href }) => (
        <div key={label} className="grid grid-cols-[1.5rem_5.5rem_1fr] items-center gap-2">
          <Icon className="size-[18px] text-brand" aria-hidden />
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-semibold text-brand">
            {href ? (
              <a href={href} className="hover:underline">
                {value}
              </a>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Pflichtangaben nach § 5 DDG (Anbieterkennzeichnung) – Startseite und Impressum-Fenster */
export function CompanyImprint({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2", className)}>
      <div className="space-y-4">
        <p>
          {COMPANY.name}
          <br />
          {COMPANY.street}, {COMPANY.postalCode} {COMPANY.city}, {COMPANY.country}
        </p>
        <p>
          T {COMPANY.phone.display}
          <br />F {COMPANY.fax.display}
          <br />
          <a href={`mailto:${COMPANY.email}`} className="hover:text-brand hover:underline">
            {COMPANY.email}
          </a>
          <br />
          {COMPANY.website}
        </p>
        <p>
          <span className="font-semibold">Geschäftsführer</span>
          <br />
          {COMPANY.managingDirector}
        </p>
      </div>
      <div className="space-y-4">
        <p>
          <span className="font-semibold">Registereintrag</span>
          <br />
          Registergericht: {COMPANY.register.court}
          <br />
          {COMPANY.register.number}
        </p>
        <p>
          <span className="font-semibold">Berufsaufsichtsbehörde</span>
          <br />
          Zuständige Behörde für die Erlaubnis nach § 34c der Gewerbeordnung:
          <br />
          {COMPANY.supervisoryAuthority}
        </p>
      </div>
    </div>
  );
}
