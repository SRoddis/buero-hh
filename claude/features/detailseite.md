# Objekt-Detailseite

← [Projektkontext](../context.md)

Route: `/immobilien/[objektnr]` – z. B. `/immobilien/097`.

## Verhalten

- **URL per Objektnummer** (wie bei BüroHamburg intern üblich). Alte Slug-URLs leiten per 308 auf die Objektnummer um;
  kanonische URL wird gesetzt.
- Bildergalerie mit Lightbox (Tastatur, Slide-Animation), Badges, Eckdaten, Mietflächen-Tabelle, Objektdaten,
  Lagekarte, ähnliche Objekte, Teilen-Button (native Teilen-Funktion bzw. Link kopieren).
- **Anfrageformular** (Server Action, Zod, Honeypot) – speichert in der Tabelle `inquiries`.
- Seiten werden mit ISR (`revalidate`) ausgeliefert.

## Wichtige Dateien

- [page.tsx](../../src/app/immobilien/[objektnr]/page.tsx), [not-found.tsx](../../src/app/immobilien/[objektnr]/not-found.tsx)
- [image-gallery.tsx](../../src/components/detail/image-gallery.tsx), [units-table.tsx](../../src/components/detail/units-table.tsx), [share-button.tsx](../../src/components/detail/share-button.tsx)
- [contact-form.tsx](../../src/components/detail/contact-form.tsx), [inquiry.ts](../../src/lib/actions/inquiry.ts)
- [urls.ts](../../src/lib/urls.ts) – `listingHref`, Erkennung von Objektnummern

## Offen

- **Anfragen benachrichtigen niemanden** – sie landen nur in `inquiries`. Auf der alten Seite gab es kein Formular (nur
  E-Mail/Telefon). Vor dem Go-live: Benachrichtigung einbauen oder Formular durch E-Mail/Telefon ersetzen
  (siehe [README → Vor dem Go-live](../../README.md#vor-dem-go-live)).
