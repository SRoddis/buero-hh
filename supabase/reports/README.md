# Supabase-Report „Import & Qualität“

Die Abfragen liegen als Views im Schema `reports` – definiert in der Migration
[20261030000000_reports.sql](../migrations/20261030000000_reports.sql). Beschreibung und Zweck:
[claude/features/monitoring.md](../../claude/features/monitoring.md).

## Im Dashboard einrichten

Supabase → Reports → Report anlegen → je Block „Add block“ → SQL-Snippet mit der Zeile aus der Tabelle.

**Kennzahlen (empfohlen):** Supabase zeigt SQL-Blöcke nur als Tabelle oder Balken – `reports.kennzahlen` liefert daher eine
Zeile je Kennzahl mit Wert und Ampel (✅ in Ordnung · ⚠️ beobachten · ❌ handeln). Je Bereich ein Block:

| Block | SQL |
| --- | --- |
| Kennzahlen · Import | `select kennzahl, wert, ampel from reports.kennzahlen where bereich = 'Import';` |
| Kennzahlen · Bestand | `select kennzahl, wert from reports.kennzahlen where bereich = 'Bestand';` |
| Kennzahlen · Qualität | `select kennzahl, wert, ampel from reports.kennzahlen where bereich = 'Qualität';` |

Details zum Nachschauen:

| Block | SQL | Darstellung |
| --- | --- | --- |
| Importer · Letzter Lauf | `select * from reports.letzter_lauf;` | Tabelle |
| Importer · Zusammenfassung letzte 10 | `select * from reports.letzte_10_laeufe_zusammenfassung;` | Tabelle (1 Zeile) |
| Importer · Letzte 10 Läufe | `select * from reports.letzte_10_laeufe;` | Tabelle |
| Importer · Erfolgsquote 24 h | `select * from reports.erfolgsquote_24h;` | Balken, x = `stunde` |
| Importer · Änderungen pro Tag | `select * from reports.aenderungen_pro_tag;` | Balken, x = `tag` |
| Importer · Bild-Warteschlange | `select * from reports.bild_warteschlange;` | Tabelle |
| Importer · Warnungen 24 h | `select * from reports.warnungen_24h;` | Tabelle |
| Bestand · Kennzahlen | `select * from reports.bestand_kennzahlen;` | Tabelle (1 Zeile) |
| Bestand · Objektart × Lage | `select * from reports.bestand_objektart_lage;` | Tabelle |
| Bestand · Miete je Lage | `select * from reports.miete_je_lage;` | Tabelle |
| Bestand · Flächenverteilung | `select * from reports.flaechenverteilung;` | Balken, x = `stufe` |
| Qualität · Score | `select * from reports.qualitaets_score;` | Tabelle (1 Zeile) |
| Qualität · Problemliste | `select * from reports.problemliste;` | Tabelle |
| Qualität · Ausreißer | `select * from reports.ausreisser;` | Tabelle |
| Qualität · Frische | `select * from reports.frische;` | Balken, x = `zuletzt_geprueft` |

Empfohlener Startumfang: die ersten drei, dazu Bild-Warteschlange, Score und Problemliste.

## Ändern

Neue Migration mit `create or replace view reports.<name> as …` und `npm run db:push`. Die Blöcke im Dashboard bleiben
unverändert. Ändern sich Spalten (umbenannt/entfernt), vorher `drop view reports.<name>;` – sonst lehnt Postgres das ab.

## Sicherheit

Das Schema `reports` ist nicht über die REST-API freigegeben (`supabase/config.toml`: nur `public`, `graphql_public`) und für
`anon`/`authenticated` gesperrt. Die Views laufen mit den Rechten des Owners und umgehen RLS – im Dashboard gewollt, deshalb
das Schema nie in die freigegebenen API-Schemas aufnehmen.
