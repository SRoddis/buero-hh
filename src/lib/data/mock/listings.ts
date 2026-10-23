import { PROPERTY_TYPES, type FeatureKey, type PropertyType } from "@/lib/constants";
import { formatArea, formatFloor } from "@/lib/format";
import type { Building, Contact, Listing, RentalUnit } from "@/lib/types";

import { DISTRICTS_BY_SLUG } from "./districts";
import { imagesFor } from "./images";

/** [Etage, Fläche m², Miete €/m² | null, Räume | null, verfügbar ab | null, teilbar?] */
type UnitSeed = [number, number, number | null, number | null, string | null, boolean?];

interface Seed {
  title: string;
  type: PropertyType;
  district: string;
  street: string;
  no: string;
  zip: string;
  units: UnitSeed[];
  features: FeatureKey[];
  teaser: string;
  building: { name?: string; built: number; renovated?: number; floors: number };
  daysAgo: number;
}

/** Ausstattungsmerkmale, die im Datenmodell am Gebäude hängen (nicht an der einzelnen Immobilie). */
export const BUILDING_FEATURES = new Set<FeatureKey>([
  "neubau",
  "barrierefrei",
  "stellplaetze",
  "aufzug",
  "glasfaser",
  "kantine",
  "dachterrasse",
  "empfang",
  "denkmalschutz",
  "wasserblick",
  "oepnv-nah",
  "e-ladestation",
  "rampe",
]);

export const CONTACTS: Contact[] = [
  { id: "c-1", name: "Katrin Albers", role: "Büroflächenvermietung City & HafenCity", email: "k.albers@buerohamburg.de", phone: "+49 40 300 865 10", imageUrl: null },
  { id: "c-2", name: "Jonas Petersen", role: "Büroflächenvermietung Nord & West", email: "j.petersen@buerohamburg.de", phone: "+49 40 300 865 20", imageUrl: null },
  { id: "c-3", name: "Mira Hansen", role: "Einzelhandel & Gastronomie", email: "m.hansen@buerohamburg.de", phone: "+49 40 300 865 30", imageUrl: null },
  { id: "c-4", name: "Tobias Krüger", role: "Praxis-, Lager- & Logistikflächen", email: "t.krueger@buerohamburg.de", phone: "+49 40 300 865 40", imageUrl: null },
];

const SEEDS: Seed[] = [
  { title: "Moderne Bürofläche mit Elbblick", type: "buero", district: "hafencity", street: "Am Sandtorkai", no: "54", zip: "20457", units: [[4, 520, 24.5, 12, null]], features: ["provisionsfrei", "klimatisiert", "aufzug", "wasserblick", "glasfaser", "barrierefrei"], teaser: "Lichtdurchflutete Etage mit bodentiefen Fenstern und direktem Blick auf die Elbe.", building: { name: "Sandtorkai-Haus", built: 2009, floors: 7 }, daysAgo: 2 },
  { title: "Hochwertige Büroflächen im Bahrenfeld Office", type: "buero", district: "bahrenfeld", street: "Notkestraße", no: "9", zip: "22607", units: [[2, 310, null, null, "2027-02-01", true], [3, 470, null, null, "2027-02-01", true], [4, 470, null, null, null, true]], features: ["neubau", "klimatisiert", "stellplaetze", "aufzug", "e-ladestation", "kantine"], teaser: "Flexibel teilbare Neubauflächen nach ESG-Standard im Science-City-Umfeld.", building: { name: "Bahrenfeld Office", built: 2025, floors: 6 }, daysAgo: 1 },
  { title: "Repräsentative Praxisfläche in Winterhude", type: "praxis", district: "winterhude", street: "Mühlenkamp", no: "31", zip: "22303", units: [[1, 185, 19, 6, null]], features: ["barrierefrei", "aufzug", "oepnv-nah"], teaser: "Gepflegte Praxisräume mit Empfangsbereich in beliebter Wohn- und Geschäftslage.", building: { built: 1998, renovated: 2021, floors: 5 }, daysAgo: 6 },
  { title: "Attraktive Ladenfläche in Bestlage", type: "laden", district: "eimsbuettel", street: "Osterstraße", no: "120", zip: "20255", units: [[0, 95, 28, 1, null]], features: ["provisionsfrei", "schaufenster", "abluft", "oepnv-nah"], teaser: "Ladenlokal mit großer Schaufensterfront, auch für Gastronomie geeignet.", building: { built: 1905, renovated: 2016, floors: 5 }, daysAgo: 4 },
  { title: "Büroloft im Kontorhausviertel", type: "buero", district: "altstadt", street: "Burchardstraße", no: "14", zip: "20095", units: [[5, 640, 27.5, 14, "2027-01-01"]], features: ["denkmalschutz", "aufzug", "teekueche", "glasfaser", "oepnv-nah"], teaser: "Historisches Kontorhaus mit hohen Decken, modern saniert – UNESCO-Welterbe.", building: { name: "Kontorhaus am Burchardplatz", built: 1926, renovated: 2018, floors: 8 }, daysAgo: 9 },
  { title: "Exklusive Büroetage am Neuen Wall", type: "buero", district: "neustadt", street: "Neuer Wall", no: "50", zip: "20354", units: [[3, 410, 32, 9, null, true], [4, 410, 32, 9, null, true]], features: ["klimatisiert", "aufzug", "empfang", "oepnv-nah"], teaser: "Premium-Adresse an Hamburgs Luxusmeile mit Concierge-Service.", building: { built: 1912, renovated: 2020, floors: 6 }, daysAgo: 12 },
  { title: "Flexible Büroflächen am Hauptbahnhof", type: "buero", district: "st-georg", street: "Adenauerallee", no: "10", zip: "20097", units: [[2, 230, 18.5, 7, null, true], [3, 230, 18.5, 7, null, true], [6, 480, 19.5, null, "2027-04-01"]], features: ["provisionsfrei", "aufzug", "oepnv-nah", "glasfaser"], teaser: "Bestens angebunden: wenige Gehminuten zum Hauptbahnhof und zur Alster.", building: { built: 1972, renovated: 2019, floors: 8 }, daysAgo: 15 },
  { title: "Arztpraxis an der Langen Reihe", type: "praxis", district: "st-georg", street: "Lange Reihe", no: "29", zip: "20099", units: [[1, 140, 17.5, 5, null]], features: ["aufzug", "oepnv-nah"], teaser: "Eingeführter Praxisstandort mit hoher Laufkundschaft im Szeneviertel.", building: { built: 1890, renovated: 2012, floors: 5 }, daysAgo: 20 },
  { title: "Kreativfläche mit Dachterrasse in St. Pauli", type: "buero", district: "st-pauli", street: "Budapester Straße", no: "38", zip: "20359", units: [[2, 280, 21, null, null]], features: ["provisionsfrei", "dachterrasse", "glasfaser", "teekueche"], teaser: "Offene Loftfläche für Agenturen und Start-ups – mit Gemeinschaftsdachterrasse.", building: { built: 1958, renovated: 2022, floors: 4 }, daysAgo: 3 },
  { title: "Effiziente Büroflächen am Heidenkampsweg", type: "buero", district: "hammerbrook", street: "Heidenkampsweg", no: "58", zip: "20097", units: [[3, 750, 16.5, null, null, true], [4, 750, 16.5, null, null, true], [5, 750, 16.5, null, "2027-01-01", true]], features: ["stellplaetze", "aufzug", "kantine", "klimatisiert"], teaser: "Wirtschaftliche Flächen in der City Süd, ab 250 m² teilbar.", building: { built: 1994, renovated: 2017, floors: 9 }, daysAgo: 25 },
  { title: "Neubau-Büros im Hammerbrooklyn", type: "buero", district: "hammerbrook", street: "Stadtdeich", no: "2", zip: "20097", units: [[4, 1200, null, null, "2027-05-01"]], features: ["neubau", "klimatisiert", "dachterrasse", "e-ladestation", "wasserblick"], teaser: "Smart-Building am Wasser mit nachhaltigem Energiekonzept.", building: { name: "Stadtdeich Campus", built: 2026, floors: 10 }, daysAgo: 5 },
  { title: "Lagerfläche mit Büroanteil in Billbrook", type: "lager", district: "billbrook", street: "Halskestraße", no: "22", zip: "22113", units: [[0, 1850, 6.5, null, null]], features: ["rampe", "stellplaetze"], teaser: "Ebenerdige Halle mit zwei Rampen und 180 m² Büro- und Sozialfläche.", building: { built: 1988, renovated: 2015, floors: 2 }, daysAgo: 30 },
  { title: "Moderne Logistikhalle in Rothenburgsort", type: "lager", district: "rothenburgsort", street: "Billstraße", no: "80", zip: "20539", units: [[0, 3200, 7.2, null, "2027-03-01"]], features: ["rampe", "stellplaetze", "provisionsfrei"], teaser: "10 m Hallenhöhe, sechs Andockstationen, schnelle Anbindung an die A1.", building: { built: 2019, floors: 1 }, daysAgo: 18 },
  { title: "Loftbüro in Ottensen", type: "buero", district: "ottensen", street: "Friedensallee", no: "128", zip: "22763", units: [[1, 360, 20.5, 8, null]], features: ["denkmalschutz", "glasfaser", "teekueche", "oepnv-nah"], teaser: "Industriecharme mit Backsteinwänden und Stahlträgern in umgebauter Fabrik.", building: { built: 1911, renovated: 2014, floors: 4 }, daysAgo: 8 },
  { title: "Büros mit Elbblick am Altonaer Hafen", type: "buero", district: "altona-altstadt", street: "Große Elbstraße", no: "145", zip: "22767", units: [[5, 890, 26, null, null, true], [6, 890, 26, null, null, true]], features: ["wasserblick", "klimatisiert", "aufzug", "stellplaetze", "empfang"], teaser: "Zwei Panoramaetagen direkt an der Elbe – einzeln oder zusammen anmietbar.", building: { built: 2003, floors: 7 }, daysAgo: 11 },
  { title: "Gastronomiefläche mit Terrasse in Ottensen", type: "gastro", district: "ottensen", street: "Bahrenfelder Straße", no: "201", zip: "22765", units: [[0, 160, 24, null, null]], features: ["abluft", "provisionsfrei", "schaufenster"], teaser: "Voll erschlossene Gastrofläche mit Außenterrasse in belebter Lage.", building: { built: 1898, renovated: 2010, floors: 5 }, daysAgo: 7 },
  { title: "Restaurantfläche an der Außenalster", type: "gastro", district: "uhlenhorst", street: "Schöne Aussicht", no: "20", zip: "22085", units: [[0, 240, null, null, "2027-01-15"]], features: ["abluft", "wasserblick"], teaser: "Seltene Gelegenheit: Gastronomie mit Alsterblick und Steganlage.", building: { built: 1925, renovated: 2008, floors: 3 }, daysAgo: 14 },
  { title: "Bürohaus in der City Nord", type: "buero", district: "city-nord", street: "Überseering", no: "30", zip: "22297", units: [[1, 980, 14.5, null, null, true], [2, 980, 14.5, null, null, true], [3, 980, 14.5, null, null, true]], features: ["stellplaetze", "kantine", "aufzug", "provisionsfrei", "e-ladestation"], teaser: "Großflächige Büroetagen im Grünen mit eigener Tiefgarage.", building: { built: 1974, renovated: 2021, floors: 6 }, daysAgo: 22 },
  { title: "Kompakte Büroeinheit am Kapstadtring", type: "buero", district: "city-nord", street: "Kapstadtring", no: "7", zip: "22297", units: [[4, 165, 13.5, 5, null]], features: ["provisionsfrei", "aufzug", "stellplaetze"], teaser: "Bezugsfertige Einheit mit fünf Räumen und Teeküche.", building: { built: 1978, renovated: 2016, floors: 8 }, daysAgo: 35 },
  { title: "Praxisfläche in UKE-Nähe", type: "praxis", district: "eppendorf", street: "Martinistraße", no: "44", zip: "20251", units: [[0, 220, 18, 7, null]], features: ["barrierefrei", "stellplaetze"], teaser: "Ebenerdige, barrierefreie Praxis gegenüber dem Universitätsklinikum.", building: { built: 2001, floors: 4 }, daysAgo: 10 },
  { title: "Ladenlokal am Eppendorfer Baum", type: "laden", district: "eppendorf", street: "Eppendorfer Baum", no: "12", zip: "20249", units: [[0, 120, 32, null, null]], features: ["schaufenster"], teaser: "Boutique-Fläche in einer der schönsten Einkaufsstraßen Hamburgs.", building: { built: 1903, renovated: 2011, floors: 5 }, daysAgo: 16 },
  { title: "Villa-Büros in Harvestehude", type: "buero", district: "harvestehude", street: "Harvestehuder Weg", no: "42", zip: "20149", units: [[0, 310, 23, 9, null], [1, 290, 23, 8, null]], features: ["denkmalschutz", "stellplaetze", "wasserblick"], teaser: "Stilvolle Stadtvilla an der Alster – ideal für Kanzleien und Family Offices.", building: { built: 1897, renovated: 2019, floors: 3 }, daysAgo: 27 },
  { title: "Charmantes Büro am Mittelweg", type: "buero", district: "rotherbaum", street: "Mittelweg", no: "144", zip: "20148", units: [[2, 195, 22, 6, null]], features: ["aufzug", "teekueche"], teaser: "Altbauflair mit Stuck und Parkett in exklusiver Lage.", building: { built: 1908, renovated: 2015, floors: 5 }, daysAgo: 13 },
  { title: "Büroflächen am Grindel", type: "buero", district: "rotherbaum", street: "Rothenbaumchaussee", no: "76", zip: "20148", units: [[3, 420, 20.5, 11, "2027-02-01"]], features: ["barrierefrei", "aufzug", "glasfaser"], teaser: "Wissenschaftsnaher Standort in direkter Nachbarschaft zur Universität.", building: { built: 1985, renovated: 2020, floors: 6 }, daysAgo: 19 },
  { title: "Helle Büroflächen am Stadtpark", type: "buero", district: "winterhude", street: "Jarrestraße", no: "42", zip: "22303", units: [[2, 540, 17.5, null, null]], features: ["glasfaser", "teekueche", "stellplaetze", "provisionsfrei"], teaser: "Offene Fläche im Kampnagel-Quartier, wenige Minuten zum Stadtpark.", building: { built: 1964, renovated: 2018, floors: 5 }, daysAgo: 21 },
  { title: "Gewerbeloft in ehemaliger Fabrik", type: "buero", district: "barmbek", street: "Wiesendamm", no: "26", zip: "22305", units: [[1, 390, 15.5, null, null]], features: ["denkmalschutz", "stellplaetze"], teaser: "Großzügiges Loft mit 4,5 m Deckenhöhe und Lastenaufzug.", building: { built: 1921, renovated: 2013, floors: 4 }, daysAgo: 40 },
  { title: "Ladenfläche an der Fuhlsbüttler Straße", type: "laden", district: "barmbek", street: "Fuhlsbüttler Straße", no: "110", zip: "22305", units: [[0, 180, 19, null, null]], features: ["schaufenster", "provisionsfrei"], teaser: "Frequenzstarke Einkaufsstraße mit guter Nahversorgungsstruktur.", building: { built: 1955, renovated: 2009, floors: 4 }, daysAgo: 33 },
  { title: "Büroflächen am Wandsbeker Markt", type: "buero", district: "wandsbek", street: "Wandsbeker Marktstraße", no: "73", zip: "22041", units: [[3, 260, 14, 7, null, true], [4, 260, 14, 7, null, true]], features: ["oepnv-nah", "aufzug", "provisionsfrei"], teaser: "Direkt am U-/Busknotenpunkt Wandsbek Markt – ideal für Publikumsverkehr.", building: { built: 1982, renovated: 2017, floors: 7 }, daysAgo: 24 },
  { title: "Flagship-Fläche in der Mönckebergstraße", type: "laden", district: "altstadt", street: "Mönckebergstraße", no: "21", zip: "20095", units: [[0, 450, null, null, "2027-06-01"], [1, 380, null, null, "2027-06-01"]], features: ["schaufenster", "klimatisiert", "aufzug"], teaser: "Zweigeschossige Einzelhandelsfläche in Hamburgs frequenzstärkster Lage.", building: { built: 1910, renovated: 2023, floors: 6 }, daysAgo: 6 },
  { title: "Praxisfläche im Harburger Zentrum", type: "praxis", district: "harburg", street: "Harburger Rathausstraße", no: "40", zip: "21073", units: [[2, 175, 12.5, 6, null]], features: ["barrierefrei", "aufzug", "provisionsfrei", "oepnv-nah"], teaser: "Zentral gelegene Praxisräume mit Aufzug, nahe S-Bahn Harburg Rathaus.", building: { built: 1990, renovated: 2018, floors: 5 }, daysAgo: 29 },
  { title: "Büros im Harburger Binnenhafen", type: "buero", district: "harburg", street: "Veritaskai", no: "4", zip: "21079", units: [[3, 610, 15.5, null, null]], features: ["wasserblick", "neubau", "stellplaetze", "klimatisiert"], teaser: "Moderner Neubau am Kanalplatz mit Blick über den Binnenhafen.", building: { built: 2024, floors: 7 }, daysAgo: 17 },
  { title: "Kleines Büro im Bergedorfer Zentrum", type: "buero", district: "bergedorf", street: "Alte Holstenstraße", no: "18", zip: "21031", units: [[1, 145, 11.5, 4, null]], features: ["provisionsfrei", "stellplaetze", "oepnv-nah"], teaser: "Gepflegte Bürofläche in der Fußgängerzone, nahe Bahnhof Bergedorf.", building: { built: 1979, renovated: 2014, floors: 4 }, daysAgo: 45 },
  { title: "Praxisräume am Tibarg", type: "praxis", district: "niendorf", street: "Tibarg", no: "32", zip: "22459", units: [[1, 160, 13.5, 5, null]], features: ["barrierefrei", "aufzug", "stellplaetze"], teaser: "Praxis im Ärztehaus mit Apotheke im Erdgeschoss.", building: { built: 2005, floors: 4 }, daysAgo: 38 },
  { title: "Büroflächen am Medienstandort Lokstedt", type: "buero", district: "lokstedt", street: "Grandweg", no: "64", zip: "22529", units: [[2, 720, 15, null, null]], features: ["stellplaetze", "kantine", "glasfaser"], teaser: "Etablierter Medien- und Technologiestandort mit Kantine im Haus.", building: { built: 1996, renovated: 2019, floors: 5 }, daysAgo: 26 },
  { title: "Gewerbehalle in Stellingen", type: "lager", district: "stellingen", street: "Kieler Straße", no: "333", zip: "22525", units: [[0, 950, 8.5, null, null]], features: ["rampe", "stellplaetze", "provisionsfrei"], teaser: "Vielseitig nutzbare Halle mit ebenerdigem Rolltor nahe A7.", building: { built: 1984, renovated: 2012, floors: 2 }, daysAgo: 31 },
  { title: "Nachhaltige Büros in Wilhelmsburg", type: "buero", district: "wilhelmsburg", street: "Neuenfelder Straße", no: "19", zip: "21109", units: [[2, 330, 12, null, null]], features: ["neubau", "provisionsfrei", "glasfaser", "e-ladestation"], teaser: "Holz-Hybrid-Neubau im IBA-Quartier mit günstigen Konditionen.", building: { built: 2023, floors: 5 }, daysAgo: 9 },
  { title: "Bar- und Restaurantfläche am Neuen Pferdemarkt", type: "gastro", district: "st-pauli", street: "Neuer Pferdemarkt", no: "4", zip: "20359", units: [[0, 210, 26, null, null]], features: ["abluft", "schaufenster"], teaser: "Eingeführte Gastronomielage zwischen Schanze und Reeperbahn.", building: { built: 1901, renovated: 2006, floors: 5 }, daysAgo: 12 },
  { title: "Gastronomiefläche am Überseeboulevard", type: "gastro", district: "hafencity", street: "Überseeboulevard", no: "5", zip: "20457", units: [[0, 280, 29.5, null, "2027-03-01"]], features: ["wasserblick", "abluft", "neubau"], teaser: "Erdgeschossfläche an der Flaniermeile der HafenCity mit Außenfläche.", building: { built: 2021, floors: 8 }, daysAgo: 4 },
  { title: "Neubau-Büroflächen am Baakenhafen", type: "buero", district: "hafencity", street: "Baakenallee", no: "12", zip: "20457", units: [[3, 450, null, null, "2027-09-01", true], [4, 450, null, null, "2027-09-01", true], [5, 450, null, null, "2027-09-01", true]], features: ["neubau", "klimatisiert", "wasserblick", "e-ladestation", "barrierefrei", "dachterrasse"], teaser: "Projektentwicklung mit DGNB-Platin-Zertifizierung, Fertigstellung 2027.", building: { name: "Baakenhafen Office", built: 2027, floors: 9 }, daysAgo: 2 },
  { title: "Büroflächen im Othmarschen Park", type: "buero", district: "othmarschen", street: "Behringstraße", no: "16", zip: "22763", units: [[2, 520, 16.5, null, null]], features: ["stellplaetze", "kantine", "provisionsfrei"], teaser: "Campus-Büros im Grünen mit hervorragender Anbindung an die A7.", building: { built: 2000, renovated: 2018, floors: 5 }, daysAgo: 28 },
  { title: "Praxis- oder Bürofläche in Hamm", type: "praxis", district: "hamm", street: "Hammer Landstraße", no: "91", zip: "20537", units: [[1, 130, 12, 4, null]], features: ["provisionsfrei", "oepnv-nah"], teaser: "Preiswerte Fläche mit flexiblem Grundriss, U-Bahn vor der Tür.", building: { built: 1962, renovated: 2011, floors: 5 }, daysAgo: 50 },
  { title: "Büroflächen am Alsterdorfer Markt", type: "buero", district: "alsterdorf", street: "Hindenburgstraße", no: "49", zip: "22297", units: [[2, 280, 14.5, 8, null]], features: ["stellplaetze", "barrierefrei"], teaser: "Ruhige Bürolage mit Parkplätzen direkt am Haus.", building: { built: 1993, floors: 4 }, daysAgo: 36 },
  { title: "Smart Office an den Großen Bleichen", type: "buero", district: "neustadt", street: "Große Bleichen", no: "23", zip: "20354", units: [[2, 95, 29, 3, null]], features: ["klimatisiert", "aufzug", "empfang", "provisionsfrei"], teaser: "Voll ausgestattete Kompaktfläche für kleine Teams in Top-Citylage.", building: { built: 1999, renovated: 2022, floors: 7 }, daysAgo: 1 },
  { title: "Büroetage am Ballindamm mit Alsterblick", type: "buero", district: "altstadt", street: "Ballindamm", no: "17", zip: "20095", units: [[6, 580, 30.5, 13, null]], features: ["wasserblick", "klimatisiert", "aufzug", "empfang", "denkmalschutz"], teaser: "Repräsentative Etage mit Blick auf die Binnenalster.", building: { built: 1922, renovated: 2021, floors: 7 }, daysAgo: 8 },
];

const DISTRICT_TEXT: Record<string, string> = {
  hafencity: "Die HafenCity ist Europas größtes innerstädtisches Stadtentwicklungsprojekt und verbindet moderne Architektur, Wasserlage und eine exzellente Anbindung über die U4.",
  altstadt: "Die Altstadt bildet das wirtschaftliche Herz Hamburgs – mit Rathaus, Binnenalster, Kontorhausviertel und einer hervorragenden ÖPNV-Anbindung.",
  neustadt: "Zwischen Jungfernstieg und Gänsemarkt liegen hier Hamburgs exklusivste Geschäftsadressen, Banken und Kanzleien.",
  "st-georg": "St. Georg punktet mit der Nähe zum Hauptbahnhof und zur Außenalster sowie einer lebendigen Gastronomieszene.",
  bahrenfeld: "Bahrenfeld entwickelt sich mit der Science City zu einem der spannendsten Wissenschafts- und Bürostandorte Hamburgs.",
  winterhude: "Winterhude überzeugt mit Stadtpark, Kanälen und einer hohen Aufenthaltsqualität – beliebt bei Mitarbeitenden wie Kundschaft.",
  "city-nord": "Die City Nord ist ein klassischer Bürostandort im Grünen mit großen Flächen, guter Parkplatzsituation und S-/U-Bahn-Anbindung.",
  hammerbrook: "Hammerbrook (City Süd) bietet wirtschaftliche Großflächen in Citynähe und entwickelt sich am Wasser stark weiter.",
  ottensen: "Ottensen steht für kreatives Arbeiten in umgebauten Fabriken, umgeben von Cafés, Läden und kurzen Wegen zur Elbe.",
};

/** Kleiner deterministischer Zufallsgenerator, damit Koordinaten bei jedem Build gleich bleiben. */
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const BASE_DATE = Date.UTC(2026, 9, 20, 9, 0, 0);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function contactFor(seed: Seed) {
  if (seed.type === "laden" || seed.type === "gastro") return CONTACTS[2];
  if (seed.type === "praxis" || seed.type === "lager") return CONTACTS[3];
  const district = DISTRICTS_BY_SLUG[seed.district];
  return district.locationClass === "city" ? CONTACTS[0] : CONTACTS[1];
}

function describe(seed: Seed, units: RentalUnit[], total: number) {
  const typeLabel = PROPERTY_TYPES[seed.type].plural.replace(/n$/, "");
  const district = DISTRICTS_BY_SLUG[seed.district];
  const unitText =
    units.length > 1
      ? `Insgesamt stehen ${formatArea(total)} auf ${units.length} Einheiten zur Verfügung (${units
          .map((u) => `${formatFloor(u.floor)}: ${formatArea(u.areaSqm)}`)
          .join(", ")}).`
      : `Die ${typeLabel} umfasst ${formatArea(total)} im ${formatFloor(units[0].floor)}.`;
  const buildingText = seed.building.renovated
    ? `Das ${seed.building.built} errichtete Gebäude wurde ${seed.building.renovated} umfassend modernisiert und verfügt über ${seed.building.floors} Geschosse.`
    : `Das Gebäude aus dem Jahr ${seed.building.built} verfügt über ${seed.building.floors} Geschosse.`;

  return [
    `${seed.teaser} ${unitText}`,
    buildingText,
    DISTRICT_TEXT[seed.district] ??
      `${district.name} im Bezirk ${district.borough} bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.`,
    "Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.",
  ].join("\n\n");
}

function build(seed: Seed, index: number): Listing {
  const district = DISTRICTS_BY_SLUG[seed.district];
  const id = `bh-${1001 + index}`;
  const lng = district.center[0] + (seeded(index + 1) - 0.5) * 0.008;
  const lat = district.center[1] + (seeded(index + 101) - 0.5) * 0.005;

  const units: RentalUnit[] = seed.units.map(([floor, area, rent, rooms, available, divisible], i) => ({
    id: `${id}-u${i + 1}`,
    label: seed.units.length > 1 ? `Einheit ${String.fromCharCode(65 + i)}` : "Gesamtfläche",
    floor,
    areaSqm: area,
    rentPerSqm: rent,
    serviceChargePerSqm: rent != null ? Math.round(rent * 0.18 * 2) / 2 : null,
    availableFrom: available,
    rooms,
    divisible: divisible ?? false,
  }));

  const areas = units.map((u) => u.areaSqm);
  const rents = units.map((u) => u.rentPerSqm).filter((r): r is number => r != null);
  const total = areas.reduce((a, b) => a + b, 0);
  const floors = units.map((u) => u.floor);
  const availability = units.map((u) => u.availableFrom);
  const immediately = availability.some((a) => a == null);

  const features = new Set<FeatureKey>(seed.features);
  if (immediately) features.add("sofort-verfuegbar");
  if (units.some((u) => u.divisible)) features.add("teilbar");

  const building: Building = {
    id: `${id}-b`,
    name: seed.building.name ?? null,
    street: seed.street,
    houseNumber: seed.no,
    postalCode: seed.zip,
    city: "Hamburg",
    districtSlug: district.slug,
    districtName: district.name,
    lat,
    lng,
    locationClass: district.locationClass,
    yearBuilt: seed.building.built,
    yearRenovated: seed.building.renovated ?? null,
    floors: seed.building.floors,
    features: seed.features.filter((f) => BUILDING_FEATURES.has(f)),
  };

  const images = imagesFor(seed.type, index).map((url, i) => ({
    id: `${id}-i${i + 1}`,
    url,
    alt: `${seed.title} – Bild ${i + 1}`,
  }));

  return {
    id,
    slug: `${slugify(seed.title)}-${id}`,
    title: seed.title,
    teaser: seed.teaser,
    description: describe(seed, units, total),
    category: PROPERTY_TYPES[seed.type].category,
    type: seed.type,
    districtSlug: district.slug,
    districtName: district.name,
    address: `${seed.street} ${seed.no}, ${seed.zip} Hamburg`,
    lat,
    lng,
    locationClass: district.locationClass,
    areaMin: Math.min(...areas),
    areaMax: total,
    rentMin: rents.length ? Math.min(...rents) : null,
    rentMax: rents.length ? Math.max(...rents) : null,
    rooms: units.every((u) => u.rooms != null) ? units.reduce((a, u) => a + (u.rooms ?? 0), 0) : null,
    floorMin: Math.min(...floors),
    floorMax: Math.max(...floors),
    unitCount: units.length,
    availableFrom: immediately ? null : availability.filter(Boolean).sort()[0]!,
    features: [...features],
    commissionFree: features.has("provisionsfrei"),
    images,
    publishedAt: new Date(BASE_DATE - seed.daysAgo * 86_400_000).toISOString(),
    building,
    units,
    contact: contactFor(seed),
  };
}

export const MOCK_LISTINGS: Listing[] = SEEDS.map(build);
