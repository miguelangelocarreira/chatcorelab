/**
 * Reset do estado mock para recomeçar testes de zero.
 * node scripts/reset_mock.js
 */
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { resolve } from "path";

const root = process.cwd();

const STATE = {
  version: 1,
  updated_at: new Date().toISOString(),
  cycle: 0,
  phase: "SETUP",
  status: "IDLE",
  capital: { initial: 10000, current: 10000, currency: "USD" },
  risk: { drawdown_pct: 0, max_drawdown_pct: 10, daily_pnl_pct: 0, open_positions: 0, max_open_positions: 6 },
  last_signal: null,
  last_error: null,
};

const POSITIONS = { open: [], closed_today: [] };
const TRADES    = { trades: [], stats: { total: 0, wins: 0, losses: 0, win_rate_pct: 0, total_pnl: 0 } };

writeFileSync(resolve(root, "agent/memory/state.json"),     JSON.stringify(STATE,     null, 2));
writeFileSync(resolve(root, "agent/memory/positions.json"), JSON.stringify(POSITIONS, null, 2));
writeFileSync(resolve(root, "agent/memory/trades.json"),    JSON.stringify(TRADES,    null, 2));

const mockPath = resolve(root, "agent/memory/mock_account.json");
if (existsSync(mockPath)) unlinkSync(mockPath);

console.log("✓  agent/memory/state.json     → ciclo 0, capital $10,000");
console.log("✓  agent/memory/positions.json → sem posições");
console.log("✓  agent/memory/trades.json    → histórico limpo");
console.log("✓  agent/memory/mock_account.json → removido");
console.log("\nPronto. Podes correr: npm run mock:full-day");
