import { SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ListingNotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <SearchX className="size-12 text-brand/60" />
      <h1 className="mt-4 text-2xl font-bold">Dieses Objekt ist nicht mehr verfügbar</h1>
      <p className="mt-2 text-muted-foreground">
        Möglicherweise wurde die Fläche bereits vermietet. Entdecken Sie weitere Angebote in Hamburg.
      </p>
      <Button asChild size="lg" className="mt-6 h-11 px-6">
        <Link href="/immobilien">Zur Immobiliensuche</Link>
      </Button>
    </main>
  );
}
