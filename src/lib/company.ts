/** Firmendaten für Impressum, Kontakt und Anfahrt – übernommen von der bisherigen Website buerohamburg.de */
export const COMPANY = {
  name: "BHI Büro Hamburg Immobilien Beratung und Entwicklung GmbH",
  street: "Hohe Bleichen 21",
  postalCode: "20354",
  city: "Hamburg",
  country: "Deutschland",
  phone: { display: "040 22 62 11-00", href: "tel:+494022621100" },
  fax: { display: "040 22 62 11-011" },
  email: "kontakt@buerohamburg.de",
  website: "www.buerohamburg.de",
  managingDirector: "Ulf von der Heydt",
  register: { court: "Amtsgericht Hamburg", number: "HRB 133592" },
  /** Zuständige Behörde für die Erlaubnis nach § 34c der Gewerbeordnung */
  supervisoryAuthority:
    "Freie und Hansestadt Hamburg, Bezirksamt Hamburg-Nord, Wirtschafts- und Ordnungsamt, Grindelberg 66, 20139 Hamburg",
  /** Anfahrt mit öffentlichen Verkehrsmitteln */
  transit: "U2 Gänsemarkt, U- und S-Bahnhof Jungfernstieg, Buslinien 4/5/109 Bushaltestelle Gänsemarkt",
  /** Bankverbindung und Steuernummer für die Fußzeile der PDFs – aus dem bisherigen Vergleichs-PDF von buerohamburg.de */
  bank: { name: "Commerzbank Hamburg", bic: "COBADEFF-XXX", iban: "DE 3520 0400 0008 2159 0700" },
  taxNumber: "48 707 01956",
  /** Hohe Bleichen 21 (OpenStreetMap) */
  location: { lat: 53.5539837, lng: 9.9871516 },
} as const;

export const COMPANY_ADDRESS = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

/** Geschäftsbedingungen für Angebote (Fußzeile der PDFs) – wörtlich aus dem bisherigen Vergleichs-PDF */
export const OFFER_TERMS =
  "Unsere Angebote und Mitteilungen sind ausschließlich für den Empfänger bestimmt. Bei Weitergabe – auch auszugsweise – an Dritte ohne unsere Zustimmung haftet der Weitergebende für die volle Courtage, wenn ein Vertrag zustande kommt. Die Angebote basieren auf Angaben Dritter (Eigentümer, Behörden etc.) und sind freibleibend. Für die Richtigkeit und Vollständigkeit können wir keine Haftung übernehmen. Wird von unserem Angebot Gebrauch gemacht, kommt ein Maklervertrag zustande. Wir sind berechtigt, auch für den anderen Vertragsteil als Makler tätig zu sein. Die Courtage ist mit Vertragsabschluss verdient und fällig. Sie ist allein vom Käufer/ Mieter an uns zu zahlen. Gerichtsstand für Vollkaufleute ist Hamburg.";
