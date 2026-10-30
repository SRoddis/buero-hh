# Monitoring: Import & Qualität

← [Projektkontext](../context.md)

Custom Report im Supabase-Dashboard (Reports → Blöcke). Die Abfragen liegen als Views im Schema `reports`
(Migration [20261030000000_reports.sql](../../supabase/migrations/20261030000000_reports.sql)); jeder Block ist nur
`select * from reports.<name>;`. Einrichtung, Blockliste und Änderungsweg: [supabase/reports/README.md](../../supabase/reports/README.md).

Supabase bietet keine API zum Anlegen von Report-Blöcken – die Blöcke werden einmalig von Hand im Dashboard angelegt,
Änderungen an den Abfragen kommen danach per Migration.

## Bereiche

**Kennzahlen-Übersicht** (`reports.kennzahlen`, Migration `20261030020000`): eine Zeile je Kennzahl mit Wert und Ampel
(✅ ⚠️ ❌), je Bereich ein Block. Grund: Report-Blöcke kennen nur Tabelle und Balken, keine Einzelwert-Kacheln. Die
Ampel-Schwellen stehen in den `case`-Ausdrücken der View. Für die Details gibt es die Views unten.

- **Importer** – läuft der Abgleich? Letzter Lauf (Alarmzeichen: über 20 Minuten alt), letzte 10 Läufe einzeln und als
  Zusammenfassung (Erfolgsquote, Dauer, Änderungen, Fehler), Erfolgsquote 24 h, Änderungen pro Tag, Bild-Warteschlange,
  Warnungen (unbekannte Objektarten/Lagen).
- **Bestand** – aktive Objekte, neu/archiviert in 7 Tagen, Objektart × Lage, Miete je Lage, Flächenverteilung.
- **Qualität** – Score (Bild, Koordinaten, Preis, Beschreibung > 200 Zeichen, Exposé), Problemliste zum Nachpflegen in
  FileMaker, Ausreißer (Miete < 5 oder > 60 €/m², Fläche < 10 oder > 20.000 m²), Frische der Detailprüfung.
  „Ansprechpartner“ ist bewusst nicht enthalten: Die Objekt-API liefert keinen (`contact_id` überall leer) – wieder
  aufnehmen, sobald ein Import Ansprechpartner liefert (Migration `20261030010000`).

## Datengrundlage

- `sync_runs` – nur Objekt-Läufe (`mode = 'sync'`); Zähler in `stats` (`listed`, `created`, `updated`, `unchanged`,
  `rechecked`, `archived`, `restored`, `failed`, `imagesQueued`, `warnings`, ggf. `skippedArchive`). Die minütlichen
  Bild-Läufe werden nicht protokolliert – ihr Zustand steht in `property_images.status`.
- „Aktiv“ = `properties.status = 'published' and archived_at is null`.
- `properties.synced_at` wird bei jeder Detailprüfung gesetzt (auch ohne Änderung).

## Hinweise

- Heute kommen die Daten über die API von buerohamburg.de (aus FileMaker); ein späterer direkter FileMaker-Import schreibt in
  dieselben Tabellen – die Abfragen bleiben gültig, solange er `sync_runs` mit `mode = 'sync'` und denselben `stats`-Feldern
  füllt.
- „Neu in 7 Tagen“ zählt nach `created_at` – bis eine Woche nach dem Erstimport (Ende Oktober 2026) stehen dort alle
  Objekte.
- Einzelne Fehler je Lauf (`stats.failedRefs`, jedes Mal andere Objektnummern) sind die bekannten sporadischen 404 der
  Quell-API und kein Alarmzeichen; dieselben Nummern über mehrere Läufe dagegen schon.
- Schwellwerte (20 Minuten, 24 h, Ausreißer-Grenzen) sind Annahmen – bei Bedarf per neuer Migration anpassen.
- Neue Zähler im Import → hier und in der betreffenden View ergänzen.
- Das Schema `reports` umgeht RLS (Views laufen als Owner) und darf nie über die API freigegeben werden.
