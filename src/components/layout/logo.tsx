import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/immobilien"
      className={cn("inline-flex items-baseline text-white select-none", className)}
      aria-label="BüroHamburg.de – Startseite"
    >
      <span className="text-[1.35rem] font-light tracking-[0.06em] sm:text-[1.6rem]">BÜRO</span>
      <span className="text-[1.35rem] font-extrabold tracking-[0.04em] sm:text-[1.6rem]">HAMBURG</span>
      <span className="ml-0.5 text-xs font-medium tracking-wide opacity-90 sm:text-sm">.DE</span>
    </Link>
  );
}

