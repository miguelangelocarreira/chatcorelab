/**
 * Módulo de memória persistente — Passo 2
 * Lê/escreve state.json, positions.json, trades.json e AGENT_STATE.md
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import settings from "../config/settings.json" with { type: "json" };

const root = resolve(process.cwd());

function load(relPath) {
  return JSON.parse(readFileSync(resolve(root, relPath), "utf-8"));
}

function save(relPath, data) {
  writeFileSync(resolve(root, relPath), JSON.stringify(data, null, 2), "utf-8");
}

function loadText(relPath) {
  return readFileSync(resolve(root, relPath), "utf-8");
}

function saveText(relPath, text) {
  writeFileSync(resolve(root, relPath), text, "utf-8");
}

// --- JSON state ---

export function readState() {
  return load(settings.paths.state_json);
}

export function writeState(state) {
  state.updated_at = new Date().toISOString();
  save(settings.paths.state_json, state);
}

export function readPositions() {
  return load(settings.paths.positions_json);
}

export function writePositions(positions) {
  save(settings.paths.positions_json, positions);
}

export function readTradeStats() {
  try {
    return load(settings.paths.trade_stats_json);
  } catch {
    return { by_sector: {}, by_exit_reason: {} };
  }
}

function updateTradeStats(trade) {
  const db = readTradeStats();

  if (trade.sector && trade.pnl !== undefined) {
    const s = db.by_sector[trade.sector] || { trades: 0, wins: 0, losses: 0, win_rate_pct: 0, total_pnl: 0 };
    s.trades++;
    if (trade.pnl > 0) s.wins++; else s.losses++;
    s.win_rate_pct = s.trades ? Math.round((s.wins / s.trades) * 100) : 0;
    s.total_pnl = parseFloat((s.total_pnl + (trade.pnl || 0)).toFixed(2));
    db.by_sector[trade.sector] = s;
  }

  const reason = trade.reason || "other";
  const reasonKey = ["stop_loss", "take_profit_partial", "trailing_stop"].includes(reason) ? reason : "other";
  const r = db.by_exit_reason[reasonKey] || { trades: 0, total_pnl: 0 };
  r.trades++;
  r.total_pnl = parseFloat((r.total_pnl + (trade.pnl || 0)).toFixed(2));
  db.by_exit_reason[reasonKey] = r;

  save(settings.paths.trade_stats_json, db);
}

export function appendTrade(trade) {
  const db = load(settings.paths.trades_json);
  db.trades.push({ ...trade, timestamp: new Date().toISOString() });
  const wins = db.trades.filter(t => t.pnl > 0).length;
  db.stats = {
    total: db.trades.length,
    wins,
    losses: db.trades.length - wins,
    win_rate_pct: db.trades.length ? Math.round((wins / db.trades.length) * 100) : 0,
    total_pnl: parseFloat(db.trades.reduce((s, t) => s + (t.pnl || 0), 0).toFixed(2)),
  };
  save(settings.paths.trades_json, db);

  if (trade.side === "sell" && trade.pnl !== undefined) {
    updateTradeStats(trade);
  }
}

// --- Markdown memory files ---

export function readMemoryFiles() {
  return {
    instructions: loadText(settings.paths.agent_instructions),
    strategy:     loadText(settings.paths.trading_strategy),
    tradeLog:     loadText(settings.paths.trade_log),
    researchLog:  loadText(settings.paths.research_log),
    lessons:      loadText(settings.paths.lessons_md),
  };
}

export function appendToLessons(entry) {
  const current = loadText(settings.paths.lessons_md);
  saveText(settings.paths.lessons_md, current + "\n" + entry);
}

export function updateTradingStrategy(text) {
  saveText(settings.paths.trading_strategy, text);
}

export function appendToTradeLog(entry) {
  const current = loadText(settings.paths.trade_log);
  saveText(settings.paths.trade_log, current + "\n" + entry);
}

export function appendToResearchLog(entry) {
  const current = loadText(settings.paths.research_log);
  saveText(settings.paths.research_log, current + "\n" + entry);
}

// Atualiza a secção de estado no AGENT_STATE.md de forma atómica
export function updateAgentStateMd({ cycle, phase, status, capital, openPositions, note, nextRoutine }) {
  const now = new Date().toISOString().slice(0, 10);
  const content = `# AGENT STATE — Ficheiro de Memória Viva

> O agente lê este ficheiro no INÍCIO de cada ciclo e atualiza-o no FIM.
> É aqui que se evita a "podridão do contexto" (context rot).
> Humanos podem ler mas não devem editar manualmente.

---

## Estado Atual

- **Fase**: \`${phase}\`
- **Última atualização**: ${now}
- **Ciclo #**: ${cycle}
- **Status**: ${status}
- **Próxima rotina**: ${nextRoutine ?? "—"}

## Capital & Risco (${settings.agent.mode.toUpperCase()})

\`\`\`json
${JSON.stringify({
  capital_atual: capital?.current ?? 10000,
  capital_inicial: capital?.initial ?? 10000,
  moeda: "USD",
  drawdown_pct: capital?.drawdown_pct ?? 0,
  posicoes_abertas: openPositions ?? 0,
  max_posicoes: settings.risk.max_open_positions,
  status,
  modo: settings.agent.mode,
}, null, 2)}
\`\`\`

## Nota do Último Ciclo

${note ?? "_Sem notas._"}

---

_Próximo passo: ${nextRoutine ?? "Aguardar gatilho cron"}_
`;
  saveText(settings.paths.agent_state, content);
}
