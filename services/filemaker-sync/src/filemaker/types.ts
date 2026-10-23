/**
 * Erwartete Feldstruktur der FileMaker-API-Layouts.
 * Die Feldnamen sind Annahmen und müssen mit der realen FileMaker-Lösung abgeglichen werden –
 * Anpassungen sind nur hier und in mapping.ts nötig.
 */

export interface FmRecord<T> {
  recordId: string;
  modId: string;
  fieldData: T;
}

/** Zeitstempel im FileMaker-Format "MM/DD/YYYY HH:MM:SS" */
type FmTimestamp = string;

export interface FmContact {
  ID: string;
  Name: string;
  Funktion: string;
  EMail: string;
  Telefon: string;
  Geaendert_am: FmTimestamp;
}

export interface FmBuilding {
  ID: string;
  Bezeichnung: string;
  Strasse: string;
  Hausnummer: string;
  PLZ: string;
  Ort: string;
  Stadtteil: string;
  Breitengrad: number | string;
  Laengengrad: number | string;
  Lage: string;
  Baujahr: number | string;
  Modernisiert: number | string;
  Geschosse: number | string;
  /** Werteliste als Zeilenumbruch-getrennter Text, z. B. "Aufzug\rTiefgarage" */
  Merkmale: string;
  Geaendert_am: FmTimestamp;
}

export interface FmProperty {
  ID: string;
  Gebaeude_ID: string;
  Ansprechpartner_ID: string;
  Objektnummer: string;
  Titel: string;
  Kurzbeschreibung: string;
  Beschreibung: string;
  Nutzungsart: string;
  Status: string;
  Provisionsfrei: number | string;
  Merkmale: string;
  Veroeffentlicht_am: FmTimestamp;
  Geaendert_am: FmTimestamp;
}

export interface FmUnit {
  ID: string;
  Objekt_ID: string;
  Bezeichnung: string;
  Etage: number | string;
  Flaeche_qm: number | string;
  Miete_qm: number | string;
  NK_qm: number | string;
  Verfuegbar_ab: string;
  Raeume: number | string;
  Teilbar: number | string;
  Sortierung: number | string;
  Geaendert_am: FmTimestamp;
}

export interface FmImage {
  ID: string;
  Objekt_ID: string;
  /** Container-Feld: die Data API liefert eine temporäre Download-URL */
  Bild: string;
  Dateiname: string;
  Beschreibung: string;
  Sortierung: number | string;
  Geaendert_am: FmTimestamp;
}
