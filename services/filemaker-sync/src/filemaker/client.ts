import type { FmRecord } from "./types";

interface FmResponse<T> {
  messages: { code: string; message: string }[];
  response: { token?: string; data?: FmRecord<T>[]; dataInfo?: { foundCount: number } };
}

/** FileMaker-Fehlercodes, die fachlich kein Fehler sind */
const NO_RECORDS_FOUND = "401";
const INVALID_TOKEN = "952";

/**
 * Minimaler Client für die FileMaker Data API (vLatest).
 * Doku: https://help.claris.com/en/data-api-guide/
 */
export class FileMakerClient {
  private token: string | null = null;

  constructor(
    private readonly host: string,
    private readonly database: string,
    private readonly user: string,
    private readonly password: string,
  ) {}

  private get baseUrl() {
    return `${this.host}/fmi/data/vLatest/databases/${encodeURIComponent(this.database)}`;
  }

  async login() {
    const res = await fetch(`${this.baseUrl}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${this.user}:${this.password}`).toString("base64")}`,
      },
      body: "{}",
    });
    const body = (await res.json()) as FmResponse<never>;
    if (!res.ok || !body.response.token) throw new Error(`FileMaker-Login fehlgeschlagen: ${body.messages[0]?.message}`);
    this.token = body.response.token;
  }

  async logout() {
    if (!this.token) return;
    await fetch(`${this.baseUrl}/sessions/${this.token}`, { method: "DELETE" }).catch(() => {});
    this.token = null;
  }

  private async request<T>(path: string, init: RequestInit, retry = true): Promise<FmResponse<T>> {
    if (!this.token) await this.login();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}`, ...init.headers },
    });
    const body = (await res.json()) as FmResponse<T>;
    const code = body.messages[0]?.code;

    if (code === INVALID_TOKEN && retry) {
      this.token = null;
      return this.request(path, init, false);
    }
    if (code === NO_RECORDS_FOUND) return { ...body, response: { data: [] } };
    if (code !== "0") throw new Error(`FileMaker-Fehler ${code}: ${body.messages[0]?.message} (${path})`);
    return body;
  }

  /**
   * Findet alle Datensätze eines Layouts, optional nur die seit `modifiedSince` geänderten.
   * Paginierung erfolgt automatisch.
   */
  async findAll<T>(layout: string, options: { modifiedSince?: Date | null; pageSize: number }): Promise<FmRecord<T>[]> {
    const query = options.modifiedSince
      ? [{ Geaendert_am: `>=${toFmTimestamp(options.modifiedSince)}` }]
      : [{ ID: "*" }];
    const records: FmRecord<T>[] = [];

    for (let offset = 1; ; offset += options.pageSize) {
      const body = await this.request<T>(`/layouts/${encodeURIComponent(layout)}/_find`, {
        method: "POST",
        body: JSON.stringify({ query, offset, limit: options.pageSize, sort: [{ fieldName: "ID", sortOrder: "ascend" }] }),
      });
      const page = body.response.data ?? [];
      records.push(...page);
      if (page.length < options.pageSize) return records;
    }
  }

  async create(layout: string, fieldData: Record<string, unknown>): Promise<string> {
    const body = await this.request<never>(`/layouts/${encodeURIComponent(layout)}/records`, {
      method: "POST",
      body: JSON.stringify({ fieldData }),
    });
    return (body.response as { recordId?: string }).recordId ?? "";
  }

  /** Lädt den Inhalt eines Container-Felds (die URL ist nur kurz gültig). */
  async downloadContainer(url: string): Promise<{ data: ArrayBuffer; contentType: string }> {
    const res = await fetch(url, { headers: this.token ? { Authorization: `Bearer ${this.token}` } : {} });
    if (!res.ok) throw new Error(`Container-Download fehlgeschlagen (${res.status})`);
    return { data: await res.arrayBuffer(), contentType: res.headers.get("content-type") ?? "image/jpeg" };
  }
}

function toFmTimestamp(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(date.getMonth() + 1)}/${p(date.getDate())}/${date.getFullYear()} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

/** "MM/DD/YYYY HH:MM:SS" → Date (lokale Serverzeit des FileMaker-Servers) */
export function parseFmTimestamp(value: string | undefined): Date | null {
  const m = value?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?: (\d{1,2}):(\d{2}):(\d{2}))?$/);
  if (!m) return null;
  const [, month, day, year, h = "0", min = "0", s = "0"] = m;
  return new Date(+year, +month - 1, +day, +h, +min, +s);
}
