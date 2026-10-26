/** Detailseite über die FileMaker-Objektnummer – stabil, auch wenn sich der Titel ändert */
export const listingHref = (listing: { referenceNumber: string }) =>
  `/immobilien/${encodeURIComponent(listing.referenceNumber)}`;

/** Objektnummern sind rein numerisch (z. B. „097“, „25702“) */
export const REFERENCE_NUMBER = /^\d+$/;
