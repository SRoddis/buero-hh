"use client";

import { BarChart3, Cookie, ExternalLink, Lock, Settings, ShieldCheck, type LucideIcon } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { LegalLink } from "@/components/layout/legal-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  OPTIONAL_CATEGORIES,
  readConsent,
  writeConsent,
  type ConsentCategory,
  type ConsentRecord,
  type OptionalCategory,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

import { loadSalesViewer } from "./salesviewer";

type ConsentContextValue = {
  /** true, sobald die Kategorie erlaubt ist („necessary“ immer) */
  has: (category: ConsentCategory) => boolean;
  openPreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

/**
 * Cookie-Zustimmung wie auf der bisherigen Website: Banner bis zur Entscheidung, Einstellungen jederzeit über
 * „Cookie-Einstellungen“ in der Fußzeile. Externe Dienste (SalesViewer) laden erst nach Zustimmung.
 */
export function ConsentProvider({ children }: { children: React.ReactNode }) {
  // undefined = Cookie noch nicht gelesen (Server-Render) – dann weder Banner noch Dienste
  const [record, setRecord] = useState<ConsentRecord | null | undefined>(undefined);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => setRecord(readConsent(document.cookie)), []);

  const has = useCallback(
    (category: ConsentCategory) => category === "necessary" || !!record?.categories.includes(category),
    [record],
  );

  useEffect(() => {
    if (has("marketing")) loadSalesViewer();
  }, [has]);

  const save = useCallback(
    (categories: OptionalCategory[]) => {
      // Entzogene Zustimmung: geladene Skripte lassen sich nicht entladen – Seite neu laden
      const revoked = OPTIONAL_CATEGORIES.some((c) => record?.categories.includes(c) && !categories.includes(c));
      setRecord(writeConsent(categories, record ?? null));
      setPreferencesOpen(false);
      if (revoked) window.location.reload();
    },
    [record],
  );

  const value = useMemo(() => ({ has, openPreferences: () => setPreferencesOpen(true) }), [has]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {record === null && !preferencesOpen && (
        <ConsentBanner
          onAcceptAll={() => save([...OPTIONAL_CATEGORIES])}
          onRejectAll={() => save([])}
          onSettings={() => setPreferencesOpen(true)}
        />
      )}
      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          {/* bei jedem Öffnen mit dem gespeicherten Stand beginnen */}
          {preferencesOpen && <ConsentPreferences initial={record ?? null} onSave={save} />}
        </DialogContent>
      </Dialog>
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent muss innerhalb von <ConsentProvider> verwendet werden");
  return context;
}

/** „Cookie-Einstellungen“ – z. B. in der Fußzeile */
export function CookieSettingsLink({ className }: { className?: string }) {
  const { openPreferences } = useConsent();
  return (
    <button type="button" onClick={openPreferences} className={className}>
      Cookie-Einstellungen
    </button>
  );
}

function PrivacyLink() {
  return (
    <LegalLink
      doc="datenschutz"
      className="inline-flex cursor-pointer items-center gap-1 font-medium text-brand underline underline-offset-2 hover:text-brand-dark"
    >
      Datenschutzerklärung
      <ExternalLink className="size-3.5" />
    </LegalLink>
  );
}

function ConsentBanner({
  onAcceptAll,
  onRejectAll,
  onSettings,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSettings: () => void;
}) {
  return (
    <section
      aria-label="Cookie-Hinweis"
      className="fixed inset-x-0 bottom-0 z-[60] border-t bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] print:hidden"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:gap-8 lg:px-8 lg:py-5">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand sm:flex">
            <Cookie className="size-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Wir verwenden Cookies</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
              Wir nutzen Cookies und vergleichbare Technologien, um die Funktionen unserer Website bereitzustellen, zu
              verbessern und Ihnen relevante Inhalte anzuzeigen. Weitere Informationen finden Sie in unserer{" "}
              <PrivacyLink />.
            </p>
          </div>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:gap-3">
          <button type="button" onClick={onAcceptAll} className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
            Alle akzeptieren
          </button>
          <button
            type="button"
            onClick={onRejectAll}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6")}
          >
            Alle ablehnen
          </button>
          <button
            type="button"
            onClick={onSettings}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "col-span-2 h-11 px-6 sm:col-span-1")}
          >
            Einstellungen verwalten
          </button>
        </div>
      </div>
    </section>
  );
}

const CATEGORIES: { key: ConsentCategory; icon: LucideIcon; title: string; description: string }[] = [
  {
    key: "necessary",
    icon: ShieldCheck,
    title: "Notwendige Cookies",
    description:
      "Diese Cookies sind für den sicheren und technischen Betrieb der Website erforderlich. Sie können nicht deaktiviert werden.",
  },
  {
    key: "functionality",
    icon: Settings,
    title: "Funktionale Cookies",
    description: "Ermöglichen erweiterte Funktionen und eine personalisierte Nutzung, z. B. die Speicherung Ihrer Einstellungen.",
  },
  {
    key: "marketing",
    icon: BarChart3,
    title: "Externe Dienste & Marketing",
    description:
      "Wir nutzen Dienste von Drittanbietern (SalesViewer®), um unsere Website zu analysieren und Ihnen relevante Angebote anzuzeigen.",
  },
];

function ConsentPreferences({
  initial,
  onSave,
}: {
  initial: ConsentRecord | null;
  onSave: (categories: OptionalCategory[]) => void;
}) {
  const [selected, setSelected] = useState<OptionalCategory[]>(() =>
    OPTIONAL_CATEGORIES.filter((c) => initial?.categories.includes(c)),
  );
  const toggle = (category: OptionalCategory, on: boolean) =>
    setSelected((s) => (on ? [...s, category] : s.filter((c) => c !== category)));

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-5 sm:px-7">
        <DialogTitle className="pr-10 text-2xl font-bold tracking-tight">Cookie-Einstellungen</DialogTitle>
        <DialogDescription asChild>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-foreground/80">
            <p>
              Wir verwenden Cookies und vergleichbare Technologien, um Ihnen die bestmögliche Nutzung unserer Website zu
              ermöglichen. Einige Cookies sind für den Betrieb der Seite notwendig, andere helfen uns, die Website zu
              verbessern oder Ihnen passende Inhalte anzuzeigen.
            </p>
            <p>
              Sie können selbst entscheiden, welche Kategorien Sie zulassen möchten. Weitere Informationen finden Sie in
              unserer <PrivacyLink />.
            </p>
          </div>
        </DialogDescription>

        <ul className="mt-5 space-y-3">
          {CATEGORIES.map(({ key, icon: Icon, title, description }) => {
            const required = key === "necessary";
            const checked = required || selected.includes(key as OptionalCategory);
            const id = `consent-${key}`;
            return (
              <li
                key={key}
                className={cn("flex items-start gap-4 rounded-xl border p-4", required && "border-transparent bg-secondary/70")}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-foreground shadow-xs ring-1 ring-border">
                  <Icon className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={id} className="font-semibold">
                    {title}
                  </label>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  {required && (
                    <span className="hidden rounded-full border bg-white px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:inline">
                      Immer aktiv
                    </span>
                  )}
                  <Switch
                    id={id}
                    checked={checked}
                    disabled={required}
                    onCheckedChange={(on) => toggle(key as OptionalCategory, on)}
                    className={cn(required && "data-[state=checked]:bg-muted-foreground/40")}
                  >
                    {required && <Lock className="size-3 text-muted-foreground" />}
                  </Switch>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-2 border-t bg-white px-5 py-4 sm:flex sm:px-7">
        <button
          type="button"
          onClick={() => onSave([...OPTIONAL_CATEGORIES])}
          className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}
        >
          Alle akzeptieren
        </button>
        <button
          type="button"
          onClick={() => onSave([])}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6")}
        >
          Alle ablehnen
        </button>
        <button
          type="button"
          onClick={() => onSave(selected)}
          className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 sm:ml-auto")}
        >
          Auswahl speichern
        </button>
      </div>
    </>
  );
}
