# Karte

← [Projektkontext](../context.md)

Drei Karten nutzen MapLibre GL mit dem OpenFreeMap-Stil „Positron“ (ohne API-Key; überschreibbar mit
`NEXT_PUBLIC_MAP_STYLE_URL`).

## Suchkarte

- **Cluster** mit Anzahl; Farbe je Objektart (`CATEGORY_COLORS`: Büro & Praxis weinrot, Laden grau, Halle & Lager gold).
- **Preis-Labels** ab Zoom 15 statt Punkten (Symbol-Layer `price-labels`, dehnbare Canvas-Bilder je Kategorie).
- **Hover** auf einer Listenkarte hebt den Marker hervor, **Klick** auf einen Marker öffnet die Objektvorschau (Popup im
  Stil der Listenkarten) und markiert die Karte in der Liste.
- **„Beim Verschieben der Karte suchen“** filtert per PostGIS-Bounding-Box.
- **Laden:** Einblenden erst beim ersten `idle`, mit Logo-Loader („Karte wird geladen“) – kein Flackern.
- **Quellenhinweis** bleibt eingeklappt (ⓘ), MapLibre klappt ihn sonst beim Laden auf.

## Vergleichskarte

- Buchstaben-Pins A/B/C; der Ausschnitt passt sich an alle Objekte an und wird bei Größenänderungen des Kartenfelds neu
  eingepasst, bis der Nutzer selbst verschiebt oder zoomt. Rechts etwas mehr Abstand wegen der Zoom-Buttons.

## Lagekarte (Detailseite, Startseite „Anfahrt“)

- Einzelner Pin, Zoom konfigurierbar.

## Wichtige Dateien

- [listings-map.tsx](../../src/components/map/listings-map.tsx), [map-style.ts](../../src/components/map/map-style.ts), [map-popup-card.tsx](../../src/components/map/map-popup-card.tsx), [map-loading.tsx](../../src/components/map/map-loading.tsx)
- [compare-map.tsx](../../src/components/map/compare-map.tsx), [location-map.tsx](../../src/components/map/location-map.tsx)
- [attribution.ts](../../src/components/map/attribution.ts)
- Die Karten werden lazy geladen (`*-lazy.tsx`), der MapLibre-Worker liegt unter `public/vendor/` (Skript `copy-maplibre-worker.mjs`).

## Datenschutz

OpenFreeMap setzt keine Cookies, erhält aber die IP-Adresse (Abschnitt 5 der Datenschutzerklärung). Die Karte lädt daher
ohne Einwilligung – anders als Google Maps auf der alten Seite.
