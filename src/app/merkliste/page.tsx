import type { Metadata } from "next";

import { MerklisteView } from "@/components/favorites/merkliste-view";

export const metadata: Metadata = {
  title: "Merkliste",
  robots: { index: false },
};

export default function MerklistePage() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ihre Merkliste</h1>
      <p className="mt-1 text-muted-foreground">Gemerkte Objekte werden in diesem Browser gespeichert.</p>
      <MerklisteView />
    </main>
  );
}
