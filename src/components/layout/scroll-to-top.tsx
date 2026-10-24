"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Button „nach oben“, sobald der Footer sichtbar ist – auf der Suchseite scrollen Liste und Karte
 * eigenständig, sodass man am Seitenende sonst schwer wieder nach oben kommt.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    // Erst ab 48 px sichtbarem Footer – die Suchseite ist genau bildschirmhoch, der Footer stößt dort schon an den Rand
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -48px 0px",
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Nach oben"
      title="Nach oben"
      tabIndex={visible ? 0 : -1}
      className={cn(
        // mobil über der festen Kontaktleiste der Detailseite bzw. dem Liste/Karte-Umschalter
        "fixed right-4 bottom-24 z-40 flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-xl transition-all duration-200 hover:bg-brand-dark focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none lg:right-6 lg:bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="size-5" strokeWidth={2.5} />
    </button>
  );
}
