function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Umgebungsvariable ${name} fehlt (siehe .env.example)`);
  return value;
}

export const config = {
  filemaker: {
    host: required("FILEMAKER_HOST").replace(/\/$/, ""),
    database: required("FILEMAKER_DATABASE"),
    user: required("FILEMAKER_USER"),
    password: required("FILEMAKER_PASSWORD"),
    /** Layout-Namen in der FileMaker-Lösung – an die tatsächliche Datei anpassen */
    layouts: {
      contacts: "API_Ansprechpartner",
      buildings: "API_Gebaeude",
      properties: "API_Objekte",
      units: "API_Flaechen",
      images: "API_Bilder",
      inquiries: "API_Anfragen",
    },
    pageSize: 200,
  },
  supabase: {
    url: required("SUPABASE_URL"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    imageBucket: "property-images",
  },
  intervalMinutes: Number(process.env.SYNC_INTERVAL_MINUTES) || null,
};

export type Config = typeof config;
