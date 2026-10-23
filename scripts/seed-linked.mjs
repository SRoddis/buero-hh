// Spielt die Seed-Pakete aus supabase/seed/ nacheinander ins verknüpfte Supabase-Projekt ein.
// Nutzt `supabase db query --linked` (Management-API, eigener Login – kein DB-Passwort nötig).
// Alle Statements sind idempotent, ein abgebrochener Lauf kann einfach wiederholt werden.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "supabase", "seed");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

console.log(`${files.length} Seed-Pakete werden eingespielt …`);
for (const [i, file] of files.entries()) {
  process.stdout.write(`  [${i + 1}/${files.length}] ${file} … `);
  // Ein einziger Befehlsstring: Windows braucht die Shell für npx, Pfade enthalten keine Leerzeichen
  const result = spawnSync(`npx supabase db query --linked -f supabase/seed/${file}`, { encoding: "utf8", shell: true });
  if (result.status !== 0) {
    console.log("FEHLER");
    console.error(result.stderr || result.stdout);
    process.exit(1);
  }
  console.log("ok");
}
console.log("Fertig.");
