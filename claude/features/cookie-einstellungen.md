# Cookie-Einstellungen

← [Projektkontext](../context.md)

## Verhalten

- **Banner** unten bis zur Entscheidung: „Alle akzeptieren“, „Alle ablehnen“, „Einstellungen verwalten“.
- **Einstellungsfenster** mit drei Kategorien: Notwendig (immer aktiv), Funktional, Externe Dienste & Marketing.
- Jederzeit änderbar über „Cookie-Einstellungen“ im Footer. Wird eine Einwilligung entzogen, lädt die Seite neu (geladene
  Skripte lassen sich nicht entladen).
- **SalesViewer®** lädt nur mit Einwilligung in „Externe Dienste & Marketing“ (Snippet und Konto-Kennung unverändert von
  der alten Website). `NEXT_PUBLIC_SALESVIEWER_ID=""` schaltet es ab.
- „Funktional“ steuert derzeit nichts (Merkliste und Vergleich liegen ohnehin nur im Browser).

## Kompatibilität mit der alten Website

Gleiches Cookie `cc_cookie` im Format von vanilla-cookieconsent v3 (Revision 1, 182 Tage). Die alte Seite nutzte das CSS
dieser Bibliothek mit eigener Vue-Logik. Auf derselben Domain bleiben bestehende Entscheidungen daher gültig. Ändern sich
Kategorien oder Dienste: `CONSENT_REVISION` erhöhen → alle werden neu gefragt.

## Wichtige Dateien

- [consent-provider.tsx](../../src/components/consent/consent-provider.tsx) – Provider, Banner, Einstellungsfenster, `useConsent()`
- [consent.ts](../../src/lib/consent.ts) – Cookie lesen/schreiben
- [salesviewer.ts](../../src/components/consent/salesviewer.ts)
- [switch.tsx](../../src/components/ui/switch.tsx)

## Offen

- Wird SalesViewer weiter genutzt? Falls nein: abschalten, Abschnitt 6.1 der Datenschutzerklärung und die Kategorie
  entfernen – dann ist evtl. gar kein Banner mehr nötig.
- Testen nie ohne Blockade von `*salesviewer*` – sonst landen Testbesuche im echten Konto.
