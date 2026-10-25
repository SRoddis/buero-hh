"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

/** „Zurück zur vorherigen Seite“ – ohne Verlauf (direkt aufgerufener Link) zur Immobiliensuche */
export function BackLink({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/immobilien"))}
      className={cn("inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline", className)}
    >
      <ArrowLeft className="size-4" />
      Zurück zur vorherigen Seite
    </button>
  );
}
