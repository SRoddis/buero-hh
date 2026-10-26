"use server";

import { z } from "zod";

import {
  areaNumber,
  REQUEST_AREAS,
  REQUEST_CRITERIA,
  REQUEST_MARKET_AREAS,
  REQUEST_OBJECT_TYPES,
  REQUEST_RENTS,
} from "@/lib/search-request";

const API_URL = "https://www.buerohamburg.de/api/suchauftrag";

const OBJECT_TYPE_VALUES = REQUEST_OBJECT_TYPES.map((o) => o.value) as [string, ...string[]];

const schema = z
  .object({
    name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(120),
    email: z.email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
    telefon: z
      .string()
      .trim()
      .min(5, "Bitte geben Sie Ihre Telefonnummer an.")
      .regex(/^[+\d\s()/-]+$/, "Bitte geben Sie eine gültige Telefonnummer an."),
    objektart: z.array(z.enum(OBJECT_TYPE_VALUES)).min(1, "Bitte wählen Sie mindestens eine Objektart."),
    lage: z.array(z.enum(REQUEST_MARKET_AREAS)).min(1, "Bitte wählen Sie mindestens eine Lage."),
    mietflaeche_von: z.enum(REQUEST_AREAS).optional(),
    mietflaeche_bis: z.enum(REQUEST_AREAS).optional(),
    mietpreis_von: z.enum(REQUEST_RENTS as [string, ...string[]]).optional(),
    mietpreis_bis: z.enum(REQUEST_RENTS as [string, ...string[]]).optional(),
    kriterien: z.array(z.enum(REQUEST_CRITERIA)),
    kommentar: z.string().trim().max(2000, "Der Kommentar darf höchstens 2.000 Zeichen lang sein.").optional(),
  })
  .refine((d) => !d.mietflaeche_von || !d.mietflaeche_bis || areaNumber(d.mietflaeche_von) <= areaNumber(d.mietflaeche_bis), {
    path: ["mietflaeche_bis"],
    message: "„bis“ muss größer als „von“ sein.",
  })
  .refine((d) => !d.mietpreis_von || !d.mietpreis_bis || Number(d.mietpreis_von) <= Number(d.mietpreis_bis), {
    path: ["mietpreis_bis"],
    message: "„bis“ muss größer als „von“ sein.",
  });

export type SearchRequestState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<string, string>>;
    };

/**
 * Suchauftrag an BüroHamburg weiterleiten. Die API verschickt E-Mails – lokal (npm run dev) wird daher
 * nur geprüft und protokolliert; weitergeleitet wird im Produktivbetrieb oder mit SUCHAUFTRAG_WEITERLEITEN=1.
 */
export async function submitSearchRequest(_prev: SearchRequestState, formData: FormData): Promise<SearchRequestState> {
  const website = String(formData.get("website") ?? "");
  // Honeypot: Bots füllen das versteckte Feld aus – scheinbar erfolgreich, aber nichts senden
  if (website) return { status: "success" };

  const text = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return value === "" ? undefined : value;
  };
  const parsed = schema.safeParse({
    name: text("name") ?? "",
    email: text("email") ?? "",
    telefon: text("telefon") ?? "",
    objektart: formData.getAll("objektart").map(String),
    lage: formData.getAll("lage").map(String),
    mietflaeche_von: text("mietflaeche_von"),
    mietflaeche_bis: text("mietflaeche_bis"),
    mietpreis_von: text("mietpreis_von"),
    mietpreis_bis: text("mietpreis_bis"),
    kriterien: formData.getAll("kriterien").map(String),
    kommentar: text("kommentar"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Bitte prüfen Sie Ihre Eingaben.", fieldErrors };
  }

  const body = { ...parsed.data, website: "" };
  const forward = process.env.NODE_ENV === "production" || process.env.SUCHAUFTRAG_WEITERLEITEN === "1";
  if (!forward) {
    console.info("[Suchauftrag – nicht weitergeleitet, nur Entwicklung]", body);
    return { status: "success" };
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    if (!res.ok || data?.ok === false) {
      // Die API nennt bei ungültigen Eingaben den Grund (HTTP 400)
      const message = res.status === 400 && data?.message ? data.message : null;
      console.error("Suchauftrag abgelehnt", res.status, data);
      return {
        status: "error",
        message: message ?? "Ihr Suchauftrag konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.",
      };
    }
    return { status: "success" };
  } catch (error) {
    console.error("Suchauftrag konnte nicht gesendet werden", error);
    return {
      status: "error",
      message: "Ihr Suchauftrag konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.",
    };
  }
}
