import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { CompareProvider } from "@/components/compare/compare-provider";
import { SearchRequestProvider } from "@/components/search-request/search-request-dialog";
import { FavoritesProvider } from "@/components/favorites/favorites-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Gewerbeimmobilien in Hamburg mieten | BüroHamburg.de",
    template: "%s | BüroHamburg.de",
  },
  description:
    "Büroflächen, Praxisflächen, Laden- und Gastroflächen in Hamburg finden – mit Kartensuche, Filtern und persönlicher Beratung von BüroHamburg.",
};

export const viewport: Viewport = {
  themeColor: "#8b2038",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <TooltipProvider>
          <FavoritesProvider>
            <CompareProvider>
              <SearchRequestProvider>
                <SiteHeader />
                <div className="flex flex-1 flex-col">{children}</div>
                <SiteFooter />
                <ScrollToTop />
                <Toaster position="bottom-center" />
              </SearchRequestProvider>
            </CompareProvider>
          </FavoritesProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
