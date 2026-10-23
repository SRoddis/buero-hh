"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-emerald-600" />
        ),
        info: (
          <InfoIcon className="size-5 text-brand" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-600" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-destructive" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin text-brand" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        // Gut lesbar: dunkle Beschreibung statt des sehr hellen Standard-Graus
        classNames: {
          toast: "cn-toast gap-3! border-border! px-4! py-3.5! shadow-lg!",
          title: "text-[15px] font-semibold text-foreground!",
          description: "mt-0.5 text-sm leading-snug text-foreground/75!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
