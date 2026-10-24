/** HTTP-Hilfen für buerohamburg.de – deren Backend liefert unter Last sporadisch 404 für vorhandene Objekte. */

const USER_AGENT = "BueroHamburg-Sync/1.0 (+https://buero-hh.onrender.com)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchJson<T>(url: string, attempts = 4): Promise<T | null> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
      if (res.ok) return (await res.json()) as T;
      if (![404, 429, 500, 502, 503, 504].includes(res.status)) return null;
    } catch {
      // Netzwerkfehler → erneut versuchen
    }
    if (attempt < attempts) await sleep(800 * attempt);
  }
  return null;
}

export async function head(url: string): Promise<Response | null> {
  try {
    return await fetch(url, { method: "HEAD", headers: { "User-Agent": USER_AGENT } });
  } catch {
    return null;
  }
}

export async function download(url: string): Promise<Response> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Download fehlgeschlagen (${res.status}): ${url}`);
  return res;
}

/** Prüfsumme einer Bilddatei aus den Antwort-Headern (ETag, sonst Datum + Größe) */
export function checksumOf(headers: Headers): string {
  return headers.get("etag") ?? `${headers.get("last-modified") ?? ""}|${headers.get("content-length") ?? ""}`;
}

/** Führt fn für alle Elemente mit begrenzter Parallelität aus */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}
