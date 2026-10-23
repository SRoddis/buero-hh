import type { District } from "@/lib/types";

/** Hamburger Stadtteile mit ungefährem Mittelpunkt [lng, lat] und Büromarkt-Lage. */
export const DISTRICTS: District[] = [
  { slug: "altstadt", name: "Altstadt", borough: "Hamburg-Mitte", center: [10.0006, 53.5503], locationClass: "city" },
  { slug: "neustadt", name: "Neustadt", borough: "Hamburg-Mitte", center: [9.9837, 53.5517], locationClass: "city" },
  { slug: "hafencity", name: "HafenCity", borough: "Hamburg-Mitte", center: [9.9965, 53.5418], locationClass: "city" },
  { slug: "st-georg", name: "St. Georg", borough: "Hamburg-Mitte", center: [10.0128, 53.5556], locationClass: "city" },
  { slug: "st-pauli", name: "St. Pauli", borough: "Hamburg-Mitte", center: [9.9640, 53.5560], locationClass: "citynah" },
  { slug: "hammerbrook", name: "Hammerbrook", borough: "Hamburg-Mitte", center: [10.0300, 53.5475], locationClass: "citynah" },
  { slug: "hamm", name: "Hamm", borough: "Hamburg-Mitte", center: [10.0550, 53.5545], locationClass: "peripherie" },
  { slug: "rothenburgsort", name: "Rothenburgsort", borough: "Hamburg-Mitte", center: [10.0420, 53.5370], locationClass: "peripherie" },
  { slug: "billbrook", name: "Billbrook", borough: "Hamburg-Mitte", center: [10.0890, 53.5310], locationClass: "peripherie" },
  { slug: "altona-altstadt", name: "Altona-Altstadt", borough: "Altona", center: [9.9370, 53.5495], locationClass: "citynah" },
  { slug: "ottensen", name: "Ottensen", borough: "Altona", center: [9.9260, 53.5540], locationClass: "citynah" },
  { slug: "bahrenfeld", name: "Bahrenfeld", borough: "Altona", center: [9.9050, 53.5650], locationClass: "buerozentrum" },
  { slug: "othmarschen", name: "Othmarschen", borough: "Altona", center: [9.8960, 53.5540], locationClass: "peripherie" },
  { slug: "eimsbuettel", name: "Eimsbüttel", borough: "Eimsbüttel", center: [9.9550, 53.5745], locationClass: "citynah" },
  { slug: "rotherbaum", name: "Rotherbaum", borough: "Eimsbüttel", center: [9.9880, 53.5680], locationClass: "citynah" },
  { slug: "harvestehude", name: "Harvestehude", borough: "Eimsbüttel", center: [9.9850, 53.5800], locationClass: "citynah" },
  { slug: "stellingen", name: "Stellingen", borough: "Eimsbüttel", center: [9.9300, 53.5900], locationClass: "peripherie" },
  { slug: "lokstedt", name: "Lokstedt", borough: "Eimsbüttel", center: [9.9500, 53.6000], locationClass: "peripherie" },
  { slug: "niendorf", name: "Niendorf", borough: "Eimsbüttel", center: [9.9500, 53.6170], locationClass: "peripherie" },
  { slug: "eppendorf", name: "Eppendorf", borough: "Hamburg-Nord", center: [9.9830, 53.5920], locationClass: "citynah" },
  { slug: "winterhude", name: "Winterhude", borough: "Hamburg-Nord", center: [10.0050, 53.5900], locationClass: "citynah" },
  { slug: "city-nord", name: "City Nord", borough: "Hamburg-Nord", center: [10.0230, 53.6040], locationClass: "buerozentrum" },
  { slug: "uhlenhorst", name: "Uhlenhorst", borough: "Hamburg-Nord", center: [10.0190, 53.5700], locationClass: "citynah" },
  { slug: "barmbek", name: "Barmbek", borough: "Hamburg-Nord", center: [10.0430, 53.5850], locationClass: "peripherie" },
  { slug: "alsterdorf", name: "Alsterdorf", borough: "Hamburg-Nord", center: [10.0080, 53.6110], locationClass: "peripherie" },
  { slug: "wandsbek", name: "Wandsbek", borough: "Wandsbek", center: [10.0760, 53.5720], locationClass: "peripherie" },
  { slug: "harburg", name: "Harburg", borough: "Harburg", center: [9.9840, 53.4600], locationClass: "peripherie" },
  { slug: "wilhelmsburg", name: "Wilhelmsburg", borough: "Hamburg-Mitte", center: [10.0090, 53.4930], locationClass: "peripherie" },
  { slug: "bergedorf", name: "Bergedorf", borough: "Bergedorf", center: [10.2140, 53.4890], locationClass: "peripherie" },
];

export const DISTRICTS_BY_SLUG = Object.fromEntries(DISTRICTS.map((d) => [d.slug, d])) as Record<
  string,
  District
>;
