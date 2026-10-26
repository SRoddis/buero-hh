"use client";

import { HeartIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useFavorites } from "@/components/favorites/favorites-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

/** Noch nicht nachgebaute Inhaltsseiten verweisen bis dahin auf den bestehenden Auftritt. */
const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Immobilien suchen", href: "/immobilien" },
  { label: "Für Vermieter", href: "/fuer-vermieter" },
  { label: "Suchauftrag", href: "https://www.buerohamburg.de" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { ids, ready } = useFavorites();
  // „/“ nur exakt, sonst wäre Home auf jeder Seite aktiv
  const isActive = (href: string) => href.startsWith("/") && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="bg-brand text-white print:hidden">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-6 px-4 sm:px-6 lg:h-16 lg:px-8">
        <Logo />

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative px-3 py-2 text-[0.95rem] text-white/90 transition-colors hover:text-white",
                isActive(item.href) &&
                  "font-semibold text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-white",
              )}
            >
              {item.label}
            </Link>
          ))}
          <MerklisteLink count={ready ? ids.length : 0} active={isActive("/merkliste")} />
        </nav>

        <Image
          src="/brand/buerohamburg-gebaeude.png"
          alt=""
          width={230}
          height={134}
          priority
          className="hidden h-11 w-auto xl:ml-6 xl:block"
        />

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <MerklisteLink count={ready ? ids.length : 0} active={isActive("/merkliste")} compact />
          <Sheet>
            <SheetTrigger
              className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-white/10"
              aria-label="Menü öffnen"
            >
              <MenuIcon className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menü</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-2" aria-label="Mobile Navigation">
                {[...NAV_ITEMS, { label: "Merkliste", href: "/merkliste" }].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-3 py-3 text-base hover:bg-muted",
                      isActive(item.href) && "bg-accent font-semibold text-accent-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MerklisteLink({ count, active, compact }: { count: number; active: boolean; compact?: boolean }) {
  return (
    <Link
      href="/merkliste"
      className={cn(
        "relative flex items-center gap-2 rounded-lg px-3 py-2 text-[0.95rem] text-white/90 hover:text-white",
        // gleiche Markierung wie die übrigen Menüpunkte (weißer Strich unter dem aktiven Eintrag)
        active &&
          "font-semibold text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-white",
        compact && "px-2 after:inset-x-2",
      )}
      aria-label={`Merkliste (${count} Objekte)`}
      aria-current={active ? "page" : undefined}
    >
      {!compact && <span>Merkliste</span>}
      <span className="relative">
        <HeartIcon className="size-5" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2.5 flex size-[18px] items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand">
            {count}
          </span>
        )}
      </span>
    </Link>
  );
}
