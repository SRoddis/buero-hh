# Suchauftrag

← [Projektkontext](../context.md)

Fenster (Modal), geöffnet über „Suchauftrag“ im Header (Desktop und Mobilmenü) – `useSearchRequest().open()`.

## Verhalten

- Felder: Name*, E-Mail*, Telefon*, Objektart* (Mehrfachauswahl), Lage* (Mehrfachauswahl), Mietfläche von/bis, Mietpreis
  von/bis, weitere Kriterien (Mehrfachauswahl), Kommentar. Pflicht sind die mit *.
- **Nur Werte, die die API annimmt** – exakt aus dem Formular der alten Website übernommen (geprüft im Live-Bundle):
  Objektart `Büro`/`Laden`, 7 Lagen `HH-…`, Flächenstufen `0`…`5000`, `5000+`, Mietpreis `0`–`30`, 6 Kriterien.
  Daher Auswahllisten statt Freitext.
- Prüfung per Zod auf dem Server (u. a. „bis“ ≥ „von“), Fehler je Feld; Honeypot `website`.
- Kopf und Absenden-Leiste bleiben stehen, nur die Felder scrollen; auf niedrigen Fenstern kompakter (`short:`-Variante).

## Weiterleitung

POST an `https://www.buerohamburg.de/api/suchauftrag` – **nur in Produktion** oder mit `SUCHAUFTRAG_WEITERLEITEN=1`.
Lokal wird nur protokolliert, weil die API echte E-Mails an BüroHamburg verschickt. **Nicht lokal gegen die API testen.**

## Wichtige Dateien

- [search-request-dialog.tsx](../../src/components/search-request/search-request-dialog.tsx) – Provider, Fenster, Formular
- [search-request.ts (Action)](../../src/lib/actions/search-request.ts) – Prüfung und Weiterleitung
- [search-request.ts (Werte)](../../src/lib/search-request.ts) – erlaubte API-Werte

## Offen

- Der echte Versand ist ungetestet → nach dem Go-live einmal mit gekennzeichnetem Testauftrag prüfen.
- Keine Begrenzung der Anfragen pro Zeit außer dem Honeypot.
- Abhängig von der alten API – bei deren Abschaltung Ersatz nötig (z. B. E-Mail-Versand oder Supabase + Benachrichtigung).
