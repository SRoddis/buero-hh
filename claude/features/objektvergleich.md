# Objektvergleich

← [Projektkontext](../context.md)

Route: `/immobilien/vergleich?nr=097,123,456`

## Verhalten

- **Auswahl:** Checkbox auf den Listenkarten, bis zu 3 Objekte (`MAX_COMPARE`). Unten fährt eine Leiste ein mit drei
  Plätzen (Vorschaubild), „Vergleich abbrechen“ (X) und „Jetzt vergleichen“ (ab 2 Objekten, mit Ladeanzeige).
- **Vergleichsseite:** Kopf mit Objekt-Karussells, Tabelle aller Kriterien (Lage, Adresse, Marktgebiet, Objektart,
  Objektnummer, Flächen, Mieten, Nebenkosten, Ausstattung …), günstigster/teuerster Wert farbig, ✓/✗-Icons statt Ja/Nein.
  Karte mit Pins A/B/C und Standortliste.
- **Aktionen:** „Nur Unterschiede anzeigen“, „Alle merken“, Exposés-Dropdown, „Vergleich teilen“ (Link mit `?nr=`),
  „Vergleich drucken“ → eigenes PDF.
- **Zurück zur Suche:** führt zur Suche mit denselben Filtern an dieselbe Scrollposition (Session Storage, 30 min gültig).
- Fehlende Objekte (verkauft/entfernt) werden gemeldet; alte Links mit `?ids=` funktionieren weiter.

## PDF

`/api/vergleich/pdf?nr=…` (optional `unterschiede=1`) – serverseitig mit `@react-pdf/renderer`, Kopf und Fuß wie das alte
PDF (Konditionen, Bankverbindung, Steuernummer aus `COMPANY`). Bilder werden mit sharp von WebP nach JPEG gewandelt, weil
react-pdf kein WebP kann. Dieselben Zeilen wie die Webseite (`compare-rows.ts`), ohne Exposé-Zeile; passt auf eine Seite.

## Wichtige Dateien

- [compare-provider.tsx](../../src/components/compare/compare-provider.tsx), [compare-bar.tsx](../../src/components/compare/compare-bar.tsx), [compare-checkbox.tsx](../../src/components/compare/compare-checkbox.tsx)
- [compare-view.tsx](../../src/components/compare/compare-view.tsx), [page.tsx](../../src/app/immobilien/vergleich/page.tsx)
- [compare-rows.ts](../../src/lib/compare-rows.ts) – gemeinsame Zeilen für Web und PDF
- [compare-pdf.tsx](../../src/lib/pdf/compare-pdf.tsx), [route.ts](../../src/app/api/vergleich/pdf/route.ts)
- [search-return.ts](../../src/components/compare/search-return.ts) – Rücksprung in die Suche

## Offen

- Adresse im PDF-Fuß bestätigen: altes PDF „Poststraße 37“, Website „Hohe Bleichen 21“ (verwendet).
