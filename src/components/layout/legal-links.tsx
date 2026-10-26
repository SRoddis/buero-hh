import { cn } from "@/lib/utils";

import { LegalLink, type LegalDoc } from "./legal-dialog";

const LINKS: { doc: LegalDoc; label: string }[] = [
  { doc: "impressum", label: "Impressum" },
  { doc: "datenschutz", label: "Datenschutz" },
  { doc: "agb", label: "AGB" },
];

/** Impressum | Datenschutz | AGB – öffnen jeweils als Fenster */
export function LegalLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  return (
    <nav aria-label="Rechtliches" className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", className)}>
      {LINKS.map(({ doc, label }, i) => (
        <span key={doc} className="flex items-center gap-3">
          {i > 0 && <span className="opacity-40">|</span>}
          <LegalLink doc={doc} className={cn("cursor-pointer hover:text-brand hover:underline", linkClassName)}>
            {label}
          </LegalLink>
        </span>
      ))}
    </nav>
  );
}
