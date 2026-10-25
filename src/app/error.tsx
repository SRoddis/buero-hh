"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { OutagePage } from "@/components/layout/outage-page";

/**
 * Fehlergrenze für alle Seiten: Ist die Datenbank nicht erreichbar oder nicht konfiguriert, erscheint
 * die Störungsseite (Kopf- und Fußzeile bleiben erhalten). Es gibt keinen Rückfall auf Testdaten.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [retrying, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Serverdaten neu laden und die Seite erneut rendern
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return <OutagePage onRetry={retry} retrying={retrying} />;
}
