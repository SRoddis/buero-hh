# Datensync buerohamburg.de → Supabase

← [Projektkontext](../context.md)

Ausführliche Beschreibung inkl. API-Endpunkten und curl-Beispielen: [README → Laufender Abgleich](../../README.md#laufender-abgleich-mit-buerohamburgde)
und [README → buerohamburg.de-API](../../README.md#buerohamburgde-api).

## Verhalten

- Edge Function `sync-buerohamburg`, per pg_cron aufgerufen: Objekte alle 10 Minuten (`mode: sync`, protokolliert in
  `sync_runs`), Bild-Warteschlange jede Minute (`mode: images`).
- **Objekte:** Suche über alle Lagen (auch ohne `objektart`, sonst fehlen Objekte); Details nur für neue/geänderte Objekte
  (Hash über den Listeneintrag) plus reihum 60 Objekte je Lauf vollständig. Unbekannte Objektarten landen als Warnung in
  `sync_runs.stats->warnings` („Gastro“ → Laden).
- **Bilder:** nach Supabase Storage; Erkennung toleriert Lücken in der Nummerierung (`BH_MAX_IMAGE_GAP=3`), bei
  unsicherem Ergebnis wird nichts gelöscht.
- **Materialized View** `property_listings_mv` wird nur bei echten Änderungen und gedrosselt aktualisiert (Bild-Job nur bei
  leerer Warteschlange oder zur Minute ≡ 5 mod 10) – häufige Refreshes hatten Statement-Timeouts (57014) ausgelöst.

## Wichtige Dateien

- [sync.ts](../../supabase/functions/sync-buerohamburg/sync.ts), [images.ts](../../supabase/functions/sync-buerohamburg/images.ts), [index.ts](../../supabase/functions/sync-buerohamburg/index.ts)
- [buerohamburg.ts](../../supabase/functions/_shared/buerohamburg.ts) – gemeinsamer API-Client und Mapping
- Migrationen in [supabase/migrations](../../supabase/migrations)
- Deploy: `npm run functions:deploy` (vorher `npx supabase login`)

## Grenzen

- Neue Lagen lassen sich über die Such-API nicht erkennen (nur die bekannten sieben werden abgefragt). Idee, nicht
  umgesetzt: neue Objektnummern über `/api/objects?nr=` abtasten.
- Die alte Website wird abgeschaltet → langfristig direkt aus FileMaker synchronisieren (`services/filemaker-sync`,
  vorbereitet, Feldnamen noch Annahmen).
