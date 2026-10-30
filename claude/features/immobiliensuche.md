# Immobiliensuche

← [Projektkontext](../context.md)

Route: `/immobilien` – das Herzstück der Website.

## Verhalten

- **Filter:** Stadtteil (Mehrfachauswahl, nach Bezirk gruppiert), Objektart, Lage (Marktgebiet), Mietfläche und Miete
  (€/m²) von–bis; Schnellfilter-Chips mit Icons (Provisionsfrei, Barrierefrei, Parkplätze, Balkon/Terrasse, Wasserblick,
  Erdgeschoss); „Weitere Filter“ mit allen Ausstattungsmerkmalen.
- **Alle Parameter in der URL** – teilbar und lesezeichenfähig; „Suche speichern“ kopiert den Link.
- **Ansichten (Desktop):** Umschalter oben rechts **Liste · Liste/Karte · Karte**. Start ist „Liste/Karte“. Klick auf
  den Karten-Pin einer Listenkarte wechselt aus „Liste“ automatisch zu „Liste/Karte“.
- **Scrollen:** In „Liste“ und „Liste/Karte“ scrollt die ganze Seite; die Karte bleibt rechts stehen (`sticky`) und hält
  über dem Footer an. „Karte“ füllt die Bildschirmhöhe.
- **Mobil:** runder Button „Karte“/„Liste“ unten; die Kartenansicht bekommt einen eigenen Verlaufseintrag, damit „Zurück“
  an die vorherige Listenposition führt.
- **Trefferliste:** 24 Objekte pro Seite. Spalten per Container Query nur 1, 2, 3, 4, 6 oder 8 – 24 ist durch alle teilbar,
  daher bleiben keine Lücken in der letzten Reihe.
- **Listenkarte:** Bild-Karussell (Wischen/Slide), Badges zwischen Bild und Überschrift (Objektart in Kategoriefarbe +
  max. 2 Ausstattungen, immer einzeilig – was nicht passt, wird ausgeblendet), Fläche, Flächen im Objekt, Lage, Preis.
  Checkbox für den [Vergleich](objektvergleich.md), Herz für die [Merkliste](merkliste.md), Pin „auf der Karte anzeigen“.
- Objekte ohne Bilder zeigen einen Platzhalter („Für dieses Objekt sind aktuell keine Bilder verfügbar.“).

## Wichtige Dateien

- [search-view.tsx](../../src/components/search/search-view.tsx) – Layout, Ansichten, Synchronisierung Liste ↔ Karte
- [results-header.tsx](../../src/components/search/results-header.tsx) – Trefferzahl, Sortierung, Ansichts-Umschalter
- [search-bar.tsx](../../src/components/search/search-bar.tsx), [filter-dialog.tsx](../../src/components/search/filter-dialog.tsx), [mobile-search-sheet.tsx](../../src/components/search/mobile-search-sheet.tsx)
- [params.ts](../../src/lib/search/params.ts) – URL ⇄ Filter
- [listing-card.tsx](../../src/components/listing/listing-card.tsx), [listing-badges.tsx](../../src/components/listing/listing-badges.tsx)
- [constants.ts](../../src/lib/constants.ts) – `PAGE_SIZE`, Objektarten, `CATEGORY_COLORS`, Ausstattungen
- Daten: RPC `search_properties` auf der Materialized View `property_listings_mv` ([supabase-repository.ts](../../src/lib/data/supabase-repository.ts))

## Entscheidungen

- Kartengrößen-Buttons auf der Karte wurden durch den Dreifach-Umschalter ersetzt (einfacher, eindeutiger).
- Die frühere eigene Scrollspalte der Liste wurde zugunsten von Seiten-Scroll + sticky Karte aufgegeben.
- `PAGE_SIZE` und die Spaltenstufen hängen zusammen – beim Ändern beides anpassen.
- Abfragen laufen mit Retry bei Statement-Timeout (`retryOnTimeout`), da der anon-Timeout 3 s beträgt.
