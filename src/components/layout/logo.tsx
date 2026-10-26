import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex text-white", className)} aria-label="BüroHamburg.de – Startseite">
      <Wordmark />
    </Link>
  );
}

/** Schriftzug „BÜROHAMBURG.DE“ in der aktuellen Textfarbe */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline select-none", className)}>
      <span className="text-[1.35rem] font-light tracking-[0.06em] sm:text-[1.6rem]">BÜRO</span>
      <span className="text-[1.35rem] font-extrabold tracking-[0.04em] sm:text-[1.6rem]">HAMBURG</span>
      <span className="ml-0.5 text-xs font-medium tracking-wide opacity-90 sm:text-sm">.DE</span>
    </span>
  );
}

