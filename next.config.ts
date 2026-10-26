import type { NextConfig } from "next";

const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  // PDF-Erzeugung (Vergleichs-PDF) unverändert aus node_modules laden statt mitzubündeln
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      // Objektbilder von buerohamburg.de (bis zur Übernahme in Supabase Storage)
      { protocol: "https", hostname: "www.buerohamburg.de", pathname: "/objects/images/**" },
      // Bilder aus Supabase Storage (vom FileMaker-Sync hochgeladen)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost }] : []),
    ],
  },
};

export default nextConfig;
