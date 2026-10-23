"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        const url = window.location.href;
        try {
          if (navigator.share) {
            await navigator.share({ title, url });
          } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link kopiert");
          }
        } catch {
          // Teilen abgebrochen
        }
      }}
      className="inline-flex size-10 items-center justify-center rounded-full border bg-white transition-colors hover:bg-muted"
      aria-label="Objekt teilen"
    >
      <Share2 className="size-[18px]" />
    </button>
  );
}
