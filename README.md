# BüroHamburg.de – Immobiliensuche

MVP einer modernen Gewerbeimmobiliensuche für BüroHamburg.de: Suchfilter oben, Trefferliste links, interaktive Hamburg-Karte rechts, Detailseiten mit Galerie und Kontaktformular.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS 4 · shadcn/ui · MapLibre GL JS · Supabase (PostgreSQL + PostGIS)

## Schnellstart

```bash
npm install          # kopiert auch den MapLibre-Worker nach public/vendor/
npm run dev          # http://localhost:3000 → /immobilien
```

Ohne weitere Konfiguration läuft die App mit **44 realistischen Mock-Objekten** aus Hamburg.

| Script | Zweck |
| --- | --- |
| `npm run dev` / `build` / `start` | Entwicklung / Produktion |
| `npm run lint`, `npm run typecheck` | Qualitätsprüfungen |
| `npm run db:seed:generate` | erzeugt `supabase/seed.sql` aus den Mock-Daten |
| `npm run db:push` | neue Migrationen ins verknüpfte Supabase-Projekt einspielen |
| `npm run db:types` | TypeScript-Typen aus dem Datenbankschema generieren |

## Funktionen

- **Suche** nach Stadtteil (Mehrfachauswahl, gruppiert nach Bezirk), Objektart, Lage, Mietfläche und Miete (€/m²)
- **Schnellfilter** (Nutzungsart, provisionsfrei, Neubau, barrierefrei …) und **„Weitere Filter“** mit 20 Ausstattungsmerkmalen
- **Karte** mit Clustering, Farbcodierung nach Objektart, Popup-Karte und Legende
- **Synchronisierung Liste ↔ Karte:** Hover auf einer Karte zeigt den Marker als Preis-Pin (auch innerhalb von Clustern), Klick auf einen Marker öffnet die Objektvorschau und hebt die Karte in der Liste hervor; optional **„Beim Verschieben der Karte suchen“** (PostGIS-Bounding-Box)
- **Alle Suchparameter in der URL** (`/immobilien?stadtteil=hafencity&typ=buero&flaeche_von=200&ausstattung=provisionsfrei`) – teilbar, lesezeichenfähig, „Suche speichern“ kopiert den Link
- **Sortierung** und **Paginierung**, optimistische UI-Updates während der Server neu lädt
- **Detailseite** mit Bildergalerie + Lightbox (Tastatur), Eckdaten, Mietflächen-Tabelle, Objektdaten, Lagekarte, ähnlichen Objekten und **Kontaktformular** (Server Action, Zod-Validierung, Honeypot)
- **Merkliste** ohne Login (lokal im Browser)
- **Responsive:** Desktop als App-Layout in Bildschirmhöhe (Liste scrollt, Karte fix, Größe umschaltbar); mobil Such-Fly-up und Umschalter Liste/Karte

## Projektstruktur

```
src/
  app/
    immobilien/(suche)/     Suchseite (Server Component lädt Treffer anhand der URL)
    immobilien/[slug]/      Detailseite
    merkliste/              Merkliste
    api/listings/           Kurzinfos für die Merkliste
  components/
    search/                 Suchleiste, Filter, Ergebnisliste, Such-Context (URL-State)
    map/                    MapLibre-Karten (Suche + Lage), Stil, Legende
    listing/                Immobilienkarte, Badges, Bilder, Ausstattungs-Icons
    detail/                 Galerie, Kontaktformular, Flächentabelle
    layout/ favorites/ ui/  Header/Footer, Merkliste, shadcn/ui
  lib/
    constants.ts types.ts   Fachliche Stammdaten und Domänenmodell
    search/                 URL-Parameter (parse/serialize) und In-Memory-Filter
    data/                   Repository-Interface, Mock- und Supabase-Implementierung, Mock-Daten
    actions/                Server Actions (Kontaktanfrage)
supabase/
  migrations/               Schema, View, Suchfunktion, RLS
  seed.sql                  generiert aus den Mock-Daten
services/filemaker-sync/    separater Sync-Service FileMaker → Supabase
```

Seiten greifen ausschließlich über `PropertyRepository` (`src/lib/data/repository.ts`) auf Daten zu. Ob Mock-Daten oder Supabase genutzt werden, entscheidet `DATA_SOURCE` bzw. ob Supabase konfiguriert ist.

## Supabase anbinden

Das Projekt ist mit Supabase Cloud verknüpft (`supabase/config.toml`, CLI als Dev-Abhängigkeit). Für ein neues Projekt bzw. einen neuen Rechner:

1. Einmalig anmelden und verknüpfen (interaktiv, fragt nach dem Datenbank-Passwort):
   ```bash
   npx supabase login
   npx supabase link --project-ref <projekt-ref>
   ```
2. Schema und Testdaten einspielen:
   ```bash
   npx supabase db push --linked --include-seed   # später nur: npm run db:push
   ```
3. `.env.local` anlegen (Vorlage: `.env.example`; Key unter „Project Settings → API Keys“):
   ```
   DATA_SOURCE=supabase
   SUPABASE_URL=https://<projekt>.supabase.co
   SUPABASE_PUBLISHABLE_KEY=<publishable key>
   ```
4. Nach Schemaänderungen: neue Datei unter `supabase/migrations/`, dann `npm run db:push` und `npm run db:types`.

### Datenmodell

| Tabelle | Inhalt |
| --- | --- |
| `districts` | Stadtteile mit Bezirk, Mittelpunkt und Büromarkt-Lage |
| `buildings` | Gebäude: Adresse, `geography(Point)` mit GiST-Index, Baujahr, Gebäudemerkmale |
| `properties` | Vermarktungsobjekt: Titel, Texte, Nutzungsart, Status, Provision, Objektmerkmale |
| `rental_units` | einzelne Mietflächen: Etage, Fläche, Miete/NK je m², verfügbar ab, teilbar |
| `property_images` | Bilder (Supabase Storage, Bucket `property-images`) |
| `contacts` | Ansprechpartner |
| `inquiries` | Kontaktanfragen aus dem Exposé (anonymes Insert per RLS) |
| `sync_runs` | Protokoll und Watermark des FileMaker-Syncs |

Die View `property_listings` aggregiert Flächen, Preise, Merkmale, Bilder und Kontakt je Objekt; die RPC `search_properties(...)` filtert (inkl. PostGIS-Bounding-Box), Sortierung und Paginierung laufen über PostgREST. RLS gibt nur veröffentlichte Objekte frei; Schreibzugriffe erfolgen ausschließlich über den Service-Role-Key des Sync-Services.

Migration, Seed und Suchfunktion wurden gegen PostgreSQL + PostGIS getestet; die SQL-Suche liefert dieselben Treffer wie die In-Memory-Suche der Mock-Daten.

## FileMaker-Integration (vorbereitet)

`services/filemaker-sync` ist ein eigenständiges Node-Paket, das über die **FileMaker Data API** liest und per Upsert nach Supabase schreibt:

- Delta-Sync anhand des Änderungszeitstempels (Watermark in `sync_runs`), `--full` für Vollabgleich
- idempotente Upserts über `(source, external_id)` in allen synchronisierten Tabellen
- Bilder aus Container-Feldern → Supabase Storage (Prüfsumme verhindert Doppel-Uploads)
- Export neuer Kontaktanfragen zurück nach FileMaker
- fehlerhafte Einzeldatensätze werden protokolliert, ohne den Lauf abzubrechen

```bash
cd services/filemaker-sync
npm install
cp .env.example .env    # FileMaker- und Supabase-Zugangsdaten eintragen
npm run sync            # einmalig; SYNC_INTERVAL_MINUTES für Daemon-Betrieb
```

> Layout- und Feldnamen (`src/config.ts`, `src/filemaker/types.ts`, `src/mapping.ts`) sind Annahmen und müssen mit der realen FileMaker-Lösung abgeglichen werden.

## Hinweise

- **Karte:** Standardstil ist OpenFreeMap „Positron“ (kostenlos, ohne API-Key). Für den Produktivbetrieb ggf. eigenen Stil/Anbieter über `NEXT_PUBLIC_MAP_STYLE_URL` setzen.
- **Bilder:** Mock-Daten nutzen Unsplash-Fotos; produktiv kommen die Bilder aus Supabase Storage.
- **Mock-Inhalte:** Ansprechpartner, Telefonnummern und E-Mail-Adressen sind fiktiv.
- Inhaltsseiten (Home, Über uns, Für Vermieter, Suchauftrag, Impressum, Datenschutz) verlinken vorerst auf www.buerohamburg.de.
- Bewusst nicht enthalten: Registrierung/Login und ein eigenes Verwaltungsbackend.
