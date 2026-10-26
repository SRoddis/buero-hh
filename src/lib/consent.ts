/**
 * Cookie-Zustimmung – gleiches Cookie wie auf der bisherigen Website (Format von vanilla-cookieconsent v3),
 * damit bestehende Entscheidungen nach dem Umzug auf derselben Domain gültig bleiben.
 */

export const CONSENT_COOKIE = "cc_cookie";
/** Erhöhen, wenn sich Kategorien oder Dienste ändern – dann wird erneut gefragt */
export const CONSENT_REVISION = 1;
/** Laufzeit wie bisher: 182 Tage */
export const CONSENT_MAX_AGE_DAYS = 182;

export const OPTIONAL_CATEGORIES = ["functionality", "marketing"] as const;
export type OptionalCategory = (typeof OPTIONAL_CATEGORIES)[number];
export type ConsentCategory = "necessary" | OptionalCategory;

export type ConsentRecord = {
  categories: ConsentCategory[];
  revision: number;
  data: null;
  consentTimestamp: string;
  consentId: string;
  services: Record<ConsentCategory, string[]>;
  lastConsentTimestamp: string;
  expirationTime: number;
};

const isValid = (value: unknown): value is ConsentRecord =>
  !!value &&
  typeof value === "object" &&
  Array.isArray((value as ConsentRecord).categories) &&
  (value as ConsentRecord).revision === CONSENT_REVISION;

/** Gültige Zustimmung aus document.cookie lesen (null = noch nicht entschieden) */
export function readConsent(cookieString: string): ConsentRecord | null {
  for (const part of cookieString.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name !== CONSENT_COOKIE || !rest.length) continue;
    try {
      const value: unknown = JSON.parse(decodeURIComponent(rest.join("=")));
      if (isValid(value)) return value;
    } catch {
      // kaputtes Cookie ignorieren – dann wird neu gefragt
    }
  }
  return null;
}

/** Zustimmung speichern; Einwilligungs-ID und erster Zeitpunkt bleiben bei Änderungen erhalten */
export function writeConsent(categories: OptionalCategory[], previous: ConsentRecord | null): ConsentRecord {
  const now = new Date().toISOString();
  const record: ConsentRecord = {
    categories: ["necessary", ...OPTIONAL_CATEGORIES.filter((c) => categories.includes(c))],
    revision: CONSENT_REVISION,
    data: null,
    consentTimestamp: previous?.consentTimestamp ?? now,
    consentId: previous?.consentId ?? crypto.randomUUID(),
    services: { necessary: [], functionality: [], marketing: [] },
    lastConsentTimestamp: now,
    expirationTime: Date.now() + CONSENT_MAX_AGE_DAYS * 86400 * 1000,
  };

  // Alte Kopien (z. B. mit domain=.buerohamburg.de von der bisherigen Website) entfernen, sonst gewinnt evtl. die alte
  const host = window.location.hostname;
  for (const domain of new Set([host, host.replace(/^www\./, ""), `.${host}`, `.${host.replace(/^www\./, "")}`])) {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; path=/; domain=${domain}`;
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(record))}; Max-Age=${
    CONSENT_MAX_AGE_DAYS * 86400
  }; path=/; SameSite=Lax${secure}`;
  return record;
}
