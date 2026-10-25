import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OutagePreview } from "./outage-preview";

export const metadata: Metadata = {
  title: "Störungsseite (Vorschau)",
  robots: { index: false },
};

/**
 * Vorschau der Störungsseite – nur lokal (`npm run dev`). Live erscheint die Seite ausschließlich bei
 * einer echten Störung über src/app/error.tsx; diese Adresse liefert dort 404.
 */
export default function OutagePreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <OutagePreview />;
}
