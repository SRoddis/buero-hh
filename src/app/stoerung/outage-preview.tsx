"use client";

import { toast } from "sonner";

import { OutagePage } from "@/components/layout/outage-page";

export function OutagePreview() {
  return <OutagePage onRetry={() => toast("Vorschau – bei einer echten Störung wird die Seite neu geladen.")} />;
}
