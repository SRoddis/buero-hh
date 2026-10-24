// Prüft vor Supabase-CLI-Befehlen (db:push, db:types, …), ob ein gültiger Login besteht.
// Ohne Login bricht es mit einem klaren Hinweis ab statt mit „Invalid access token“.
import { spawnSync } from "node:child_process";

const result = spawnSync("npx supabase projects list -o json", { encoding: "utf8", shell: true, timeout: 60_000 });
const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

if (result.status === 0) process.exit(0);

const notLoggedIn = /access token|not logged in|login/i.test(output);
console.error(
  notLoggedIn
    ? "\n✖ Nicht bei Supabase angemeldet (oder Login abgelaufen).\n  Bitte zuerst ausführen:  npx supabase login\n"
    : `\n✖ Supabase-CLI nicht erreichbar:\n${output.trim().slice(0, 500)}\n`,
);
process.exit(1);
