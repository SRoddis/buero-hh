import "server-only";

/**
 * Aktuelle Mietgesuche (Seite „Für Vermieter“). Quelle ist vorerst die API von buerohamburg.de
 * (/api/gesuche, FileMaker) – beim Wechsel auf den direkten FileMaker-Sync nur diese Datei austauschen.
 */

const SOURCE_URL = "https://www.buerohamburg.de/api/gesuche";

export interface RentalRequest {
  title: string;
  marketArea: string;
  description: string;
  /** gewünschte Fläche in m² (Richtwert) */
  area: number | null;
  /** Spanne als Text, z. B. „ab ca. 280 qm“ */
  areaFrom: string | null;
  areaTo: string | null;
  /** Spanne als Zahlen (m²) – für den Filter „Ihre Fläche“; fehlt eine Grenze, gilt der Richtwert */
  areaMin: number | null;
  areaMax: number | null;
  /** Bezug, z. B. „flexibel“, „nach Absprache“ */
  moveIn: string | null;
  contactPerson: string | null;
}

type Raw = Record<string, string | number | null | undefined>;

const text = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim() || null;

/** Zahl aus „ab ca. 1.000 qm“ → 1000 */
function areaNumber(value: unknown): number | null {
  const match = String(value ?? "").match(/\d[\d.]*(?:,\d+)?/);
  if (!match) return null;
  const n = Number(match[0].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toRequest(raw: Raw): RentalRequest {
  const area = areaNumber(raw.webs_mietflaeche);
  return {
    title: text(raw.webs_objekttitel) ?? "Mietgesuch",
    marketArea: text(raw.webs_lage) ?? "",
    description: String(raw.webs_beschreibung ?? "").trim(),
    area,
    areaFrom: text(raw.webs_mietflaeche_von),
    areaTo: text(raw.webs_mietflaeche_bis),
    areaMin: areaNumber(raw.webs_mietflaeche_von) ?? area,
    areaMax: areaNumber(raw.webs_mietflaeche_bis) ?? area,
    moveIn: text(raw.webs_lieferung),
    contactPerson: text(raw.webs_ansprechpartner),
  };
}

/** null, wenn die Quelle nicht erreichbar ist – die Seite zeigt dann einen Hinweis statt der Liste */
export async function getRentalRequests(): Promise<RentalRequest[] | null> {
  try {
    const res = await fetch(SOURCE_URL, {
      // höchstens alle 10 Minuten neu abrufen
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return Array.isArray(data) ? data.map((r) => toRequest(r as Raw)) : null;
  } catch {
    return null;
  }
}
