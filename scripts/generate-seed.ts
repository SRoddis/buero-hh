/**
 * Erzeugt supabase/seed.sql aus den Mock-Daten, damit Frontend-Mocks und Datenbank
 * denselben Bestand haben. Aufruf: npm run db:seed:generate
 *
 * IDs werden deterministisch per md5(...)::uuid erzeugt – der Seed ist wiederholbar.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { DISTRICTS } from "../src/lib/data/mock/districts";
import { BUILDING_FEATURES, CONTACTS, MOCK_LISTINGS } from "../src/lib/data/mock/listings";

const DERIVED = new Set(["provisionsfrei", "sofort-verfuegbar", "teilbar"]);

const q = (v: string | number | boolean | null | undefined) =>
  v === null || v === undefined ? "null" : typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : String(v);
const uuid = (key: string) => `md5(${q(key)})::uuid`;
const textArray = (values: string[]) => (values.length ? `array[${values.map(q).join(", ")}]::text[]` : "'{}'::text[]");
const point = (lng: number, lat: number) => `extensions.st_setsrid(extensions.st_makepoint(${lng.toFixed(6)}, ${lat.toFixed(6)}), 4326)::extensions.geography`;

const lines: string[] = [
  "-- Automatisch generiert durch scripts/generate-seed.ts – nicht manuell bearbeiten.",
  "begin;",
  "",
  "insert into districts (slug, name, borough, center_lng, center_lat, location_class) values",
  DISTRICTS.map(
    (d) => `  (${q(d.slug)}, ${q(d.name)}, ${q(d.borough)}, ${d.center[0]}, ${d.center[1]}, ${q(d.locationClass)})`,
  ).join(",\n") + "\non conflict (slug) do nothing;",
  "",
  "insert into contacts (id, name, role, email, phone) values",
  CONTACTS.map((c) => `  (${uuid(`contact-${c.id}`)}, ${q(c.name)}, ${q(c.role)}, ${q(c.email)}, ${q(c.phone)})`).join(
    ",\n",
  ) + "\non conflict (id) do nothing;",
  "",
];

for (const l of MOCK_LISTINGS) {
  const b = l.building;
  const propertyFeatures = l.features.filter((f) => !BUILDING_FEATURES.has(f) && !DERIVED.has(f));

  lines.push(
    `-- ${l.title}`,
    `insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (${uuid(
      `building-${l.id}`,
    )}, ${q(b.name)}, ${q(b.street)}, ${q(b.houseNumber)}, ${q(b.postalCode)}, ${q(b.districtSlug)}, ${point(b.lng, b.lat)}, ${q(
      b.locationClass,
    )}, ${q(b.yearBuilt)}, ${q(b.yearRenovated)}, ${q(b.floors)}, ${textArray(b.features)});`,
    `insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (${uuid(
      `property-${l.id}`,
    )}, ${uuid(`building-${l.id}`)}, ${uuid(`contact-${l.contact.id}`)}, ${q(l.slug)}, ${q(l.id.toUpperCase())}, ${q(
      l.title,
    )}, ${q(l.teaser)}, ${q(l.description)}, ${q(l.category)}, ${q(l.type)}, 'published', ${l.commissionFree}, ${textArray(
      propertyFeatures,
    )}, ${q(l.publishedAt)});`,
    "insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values",
    l.units
      .map(
        (u, i) =>
          `  (${uuid(`unit-${u.id}`)}, ${uuid(`property-${l.id}`)}, ${q(u.label)}, ${u.floor}, ${u.areaSqm}, ${q(
            u.rentPerSqm,
          )}, ${q(u.serviceChargePerSqm)}, ${q(u.availableFrom)}, ${q(u.rooms)}, ${u.divisible}, ${i})`,
      )
      .join(",\n") + ";",
    "insert into property_images (id, property_id, url, alt, sort_order) values",
    l.images
      .map((img, i) => `  (${uuid(`image-${img.id}`)}, ${uuid(`property-${l.id}`)}, ${q(img.url)}, ${q(img.alt)}, ${i})`)
      .join(",\n") + ";",
    "",
  );
}

lines.push("commit;", "");

const target = join(process.cwd(), "supabase", "seed.sql");
writeFileSync(target, lines.join("\n"));
console.log(`Seed mit ${MOCK_LISTINGS.length} Immobilien geschrieben: ${target}`);
