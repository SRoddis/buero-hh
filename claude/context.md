# Projektkontext – BüroHamburg.de

Einstieg für alle, die am Projekt weiterarbeiten (Menschen wie KI-Assistenten). Technische Details zu Setup, Datenmodell und
der API von buerohamburg.de stehen in der [README](../README.md); hier geht es um das „Was und Warum“.

> **Lebendes Dokument:** Diese Datei und die Feature-Dateien unter [features/](features/) werden mit jeder Änderung
> fortgeschrieben – neue Features bekommen eine eigene Datei und einen Eintrag in der Tabelle unten. Wie genau, steht in
> der [CLAUDE.md](../CLAUDE.md).

## Worum es geht

Neue Website für **BHI Büro Hamburg Immobilien Beratung und Entwicklung GmbH** (BüroHamburg.de), einen Makler für
Gewerbeimmobilien in Hamburg. Sie ersetzt die bisherige Website www.buerohamburg.de (Nuxt, Daten aus FileMaker).
Kern ist eine Immobiliensuche im Stil von ImmoScout: Filter, Trefferliste, Karte, Detailseiten, Vergleich.

**Leitlinie:** möglichst unabhängig von der alten Website werden – sie wird abgeschaltet. Wo wir ihre API noch nutzen
(Objektdaten-Sync, Mietgesuche, Suchauftrag), ist das in den Feature-Dokumenten markiert.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions), TypeScript, React 19
- **Tailwind CSS 4** + shadcn/ui (Radix), lucide-Icons, Schrift Inter (über `next/font`, selbst gehostet)
- **Supabase**: Postgres + PostGIS, Materialized View für die Suche, Storage für Bilder, Edge Function für den Sync (pg_cron)
- **MapLibre GL** mit Kartenkacheln von OpenFreeMap
- **@react-pdf/renderer** + sharp für das Vergleichs-PDF
- Hosting: **Render** (Next.js), **Supabase** (Daten)

## Architektur in einem Satz

Die Edge Function gleicht den Objektbestand von buerohamburg.de minütlich nach Supabase ab; Next.js liest ausschließlich aus
Supabase und rendert serverseitig. Ist Supabase nicht erreichbar, erscheint eine Störungsseite – **nie Testdaten**.
Diagramm: [README → Architektur](../README.md#architektur).

## Features

| Feature | Kurzbeschreibung |
| --- | --- |
| [Immobiliensuche](features/immobiliensuche.md) | Filter, Trefferliste, Ansichten Liste · Liste/Karte · Karte, Pagination |
| [Karte](features/karte.md) | MapLibre-Karte mit Clustern, Preis-Labels und Farben je Objektart |
| [Objekt-Detailseite](features/detailseite.md) | URL per Objektnummer, Galerie, Eckdaten, Lagekarte, Anfrageformular |
| [Merkliste](features/merkliste.md) | Objekte merken ohne Login (im Browser) |
| [Objektvergleich](features/objektvergleich.md) | bis zu 3 Objekte vergleichen, teilen, als PDF drucken |
| [Suchauftrag](features/suchauftrag.md) | Formular-Fenster, Weiterleitung an die Suchauftrag-API |
| [Für Vermieter](features/fuer-vermieter.md) | aktuelle Mietgesuche mit Filtern |
| [Inhaltsseiten & Rechtstexte](features/inhaltsseiten.md) | Startseite, Über uns, Impressum, Datenschutz, AGB |
| [Cookie-Einstellungen](features/cookie-einstellungen.md) | Cookie-Hinweis wie auf der alten Seite, SalesViewer nur mit Einwilligung |
| [Datensync](features/datensync.md) | Abgleich buerohamburg.de → Supabase (Objekte, Bilder) |
| [Fehler- & Störungsseiten](features/fehlerseiten.md) | 404, Störungsseite, Fehlerbehandlung |
| [Monitoring](features/monitoring.md) | Supabase-Report zu Import, Bestand und Datenqualität |

## Arbeitsregeln

- **Keine Schreib-Endpunkte der alten Website auslösen** (`/api/suchauftrag`, Merkliste, Teilen …) – sie verschicken
  echte E-Mails oder ändern Produktivdaten. Lesende Abrufe sind in Ordnung, aber schonend (max. 2–3 parallel).
- **Keine Geheimnisse in Chat oder Repo:** `service_role`-Key und DB-Passwort nie anzeigen oder erfragen; `.env.local` wird
  nicht committet.
- **Kein zweiter `next dev`-Server** – den laufenden auf :3000 nutzen, ein zweiter zerschießt `.next`.
- **Keine Mock-Daten** als Rückfall: lieber Störungsseite als veraltete Angebote.
- **Sprache:** UI-Texte und Code-Kommentare auf Deutsch; Kommentare erklären das „Warum“.
- Vor dem Abschluss: `npm run typecheck` und `npm run lint`; UI-Änderungen im Browser prüfen.

## Offene Punkte vor dem Go-live

Gepflegt in der [README → Vor dem Go-live](../README.md#vor-dem-go-live). Die wichtigsten: Objektanfragen benachrichtigen
niemanden, Datenschutzerklärung freigeben, Auftragsverarbeitungsverträge, SalesViewer klären.
