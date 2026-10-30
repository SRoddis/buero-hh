# Merkliste

← [Projektkontext](../context.md)

Route: `/merkliste`

## Verhalten

- Herz-Button auf Listenkarten, Popups und der Detailseite; Zähler im Header.
- Ohne Login: gespeichert im **Local Storage** des Browsers (nur Objekt-IDs). Nichts geht an den Server – deshalb keine
  Einwilligung nötig (Datenschutzerklärung 2.2).
- Im [Vergleich](objektvergleich.md) gibt es „Alle merken“. Umgekehrt (von der Merkliste in den Vergleich) gibt es noch
  keinen direkten Weg.

## Wichtige Dateien

- [favorites-provider.tsx](../../src/components/favorites/favorites-provider.tsx), [favorite-button.tsx](../../src/components/favorites/favorite-button.tsx), [merkliste-view.tsx](../../src/components/favorites/merkliste-view.tsx)
- [page.tsx](../../src/app/merkliste/page.tsx)

## Unterschied zur alten Website

Dort lag die Merkliste auf dem Server (Sitzung, Teilen-Link per API, Kategorie „Funktional“ im Cookie-Hinweis). Bei uns
bleibt sie im Browser.
