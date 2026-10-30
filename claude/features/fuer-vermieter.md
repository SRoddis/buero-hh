# Für Vermieter

← [Projektkontext](../context.md)

Route: `/fuer-vermieter`

## Verhalten

- Einleitungstext für Eigentümer und Vermieter, darunter **„Aktuelle Mietergesuche“** aus `/api/gesuche` der alten Website
  (ISR, höchstens alle 10 Minuten neu geladen).
- **Filter:** Lage-Chips mit Anzahl; „Ihre Fläche“ als Auswahl in Stufen (bis 300 · 300–500 · 500–1.000 · ab 1.000 m²,
  ohne Zahlen in Klammern) – ein Gesuch passt, wenn sich seine Flächenspanne mit der Stufe überschneidet; „ab 1.000“
  schließt die Grenze ein. Sortierung: Standard, Fläche auf-/absteigend.
- Je Gesuch „Angebot senden“ → E-Mail an BüroHamburg mit Gesuch und Ansprechpartner im Betreff (wie bisher).
- Leere Filter-Ergebnisse: Hinweis, „Filter zurücksetzen“, „Fläche anbieten“. API nicht erreichbar: Kontaktangaben.

## Wichtige Dateien

- [page.tsx](../../src/app/fuer-vermieter/page.tsx)
- [request-list.tsx](../../src/components/landlords/request-list.tsx) – Filter, Sortierung, Karten
- [rental-requests.ts](../../src/lib/data/rental-requests.ts) – Abruf und Aufbereitung der Gesuche

## Entscheidungen

- Kein Freitextfeld für die Fläche – Stufen sind für Vermieter eindeutiger.

## Offen

- Abhängig von der alten API; optional die Gesuche künftig nach Supabase synchronisieren.
