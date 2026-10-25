/**
 * Scraper für den Objektbestand von www.buerohamburg.de.
 *
 * Nutzt die JSON-API, die auch die Website selbst verwendet:
 *   /api/objects/search?…   alle Objekte (Kurzdaten inkl. Koordinaten)
 *   /api/objects/<nr>        Details (Hausnummer, volle Beschreibung, Merkmale, FileMaker-recordId)
 *   /objects/images/<nr>/NN_webBig.jpg   Bilder (01–19, werden per HEAD ermittelt)
 *   /objects/pdf/BHI_<nr>.pdf            Exposé-PDF
 *
 * Aufruf:
 *   npm run scrape                      Daten + CSV, PDFs nur prüfen (Existenz/Größe)
 *   npm run scrape -- --pdf             zusätzlich PDFs herunterladen
 *   npm run scrape -- --limit 20        nur die ersten N Objekte (zum Testen)
 *   npm run scrape -- --refresh         Cache ignorieren und alles neu abrufen
 *
 * Ergebnisse in data/scrape/ (nicht im Git): buerohamburg.csv, buerohamburg.json, raw/, pdf/
 */
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://www.buerohamburg.de";
/** Ohne objektart-Filter – der kennt nur Büro/Laden und blendet reine Hallen- und Gastro-Objekte aus */
const SEARCH_QUERY =
  "lage=HH-Nord&lage=HH-Alster&lage=HH-West&lage=HH-City&lage=HH-City-S%C3%BCd&lage=HH-Ost&lage=HH-S%C3%BCd";
const USER_AGENT = "BueroHamburg-Datenmigration/1.0 (+https://www.buerohamburg.de)";
const MAX_IMAGES = 19;
const CONCURRENCY = 2;
const REQUEST_DELAY_MS = 150;

const OUT_DIR = join(process.cwd(), "data", "scrape");
const RAW_DIR = join(OUT_DIR, "raw");
const PDF_DIR = join(OUT_DIR, "pdf");

/** Merkmalsfelder laut Website-JavaScript */
const CRITERIA: Record<string, string> = {
  web_suchKrit01: "Balkon / Terrasse",
  web_suchKrit02: "Barrierefrei",
  web_suchKrit03: "Personenaufzug",
  web_suchKrit04: "Lastenaufzug",
  web_suchKrit05: "Erdgeschossfläche",
  web_suchKrit06: "Neubau",
  web_suchKrit07: "Hauseigene Parkplätze",
  web_suchKrit08: "Wasserblick",
};

type ApiObject = Record<string, string | number | null | undefined>;

interface ScrapedObject {
  detail: ApiObject;
  images: string[];
  pdf: { url: string; exists: boolean; bytes: number | null; file: string | null };
  scrapedAt: string;
}

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const DOWNLOAD_PDF = flag("pdf");
const REFRESH = flag("refresh");
const LIMIT = option("limit") ? Number(option("limit")) : Infinity;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request(url: string, init: RequestInit = {}, attempt = 1): Promise<Response> {
  await sleep(REQUEST_DELAY_MS);
  try {
    const res = await fetch(url, { ...init, headers: { "User-Agent": USER_AGENT, ...init.headers } });
    if (res.status >= 500 && attempt < 4) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (error) {
    if (attempt >= 4) throw error;
    await sleep(1000 * attempt);
    return request(url, init, attempt + 1);
  }
}

/**
 * Das FileMaker-Backend der Website antwortet unter Last sporadisch mit 404, obwohl das Objekt
 * existiert – daher auch 404 mehrfach mit wachsender Pause wiederholen.
 */
async function getJson<T>(url: string, attempts = 5): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const res = await request(url);
    if (res.ok) return (await res.json()) as T;
    if (attempt >= attempts || (res.status !== 404 && res.status !== 429)) throw new Error(`${res.status} für ${url}`);
    await sleep(1500 * attempt);
  }
}

/** Bilder sind fortlaufend nummeriert (01, 02, …) – bis zur ersten Lücke prüfen, wie die Website selbst. */
async function findImages(nr: string): Promise<string[]> {
  const images: string[] = [];
  for (let i = 1; i <= MAX_IMAGES; i++) {
    const url = `${BASE}/objects/images/${encodeURIComponent(nr)}/${String(i).padStart(2, "0")}_webBig.jpg`;
    const res = await request(url, { method: "HEAD" });
    if (!res.ok) break;
    images.push(url);
  }
  return images;
}

async function handlePdf(nr: string): Promise<ScrapedObject["pdf"]> {
  const url = `${BASE}/objects/pdf/BHI_${encodeURIComponent(nr)}.pdf`;
  const file = join(PDF_DIR, `BHI_${nr}.pdf`);
  if (DOWNLOAD_PDF && existsSync(file) && !REFRESH) {
    return { url, exists: true, bytes: statSync(file).size, file: `pdf/BHI_${nr}.pdf` };
  }
  if (!DOWNLOAD_PDF) {
    const head = await request(url, { method: "HEAD" });
    const isPdf = head.ok && (head.headers.get("content-type") ?? "").includes("pdf");
    return { url, exists: isPdf, bytes: isPdf ? Number(head.headers.get("content-length")) || null : null, file: null };
  }
  const res = await request(url);
  if (!res.ok || !(res.headers.get("content-type") ?? "").includes("pdf")) {
    return { url, exists: false, bytes: null, file: null };
  }
  const data = Buffer.from(await res.arrayBuffer());
  writeFileSync(file, data);
  return { url, exists: true, bytes: data.length, file: `pdf/BHI_${nr}.pdf` };
}

async function scrapeObject(nr: string): Promise<ScrapedObject> {
  const cacheFile = join(RAW_DIR, `${nr}.json`);
  const cached: ScrapedObject | null =
    !REFRESH && existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, "utf8")) : null;

  const detail = cached?.detail ?? (await getJson<ApiObject>(`${BASE}/api/objects/${encodeURIComponent(nr)}`));
  const images = cached?.images ?? (await findImages(nr));
  // PDF erneut behandeln, wenn jetzt heruntergeladen werden soll, bisher aber nur geprüft wurde
  const pdf = cached && (!DOWNLOAD_PDF || cached.pdf.file || !cached.pdf.exists) ? cached.pdf : await handlePdf(nr);

  const result: ScrapedObject = { detail, images, pdf, scrapedAt: cached?.scrapedAt ?? new Date().toISOString() };
  writeFileSync(cacheFile, JSON.stringify(result, null, 1));
  return result;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }),
  );
  return results;
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------
const csvCell = (value: unknown) => {
  if (value === null || value === undefined) return "";
  const text = String(value).replace(/\r?\n/g, " ").trim();
  return /[;"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const num = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? String(n).replace(".", ",") : String(value);
};
const isSet = (value: unknown) => value === 1 || value === "1" || value === true;

function toCsv(objects: ScrapedObject[]) {
  const columns: [string, (o: ScrapedObject) => unknown][] = [
    ["objektnr", (o) => o.detail.webs_objektnr],
    ["filemaker_record_id", (o) => o.detail.recordId],
    ["titel", (o) => o.detail.webs_objekttitel],
    ["objektart", (o) => o.detail.webs_objektart],
    ["lage", (o) => o.detail.webs_lage],
    ["stadtteil", (o) => o.detail.webs_stadtteil],
    ["strasse", (o) => o.detail.webs_strasse],
    ["hausnummer", (o) => o.detail.webs_hausnummer],
    ["plz", (o) => o.detail.webs_plz],
    ["ort", (o) => o.detail.webs_ort],
    ["lat", (o) => num(o.detail.webs_lat)],
    ["lng", (o) => num(o.detail.webs_lng)],
    ["mietflaeche_qm", (o) => num(o.detail.webs_mietflaeche)],
    ["mietflaeche_von_text", (o) => o.detail.webs_mietflaeche_von],
    ["mietflaeche_bis_text", (o) => o.detail.webs_mietflaeche_bis],
    ["miete", (o) => num(o.detail.webs_miete)],
    ["preisart", (o) => o.detail.webs_preisart],
    ["miete_pro_qm", (o) => num(o.detail.webs_mietFormel)],
    ["nebenkosten_mwst", (o) => o.detail.webs_mwst],
    ["courtage_code", (o) => o.detail.webs_court_text],
    ["courtage_text", (o) => o.detail.webs_court],
    ["merkmale", (o) => Object.entries(CRITERIA).filter(([f]) => isSet(o.detail[f])).map(([, l]) => l).join(", ")],
    ...Object.entries(CRITERIA).map(
      ([field, label]) => [`merkmal_${label.toLowerCase().replace(/[^a-zäöüß]+/g, "_")}`, (o: ScrapedObject) => (isSet(o.detail[field]) ? "1" : "0")] as [string, (o: ScrapedObject) => unknown],
    ),
    ["suchbegriffe", (o) => o.detail.webs_suchbegriffe],
    ["home", (o) => o.detail.webs_home],
    ["beschreibung", (o) => o.detail.webs_beschreibung],
    ["bild_anzahl", (o) => o.images.length],
    ["bild_urls", (o) => o.images.join(" ")],
    ["pdf_vorhanden", (o) => (o.pdf.exists ? "1" : "0")],
    ["pdf_bytes", (o) => o.pdf.bytes],
    ["pdf_url", (o) => o.pdf.url],
    ["pdf_datei", (o) => o.pdf.file],
    ["detail_url", (o) => `${BASE}/objekt.php?objekt=${o.detail.webs_objektnr}`],
    ["abgerufen_am", (o) => o.scrapedAt],
  ];
  const lines = [columns.map(([name]) => name).join(";")];
  for (const o of objects) lines.push(columns.map(([, get]) => csvCell(get(o))).join(";"));
  // BOM, damit Excel UTF-8 (Umlaute) korrekt erkennt; Semikolon als Trenner für deutsches Excel
  return "﻿" + lines.join("\r\n") + "\r\n";
}

// ---------------------------------------------------------------------------
async function main() {
  for (const dir of [OUT_DIR, RAW_DIR, PDF_DIR]) mkdirSync(dir, { recursive: true });

  console.log("Lade Objektliste …");
  const search = await getJson<{ total: number; items: ApiObject[] }>(`${BASE}/api/objects/search?${SEARCH_QUERY}`);
  const numbers = search.items.map((i) => String(i.webs_objektnr)).slice(0, LIMIT);
  console.log(`${search.total} Objekte gefunden, verarbeite ${numbers.length}${DOWNLOAD_PDF ? " (inkl. PDF-Download)" : ""}`);

  const failures: { nr: string; error: string }[] = [];
  let done = 0;
  const results = await mapLimit(numbers, CONCURRENCY, async (nr) => {
    try {
      return await scrapeObject(nr);
    } catch (error) {
      failures.push({ nr, error: String(error) });
      return null;
    } finally {
      done++;
      if (done % 25 === 0 || done === numbers.length) process.stdout.write(`  ${done}/${numbers.length}\n`);
    }
  });

  const objects = results.filter((r): r is ScrapedObject => r !== null);
  writeFileSync(join(OUT_DIR, "buerohamburg.json"), JSON.stringify(objects, null, 1));
  writeFileSync(join(OUT_DIR, "buerohamburg.csv"), toCsv(objects));

  const pdfBytes = objects.reduce((sum, o) => sum + (o.pdf.bytes ?? 0), 0);
  console.log("\nFertig:");
  console.log(`  Objekte:          ${objects.length} (Fehler: ${failures.length})`);
  console.log(`  ohne Koordinaten: ${objects.filter((o) => !o.detail.webs_lat || !o.detail.webs_lng).length}`);
  console.log(`  Bilder gesamt:    ${objects.reduce((s, o) => s + o.images.length, 0)} (ohne Bild: ${objects.filter((o) => !o.images.length).length})`);
  console.log(`  PDFs:             ${objects.filter((o) => o.pdf.exists).length} vorhanden, ${(pdfBytes / 1024 / 1024).toFixed(0)} MB gesamt`);
  console.log(`  Ausgabe:          ${OUT_DIR}`);
  if (failures.length) {
    writeFileSync(join(OUT_DIR, "fehler.json"), JSON.stringify(failures, null, 1));
    console.log("  Fehlerliste:      fehler.json");
  } else {
    rmSync(join(OUT_DIR, "fehler.json"), { force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
