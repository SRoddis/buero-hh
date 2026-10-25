/**
 * Erzeugt aus den gescrapten Daten (data/scrape/buerohamburg.json, siehe `npm run scrape`):
 *   - supabase/seed/NNN.sql              kompletter Objektbestand für Supabase, in Paketen
 *                                        (die Management-API nimmt nur begrenzt große Abfragen an)
 *
 * Aufruf: npm run db:seed:generate – einspielen mit: npm run db:seed:linked
 *
 * IDs werden deterministisch per md5(...)::uuid aus der Objektnummer erzeugt – der Seed ist
 * wiederholbar und passt zu den Schlüsseln (source = 'filemaker', external_id = Objektnummer),
 * die später auch der FileMaker-Sync verwendet.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { transform, type ScrapedObject } from "./lib/buerohamburg-transform";

/** Maximale Größe eines Seed-Pakets in Bytes */
const SEED_CHUNK_BYTES = 300_000;
const NL = "\n";

const scraped: ScrapedObject[] = JSON.parse(
  readFileSync(join(process.cwd(), "data", "scrape", "buerohamburg.json"), "utf8"),
);
const { listings, districts } = transform(scraped);

// ---------------------------------------------------------------------------
// Seed-Pakete – jedes Statement ist idempotent (on conflict do nothing), damit
// abgebrochene Läufe gefahrlos wiederholt werden können
// ---------------------------------------------------------------------------
const q = (v: string | number | boolean | null | undefined) =>
  v === null || v === undefined ? "null" : typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : String(v);
const uuid = (key: string) => `md5(${q(key)})::uuid`;
const textArray = (values: string[]) => (values.length ? `array[${values.map(q).join(", ")}]::text[]` : "'{}'::text[]");
const enumArray = (values: string[], type: string) => `array[${values.map(q).join(", ")}]::${type}[]`;
const point = (lng: number | null, lat: number | null) =>
  lng == null || lat == null
    ? "null"
    : `extensions.st_setsrid(extensions.st_makepoint(${lng.toFixed(7)}, ${lat.toFixed(7)}), 4326)::extensions.geography`;

/** Zusammenhängende Statement-Gruppen; ein Paket enthält immer ganze Gruppen */
const blocks: string[] = [
  "insert into districts (slug, name, market_area, center_lng, center_lat) values" +
    NL +
    districts
      .map((d) => `  (${q(d.slug)}, ${q(d.name)}, ${q(d.marketArea)}, ${q(d.center?.[0] ?? null)}, ${q(d.center?.[1] ?? null)})`)
      .join("," + NL) +
    NL +
    "on conflict (slug) do update set name = excluded.name, market_area = excluded.market_area, center_lng = excluded.center_lng, center_lat = excluded.center_lat;",
];

const buildingsSeen = new Set<string>();
for (const l of listings) {
  const b = l.building;
  if (buildingsSeen.has(b.id)) continue;
  buildingsSeen.add(b.id);
  blocks.push(
    `insert into buildings (id, street, house_number, postal_code, city, district_slug, market_area, location, source, external_id) values (${uuid(
      `building-${b.id}`,
    )}, ${q(b.street)}, ${q(b.houseNumber)}, ${q(b.postalCode)}, ${q(b.city)}, ${q(l.districtSlug)}, ${q(l.marketArea)}, ${point(
      l.lng,
      l.lat,
    )}, 'filemaker', ${q(b.id)}) on conflict (id) do nothing;`,
  );
}

for (const l of listings) {
  const ref = l.referenceNumber;
  const property = uuid(`property-${ref}`);
  const statements = [
    `-- ${ref}: ${l.title}`,
    `insert into properties (id, building_id, reference_number, slug, title, teaser, description, category, categories, property_type, status, price_type, price_note, commission_free, commission_months, commission_note, features, area_range_min_sqm, area_range_max_sqm, expose_pdf_url, featured_rank, source, external_id) values (${property}, ${uuid(
      `building-${l.building.id}`,
    )}, ${q(ref)}, ${q(l.slug)}, ${q(l.title)}, ${q(l.teaser)}, ${q(l.description)}, ${q(l.category)}, ${enumArray(
      l.categories,
      "property_category",
    )}, ${q(l.type)}, 'published', ${q(l.priceType)}, ${q(l.priceNote)}, ${l.commissionFree}, ${q(l.commissionMonths)}, ${q(
      l.commissionNote,
    )}, ${textArray(l.features.filter((f) => f !== "provisionsfrei"))}, ${q(l.areaRangeMin)}, ${q(l.areaRangeMax)}, ${q(
      l.exposeUrl,
    )}, ${q(l.featuredRank)}, 'filemaker', ${q(ref)}) on conflict (id) do nothing;`,
    ...l.units.map(
      (u, i) =>
        `insert into rental_units (id, property_id, label, area_sqm, rent_per_sqm, rent_total_monthly, source, external_id) values (${uuid(
          `unit-${ref}-${i + 1}`,
        )}, ${property}, ${q(u.label)}, ${u.areaSqm || 1}, ${q(u.rentPerSqm)}, ${q(u.rentTotalMonthly)}, 'filemaker', ${q(
          `${ref}-${i + 1}`,
        )}) on conflict (id) do nothing;`,
    ),
  ];
  if (l.images.length) {
    statements.push(
      "insert into property_images (id, property_id, url, alt, sort_order, source, external_id) values" +
        NL +
        l.images
          .map(
            (img, i) =>
              `  (${uuid(`image-${ref}-${i + 1}`)}, ${property}, ${q(img.url)}, ${q(img.alt)}, ${i}, 'filemaker', ${q(
                `${ref}-${String(i + 1).padStart(2, "0")}`,
              )})`,
          )
          .join("," + NL) +
        NL +
        "on conflict (id) do nothing;",
    );
  }
  blocks.push(statements.join(NL));
}

const seedDir = join(process.cwd(), "supabase", "seed");
rmSync(seedDir, { recursive: true, force: true });
rmSync(join(process.cwd(), "supabase", "seed.sql"), { force: true });
mkdirSync(seedDir, { recursive: true });

const header =
  "-- Automatisch generiert durch scripts/generate-seed.ts aus dem Objektbestand von buerohamburg.de." +
  NL +
  "-- Nicht manuell bearbeiten – stattdessen `npm run scrape` und `npm run db:seed:generate` ausführen.";
const chunks: string[][] = [[]];
let size = 0;
for (const block of blocks) {
  const bytes = Buffer.byteLength(block);
  if (size + bytes > SEED_CHUNK_BYTES && chunks[chunks.length - 1].length) {
    chunks.push([]);
    size = 0;
  }
  chunks[chunks.length - 1].push(block);
  size += bytes;
}
chunks.forEach((chunk, i) => {
  const file = join(seedDir, `${String(i + 1).padStart(3, "0")}.sql`);
  writeFileSync(file, [header, "begin;", ...chunk, "commit;", ""].join(NL + NL));
});

console.log(`seed/:        ${chunks.length} Pakete, ${listings.length} Objekte, ${buildingsSeen.size} Gebäude, ${districts.length} Stadtteile`);
