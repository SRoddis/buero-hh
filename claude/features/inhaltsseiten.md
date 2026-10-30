# Inhaltsseiten & Rechtstexte

← [Projektkontext](../context.md)

## Startseite `/`

- Überschrift mit gerundeter Objektzahl, vier Top-Objekte (aus den Rängen der alten Startseite, je Rang ein Objekt) mit
  Bild-Karussell, Buttons zu Büro/Praxis und Laden/Gastro, Kontakt- und Anfahrt-Kasten (Lagekarte), Impressumsangaben.
- [page.tsx](../../src/app/page.tsx), [featured-card.tsx](../../src/components/home/featured-card.tsx)

## Über uns `/ueber-uns`

- Text, Team mit Fotos (aus dem Dateisystem: `public/images/ueber-uns/`, Daten in [team.ts](../../src/content/team.ts)).
  Kein Breadcrumb.
- [page.tsx](../../src/app/ueber-uns/page.tsx)

## Rechtstexte als Fenster

- Impressum, Datenschutz und AGB öffnen als Modal über der aktuellen Seite (wie auf der alten Website), Texte werden erst
  beim Öffnen geladen. Links im Footer und in Formularen.
- [legal-dialog.tsx](../../src/components/layout/legal-dialog.tsx), [legal-links.tsx](../../src/components/layout/legal-links.tsx), [company-imprint.tsx](../../src/components/layout/company-imprint.tsx)
- Texte: [datenschutz.ts](../../src/content/legal/datenschutz.ts), [agb.ts](../../src/content/legal/agb.ts)
- Firmendaten zentral in [company.ts](../../src/lib/company.ts) (`COMPANY`, `OFFER_TERMS`); Telefonnummern mit Leerzeichen
  statt Punkt (z. B. „040 22 62 11-00“).

## Datenschutzerklärung – Stand

Entwurf, an die neue Website angepasst (Matomo, Google Maps/Fonts, Privacy Shield entfernt; Cookies, Hosting, OpenFreeMap,
Objektanfrage, Suchauftrag ergänzt; SalesViewer nur mit Einwilligung). **Muss vor dem Go-live freigegeben werden**,
Anschriften der Anbieter und Serverstandorte prüfen – siehe [README → Vor dem Go-live](../../README.md#vor-dem-go-live).

## Layout

- Header mit Navigation (Home, Über uns, Immobilien suchen, Für Vermieter, Suchauftrag, Merkliste) – mobil als Sheet.
- Footer mit Objektarten, beliebten Stadtteilen, Kontakt, Rechtslinks und „Cookie-Einstellungen“.
- [site-header.tsx](../../src/components/layout/site-header.tsx), [site-footer.tsx](../../src/components/layout/site-footer.tsx)
