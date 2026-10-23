"use client";

import { CircleCheck, LoaderCircle, Mail, Phone } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry, type InquiryState } from "@/lib/actions/inquiry";
import type { Contact } from "@/lib/types";

const initialState: InquiryState = { status: "idle" };

export function ContactForm({ propertyId, title, contact }: { propertyId: string; title: string; contact: Contact }) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b p-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-light text-base font-semibold text-brand">
          {contact.name
            .split(" ")
            .map((p) => p[0])
            .join("")}
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{contact.name}</p>
          <p className="truncate text-sm text-muted-foreground">{contact.role}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 border-b px-5 py-3 text-sm">
        <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-brand">
          <Phone className="size-4 text-brand" /> {contact.phone}
        </a>
        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-brand">
          <Mail className="size-4 text-brand" /> {contact.email}
        </a>
      </div>

      {state.status === "success" ? (
        <div className="flex flex-col items-center p-8 text-center">
          <CircleCheck className="size-12 text-emerald-600" />
          <p className="mt-3 text-lg font-semibold">Vielen Dank für Ihre Anfrage!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {contact.name.split(" ")[0]} meldet sich in der Regel innerhalb eines Werktags bei Ihnen.
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-3.5 p-5" noValidate>
          <h2 className="text-lg font-semibold">Objekt anfragen</h2>
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          <Field label="Name *" name="name" error={errors.name}>
            <Input id="name" name="name" defaultValue={values.name} autoComplete="name" required className="h-10" aria-invalid={!!errors.name} />
          </Field>
          <Field label="Firma" name="company">
            <Input id="company" name="company" defaultValue={values.company} autoComplete="organization" className="h-10" />
          </Field>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Field label="E-Mail *" name="email" error={errors.email}>
              <Input
                id="email"
                name="email"
                defaultValue={values.email}
                type="email"
                autoComplete="email"
                required
                className="h-10"
                aria-invalid={!!errors.email}
              />
            </Field>
            <Field label="Telefon" name="phone" error={errors.phone}>
              <Input id="phone" name="phone" defaultValue={values.phone} type="tel" autoComplete="tel" className="h-10" aria-invalid={!!errors.phone} />
            </Field>
          </div>
          <Field label="Nachricht *" name="message" error={errors.message}>
            <Textarea
              id="message"
              name="message"
              rows={5}
              defaultValue={values.message ?? `Guten Tag,\n\nich interessiere mich für das Objekt „${title}“ und bitte um weitere Informationen bzw. einen Besichtigungstermin.\n\nMit freundlichen Grüßen`}
              aria-invalid={!!errors.message}
            />
          </Field>
          <div>
            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
              <Checkbox name="privacy" defaultChecked={values.privacy === "on"} className="mt-0.5" aria-invalid={!!errors.privacy} />
              <span>
                Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert werden. Hinweise finden Sie in
                der <a href="https://www.buerohamburg.de" className="text-brand underline">Datenschutzerklärung</a>. *
              </span>
            </label>
            {errors.privacy && <p className="mt-1 text-xs text-destructive">{errors.privacy}</p>}
          </div>

          {state.status === "error" && !Object.keys(errors).length && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" size="lg" className="h-11 w-full text-[0.95rem] font-semibold" disabled={pending}>
            {pending && <LoaderCircle className="animate-spin" />}
            {pending ? "Wird gesendet …" : "Anfrage senden"}
          </Button>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
