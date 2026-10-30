# Fehler- & Störungsseiten

← [Projektkontext](../context.md)

## Verhalten

- **Störungsseite** statt Testdaten, wenn Supabase fehlt oder nicht erreichbar ist (`DataSourceUnavailableError`, Fehler-
  grenze `error.tsx`). Grund: Interessenten sollen nie veraltete oder erfundene Angebote sehen.
- **Vorschau** der Störungsseite unter `/stoerung` – **nur lokal** erreichbar, live nicht.
- **404-Seite** allgemein und für unbekannte Objektnummern, mit Wegen zurück zur Suche und Kontakt.
- Statement-Timeouts der Datenbank werden einmal wiederholt (`retryOnTimeout`), bevor ein Fehler angezeigt wird.

## Wichtige Dateien

- [error.tsx](../../src/app/error.tsx), [not-found.tsx](../../src/app/not-found.tsx), [stoerung/page.tsx](../../src/app/stoerung/page.tsx)
- [outage-page.tsx](../../src/components/layout/outage-page.tsx), [not-found-view.tsx](../../src/components/layout/not-found-view.tsx), [status-page.tsx](../../src/components/layout/status-page.tsx)
- [repository.ts](../../src/lib/data/repository.ts) – `DataSourceUnavailableError`, Konfigurationsprüfung
- `/api/health` – einfacher Health-Check
