import { config } from "./config";
import { runSync } from "./sync";

/**
 * Einstieg: `npm run sync` (Delta seit letztem erfolgreichen Lauf) oder `npm run sync:full`.
 * Mit SYNC_INTERVAL_MINUTES läuft der Service als Daemon; alternativ per Cron/Scheduler aufrufen.
 */
async function once(full: boolean) {
  const started = Date.now();
  try {
    const stats = await runSync(config, { full });
    console.log(`Sync abgeschlossen in ${((Date.now() - started) / 1000).toFixed(1)} s`, stats);
  } catch (err) {
    console.error("Sync fehlgeschlagen:", err);
    process.exitCode = 1;
  }
}

const full = process.argv.includes("--full");
await once(full);

if (config.intervalMinutes) {
  console.log(`Nächster Lauf in ${config.intervalMinutes} Minuten`);
  setInterval(() => void once(false), config.intervalMinutes * 60_000);
}
