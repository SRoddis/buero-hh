/**
 * Rücksprung vom Objektvergleich in die Suche: Beim Wechsel zum Vergleich merken wir uns die Such-URL
 * (alle Filter) und die Scrollpositionen; die Suche stellt sie beim nächsten Aufruf derselben URL wieder her.
 */

const STORAGE_KEY = "bh:suche-zurueck";
/** Ältere Einträge ignorieren – sonst springt die Suche Stunden später unerwartet an eine alte Stelle */
const MAX_AGE_MS = 30 * 60_000;

interface SearchPosition {
  href: string;
  windowY: number;
  /** Desktop: eigene Scrollspalte der Trefferliste */
  listY: number;
  savedAt: number;
}

export const SEARCH_LIST_SELECTOR = '[aria-label="Suchergebnisse"]';

const currentHref = () => window.location.pathname + window.location.search;

function read(): SearchPosition | null {
  try {
    const entry = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as SearchPosition | null;
    return entry && Date.now() - entry.savedAt < MAX_AGE_MS ? entry : null;
  } catch {
    return null;
  }
}

export function rememberSearchPosition() {
  const entry: SearchPosition = {
    href: currentHref(),
    windowY: window.scrollY,
    listY: document.querySelector(SEARCH_LIST_SELECTOR)?.scrollTop ?? 0,
    savedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Speicher blockiert – Rücksprung führt dann zur Suche ohne Position
  }
}

/** Link-Ziel für „Zurück zur Suche“ (mit Filtern), sonst die Suche ohne Filter */
export const searchReturnHref = () => read()?.href ?? "/immobilien";

/** Stellt die gemerkte Position wieder her, falls sie zur aktuellen Such-URL gehört (einmalig). */
export function restoreSearchPosition() {
  const entry = read();
  if (!entry || entry.href !== currentHref()) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorieren
  }
  const apply = () => {
    window.scrollTo({ top: entry.windowY });
    const list = document.querySelector(SEARCH_LIST_SELECTOR);
    if (list) list.scrollTop = entry.listY;
  };
  // nach dem Rendern und nochmals kurz danach (Next setzt die Scrollposition bei der Navigation zurück)
  requestAnimationFrame(apply);
  setTimeout(apply, 120);
}
