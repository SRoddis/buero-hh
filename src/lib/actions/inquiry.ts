"use server";

import { z } from "zod";

import { getRepository } from "@/lib/data/repository";

const inquirySchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an."),
  company: z.string().trim().max(120).optional(),
  email: z.email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s()/-]*$/, "Bitte geben Sie eine gültige Telefonnummer an.")
    .optional(),
  message: z.string().trim().min(10, "Ihre Nachricht sollte mindestens 10 Zeichen lang sein.").max(4000),
  privacy: z.literal("on", { error: "Bitte stimmen Sie der Datenschutzerklärung zu." }),
});

export type InquiryState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<string, string>>;
      /** Eingaben zurückgeben, da React das Formular nach der Action zurücksetzt */
      values?: Record<string, string>;
    };

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Honeypot gegen einfache Spam-Bots
  if (formData.get("website")) return { status: "success" };

  const raw = Object.fromEntries(
    [...formData.entries()].map(([key, value]) => [key, typeof value === "string" && value !== "" ? value : undefined]),
  );
  const parsed = inquirySchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Bitte prüfen Sie Ihre Eingaben.", fieldErrors, values: valuesOf(formData) };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { privacy, ...inquiry } = parsed.data;
    const repository = await getRepository();
    await repository.createInquiry(inquiry);
    return { status: "success" };
  } catch (error) {
    console.error("Anfrage konnte nicht gespeichert werden", error);
    return {
      status: "error",
      values: valuesOf(formData),
      message: "Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.",
    };
  }
}

function valuesOf(formData: FormData) {
  return Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
}
