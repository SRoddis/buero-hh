import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import sharp from "sharp";

import { buildCompareRows, differingRows } from "@/lib/compare-rows";
import { MAX_COMPARE } from "@/lib/constants";
import { getRepository } from "@/lib/data/repository";
import { formatRoundedCount } from "@/lib/format";
import { ComparePdf } from "@/lib/pdf/compare-pdf";
import type { Listing } from "@/lib/types";
import { REFERENCE_NUMBER } from "@/lib/urls";

export const runtime = "nodejs";

/** Erstes Objektbild als JPEG – react-pdf kann kein WebP (Bilder liegen als WebP in Supabase Storage) */
async function thumbnail(listing: Listing): Promise<Buffer | null> {
  const url = listing.images[0]?.thumbUrl ?? listing.images[0]?.url;
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(480, 270, { fit: "cover" })
      .jpeg({ quality: 78 })
      .toBuffer();
  } catch {
    // ohne Bild weiter – das PDF soll an einem fehlenden Foto nicht scheitern
    return null;
  }
}

/**
 * GET /api/vergleich/pdf?nr=097,25003[&unterschiede=1] – Vergleichs-PDF mit denselben Zeilen wie die
 * Vergleichsseite; mit „unterschiede=1“ nur die Zeilen, in denen sich die Objekte unterscheiden.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const numbers = (params.get("nr") ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter((n) => REFERENCE_NUMBER.test(n))
    .slice(0, MAX_COMPARE);
  if (numbers.length < 2) return new Response("Mindestens zwei Objektnummern angeben (?nr=…)", { status: 400 });

  const repository = await getRepository();
  const listings = (await Promise.all(numbers.map((n) => repository.getByReferenceNumber(n)))).filter(
    (l): l is Listing => l !== null,
  );
  if (listings.length < 2) return new Response("Objekte nicht gefunden", { status: 404 });

  const onlyDifferences = params.get("unterschiede") === "1";
  // Exposé ist auf der Website ein Link – im Ausdruck ohne Nutzen, daher weglassen
  const allRows = buildCompareRows(listings).filter((r) => r.key !== "expose");
  const [images, logoMark, counts] = await Promise.all([
    Promise.all(listings.map(thumbnail)),
    readFile(join(process.cwd(), "public", "brand", "buerohamburg-gebaeude.png")).catch(() => null),
    repository.countListings().catch(() => null),
  ]);

  const pdf = await renderToBuffer(
    createElement(ComparePdf, {
      listings,
      rows: onlyDifferences ? differingRows(allRows) : allRows,
      images,
      logoMark,
      totalLabel: counts ? formatRoundedCount(counts.total) : "",
      onlyDifferences,
    }) as ReactElement<DocumentProps>, // ComparePdf liefert ein <Document>
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // im Browser anzeigen; beim Speichern mit sprechendem Dateinamen
      "Content-Disposition": `inline; filename="Vergleich-${listings.map((l) => l.referenceNumber).join("-")}.pdf"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
