"use client";

import {
  ArrowRight,
  Building2,
  ChevronDown,
  CircleCheck,
  Euro,
  ListChecks,
  LoaderCircle,
  Mail,
  MapPin,
  Maximize,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { createContext, useActionState, useCallback, useContext, useMemo, useState } from "react";

import { LegalLink } from "@/components/layout/legal-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitSearchRequest, type SearchRequestState } from "@/lib/actions/search-request";
import {
  areaLabel,
  REQUEST_AREAS,
  REQUEST_CRITERIA,
  REQUEST_MARKET_AREAS,
  REQUEST_OBJECT_TYPES,
  REQUEST_RENTS,
  rentLabel,
} from "@/lib/search-request";
import { cn } from "@/lib/utils";

const SearchRequestContext = createContext<{ open: () => void } | null>(null);

/** Suchauftrag-Fenster einmal global bereitstellen – öffnen von überall mit useSearchRequest().open() */
export function SearchRequestProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  // Formular bei jedem Öffnen frisch (nach erfolgreichem Absenden wieder leer)
  const [session, setSession] = useState(0);
  const openDialog = useCallback(() => {
    setSession((s) => s + 1);
    setOpen(true);
  }, []);
  const value = useMemo(() => ({ open: openDialog }), [openDialog]);

  return (
    <SearchRequestContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[94dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <SearchRequestForm key={session} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </SearchRequestContext.Provider>
  );
}

export function useSearchRequest() {
  const context = useContext(SearchRequestContext);
  if (!context) throw new Error("useSearchRequest muss innerhalb von <SearchRequestProvider> verwendet werden");
  return context;
}

const fieldBase =
  "h-11 short:h-10 w-full rounded-lg border bg-white text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

function SearchRequestForm({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState<SearchRequestState, FormData>(submitSearchRequest, {
    status: "idle",
  });
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  // Auswahlfelder sind kontrolliert, damit sie nach einer Fehlermeldung erhalten bleiben
  const [objektart, setObjektart] = useState<string[]>([]);
  const [lage, setLage] = useState<string[]>([]);
  const [kriterien, setKriterien] = useState<string[]>([]);
  const [text, setText] = useState({
    name: "",
    email: "",
    telefon: "",
    kommentar: "",
  });
  const bind = (key: keyof typeof text) => ({
    name: key,
    value: text[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setText((t) => ({ ...t, [key]: e.target.value })),
  });

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center sm:px-10">
        <CircleCheck className="size-14 text-emerald-600" strokeWidth={1.75} />
        <DialogTitle className="mt-4 text-2xl font-bold tracking-tight">Vielen Dank!</DialogTitle>
        <DialogDescription className="mt-2 max-w-md text-base">
          Ihr Suchauftrag ist bei uns eingegangen. Wir melden uns mit passenden Gewerbeimmobilien in Hamburg.
        </DialogDescription>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onClose} className={buttonVariants({ variant: "outline", size: "lg" })}>
            Schließen
          </button>
          <Link href="/immobilien" onClick={onClose} className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
            Zur Immobiliensuche
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Kopf und Absenden-Leiste bleiben stehen, nur die Felder dazwischen scrollen (wichtig bei niedrigen Fenstern)
  return (
    <form action={action} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="px-5 pt-6 pb-4 sm:px-8 sm:pt-7 short:pt-5 short:pb-3">
        <DialogTitle className="pr-8 text-2xl font-bold tracking-tight sm:text-[1.7rem] short:sm:text-2xl">
          Suchauftrag erstellen
        </DialogTitle>
        <DialogDescription className="mt-1.5 text-[15px] short:mt-1">
          Beschreiben Sie kurz, wonach Sie suchen. Wir melden uns mit passenden Gewerbeimmobilien in Hamburg.
        </DialogDescription>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-5 sm:px-8 short:pb-4">
        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 short:gap-y-3">
          <Field label="Ihr Name" required error={errors.name}>
            <IconInput
              icon={User}
              {...bind("name")}
              autoComplete="name"
              placeholder="z. B. Max Mustermann"
              invalid={!!errors.name}
            />
          </Field>
          <Field label="Ihre E-Mail" required error={errors.email}>
            <IconInput
              icon={Mail}
              {...bind("email")}
              type="email"
              autoComplete="email"
              placeholder="z. B. name@unternehmen.de"
              invalid={!!errors.email}
            />
          </Field>
          <Field label="Ihre Telefonnummer" required error={errors.telefon}>
            <IconInput
              icon={Phone}
              {...bind("telefon")}
              type="tel"
              autoComplete="tel"
              placeholder="z. B. 040 123456"
              invalid={!!errors.telefon}
            />
          </Field>
          <Field label="Objektart" required error={errors.objektart}>
            <MultiSelect
              icon={Building2}
              name="objektart"
              options={REQUEST_OBJECT_TYPES.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              value={objektart}
              onChange={setObjektart}
              invalid={!!errors.objektart}
            />
          </Field>
          <Field label="Lage" required error={errors.lage} className="sm:col-span-2">
            <MultiSelect
              icon={MapPin}
              name="lage"
              options={REQUEST_MARKET_AREAS.map((v) => ({
                value: v,
                label: v,
              }))}
              value={lage}
              onChange={setLage}
              invalid={!!errors.lage}
            />
          </Field>

          <Field label="Mietfläche von" error={errors.mietflaeche_von}>
            <SingleSelect
              icon={Maximize}
              name="mietflaeche_von"
              options={REQUEST_AREAS.filter((v) => v !== "5000+")}
              format={(v) => `von ${areaLabel(v)}`}
            />
          </Field>
          <Field label="Mietfläche bis" error={errors.mietflaeche_bis}>
            <SingleSelect
              icon={Maximize}
              name="mietflaeche_bis"
              options={REQUEST_AREAS.filter((v) => v !== "0")}
              format={(v) => (v === "5000+" ? areaLabel(v) : `bis ${areaLabel(v)}`)}
              invalid={!!errors.mietflaeche_bis}
            />
          </Field>
          <Field label="Mietpreis von" error={errors.mietpreis_von}>
            <SingleSelect
              icon={Euro}
              name="mietpreis_von"
              options={REQUEST_RENTS}
              format={(v) => `von ${rentLabel(v)} / m²`}
            />
          </Field>
          <Field label="Mietpreis bis" error={errors.mietpreis_bis}>
            <SingleSelect
              icon={Euro}
              name="mietpreis_bis"
              options={REQUEST_RENTS.filter((v) => v !== "0")}
              format={(v) => `bis ${rentLabel(v)} / m²`}
              invalid={!!errors.mietpreis_bis}
            />
          </Field>

          <Field label="Weitere Kriterien" className="sm:col-span-2">
            <MultiSelect
              icon={ListChecks}
              name="kriterien"
              options={REQUEST_CRITERIA.map((v) => ({ value: v, label: v }))}
              value={kriterien}
              onChange={setKriterien}
            />
          </Field>
          <Field label="Kommentar" error={errors.kommentar} className="sm:col-span-2">
            <div className="relative">
              <MessageCircle className="pointer-events-none absolute top-3 left-3 size-[18px] text-muted-foreground" />
              <textarea
                {...bind("kommentar")}
                rows={3}
                maxLength={2000}
                placeholder="z. B. besondere Anforderungen, gewünschter Einzugstermin, Ausstattung etc."
                aria-invalid={!!errors.kommentar}
                className={cn(fieldBase, "h-auto min-h-20 resize-y py-2.5 pl-10 pr-3 short:h-auto short:min-h-16")}
              />
            </div>
          </Field>
        </div>

        {/* Spam-Falle: für Menschen unsichtbar, Bots füllen das Feld aus */}
        <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden>
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <div className="border-t bg-white px-5 pt-3.5 pb-5 sm:px-8 short:pb-4">
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-px size-4 shrink-0" />
          <span>
            Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten zur Bearbeitung Ihrer Anfrage zu (
            <LegalLink doc="datenschutz" className="cursor-pointer underline hover:text-brand">
              Datenschutzerklärung
            </LegalLink>
            ).
          </span>
        </p>

        {state.status === "error" && (
          <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {state.message}
          </p>
        )}

        <div className="mt-3.5 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={pending}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 rounded-lg px-6 text-base sm:min-w-80 short:h-11",
            )}
          >
            {pending ? <LoaderCircle className="size-[18px] animate-spin" /> : <Send className="size-[18px]" />}
            Unverbindliche Anfrage senden
          </button>
          <Link
            href="/immobilien"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            Zur Immobiliensuche
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <span className="mb-1.5 block text-sm font-semibold short:mb-1">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </div>
  );
}

function IconInput({
  icon: Icon,
  invalid,
  ...props
}: React.ComponentProps<"input"> & { icon: LucideIcon; invalid?: boolean }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-muted-foreground" />
      <input {...props} aria-label={props.placeholder} aria-invalid={invalid} className={cn(fieldBase, "pr-3 pl-10")} />
    </div>
  );
}

/** Einfachauswahl mit festen API-Werten; „egal“ = Feld bleibt leer */
function SingleSelect({
  icon: Icon,
  name,
  options,
  format,
  invalid,
}: {
  icon: LucideIcon;
  name: string;
  options: readonly string[];
  format: (value: string) => string;
  invalid?: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <Select value={value || "egal"} onValueChange={(v) => setValue(v === "egal" ? "" : v)}>
      <SelectTrigger aria-invalid={invalid} className={cn(fieldBase, "h-11! justify-start gap-2.5 px-3 short:h-10!")}>
        <Icon className="size-[18px] text-muted-foreground" />
        {/* Text füllt die Breite – der Pfeil steht rechts wie bei den übrigen Feldern */}
        <span className={cn("flex-1 truncate text-left", !value && "text-muted-foreground")}>
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        <SelectItem value="egal">Keine Angabe</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {format(o)}
          </SelectItem>
        ))}
      </SelectContent>
      {/* Wert für das Formular (leer = keine Angabe) */}
      <input type="hidden" name={name} value={value} />
    </Select>
  );
}

/** Mehrfachauswahl (Liste mit Häkchen) – die API nimmt bei Objektart, Lage und Kriterien Listen an */
function MultiSelect({
  icon: Icon,
  name,
  options,
  value,
  onChange,
  invalid,
}: {
  icon: LucideIcon;
  name: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const summary = value.length
    ? options
        .filter((o) => value.includes(o.value))
        .map((o) => o.label)
        .join(", ")
    : "Bitte auswählen";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(fieldBase, "flex items-center gap-2.5 px-3 text-left", invalid && "border-destructive")}
        >
          <Icon className="size-[18px] shrink-0 text-muted-foreground" />
          <span className={cn("min-w-0 flex-1 truncate", !value.length && "text-muted-foreground")}>{summary}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-1.5">
        <ul role="listbox" aria-multiselectable className="max-h-72 overflow-y-auto">
          {options.map((o) => {
            const checked = value.includes(o.value);
            return (
              <li key={o.value}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-muted">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(c) => onChange(c ? [...value, o.value] : value.filter((v) => v !== o.value))}
                  />
                  {o.label}
                </label>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
      {value.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
    </Popover>
  );
}
