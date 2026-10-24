/** Schlanker Health Check für Render – ohne Datenbankabfrage (vorher lief bei jedem Check die komplette Suche). */
export function GET() {
  return Response.json({ ok: true });
}
